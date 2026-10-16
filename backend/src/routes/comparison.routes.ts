import { Router } from "express";
import * as controller from "../controllers/comparison.controller";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { createComparisonSchema, updateComparisonSchema } from "../schemas/comparison.schema";

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler(controller.list));
router.get("/:id", asyncHandler(controller.get));
router.post("/", validate(createComparisonSchema), asyncHandler(controller.create));
router.patch("/:id", validate(updateComparisonSchema), asyncHandler(controller.update));
router.delete("/:id", asyncHandler(controller.remove));

export default router;