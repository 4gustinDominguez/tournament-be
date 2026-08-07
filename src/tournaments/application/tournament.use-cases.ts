import { v4 as uuidv4 } from "uuid";

import { Tournament } from "../domain/tournament";
import { TournamentRepository } from "../domain/tournament.repository";

export class TournamentUseCases {
	constructor(private readonly tournamentRepository: TournamentRepository) {}

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

		await this.tournamentRepository.delete(id);
	}
}
