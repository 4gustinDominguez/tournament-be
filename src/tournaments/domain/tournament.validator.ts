import { z } from 'zod';

export const createTournamentSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  location: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Start date must be in YYYY-MM-DD format" }),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "End date must be in YYYY-MM-DD format" }),
});
