import { Request, Response } from "express";
import { GeneratorUseCases } from "../application/generator.use-cases";
import { z } from "zod";

const generationSchema = z.object({
    tournamentName: z.string().min(3),
    startDate: z.string().transform((str) => new Date(str)),
    endDate: z.string().transform((str) => new Date(str)),
    teamsCount: z.coerce.number().int().min(2).max(20),
    playersPerTeam: z.coerce.number().int().min(5).max(25),
    placesCount: z.coerce.number().int().min(0).max(10),
    refereesCount: z.coerce.number().int().min(0).max(10),
});

export class GeneratorController {
    constructor(private readonly generatorUseCases: GeneratorUseCases) { }

    async generate(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as any).user;
            const params = generationSchema.parse(req.body);

            const tournament = await this.generatorUseCases.generate(
                params,
                user.id,
                user.role
            );

            res.status(201).json({
                message: "Tournament generated successfully",
                tournamentId: tournament.id,
                tournament
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ message: "Validation error", errors: error.issues });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}
