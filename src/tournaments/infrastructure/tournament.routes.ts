import { Router } from "express";

import { UserRole } from "../../auth/domain/user";
import { hasRole, isAuthenticated } from "../../auth/infrastructure/auth.middleware";
import { repositories } from "../../shared/infrastructure/repository.factory";
import { TournamentUseCases } from "../application/tournament.use-cases";
import { TournamentController } from "./tournament.controller";

const router = Router();

const tournamentRepository = repositories.tournament;
export const tournamentUseCases = new TournamentUseCases(
	tournamentRepository,
	repositories.match,
	repositories.round,
	repositories.team,
	repositories.player,
	repositories.place,
	repositories.referee,
);
const tournamentController = new TournamentController(tournamentUseCases);

router.get("/tournaments", tournamentController.getAllTournaments.bind(tournamentController));
router.get(
	"/tournaments/me",
	isAuthenticated,
	tournamentController.getMyTournaments.bind(tournamentController),
);
router.post(
	"/tournaments",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
	tournamentController.createTournament.bind(tournamentController),
);
router.get("/tournaments/:id", tournamentController.getTournamentById.bind(tournamentController));
router.put(
	"/tournaments/:id",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
	tournamentController.updateTournament.bind(tournamentController),
);
router.delete(
	"/tournaments/:id",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
	tournamentController.deleteTournament.bind(tournamentController),
);

export default router;
