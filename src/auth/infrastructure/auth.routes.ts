import { Router } from "express";

import { RefereeUseCases } from "../../referees/application/referee.use-cases";
import { repositories } from "../../shared/infrastructure/repository.factory";
import { tournamentUseCases } from "../../tournaments/infrastructure/tournament.routes";
import { AuthUseCases } from "../application/auth.use-cases";
import { AuthController } from "./auth.controller";
import { isAuthenticated } from "./auth.middleware";

const router = Router();

// Repositories
const userRepository = repositories.user;

// Use Cases
const refereeRepository = repositories.referee;
const refereeUseCases = new RefereeUseCases(refereeRepository, tournamentUseCases);
const authUseCases = new AuthUseCases(userRepository, refereeUseCases);

// Controller
const authController = new AuthController(authUseCases);

// Routes
router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.get("/me", isAuthenticated, authController.me.bind(authController));
router.patch("/profile", isAuthenticated, authController.updateProfile.bind(authController));

export default router;
