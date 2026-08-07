import { Before, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";

import { PlayerUseCases } from "../../src/players/application/player.use-cases";
import { Player } from "../../src/players/domain/player";
import { repositories } from "./test-repositories";

let lastError: Error | null = null;
let playerUseCases: PlayerUseCases;
let playersList: Player[] = [];

Before(async function () {
	playerUseCases = new PlayerUseCases(repositories.player);
	playersList = [];
	lastError = null;
});

Given("there are no players", async function () {
	// This step is now empty as the Before hook handles the setup
});

When(
	"I create a player named {string} with nickname {string}",
	async function (name: string, nickname: string) {
		await playerUseCases.createPlayer(name, nickname);
	},
);

When("I try to create a player with empty name", async function () {
	try {
		await playerUseCases.createPlayer("", "Unknown");
	} catch (error: any) {
		lastError = error;
	}
});

When("I should receive an error saying {string}", function (message: string) {
	expect(lastError).to.not.be.null;
	expect(lastError?.message).to.equal(message);
});

When(
	"I try to create a player named {string} with nickname {string}",
	async function (name: string, nickname: string) {
		try {
			await playerUseCases.createPlayer(name, nickname);
		} catch (error: any) {
			lastError = error;
		}
	},
);

Then("I should see a player named {string}", async function (name: string) {
	playersList = await playerUseCases.getAllPlayers();
	const found = playersList.find((p) => p.name === name);
	expect(found).to.not.be.undefined;
	expect(found?.name).to.equal(name);
});

When(
	"I update the player named {string} to have name {string} and nickname {string}",
	async function (currentName: string, newName: string, newNickname: string) {
		playersList = await playerUseCases.getAllPlayers();
		const player = playersList.find((p) => p.name === currentName);
		if (!player) {
			throw new Error(`Player ${currentName} not found`);
		}
		await playerUseCases.updatePlayer(player.id, { name: newName, nickname: newNickname });
	},
);

Then("I should not see a player named {string}", async function (name: string) {
	playersList = await playerUseCases.getAllPlayers();
	const found = playersList.find((p) => p.name === name);
	expect(found).to.be.undefined;
});

When("I delete the player named {string}", async function (name: string) {
	playersList = await playerUseCases.getAllPlayers();
	const player = playersList.find((p) => p.name === name);
	if (!player) {
		throw new Error(`Player ${name} not found`);
	}
	await playerUseCases.deletePlayer(player.id);
});

When("I try to update a non-existent player {string}", async function (name: string) {
	try {
		await playerUseCases.updatePlayer("00000000-0000-0000-0000-000000000000", {
			name,
			nickname: "Unknown",
		});
	} catch (error: any) {
		lastError = error;
	}
});
