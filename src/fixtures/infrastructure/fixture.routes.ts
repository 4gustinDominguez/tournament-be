import { Router } from "express";

import { UserRole } from "../../auth/domain/user";
import { hasRole, isAuthenticated } from "../../auth/infrastructure/auth.middleware";
import { MatchUseCases } from "../../matches/application/match.use-cases";
import { RoundUseCases } from "../../rounds/application/round.use-cases";
import { repositories } from "../../shared/infrastructure/repository.factory";
import { tournamentUseCases } from "../../tournaments/infrastructure/tournament.routes";
import { FixtureUseCases } from "../application/fixture.use-cases";
import { FixtureController } from "./fixture.controller";

const router = Router();

// Repositories
const tournamentRepository = repositories.tournament;
const roundRepository = repositories.round;
const matchRepository = repositories.match;

// Reusable Use Cases
const roundUseCases = new RoundUseCases(roundRepository);
const matchUseCases = new MatchUseCases(matchRepository, roundRepository, tournamentUseCases);

// Fixture Use Cases
const fixtureUseCases = new FixtureUseCases(tournamentRepository, roundUseCases, matchUseCases);

// Controller
const fixtureController = new FixtureController(fixtureUseCases);

// Routes
router.post(
	"/tournaments/:tournamentId/fixtures/generate",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
	fixtureController.generate.bind(fixtureController),
);

export default router;
