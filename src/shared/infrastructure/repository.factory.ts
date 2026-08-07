import { Pool } from "pg";

import { UserRepository } from "../../auth/domain/user.repository";
import { FileUserRepository } from "../../auth/infrastructure/file-user.repository";
import { PostgresUserRepository } from "../../auth/infrastructure/postgres-user.repository";
import { MatchRepository } from "../../matches/domain/match.repository";
import { FileMatchRepository } from "../../matches/infrastructure/file-match.repository";
import { PostgresMatchRepository } from "../../matches/infrastructure/postgres-match.repository";
import { PlaceRepository } from "../../places/domain/place.repository";
import { FilePlaceRepository } from "../../places/infrastructure/file-place.repository";
import { PostgresPlaceRepository } from "../../places/infrastructure/postgres-place.repository";
import { PlayerRepository } from "../../players/domain/player.repository";
import { FilePlayerRepository } from "../../players/infrastructure/file-player.repository";
import { PostgresPlayerRepository } from "../../players/infrastructure/postgres-player.repository";
import { RefereeRepository } from "../../referees/domain/referee.repository";
import { FileRefereeRepository } from "../../referees/infrastructure/file-referee.repository";
import { PostgresRefereeRepository } from "../../referees/infrastructure/postgres-referee.repository";
import { RoundRepository } from "../../rounds/domain/round.repository";
import { FileRoundRepository } from "../../rounds/infrastructure/file-round.repository";
import { PostgresRoundRepository } from "../../rounds/infrastructure/postgres-round.repository";
import { TeamRepository } from "../../teams/domain/team.repository";
import { FileTeamRepository } from "../../teams/infrastructure/file-team.repository";
import { PostgresTeamRepository } from "../../teams/infrastructure/postgres-team.repository";
import { TournamentRepository } from "../../tournaments/domain/tournament.repository";
import { FileTournamentRepository } from "../../tournaments/infrastructure/file-tournament.repository";
import { PostgresTournamentRepository } from "../../tournaments/infrastructure/postgres-tournament.repository";
import { getPool } from "./db";

export interface Repositories {
	user: UserRepository;
	tournament: TournamentRepository;
	team: TeamRepository;
	player: PlayerRepository;
	round: RoundRepository;
	match: MatchRepository;
	place: PlaceRepository;
	referee: RefereeRepository;
}

function createFileRepositories(): Repositories {
	return {
		user: new FileUserRepository(),
		tournament: new FileTournamentRepository(),
		team: new FileTeamRepository(),
		player: new FilePlayerRepository(),
		round: new FileRoundRepository(),
		match: new FileMatchRepository(),
		place: new FilePlaceRepository(),
		referee: new FileRefereeRepository(),
	};
}

export function createPostgresRepositories(pool: Pool = getPool()): Repositories {
	return {
		user: new PostgresUserRepository(pool),
		tournament: new PostgresTournamentRepository(pool),
		team: new PostgresTeamRepository(pool),
		player: new PostgresPlayerRepository(pool),
		round: new PostgresRoundRepository(pool),
		match: new PostgresMatchRepository(pool),
		place: new PostgresPlaceRepository(pool),
		referee: new PostgresRefereeRepository(pool),
	};
}

function isUsingPostgres(): boolean {
	return !!process.env.DATABASE_URL && process.env.STORAGE !== "json";
}

export const usingPostgres = isUsingPostgres();

export const repositories: Repositories = usingPostgres
	? createPostgresRepositories()
	: createFileRepositories();
