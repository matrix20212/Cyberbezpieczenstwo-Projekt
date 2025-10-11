import { z } from "zod";

export const createUserSchema = z.object({
  username: z.string().min(3, "Login musi mieć minimum 3 znaki"),
  fullName: z.string().optional(),
  password: z.string().min(14, "Hasło musi mieć minimum 14 znaków"),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  blocked: z.boolean().default(false)
});

export const updateUserSchema = z.object({
  fullName: z.string().optional(),
  password: z.string().min(14).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  blocked: z.boolean().optional(),
  mustChangePassword: z.boolean().optional(),
  passwordExpiresAt: z.string().datetime().optional()
});

export const userResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  fullName: z.string().nullable(),
  role: z.enum(["USER", "ADMIN"]),
  blocked: z.boolean(),
  mustChangePassword: z.boolean(),
  passwordExpiresAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
});