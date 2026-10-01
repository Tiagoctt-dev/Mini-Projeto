# Dicionário de Dados — Portal de Solicitações Internas

Banco de dados: **PostgreSQL 16**
Fonte da verdade do modelo: [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma)
Script SQL equivalente: [`database/schema.sql`](schema.sql)
Migration gerada: [`backend/prisma/migrations/20251001000000_init/migration.sql`](../backend/prisma/migrations/20251001000000_init/migration.sql)

## Visão geral do modelo

O modelo é composto por duas tabelas e dois tipos enumerados:

- **usuarios** — colaboradores que autenticam no sistema e abrem solicitações.
- **solicitacoes** — as solicitações internas, cada uma vinculada ao usuário que a abriu.

```
usuarios (1) ───< (N) solicitacoes
```

## Tipos enumerados (ENUM)

### `Categoria`

| Valor             | Descrição                                   |
|-------------------|----------------------------------------------|
| `TI`              | Solicitações de Tecnologia da Informação      |
| `RH`              | Solicitações de Recursos Humanos              |
| `COMPRAS`         | Solicitações de Compras                       |
| `FINANCEIRO`      | Solicitações Financeiras                      |
| `INFRAESTRUTURA`  | Solicitações de Infraestrutura/Instalações    |

### `StatusSolicitacao`

| Valor             | Descrição                                               |
|-------------------|----------------------------------------------------------|
| `ABERTO`          | Status inicial, atribuído automaticamente na criação      |
| `EM_ATENDIMENTO`  | A solicitação está sendo tratada                          |
| `CONCLUIDO`       | A solicitação foi finalizada                              |

## Tabela: `usuarios`

Armazena os colaboradores habilitados a acessar o sistema.

| Coluna        | Tipo           | Nulo? | Padrão              | Descrição                                           |
|---------------|----------------|-------|---------------------|------------------------------------------------------|
| `id`          | SERIAL (PK)    | Não   | autoincrement        | Identificador único do usuário                        |
| `nome`        | VARCHAR(120)   | Não   | —                    | Nome completo do colaborador                          |
| `email`       | VARCHAR(160)   | Não   | —                    | E-mail usado para login. **Único** na tabela           |
| `senha_hash`  | VARCHAR(255)   | Não   | —                    | Hash bcrypt da senha (nunca a senha em texto puro)    |
| `criado_em`   | TIMESTAMP(3)   | Não   | `CURRENT_TIMESTAMP`  | Data/hora de criação do registro                      |

**Índices**
- `usuarios_pkey` — chave primária em `id`.
- `usuarios_email_key` — índice único em `email` (garante não duplicidade de login).

## Tabela: `solicitacoes`

Armazena cada solicitação interna registrada por um colaborador.

| Coluna            | Tipo                 | Nulo? | Padrão               | Descrição                                                            |
|-------------------|----------------------|-------|-----------------------|------------------------------------------------------------------------|
| `id`              | SERIAL (PK)          | Não   | autoincrement          | Identificador único / código da solicitação (exibido como `#id`)      |
| `titulo`          | VARCHAR(160)         | Não   | —                      | Título curto da solicitação                                           |
| `descricao`       | TEXT                 | Não   | —                      | Descrição detalhada da solicitação                                    |
| `categoria`       | Categoria (ENUM)     | Não   | —                      | Categoria da solicitação (TI, RH, Compras, Financeiro, Infraestrutura) |
| `status`          | StatusSolicitacao (ENUM) | Não | `ABERTO`             | Status atual da solicitação                                            |
| `solicitante_id`  | INTEGER (FK)         | Não   | —                      | Referência ao usuário que abriu a solicitação (`usuarios.id`)         |
| `criado_em`       | TIMESTAMP(3)         | Não   | `CURRENT_TIMESTAMP`    | Data/hora de abertura (campo automático)                               |
| `atualizado_em`   | TIMESTAMP(3)         | Não   | atualizado automaticamente | Data/hora da última modificação (título, descrição, categoria ou status) |

**Chaves estrangeiras**
- `solicitacoes_solicitante_id_fkey`: `solicitante_id` → `usuarios.id`
  - `ON DELETE RESTRICT`: não permite excluir um usuário que possua solicitações associadas.
  - `ON UPDATE CASCADE`: se o id do usuário mudar, o vínculo é atualizado automaticamente.

**Índices**
- `solicitacoes_pkey` — chave primária em `id`.
- `solicitacoes_status_idx` — acelera filtros por status.
- `solicitacoes_categoria_idx` — acelera filtros por categoria.
- `solicitacoes_criado_em_idx` — acelera filtros por período (data de abertura).

## Regras de negócio refletidas no modelo

1. Toda solicitação nasce com `status = ABERTO` e `criado_em`/`solicitante_id` preenchidos automaticamente pelo backend — nunca pelo cliente.
2. Edição e exclusão de uma solicitação só são permitidas pelo backend quando `solicitante_id` é o do usuário autenticado **e** `status = ABERTO` (ver `backend/src/services/solicitacoes.service.ts`).
3. A troca de status (`PATCH /solicitacoes/:id/status`) é uma operação separada da edição de conteúdo, permitida a qualquer usuário autenticado — ver justificativa e limitações no Memorial Técnico.
4. Senhas nunca são armazenadas em texto puro; apenas o hash bcrypt é persistido em `senha_hash`.
