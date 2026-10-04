import { Categoria, StatusSolicitacao } from "@prisma/client";
import { prisma } from "../config/prisma";

export async function obterIndicadores() {
  const [total, abertas, emAtendimento, concluidas, porCategoriaRaw] = await prisma.$transaction([
    prisma.solicitacao.count(),
    prisma.solicitacao.count({ where: { status: StatusSolicitacao.ABERTO } }),
    prisma.solicitacao.count({ where: { status: StatusSolicitacao.EM_ATENDIMENTO } }),
    prisma.solicitacao.count({ where: { status: StatusSolicitacao.CONCLUIDO } }),
    prisma.solicitacao.groupBy({ by: ["categoria"], _count: true, orderBy: { categoria: "asc" } }),
  ]);

  const contagemPorCategoria = new Map(porCategoriaRaw.map((item) => [item.categoria, item._count]));
  const porCategoria = Object.values(Categoria).map((categoria) => ({
    categoria,
    total: contagemPorCategoria.get(categoria) ?? 0,
  }));

  return { total, abertas, emAtendimento, concluidas, porCategoria };
}
