import fs from "fs";
import path from "path";

import { getPool, initDatabase } from "./shared/infrastructure/db";
import { createPostgresRepositories } from "./shared/infrastructure/repository.factory";

interface TableState {
	table: string;
	file: string;
	seed: (items: any[]) => Promise<void>;
}

async function main(): Promise<void> {
	if (!process.env.DATABASE_URL) {
		console.error("DATABASE_URL is required to run the seed.");
		process.exit(1);
	}

	const pool = getPool();
	await initDatabase(pool);
	const repos = createPostgresRepositories(pool);

	const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

	const tables: TableState[] = [
		{
			table: "users",
			file: "users.json",
			seed: async (items) => {
				await Promise.all(items.map((i) => repos.user.save(i)));
			},
		},
		{
			table: "tournaments",
			file: "tournaments.json",
			seed: async (items) => {
				await Promise.all(items.map((i) => repos.tournament.save(i)));
			},
		},
		{
			table: "teams",
			file: "teams.json",
			seed: async (items) => {
				await Promise.all(items.map((i) => repos.team.save(i)));
			},
		},
		{
			table: "players",
			file: "players.json",
			seed: async (items) => {
				await Promise.all(items.map((i) => repos.player.save(i)));
			},
		},
		{
			table: "rounds",
			file: "rounds.json",
			seed: async (items) => {
				await Promise.all(items.map((i) => repos.round.createRound(i)));
			},
		},
		{
			table: "places",
			file: "places.json",
			seed: async (items) => {
				await Promise.all(items.map((i) => repos.place.save(i)));
			},
		},
		{
			table: "referees",
			file: "referees.json",
			seed: async (items) => {
				await Promise.all(items.map((i) => repos.referee.save(i)));
			},
		},
		{
			table: "matches",
			file: "matches.json",
			seed: async (items) => {
				await Promise.all(items.map((i) => repos.match.createMatch(i)));
			},
		},
	];

	for (const t of tables) {
		const filePath = path.join(dataDir, t.file);
		if (!fs.existsSync(filePath)) {
			console.log(`[seed] Skipping ${t.table}: ${t.file} not found`);
			continue;
		}

		const { rows } = await pool.query(`SELECT count(*)::int AS count FROM ${t.table}`);
		if (rows[0].count > 0) {
			console.log(`[seed] Skipping ${t.table}: already has ${rows[0].count} rows`);
			continue;
		}

		const items = JSON.parse(fs.readFileSync(filePath, "utf-8"));
		if (!Array.isArray(items) || items.length === 0) {
			console.log(`[seed] Skipping ${t.table}: empty`);
			continue;
		}

		await t.seed(items);
		console.log(`[seed] Seeded ${t.table}: ${items.length} rows`);
	}

	await pool.end();
	console.log("[seed] Done.");
}

main().catch((err) => {
	console.error("[seed] Failed:", err);
	process.exit(1);
});
