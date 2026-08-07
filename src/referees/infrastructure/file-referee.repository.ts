import * as fs from "fs/promises";
import * as path from "path";

import { Referee } from "../domain/referee";
import { RefereeRepository } from "../domain/referee.repository";

export class FileRefereeRepository implements RefereeRepository {
	private readonly dbPath = path.join(__dirname, "../../../data/referees.json");

	private async readDb(): Promise<Referee[]> {
		try {
			const data = await fs.readFile(this.dbPath, "utf-8");

			return JSON.parse(data) as Referee[];
		} catch (error: any) {
			if (error.code === "ENOENT") {
				return [];
			}
			throw error;
		}
	}

	private async writeDb(referees: Referee[]): Promise<void> {
		await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
		await fs.writeFile(this.dbPath, JSON.stringify(referees, null, 2));
	}

	async save(referee: Referee): Promise<void> {
		const referees = await this.readDb();
		const index = referees.findIndex((r) => r.id === referee.id);
		if (index !== -1) {
			referees[index] = referee;
		} else {
			referees.push(referee);
		}
		await this.writeDb(referees);
	}

	async findById(id: string): Promise<Referee | null> {
		const referees = await this.readDb();

		return referees.find((r) => r.id === id) ?? null;
	}

	async findByTournamentId(tournamentId: string): Promise<Referee[]> {
		const referees = await this.readDb();

		return referees.filter((r) => r.tournamentIds.includes(tournamentId));
	}

	async findByUserId(userId: string): Promise<Referee | null> {
		const referees = await this.readDb();

		return referees.find((r) => r.userId === userId) ?? null;
	}

	async findAll(): Promise<Referee[]> {
		return this.readDb();
	}

	async deleteById(id: string): Promise<void> {
		const referees = await this.readDb();
		const filtered = referees.filter((r) => r.id !== id);
		await this.writeDb(filtered);
	}
}
