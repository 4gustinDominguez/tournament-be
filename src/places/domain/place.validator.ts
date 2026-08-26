import { z } from "zod";

export const createPlaceSchema = z.object({
	name: z.string().min(1, "Name is required"),
	tournamentId: z.string().uuid("Invalid Tournament ID"),
	location: z.string().optional(),
	capacity: z.number().int().positive().optional(),
	latitude: z.number().min(-90).max(90).optional(),
	longitude: z.number().min(-180).max(180).optional(),
});

export const updatePlaceSchema = z.object({
	name: z.string().min(1).optional(),
	location: z.string().optional(),
	capacity: z.number().int().positive().optional(),
	latitude: z.number().min(-90).max(90).optional(),
	longitude: z.number().min(-180).max(180).optional(),
});
