import { Router } from "express";

import { UserRole } from "../../auth/domain/user";
import { hasRole, isAuthenticated } from "../../auth/infrastructure/auth.middleware";
import { repositories } from "../../shared/infrastructure/repository.factory";
import { tournamentUseCases } from "../../tournaments/infrastructure/tournament.routes";
import { TeamUseCases } from "../application/team.use-cases";
import { TeamController } from "./team.controller";

const router = Router();

const teamRepository = repositories.team;
const playerRepository = repositories.player;
export const teamUseCases = new TeamUseCases(
	teamRepository,
	playerRepository,
	tournamentUseCases,
	repositories.match,
);
const teamController = new TeamController(teamUseCases);

// Public Routes
router.get("/teams", teamController.getAllTeams.bind(teamController));
router.get("/teams/:id", teamController.getTeamById.bind(teamController));

// Protected Routes
router.post(
	"/teams",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
	teamController.createTeam.bind(teamController),
);
router.put(
	"/teams/:id",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
	teamController.updateTeam.bind(teamController),
);
router.delete(
	"/teams/:id",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
	teamController.deleteTeam.bind(teamController),
);

export default router;
