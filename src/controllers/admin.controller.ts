import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { createUserSchema, updateUserSchema, userResponseSchema } from "../schemas/user.schema";
import { settingsSchema } from "../schemas/settings.schema";
import { logActivity } from "../utils/logger";

const prisma = new PrismaClient();

export const adminController = {
  async listUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany();
      const safeUsers = users.map((u: typeof users[number]) => userResponseSchema.parse(u));

      await logActivity(
        (req as any).user?.username || "ADMIN",
        "listUsers",
        true,
        "Wyświetlono listę użytkowników"
      );

      res.json(safeUsers);
    } catch (err) {
      await logActivity(
        (req as any).user?.username || "ADMIN",
        "listUsers",
        false,
        "Błąd przy pobieraniu listy użytkowników"
      );
      res.status(500).json({ message: "Błąd serwera", error: (err as Error).message });
    }
  },

  async addUser(req: Request, res: Response) {
    try {
      const parsed = createUserSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json(parsed.error.format());

      const { username, password, role, fullName, blocked } = parsed.data;

      const existing = await prisma.user.findUnique({ where: { username }});
      if (existing) return res.status(400).json({ error: "Użytkownik istnieje" });

      const hash = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 90);

      const user = await prisma.user.create({
        data: {
          username,
          password: hash,
          role,
          fullName,
          blocked: blocked ?? false,
          mustChangePassword: true,
          passwordExpiresAt: expiryDate
        }
      });

      await logActivity(
        (req as any).user?.username || "ADMIN",
        "addUser",
        true,
        `Dodano użytkownika ${username}`
      );

      res.json(userResponseSchema.parse(user));

    } catch (err) {
      await logActivity(
        (req as any).user?.username || "ADMIN",
        "addUser",
        false,
        "Błąd przy dodawaniu użytkownika"
      );
      res.status(500).json({ message: "Błąd serwera", error: (err as Error).message });
    }
  },

  async updateUser(req: Request, res: Response) {
    try {
      const username = req.params.username;
      const parsed = updateUserSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json(parsed.error.format());

      const dataToUpdate: any = { ...parsed.data };
      if (dataToUpdate.password) {
        dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
        dataToUpdate.mustChangePassword = true;
      }

      const updated = await prisma.user.update({
        where: { username },
        data: dataToUpdate
      });

      await logActivity(
        (req as any).user?.username || "ADMIN",
        "updateUser",
        true,
        `Zaktualizowano użytkownika ${username}`
      );

      res.json(userResponseSchema.parse(updated));
    } catch (err) {
      await logActivity(
        (req as any).user?.username || "ADMIN",
        "updateUser",
        false,
        "Błąd przy aktualizacji użytkownika"
      );
      res.status(500).json({ message: "Błąd serwera", error: (err as Error).message });
    }
  },

  async blockUser(req: Request, res: Response) {
    try {
      const username = req.params.username;
      const user = await prisma.user.findUnique({ where: { username }});
      if (!user) return res.status(404).json({ message: "Użytkownik nie istnieje" });
      if (user.role === "ADMIN") return res.status(403).json({ message: "Nie można blokować administratora" });

      const updated = await prisma.user.update({
        where: { username },
        data: { blocked: !user.blocked }
      });

      await logActivity(
        (req as any).user?.username || "ADMIN",
        "blockUser",
        true,
        `${user.blocked ? "Odblokowano" : "Zablokowano"} użytkownika ${username}`
      );

      res.json(userResponseSchema.parse(updated));
    } catch (err) {
      await logActivity(
        (req as any).user?.username || "ADMIN",
        "blockUser",
        false,
        "Błąd przy blokowaniu użytkownika"
      );
      res.status(500).json({ message: "Błąd serwera", error: (err as Error).message });
    }
  },

  async deleteUser(req: Request, res: Response) {
    try {
      const username = req.params.username;
      const user = await prisma.user.findUnique({ where: { username }});
      if (!user) return res.status(404).json({ message: "Użytkownik nie istnieje" });
      if (user.role === "ADMIN") return res.status(403).json({ message: "Nie można usunąć administratora" });

      await prisma.user.delete({ where: { username }});

      await logActivity(
        (req as any).user?.username || "ADMIN",
        "deleteUser",
        true,
        `Usunięto użytkownika ${username}`
      );

      res.json({ message: "Użytkownik usunięty" });
    } catch (err) {
      await logActivity(
        (req as any).user?.username || "ADMIN",
        "deleteUser",
        false,
        "Błąd przy usuwaniu użytkownika"
      );
      res.status(500).json({ message: "Błąd serwera", error: (err as Error).message });
    }
  },

  async getSettings(req: Request, res: Response) {
    try {
      let settings = await prisma.settings.findFirst();
      if (!settings) {
        settings = await prisma.settings.create({ data: {} });
      }
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Błąd serwera", error: (err as Error).message });
    }
  },

  async updateSettings(req: Request, res: Response) {
    try {
      const parsed = settingsSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json(parsed.error.format());

      let settings = await prisma.settings.findFirst();
      if (!settings) {
        settings = await prisma.settings.create({ data: parsed.data });
      } else {
        settings = await prisma.settings.update({ where: { id: settings.id }, data: parsed.data });
      }

      await logActivity(
        (req as any).user?.username || "ADMIN",
        "updateSettings",
        true,
        "Zaktualizowano ustawienia systemu"
      );

      res.json(settings);
    } catch (err) {
      await logActivity(
        (req as any).user?.username || "ADMIN",
        "updateSettings",
        false,
        "Błąd przy aktualizacji ustawień"
      );
      res.status(500).json({ message: "Błąd serwera", error: (err as Error).message });
    }
  },

  async listLogs(req: Request, res: Response) {
    try {
      const logs = await prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 1000,
      });

      await logActivity(
        (req as any).user?.username || "ADMIN",
        "listLogs",
        true,
        "Wyświetlono logi aktywności"
      );

      res.json(logs);
    } catch (err) {
      await logActivity(
        (req as any).user?.username || "ADMIN",
        "listLogs",
        false,
        "Błąd przy pobieraniu logów"
      );
      res.status(500).json({ message: "Błąd serwera", error: (err as Error).message });
    }
  },

  async getLogs(req: Request, res: Response) {
    try {
      const logs = await prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      res.json(logs);
    } catch (err) {
      res.status(500).json({ message: "Błąd serwera", error: (err as Error).message });
    }
  },
  
};
