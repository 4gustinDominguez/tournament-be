import { MatchRepository } from "../../matches/domain/match.repository";
import { TeamRepository } from "../../teams/domain/team.repository";
import { TournamentRepository } from "../../tournaments/domain/tournament.repository";
import { TeamStats } from "../domain/standings";

export class StandingsUseCases {
	constructor(
		private readonly matchRepository: MatchRepository,
		private readonly teamRepository: TeamRepository,
		private readonly tournamentRepository: TournamentRepository,
	) {}

	async getStandings(tournamentId: string): Promise<TeamStats[]> {
		const tournament = await this.tournamentRepository.findById(tournamentId);
		if (!tournament) {
			throw new Error("Tournament not found");
		}

		const allTeams = await this.teamRepository.getAll();
		const tournamentTeams = allTeams.filter((team) => tournament.teamIds.includes(team.id));

		const matches = await this.matchRepository.getMatchesByTournament(tournamentId);
		const completedMatches = matches.filter((m) => m.status === "completed" && m.result !== null);

		const statsMap: Record<string, TeamStats> = {};

		// Initialize stats for all teams in the tournament
		tournamentTeams.forEach((team) => {
			statsMap[team.id] = {
				teamId: team.id,
				teamName: team.name,
				played: 0,
				won: 0,
				drawn: 0,
				lost: 0,
				goalsFor: 0,
				goalsAgainst: 0,
				goalDifference: 0,
				points: 0,
			};
		});

		// Process matches
		completedMatches.forEach((match) => {
			const { teamAId, teamBId, result } = match;
			if (!result) {
				return;
			}

			const statsA = statsMap[teamAId];
			const statsB = statsMap[teamBId];

			statsA.played++;
			statsB.played++;

			statsA.goalsFor += result.scoreA;
			statsA.goalsAgainst += result.scoreB;
			statsB.goalsFor += result.scoreB;
			statsB.goalsAgainst += result.scoreA;

			if (result.scoreA > result.scoreB) {
				statsA.won++;
				statsA.points += 3;
				statsB.lost++;
			} else if (result.scoreA < result.scoreB) {
				statsB.won++;
				statsB.points += 3;
				statsA.lost++;
			} else {
				statsA.drawn++;
				statsA.points += 1;
				statsB.drawn++;
				statsB.points += 1;
			}
		});

		// Calculate goal difference and convert to array
		const standings = Object.values(statsMap).map((stats) => {
			return {
				...stats,
				goalDifference: stats.goalsFor - stats.goalsAgainst,
			};
		});

		// Sort: Points DESC, GoalDifference DESC, GoalsFor DESC
		return standings.sort((a, b) => {
			if (b.points !== a.points) {
				return b.points - a.points;
			}
			if (b.goalDifference !== a.goalDifference) {
				return b.goalDifference - a.goalDifference;
			}

			return b.goalsFor - a.goalsFor;
		});
	}
}
