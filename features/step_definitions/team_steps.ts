import { Before, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import { v4 as uuid } from "uuid";

import { InMemoryMatchRepository } from "../../src/matches/infrastructure/in-memory-match.repository";
import { PlayerUseCases } from "../../src/players/application/player.use-cases";
import { Player } from "../../src/players/domain/player";
import { TeamUseCases } from "../../src/teams/application/team.use-cases";
import { Team } from "../../src/teams/domain/team";
import { repositories } from "./test-repositories";

let teamUseCases: TeamUseCases;
let playerUseCases: PlayerUseCases;
let matchRepository: InMemoryMatchRepository;
let createdTeam: Team | null = null;
let teamsList: Team[] = [];
let players: Player[] = [];
let updatedTeam: Team | null = null;
let lastError: Error | null = null;

Before(async function () {
	const teamRepository = repositories.team;
	const playerRepository = repositories.player;
	matchRepository = repositories.match;
	teamUseCases = new TeamUseCases(teamRepository, playerRepository, undefined, matchRepository);
	playerUseCases = new PlayerUseCases(playerRepository);

	createdTeam = null;
	teamsList = [];
	players = [];
	updatedTeam = null;
	lastError = null;
});

Given("there are no teams", async function () {
	// This step is now empty as the Before hook handles the setup
});

Given(
	"there is a player named {string} with nickname {string}",
	async function (name: string, nickname: string) {
		const player = await playerUseCases.createPlayer(name, nickname);
		players.push(player);
	},
);

When(
	"I create a team named {string} with player {string}",
	async function (teamName: string, playerName: string) {
		const player = players.find((p) => p.name === playerName);
		if (!player) {
			throw new Error(`Player ${playerName} not found`);
		}
		createdTeam = await teamUseCases.createTeam(
			teamName,
			[player.id],
			"tournament-id",
			"requester",
			"SUPER_ADMIN",
		);
	},
);

When(
	"I try to create a team named {string} with player {string}",
	async function (teamName: string, playerName: string) {
		try {
			const player = players.find((p) => p.name === playerName);
			if (!player) {
				throw new Error(`Player not found`);
			}
			createdTeam = await teamUseCases.createTeam(
				teamName,
				[player.id],
				"tournament-id",
				"requester",
				"SUPER_ADMIN",
			);
		} catch (error: any) {
			lastError = error;
		}
	},
);

When(
	"I try to update a non-existent team {string} to {string}",
	async function (_teamName: string, newName: string) {
		try {
			// Attempt update with a random UUID since team doesn't exist
			await teamUseCases.updateTeam(
				"00000000-0000-0000-0000-000000000000",
				newName,
				"requester",
				"SUPER_ADMIN",
			);
		} catch (error: any) {
			lastError = error;
		}
	},
);

Then("I should receive a team error saying {string}", function (message: string) {
	expect(lastError).to.not.be.null;
	expect(lastError?.message).to.equal(message);
});

When("I update the team's name to {string}", async function (newName: string) {
	if (createdTeam) {
		updatedTeam = await teamUseCases.updateTeam(
			createdTeam.id,
			newName,
			"requester",
			"SUPER_ADMIN",
		);
	}
});

When("I delete the team", async function () {
	if (createdTeam) {
		await teamUseCases.deleteTeam(createdTeam.id, "requester", "SUPER_ADMIN");
	}
});

Given("the team has an associated match", async function () {
	if (!createdTeam) {
		throw new Error("No team created");
	}
	await matchRepository.createMatch({
		id: uuid(),
		tournamentId: createdTeam.tournaments[0],
		roundId: uuid(),
		teamAId: createdTeam.id,
		teamBId: uuid(),
		date: new Date(),
		status: "scheduled",
		result: null,
		incidents: [],
	});
});

When("I try to delete the team", async function () {
	try {
		if (createdTeam) {
			await teamUseCases.deleteTeam(createdTeam.id, "requester", "SUPER_ADMIN");
		}
	} catch (error: any) {
		lastError = error;
	}
});

Then("I should see a team named {string}", async function (name: string) {
	teamsList = await teamUseCases.getAllTeams();
	const found = teamsList.find((t) => t.name === name);
	expect(found).to.not.be.undefined;
	expect(found?.name).to.equal(name);
});

Then("the team name should be {string}", function (expectedName: string) {
	expect(updatedTeam).to.not.be.null;
	expect(updatedTeam?.name).to.equal(expectedName);
});

Then("I should not see a team named {string}", async function (name: string) {
	teamsList = await teamUseCases.getAllTeams();
	const found = teamsList.find((t) => t.name === name);
	expect(found).to.be.undefined;
});
Then(
	"I should see a team named {string} with player {string}",
	async function (teamName: string, playerName: string) {
		teamsList = await teamUseCases.getAllTeams();
		const team = teamsList.find((t) => t.name === teamName);
		const player = players.find((p) => p.name === playerName);
		expect(team).to.not.be.undefined;
		expect(player).to.not.be.undefined;
		expect(team?.playerIds).to.include(player?.id);
	},
);

When(
	"I update the team named {string} to have player {string}",
	async function (teamName: string, playerName: string) {
		teamsList = await teamUseCases.getAllTeams();
		const team = teamsList.find((t) => t.name === teamName);
		const player = players.find((p) => p.name === playerName);
		if (!team || !player) {
			throw new Error("Team or player not found");
		}
		await teamUseCases.updateTeam(team.id, team.name, "requester", "SUPER_ADMIN", [player.id]);
	},
);

Then(
	"I should see a team named {string} without player {string}",
	async function (teamName: string, playerName: string) {
		teamsList = await teamUseCases.getAllTeams();
		const team = teamsList.find((t) => t.name === teamName);
		const player = players.find((p) => p.name === playerName);
		expect(team).to.not.be.undefined;
		expect(player).to.not.be.undefined;
		expect(team?.playerIds).to.not.include(player?.id);
	},
);
