import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthUseCases } from "../application/auth.use-cases";
import { repositories } from "../../shared/infrastructure/repository.factory";
import { isAuthenticated } from "./auth.middleware";
import { RefereeUseCases } from "../../referees/application/referee.use-cases";
import { tournamentUseCases } from "../../tournaments/infrastructure/tournament.routes";

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

export default router;
