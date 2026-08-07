import { Request, Response } from "express";
import { ZodError } from "zod";

import { TeamUseCases } from "../application/team.use-cases";
import { createTeamSchema, updateTeamSchema } from "../domain/team.validator";

export class TeamController {
	constructor(private readonly teamUseCases: TeamUseCases) {}

	async getAllTeams(req: Request, res: Response): Promise<void> {
		try {
			const { tournamentId } = req.query;
			const teams = await this.teamUseCases.getAllTeams(tournamentId as string);
			res.json(teams);
		} catch (_error) {
			res.status(500).json({ message: "Error fetching teams" });
		}
	}

	async createTeam(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const { name, playerIds, tournamentId, placeId, coach, crestUrl, kitColor } =
				createTeamSchema.parse(req.body);

			if (!tournamentId) {
				res.status(400).json({ message: "Tournament ID is required" });

				return;
			}

			const newTeam = await this.teamUseCases.createTeam(
				name,
				playerIds ?? [],
				tournamentId,
				user.id,
				user.role,
				placeId,
				coach,
				crestUrl,
				kitColor,
			);
			res.status(201).json(newTeam);
		} catch (error: any) {
			if (error instanceof ZodError) {
				res.status(400).json({ message: "Validation error", errors: error });
			} else if (error.message.includes("Unauthorized")) {
				res.status(403).json({ message: error.message });
			} else {
				res.status(500).json({ message: "Error creating team", error: error.message });
			}
		}
	}

	async getTeamById(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const team = await this.teamUseCases.getTeamById(id);
			if (team) {
				res.json(team);
			} else {
				res.status(404).json({ message: "Team not found" });
			}
		} catch (_error) {
			res.status(500).json({ message: "Error fetching team" });
		}
	}

	async updateTeam(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const { id } = req.params;
			const { name, playerIds, placeId, coach, crestUrl, kitColor } = updateTeamSchema.parse(
				req.body,
			);
			const updatedTeam = await this.teamUseCases.updateTeam(
				id,
				name,
				user.id,
				user.role,
				playerIds,
				placeId,
				coach,
				crestUrl,
				kitColor,
			);
			if (updatedTeam) {
				res.json(updatedTeam);
			} else {
				res.status(404).json({ message: "Team not found" });
			}
		} catch (error) {
			if (error instanceof ZodError) {
				res.status(400).json({ message: "Validation error", errors: error });
			} else if (error instanceof Error && error.message.includes("Unauthorized")) {
				res.status(403).json({ message: error.message });
			} else {
				res.status(500).json({ message: "Error updating team" });
			}
		}
	}

	async deleteTeam(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const { id } = req.params;
			await this.teamUseCases.deleteTeam(id, user.id, user.role);
			res.status(204).send();
		} catch (error: any) {
			if (error.message && error.message.includes("Unauthorized")) {
				res.status(403).json({ message: error.message });
			} else {
				res.status(500).json({ message: "Error deleting team" });
			}
		}
	}
}
