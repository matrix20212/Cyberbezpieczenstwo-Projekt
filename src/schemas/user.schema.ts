import { z } from "zod";

export const userSchema = z.object({
  username: z.string().min(3),
  fullName: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
});
