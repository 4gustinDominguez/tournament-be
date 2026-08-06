import { Router } from "express";
import { PlayerController } from "./player.controller";
import { PlayerUseCases } from "../application/player.use-cases";
import { repositories } from "../../shared/infrastructure/repository.factory";

import { teamUseCases } from "../../teams/infrastructure/team.routes";
import { isAuthenticated, hasRole } from "../../auth/infrastructure/auth.middleware";
import { UserRole } from "../../auth/domain/user";

const router = Router();

const playerRepository = repositories.player;
export const playerUseCases = new PlayerUseCases(playerRepository, teamUseCases);
const playerController = new PlayerController(playerUseCases);

// Public Routes
router.get("/players", playerController.getAllPlayers.bind(playerController));
router.get("/players/:id", playerController.getPlayerById.bind(playerController));

// Protected Routes
router.post("/players", isAuthenticated, hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]), playerController.createPlayer.bind(playerController));
router.put("/players/:id", isAuthenticated, hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.PLAYER]), playerController.updatePlayer.bind(playerController));
router.delete("/players/:id", isAuthenticated, hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]), playerController.deletePlayer.bind(playerController));

export default router;
