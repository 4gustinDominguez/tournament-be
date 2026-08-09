import { Pool } from "pg";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  plan TEXT NOT NULL,
  owned_tournaments TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  location TEXT,
  team_ids TEXT[] NOT NULL DEFAULT '{}',
  owner_id TEXT
);

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  player_ids TEXT[] NOT NULL DEFAULT '{}',
  logo TEXT,
  tournaments TEXT[] NOT NULL DEFAULT '{}',
  place_id TEXT,
  coach TEXT,
  crest_url TEXT,
  kit_color TEXT,
  kit_pattern TEXT,
  kit_colors TEXT[] NOT NULL DEFAULT '{}',
  formation JSONB
);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT,
  tournaments TEXT[] NOT NULL DEFAULT '{}',
  position TEXT,
  height INTEGER,
  weight INTEGER,
  photo_url TEXT,
  social_media JSONB,
  statistics JSONB
);

CREATE TABLE IF NOT EXISTS rounds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tournament_id TEXT NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS places (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tournament_id TEXT NOT NULL,
  location TEXT,
  capacity INTEGER
);

CREATE TABLE IF NOT EXISTS referees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tournament_ids TEXT[] NOT NULL DEFAULT '{}',
  user_id TEXT,
  photo_url TEXT
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  round_id TEXT NOT NULL,
  team_a_id TEXT NOT NULL,
  team_b_id TEXT NOT NULL,
  referee_id TEXT,
  score_a INTEGER,
  score_b INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled',
  date TIMESTAMPTZ,
  place_id TEXT,
  incidents JSONB NOT NULL DEFAULT '[]',
  notes TEXT
);
`;

let pool: Pool | null = null;

function resolveSsl(connectionString: string): { rejectUnauthorized: false } | undefined {
	if (process.env.DB_SSL === "true") {
		return { rejectUnauthorized: false };
	}
	try {
		const hostname = new URL(connectionString).hostname;
		if (hostname.includes("supabase")) {
			return { rejectUnauthorized: false };
		}
	} catch {
		// URL mal formada: se ignora y se conecta sin SSL
	}

	return undefined;
}

export function getPool(): Pool {
	if (!pool) {
		const connectionString = process.env.DATABASE_URL;
		if (!connectionString) {
			throw new Error("DATABASE_URL is required when using Postgres storage");
		}
		pool = new Pool({ connectionString, max: 10, ssl: resolveSsl(connectionString) });
	}

	return pool;
}

export async function initDatabase(p: Pool = getPool()): Promise<void> {
	await p.query(SCHEMA_SQL);
	await runMigrations(p);
}

async function runMigrations(p: Pool): Promise<void> {
	await p.query(`
		ALTER TABLE teams
		ADD COLUMN IF NOT EXISTS kit_pattern TEXT,
		ADD COLUMN IF NOT EXISTS kit_colors TEXT[] NOT NULL DEFAULT '{}',
		ADD COLUMN IF NOT EXISTS formation JSONB;
	`);
}
