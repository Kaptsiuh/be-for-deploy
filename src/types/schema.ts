import { z } from "zod";

export const todoCreateDto = z.object({ name: z.string().min(3).max(255), message: z.string().min(3).max(100000) });
