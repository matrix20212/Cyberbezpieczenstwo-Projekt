import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { loginSchema } from "../schemas/login.schema";
import {
  validatePasswordAgainstPolicy,
  isInPasswordHistory,
} from "../utils/passwordPolicy";
import { logActivity } from "../utils/logger";
import axios from "axios";

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "changeme";
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;

async function verifyCaptcha(token: string) {
  if (!RECAPTCHA_SECRET) {
    console.error("RECAPTCHA_SECRET_KEY is not set in .env file");
    return false;
  }
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${token}`
    );
    return response.data.success;
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return false;
  }
}

export const authController = {
  async login(req: Request, res: Response) {
    const { captcha, ...loginData } = req.body;
    if (!captcha) {
      return res.status(400).json({ error: "reCAPTCHA not completed" });
    }
    const isCaptchaValid = await verifyCaptcha(captcha);
    if (!isCaptchaValid) {
      return res.status(400).json({ error: "Invalid reCAPTCHA" });
    }

    const parsed = loginSchema.safeParse(loginData);
    if (!parsed.success) return res.status(400).json(parsed.error.format());

    const { username, password } = parsed.data;

    const settings = await prisma.settings.findFirst();
    const LOGIN_LIMIT = settings?.maxLoginAttempts || 5;
    const LOCK_DURATION_MINUTES = settings?.lockoutDurationMinutes || 15;

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      await logActivity(
        username,
        "login",
        false,
        "Niepoprawny login lub hasło"
      );
      return res.status(400).json({ error: "Login lub hasło niepoprawny" });
    }

    if (user.blockedUntil && user.blockedUntil > new Date()) {
      const msLeft = user.blockedUntil.getTime() - Date.now();
      const minutes = Math.floor(msLeft / 60000);
      const seconds = Math.floor((msLeft % 60000) / 1000);
      await logActivity(username, "login", false, "Konto zablokowane");
      return res.status(403).json({
        error: `Konto zablokowane. Odblokowanie za ${minutes} min ${seconds} sek`,
        blockedUntil: user.blockedUntil,
      });
    }

    if (user.blockedUntil && user.blockedUntil <= new Date()) {
      await prisma.user.update({
        where: { username },
        data: { failedAttempts: 0, blockedUntil: null },
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      const failedAttempts = user.failedAttempts + 1;
      const dataUpdate: any = { failedAttempts };

      let msg = "Login lub hasło niepoprawny";
      let blockedUntil: Date | null = null;

      if (failedAttempts >= LOGIN_LIMIT) {
        blockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
        dataUpdate.blockedUntil = blockedUntil;
        const msLeft = blockedUntil.getTime() - Date.now();
        const minutes = Math.floor(msLeft / 60000);
        const seconds = Math.floor((msLeft % 60000) / 1000);
        msg = `Przekroczono limit prób logowania. Konto zablokowane na ${minutes} min ${seconds} sek`;
      }

      await prisma.user.update({
        where: { username },
        data: dataUpdate,
      });

      await logActivity(
        username,
        "login",
        false,
        `Niepoprawne hasło (próba ${failedAttempts})`
      );
      return res.status(400).json({ error: msg, blockedUntil });
    }

    await prisma.user.update({
      where: { username },
      data: { failedAttempts: 0, blockedUntil: null },
    });

    const expired = user.passwordExpiresAt
      ? new Date() > user.passwordExpiresAt
      : false;

    const SESSION_TIMEOUT_MINUTES = settings?.sessionTimeoutMinutes || 30;
    const token = jwt.sign(
      {
        username: user.username,
        role: user.role,
        mustChangePassword: user.mustChangePassword || expired,
      },
      SECRET,
      { expiresIn: `${SESSION_TIMEOUT_MINUTES}m` }
    );

    await logActivity(username, "login", true, "Pomyślne logowanie");

    return res.json({
      token,
      mustChangePassword: user.mustChangePassword || expired,
      role: user.role,
    });
  },

  async changePassword(req: Request, res: Response) {
    const { username, oldPassword, newPassword, captcha } = req.body;
    if (!username || !oldPassword || !newPassword)
      return res.status(400).json({ error: "Brak danych" });

    if (!captcha) {
      return res.status(400).json({ error: "reCAPTCHA not completed" });
    }
    const isCaptchaValid = await verifyCaptcha(captcha);
    if (!isCaptchaValid) {
      return res.status(400).json({ error: "Invalid reCAPTCHA" });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user)
      return res.status(400).json({ error: "Użytkownik nie istnieje" });

    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) {
      await logActivity(
        username,
        "changePassword",
        false,
        "Niepoprawne stare hasło"
      );
      return res.status(400).json({ error: "Stare hasło niepoprawne" });
    }

    const settings = await prisma.settings.findFirst();
    const policyError = validatePasswordAgainstPolicy(newPassword, settings);
    if (policyError) {
      await logActivity(username, "changePassword", false, policyError);
      return res.status(400).json({ error: policyError });
    }

    const inHistory = await isInPasswordHistory(user.id, newPassword);
    if (inHistory) {
      await logActivity(
        username,
        "changePassword",
        false,
        "Hasło było użyte wcześniej"
      );
      return res
        .status(400)
        .json({ error: "Nowe hasło nie może być takie jak poprzednie" });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { username },
        data: {
          password: hash,
          mustChangePassword: false,
          passwordExpiresAt: new Date(
            Date.now() + (settings?.passwordExpiryDays || 90) * 24 * 3600 * 1000
          ),
        },
      }),
      prisma.passwordHistory.create({
        data: { userId: user.id, password: hash },
      }),
    ]);

    await logActivity(
      username,
      "changePassword",
      true,
      "Hasło zostało zmienione"
    );

    return res.json({ message: "Hasło zmienione" });
  },
};
