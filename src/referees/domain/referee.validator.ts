import { z } from 'zod';

export const createRefereeSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    tournamentIds: z.array(z.string().uuid({ message: "Invalid Tournament ID" })),
    userId: z.string().uuid().optional(),
});

export const updateRefereeSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    tournamentIds: z.array(z.string().uuid({ message: "Invalid Tournament ID" })),
    userId: z.string().uuid().optional(),
});
