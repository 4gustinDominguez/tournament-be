import { Request, Response } from "express";

import { UserRole } from "../../auth/domain/user";
import { RefereeUseCases } from "../application/referee.use-cases";
import { createRefereeSchema, updateRefereeSchema } from "../domain/referee.validator";

interface AuthUser {
	id: string;
	email: string;
	role: UserRole;
}

interface AuthRequest extends Request {
	user?: AuthUser;
}

export class RefereeController {
	constructor(private readonly refereeUseCases: RefereeUseCases) {}

	async createReferee(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as AuthRequest).user;
			if (!user) {
				res.status(401).json({ message: "Unauthorized" });

				return;
			}
			const { name, tournamentIds, userId, photoUrl } = createRefereeSchema.parse(req.body);
			const referee = await this.refereeUseCases.createReferee(
				name,
				tournamentIds,
				user.id,
				user.role,
				userId ?? undefined,
				photoUrl ?? undefined,
			);
			res.status(201).json(referee);
		} catch (error: unknown) {
			if (error instanceof Error && error.message.includes("Unauthorized")) {
				res.status(403).json({ error: error.message });
			} else {
				res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
			}
		}
	}

	async getMe(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as AuthRequest).user;
			if (!user) {
				res.status(401).json({ message: "Unauthorized" });

				return;
			}
			const referee = await this.refereeUseCases.getRefereeByUserId(user.id);
			if (!referee) {
				res.status(404).json({ error: "Referee profile not found for this user" });

				return;
			}
			res.json(referee);
		} catch (error: unknown) {
			res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
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
		} catch (error: unknown) {
			res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
		}
	}

	async getAllReferees(_req: Request, res: Response): Promise<void> {
		try {
			const referees = await this.refereeUseCases.getAllReferees();
			res.json(referees);
		} catch (error: unknown) {
			res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
		}
	}

	async updateReferee(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as AuthRequest).user;
			if (!user) {
				res.status(401).json({ message: "Unauthorized" });

				return;
			}
			const { id } = req.params;
			const { name, tournamentIds, userId, photoUrl } = updateRefereeSchema.parse(req.body);
			const referee = await this.refereeUseCases.updateReferee(
				id,
				name,
				tournamentIds,
				user.id,
				user.role,
				userId ?? undefined,
				photoUrl ?? undefined,
			);
			res.json(referee);
		} catch (error: unknown) {
			console.error(error);
			res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
		}
	}

	async deleteReferee(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as AuthRequest).user;
			if (!user) {
				res.status(401).json({ message: "Unauthorized" });

				return;
			}
			const { id } = req.params;
			await this.refereeUseCases.deleteReferee(id, user.id, user.role);
			res.status(204).send();
		} catch (error: unknown) {
			if (error instanceof Error && error.message.includes("Unauthorized")) {
				res.status(403).json({ error: error.message });
			} else {
				res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
			}
		}
	}
}
