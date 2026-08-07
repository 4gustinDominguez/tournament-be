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
	teamId: z.string().optional(),
	position: z.string().optional(),
	height: z.number().positive().optional(),
	weight: z.number().positive().optional(),
	photoUrl: z.string().url().optional().or(z.literal("")),
	socialMedia: socialMediaSchema,
	statistics: statisticsSchema,
});

export const updatePlayerSchema = z
	.object({
		name: z.string().min(1).optional(),
		nickname: z.string().min(1).optional(),
		position: z.string().optional(),
		height: z.number().positive().optional(),
		weight: z.number().positive().optional(),
		photoUrl: z.string().url().optional().or(z.literal("")),
		socialMedia: socialMediaSchema,
		statistics: statisticsSchema,
	})
	.partial();
