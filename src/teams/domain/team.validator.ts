import { z } from "zod";

export const createTeamSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }),
	playerIds: z.array(z.string()).optional(),
	tournamentId: z.string().optional(),
	placeId: z.string().uuid({ message: "Invalid Place ID" }).optional(),
	coach: z.string().optional().nullable(),
	crestUrl: z.string().url({ message: "Invalid URL" }).optional().or(z.literal("")).nullable(),
	kitColor: z.string().optional().nullable(),
	kitPattern: z
		.enum(["solid", "horizontal-stripes", "vertical-stripes", "quartered", "sash"])
		.optional()
		.nullable(),
	kitColors: z
		.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"))
		.min(1)
		.max(4)
		.optional()
		.nullable(),
	formation: z
		.object({
			gameFormat: z.enum(["5", "7", "11"]),
			formationType: z.string(),
			positions: z.record(z.string(), z.string().nullable()),
		})
		.optional()
		.nullable(),
});

export const updateTeamSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }),
	playerIds: z.array(z.string()).optional(),
	placeId: z.string().uuid({ message: "Invalid Place ID" }).optional().nullable(),
	coach: z.string().optional().nullable(),
	crestUrl: z.string().url({ message: "Invalid URL" }).optional().or(z.literal("")).nullable(),
	kitColor: z.string().optional().nullable(),
	kitPattern: z
		.enum(["solid", "horizontal-stripes", "vertical-stripes", "quartered", "sash"])
		.optional()
		.nullable(),
	kitColors: z
		.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"))
		.min(1)
		.max(4)
		.optional()
		.nullable(),
	formation: z
		.object({
			gameFormat: z.enum(["5", "7", "11"]),
			formationType: z.string(),
			positions: z.record(z.string(), z.string().nullable()),
		})
		.optional()
		.nullable(),
});
