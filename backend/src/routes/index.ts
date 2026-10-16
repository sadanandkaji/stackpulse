import { Router } from "express";
import authRoutes from "./auth.routes";
import developerRoutes from "./developer.routes";
import healthRoutes from "./health.routes";
import compareRoutes from "./compare.routes";
const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/developers", developerRoutes);
router.use("/compare", compareRoutes);
export default router;