import { Pool } from "pg";

import { Player } from "../domain/player";
import { PlayerRepository } from "../domain/player.repository";

function toPlayer(row: any): Player {
	return {
		id: row.id,
		name: row.name,
		nickname: row.nickname,
		dorsal: row.dorsal,
		tournaments: row.tournaments ?? [],
		position: row.position,
		height: row.height,
		weight: row.weight,
		photoUrl: row.photo_url,
		socialMedia: row.social_media,
		statistics: row.statistics,
		userId: row.user_id,
		fullRegistered: row.full_registered ?? false,
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
			`INSERT INTO players (id, name, nickname, dorsal, tournaments, position, height, weight, photo_url, social_media, statistics, user_id, full_registered)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12, $13)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         nickname = EXCLUDED.nickname,
         dorsal = EXCLUDED.dorsal,
         tournaments = EXCLUDED.tournaments,
         position = EXCLUDED.position,
         height = EXCLUDED.height,
         weight = EXCLUDED.weight,
         photo_url = EXCLUDED.photo_url,
         social_media = EXCLUDED.social_media,
         statistics = EXCLUDED.statistics,
         user_id = EXCLUDED.user_id,
         full_registered = EXCLUDED.full_registered`,
			[
				player.id,
				player.name,
				player.nickname,
				player.dorsal ?? null,
				player.tournaments,
				player.position,
				player.height,
				player.weight,
				player.photoUrl,
				JSON.stringify(player.socialMedia ?? null),
				JSON.stringify(player.statistics ?? null),
				player.userId ?? null,
				player.fullRegistered,
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
         name = $2, nickname = $3, dorsal = $4, tournaments = $5, position = $6,
         height = $7, weight = $8, photo_url = $9, social_media = $10::jsonb,
         statistics = $11::jsonb, user_id = $12, full_registered = $13
       WHERE id = $1`,
			[
				player.id,
				player.name,
				player.nickname,
				player.dorsal ?? null,
				player.tournaments,
				player.position,
				player.height,
				player.weight,
				player.photoUrl,
				JSON.stringify(player.socialMedia ?? null),
				JSON.stringify(player.statistics ?? null),
				player.userId ?? null,
				player.fullRegistered,
			],
		);
	}

	async delete(id: string): Promise<void> {
		await this.pool.query("DELETE FROM players WHERE id = $1", [id]);
	}

	async findByUserId(userId: string): Promise<Player | null> {
		const { rows } = await this.pool.query("SELECT * FROM players WHERE user_id = $1", [userId]);

		return rows[0] ? toPlayer(rows[0]) : null;
	}
}
