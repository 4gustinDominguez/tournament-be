import { Pool } from "pg";
import { Tournament } from "../domain/tournament";
import { TournamentRepository } from "../domain/tournament.repository";

function toTournament(row: any): Tournament {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    location: row.location,
    teamIds: row.team_ids || [],
    ownerId: row.owner_id,
  };
}

export class PostgresTournamentRepository implements TournamentRepository {
  constructor(private readonly pool: Pool) {}

  async getAll(): Promise<Tournament[]> {
    const { rows } = await this.pool.query("SELECT * FROM tournaments");
    return rows.map(toTournament);
  }

  async getTournamentsByOwner(ownerId: string): Promise<Tournament[]> {
    const { rows } = await this.pool.query(
      "SELECT * FROM tournaments WHERE owner_id = $1",
      [ownerId]
    );
    return rows.map(toTournament);
  }

  async save(tournament: Tournament): Promise<void> {
    await this.pool.query(
      `INSERT INTO tournaments (id, name, start_date, end_date, location, team_ids, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [
        tournament.id,
        tournament.name,
        tournament.startDate,
        tournament.endDate,
        tournament.location,
        tournament.teamIds,
        tournament.ownerId,
      ]
    );
  }

  async findById(id: string): Promise<Tournament | null> {
    const { rows } = await this.pool.query(
      "SELECT * FROM tournaments WHERE id = $1",
      [id]
    );
    return rows[0] ? toTournament(rows[0]) : null;
  }

  async update(tournament: Tournament): Promise<void> {
    await this.pool.query(
      `UPDATE tournaments SET
         name = $2, start_date = $3, end_date = $4, location = $5,
         team_ids = $6, owner_id = $7
       WHERE id = $1`,
      [
        tournament.id,
        tournament.name,
        tournament.startDate,
        tournament.endDate,
        tournament.location,
        tournament.teamIds,
        tournament.ownerId,
      ]
    );
  }

  async delete(id: string): Promise<void> {
    await this.pool.query("DELETE FROM tournaments WHERE id = $1", [id]);
  }
}
