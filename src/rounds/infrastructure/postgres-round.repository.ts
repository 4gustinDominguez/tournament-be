import { Pool } from "pg";
import { Round } from "../domain/round";
import { RoundRepository } from "../domain/round.repository";

function toRound(row: any): Round {
  return {
    id: row.id,
    name: row.name,
    tournamentId: row.tournament_id,
    startDate: row.start_date,
    endDate: row.end_date,
  };
}

export class PostgresRoundRepository implements RoundRepository {
  constructor(private readonly pool: Pool) {}

  async createRound(round: Round): Promise<Round> {
    await this.pool.query(
      `INSERT INTO rounds (id, name, tournament_id, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [round.id, round.name, round.tournamentId, round.startDate, round.endDate]
    );
    return round;
  }

  async getRoundsByTournament(tournamentId: string): Promise<Round[]> {
    const { rows } = await this.pool.query(
      "SELECT * FROM rounds WHERE tournament_id = $1",
      [tournamentId]
    );
    return rows.map(toRound);
  }

  async getRoundById(id: string): Promise<Round | null> {
    const { rows } = await this.pool.query(
      "SELECT * FROM rounds WHERE id = $1",
      [id]
    );
    return rows[0] ? toRound(rows[0]) : null;
  }

  async deleteRound(id: string): Promise<void> {
    await this.pool.query("DELETE FROM rounds WHERE id = $1", [id]);
  }
}
