import { Router } from "express";
import { MatchController } from "./match.controller";
import { MatchUseCases } from "../application/match.use-cases";
import { repositories } from "../../shared/infrastructure/repository.factory";

import {
  isAuthenticated,
  hasRole,
} from "../../auth/infrastructure/auth.middleware";
import { UserRole } from "../../auth/domain/user";

import { tournamentUseCases } from "../../tournaments/infrastructure/tournament.routes";
import { playerUseCases } from "../../players/infrastructure/player.routes";
import { teamUseCases } from "../../teams/infrastructure/team.routes";

const router = Router();

// Repositories
const matchRepository = repositories.match;
const roundRepository = repositories.round;
const refereeRepository = repositories.referee;

// Use Cases
const matchUseCases = new MatchUseCases(
  matchRepository,
  roundRepository,
  tournamentUseCases,
  refereeRepository,
  playerUseCases,
  teamUseCases
);

// Controller
const matchController = new MatchController(matchUseCases);

// Routes
router.post(
  "/rounds/:roundId/matches",
  isAuthenticated,
  hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
  matchController.createMatch.bind(matchController),
);
router.get(
  "/tournaments/:tournamentId/matches",
  matchController.getMatchesByTournament.bind(matchController),
);
router.get(
  "/referees/:refereeId/matches",
  matchController.getMatchesByReferee.bind(matchController),
);
router.get("/matches/:id", matchController.getMatchById.bind(matchController));
router.put(
  "/matches/:id/result",
  isAuthenticated,
  hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.REFEREE]),
  matchController.addResultToMatch.bind(matchController),
);
router.put(
  "/matches/:id",
  isAuthenticated,
  hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.REFEREE]),
  matchController.updateMatch.bind(matchController),
);
router.delete(
  "/matches/:id",
  isAuthenticated,
  hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
  matchController.deleteMatch.bind(matchController),
);
router.post(
  "/matches/:id/incidents",
  isAuthenticated,
  hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.REFEREE]),
  matchController.addMatchIncident.bind(matchController),
);
router.delete(
  "/matches/:id/incidents/:incidentId",
  isAuthenticated,
  hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.REFEREE]),
  matchController.deleteMatchIncident.bind(matchController),
);

export default router;
