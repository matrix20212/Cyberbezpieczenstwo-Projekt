import { Request, Response } from "express";
import { prisma } from "../prisma";
import { userService } from "../services/user.service";
import { userSchema } from "../schemas/user.schema";

export const adminController = {
  async listUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany({ select: { id: true, username: true, role: true, blocked: true, mustChangePassword: true, passwordExpiresAt: true }});
    res.json(users);
  },

  async addUser(req: Request, res: Response) {
    const parsed = userSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.format());
    const { username, password, role, fullName } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { username }});
    if (existing) return res.status(400).json({ error: "Użytkownik istnieje" });
    const user = await userService.createUser(username, password, role, fullName);
    res.json(user);
  },

  async blockUser(req: Request, res: Response) {
    const username = req.params.username;
    const u = await prisma.user.update({ where: { username }, data: { blocked: true }});
    res.json(u);
  },

  async deleteUser(req: Request, res: Response) {
    const username = req.params.username;
    const u = await prisma.user.delete({ where: { username }});
    res.json(u);
  },

  // settings
  async getSettings(req: Request, res: Response) {
    let s = await prisma.settings.findFirst();
    if (!s) {
      s = await prisma.settings.create({ data: {} });
    }
    res.json(s);
  },

  async updateSettings(req: Request, res: Response) {
    const payload = req.body;
    let s = await prisma.settings.findFirst();
    if (!s) {
      s = await prisma.settings.create({ data: payload });
    } else {
      s = await prisma.settings.update({ where: { id: s.id }, data: payload });
    }
    res.json(s);
  }
};
