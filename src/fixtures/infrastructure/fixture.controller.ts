import { Request, Response } from "express";

import { UserRole } from "../../auth/domain/user";
import { FixtureUseCases } from "../application/fixture.use-cases";

interface AuthUser {
	id: string;
	email: string;
	role: UserRole;
}

interface AuthRequest extends Request {
	user?: AuthUser;
}

export class FixtureController {
	constructor(private readonly fixtureUseCases: FixtureUseCases) {}

	async generate(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as AuthRequest).user;
			if (!user) {
				res.status(401).json({ message: "Unauthorized" });

				return;
			}
			const { tournamentId } = req.params;
			await this.fixtureUseCases.generateRoundRobin(tournamentId, user.id, user.role);
			res.status(201).json({ message: "Fixture generated successfully" });
		} catch (error: unknown) {
			if (error instanceof Error && error.message === "Tournament not found") {
				res.status(404).json({ message: error.message });
			} else if (error instanceof Error && error.message.includes("Unauthorized")) {
				res.status(403).json({ message: error.message });
			} else {
				res.status(400).json({ message: error instanceof Error ? error.message : String(error) });
			}
		}
	}
}
