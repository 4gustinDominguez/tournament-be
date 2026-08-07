import { z } from "zod";

export const createPlaceSchema = z.object({
	name: z.string().min(1, "Name is required"),
	tournamentId: z.string().uuid("Invalid Tournament ID"),
	location: z.string().optional(),
	capacity: z.number().int().positive().optional(),
});
