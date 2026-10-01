import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  deleteSolicitacao,
  getSolicitacaoPorId,
  getSolicitacoes,
  patchSolicitacaoStatus,
  postSolicitacao,
  putSolicitacao,
} from "../controllers/solicitacoes.controller";
import {
  changeStatusSchema,
  createSolicitacaoSchema,
  idParamSchema,
  listSolicitacoesQuerySchema,
  updateSolicitacaoSchema,
} from "../validators/solicitacao.validators";

const router = Router();

router.use(requireAuth);

router.post("/", validate(createSolicitacaoSchema), postSolicitacao);
router.get("/", validate(listSolicitacoesQuerySchema, "query"), getSolicitacoes);
router.get("/:id", validate(idParamSchema, "params"), getSolicitacaoPorId);
router.put(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateSolicitacaoSchema),
  putSolicitacao
);
router.delete("/:id", validate(idParamSchema, "params"), deleteSolicitacao);
router.patch(
  "/:id/status",
  validate(idParamSchema, "params"),
  validate(changeStatusSchema),
  patchSolicitacaoStatus
);

export default router;
