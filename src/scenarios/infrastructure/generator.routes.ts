import { Router } from "express";

import { UserRole } from "../../auth/domain/user";
import { hasRole, isAuthenticated } from "../../auth/infrastructure/auth.middleware";
import { FixtureUseCases } from "../../fixtures/application/fixture.use-cases";
import { MatchUseCases } from "../../matches/application/match.use-cases";
import { PlaceUseCases } from "../../places/application/place.use-cases";
import { PlayerUseCases } from "../../players/application/player.use-cases";
import { RefereeUseCases } from "../../referees/application/referee.use-cases";
import { RoundUseCases } from "../../rounds/application/round.use-cases";
import { repositories } from "../../shared/infrastructure/repository.factory";
import { teamUseCases } from "../../teams/infrastructure/team.routes";
import { tournamentUseCases } from "../../tournaments/infrastructure/tournament.routes";
import { GeneratorUseCases } from "../application/generator.use-cases";
import { GeneratorController } from "./generator.controller";

const router = Router();

// Repositories (some are needed for Use Cases not already exported)
const tournamentRepository = repositories.tournament;
const playerRepository = repositories.player;
const placeRepository = repositories.place;
const refereeRepository = repositories.referee;
const matchRepository = repositories.match;
const roundRepository = repositories.round;

// Re-instanciate needed Use Cases (some modules might not export them)
const playerUseCases = new PlayerUseCases(playerRepository, teamUseCases);
const placeUseCases = new PlaceUseCases(placeRepository, tournamentUseCases);
const refereeUseCases = new RefereeUseCases(refereeRepository, tournamentUseCases);
const roundUseCases = new RoundUseCases(roundRepository);
const matchUseCases = new MatchUseCases(
	matchRepository,
	roundRepository,
	tournamentUseCases,
	refereeRepository,
);
const fixtureUseCases = new FixtureUseCases(tournamentRepository, roundUseCases, matchUseCases);

const generatorUseCases = new GeneratorUseCases(
	tournamentUseCases,
	teamUseCases,
	playerUseCases,
	placeUseCases,
	refereeUseCases,
	fixtureUseCases,
	matchUseCases,
);

// Controller
const generatorController = new GeneratorController(generatorUseCases);

// Routes
router.post(
	"/scenarios/generate",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
	generatorController.generate.bind(generatorController),
);

export default router;
