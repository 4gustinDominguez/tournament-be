import { Request, Response } from "express";

import { DashboardUseCases } from "../application/dashboard.use-cases";

export class DashboardController {
	constructor(private readonly dashboardUseCases: DashboardUseCases) {}

	async getStats(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const stats = await this.dashboardUseCases.getStats(user.id);
			res.json(stats);
		} catch (error: any) {
			res.status(500).json({ message: "Error fetching dashboard stats", error: error.message });
		}
	}
}
