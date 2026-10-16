import { Router } from "express";
import * as controller from "../controllers/auth.controller";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { loginSchema, signupSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/signup", validate(signupSchema), asyncHandler(controller.signup));
router.post("/login", validate(loginSchema), asyncHandler(controller.login));
router.get("/me", requireAuth, asyncHandler(controller.me));

export default router;