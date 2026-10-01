import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import {
  alterarStatusSolicitacao,
  atualizarSolicitacao,
  buscarSolicitacaoPorId,
  criarSolicitacao,
  excluirSolicitacao,
  listarSolicitacoes,
} from "../services/solicitacoes.service";
import type { ListSolicitacoesQuery } from "../validators/solicitacao.validators";

function usuarioAutenticado(req: Request) {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  return req.user;
}

export const postSolicitacao = asyncHandler(async (req: Request, res: Response) => {
  const usuario = usuarioAutenticado(req);
  const solicitacao = await criarSolicitacao(req.body, usuario.id);
  res.status(201).json({ solicitacao });
});

export const getSolicitacoes = asyncHandler(async (req: Request, res: Response) => {
  const resultado = await listarSolicitacoes(req.query as unknown as ListSolicitacoesQuery);
  res.json(resultado);
});

export const getSolicitacaoPorId = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const solicitacao = await buscarSolicitacaoPorId(id);
  res.json({ solicitacao });
});

export const putSolicitacao = asyncHandler(async (req: Request, res: Response) => {
  const usuario = usuarioAutenticado(req);
  const { id } = req.params as unknown as { id: number };
  const solicitacao = await atualizarSolicitacao(id, req.body, usuario.id);
  res.json({ solicitacao });
});

export const deleteSolicitacao = asyncHandler(async (req: Request, res: Response) => {
  const usuario = usuarioAutenticado(req);
  const { id } = req.params as unknown as { id: number };
  await excluirSolicitacao(id, usuario.id);
  res.status(204).send();
});

export const patchSolicitacaoStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const solicitacao = await alterarStatusSolicitacao(id, req.body.status);
  res.json({ solicitacao });
});
