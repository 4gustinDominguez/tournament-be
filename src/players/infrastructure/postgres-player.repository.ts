import { Pool } from "pg";

import { Player } from "../domain/player";
import { PlayerRepository } from "../domain/player.repository";

function toPlayer(row: any): Player {
	return {
		id: row.id,
		name: row.name,
		nickname: row.nickname,
		tournaments: row.tournaments ?? [],
		position: row.position,
		height: row.height,
		weight: row.weight,
		photoUrl: row.photo_url,
		socialMedia: row.social_media,
		statistics: row.statistics,
	};
}

export class PostgresPlayerRepository implements PlayerRepository {
	constructor(private readonly pool: Pool) {}

	async getAll(): Promise<Player[]> {
		const { rows } = await this.pool.query("SELECT * FROM players");

		return rows.map(toPlayer);
	}

	async save(player: Player): Promise<void> {
		await this.pool.query(
			`INSERT INTO players (id, name, nickname, tournaments, position, height, weight, photo_url, social_media, statistics)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         nickname = EXCLUDED.nickname,
         tournaments = EXCLUDED.tournaments,
         position = EXCLUDED.position,
         height = EXCLUDED.height,
         weight = EXCLUDED.weight,
         photo_url = EXCLUDED.photo_url,
         social_media = EXCLUDED.social_media,
         statistics = EXCLUDED.statistics`,
			[
				player.id,
				player.name,
				player.nickname,
				player.tournaments,
				player.position,
				player.height,
				player.weight,
				player.photoUrl,
				JSON.stringify(player.socialMedia ?? null),
				JSON.stringify(player.statistics ?? null),
			],
		);
	}

	async findById(id: string): Promise<Player | null> {
		const { rows } = await this.pool.query("SELECT * FROM players WHERE id = $1", [id]);

		return rows[0] ? toPlayer(rows[0]) : null;
	}

	async update(player: Player): Promise<void> {
		await this.pool.query(
			`UPDATE players SET
         name = $2, nickname = $3, tournaments = $4, position = $5,
         height = $6, weight = $7, photo_url = $8, social_media = $9::jsonb,
         statistics = $10::jsonb
       WHERE id = $1`,
			[
				player.id,
				player.name,
				player.nickname,
				player.tournaments,
				player.position,
				player.height,
				player.weight,
				player.photoUrl,
				JSON.stringify(player.socialMedia ?? null),
				JSON.stringify(player.statistics ?? null),
			],
		);
	}

	async delete(id: string): Promise<void> {
		await this.pool.query("DELETE FROM players WHERE id = $1", [id]);
	}
}
