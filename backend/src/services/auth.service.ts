import bcrypt from "bcryptjs";
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";
import { signToken } from "../lib/jwt";

const publicUser = { id: true, email: true, createdAt: true } as const;

export async function signup(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: publicUser,
    });
    return { user, token: signToken(user.id) };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new HttpError(409, "Email already registered");
    }
    throw e;
  }
}

export async function login(email: string, password: string) {
  const found = await prisma.user.findUnique({ where: { email } });
  const valid = found ? await bcrypt.compare(password, found.passwordHash) : false;
  if (!found || !valid) throw new HttpError(401, "Invalid email or password");

  return {
    user: { id: found.id, email: found.email, createdAt: found.createdAt },
    token: signToken(found.id),
  };
}

export async function getUserById(id: number) {
  const user = await prisma.user.findUnique({ where: { id }, select: publicUser });
  if (!user) throw new HttpError(401, "User no longer exists");
  return user;
}