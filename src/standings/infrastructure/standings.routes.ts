import { Router } from "express";
import { StandingsController } from "./standings.controller";
import { StandingsUseCases } from "../application/standings.use-cases";
import { repositories } from "../../shared/infrastructure/repository.factory";

const router = Router();

// Repositories
const matchRepository = repositories.match;
const teamRepository = repositories.team;
const tournamentRepository = repositories.tournament;

// Use Cases
const standingsUseCases = new StandingsUseCases(
    matchRepository,
    teamRepository,
    tournamentRepository
);

// Controller
const standingsController = new StandingsController(standingsUseCases);

// Routes
router.get(
    "/tournaments/:id/standings",
    standingsController.getStandings.bind(standingsController)
);

export default router;
