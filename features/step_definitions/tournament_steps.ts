import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import { v4 as uuidv4 } from "uuid";

import { Place } from "../../src/places/domain/place.entity";
import { TournamentUseCases } from "../../src/tournaments/application/tournament.use-cases";
import { Tournament } from "../../src/tournaments/domain/tournament";
import { repositories } from "./test-repositories";

let tournamentUseCases: TournamentUseCases;
let createdTournament: Tournament | null = null;
let tournamentsList: Tournament[] = [];
let fetchedTournament: Tournament | null = null;
let lastError: Error | null = null;
let lastDeletedTournamentId: string | null = null;

async function findTournamentByName(name: string): Promise<Tournament> {
	const tournament = (await repositories.tournament.getAll()).find((t) => t.name === name);
	if (!tournament) {
		throw new Error(`Tournament ${name} not found`);
	}

	return tournament;
}

Given("there are no tournaments", async function () {
	tournamentUseCases = new TournamentUseCases(
		repositories.tournament,
		repositories.match,
		repositories.round,
		repositories.team,
		repositories.player,
		repositories.place,
		repositories.referee,
	);
	lastError = null;
	lastDeletedTournamentId = null;
});

When("I create a tournament named {string}", async function (name: string) {
	const startDate = new Date();
	const endDate = new Date();
	endDate.setDate(startDate.getDate() + 7);
	createdTournament = await tournamentUseCases.createTournament(
		name,
		startDate,
		endDate,
		"owner-id",
	);
});

When("I get the tournament by its ID", async function () {
	if (createdTournament) {
		fetchedTournament = await tournamentUseCases.getTournamentById(createdTournament.id);
	}
});

When(
	"I try to create a tournament named {string} with start date {string} and end date {string}",
	async function (name: string, startStr: string, endStr: string) {
		try {
			const startDate = new Date(startStr);
			const endDate = new Date(endStr);
			createdTournament = await tournamentUseCases.createTournament(
				name,
				startDate,
				endDate,
				"owner-id",
			);
		} catch (error: any) {
			lastError = error;
		}
	},
);

Then("I should receive a tournament error saying {string}", function (message: string) {
	expect(lastError).to.not.be.null;
	expect(lastError?.message).to.equal(message);
});

Then("I should see a tournament named {string}", async function (name: string) {
	tournamentsList = await tournamentUseCases.getAllTournaments();
	const found = tournamentsList.find((t) => t.name === name);
	expect(found).to.not.be.undefined;
	expect(found?.name).to.equal(name);
});

Then("I should not see a tournament named {string}", async function (name: string) {
	tournamentsList = await tournamentUseCases.getAllTournaments();
	const found = tournamentsList.find((t) => t.name === name);
	expect(found).to.be.undefined;
});

When(
	"I update the tournament named {string} to {string}",
	async function (oldName: string, newName: string) {
		tournamentsList = await tournamentUseCases.getAllTournaments();
		const tournament = tournamentsList.find((t) => t.name === oldName);
		if (!tournament) {
			throw new Error(`Tournament ${oldName} not found`);
		}
		const startDate = new Date();
		const endDate = new Date();
		endDate.setDate(startDate.getDate() + 7);
		await tournamentUseCases.updateTournament(
			tournament.id,
			newName,
			startDate,
			endDate,
			"requester",
			"SUPER_ADMIN",
		);
	},
);

When("I delete the tournament named {string}", async function (name: string) {
	tournamentsList = await tournamentUseCases.getAllTournaments();
	const tournament = tournamentsList.find((t) => t.name === name);
	if (!tournament) {
		throw new Error(`Tournament ${name} not found`);
	}
	lastDeletedTournamentId = tournament.id;
	await tournamentUseCases.deleteTournament(tournament.id, "requester", "SUPER_ADMIN");
});

Then("the tournament name should be {string}", function (name: string) {
	expect(fetchedTournament).to.not.be.null;
	expect(fetchedTournament?.name).to.equal(name);
});

