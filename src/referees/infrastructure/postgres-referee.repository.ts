import { Pool } from "pg";
import { Referee } from "../domain/referee";
import { RefereeRepository } from "../domain/referee.repository";

function toReferee(row: any): Referee {
  return {
    id: row.id,
    name: row.name,
    tournamentIds: row.tournament_ids || [],
    userId: row.user_id,
  };
}

export class PostgresRefereeRepository implements RefereeRepository {
  constructor(private readonly pool: Pool) {}

  async save(referee: Referee): Promise<void> {
    await this.pool.query(
      `INSERT INTO referees (id, name, tournament_ids, user_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         tournament_ids = EXCLUDED.tournament_ids,
         user_id = EXCLUDED.user_id`,
      [referee.id, referee.name, referee.tournamentIds, referee.userId]
    );
  }

  async findById(id: string): Promise<Referee | null> {
    const { rows } = await this.pool.query(
      "SELECT * FROM referees WHERE id = $1",
      [id]
    );
    return rows[0] ? toReferee(rows[0]) : null;
  }

  async findByTournamentId(tournamentId: string): Promise<Referee[]> {
    const { rows } = await this.pool.query(
      "SELECT * FROM referees WHERE $1 = ANY(tournament_ids)",
      [tournamentId]
    );
    return rows.map(toReferee);
  }

  async findByUserId(userId: string): Promise<Referee | null> {
    const { rows } = await this.pool.query(
      "SELECT * FROM referees WHERE user_id = $1",
      [userId]
    );
    return rows[0] ? toReferee(rows[0]) : null;
  }

  async findAll(): Promise<Referee[]> {
    const { rows } = await this.pool.query("SELECT * FROM referees");
    return rows.map(toReferee);
  }

  async deleteById(id: string): Promise<void> {
    await this.pool.query("DELETE FROM referees WHERE id = $1", [id]);
  }
}
