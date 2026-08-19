import { z } from "zod";

export const createMatchSchema = z.object({
	teamAId: z.string().uuid({ message: "Invalid Team A ID" }),
	teamBId: z.string().uuid({ message: "Invalid Team B ID" }),
	date: z.string().datetime(),
	placeId: z.string().uuid().optional(),
	refereeId: z.string().uuid().optional(),
	status: z.enum(["scheduled", "live", "completed"]).default("scheduled"),
});

export const matchIncidentSchema = z.object({
	id: z.string().uuid(),
	type: z.enum(["GOAL", "YELLOW_CARD", "RED_CARD", "SUBSTITUTION"]),
	playerId: z.string().uuid(),
	minute: z.number().int().min(0).max(120),
	teamId: z.string().uuid(),
	details: z.string().optional(),
});

export const addMatchIncidentSchema = matchIncidentSchema.omit({ id: true });

export const updateMatchSchema = z.object({
	teamAId: z.string().uuid().optional(),
	teamBId: z.string().uuid().optional(),
	date: z.string().datetime().optional(),
	placeId: z.string().uuid().optional(),
	refereeId: z.string().uuid().optional(),
	status: z.enum(["scheduled", "live", "completed"]).optional(),
	result: z
		.object({
			scoreA: z.number().int().min(0),
			scoreB: z.number().int().min(0),
		})
		.nullable()
		.optional(),
	incidents: z.array(matchIncidentSchema).optional(),
	notes: z.string().nullable().optional(),
	presentPlayerIds: z.array(z.string().uuid()).optional(),
	timerElapsedSeconds: z.number().int().min(0).optional(),
	timerRunning: z.boolean().optional(),
	timerStartedAt: z.string().datetime().nullable().optional(),
});

export const addResultSchema = z.object({
	scoreA: z.number().int().min(0),
	scoreB: z.number().int().min(0),
});
