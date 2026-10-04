# Portal de Solicitações Internas

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)

Aplicação full stack para que colaboradores registrem e acompanhem solicitações internas (TI, RH, Compras, Financeiro e Infraestrutura) até a sua conclusão.

Projeto desenvolvido como parte do processo seletivo para Desenvolvedor(a) de Sistemas Júnior da **bit Soluções**. O racional técnico completo (tecnologias, justificativas e decisões de arquitetura) está no [Memorial Técnico de Desenvolvimento](docs/MEMORIAL_TECNICO.md).

## Sumário

- [Visão geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Executando com Docker (recomendado)](#executando-com-docker-recomendado)
- [Executando manualmente (sem Docker)](#executando-manualmente-sem-docker)
- [Configuração (variáveis de ambiente)](#configuração-variáveis-de-ambiente)
- [Acesso — usuários de demonstração](#acesso--usuários-de-demonstração)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Documentação da API](#documentação-da-api)
- [Banco de dados](#banco-de-dados)
- [Evidências da aplicação funcionando](#evidências-da-aplicação-funcionando)
- [Documentação adicional](#documentação-adicional)
- [Autor](#autor)

## Visão geral

Funcionalidades implementadas:

- **Autenticação** por e-mail/senha com sessão via cookie `httpOnly` (JWT) e logout.
- **Cadastro de solicitações** (título, descrição, categoria), com status, data e solicitante automáticos.
- **Edição e exclusão** de solicitações — permitidas apenas ao próprio solicitante e apenas enquanto o status for "Aberto".
- **Gerenciamento**: listagem com código, título, categoria, solicitante, data de abertura e status; alteração de status; consulta de detalhes.
- **Filtros**: por período, categoria, status e texto livre no título.
- **Dashboard** com indicadores: total, abertas, em atendimento e concluídas.

## Arquitetura

Cliente-servidor desacoplado: uma SPA React consome uma API REST em Express via HTTP/JSON, e a API é a única camada com acesso direto ao banco. O backend segue uma separação em camadas (`routes` → `controllers` → `services` → Prisma Client), com autenticação, validação e tratamento de erros centralizados em middlewares.

```
┌───────────────┐      HTTP/JSON       ┌────────────────┐      SQL       ┌──────────────┐
│    Frontend    │ ───────────────────▶ │    Backend      │ ──────────────▶ │  PostgreSQL   │
│  React + Vite  │ ◀─────────────────── │  Express + TS   │ ◀────────────── │   (Prisma)    │
└───────────────┘   cookie httpOnly     └────────────────┘     Prisma      └──────────────┘
```

Racional completo de cada decisão — por que camadas, por que JWT em cookie, por que ENUM nativo no Postgres, trade-offs considerados — está no [Memorial Técnico](docs/MEMORIAL_TECNICO.md#3-justificativa-conceitual-arquitetura).

## Tecnologias

| Camada     | Tecnologia                                             |
|------------|---------------------------------------------------------|
| Backend    | Node.js 20, Express, TypeScript, Prisma ORM, JWT, bcrypt, Zod |
| Frontend   | React 18, TypeScript, Vite, React Router, Axios             |
| Banco      | PostgreSQL 16                                            |
| Infra      | Docker, Docker Compose e CI no GitHub Actions            |

Veja a justificativa detalhada de cada escolha no [Memorial Técnico](docs/MEMORIAL_TECNICO.md).

## Pré-requisitos

### Opção A — com Docker (recomendado, sem necessidade de instalar Node ou Postgres)

- [Docker](https://www.docker.com/) e Docker Compose (já incluído no Docker Desktop)

### Opção B — execução manual

- [Node.js](https://nodejs.org/) 20 ou superior
- [PostgreSQL](https://www.postgresql.org/) 16 (local ou em container)
- npm (instalado junto com o Node.js)

## Executando com Docker (recomendado)

Na raiz do projeto:

```bash
docker compose up --build
```

Esse comando sobe três containers:

1. **db** — PostgreSQL 16, na porta `5433` do host (mapeada para a porta interna `5432`, para não conflitar com um Postgres que você já tenha rodando localmente na porta padrão).
2. **backend** — API Node/Express, na porta `4000`. Ao iniciar, o container **aplica as migrations do Prisma automaticamente e popula o banco com os usuários/solicitações de demonstração** (idempotente — pode subir e descer quantas vezes quiser sem duplicar dados).
3. **frontend** — aplicação React compilada e servida via Nginx, na porta `5173`.

Após subir, acesse:

- **Aplicação (frontend):** http://localhost:5173
- **API (backend):** http://localhost:4000/api
- **Healthcheck da API:** http://localhost:4000/health

Para derrubar os containers:

```bash
docker compose down
```

Para derrubar e também apagar os dados persistidos do banco (reset completo):

```bash
docker compose down -v
```

> As variáveis de ambiente usadas pelos containers já vêm definidas em `docker-compose.yml` com valores de desenvolvimento. Para um ambiente real, troque principalmente `JWT_SECRET` e as credenciais do banco (veja [Configuração](#configuração-variáveis-de-ambiente)).

## Executando manualmente (sem Docker)

### 1. Banco de dados

Crie um banco PostgreSQL vazio, por exemplo:

```sql
CREATE DATABASE portal_solicitacoes;
CREATE USER portal_user WITH PASSWORD 'portal_pass';
GRANT ALL PRIVILEGES ON DATABASE portal_solicitacoes TO portal_user;
```

(Se preferir, suba só o banco via Docker: `docker compose up -d db` — ele fica disponível em `localhost:5433`.)

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# edite o .env se os dados do seu banco forem diferentes dos valores padrão

npx prisma migrate deploy   # cria as tabelas (equivalente ao database/schema.sql)
npm run prisma:seed         # popula usuários e solicitações de demonstração

npm run dev                 # inicia a API em modo desenvolvimento (http://localhost:4000)
```

Outros comandos úteis do backend:

```bash
npm run build   # compila o TypeScript para dist/
npm start       # executa a versão compilada (dist/server.js)
npx prisma studio  # interface visual para inspecionar o banco
```

### 3. Frontend

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env
# por padrão já aponta para http://localhost:4000/api

npm run dev   # inicia em http://localhost:5173
```

## Configuração (variáveis de ambiente)

### Backend (`backend/.env`, veja `backend/.env.example`)

| Variável                 | Descrição                                                            | Padrão (dev)                                            |
|--------------------------|-----------------------------------------------------------------------|------------------------------------------------------------|
| `PORT`                   | Porta em que a API escuta                                             | `4000`                                                      |
| `DATABASE_URL`           | String de conexão PostgreSQL                                          | `postgresql://portal_user:portal_pass@localhost:5433/portal_solicitacoes?schema=public` |
| `JWT_SECRET`             | Segredo usado para assinar o token de sessão                          | *(troque em produção)*                                      |
| `JWT_EXPIRES_IN_SECONDS` | Duração da sessão em segundos — usada tanto para assinar o JWT quanto como `maxAge` do cookie, para as duas nunca ficarem dessincronizadas | `28800` (8h) |
| `CORS_ORIGIN`            | Origem do frontend autorizada a chamar a API com cookies              | `http://localhost:5173`                                     |
| `NODE_ENV`               | `development` ou `production`                                         | `development`                                               |

### Frontend (`frontend/.env`, veja `frontend/.env.example`)

| Variável        | Descrição                      | Padrão (dev)                     |
|-----------------|----------------------------------|-------------------------------------|
| `VITE_API_URL`  | URL base da API consumida pelo frontend | `http://localhost:4000/api`   |

## Acesso — usuários de demonstração

O seed (`backend/prisma/seed.ts`, executado automaticamente pelo Docker ou manualmente via `npm run prisma:seed`) cria dois colaboradores de teste, ambos com a senha `senha123`:

| E-mail                       | Senha      |
|-------------------------------|------------|
| `ana.silva@empresa.com`       | `senha123` |
| `bruno.costa@empresa.com`     | `senha123` |

A tela de login já vem pré-preenchida com o primeiro usuário para agilizar a avaliação.

## Estrutura do projeto

```
mini-projeto/
├── .github/workflows/        # pipeline de CI (build do backend e do frontend)
├── backend/                  # API (Node + Express + TypeScript + Prisma)
│   ├── prisma/                # schema, migrations e seed do banco
│   └── src/
│       ├── config/             # configuração de ambiente e do Prisma Client
│       ├── controllers/        # camada HTTP: recebe request, chama o service, devolve response
│       ├── services/           # regras de negócio
│       ├── routes/             # definição das rotas e amarração dos middlewares
│       ├── middlewares/        # autenticação, validação e tratamento de erros
│       ├── validators/         # schemas Zod de validação de entrada
│       └── utils/              # erros customizados e helpers
├── frontend/                  # SPA (React + TypeScript + Vite)
│   └── src/
│       ├── api/                 # chamadas HTTP à API (um módulo por recurso)
│       ├── contexts/            # contexto de autenticação (estado global do usuário logado)
│       ├── components/          # componentes reutilizáveis (layout, rota protegida, cards, badges, gráfico, ícones)
│       ├── pages/                # uma página por rota
│       └── types/                # tipos TypeScript compartilhados
├── database/                  # script SQL de criação + dicionário de dados
├── docs/                       # Memorial Técnico de Desenvolvimento
└── docker-compose.yml
```

## Documentação da API

Todas as rotas (exceto `/health` e `/api/auth/login`) exigem autenticação via cookie de sessão (enviado automaticamente pelo navegador após o login).

| Método | Rota                             | Descrição                                               |
|--------|-----------------------------------|------------------------------------------------------------|
| POST   | `/api/auth/login`                 | Autentica com e-mail/senha e inicia a sessão                |
| POST   | `/api/auth/logout`                | Encerra a sessão atual                                      |
| GET    | `/api/auth/me`                    | Retorna o usuário autenticado                                |
| GET    | `/api/dashboard`                  | Indicadores: total, abertas, em atendimento, concluídas      |
| POST   | `/api/solicitacoes`               | Cria uma nova solicitação                                    |
| GET    | `/api/solicitacoes`               | Lista solicitações (filtros: `status`, `categoria`, `texto`, `dataInicio`, `dataFim`, `page`, `pageSize`) |
| GET    | `/api/solicitacoes/:id`           | Detalha uma solicitação                                      |
| PUT    | `/api/solicitacoes/:id`           | Edita uma solicitação (somente dono + status Aberto)         |
| DELETE | `/api/solicitacoes/:id`           | Exclui uma solicitação (somente dono + status Aberto)        |
| PATCH  | `/api/solicitacoes/:id/status`    | Altera o status da solicitação                                |

Erros de validação retornam `400` com a lista de campos inválidos; erros de autenticação `401`; de permissão `403`; de recurso inexistente `404`.

<details>
<summary>Exemplo: login + consulta autenticada (curl)</summary>

```bash
# Login — grava o cookie de sessão em cookies.txt
curl -i -c cookies.txt -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.silva@empresa.com","senha":"senha123"}'

# Requisição autenticada reaproveitando o cookie salvo
curl -b cookies.txt http://localhost:4000/api/dashboard
```

</details>

## Banco de dados

- Modelo definido em [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma).
- Script SQL de criação (independente do Prisma): [`database/schema.sql`](database/schema.sql).
- Migration gerada automaticamente: [`backend/prisma/migrations/20251001000000_init/migration.sql`](backend/prisma/migrations/20251001000000_init/migration.sql).
- Dicionário de dados completo: [`database/DICIONARIO_DE_DADOS.md`](database/DICIONARIO_DE_DADOS.md).

## Evidências da aplicação funcionando

| Login | Dashboard |
|---|---|
| ![Login](docs/screenshots/01-login.png) | ![Dashboard](docs/screenshots/02-dashboard.png) |

| Listagem com filtros | Detalhe da solicitação |
|---|---|
| ![Listagem](docs/screenshots/03-lista-solicitacoes.png) | ![Detalhe](docs/screenshots/04-detalhe-solicitacao.png) |

| Nova solicitação |
|---|
| ![Nova solicitação](docs/screenshots/05-nova-solicitacao.png) |

## Documentação adicional

- [Memorial Técnico de Desenvolvimento](docs/MEMORIAL_TECNICO.md) — tecnologias utilizadas, justificativas técnicas e conceituais, e análise crítica da solução.

## Autor

**Tiago Costa dos Santos Costa**
📧 [tiagocostadossantoscosta@gmail.com](mailto:tiagocostadossantoscosta@gmail.com)

Projeto desenvolvido para o processo seletivo de Desenvolvedor(a) de Sistemas Júnior da bit Soluções.
