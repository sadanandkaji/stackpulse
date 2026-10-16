import { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/httpError";
import { verifyToken } from "../lib/jwt";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Missing or malformed Authorization header"));
  }
  try {
    req.userId = verifyToken(header.slice(7));
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
}