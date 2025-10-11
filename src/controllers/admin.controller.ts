import { Request, Response } from "express";
import { userSchema } from "../schemas/user.schema";
import { userService } from "../services/user.service";

export const adminController = {
  async listUsers(req: Request, res: Response) {
    const users = await userService.getAllUsers();
    res.json(users);
  },

  async addUser(req: Request, res: Response) {
    const parsed = userSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.format());

    const { username, password, role, fullName } = parsed.data;
    const newUser = await userService.createUser(username, password, role, fullName);
    res.json(newUser);
  },

  async blockUser(req: Request, res: Response) {
    const { username } = req.params;
    const updated = await userService.blockUser(username);
    res.json(updated);
  },

  async deleteUser(req: Request, res: Response) {
    const { username } = req.params;
    const deleted = await userService.deleteUser(username);
    res.json(deleted);
  },
};
