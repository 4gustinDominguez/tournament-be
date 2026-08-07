import { Pool } from "pg";

import { Match, MatchResult } from "../domain/match";
import { MatchRepository } from "../domain/match.repository";

function toMatch(row: any): Match {
	return {
		id: row.id,
		tournamentId: row.tournament_id,
		roundId: row.round_id,
		teamAId: row.team_a_id,
		teamBId: row.team_b_id,
		refereeId: row.referee_id,
		result:
			row.score_a !== null && row.score_b !== null
				? { scoreA: row.score_a, scoreB: row.score_b }
				: null,
		status: row.status,
		date: row.date,
		placeId: row.place_id,
		incidents: row.incidents ?? [],
		notes: row.notes,
	};
}

export class PostgresMatchRepository implements MatchRepository {
	constructor(private readonly pool: Pool) {}

	async createMatch(match: Match): Promise<Match> {
		await this.pool.query(
			`INSERT INTO matches (id, tournament_id, round_id, team_a_id, team_b_id, referee_id, score_a, score_b, status, date, place_id, incidents, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13)
       ON CONFLICT (id) DO NOTHING`,
			[
				match.id,
				match.tournamentId,
				match.roundId,
				match.teamAId,
				match.teamBId,
				match.refereeId,
				match.result?.scoreA ?? null,
				match.result?.scoreB ?? null,
				match.status,
				match.date,
				match.placeId,
				JSON.stringify(match.incidents),
				match.notes,
			],
		);

		return match;
	}

	async getMatchesByTournament(tournamentId: string): Promise<Match[]> {
		const { rows } = await this.pool.query("SELECT * FROM matches WHERE tournament_id = $1", [
			tournamentId,
		]);

		return rows.map(toMatch);
	}

	async getMatchesByReferee(refereeId: string): Promise<Match[]> {
		const { rows } = await this.pool.query("SELECT * FROM matches WHERE referee_id = $1", [
			refereeId,
		]);

		return rows.map(toMatch);
	}

	async getMatchById(id: string): Promise<Match | null> {
		const { rows } = await this.pool.query("SELECT * FROM matches WHERE id = $1", [id]);

		return rows[0] ? toMatch(rows[0]) : null;
	}

	async addResultToMatch(id: string, result: MatchResult): Promise<Match | null> {
		const { rows } = await this.pool.query(
			"UPDATE matches SET score_a = $2, score_b = $3 WHERE id = $1 RETURNING *",
			[id, result.scoreA, result.scoreB],
		);

		return rows[0] ? toMatch(rows[0]) : null;
	}

	async updateMatch(match: Match): Promise<void> {
		await this.pool.query(
			`UPDATE matches SET
         tournament_id = $2, round_id = $3, team_a_id = $4, team_b_id = $5,
         referee_id = $6, score_a = $7, score_b = $8, status = $9,
         date = $10, place_id = $11, incidents = $12::jsonb, notes = $13
       WHERE id = $1`,
			[
				match.id,
				match.tournamentId,
				match.roundId,
				match.teamAId,
				match.teamBId,
				match.refereeId,
				match.result?.scoreA ?? null,
				match.result?.scoreB ?? null,
				match.status,
				match.date,
				match.placeId,
				JSON.stringify(match.incidents),
				match.notes,
			],
		);
	}

	async deleteMatch(id: string): Promise<void> {
		await this.pool.query("DELETE FROM matches WHERE id = $1", [id]);
	}
}
