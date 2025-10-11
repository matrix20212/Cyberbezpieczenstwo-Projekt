import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { loginSchema } from "../schemas/login.schema";
import { userService } from "../services/user.service";

const SECRET = process.env.JWT_SECRET || "supersecret";

export const authController = {
  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.format());

    const { username, password } = parsed.data;
    const user = await userService.getUser(username);

    if (!user) return res.status(400).json({ error: "Login lub hasło niepoprawny" });
    if (user.blocked) return res.status(403).json({ error: "Konto jest zablokowane" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Login lub hasło niepoprawny" });

    const token = jwt.sign({ username: user.username, role: user.role }, SECRET, { expiresIn: "1h" });
    res.json({ token });
  },
};
