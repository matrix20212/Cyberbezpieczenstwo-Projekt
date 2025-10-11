import { z } from "zod";

export const changePasswordSchema = z.object({
  username: z.string().min(1, "Login jest wymagany"),
  oldPassword: z.string().min(1, "Stare hasło jest wymagane"),
  newPassword: z.string().min(14, "Hasło musi mieć co najmniej 14 znaków"),
});