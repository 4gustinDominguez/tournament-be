import * as fs from "fs/promises";
import * as path from "path";

import { Round } from "../domain/round";
import { RoundRepository } from "../domain/round.repository";

export class FileRoundRepository implements RoundRepository {
	private readonly dbPath = path.join(__dirname, "../../../data/rounds.json");

	private async readDb(): Promise<Round[]> {
		try {
			const data = await fs.readFile(this.dbPath, "utf-8");

			return JSON.parse(data, (key, value) => {
				if (key === "startDate" || key === "endDate") {
					return new Date(value);
				}

				return value;
			}) as Round[];
		} catch (error: any) {
			if (error.code === "ENOENT") {
				return [];
			}
			throw error;
		}
	}

	private async writeDb(rounds: Round[]): Promise<void> {
		await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
		await fs.writeFile(this.dbPath, JSON.stringify(rounds, null, 2));
	}

	async createRound(round: Round): Promise<Round> {
		const rounds = await this.readDb();
		rounds.push(round);
		await this.writeDb(rounds);

		return round;
	}

	async getRoundsByTournament(tournamentId: string): Promise<Round[]> {
		const rounds = await this.readDb();

		return rounds.filter((round) => round.tournamentId === tournamentId);
	}

	async getRoundById(id: string): Promise<Round | null> {
		const rounds = await this.readDb();

		return rounds.find((round) => round.id === id) ?? null;
	}

	async deleteRound(id: string): Promise<void> {
		const rounds = await this.readDb();
		const filteredRounds = rounds.filter((round) => round.id !== id);
		await this.writeDb(filteredRounds);
	}
}
