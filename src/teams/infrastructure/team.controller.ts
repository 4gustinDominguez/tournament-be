import { Request, Response } from "express";
import { ZodError } from "zod";

import { UserRole } from "../../auth/domain/user";
import { TeamUseCases } from "../application/team.use-cases";
import { createTeamSchema, updateTeamSchema } from "../domain/team.validator";

interface AuthUser {
	id: string;
	email: string;
	role: UserRole;
}

interface AuthRequest extends Request {
	user?: AuthUser;
}

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
			const user = (req as AuthRequest).user;
			if (!user) {
				res.status(401).json({ message: "Unauthorized" });

				return;
			}
			const {
				name,
				playerIds,
				tournamentId,
				placeId,
				coach,
				crestUrl,
				kitColor,
				kitPattern,
				kitColors,
				formation,
			} = createTeamSchema.parse(req.body);

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
				coach ?? undefined,
				crestUrl ?? undefined,
				kitColor ?? undefined,
				kitPattern ?? undefined,
				kitColors ?? undefined,
				formation ?? undefined,
			);
			res.status(201).json(newTeam);
		} catch (error: unknown) {
			if (error instanceof ZodError) {
				res.status(400).json({ message: "Validation error", errors: error });
			} else if (error instanceof Error && error.message.includes("Unauthorized")) {
				res.status(403).json({ message: error.message });
			} else {
				res.status(500).json({
					message: "Error creating team",
					error: error instanceof Error ? error.message : String(error),
				});
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
			const user = (req as AuthRequest).user;
			if (!user) {
				res.status(401).json({ message: "Unauthorized" });

				return;
			}
			const { id } = req.params;
			const {
				name,
				playerIds,
				placeId,
				coach,
				crestUrl,
				kitColor,
				kitPattern,
				kitColors,
				formation,
			} = updateTeamSchema.parse(req.body);
			const updatedTeam = await this.teamUseCases.updateTeam(
				id,
				name,
				user.id,
				user.role,
				playerIds,
				placeId ?? undefined,
				coach ?? undefined,
				crestUrl ?? undefined,
				kitColor ?? undefined,
				kitPattern ?? undefined,
				kitColors ?? undefined,
				formation ?? undefined,
			);
			if (updatedTeam) {
				res.json(updatedTeam);
			} else {
				res.status(404).json({ message: "Team not found" });
			}
		} catch (error: unknown) {
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
			const user = (req as AuthRequest).user;
			if (!user) {
				res.status(401).json({ message: "Unauthorized" });

				return;
			}
			const { id } = req.params;
			await this.teamUseCases.deleteTeam(id, user.id, user.role);
			res.status(204).send();
		} catch (error: unknown) {
			if (error instanceof Error && error.message.includes("Unauthorized")) {
				res.status(403).json({ message: error.message });
			} else {
				res.status(500).json({ message: "Error deleting team" });
			}
		}
	}
}
