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

const activityCommon = {
  name: z.string().trim().min(1, "name is required").max(200),
  wordListId: z.string().trim().min(1, "wordListId is required"),
  hintsEnabled: z.boolean().optional(),
};

// Wordle and Word Search need different required settings (difficulty +
// maxGuesses vs. gridRows + gridCols) — the DB schema leaves these columns
// nullable to hold both shapes in one table, but a *create* request should
// still be held to "the right fields for this type", not left as loosely
// optional as the storage layer.
export const activityCreateSchema = z.discriminatedUnion("type", [
  z.object({
    ...activityCommon,
    type: z.literal("WORDLE"),
    difficulty: z.number().int().positive(),
    maxGuesses: z.number().int().positive(),
  }),
  z.object({
    ...activityCommon,
    type: z.literal("WORD_SEARCH"),
    gridRows: z.number().int().positive(),
    gridCols: z.number().int().positive(),
  }),
]);

// Updates don't change an activity's type (that's a new activity, not an
// edit) — just its settings, so a looser partial schema is fine here.
export const activityUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  wordListId: z.string().trim().min(1).optional(),
  difficulty: z.number().int().positive().nullable().optional(),
  maxGuesses: z.number().int().positive().nullable().optional(),
  gridRows: z.number().int().positive().nullable().optional(),
  gridCols: z.number().int().positive().nullable().optional(),
  hintsEnabled: z.boolean().optional(),
});
