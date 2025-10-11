import { z } from "zod";

export const passwordSchema = z
  .object({
    oldPassword: z.string().min(6),
    newPassword: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Musi zawierać dużą literę")
      .regex(/[0-9]/, "Musi zawierać cyfrę")
      .regex(/[^A-Za-z0-9]/, "Musi zawierać znak specjalny"),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "Nowe hasło musi różnić się od starego",
    path: ["newPassword"],
  });
