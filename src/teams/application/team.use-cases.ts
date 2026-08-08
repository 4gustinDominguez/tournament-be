import { v4 as uuidv4 } from "uuid";

import { MatchRepository } from "../../matches/domain/match.repository";
import { PlayerRepository } from "../../players/domain/player.repository";
import { TournamentUseCases } from "../../tournaments/application/tournament.use-cases";
import { Team } from "../domain/team";
import { TeamRepository } from "../domain/team.repository";

export class TeamUseCases {
	constructor(
		private readonly teamRepository: TeamRepository,
		private readonly playerRepository: PlayerRepository,
		private readonly tournamentUseCases?: TournamentUseCases,
		private readonly matchRepository?: MatchRepository,
	) {}

	async getAllTeams(tournamentId?: string): Promise<Team[]> {
		let teams = await this.teamRepository.getAll();

		if (tournamentId) {
			teams = teams.filter((t) => t.tournaments.includes(tournamentId));
		}

		// Populate players for each team
		const populatedTeams = await Promise.all(
			teams.map(async (team) => {
				const players = await Promise.all(
					team.playerIds.map((id) => this.playerRepository.findById(id)),
				);

				return {
					...team,
					player: players.filter((p): p is any => p !== null), // Use player property as expected by FE
				};
			}),
		);

		return populatedTeams;
	}

	async createTeam(
		name: string,
		playerIds: string[],
		tournamentId: string,
		requesterId: string,
		requesterRole: string,
		placeId?: string,
		coach?: string,
		crestUrl?: string,
		kitColor?: string,
		kitPattern?: "solid" | "horizontal-stripes" | "vertical-stripes" | "quartered" | "sash",
		kitColors?: string[],
		formation?: {
			gameFormat: "5" | "7" | "11";
			formationType: string;
			positions: Record<string, string | null>;
		},
	): Promise<Team | null> {
		if (this.tournamentUseCases) {
			await this.tournamentUseCases.verifyTournamentOwnership(
				tournamentId,
				requesterId,
				requesterRole,
			);
		}

		for (const playerId of playerIds) {
			const player = await this.playerRepository.findById(playerId);
			if (!player) {
				throw new Error("Player not found");
			}
		}

		const newTeam: Team = {
			id: uuidv4(),
			name,
			playerIds,
			tournaments: [tournamentId],
			placeId,
			coach,
			crestUrl,
			kitColor,
			kitPattern,
			kitColors,
			formation,
		};
		await this.teamRepository.save(newTeam);

		if (this.tournamentUseCases) {
			await this.tournamentUseCases.addTeam(tournamentId, newTeam.id);
		}

		return newTeam;
	}

	async getTeamById(id: string): Promise<Team | null> {
		const team = await this.teamRepository.findById(id);
		if (!team) {
			return null;
		}

		const players = await Promise.all(
			team.playerIds.map((id) => this.playerRepository.findById(id)),
		);

		return {
			...team,
			player: players.filter((p): p is any => p !== null),
		};
	}

	async updateTeam(
		id: string,
		name: string,
		requesterId: string,
		requesterRole: string,
		playerIds?: string[],
		placeId?: string,
		coach?: string,
		crestUrl?: string,
		kitColor?: string,
		kitPattern?: "solid" | "horizontal-stripes" | "vertical-stripes" | "quartered" | "sash",
		kitColors?: string[],
		formation?: {
			gameFormat: "5" | "7" | "11";
			formationType: string;
			positions: Record<string, string | null>;
		},
	): Promise<Team | null> {
		const team = await this.teamRepository.findById(id);
		if (!team) {
			throw new Error("Team not found");
		}

		// Check ownership of the tournament(s) this team belongs to
		if (this.tournamentUseCases && team.tournaments.length > 0) {
			// For now, assume a team belongs to one tournament for mutation simplified check
			const tournamentId = team.tournaments[0];
			await this.tournamentUseCases.verifyTournamentOwnership(
				tournamentId,
				requesterId,
				requesterRole,
			);
		}

		if (playerIds) {
			for (const playerId of playerIds) {
				const player = await this.playerRepository.findById(playerId);
				if (!player) {
					throw new Error("Player not found");
				}
			}
			team.playerIds = playerIds;
		}

		team.name = name;
		team.placeId = placeId;
		team.coach = coach;
		team.crestUrl = crestUrl;
		team.kitColor = kitColor;
		if (kitPattern !== undefined) {
			team.kitPattern = kitPattern;
		}
		if (kitColors !== undefined) {
			team.kitColors = kitColors;
		}
		if (formation !== undefined) {
			team.formation = formation;
		}
		await this.teamRepository.save(team);

		return team;
	}

	async addPlayer(teamId: string, playerId: string): Promise<void> {
		const team = await this.teamRepository.findById(teamId);
		if (!team) {
			throw new Error("Team not found");
		}

		const player = await this.playerRepository.findById(playerId);
		if (!player) {
			throw new Error("Player not found");
		}

		if (!team.playerIds.includes(playerId)) {
			team.playerIds.push(playerId);
			await this.teamRepository.save(team);
		}
	}

	async deleteTeam(id: string, requesterId: string, requesterRole: string): Promise<void> {
		const team = await this.teamRepository.findById(id);
		if (!team) {
			throw new Error("Team not found");
		}

		if (this.tournamentUseCases && team.tournaments.length > 0) {
			const tournamentId = team.tournaments[0];
			await this.tournamentUseCases.verifyTournamentOwnership(
				tournamentId,
				requesterId,
				requesterRole,
			);
		}

		if (this.matchRepository && team.tournaments.length > 0) {
			const tournamentId = team.tournaments[0];
			const matches = await this.matchRepository.getMatchesByTournament(tournamentId);
			const hasMatches = matches.some((match) => match.teamAId === id || match.teamBId === id);
			if (hasMatches) {
				throw new Error("Cannot delete team with existing matches");
			}
		}

		await this.teamRepository.deleteById(id);
	}
}
