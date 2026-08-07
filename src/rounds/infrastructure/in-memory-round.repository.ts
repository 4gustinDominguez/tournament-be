import { Round } from "../domain/round";
import { RoundRepository } from "../domain/round.repository";

export class InMemoryRoundRepository implements RoundRepository {
	private rounds: Round[] = [];

	async createRound(round: Round): Promise<Round> {
		this.rounds.push(round);

		return round;
	}

	async getRoundsByTournament(tournamentId: string): Promise<Round[]> {
		return this.rounds.filter((round) => round.tournamentId === tournamentId);
	}

	async getRoundById(id: string): Promise<Round | null> {
		return this.rounds.find((round) => round.id === id) ?? null;
	}

	async deleteRound(id: string): Promise<void> {
		this.rounds = this.rounds.filter((round) => round.id !== id);
	}
}
