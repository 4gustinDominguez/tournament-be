import { Referee } from "../domain/referee";
import { RefereeRepository } from "../domain/referee.repository";

export class InMemoryRefereeRepository implements RefereeRepository {
	private referees: Referee[] = [];

	async save(referee: Referee): Promise<void> {
		const index = this.referees.findIndex((r) => r.id === referee.id);
		if (index === -1) {
			this.referees.push(referee);
		} else {
			this.referees[index] = referee;
		}
	}

	async findById(id: string): Promise<Referee | null> {
		return this.referees.find((r) => r.id === id) ?? null;
	}

	async findByTournamentId(tournamentId: string): Promise<Referee[]> {
		return this.referees.filter((r) => r.tournamentIds.includes(tournamentId));
	}

	async findByUserId(userId: string): Promise<Referee | null> {
		return this.referees.find((r) => r.userId === userId) ?? null;
	}

	async findAll(): Promise<Referee[]> {
		return this.referees;
	}

	async deleteById(id: string): Promise<void> {
		this.referees = this.referees.filter((r) => r.id !== id);
	}
}
