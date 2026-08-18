import { v4 as uuidv4 } from "uuid";

import { MatchRepository } from "../../matches/domain/match.repository";
import { PlaceRepository } from "../../places/domain/place.repository";
import { PlayerRepository } from "../../players/domain/player.repository";
import { RefereeRepository } from "../../referees/domain/referee.repository";
import { RoundRepository } from "../../rounds/domain/round.repository";
import { TeamRepository } from "../../teams/domain/team.repository";
import { Tournament } from "../domain/tournament";
import { TournamentRepository } from "../domain/tournament.repository";

function slugify(name: string): string {
	return name
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

export class TournamentUseCases {
	constructor(
		private readonly tournamentRepository: TournamentRepository,
		private readonly matchRepository?: MatchRepository,
		private readonly roundRepository?: RoundRepository,
		private readonly teamRepository?: TeamRepository,
		private readonly playerRepository?: PlayerRepository,
		private readonly placeRepository?: PlaceRepository,
		private readonly refereeRepository?: RefereeRepository,
	) {}

	async getAllTournaments(): Promise<Tournament[]> {
		return this.tournamentRepository.getAll();
	}

	async getTournamentsByOwner(ownerId: string): Promise<Tournament[]> {
		return this.tournamentRepository.getTournamentsByOwner(ownerId);
	}

	async verifyTournamentOwnership(
		tournamentId: string,
		requesterId: string,
		requesterRole: string,
	): Promise<void> {
		if (requesterRole === "SUPER_ADMIN") {
			return;
		}

		const tournament = await this.tournamentRepository.findById(tournamentId);
		if (!tournament) {
			throw new Error("Tournament not found");
		}

		if (tournament.ownerId !== requesterId) {
			throw new Error("Unauthorized: You do not own this tournament");
		}
	}

	async createTournament(
		name: string,
		startDate: Date,
		endDate: Date,
		ownerId: string,
		location?: string,
	): Promise<Tournament> {
		if (endDate < startDate) {
			throw new Error("End date must be after start date");
		}

		const newTournament: Tournament = {
			id: uuidv4(),
			name,
			slug: slugify(name),
			startDate,
			endDate,
			location: location ?? "",
			teamIds: [],
			ownerId,
		};
		await this.tournamentRepository.save(newTournament);

		return newTournament;
	}

	async getTournamentById(id: string): Promise<Tournament | null> {
		return this.tournamentRepository.findById(id);
	}

	async getTournamentBySlug(slug: string): Promise<Tournament | null> {
		return this.tournamentRepository.findBySlug(slug);
	}

	async updateTournament(
		id: string,
		name: string,
		startDate: Date,
		endDate: Date,
		requesterId: string,
		requesterRole: string,
		location?: string,
	): Promise<Tournament> {
		if (endDate < startDate) {
			throw new Error("End date must be after start date");
		}

		const tournament = await this.tournamentRepository.findById(id);
		if (!tournament) {
			throw new Error("Tournament not found");
		}

		// Ownership check
		if (requesterRole !== "SUPER_ADMIN" && tournament.ownerId !== requesterId) {
			throw new Error("Unauthorized: You do not own this tournament");
		}

		tournament.name = name;
		tournament.slug = slugify(name);
		tournament.startDate = startDate;
		tournament.endDate = endDate;
		tournament.location = location ?? tournament.location;

		await this.tournamentRepository.update(tournament);

		return tournament;
	}

	async addTeam(tournamentId: string, teamId: string): Promise<void> {
		const tournament = await this.tournamentRepository.findById(tournamentId);
		if (!tournament) {
			throw new Error("Tournament not found");
		}

		if (!tournament.teamIds.includes(teamId)) {
			tournament.teamIds.push(teamId);
			await this.tournamentRepository.update(tournament);
		}
	}

	async deleteTournament(id: string, requesterId: string, requesterRole: string): Promise<void> {
		const tournament = await this.tournamentRepository.findById(id);
		if (!tournament) {
			throw new Error("Tournament not found");
		}

		// Ownership check
		if (requesterRole !== "SUPER_ADMIN" && tournament.ownerId !== requesterId) {
			throw new Error("Unauthorized: You do not own this tournament");
		}

		await this.deleteCascade(tournament);
		await this.tournamentRepository.delete(id);
	}

	private async deleteCascade(tournament: Tournament): Promise<void> {
		// Matches -> Rounds
		if (this.matchRepository) {
			const matches = await this.matchRepository.getMatchesByTournament(tournament.id);
			for (const match of matches) {
				await this.matchRepository.deleteMatch(match.id);
			}
		}
		if (this.roundRepository) {
			const rounds = await this.roundRepository.getRoundsByTournament(tournament.id);
			for (const round of rounds) {
				await this.roundRepository.deleteRound(round.id);
			}
		}

		// Teams + linked players
		if (this.teamRepository) {
			const allTeams = await this.teamRepository.getAll();
			const relatedTeamIds = new Set<string>([
				...tournament.teamIds,
				...allTeams
					.filter((team) => team.tournaments.includes(tournament.id))
					.map((team) => team.id),
			]);

			for (const teamId of relatedTeamIds) {
				const team = await this.teamRepository.findById(teamId);
				if (!team) {
					continue;
				}

				const remainingTournaments = team.tournaments.filter(
					(tournamentId) => tournamentId !== tournament.id,
				);

				if (remainingTournaments.length === 0) {
					await this.deleteTeamWithPlayers(team.id, tournament.id);
					continue;
				}

				team.tournaments = remainingTournaments;
				await this.teamRepository.save(team);
			}
		}

		// Places
		if (this.placeRepository) {
			const places = await this.placeRepository.findAll();
			for (const place of places) {
				if (place.tournamentId === tournament.id) {
					await this.placeRepository.deleteById(place.id);
				}
			}
		}

		// Referees: only unlink, never delete (global entities)
		if (this.refereeRepository) {
			const referees = await this.refereeRepository.findByTournamentId(tournament.id);
			for (const referee of referees) {
				referee.tournamentIds = referee.tournamentIds.filter(
					(tournamentId) => tournamentId !== tournament.id,
				);
				await this.refereeRepository.save(referee);
			}
		}
	}

	private async deleteTeamWithPlayers(teamId: string, tournamentId: string): Promise<void> {
		if (!this.teamRepository) {
			return;
		}

		const team = await this.teamRepository.findById(teamId);
		if (!team) {
			return;
		}

		if (this.playerRepository) {
			for (const playerId of team.playerIds) {
				const player = await this.playerRepository.findById(playerId);
				if (!player) {
					continue;
				}

				const remainingTournaments = player.tournaments.filter(
					(linkedTournamentId) => linkedTournamentId !== tournamentId,
				);
				// The player is removed only when they belong to no other tournament
				if (remainingTournaments.length === 0) {
					await this.playerRepository.delete(player.id);
				} else {
					player.tournaments = remainingTournaments;
					await this.playerRepository.update(player);
				}
			}
		}

		await this.teamRepository.deleteById(teamId);
	}
}
