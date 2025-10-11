import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { loginSchema } from "../schemas/login.schema";

const SECRET = process.env.JWT_SECRET || "changeme";

export const authController = {
  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.format());
    const { username, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { username }});
    if (!user) return res.status(400).json({ error: "Login lub hasło niepoprawny" });
    if (user.blocked) return res.status(403).json({ error: "Konto jest zablokowane" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Login lub hasło niepoprawny" });

    // check expiry
    const expired = user.passwordExpiresAt ? (new Date() > user.passwordExpiresAt) : false;

    // token
    const token = jwt.sign({ username: user.username, role: user.role }, SECRET, { expiresIn: "2h" });

    // on first login or expired => inform frontend to redirect to change-password
    return res.json({
      token,
      mustChangePassword: user.mustChangePassword || expired,
      role: user.role
    });
  },

  async changePassword(req: Request, res: Response) {
    // expects { username, oldPassword, newPassword }
    const { username, oldPassword, newPassword } = req.body;
    if (!username || !oldPassword || !newPassword) return res.status(400).json({ error: "Brak danych" });

    const user = await prisma.user.findUnique({ where: { username }});
    if (!user) return res.status(400).json({ error: "Użytkownik nie istnieje" });

    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) return res.status(400).json({ error: "Stare hasło niepoprawne" });

    // validate against policy and history - use helper
    const { validatePasswordAgainstPolicy, isInPasswordHistory } = require("../utils/passwordPolicy");
    const settings = await prisma.settings.findFirst();
    const policyError = validatePasswordAgainstPolicy(newPassword, settings);
    if (policyError) return res.status(400).json({ error: policyError });

    const inHistory = await isInPasswordHistory(user.id, newPassword);
    if (inHistory) return res.status(400).json({ error: "Nowe hasło nie może być takie jak poprzednie" });

    const hash = await bcrypt.hash(newPassword, 10);

    // save new hash and add history
    await prisma.$transaction([
      prisma.user.update({
        where: { username },
        data: { password: hash, mustChangePassword: false, passwordExpiresAt: new Date(Date.now() + (settings?.passwordExpiryDays || 90) * 24*3600*1000) }
      }),
      prisma.passwordHistory.create({ data: { userId: user.id, password: hash } })
    ]);

    return res.json({ message: "Hasło zmienione" });
  }
};
