import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  playerIds: z.array(z.string()).optional(),
  tournamentId: z.string().optional(),
  placeId: z.string().uuid({ message: 'Invalid Place ID' }).optional(),
  coach: z.string().optional(),
  crestUrl: z.string().url({ message: 'Invalid URL' }).optional().or(z.literal('')),
  kitColor: z.string().optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  playerIds: z.array(z.string()).optional(),
  placeId: z.string().uuid({ message: 'Invalid Place ID' }).optional(),
  coach: z.string().optional(),
  crestUrl: z.string().url({ message: 'Invalid URL' }).optional().or(z.literal('')),
  kitColor: z.string().optional(),
});
