import { Before, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import { v4 as uuid } from "uuid";

import { InMemoryMatchRepository } from "../../src/matches/infrastructure/in-memory-match.repository";
import { RoundUseCases } from "../../src/rounds/application/round.use-cases";
import { Round } from "../../src/rounds/domain/round";
import { TournamentUseCases } from "../../src/tournaments/application/tournament.use-cases";
import { Tournament } from "../../src/tournaments/domain/tournament";
import { repositories } from "./test-repositories";

let roundUseCases: RoundUseCases;
let tournamentUseCases: TournamentUseCases;
let matchRepository: InMemoryMatchRepository;
let tournaments: Tournament[] = [];
let roundsList: Round[] = [];
let lastError: Error | null = null;

Before(async function () {
	const roundRepository = repositories.round;
	matchRepository = repositories.match;
	tournamentUseCases = new TournamentUseCases(repositories.tournament);
	roundUseCases = new RoundUseCases(roundRepository, tournamentUseCases, matchRepository);

	tournaments = [];
	roundsList = [];
	lastError = null;
});

Given("a round tournament {string} exists", async function (name: string) {
	const tournament = await tournamentUseCases.createTournament(
		name,
		new Date(),
		new Date(),
		"owner-id",
	);
	tournaments.push(tournament);
});

Given(
	"a round named {string} exists in tournament {string}",
	async function (roundName: string, tournamentName: string) {
		const tournament = tournaments.find((t) => t.name === tournamentName);
		if (!tournament) {
			throw new Error(`Tournament ${tournamentName} not found`);
		}
		const round = await roundUseCases.createRound(
			tournament.id,
			roundName,
			"requester",
			"SUPER_ADMIN",
		);
		roundsList.push(round);
	},
);

Given("a match exists in round {string}", async function (roundName: string) {
	const round = roundsList.find((r) => r.name === roundName);
	if (!round) {
		throw new Error(`Round ${roundName} not found`);
	}
	await matchRepository.createMatch({
		id: uuid(),
		tournamentId: round.tournamentId,
		roundId: round.id,
		teamAId: uuid(),
		teamBId: uuid(),
		date: new Date(),
		status: "scheduled",
		result: null,
		incidents: [],
	});
});

When("I delete the round {string}", async function (roundName: string) {
	const round = roundsList.find((r) => r.name === roundName);
	if (!round) {
		throw new Error(`Round ${roundName} not found`);
	}
	await roundUseCases.deleteRound(round.id, "requester", "SUPER_ADMIN");
});

When("I try to delete the round {string}", async function (roundName: string) {
	try {
		const round = roundsList.find((r) => r.name === roundName);
		if (!round) {
			throw new Error(`Round ${roundName} not found`);
		}
		await roundUseCases.deleteRound(round.id, "requester", "SUPER_ADMIN");
	} catch (error: any) {
		lastError = error;
	}
});

Then("I should receive a round error saying {string}", function (message: string) {
	expect(lastError).to.not.be.null;
	expect(lastError?.message).to.equal(message);
});

Then("I should not see a round named {string}", async function (roundName: string) {
	const round = roundsList.find((r) => r.name === roundName);
	if (!round) {
		throw new Error(`Round ${roundName} not found`);
	}
	const allRounds = await roundUseCases.getRoundsByTournament(round.tournamentId);
	const found = allRounds.find((r) => r.name === roundName);
	expect(found).to.be.undefined;
});
