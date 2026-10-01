import { Router } from "express";
import { getMe, postLogin, postLogout } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { loginSchema } from "../validators/auth.validators";

const router = Router();

router.post("/login", validate(loginSchema), postLogin);
router.post("/logout", postLogout);
router.get("/me", requireAuth, getMe);

export default router;
