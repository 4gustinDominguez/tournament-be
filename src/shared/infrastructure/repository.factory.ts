import { Pool } from "pg";

import { UserRepository } from "../../auth/domain/user.repository";
import { TournamentRepository } from "../../tournaments/domain/tournament.repository";
import { TeamRepository } from "../../teams/domain/team.repository";
import { PlayerRepository } from "../../players/domain/player.repository";
import { RoundRepository } from "../../rounds/domain/round.repository";
import { MatchRepository } from "../../matches/domain/match.repository";
import { PlaceRepository } from "../../places/domain/place.repository";
import { RefereeRepository } from "../../referees/domain/referee.repository";

import { FileUserRepository } from "../../auth/infrastructure/file-user.repository";
import { FileTournamentRepository } from "../../tournaments/infrastructure/file-tournament.repository";
import { FileTeamRepository } from "../../teams/infrastructure/file-team.repository";
import { FilePlayerRepository } from "../../players/infrastructure/file-player.repository";
import { FileRoundRepository } from "../../rounds/infrastructure/file-round.repository";
import { FileMatchRepository } from "../../matches/infrastructure/file-match.repository";
import { FilePlaceRepository } from "../../places/infrastructure/file-place.repository";
import { FileRefereeRepository } from "../../referees/infrastructure/file-referee.repository";

import { PostgresUserRepository } from "../../auth/infrastructure/postgres-user.repository";
import { PostgresTournamentRepository } from "../../tournaments/infrastructure/postgres-tournament.repository";
import { PostgresTeamRepository } from "../../teams/infrastructure/postgres-team.repository";
import { PostgresPlayerRepository } from "../../players/infrastructure/postgres-player.repository";
import { PostgresRoundRepository } from "../../rounds/infrastructure/postgres-round.repository";
import { PostgresMatchRepository } from "../../matches/infrastructure/postgres-match.repository";
import { PostgresPlaceRepository } from "../../places/infrastructure/postgres-place.repository";
import { PostgresRefereeRepository } from "../../referees/infrastructure/postgres-referee.repository";

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
