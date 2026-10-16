import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: "ok", db: "up" });
    } catch {
      res.status(500).json({ status: "error", db: "down" });
    }
  })
);

export default router;