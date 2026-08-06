import { Router } from "express";
import { PlaceController } from "./place.controller";
import { PlaceUseCases } from "../application/place.use-cases";
import { repositories } from "../../shared/infrastructure/repository.factory";
import { isAuthenticated, hasRole } from "../../auth/infrastructure/auth.middleware";
import { UserRole } from "../../auth/domain/user";
import { tournamentUseCases } from "../../tournaments/infrastructure/tournament.routes";

const router = Router();

const placeRepository = repositories.place;
const placeUseCases = new PlaceUseCases(placeRepository, tournamentUseCases);
const placeController = new PlaceController(placeUseCases);

// Public Routes
router.get("/places", placeController.getAllPlaces.bind(placeController));

// Protected Routes
router.post("/places", isAuthenticated, hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]), placeController.createPlace.bind(placeController));
router.delete("/places/:id", isAuthenticated, hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]), placeController.deletePlace.bind(placeController));

export default router;
