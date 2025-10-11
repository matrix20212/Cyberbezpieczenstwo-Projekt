import bcrypt from "bcrypt";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export const userService = {
  async createUser(username: string, password: string, role = "USER", fullName?: string) {
    const hash = await bcrypt.hash(password, 10);
    return prisma.user.create({
      data: { username, password: hash, role, fullName },
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
