import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const username = "ADMIN";
  const password = "admin123";
  const hash = await bcrypt.hash(password, 10);
  const role = "ADMIN";
  const fullName = "aDmIn";
  const mustChangePassword = true;
  const expiry = null;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log("Konto ADMIN już istnieje!");
    return;
  }

  await prisma.user.create({
    data: {
        username,
        password: hash,
        role,
        fullName,
        mustChangePassword,
        passwordExpiresAt: expiry || null
      }
  });

  console.log("Utworzono konto ADMIN");
  console.log(`Login: ${username}`);
  console.log(`Hasło: ${password}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });