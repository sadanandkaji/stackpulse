import { z } from "zod";

const name = z.string().trim().min(1, "Name is required").max(80, "Name must be at most 80 characters");
const usernames = z
  .array(z.string().trim().toLowerCase().min(1))
  .transform((u) => [...new Set(u)])
  .refine((u) => u.length >= 2, "Select at least 2 developers")
  .refine((u) => u.length <= 5, "Select at most 5 developers");

export const createComparisonSchema = z.object({ name, usernames });

export const updateComparisonSchema = z
  .object({ name: name.optional(), usernames: usernames.optional() })
  .refine((v) => v.name !== undefined || v.usernames !== undefined, {
    message: "Provide name or usernames to update",
  });