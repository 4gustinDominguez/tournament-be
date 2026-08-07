import { Player } from "../domain/player";
import { PlayerRepository } from "../domain/player.repository";

export class InMemoryPlayerRepository implements PlayerRepository {
	private players: Player[] = [];

	async getAll(): Promise<Player[]> {
		return this.players;
	}

	async save(player: Player): Promise<void> {
		this.players.push(player);
	}

	async findById(id: string): Promise<Player | null> {
		return this.players.find((p) => p.id === id) ?? null;
	}

	async update(player: Player): Promise<void> {
		const index = this.players.findIndex((p) => p.id === player.id);
		if (index !== -1) {
			this.players[index] = player;
		}
	}

	async delete(id: string): Promise<void> {
		this.players = this.players.filter((p) => p.id !== id);
	}
}
