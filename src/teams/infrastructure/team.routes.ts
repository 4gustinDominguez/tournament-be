import { Router } from "express";
import { TeamController } from "./team.controller";
import { TeamUseCases } from "../application/team.use-cases";
import { repositories } from "../../shared/infrastructure/repository.factory";

import { tournamentUseCases } from "../../tournaments/infrastructure/tournament.routes";
import { isAuthenticated, hasRole } from "../../auth/infrastructure/auth.middleware";
import { UserRole } from "../../auth/domain/user";

const router = Router();

const teamRepository = repositories.team;
const playerRepository = repositories.player;
export const teamUseCases = new TeamUseCases(teamRepository, playerRepository, tournamentUseCases);
const teamController = new TeamController(teamUseCases);

// Public Routes
router.get("/teams", teamController.getAllTeams.bind(teamController));
router.get("/teams/:id", teamController.getTeamById.bind(teamController));

// Protected Routes
router.post("/teams", isAuthenticated, hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]), teamController.createTeam.bind(teamController));
router.put("/teams/:id", isAuthenticated, hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]), teamController.updateTeam.bind(teamController));
router.delete("/teams/:id", isAuthenticated, hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]), teamController.deleteTeam.bind(teamController));

export default router;
