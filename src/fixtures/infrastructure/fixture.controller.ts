import { Request, Response } from "express";

import { FixtureUseCases } from "../application/fixture.use-cases";

export class FixtureController {
	constructor(private readonly fixtureUseCases: FixtureUseCases) {}

	async generate(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const { tournamentId } = req.params;
			await this.fixtureUseCases.generateRoundRobin(tournamentId, user.id, user.role);
			res.status(201).json({ message: "Fixture generated successfully" });
		} catch (error: any) {
			if (error.message === "Tournament not found") {
				res.status(404).json({ message: error.message });
			} else if (error.message.includes("Unauthorized")) {
				res.status(403).json({ message: error.message });
			} else {
				res.status(400).json({ message: error.message });
			}
		}
	}
}
