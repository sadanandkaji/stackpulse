import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function signToken(userId: number): string {
  return jwt.sign({ sub: String(userId) }, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): number {
  const payload = jwt.verify(token, env.JWT_SECRET);
  if (typeof payload === "string" || !payload.sub) throw new Error("Invalid token");
  return Number(payload.sub);
}