import { PrismaClient, Categoria, StatusSolicitacao } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("senha123", 10);

  const ana = await prisma.usuario.upsert({
    where: { email: "ana.silva@empresa.com" },
    update: {},
    create: { nome: "Ana Silva", email: "ana.silva@empresa.com", senhaHash },
  });

  const bruno = await prisma.usuario.upsert({
    where: { email: "bruno.costa@empresa.com" },
    update: {},
    create: { nome: "Bruno Costa", email: "bruno.costa@empresa.com", senhaHash },
  });

  const existentes = await prisma.solicitacao.count();
  if (existentes === 0) {
    await prisma.solicitacao.createMany({
      data: [
        {
          titulo: "Computador não liga",
          descricao: "O computador da sala 3 não liga desde ontem à tarde.",
          categoria: Categoria.TI,
          status: StatusSolicitacao.ABERTO,
          solicitanteId: ana.id,
        },
        {
          titulo: "Solicitação de férias",
          descricao: "Gostaria de solicitar férias para o período de 10 a 20 de novembro.",
          categoria: Categoria.RH,
          status: StatusSolicitacao.EM_ATENDIMENTO,
          solicitanteId: ana.id,
        },
        {
          titulo: "Compra de monitor adicional",
          descricao: "Necessito de um segundo monitor para o setor financeiro.",
          categoria: Categoria.COMPRAS,
          status: StatusSolicitacao.ABERTO,
          solicitanteId: bruno.id,
        },
        {
          titulo: "Reembolso de despesas de viagem",
          descricao: "Reembolso referente à viagem a Recife nos dias 2 e 3 de setembro.",
          categoria: Categoria.FINANCEIRO,
          status: StatusSolicitacao.CONCLUIDO,
          solicitanteId: bruno.id,
        },
        {
          titulo: "Ar condicionado com vazamento",
          descricao: "O ar condicionado do 2º andar está vazando água sobre as mesas.",
          categoria: Categoria.INFRAESTRUTURA,
          status: StatusSolicitacao.EM_ATENDIMENTO,
          solicitanteId: ana.id,
        },
      ],
    });
  }

  console.log("Seed concluído. Usuários de demonstração:");
  console.log("  ana.silva@empresa.com / senha123");
  console.log("  bruno.costa@empresa.com / senha123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
