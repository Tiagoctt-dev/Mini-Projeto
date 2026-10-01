import { Prisma, StatusSolicitacao } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import type { CreateSolicitacaoInput, ListSolicitacoesQuery } from "../validators/solicitacao.validators";

const solicitacaoComSolicitante = {
  include: { solicitante: { select: { id: true, nome: true, email: true } } },
} as const;

export async function criarSolicitacao(dados: CreateSolicitacaoInput, solicitanteId: number) {
  return prisma.solicitacao.create({
    data: { ...dados, solicitanteId },
    ...solicitacaoComSolicitante,
  });
}

export async function listarSolicitacoes(filtros: ListSolicitacoesQuery) {
  const where: Prisma.SolicitacaoWhereInput = {};

  if (filtros.status) where.status = filtros.status;
  if (filtros.categoria) where.categoria = filtros.categoria;
  if (filtros.texto) where.titulo = { contains: filtros.texto, mode: "insensitive" };

  if (filtros.dataInicio || filtros.dataFim) {
    where.criadoEm = {};
    if (filtros.dataInicio) where.criadoEm.gte = new Date(`${filtros.dataInicio}T00:00:00.000Z`);
    if (filtros.dataFim) where.criadoEm.lte = new Date(`${filtros.dataFim}T23:59:59.999Z`);
  }

  const { page, pageSize } = filtros;

  const [itens, total] = await prisma.$transaction([
    prisma.solicitacao.findMany({
      where,
      ...solicitacaoComSolicitante,
      orderBy: { criadoEm: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.solicitacao.count({ where }),
  ]);

  return {
    itens,
    paginacao: { page, pageSize, total, totalPaginas: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

export async function buscarSolicitacaoPorId(id: number) {
  const solicitacao = await prisma.solicitacao.findUnique({
    where: { id },
    ...solicitacaoComSolicitante,
  });

  if (!solicitacao) {
    throw AppError.notFound("Solicitação não encontrada.");
  }

  return solicitacao;
}

async function garantirEdicaoPermitida(id: number, usuarioId: number) {
  const solicitacao = await prisma.solicitacao.findUnique({ where: { id } });

  if (!solicitacao) {
    throw AppError.notFound("Solicitação não encontrada.");
  }

  if (solicitacao.solicitanteId !== usuarioId) {
    throw AppError.forbidden("Você só pode alterar solicitações que você mesmo abriu.");
  }

  if (solicitacao.status !== StatusSolicitacao.ABERTO) {
    throw AppError.forbidden("Apenas solicitações com status Aberto podem ser editadas ou excluídas.");
  }

  return solicitacao;
}

export async function atualizarSolicitacao(
  id: number,
  dados: CreateSolicitacaoInput,
  usuarioId: number
) {
  await garantirEdicaoPermitida(id, usuarioId);

  return prisma.solicitacao.update({
    where: { id },
    data: dados,
    ...solicitacaoComSolicitante,
  });
}

export async function excluirSolicitacao(id: number, usuarioId: number) {
  await garantirEdicaoPermitida(id, usuarioId);
  await prisma.solicitacao.delete({ where: { id } });
}

export async function alterarStatusSolicitacao(id: number, status: StatusSolicitacao) {
  const solicitacao = await prisma.solicitacao.findUnique({ where: { id } });

  if (!solicitacao) {
    throw AppError.notFound("Solicitação não encontrada.");
  }

  return prisma.solicitacao.update({
    where: { id },
    data: { status },
    ...solicitacaoComSolicitante,
  });
}
