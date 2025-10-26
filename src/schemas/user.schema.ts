import { z } from "zod";

export const createUserSchema = z.object({
  username: z.string().min(3, "Login musi mieć minimum 3 znaki"),
  fullName: z.string().optional(),
  password: z.string(),
  role: z.enum(["USER", "ADMIN", "MANAGER"]).default("USER"),
  blocked: z.boolean().default(false)
});

export const updateUserSchema = z.object({
  fullName: z.string().optional(),
  password: z.string().optional(),
  role: z.enum(["USER", "ADMIN", "MANAGER"]).optional(),
  blocked: z.boolean().optional(),
  mustChangePassword: z.boolean().optional(),
  passwordExpiresAt: z.string().datetime().optional()
});

export const userResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  fullName: z.string().nullable(),
  role: z.enum(["USER", "ADMIN", "MANAGER"]),
  blocked: z.boolean(),
  mustChangePassword: z.boolean(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
  passwordExpiresAt: z.union([z.string(), z.date()]).nullable()
});