Given(
	"a team named {string} in the tournament {string} with a player named {string}",
	async function (teamName: string, tournamentName: string, playerName: string) {
		const tournament = await findTournamentByName(tournamentName);

		const player = {
			id: uuidv4(),
			name: playerName,
			nickname: playerName,
			tournaments: [tournament.id],
			fullRegistered: false,
		};
		await repositories.player.save(player);

		const team = {
			id: uuidv4(),
			name: teamName,
			playerIds: [player.id],
			tournaments: [tournament.id],
			publicRegistration: false,
		};
		await repositories.team.save(team);
	},
);

Given(
	"a team named {string} shared with another tournament in the tournament {string}",
	async function (teamName: string, tournamentName: string) {
		const tournament = await findTournamentByName(tournamentName);

		const team = {
			id: uuidv4(),
			name: teamName,
			playerIds: [],
			tournaments: [tournament.id, "other-tournament-id"],
			publicRegistration: false,
		};
		await repositories.team.save(team);
	},
);

Given("a match in the tournament {string}", async function (tournamentName: string) {
	const tournament = await findTournamentByName(tournamentName);
	await repositories.match.createMatch({
		id: uuidv4(),
		tournamentId: tournament.id,
		roundId: "round-1",
		teamAId: "team-a",
		teamBId: "team-b",
		result: null,
		status: "scheduled",
		date: new Date(),
		incidents: [],
	});
});

Given("a round in the tournament {string}", async function (tournamentName: string) {
	const tournament = await findTournamentByName(tournamentName);
	await repositories.round.createRound({
		id: uuidv4(),
		name: "Round 1",
		tournamentId: tournament.id,
	});
});

Given("a place in the tournament {string}", async function (tournamentName: string) {
	const tournament = await findTournamentByName(tournamentName);
	await repositories.place.save(new Place(uuidv4(), "Main Stadium", tournament.id));
});

Given(
	"a referee named {string} assigned to the tournament {string}",
	async function (refereeName: string, tournamentName: string) {
		const tournament = await findTournamentByName(tournamentName);
		await repositories.referee.save({
			id: uuidv4(),
			name: refereeName,
			tournamentIds: [tournament.id],
		});
	},
);

Then("the deleted tournament should not have any associated data", async function () {
	expect(lastDeletedTournamentId).to.not.be.null;

	const deletedTournamentId = lastDeletedTournamentId as string;

	const matches = await repositories.match.getMatchesByTournament(deletedTournamentId);
	expect(matches).to.have.length(0);

	const rounds = await repositories.round.getRoundsByTournament(deletedTournamentId);
	expect(rounds).to.have.length(0);

	const places = (await repositories.place.findAll()).filter(
		(place) => place.tournamentId === deletedTournamentId,
	);
	expect(places).to.have.length(0);

	const teams = (await repositories.team.getAll()).filter((team) =>
		team.tournaments.includes(deletedTournamentId),
	);
	expect(teams).to.have.length(0);
});

Then("a team named {string} should not exist", async function (teamName: string) {
	const teams = await repositories.team.getAll();
	expect(teams.find((team) => team.name === teamName)).to.be.undefined;
});

Then("a player named {string} should not exist", async function (playerName: string) {
	const players = await repositories.player.getAll();
	expect(players.find((player) => player.name === playerName)).to.be.undefined;
});

Then(
	"a team named {string} should still exist and not belong to the deleted tournament",
	async function (teamName: string) {
		const teams = await repositories.team.getAll();
		const team = teams.find((t) => t.name === teamName);
		expect(team).to.not.be.undefined;
		expect(team?.tournaments).to.not.include(lastDeletedTournamentId);
	},
);

Then(
	"a referee named {string} should still exist and not be assigned to the deleted tournament",
	async function (refereeName: string) {
		const referees = await repositories.referee.findAll();
		const referee = referees.find((r) => r.name === refereeName);
		expect(referee).to.not.be.undefined;
		expect(referee?.tournamentIds).to.not.include(lastDeletedTournamentId);
	},
);
