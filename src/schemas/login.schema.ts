import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "Nazwa użytkownika jest za krótka"),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków"),
});
