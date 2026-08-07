import { Request, Response } from "express";

import { RefereeUseCases } from "../application/referee.use-cases";
import { createRefereeSchema, updateRefereeSchema } from "../domain/referee.validator";

export class RefereeController {
	constructor(private readonly refereeUseCases: RefereeUseCases) {}

	async createReferee(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const { name, tournamentIds, userId } = createRefereeSchema.parse(req.body);
			const referee = await this.refereeUseCases.createReferee(
				name,
				tournamentIds,
				user.id,
				user.role,
				userId,
			);
			res.status(201).json(referee);
		} catch (error: any) {
			if (error.message && error.message.includes("Unauthorized")) {
				res.status(403).json({ error: error.message });
			} else {
				res.status(400).json({ error: error.message });
			}
		}
	}

	async getMe(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const referee = await this.refereeUseCases.getRefereeByUserId(user.id);
			if (!referee) {
				res.status(404).json({ error: "Referee profile not found for this user" });

				return;
			}
			res.json(referee);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	async getRefereesByTournament(req: Request, res: Response): Promise<void> {
		try {
			const { tournamentId } = req.query;
			if (typeof tournamentId !== "string") {
				res.status(400).json({ error: "Tournament ID is required" });

				return;
			}
			const referees = await this.refereeUseCases.getRefereesByTournament(tournamentId);
			res.json(referees);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	async getAllReferees(_req: Request, res: Response): Promise<void> {
		try {
			const referees = await this.refereeUseCases.getAllReferees();
			res.json(referees);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	async updateReferee(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const { id } = req.params;
			const { name, tournamentIds, userId } = updateRefereeSchema.parse(req.body);
			const referee = await this.refereeUseCases.updateReferee(
				id,
				name,
				tournamentIds,
				user.id,
				user.role,
				userId,
			);
			res.json(referee);
		} catch (error: any) {
			console.error(error);
			res.status(400).json({ error: error.message });
		}
	}

	async deleteReferee(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const { id } = req.params;
			await this.refereeUseCases.deleteReferee(id, user.id, user.role);
			res.status(204).send();
		} catch (error: any) {
			if (error.message && error.message.includes("Unauthorized")) {
				res.status(403).json({ error: error.message });
			} else {
				res.status(500).json({ error: error.message });
			}
		}
	}
}
