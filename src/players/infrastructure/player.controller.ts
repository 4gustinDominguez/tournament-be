import { Request, Response } from "express";
import { ZodError } from "zod";

import { UserRole } from "../../auth/domain/user";
import { PlayerUseCases } from "../application/player.use-cases";
import { createPlayerSchema, updatePlayerSchema } from "../domain/player.validator";

interface AuthUser {
	id: string;
	email: string;
	role: UserRole;
}

interface AuthRequest extends Request {
	user?: AuthUser;
}

export class PlayerController {
	constructor(private readonly playerUseCases: PlayerUseCases) {}

	async getAllPlayers(_req: Request, res: Response): Promise<void> {
		try {
			const players = await this.playerUseCases.getAllPlayers();
			res.json(players);
		} catch (_error) {
			res.status(500).json({ message: "Error fetching players" });
		}
	}

	async createPlayer(req: Request, res: Response): Promise<void> {
		try {
			const validatedData = createPlayerSchema.parse(req.body);
			const {
				name,
				nickname,
				teamId,
				position,
				height,
				weight,
				photoUrl,
				socialMedia,
				statistics,
				dorsal,
				userId,
			} = validatedData;

			const newPlayer = await this.playerUseCases.createPlayer(
				name,
				nickname,
				teamId,
				position ?? undefined,
				height ?? undefined,
				weight ?? undefined,
				photoUrl ?? undefined,
				socialMedia ?? undefined,
				statistics ?? undefined,
				dorsal ?? undefined,
				userId ?? undefined,
			);
			res.status(201).json(newPlayer);
		} catch (error: unknown) {
			if (error instanceof ZodError) {
				res.status(400).json({ message: "Validation error", errors: error });
			} else {
				res.status(500).json({ message: "Error creating player" });
			}
		}
	}

	async getPlayerById(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const player = await this.playerUseCases.getPlayerById(id);
			if (player) {
				res.json(player);
			} else {
				res.status(404).json({ message: "Player not found" });
			}
		} catch (_error) {
			res.status(500).json({ message: "Error fetching player" });
		}
	}

	async getMe(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as AuthRequest).user;
			if (!user) {
				res.status(401).json({ message: "Unauthorized" });

				return;
			}
			const player = await this.playerUseCases.getPlayerByUserId(user.id);
			if (!player) {
				res.status(404).json({ error: "Player profile not found for this user" });

				return;
			}
			res.json(player);
		} catch (error: unknown) {
			res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
		}
	}

	async updatePlayer(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as AuthRequest).user;
			const { id } = req.params;
			const raw = updatePlayerSchema.parse(req.body);
			const updates = Object.fromEntries(
				Object.entries(raw).filter(([_, v]) => v !== null),
			) as Partial<Omit<import("../../players/domain/player").Player, "id" | "tournaments">>;
			const updatedPlayer = await this.playerUseCases.updatePlayer(id, updates, user?.id);
			res.json(updatedPlayer);
		} catch (error: unknown) {
			if (error instanceof ZodError) {
				res.status(400).json({ message: "Validation error", errors: error });
			} else if (error instanceof Error && error.message === "Player not found") {
				res.status(404).json({ message: "Player not found" });
			} else {
				res.status(500).json({ message: "Error updating player" });
			}
		}
	}

	async deletePlayer(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			await this.playerUseCases.deletePlayer(id);
			res.status(204).send();
		} catch (error: unknown) {
			if (error instanceof Error && error.message === "Player not found") {
				res.status(404).json({ message: "Player not found" });
			} else {
				res.status(500).json({ message: "Error deleting player" });
			}
		}
	}
}
