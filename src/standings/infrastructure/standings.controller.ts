import { Request, Response } from "express";
import { StandingsUseCases } from "../application/standings.use-cases";

export class StandingsController {
    constructor(private readonly standingsUseCases: StandingsUseCases) { }

    async getStandings(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const standings = await this.standingsUseCases.getStandings(id);
            res.json(standings);
        } catch (error: any) {
            if (error.message === "Tournament not found") {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}
