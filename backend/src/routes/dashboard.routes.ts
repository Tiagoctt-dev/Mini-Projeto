import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { getIndicadores } from "../controllers/dashboard.controller";

const router = Router();

router.use(requireAuth);
router.get("/", getIndicadores);

export default router;
