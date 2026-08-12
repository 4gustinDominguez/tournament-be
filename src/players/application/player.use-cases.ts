import { v4 as uuidv4 } from "uuid";

import { TeamUseCases } from "../../teams/application/team.use-cases";
import { Player } from "../domain/player";
import { PlayerRepository } from "../domain/player.repository";

export class PlayerUseCases {
	constructor(
		private readonly playerRepository: PlayerRepository,
		private readonly teamUseCases?: TeamUseCases,
	) {}

	async getAllPlayers(): Promise<Player[]> {
		return this.playerRepository.getAll();
	}

	async createPlayer(
		name: string,
		nickname: string,
		teamId?: string,
		position?: string,
		height?: number,
		weight?: number,
		photoUrl?: string,
		socialMedia?: Player["socialMedia"],
		statistics?: Player["statistics"],
		dorsal?: number,
		userId?: string,
	): Promise<Player> {
		if (!name) {
			throw new Error("Player name cannot be empty");
		}

		const players = await this.playerRepository.getAll();
		if (players.some((p) => p.name === name)) {
			throw new Error("Player already exists");
		}

		const newPlayer: Player = {
			id: uuidv4(),
			name,
			nickname,
			dorsal,
			tournaments: [],
			position,
			height,
			weight,
			photoUrl,
			socialMedia,
			statistics: statistics ?? {
				matchesPlayed: 0,
				goals: 0,
				assists: 0,
				yellowCards: 0,
				redCards: 0,
				minutesPlayed: 0,
			},
			userId,
			fullRegistered: false,
		};
		await this.playerRepository.save(newPlayer);

		if (teamId && this.teamUseCases) {
			await this.teamUseCases.addPlayer(teamId, newPlayer.id);
		}

		return newPlayer;
	}

	async getPlayerById(id: string): Promise<Player | null> {
		return this.playerRepository.findById(id);
	}

	async getPlayerByUserId(userId: string): Promise<Player | null> {
		return this.playerRepository.findByUserId(userId);
	}

	async updatePlayer(
		id: string,
		updates: Partial<Omit<Player, "id" | "tournaments">>,
		requesterId?: string,
	): Promise<Player> {
		const player = await this.playerRepository.findById(id);
		if (!player) {
			throw new Error("Player not found");
		}

		// Apply updates, preserving existing values for fields not provided
		Object.assign(player, updates);

		await this.playerRepository.update(player);

		return player;
	}

	async updateStatistics(id: string, statsDelta: Partial<Player["statistics"]>): Promise<Player> {
		const player = await this.playerRepository.findById(id);
		if (!player) {
			throw new Error("Player not found");
		}

		const currentStats = player.statistics ?? {
			matchesPlayed: 0,
			goals: 0,
			assists: 0,
			yellowCards: 0,
			redCards: 0,
			minutesPlayed: 0,
		};

		player.statistics = {
			matchesPlayed: currentStats.matchesPlayed + (statsDelta?.matchesPlayed ?? 0),
			goals: currentStats.goals + (statsDelta?.goals ?? 0),
			assists: currentStats.assists + (statsDelta?.assists ?? 0),
			yellowCards: currentStats.yellowCards + (statsDelta?.yellowCards ?? 0),
			redCards: currentStats.redCards + (statsDelta?.redCards ?? 0),
			minutesPlayed: currentStats.minutesPlayed + (statsDelta?.minutesPlayed ?? 0),
		};

		await this.playerRepository.update(player);

		return player;
	}

	async deletePlayer(id: string): Promise<void> {
		const player = await this.playerRepository.findById(id);
		if (!player) {
			throw new Error("Player not found");
		}

		// Remove player from all teams' playerIds
		if (this.teamUseCases) {
			const teams = await this.teamUseCases.getAllTeams();
			for (const team of teams) {
				if (team.playerIds.includes(id)) {
					team.playerIds = team.playerIds.filter((pid) => pid !== id);
					await this.teamUseCases.updateTeam(
						team.id,
						team.name,
						"", // requesterId
						"", // requesterRole
						team.playerIds,
					);
				}
			}
		}

		await this.playerRepository.delete(id);
	}
}
