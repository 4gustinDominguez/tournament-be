import { z } from "zod";

export const createRoundSchema = z.object({
    name: z.string().min(1, "Name is required"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});
