import { Router } from "express";

import { UserRole } from "../../auth/domain/user";
import { hasRole, isAuthenticated } from "../../auth/infrastructure/auth.middleware";
import { repositories } from "../../shared/infrastructure/repository.factory";
import { tournamentUseCases } from "../../tournaments/infrastructure/tournament.routes";
import { PlaceUseCases } from "../application/place.use-cases";
import { PlaceController } from "./place.controller";

const router = Router();

const placeRepository = repositories.place;
const placeUseCases = new PlaceUseCases(placeRepository, tournamentUseCases);
const placeController = new PlaceController(placeUseCases);

// Public Routes
router.get("/places", placeController.getAllPlaces.bind(placeController));

// Protected Routes
router.post(
	"/places",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
	placeController.createPlace.bind(placeController),
);
router.delete(
	"/places/:id",
	isAuthenticated,
	hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]),
	placeController.deletePlace.bind(placeController),
);

export default router;
