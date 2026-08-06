import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { TournamentUseCases } from "../../src/tournaments/application/tournament.use-cases";
import { FileTournamentRepository } from "../../src/tournaments/infrastructure/file-tournament.repository";
import { Tournament } from "../../src/tournaments/domain/tournament";
import fs from "fs/promises";

const TOURNAMENTS_FILE_PATH = "./data/tournaments.json";

let tournamentUseCases: TournamentUseCases;
let createdTournament: Tournament | null = null;
let tournamentsList: Tournament[] = [];
let fetchedTournament: Tournament | null = null;
let lastError: Error | null = null;

Given("there are no tournaments", async function () {
  // Clean up the tournaments file before each scenario
  try {
    await fs.unlink(TOURNAMENTS_FILE_PATH);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
  const tournamentRepository = new FileTournamentRepository();
  tournamentUseCases = new TournamentUseCases(tournamentRepository);
  lastError = null;
});

When("I create a tournament named {string}", async function (name: string) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 7);
  createdTournament = await tournamentUseCases.createTournament(name, startDate, endDate);
});

When("I get the tournament by its ID", async function () {
  if (createdTournament) {
    fetchedTournament = await tournamentUseCases.getTournamentById(createdTournament.id);
  }
});

When("I try to create a tournament named {string} with start date {string} and end date {string}", async function (name: string, startStr: string, endStr: string) {
  try {
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    createdTournament = await tournamentUseCases.createTournament(name, startDate, endDate);
  } catch (error: any) {
    lastError = error;
  }
});

Then("I should receive a tournament error saying {string}", function (message: string) {
  expect(lastError).to.not.be.null;
  expect(lastError?.message).to.equal(message);
});

Then("I should see a tournament named {string}", async function (name: string) {
  tournamentsList = await tournamentUseCases.getAllTournaments();
  const found = tournamentsList.find(t => t.name === name);
  expect(found).to.not.be.undefined;
  expect(found?.name).to.equal(name);
});

Then("I should not see a tournament named {string}", async function (name: string) {
  tournamentsList = await tournamentUseCases.getAllTournaments();
  const found = tournamentsList.find(t => t.name === name);
  expect(found).to.be.undefined;
});

When("I update the tournament named {string} to {string}", async function (oldName: string, newName: string) {
  tournamentsList = await tournamentUseCases.getAllTournaments();
  const tournament = tournamentsList.find(t => t.name === oldName);
  if (!tournament) {
    throw new Error(`Tournament ${oldName} not found`);
  }
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 7);
  await tournamentUseCases.updateTournament(tournament.id, newName, startDate, endDate);
});

When("I delete the tournament named {string}", async function (name: string) {
  tournamentsList = await tournamentUseCases.getAllTournaments();
  const tournament = tournamentsList.find(t => t.name === name);
  if (!tournament) {
    throw new Error(`Tournament ${name} not found`);
  }
  await tournamentUseCases.deleteTournament(tournament.id);
});

Then("the tournament name should be {string}", function (name: string) {
  expect(fetchedTournament).to.not.be.null;
  expect(fetchedTournament?.name).to.equal(name);
});
