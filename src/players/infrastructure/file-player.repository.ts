import fs from "fs/promises";
import path from "path";

import { Player } from "../domain/player";
import { PlayerRepository } from "../domain/player.repository";

const PLAYERS_FILE_PATH = "./data/players.json";

export class FilePlayerRepository implements PlayerRepository {
	private async ensureDataDir(): Promise<void> {
		await fs.mkdir(path.dirname(PLAYERS_FILE_PATH), { recursive: true });
	}

	async getAll(): Promise<Player[]> {
		try {
			const data = await fs.readFile(PLAYERS_FILE_PATH, "utf-8");

			return JSON.parse(data) as Player[];
		} catch (error: any) {
			if (error && error?.code === "ENOENT") {
				return [];
			}
			throw error;
		}
	}

	async save(player: Player): Promise<void> {
		const players = await this.getAll();
		players.push(player);
		await this.ensureDataDir();
		await fs.writeFile(PLAYERS_FILE_PATH, JSON.stringify(players, null, 2));
	}

	async findById(id: string): Promise<Player | null> {
		const players = await this.getAll();
		const player = players.find((p) => p.id === id);

		return player ?? null;
	}

	async update(player: Player): Promise<void> {
		const players = await this.getAll();
		const index = players.findIndex((p) => p.id === player.id);
		if (index !== -1) {
			players[index] = player;
			await this.ensureDataDir();
			await fs.writeFile(PLAYERS_FILE_PATH, JSON.stringify(players, null, 2));
		}
	}

	async delete(id: string): Promise<void> {
		const players = await this.getAll();
		const filteredPlayers = players.filter((p) => p.id !== id);
		await this.ensureDataDir();
		await fs.writeFile(PLAYERS_FILE_PATH, JSON.stringify(filteredPlayers, null, 2));
	}

	async findByUserId(userId: string): Promise<Player | null> {
		const players = await this.getAll();

		return players.find((p) => p.userId === userId) ?? null;
	}
}
