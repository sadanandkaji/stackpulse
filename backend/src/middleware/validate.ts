import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { HttpError } from "../lib/httpError";

export const validate =
  (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return next(new HttpError(400, "Validation failed", details));
    }
    req.body = result.data;
    next();
  };