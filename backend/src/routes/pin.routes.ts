import { Router } from "express";
import * as controller from "../controllers/pin.controller";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { createPinSchema, updatePinSchema } from "../schemas/pin.schema";

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler(controller.list));
router.post("/", validate(createPinSchema), asyncHandler(controller.create));
router.patch("/:id", validate(updatePinSchema), asyncHandler(controller.update));
router.delete("/:id", asyncHandler(controller.remove));

export default router;