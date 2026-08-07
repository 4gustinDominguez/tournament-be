import { Router } from "express";

import { UserRole } from "../../auth/domain/user";
import { hasRole, isAuthenticated } from "../../auth/infrastructure/auth.middleware";
import { repositories } from "../../shared/infrastructure/repository.factory";
import { tournamentUseCases } from "../../tournaments/infrastructure/tournament.routes";
import { RefereeUseCases } from "../application/referee.use-cases";
import { RefereeController } from "./referee.controller";

const refereeRepository = repositories.referee;
const refereeUseCases = new RefereeUseCases(refereeRepository, tournamentUseCases);
const refereeController = new RefereeController(refereeUseCases);

const router = Router();

// Public Routes
router.get("/", (req, res) => refereeController.getRefereesByTournament(req, res));

// Protected Routes
router.get(
	"/all",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
	(req, res) => refereeController.getAllReferees(req, res),
);

// Protected Routes
router.get("/me", isAuthenticated, (req, res) => refereeController.getMe(req, res));
router.post(
	"/",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
	(req, res) => refereeController.createReferee(req, res),
);
router.put(
	"/:id",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
	(req, res) => refereeController.updateReferee(req, res),
);
router.delete(
	"/:id",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
	(req, res) => refereeController.deleteReferee(req, res),
);

export default router;
