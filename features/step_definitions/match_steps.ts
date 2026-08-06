import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "chai";
import { MatchUseCases } from "../../src/matches/application/match.use-cases";
import { FileMatchRepository } from "../../src/matches/infrastructure/file-match.repository";
import { TeamUseCases } from "../../src/teams/application/team.use-cases";
import { FileTeamRepository } from "../../src/teams/infrastructure/file-team.repository";
import { TournamentUseCases } from "../../src/tournaments/application/tournament.use-cases";
import { FileTournamentRepository } from "../../src/tournaments/infrastructure/file-tournament.repository";
import { Match, MatchResult } from "../../src/matches/domain/match";
import { Team } from "../../src/teams/domain/team";
import { Tournament } from "../../src/tournaments/domain/tournament";
import fs from "fs/promises";
import { FilePlayerRepository } from "../../src/players/infrastructure/file-player.repository";
import { FileRoundRepository } from "../../src/rounds/infrastructure/file-round.repository";
import { v4 as uuid } from "uuid";

const MATCHES_FILE_PATH = "./data/matches.json";
const TEAMS_FILE_PATH = "./data/teams.json";
const TOURNAMENTS_FILE_PATH = "./data/tournaments.json";
const ROUNDS_FILE_PATH = "./data/rounds.json";

let matchUseCases: MatchUseCases;
let teamUseCases: TeamUseCases;
let tournamentUseCases: TournamentUseCases;
let createdMatch: Match | null = null;
let updatedMatch: Match | null = null;
let tournaments: Tournament[] = [];
let teams: Team[] = [];
let lastError: Error | null = null;

Before(async function () {
  try {
    await fs.unlink(MATCHES_FILE_PATH);
  } catch (error: any) {
    if (error.code !== 'ENOENT') throw error;
  }
  try {
    await fs.unlink(TEAMS_FILE_PATH);
  } catch (error: any) {
    if (error.code !== 'ENOENT') throw error;
  }
  try {
    await fs.unlink(TOURNAMENTS_FILE_PATH);
  } catch (error: any) {
    if (error.code !== 'ENOENT') throw error;
  }
  try {
    await fs.unlink(ROUNDS_FILE_PATH);
  } catch (error: any) {
    if (error.code !== 'ENOENT') throw error;
  }

  createdMatch = null;
  updatedMatch = null;
  tournaments = [];
  teams = [];
  lastError = null;

  const tournamentRepository = new FileTournamentRepository();
  tournamentUseCases = new TournamentUseCases(tournamentRepository);

  const teamRepository = new FileTeamRepository();
  const playerRepository = new FilePlayerRepository();
  teamUseCases = new TeamUseCases(teamRepository, playerRepository);

  const matchRepository = new FileMatchRepository();
  const roundRepository = new FileRoundRepository();
  matchUseCases = new MatchUseCases(matchRepository, roundRepository);
});

Given("a tournament {string} exists", async function (name: string) {
  const tournament = await tournamentUseCases.createTournament(name, new Date(), new Date());
  tournaments.push(tournament);
});

Given("a team {string} exists", async function (name: string) {
  const team = await teamUseCases.createTeam(name, []);
  if (team) {
    teams.push(team);
  }
});

Given("a match exists between {string} and {string} in tournament {string}", async function (teamAName: string, teamBName: string, tournamentName: string) {
  const teamA = teams.find(t => t.name === teamAName);
  const teamB = teams.find(t => t.name === teamBName);
  const tournament = tournaments.find(t => t.name === tournamentName);

  if (!teamA || !teamB || !tournament) {
    throw new Error("Missing team or tournament for match creation");
  }

  // Create a mock round because createMatch now checks for it
  const roundRepository = new FileRoundRepository();
  const roundId = uuid();
  await roundRepository.createRound({
    id: roundId,
    name: "Round 1",
    tournamentId: tournament.id,
    startDate: new Date(),
    endDate: new Date()
  });

  createdMatch = await matchUseCases.createMatch(roundId, teamA.id, teamB.id, new Date());
});

