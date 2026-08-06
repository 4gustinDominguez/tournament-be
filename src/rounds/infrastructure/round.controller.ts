import { Request, Response } from "express";
import { RoundUseCases } from "../application/round.use-cases";
import { createRoundSchema } from "../domain/round.validator";
import { ZodError } from "zod";

export class RoundController {
    constructor(private readonly roundUseCases: RoundUseCases) { }

    async createRound(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as any).user;
            const { tournamentId } = req.params;
            const { name, startDate, endDate } = createRoundSchema.parse(req.body);

            const newRound = await this.roundUseCases.createRound(
                tournamentId,
                name,
                user.id,
                user.role,
                startDate ? new Date(startDate) : undefined,
                endDate ? new Date(endDate) : undefined
            );

            res.status(201).json(newRound);
        } catch (error: any) {
            if (error instanceof ZodError) {
                res.status(400).json({ message: "Validation error", errors: error });
            } else if (error.message.includes("Unauthorized")) {
                res.status(403).json({ message: error.message });
            } else {
                res.status(500).json({ message: error.message });
            }
        }
    }

    async getRoundsByTournament(req: Request, res: Response): Promise<void> {
        try {
            const { tournamentId } = req.params;
            const rounds = await this.roundUseCases.getRoundsByTournament(tournamentId);
            res.json(rounds);
        } catch (error) {
            res.status(500).json({ message: "Error fetching rounds" });
        }
    }
}
