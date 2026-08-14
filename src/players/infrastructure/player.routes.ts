import { Router } from "express";

import { UserRole } from "../../auth/domain/user";
import { hasRole, isAuthenticated } from "../../auth/infrastructure/auth.middleware";
import { repositories } from "../../shared/infrastructure/repository.factory";
import { teamUseCases } from "../../teams/infrastructure/team.routes";
import { tournamentUseCases } from "../../tournaments/infrastructure/tournament.routes";
import { PlayerUseCases } from "../application/player.use-cases";
import { PlayerController } from "./player.controller";

const router = Router();

const playerRepository = repositories.player;
const matchRepository = repositories.match;
export const playerUseCases = new PlayerUseCases(
	playerRepository,
	teamUseCases,
	tournamentUseCases,
	matchRepository,
);
const playerController = new PlayerController(playerUseCases);

// Protected Routes (specific before parameterized)
router.get("/players/me", isAuthenticated, (req, res) => playerController.getMe(req, res));
router.get("/players/me/teams", isAuthenticated, (req, res) =>
	playerController.getMyTeams(req, res),
);
router.get("/players/me/matches", isAuthenticated, (req, res) =>
	playerController.getMyMatches(req, res),
);
router.get("/players/me/stats", isAuthenticated, (req, res) =>
	playerController.getMyStats(req, res),
);

// Public Routes
router.get("/players", playerController.getAllPlayers.bind(playerController));
router.get("/players/:id", playerController.getPlayerById.bind(playerController));

// Protected Routes
router.post(
	"/players",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
	playerController.createPlayer.bind(playerController),
);
router.put(
	"/players/:id",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.PLAYER]),
	playerController.updatePlayer.bind(playerController),
);
router.delete(
	"/players/:id",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
	playerController.deletePlayer.bind(playerController),
);

export default router;
