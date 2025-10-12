import { prisma } from "../prisma";
import bcrypt from "bcrypt";

export function validatePasswordAgainstPolicy(password: string, settings: any | null) {
  const minLength = settings?.minLength ?? 14;
  const requireDigit = settings?.requireDigit ?? true;
  const requireUpper = settings?.requireUppercase ?? false;
  const requireSpecial = settings?.requireSpecial ?? false;

  if (password.length < minLength) return `Hasło musi mieć co najmniej ${minLength} znaków`;
  if (requireDigit && !/[0-9]/.test(password)) return "Hasło musi zawierać co najmniej jedną cyfrę";
  if (requireUpper && !/[A-Z]/.test(password)) return "Hasło musi zawierać wielką literę";
  if (requireSpecial && !/[^A-Za-z0-9]/.test(password)) return "Hasło musi zawierać znak specjalny";
  return null;
}

export async function isInPasswordHistory(userId: number, plainPassword: string) {
  const histories = await prisma.passwordHistory.findMany({ where: { userId } });
  for (const h of histories) {
    const match = await bcrypt.compare(plainPassword, h.password);
    if (match) return true;
  }
  return false;
}