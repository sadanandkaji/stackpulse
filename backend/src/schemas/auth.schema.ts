import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email");

export const signupSchema = z.object({
  email,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"), // bcrypt limit
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});