Given("there are no matches", async function () {
  // Matches depend on other entities, so cleaning via Before hook is usually enough.
  // Ensure no matches exist in context if needed.
  createdMatch = null;
});

When("I add the result {int}-{int} to the match", async function (scoreA: number, scoreB: number) {
  if (!createdMatch) {
    throw new Error("No match created");
  }
  const result: MatchResult = { scoreA, scoreB };
  updatedMatch = await matchUseCases.addResultToMatch(createdMatch.id, result);
});

When("I try to add the result {int} to {int} to the match", async function (scoreA: number, scoreB: number) {
  try {
    if (!createdMatch) {
      throw new Error("No match created");
    }
    const result: MatchResult = { scoreA, scoreB };
    await matchUseCases.addResultToMatch(createdMatch.id, result);
  } catch (error: any) {
    lastError = error;
  }
});

When("I try to add result {int}-{int} to a non-existent match", async function (scoreA: number, scoreB: number) {
  try {
    const result: MatchResult = { scoreA, scoreB };
    await matchUseCases.addResultToMatch("00000000-0000-0000-0000-000000000000", result);
  } catch (error: any) {
    lastError = error;
  }
});

Then("I should receive a match error saying {string}", function (message: string) {
  expect(lastError).to.not.be.null;
  expect(lastError?.message).to.equal(message);
});

Then("the match should have the result {int}-{int}", function (scoreA: number, scoreB: number) {
  expect(updatedMatch).to.not.be.null;
  expect(updatedMatch?.result).to.deep.equal({ scoreA, scoreB });
});

When("I update the match between {string} and {string} to be on {string}", async function (teamAName: string, teamBName: string, date: string) {
  const teamA = teams.find(t => t.name === teamAName);
  const teamB = teams.find(t => t.name === teamBName);
  // Re-fetch matches from repository to be sure
  const allMatches = await matchUseCases.getMatchesByTournament(tournaments[0].id);
  const match = allMatches.find(m => m.teamAId === teamA?.id && m.teamBId === teamB?.id);

  if (!match || !teamA || !teamB) throw new Error("Match or teams not found");

  await matchUseCases.updateMatch(match.id, teamA.id, teamB.id, new Date(date));
});

Then("I should see the match between {string} and {string} on {string}", async function (teamAName: string, teamBName: string, date: string) {
  const teamA = teams.find(t => t.name === teamAName);
  const teamB = teams.find(t => t.name === teamBName);
  const allMatches = await matchUseCases.getMatchesByTournament(tournaments[0].id);
  const match = allMatches.find(m => m.teamAId === teamA?.id && m.teamBId === teamB?.id);

  expect(match).to.not.be.undefined;
  expect(new Date(match!.date).toISOString().split('T')[0]).to.equal(date);
});

When("I delete the match between {string} and {string}", async function (teamAName: string, teamBName: string) {
  const teamA = teams.find(t => t.name === teamAName);
  const teamB = teams.find(t => t.name === teamBName);
  const allMatches = await matchUseCases.getMatchesByTournament(tournaments[0].id);
  const match = allMatches.find(m => m.teamAId === teamA?.id && m.teamBId === teamB?.id);

  if (!match) throw new Error("Match not found");

  await matchUseCases.deleteMatch(match.id);
});

Then("I should not see a match between {string} and {string} in tournament {string}", async function (teamAName: string, teamBName: string, tournamentName: string) {
  const teamA = teams.find(t => t.name === teamAName);
  const teamB = teams.find(t => t.name === teamBName);
  const tournament = tournaments.find(t => t.name === tournamentName);
  if (!tournament) throw new Error("Tournament not found");

  const allMatches = await matchUseCases.getMatchesByTournament(tournament.id);
  const match = allMatches.find(m => m.teamAId === teamA?.id && m.teamBId === teamB?.id);

  expect(match).to.be.undefined;
});