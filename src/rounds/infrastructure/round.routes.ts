import { Router } from "express";

import { UserRole } from "../../auth/domain/user";
import { hasRole, isAuthenticated } from "../../auth/infrastructure/auth.middleware";
import { repositories } from "../../shared/infrastructure/repository.factory";
import { tournamentUseCases } from "../../tournaments/infrastructure/tournament.routes";
import { RoundUseCases } from "../application/round.use-cases";
import { RoundController } from "./round.controller";

const router = Router();

// Repositories
const roundRepository = repositories.round;

// Use Cases
const roundUseCases = new RoundUseCases(roundRepository, tournamentUseCases, repositories.match);

// Controller
const roundController = new RoundController(roundUseCases);

// Routes
router.post(
	"/tournaments/:tournamentId/rounds",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
	roundController.createRound.bind(roundController),
);
router.get(
	"/tournaments/:tournamentId/rounds",
	roundController.getRoundsByTournament.bind(roundController),
);
router.delete(
	"/rounds/:id",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
	roundController.deleteRound.bind(roundController),
);

export default router;
