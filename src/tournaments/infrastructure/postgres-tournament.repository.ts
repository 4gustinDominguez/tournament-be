import { Pool } from "pg";

import { Tournament } from "../domain/tournament";
import { TournamentRepository } from "../domain/tournament.repository";

function toTournament(row: any): Tournament {
	return {
		id: row.id,
		name: row.name,
		slug: row.slug,
		startDate: row.start_date,
		endDate: row.end_date,
		location: row.location,
		teamIds: row.team_ids ?? [],
		ownerId: row.owner_id,
		matchDurationMinutes: row.match_duration_minutes ?? undefined,
	};
}

export class PostgresTournamentRepository implements TournamentRepository {
	constructor(private readonly pool: Pool) {}

	async getAll(): Promise<Tournament[]> {
		const { rows } = await this.pool.query("SELECT * FROM tournaments");

		return rows.map(toTournament);
	}

	async getTournamentsByOwner(ownerId: string): Promise<Tournament[]> {
		const { rows } = await this.pool.query("SELECT * FROM tournaments WHERE owner_id = $1", [
			ownerId,
		]);

		return rows.map(toTournament);
	}

	async save(tournament: Tournament): Promise<void> {
		await this.pool.query(
			`INSERT INTO tournaments (id, name, slug, start_date, end_date, location, team_ids, owner_id, match_duration_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
			[
				tournament.id,
				tournament.name,
				tournament.slug ?? null,
				tournament.startDate,
				tournament.endDate,
				tournament.location,
				tournament.teamIds,
				tournament.ownerId,
				tournament.matchDurationMinutes ?? null,
			],
		);
	}

	async findById(id: string): Promise<Tournament | null> {
		const { rows } = await this.pool.query("SELECT * FROM tournaments WHERE id = $1", [id]);

		return rows[0] ? toTournament(rows[0]) : null;
	}

	async findBySlug(slug: string): Promise<Tournament | null> {
		const { rows } = await this.pool.query("SELECT * FROM tournaments WHERE slug = $1", [slug]);

		return rows[0] ? toTournament(rows[0]) : null;
	}

	async update(tournament: Tournament): Promise<void> {
		await this.pool.query(
			`UPDATE tournaments SET
         name = $2, slug = $3, start_date = $4, end_date = $5, location = $6,
         team_ids = $7, owner_id = $8, match_duration_minutes = $9
       WHERE id = $1`,
			[
				tournament.id,
				tournament.name,
				tournament.slug ?? null,
				tournament.startDate,
				tournament.endDate,
				tournament.location,
				tournament.teamIds,
				tournament.ownerId,
				tournament.matchDurationMinutes ?? null,
			],
		);
	}

	async delete(id: string): Promise<void> {
		await this.pool.query("DELETE FROM tournaments WHERE id = $1", [id]);
	}
}
