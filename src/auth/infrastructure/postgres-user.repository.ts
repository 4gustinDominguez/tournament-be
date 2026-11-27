import { Pool } from "pg";

import { User } from "../domain/user";
import { UserRepository } from "../domain/user.repository";

function toUser(row: any): User {
	const resetTokenExpiry =
		row.reset_token_expiry === null || row.reset_token_expiry === undefined
			? undefined
			: Number(row.reset_token_expiry); // pg returns BIGINT as string

	return {
		id: row.id,
		email: row.email,
		passwordHash: row.password_hash,
		role: row.role,
		firstName: row.first_name,
		lastName: row.last_name,
		plan: row.plan,
		ownedTournaments: row.owned_tournaments ?? [],
		resetToken: row.reset_token ?? undefined,
		resetTokenExpiry,
		verificationToken: row.verification_token ?? undefined,
		emailVerified: row.email_verified ?? false,
	};
}

export class PostgresUserRepository implements UserRepository {
	constructor(private readonly pool: Pool) {}

	async save(user: User): Promise<void> {
		await this.pool.query(
			`INSERT INTO users (id, email, password_hash, role, first_name, last_name, plan, owned_tournaments, reset_token, reset_token_expiry, verification_token, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
				user.resetToken ?? null,
				user.resetTokenExpiry ?? null,
				user.verificationToken ?? null,
				user.emailVerified ?? false,
			],
		);
	}

	async findByEmail(email: string): Promise<User | null> {
		const { rows } = await this.pool.query("SELECT * FROM users WHERE email = $1", [email]);

		return rows[0] ? toUser(rows[0]) : null;
	}

	async findById(id: string): Promise<User | null> {
		const { rows } = await this.pool.query("SELECT * FROM users WHERE id = $1", [id]);

		return rows[0] ? toUser(rows[0]) : null;
	}

	async findByResetToken(token: string): Promise<User | null> {
		const { rows } = await this.pool.query("SELECT * FROM users WHERE reset_token = $1", [token]);

		return rows[0] ? toUser(rows[0]) : null;
	}

	async findByVerificationToken(token: string): Promise<User | null> {
		const { rows } = await this.pool.query("SELECT * FROM users WHERE verification_token = $1", [
			token,
		]);

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
         last_name = $6, plan = $7, owned_tournaments = $8,
         reset_token = $9, reset_token_expiry = $10,
         verification_token = $11, email_verified = $12
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
				user.resetToken ?? null,
				user.resetTokenExpiry ?? null,
				user.verificationToken ?? null,
				user.emailVerified ?? false,
			],
		);
	}
}
