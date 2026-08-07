import { Request, Response } from "express";

import { AuthUseCases } from "../application/auth.use-cases";

export class AuthController {
	constructor(private readonly authUseCases: AuthUseCases) {}

	async register(req: Request, res: Response): Promise<void> {
		try {
			const user = await this.authUseCases.register(req.body);
			res.status(201).json(user);
		} catch (error: any) {
			res.status(400).json({ message: error.message });
		}
	}

	async login(req: Request, res: Response): Promise<void> {
		try {
			const { email, password } = req.body;
			const result = await this.authUseCases.login(email, password);
			res.status(200).json(result);
		} catch (error: any) {
			res.status(401).json({ message: error.message });
		}
	}

	async me(req: Request, res: Response): Promise<void> {
		try {
			const userId = (req as any).user.id;
			const user = await this.authUseCases.getMe(userId);
			res.status(200).json(user);
		} catch (error: any) {
			res.status(404).json({ message: error.message });
		}
	}

	async updateProfile(req: Request, res: Response): Promise<void> {
		try {
			const userId = (req as any).user.id;
			const { firstName, lastName, currentPassword, newPassword } = req.body;
			const user = await this.authUseCases.updateProfile(userId, {
				firstName,
				lastName,
				currentPassword,
				newPassword,
			});
			res.status(200).json(user);
		} catch (error: any) {
			res.status(400).json({ message: error.message });
		}
	}
}
