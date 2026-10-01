-- =====================================================================
-- Portal de Solicitacoes Internas - Script de criacao do banco de dados
-- =====================================================================
-- Banco: PostgreSQL 16
--
-- Este script e equivalente as migrations geradas pelo Prisma ORM em
-- backend/prisma/migrations/20251001000000_init/migration.sql. Ele e
-- fornecido separadamente para atender ao requisito de entrega de
-- "scripts SQL de criacao de tabelas" de forma independente de ferramentas,
-- podendo ser executado diretamente em um cliente SQL (psql, DBeaver, etc).
--
-- Para subir o banco automaticamente via Prisma (recomendado), veja o
-- README.md na raiz do projeto. Este arquivo não precisa ser executado
-- manualmente se você for usar Docker Compose ou `prisma migrate deploy`.
-- =====================================================================

-- Tipos enumerados ------------------------------------------------------

CREATE TYPE "Categoria" AS ENUM ('TI', 'RH', 'COMPRAS', 'FINANCEIRO', 'INFRAESTRUTURA');

CREATE TYPE "StatusSolicitacao" AS ENUM ('ABERTO', 'EM_ATENDIMENTO', 'CONCLUIDO');

-- Tabela: usuarios -------------------------------------------------------
-- Armazena os colaboradores que podem autenticar e abrir solicitacoes.

CREATE TABLE "usuarios" (
    "id"         SERIAL NOT NULL,
    "nome"       VARCHAR(120) NOT NULL,
    "email"      VARCHAR(160) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "criado_em"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- Tabela: solicitacoes ----------------------------------------------------
-- Representa cada solicitacao interna aberta por um colaborador.

CREATE TABLE "solicitacoes" (
    "id"             SERIAL NOT NULL,
    "titulo"         VARCHAR(160) NOT NULL,
    "descricao"      TEXT NOT NULL,
    "categoria"      "Categoria" NOT NULL,
    "status"         "StatusSolicitacao" NOT NULL DEFAULT 'ABERTO',
    "solicitante_id" INTEGER NOT NULL,
    "criado_em"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacoes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "solicitacoes_solicitante_id_fkey"
        FOREIGN KEY ("solicitante_id") REFERENCES "usuarios"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "solicitacoes_status_idx" ON "solicitacoes"("status");
CREATE INDEX "solicitacoes_categoria_idx" ON "solicitacoes"("categoria");
CREATE INDEX "solicitacoes_criado_em_idx" ON "solicitacoes"("criado_em");

-- =====================================================================
-- Dados de demonstracao (opcional)
-- A senha abaixo corresponde ao texto "senha123" com hash bcrypt (custo 10).
-- Equivalente ao que backend/prisma/seed.ts gera automaticamente.
-- =====================================================================

INSERT INTO "usuarios" ("nome", "email", "senha_hash") VALUES
    ('Ana Silva',   'ana.silva@empresa.com',   '$2a$10$XbbeuqYLNRaRE3rrX4qJr.wVH7y72ce4YLI.v4tkbp2ASJsdp7SzC'),
    ('Bruno Costa', 'bruno.costa@empresa.com', '$2a$10$XbbeuqYLNRaRE3rrX4qJr.wVH7y72ce4YLI.v4tkbp2ASJsdp7SzC')
ON CONFLICT ("email") DO NOTHING;
