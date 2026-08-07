import { Request, Response } from "express";
import { ZodError } from "zod";

import { TournamentUseCases } from "../application/tournament.use-cases";
import { createTournamentSchema } from "../domain/tournament.validator";

export class TournamentController {
	constructor(private readonly tournamentUseCases: TournamentUseCases) {}

	async getAllTournaments(_req: Request, res: Response): Promise<void> {
		try {
			const tournaments = await this.tournamentUseCases.getAllTournaments();
			res.json(tournaments);
		} catch (_error) {
			res.status(500).json({ message: "Error fetching tournaments" });
		}
	}

	async getMyTournaments(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const tournaments = await this.tournamentUseCases.getTournamentsByOwner(user.id);
			res.json(tournaments);
		} catch (_error) {
			res.status(500).json({ message: "Error fetching my tournaments" });
		}
	}

	async createTournament(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const { name, location, startDate, endDate } = createTournamentSchema.parse(req.body);
			const newTournament = await this.tournamentUseCases.createTournament(
				name,
				new Date(startDate),
				new Date(endDate),
				user.id,
				location,
			);
			res.status(201).json(newTournament);
		} catch (error) {
			if (error instanceof ZodError) {
				res.status(400).json({ message: "Validation error", errors: error });
			} else {
				res.status(500).json({ message: "Error creating tournament" });
			}
		}
	}

	async getTournamentById(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const tournament = await this.tournamentUseCases.getTournamentById(id);
			if (tournament) {
				res.json(tournament);
			} else {
				res.status(404).json({ message: "Tournament not found" });
			}
		} catch (_error) {
			res.status(500).json({ message: "Error fetching tournament" });
		}
	}

	async updateTournament(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const { id } = req.params;
			const { name, location, startDate, endDate } = createTournamentSchema.parse(req.body);
			const updatedTournament = await this.tournamentUseCases.updateTournament(
				id,
				name,
				new Date(startDate),
				new Date(endDate),
				user.id,
				user.role,
				location,
			);
			res.json(updatedTournament);
		} catch (error: any) {
			if (error instanceof ZodError) {
				res.status(400).json({ message: "Validation error", errors: error });
			} else if (error.message === "Tournament not found") {
				res.status(404).json({ message: "Tournament not found" });
			} else if (error.message.includes("Unauthorized")) {
				res.status(403).json({ message: error.message });
			} else {
				res.status(500).json({ message: "Error updating tournament" });
			}
		}
	}

	async deleteTournament(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const { id } = req.params;
			await this.tournamentUseCases.deleteTournament(id, user.id, user.role);
			res.status(204).send();
		} catch (error: any) {
			if (error.message === "Tournament not found") {
				res.status(404).json({ message: "Tournament not found" });
			} else if (error.message.includes("Unauthorized")) {
				res.status(403).json({ message: error.message });
			} else {
				res.status(500).json({ message: "Error deleting tournament" });
			}
		}
	}
}
