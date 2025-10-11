import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Login jest wymagany"),
  password: z.string().min(1, "Hasło jest wymagane")
});
