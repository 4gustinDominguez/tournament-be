import { Router } from "express";

import { RefereeUseCases } from "../../referees/application/referee.use-cases";
import { EmailService } from "../../shared/domain/email.service";
import { MailjetEmailService } from "../../shared/infrastructure/mailjet-email.service";
import { repositories } from "../../shared/infrastructure/repository.factory";
import { tournamentUseCases } from "../../tournaments/infrastructure/tournament.routes";
import { AuthUseCases } from "../application/auth.use-cases";
import { AuthController } from "./auth.controller";
import { isAuthenticated } from "./auth.middleware";

const router = Router();

// Repositories
const userRepository = repositories.user;

// Email Service (optional — fails silently if not configured)
let emailService: EmailService | null = null;
if (process.env.MJ_APIKEY_PUBLIC && process.env.MJ_APIKEY_PRIVATE) {
	emailService = new MailjetEmailService();
	console.log("[mailjet] email service enabled");
} else {
	console.log("[mailjet] MJ_APIKEY_PUBLIC/MJ_APIKEY_PRIVATE not set, emails disabled");
}

// Use Cases
const refereeRepository = repositories.referee;
const refereeUseCases = new RefereeUseCases(refereeRepository, tournamentUseCases);
const authUseCases = new AuthUseCases(userRepository, emailService, refereeUseCases);

// Controller
const authController = new AuthController(authUseCases);

// Routes
router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.get("/me", isAuthenticated, authController.me.bind(authController));
router.patch("/profile", isAuthenticated, authController.updateProfile.bind(authController));
router.post("/forgot-password", authController.forgotPassword.bind(authController));
router.post("/reset-password", authController.resetPassword.bind(authController));
router.post("/verify-email", authController.verifyEmail.bind(authController));

export default router;
