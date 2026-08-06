import { Pool } from "pg";
import { Team } from "../domain/team";
import { TeamRepository } from "../domain/team.repository";

function toTeam(row: any): Team {
  return {
    id: row.id,
    name: row.name,
    playerIds: row.player_ids || [],
    logo: row.logo,
    tournaments: row.tournaments || [],
    placeId: row.place_id,
    coach: row.coach,
    crestUrl: row.crest_url,
    kitColor: row.kit_color,
  };
}

export class PostgresTeamRepository implements TeamRepository {
  constructor(private readonly pool: Pool) {}

  async getAll(): Promise<Team[]> {
    const { rows } = await this.pool.query("SELECT * FROM teams");
    return rows.map(toTeam);
  }

  async save(team: Team): Promise<void> {
    await this.pool.query(
      `INSERT INTO teams (id, name, player_ids, logo, tournaments, place_id, coach, crest_url, kit_color)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         player_ids = EXCLUDED.player_ids,
         logo = EXCLUDED.logo,
         tournaments = EXCLUDED.tournaments,
         place_id = EXCLUDED.place_id,
         coach = EXCLUDED.coach,
         crest_url = EXCLUDED.crest_url,
         kit_color = EXCLUDED.kit_color`,
      [
        team.id,
        team.name,
        team.playerIds,
        team.logo,
        team.tournaments,
        team.placeId,
        team.coach,
        team.crestUrl,
        team.kitColor,
      ]
    );
  }

  async findById(id: string): Promise<Team | null> {
    const { rows } = await this.pool.query("SELECT * FROM teams WHERE id = $1", [
      id,
    ]);
    return rows[0] ? toTeam(rows[0]) : null;
  }

  async deleteById(id: string): Promise<void> {
    await this.pool.query("DELETE FROM teams WHERE id = $1", [id]);
  }
}
