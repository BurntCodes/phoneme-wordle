import { z } from "zod";

export const wordListCreateSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(200),
});

export const wordListUpdateSchema = wordListCreateSchema.partial();

export const wordInputSchema = z.object({
  text: z.string().trim().min(1, "text is required").max(100),
  phonemes: z
    .array(z.string().trim().min(1))
    .min(1, "at least one phoneme is required")
    .max(20),
});

export const wordUpdateSchema = wordInputSchema.partial();

export const activityCreateSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(200),
  type: z.enum(["WORDLE", "WORD_SEARCH"]),
  wordListId: z.string().trim().min(1, "wordListId is required"),
  difficulty: z.number().int().positive().nullable().optional(),
  maxGuesses: z.number().int().positive().nullable().optional(),
  gridRows: z.number().int().positive().nullable().optional(),
  gridCols: z.number().int().positive().nullable().optional(),
  hintsEnabled: z.boolean().optional(),
});

export const activityUpdateSchema = activityCreateSchema.partial();
