import { Before } from "@cucumber/cucumber";

import { InMemoryUserRepository } from "../../src/auth/infrastructure/in-memory-user.repository";
import { InMemoryMatchRepository } from "../../src/matches/infrastructure/in-memory-match.repository";
import { InMemoryPlaceRepository } from "../../src/places/infrastructure/in-memory-place.repository";
import { InMemoryPlayerRepository } from "../../src/players/infrastructure/in-memory-player.repository";
import { InMemoryRefereeRepository } from "../../src/referees/infrastructure/in-memory-referee.repository";
import { InMemoryRoundRepository } from "../../src/rounds/infrastructure/in-memory-round.repository";
import { InMemoryTeamRepository } from "../../src/teams/infrastructure/in-memory-team.repository";
import { InMemoryTournamentRepository } from "../../src/tournaments/infrastructure/in-memory-tournament.repository";

class TestRepositories {
	user = new InMemoryUserRepository();
	tournament = new InMemoryTournamentRepository();
	team = new InMemoryTeamRepository();
	player = new InMemoryPlayerRepository();
	match = new InMemoryMatchRepository();
	round = new InMemoryRoundRepository();
	place = new InMemoryPlaceRepository();
	referee = new InMemoryRefereeRepository();

	reset(): void {
		this.user = new InMemoryUserRepository();
		this.tournament = new InMemoryTournamentRepository();
		this.team = new InMemoryTeamRepository();
		this.player = new InMemoryPlayerRepository();
		this.match = new InMemoryMatchRepository();
		this.round = new InMemoryRoundRepository();
		this.place = new InMemoryPlaceRepository();
		this.referee = new InMemoryRefereeRepository();
	}
}

export const repositories = new TestRepositories();

Before(function () {
	repositories.reset();
});
