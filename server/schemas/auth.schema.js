import { z } from "zod";

export const signUpSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password too long"), // bcrypt safe limit
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});
export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

