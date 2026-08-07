import { Router } from "express";

import { isAuthenticated } from "../../auth/infrastructure/auth.middleware";
import { repositories } from "../../shared/infrastructure/repository.factory";
import { tournamentUseCases } from "../../tournaments/infrastructure/tournament.routes";
import { DashboardUseCases } from "../application/dashboard.use-cases";
import { DashboardController } from "./dashboard.controller";

const router = Router();

const dashboardUseCases = new DashboardUseCases(
	tournamentUseCases,
	repositories.team,
	repositories.match,
);
const dashboardController = new DashboardController(dashboardUseCases);

// Routes
router.get(
	"/dashboard/stats",
	isAuthenticated,
	dashboardController.getStats.bind(dashboardController),
);

export default router;
