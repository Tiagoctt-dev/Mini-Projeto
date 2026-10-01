import { Router } from "express";
import authRoutes from "./auth.routes";
import solicitacoesRoutes from "./solicitacoes.routes";
import dashboardRoutes from "./dashboard.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/solicitacoes", solicitacoesRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
