import { Router } from "express";
import * as controller from "../controllers/developer.controller";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);
router.get("/:username", asyncHandler(controller.getDeveloper));
router.post("/:username/refresh", asyncHandler(controller.refreshDeveloper));

export default router;