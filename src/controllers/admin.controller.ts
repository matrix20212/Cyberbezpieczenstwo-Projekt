import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { userService } from "../services/user.service";
import { createUserSchema, updateUserSchema, userResponseSchema } from "../schemas/user.schema";
import { settingsSchema } from "../schemas/settings.schema";

const prisma = new PrismaClient();

export const adminController = {

  async listUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany();
      const safeUsers = users.map((u: typeof users[number]) => userResponseSchema.parse(u));
      res.json(safeUsers);
    } catch (err) {
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

      res.json(userResponseSchema.parse(user));

    } catch (err) {
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

      res.json(userResponseSchema.parse(updated));
    } catch (err) {
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

      res.json(userResponseSchema.parse(updated));
    } catch (err) {
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
      res.json({ message: "Użytkownik usunięty" });
    } catch (err) {
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

      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Błąd serwera", error: (err as Error).message });
    }
  }
};
