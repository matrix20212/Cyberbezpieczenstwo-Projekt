import { z } from "zod";

export const settingsSchema = z.object({
  minLength: z.number().min(6).max(64).default(6),
  requireDigit: z.boolean().default(true),
  requireUppercase: z.boolean().default(false),
  requireLowercase: z.boolean().default(true),
  requireSpecial: z.boolean().default(false),
  passwordExpiryDays: z.number().min(1).max(365).default(90),
  maxLoginAttempts: z.number().default(5),
  lockoutDurationMinutes: z.number().default(15),
  sessionTimeoutMinutes: z.number().default(30),
});
