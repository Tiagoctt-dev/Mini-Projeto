import { StatusSolicitacao } from "@prisma/client";
import { prisma } from "../config/prisma";

export async function obterIndicadores() {
  const [total, abertas, emAtendimento, concluidas] = await prisma.$transaction([
    prisma.solicitacao.count(),
    prisma.solicitacao.count({ where: { status: StatusSolicitacao.ABERTO } }),
    prisma.solicitacao.count({ where: { status: StatusSolicitacao.EM_ATENDIMENTO } }),
    prisma.solicitacao.count({ where: { status: StatusSolicitacao.CONCLUIDO } }),
  ]);

  return { total, abertas, emAtendimento, concluidas };
}
