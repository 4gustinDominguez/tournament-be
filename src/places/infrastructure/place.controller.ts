import { Request, Response } from "express";
import { PlaceUseCases } from "../application/place.use-cases";
import { createPlaceSchema } from "../domain/place.validator";
import { ZodError } from "zod";

export class PlaceController {
    constructor(private readonly placeUseCases: PlaceUseCases) { }

    async createPlace(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as any).user;
            const { name, tournamentId, location, capacity } = createPlaceSchema.parse(req.body);
            const newPlace = await this.placeUseCases.createPlace(name, tournamentId, user.id, user.role, location, capacity);
            res.status(201).json(newPlace);
        } catch (error: any) {
            if (error instanceof ZodError) {
                res.status(400).json({ message: "Validation error", errors: error });
            } else if (error.message.includes("Unauthorized")) {
                res.status(403).json({ message: error.message });
            } else {
                res
                    .status(500)
                    .json({ message: "Error creating place", error: error.message });
            }
        }
    }

    async getAllPlaces(req: Request, res: Response): Promise<void> {
        try {
            const { tournamentId } = req.query;
            const places = await this.placeUseCases.getAllPlaces(tournamentId as string);
            res.json(places);
        } catch (error) {
            res.status(500).json({ message: "Error fetching places" });
        }
    }
}
