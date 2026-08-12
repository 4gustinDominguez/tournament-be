import { z } from "zod";

const socialMediaSchema = z
	.object({
		instagram: z.string().url().optional().or(z.literal("")),
		twitter: z.string().url().optional().or(z.literal("")),
		facebook: z.string().url().optional().or(z.literal("")),
	})
	.optional();

const statisticsSchema = z
	.object({
		matchesPlayed: z.number().int().min(0).default(0),
		goals: z.number().int().min(0).default(0),
		assists: z.number().int().min(0).default(0),
		yellowCards: z.number().int().min(0).default(0),
		redCards: z.number().int().min(0).default(0),
		minutesPlayed: z.number().int().min(0).default(0),
	})
	.optional();

export const createPlayerSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }),
	nickname: z.string().min(1, { message: "Nickname is required" }),
	dorsal: z.number().int().min(0).max(99).nullable().optional(),
	teamId: z.string().optional(),
	position: z.string().optional(),
	height: z.number().positive().optional().nullable(),
	weight: z.number().positive().optional().nullable(),
	photoUrl: z.string().url().optional().or(z.literal("")).nullable(),
	socialMedia: socialMediaSchema,
	statistics: statisticsSchema,
	userId: z.string().uuid().nullable().optional(),
});

export const updatePlayerSchema = z
	.object({
		name: z.string().min(1).optional(),
		nickname: z.string().min(1).optional(),
		dorsal: z.number().int().min(0).max(99).nullable().optional(),
		position: z.string().optional(),
		height: z.number().positive().optional().nullable(),
		weight: z.number().positive().optional().nullable(),
		photoUrl: z.string().url().optional().or(z.literal("")).nullable(),
		socialMedia: socialMediaSchema,
		statistics: statisticsSchema,
		userId: z.string().uuid().nullable().optional(),
		fullRegistered: z.boolean().optional(),
	})
	.partial();
