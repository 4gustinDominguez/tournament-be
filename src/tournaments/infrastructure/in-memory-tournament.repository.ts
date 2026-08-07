import { Tournament } from "../domain/tournament";
import { TournamentRepository } from "../domain/tournament.repository";

export class InMemoryTournamentRepository implements TournamentRepository {
	private tournaments: Tournament[] = [];

	async getAll(): Promise<Tournament[]> {
		return this.tournaments;
	}

	async getTournamentsByOwner(ownerId: string): Promise<Tournament[]> {
		return this.tournaments.filter((t) => t.ownerId === ownerId);
	}

	async save(tournament: Tournament): Promise<void> {
		const index = this.tournaments.findIndex((t) => t.id === tournament.id);
		if (index === -1) {
			this.tournaments.push(tournament);
		} else {
			this.tournaments[index] = tournament;
		}
	}

	async findById(id: string): Promise<Tournament | null> {
		return this.tournaments.find((t) => t.id === id) ?? null;
	}

	async update(tournament: Tournament): Promise<void> {
		const index = this.tournaments.findIndex((t) => t.id === tournament.id);
		if (index !== -1) {
			this.tournaments[index] = tournament;
		}
	}

	async delete(id: string): Promise<void> {
		this.tournaments = this.tournaments.filter((t) => t.id !== id);
	}
}
