import { z } from "zod";

const note = z.string().trim().max(1000, "Note must be at most 1000 characters");
const tags = z
  .array(z.string().trim().toLowerCase().min(1).max(30))
  .max(10, "At most 10 tags")
  .transform((t) => [...new Set(t)]);

export const createPinSchema = z.object({
  repoId: z.number().int().positive(),
  note: note.optional(),
  tags: tags.optional(),
});

export const updatePinSchema = z
  .object({
    note: note.nullable().optional(),
    tags: tags.optional(),
  })
  .refine((v) => v.note !== undefined || v.tags !== undefined, {
    message: "Provide note or tags to update",
  });