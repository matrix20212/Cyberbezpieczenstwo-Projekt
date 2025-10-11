import bcrypt from "bcrypt";
import { prisma } from "../prisma";

export const userService = {
  async createUser(username: string, password: string, role = "USER", fullName?: string) {
    const hash = await bcrypt.hash(password, 10);
    const settings = await prisma.settings.findFirst();
    const expiry = settings ? new Date(Date.now() + settings.passwordExpiryDays * 24*3600*1000) : null;
    return prisma.user.create({
      data: {
        username,
        password: hash,
        role,
        fullName,
        mustChangePassword: true,
        passwordExpiresAt: expiry || null
      }
    });
  },


  async getUser(username: string) {
    return prisma.user.findUnique({ where: { username } });
  },

  async getAllUsers() {
    return prisma.user.findMany();
  },

  async updatePassword(username: string, newPassword: string) {
    const hash = await bcrypt.hash(newPassword, 10);
    return prisma.user.update({ where: { username }, data: { password: hash } });
  },

  async blockUser(username: string) {
    return prisma.user.update({ where: { username }, data: { blocked: true } });
  },

  async deleteUser(username: string) {
    return prisma.user.delete({ where: { username } });
  },
};
