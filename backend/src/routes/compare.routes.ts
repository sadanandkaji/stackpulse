import { Router } from "express";
import * as controller from "../controllers/compare.controller";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/", requireAuth, asyncHandler(controller.compare));

export default router;