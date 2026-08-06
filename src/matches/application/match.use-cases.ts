import { Match, MatchResult } from "../domain/match";
import { MatchRepository } from "../domain/match.repository";
import { v4 as uuid } from "uuid";

import { RoundRepository } from "../../rounds/domain/round.repository";
import { TournamentUseCases } from "../../tournaments/application/tournament.use-cases";
import { RefereeRepository } from "../../referees/domain/referee.repository";
import { PlayerUseCases } from "../../players/application/player.use-cases";
import { TeamUseCases } from "../../teams/application/team.use-cases";

export class MatchUseCases {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly roundRepository: RoundRepository,
    private readonly tournamentUseCases?: TournamentUseCases,
    private readonly refereeRepository?: RefereeRepository,
    private readonly playerUseCases?: PlayerUseCases,
    private readonly teamUseCases?: TeamUseCases
  ) { }

  private async verifyMatchAccess(match: Match, requesterId: string, requesterRole: string, restrictToAssignedReferee: boolean = true): Promise<void> {
    if (this.tournamentUseCases && requesterRole !== 'REFEREE') {
      await this.tournamentUseCases.verifyTournamentOwnership(match.tournamentId, requesterId, requesterRole);
    }

    if (requesterRole === 'REFEREE') {
      if (!this.refereeRepository) {
        throw new Error("Internal error: Referee repository not provided");
      }
      const referee = await this.refereeRepository.findByUserId(requesterId);
      if (!referee || (restrictToAssignedReferee && match.refereeId !== referee.id)) {
        throw new Error("Unauthorized: You are not the assigned referee for this match");
      }
    }
  }

  async createMatch(
    roundId: string,
    teamAId: string,
    teamBId: string,
    date: Date,
    requesterId: string,
    requesterRole: string,
    placeId?: string,
    refereeId?: string,
    status?: 'scheduled' | 'live' | 'completed'
  ): Promise<Match> {

    const round = await this.roundRepository.getRoundById(roundId);
    if (!round) {
      throw new Error("Round not found");
    }

    if (this.tournamentUseCases) {
      await this.tournamentUseCases.verifyTournamentOwnership(round.tournamentId, requesterId, requesterRole);
    }

    const newMatch: Match = {
      id: uuid(),
      tournamentId: round.tournamentId,
      roundId,
      teamAId,
      teamBId,
      date,
      placeId,
      refereeId,
      status: status || 'scheduled',
      result: null,
      incidents: [],
    };

    return this.matchRepository.createMatch(newMatch);
  }

  async getMatchesByTournament(tournamentId: string): Promise<Match[]> {
    return this.matchRepository.getMatchesByTournament(tournamentId);
  }

  async getMatchesByReferee(refereeId: string): Promise<Match[]> {
    return this.matchRepository.getMatchesByReferee(refereeId);
  }

  async getMatchById(id: string): Promise<Match | null> {
    return this.matchRepository.getMatchById(id);
  }

  async addResultToMatch(id: string, result: MatchResult, requesterId: string, requesterRole: string): Promise<Match | null> {
    const match = await this.getMatchById(id);
    if (!match) {
      throw new Error("Match not found");
    }

    await this.verifyMatchAccess(match, requesterId, requesterRole);

    if (result.scoreA < 0 || result.scoreB < 0) {
      throw new Error("Scores cannot be negative");
    }

    return this.matchRepository.addResultToMatch(id, result);
  }

  async updateMatch(
    id: string,
    requesterId: string,
    requesterRole: string,
    teamAId?: string,
    teamBId?: string,
    date?: Date,
    placeId?: string,
    refereeId?: string,
    status?: 'scheduled' | 'live' | 'completed',
    result?: MatchResult | null,
    incidents?: Match['incidents'],
    notes?: string
  ): Promise<Match> {
    const match = await this.matchRepository.getMatchById(id);
    if (!match) {
      throw new Error("Match not found");
    }

    await this.verifyMatchAccess(match, requesterId, requesterRole);

    if (requesterRole === "REFEREE") {
      const isChangingRestrictedFields =
        (teamAId !== undefined && teamAId !== match.teamAId) ||
        (teamBId !== undefined && teamBId !== match.teamBId) ||
        (date !== undefined && new Date(date).getTime() !== new Date(match.date).getTime()) ||
        (placeId !== undefined && placeId !== match.placeId) ||
        (refereeId !== undefined && refereeId !== match.refereeId);

      if (isChangingRestrictedFields) {
        throw new Error("Unauthorized: Referees can only update match status, result, and incidents");
      }
    }

    const isCompletingMatch = status === 'completed' && match.status !== 'completed';

    if (teamAId) match.teamAId = teamAId;
    if (teamBId) match.teamBId = teamBId;
    if (date) match.date = date;
    if (placeId !== undefined) match.placeId = placeId;
    if (refereeId !== undefined) match.refereeId = refereeId;
    if (status) match.status = status;
    if (result !== undefined) match.result = result;
    if (incidents !== undefined) match.incidents = incidents;
    if (notes !== undefined) match.notes = notes;

    await this.matchRepository.updateMatch(match);

    if (isCompletingMatch && this.playerUseCases && this.teamUseCases) {
      try {
        await this.calculateAndApplyPlayerStatistics(match);
      } catch (error) {
        console.error("Failed to calculate player statistics:", error);
      }
    }

    return match;
  }

  private async calculateAndApplyPlayerStatistics(match: Match): Promise<void> {
    if (!this.playerUseCases || !this.teamUseCases) return;

    const teamA = await this.teamUseCases.getTeamById(match.teamAId);
    const teamB = await this.teamUseCases.getTeamById(match.teamBId);

    const allPlayerIds = [
      ...(teamA?.playerIds || []),
      ...(teamB?.playerIds || [])
    ];

    // 1. Add matchesPlayed to all players in both teams
    for (const playerId of allPlayerIds) {
      await this.playerUseCases.updateStatistics(playerId, { matchesPlayed: 1 });
    }

    // 2. Process incidents
    const playerStatsMap = new Map<string, Partial<Match['incidents'][0] & { goals: number, yellowCards: number, redCards: number }>>();

    for (const incident of match.incidents) {
      if (!playerStatsMap.has(incident.playerId)) {
        playerStatsMap.set(incident.playerId, { goals: 0, yellowCards: 0, redCards: 0 });
      }

      const stats = playerStatsMap.get(incident.playerId)!;
      if (incident.type === 'GOAL') stats.goals = (stats.goals || 0) + 1;
      if (incident.type === 'YELLOW_CARD') stats.yellowCards = (stats.yellowCards || 0) + 1;
      if (incident.type === 'RED_CARD') stats.redCards = (stats.redCards || 0) + 1;
    }

    // Apply incident statistics
    for (const [playerId, stats] of playerStatsMap.entries()) {
      await this.playerUseCases.updateStatistics(playerId, {
        goals: stats.goals,
        yellowCards: stats.yellowCards,
        redCards: stats.redCards
      });
    }
  }

  async addIncident(
    matchId: string,
    incident: Omit<Match['incidents'][0], 'id'>,
    requesterId: string,
    requesterRole: string
  ): Promise<Match> {
    const match = await this.matchRepository.getMatchById(matchId);
    if (!match) throw new Error("Match not found");

    await this.verifyMatchAccess(match, requesterId, requesterRole);

    const newIncident = { ...incident, id: uuid() };
    match.incidents.push(newIncident);

    await this.matchRepository.updateMatch(match);
    return match;
  }

  async deleteIncident(
    matchId: string,
    incidentId: string,
    requesterId: string,
    requesterRole: string
  ): Promise<Match> {
    const match = await this.matchRepository.getMatchById(matchId);
    if (!match) throw new Error("Match not found");

    await this.verifyMatchAccess(match, requesterId, requesterRole);

    match.incidents = match.incidents.filter(i => i.id !== incidentId);

    await this.matchRepository.updateMatch(match);
    return match;
  }

  async deleteMatch(id: string, requesterId: string, requesterRole: string): Promise<void> {
    const match = await this.matchRepository.getMatchById(id);
    if (!match) {
      throw new Error("Match not found");
    }

    if (this.tournamentUseCases) {
      await this.tournamentUseCases.verifyTournamentOwnership(match.tournamentId, requesterId, requesterRole);
    }

    if (match.status === "completed" || match.status === "live") {
      throw new Error("Cannot delete a match that is live or has already been played");
    }

    await this.matchRepository.deleteMatch(id);
  }
}
