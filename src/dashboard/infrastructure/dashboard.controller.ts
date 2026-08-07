import { Request, Response } from "express";

import { UserRole } from "../../auth/domain/user";
import { DashboardUseCases } from "../application/dashboard.use-cases";

interface AuthUser {
	id: string;
	email: string;
	role: UserRole;
}

interface AuthRequest extends Request {
	user?: AuthUser;
}

export class DashboardController {
	constructor(private readonly dashboardUseCases: DashboardUseCases) {}

	async getStats(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as AuthRequest).user;
			if (!user) {
				res.status(401).json({ message: "Unauthorized" });

				return;
			}
			const stats = await this.dashboardUseCases.getStats(user.id);
			res.json(stats);
		} catch (error: unknown) {
			res.status(500).json({
				message: "Error fetching dashboard stats",
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}
}
