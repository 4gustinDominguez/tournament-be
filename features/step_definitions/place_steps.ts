import { Before, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import fs from "fs/promises";

import { PlaceUseCases } from "../../src/places/application/place.use-cases";
import { Place } from "../../src/places/domain/place.entity";
import { FilePlaceRepository } from "../../src/places/infrastructure/file-place.repository";
import { TournamentUseCases } from "../../src/tournaments/application/tournament.use-cases";
import { Tournament } from "../../src/tournaments/domain/tournament";
import { FileTournamentRepository } from "../../src/tournaments/infrastructure/file-tournament.repository";

const PLACES_FILE_PATH = "./data/places.json";
const TOURNAMENTS_FILE_PATH = "./data/tournaments.json";

let placeUseCases: PlaceUseCases;
let tournamentUseCases: TournamentUseCases;
let tournaments: Tournament[] = [];
let placesList: Place[] = [];
let lastError: Error | null = null;

Before(async function () {
	try {
		await fs.unlink(PLACES_FILE_PATH);
	} catch (error: any) {
		if (error.code !== "ENOENT") {
			throw error;
		}
	}
	try {
		await fs.unlink(TOURNAMENTS_FILE_PATH);
	} catch (error: any) {
		if (error.code !== "ENOENT") {
			throw error;
		}
	}

	const placeRepository = new FilePlaceRepository();
	const tournamentRepository = new FileTournamentRepository();
	tournamentUseCases = new TournamentUseCases(tournamentRepository);
	placeUseCases = new PlaceUseCases(placeRepository, tournamentUseCases);

	tournaments = [];
	placesList = [];
	lastError = null;
});

Given("there are no places", async function () {
	// This step is now empty as the Before hook handles the setup
});

Given("a place tournament {string} exists", async function (name: string) {
	const tournament = await tournamentUseCases.createTournament(
		name,
		new Date(),
		new Date(),
		"owner-id",
	);
	tournaments.push(tournament);
});

Given(
	"a place named {string} exists in tournament {string}",
	async function (name: string, tournamentName: string) {
		const tournament = tournaments.find((t) => t.name === tournamentName);
		if (!tournament) {
			throw new Error(`Tournament ${tournamentName} not found`);
		}
		await placeUseCases.createPlace(name, tournament.id, "requester", "SUPER_ADMIN");
	},
);

When(
	"I create a place named {string} in tournament {string}",
	async function (name: string, tournamentName: string) {
		const tournament = tournaments.find((t) => t.name === tournamentName);
		if (!tournament) {
			throw new Error(`Tournament ${tournamentName} not found`);
		}
		await placeUseCases.createPlace(name, tournament.id, "requester", "SUPER_ADMIN");
	},
);

When("I delete the place {string}", async function (name: string) {
	placesList = await placeUseCases.getAllPlaces();
	const place = placesList.find((p) => p.name === name);
	if (!place) {
		throw new Error(`Place ${name} not found`);
	}
	await placeUseCases.deletePlace(place.id, "requester", "SUPER_ADMIN");
});

When("I try to delete a non-existent place", async function () {
	try {
		await placeUseCases.deletePlace(
			"00000000-0000-0000-0000-000000000000",
			"requester",
			"SUPER_ADMIN",
		);
	} catch (error: any) {
		lastError = error;
	}
});

Then("I should see a place named {string}", async function (name: string) {
	placesList = await placeUseCases.getAllPlaces();
	const found = placesList.find((p) => p.name === name);
	expect(found).to.not.be.undefined;
	expect(found?.name).to.equal(name);
});

Then("I should not see a place named {string}", async function (name: string) {
	placesList = await placeUseCases.getAllPlaces();
	const found = placesList.find((p) => p.name === name);
	expect(found).to.be.undefined;
});

Then("I should receive a place error saying {string}", function (message: string) {
	expect(lastError).to.not.be.null;
	expect(lastError?.message).to.equal(message);
});
