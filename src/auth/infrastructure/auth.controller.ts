import { Request, Response } from "express";

import { AuthUseCases } from "../application/auth.use-cases";
import { UserRole } from "../domain/user";

interface AuthUser {
	id: string;
	email: string;
	role: UserRole;
}

interface AuthRequest extends Request {
	user?: AuthUser;
}

export class AuthController {
	constructor(private readonly authUseCases: AuthUseCases) {}

	async register(req: Request, res: Response): Promise<void> {
		try {
			const user = await this.authUseCases.register(req.body);
			res.status(201).json(user);
		} catch (error: unknown) {
			res.status(400).json({ message: error instanceof Error ? error.message : String(error) });
		}
	}

	async login(req: Request, res: Response): Promise<void> {
		try {
			const { email, password } = req.body;
			const result = await this.authUseCases.login(email, password);
			res.status(200).json(result);
		} catch (error: unknown) {
			res.status(401).json({ message: error instanceof Error ? error.message : String(error) });
		}
	}

	async me(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as AuthRequest).user;
			if (!user) {
				res.status(401).json({ message: "Unauthorized" });

				return;
			}
			const userId = user.id;
			const result = await this.authUseCases.getMe(userId);
			res.status(200).json(result);
		} catch (error: unknown) {
			res.status(404).json({ message: error instanceof Error ? error.message : String(error) });
		}
	}

	async updateProfile(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as AuthRequest).user;
			if (!user) {
				res.status(401).json({ message: "Unauthorized" });

				return;
			}
			const { firstName, lastName, currentPassword, newPassword, locale } = req.body;
			const result = await this.authUseCases.updateProfile(user.id, {
				firstName,
				lastName,
				currentPassword,
				newPassword,
				locale,
			});
			res.status(200).json(result);
		} catch (error: unknown) {
			res.status(400).json({ message: error instanceof Error ? error.message : String(error) });
		}
	}

	async forgotPassword(req: Request, res: Response): Promise<void> {
		try {
			const { email, locale } = req.body;
			if (!email) {
				res.status(400).json({ message: "Email is required" });

				return;
			}
			await this.authUseCases.forgotPassword(email, locale);
			res.status(200).json({ message: "If the email exists, a reset link has been sent" });
		} catch (error: unknown) {
			res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
		}
	}

	async resetPassword(req: Request, res: Response): Promise<void> {
		try {
			const { token, newPassword } = req.body;
			if (!token || !newPassword) {
				res.status(400).json({ message: "Token and newPassword are required" });

				return;
			}
			await this.authUseCases.resetPassword(token, newPassword);
			res.status(200).json({ message: "Password reset successfully" });
		} catch (error: unknown) {
			res.status(400).json({ message: error instanceof Error ? error.message : String(error) });
		}
	}

	async verifyEmail(req: Request, res: Response): Promise<void> {
		try {
			const { token } = req.body;
			if (!token) {
				res.status(400).json({ message: "Token is required" });

				return;
			}
			await this.authUseCases.verifyEmail(token);
			res.status(200).json({ message: "Email verified successfully" });
		} catch (error: unknown) {
			res.status(400).json({ message: error instanceof Error ? error.message : String(error) });
		}
	}
}
