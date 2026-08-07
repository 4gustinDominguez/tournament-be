import fs from "fs/promises";
import path from "path";

import { Team } from "../domain/team";
import { TeamRepository } from "../domain/team.repository";

const TEAMS_FILE_PATH = "./data/teams.json";

export class FileTeamRepository implements TeamRepository {
	private async ensureDataDir(): Promise<void> {
		await fs.mkdir(path.dirname(TEAMS_FILE_PATH), { recursive: true });
	}

	async getAll(): Promise<Team[]> {
		try {
			const data = await fs.readFile(TEAMS_FILE_PATH, "utf-8");

			return JSON.parse(data) as Team[];
		} catch (error: any) {
			if (error && error?.code === "ENOENT") {
				return [];
			}
			throw error;
		}
	}

	async save(team: Team): Promise<void> {
		const teams = await this.getAll();
		const index = teams.findIndex((t) => t.id === team.id);
		if (index === -1) {
			teams.push(team);
		} else {
			teams[index] = team;
		}
		await this.ensureDataDir();
		await fs.writeFile(TEAMS_FILE_PATH, JSON.stringify(teams, null, 2));
	}

	async findById(id: string): Promise<Team | null> {
		const teams = await this.getAll();
		const team = teams.find((t) => t.id === id);

		return team ?? null;
	}

	async deleteById(id: string): Promise<void> {
		const teams = await this.getAll();
		const filteredTeams = teams.filter((t) => t.id !== id);
		await this.ensureDataDir();
		await fs.writeFile(TEAMS_FILE_PATH, JSON.stringify(filteredTeams, null, 2));
	}
}
