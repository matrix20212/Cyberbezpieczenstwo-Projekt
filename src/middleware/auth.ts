import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

const SECRET = process.env.JWT_SECRET || "changeme";

export interface AuthRequest extends Request {
  user?: any;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Brak tokena" });
  const token = auth.split(" ")[1];
  try {
    const payload: any = jwt.verify(token, SECRET);
    const user = await prisma.user.findUnique({ where: { username: payload.username }});
    if (!user) return res.status(401).json({ error: "Nieautoryzowany" });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Nieautoryzowany" });
  }
}

export function isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Nieautoryzowany" });
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Dostęp zabroniony" });
  next();
}
