import { Request, Response } from "express";
import { ZodError } from "zod";

import { UserRole } from "../../auth/domain/user";
import { PlaceUseCases } from "../application/place.use-cases";
import { createPlaceSchema, updatePlaceSchema } from "../domain/place.validator";

interface AuthUser {
	id: string;
	email: string;
	role: UserRole;
}

interface AuthRequest extends Request {
	user?: AuthUser;
}

export class PlaceController {
	constructor(private readonly placeUseCases: PlaceUseCases) {}

	async createPlace(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as AuthRequest).user;
			if (!user) {
				res.status(401).json({ message: "Unauthorized" });

				return;
			}
			const { name, tournamentId, location, capacity, latitude, longitude } =
				createPlaceSchema.parse(req.body);
			const newPlace = await this.placeUseCases.createPlace(
				name,
				tournamentId,
				user.id,
				user.role,
				location,
				capacity,
				latitude,
				longitude,
			);
			res.status(201).json(newPlace);
		} catch (error: unknown) {
			if (error instanceof ZodError) {
				res.status(400).json({ message: "Validation error", errors: error });
			} else if (error instanceof Error && error.message.includes("Unauthorized")) {
				res.status(403).json({ message: error.message });
			} else {
				res.status(500).json({
					message: "Error creating place",
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}
	}

	async getAllPlaces(req: Request, res: Response): Promise<void> {
		try {
			const { tournamentId } = req.query;
			const places = await this.placeUseCases.getAllPlaces(tournamentId as string);
			res.json(places);
		} catch (_error) {
			res.status(500).json({ message: "Error fetching places" });
		}
	}

	async updatePlace(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as AuthRequest).user;
			if (!user) {
				res.status(401).json({ message: "Unauthorized" });

				return;
			}
			const { id } = req.params;
			const updates = updatePlaceSchema.parse(req.body);
			const updatedPlace = await this.placeUseCases.updatePlace(id, user.id, user.role, updates);
			res.json(updatedPlace);
		} catch (error: unknown) {
			if (error instanceof ZodError) {
				res.status(400).json({ message: "Validation error", errors: error });
			} else if (error instanceof Error && error.message.includes("Unauthorized")) {
				res.status(403).json({ message: error.message });
			} else if (error instanceof Error && error.message.includes("not found")) {
				res.status(404).json({ message: error.message });
			} else {
				res.status(500).json({
					message: "Error updating place",
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}
	}

	async deletePlace(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as AuthRequest).user;
			if (!user) {
				res.status(401).json({ message: "Unauthorized" });

				return;
			}
			const { id } = req.params;
			await this.placeUseCases.deletePlace(id, user.id, user.role);
			res.status(204).send();
		} catch (error: unknown) {
			if (error instanceof Error && error.message.includes("Unauthorized")) {
				res.status(403).json({ message: error.message });
			} else if (error instanceof Error && error.message.includes("not found")) {
				res.status(404).json({ message: error.message });
			} else {
				res.status(500).json({
					message: "Error deleting place",
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}
	}
}
