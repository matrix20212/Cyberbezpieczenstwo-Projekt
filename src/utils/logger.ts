import { prisma } from "../prisma";

export async function logActivity(
  username: string,
  action: string,
  success: boolean,
  message?: string
) {
  try {
    await prisma.activityLog.create({
      data: { username, action, success, message },
    });
  } catch (err) {
    console.error("Błąd zapisu logu:", err);
  }
}
