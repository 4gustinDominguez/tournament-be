import { Pool } from "pg";
import { User } from "../domain/user";
import { UserRepository } from "../domain/user.repository";

function toUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    firstName: row.first_name,
    lastName: row.last_name,
    plan: row.plan,
    ownedTournaments: row.owned_tournaments || [],
  };
}

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async save(user: User): Promise<void> {
    await this.pool.query(
      `INSERT INTO users (id, email, password_hash, role, first_name, last_name, plan, owned_tournaments)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        user.id,
        user.email,
        user.passwordHash,
        user.role,
        user.firstName,
        user.lastName,
        user.plan,
        user.ownedTournaments,
      ]
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await this.pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return rows[0] ? toUser(rows[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const { rows } = await this.pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );
    return rows[0] ? toUser(rows[0]) : null;
  }

  async getAll(): Promise<User[]> {
    const { rows } = await this.pool.query("SELECT * FROM users");
    return rows.map(toUser);
  }

  async update(user: User): Promise<void> {
    await this.pool.query(
      `UPDATE users SET
         email = $2, password_hash = $3, role = $4, first_name = $5,
         last_name = $6, plan = $7, owned_tournaments = $8
       WHERE id = $1`,
      [
        user.id,
        user.email,
        user.passwordHash,
        user.role,
        user.firstName,
        user.lastName,
        user.plan,
        user.ownedTournaments,
      ]
    );
  }
}
