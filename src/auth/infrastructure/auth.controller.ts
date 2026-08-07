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
			const { firstName, lastName, currentPassword, newPassword } = req.body;
			const result = await this.authUseCases.updateProfile(user.id, {
				firstName,
				lastName,
				currentPassword,
				newPassword,
			});
			res.status(200).json(result);
		} catch (error: unknown) {
			res.status(400).json({ message: error instanceof Error ? error.message : String(error) });
		}
	}
}
