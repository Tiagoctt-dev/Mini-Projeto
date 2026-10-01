# Memorial Técnico de Desenvolvimento

**Projeto:** Portal de Solicitações Internas
**Processo seletivo:** Desenvolvedor(a) de Sistemas Júnior — bit Soluções
**Candidato:** Tiago Costa dos Santos Costa

Este documento registra o processo decisório adotado no desenvolvimento da solução: as tecnologias escolhidas e por quê, as decisões de arquitetura, e uma análise crítica honesta sobre limitações e melhorias futuras.

---

## 1. Tecnologias utilizadas

| Categoria                    | Tecnologia                           |
|-------------------------------|----------------------------------------|
| Linguagem (back e front)      | TypeScript                             |
| Runtime backend               | Node.js 20                             |
| Framework backend              | Express                                |
| ORM / camada de acesso a dados | Prisma ORM                             |
| Banco de dados                 | PostgreSQL 16                          |
| Autenticação                   | JSON Web Token (JWT) + cookie `httpOnly` |
| Hash de senha                  | bcrypt (via `bcryptjs`)                |
| Validação de dados             | Zod                                    |
| Framework frontend              | React 18                               |
| Build tool / dev server frontend | Vite                                  |
| Roteamento frontend             | React Router v6                        |
| Cliente HTTP                    | Axios                                  |
| Containerização                 | Docker e Docker Compose                |
| Servidor web para os estáticos  | Nginx (dentro do container do frontend)|

---

## 2. Justificativa técnica por tecnologia

### TypeScript (backend e frontend)

- **Motivo da escolha:** tipagem estática reduz uma classe inteira de bugs (campos inexistentes, tipos trocados entre camadas) antes mesmo de rodar o código, e melhora a navegabilidade do projeto.
- **Benefícios no cenário proposto:** o domínio tem poucas entidades, mas vários formatos de payload (filtros, formulários, respostas paginadas) — o compilador garante que backend e frontend concordam sobre esses formatos em tempo de desenvolvimento.
- **Vantagens em relação a JavaScript puro:** autocomplete mais confiável, refatorações seguras (renomear um campo quebra a build em vez de falhar silenciosamente em produção).
- **Impacto:** maior produtividade a médio prazo e menor custo de manutenção, ao custo de uma configuração inicial (tsconfig, tipos) ligeiramente maior.

### Node.js + Express

- **Motivo da escolha:** é a stack com a qual tenho mais familiaridade para expressar rapidamente regras de negócio como as deste desafio (CRUD com regras condicionais de permissão), e permite usar a mesma linguagem (TypeScript) em todo o projeto.
- **Benefícios:** ecossistema maduro, Express é minimalista e não impõe estrutura — o que obrigou a pensar explicitamente na organização em camadas (ver seção 3) em vez de herdar uma estrutura de framework.
- **Vantagens em relação a alternativas (ex.: NestJS, Fastify):** para o tamanho deste projeto (duas entidades, ~10 endpoints), um framework mais robusto como NestJS adicionaria complexidade (módulos, injeção de dependência, decorators) sem benefício proporcional. Fastify traria desempenho superior, mas Express tem a documentação e comunidade mais extensas, o que reduz risco em um projeto com prazo curto.
- **Impacto:** boa produtividade inicial; em uma aplicação que crescesse muito em número de módulos, migrar para um framework mais opinativo (NestJS) passaria a compensar pela injeção de dependência e organização nativa em módulos.

### Prisma ORM

- **Motivo da escolha:** gera um cliente TypeScript totalmente tipado a partir do schema, elimina SQL manual para as operações comuns, e gerencia migrations versionadas automaticamente.
- **Benefícios no cenário proposto:** o `schema.prisma` funciona como fonte única da verdade do modelo de dados — documentação, geração de migration e geração de tipos partem do mesmo arquivo, reduzindo divergência entre "o banco real" e "o que o código assume que existe".
- **Vantagens em relação a alternativas (ex.: TypeORM, Knex, SQL puro):** comparado a SQL puro, elimina erros de digitação em queries e já tipa o retorno; comparado a TypeORM, tem uma API mais previsível e as migrations são geradas automaticamente por diff de schema em vez de escritas manualmente.
- **Impacto:** acelera bastante o desenvolvimento de CRUDs e reduz bugs de acesso a dados; a contrapartida é uma dependência a mais na stack e menor controle fino sobre queries muito específicas (mitigável com `$queryRaw` quando necessário).

### PostgreSQL

- **Motivo da escolha:** banco relacional maduro, gratuito, com suporte nativo a tipos `ENUM` (usados para `categoria` e `status`, garantindo integridade dos valores permitidos diretamente no banco, não apenas na aplicação).
- **Benefícios:** transações ACID adequadas a um sistema de registro de solicitações (ex.: contagem de indicadores do dashboard usa `$transaction` para ler os quatro contadores de forma consistente).
- **Vantagens em relação a alternativas:** frente ao MySQL, tem suporte mais rico a tipos (enums nativos, JSON, full-text search) que podem ser aproveitados em evoluções futuras; frente a um banco NoSQL, o domínio é claramente relacional (solicitação pertence a um usuário, consultas por múltiplos filtros), o que favorece um modelo relacional com índices.
- **Impacto:** é o banco relacional mais comum em ambientes corporativos atualmente, o que facilita manutenção por outros desenvolvedores e portabilidade para serviços gerenciados (RDS, Cloud SQL, etc.) sem reescrever a camada de dados.

### JWT em cookie `httpOnly` (estratégia de autenticação)

- **Motivo da escolha:** autenticação stateless (o servidor não precisa manter sessão em memória/Redis) combinada com armazenamento do token em cookie `httpOnly`, não acessível via JavaScript no navegador.
- **Benefícios:** reduz a superfície de ataque a roubo de token via XSS, que é o principal risco de guardar JWT em `localStorage`. O cookie é enviado automaticamente pelo navegador (`withCredentials` no Axios + CORS configurado com `credentials: true` e origem explícita).
- **Vantagens em relação a alternativas:** sessão tradicional em servidor (ex.: `express-session` + store) exigiria um banco/Redis adicional só para sessões; JWT em `localStorage` é mais simples de implementar, mas expõe o token a XSS. O cookie `httpOnly` busca um meio-termo adequado ao escopo do projeto.
- **Impacto:** simplifica o deploy (sem infraestrutura extra de sessão) e mantém uma boa postura de segurança básica; a limitação é que revogar um token antes da expiração natural exigiria uma lista de revogação, não implementada aqui (ver seção 5).

### bcrypt (bcryptjs)

- **Motivo da escolha:** algoritmo padrão de mercado para hash de senhas, com custo computacional ajustável (fator de trabalho) que dificulta ataques de força bruta mesmo se o banco vazar.
- **Benefícios/impacto:** nenhuma senha é armazenada em texto puro; o custo (10 rounds) é o padrão recomendado atualmente, equilibrando segurança e tempo de resposta no login.

### Zod

- **Motivo da escolha:** validação de entrada declarativa e com inferência de tipos TypeScript a partir do próprio schema de validação — evita duplicar a definição de um formato de dado (uma vez em tipo, outra em validação).
- **Vantagens em relação a alternativas (ex.: Joi, express-validator):** Zod gera o tipo TypeScript automaticamente (`z.infer`), então o validador e o tipo nunca ficam dessincronizados, o que não acontece nativamente com Joi ou express-validator.
- **Impacto:** todas as regras de formato (tamanho mínimo de título, enum de categoria/status, formato de e-mail) ficam centralizadas em `backend/src/validators`, com mensagens em português já formatadas para o frontend exibir diretamente ao usuário.

### React + Vite

- **Motivo da escolha:** React é a biblioteca de UI mais usada atualmente, com grande disponibilidade de documentação e de desenvolvedores que poderiam dar manutenção ao projeto. Vite oferece um dev server extremamente rápido (HMR quase instantâneo) e build de produção otimizado, sem a complexidade de configuração do Webpack.
- **Vantagens em relação a alternativas (ex.: Angular, Vue, Create React App):** frente ao CRA (hoje descontinuado), Vite é o substituto natural e recomendado pela própria comunidade React; frente a Angular/Vue, a escolha segue a mesma lógica de familiaridade e de aderência ao perfil profissional mais comum no mercado atual.
- **Impacto:** build de produção pequeno e rápido (ver `frontend/Dockerfile`, que compila e serve apenas os arquivos estáticos finais via Nginx).

### React Router + Context API (sem Redux)

- **Motivo da escolha:** o estado global necessário é pequeno (usuário autenticado), não justificando a complexidade adicional do Redux. A Context API do próprio React (`AuthContext`) resolve isso de forma direta.
- **Impacto:** menos dependências, menos boilerplate; se o projeto crescesse e precisasse de cache de servidor mais sofisticado (ex.: invalidação automática de listas após mutações), adotar uma lib como React Query seria o próximo passo natural.

### Docker e Docker Compose

- **Motivo da escolha:** permite que o avaliador suba banco, backend e frontend com um único comando (`docker compose up --build`), sem precisar instalar Node ou PostgreSQL localmente, e elimina divergências de ambiente ("na minha máquina funciona").
- **Benefícios:** o container do backend já aplica as migrations do Prisma e popula os dados de demonstração automaticamente ao subir, tornando a entrega verdadeiramente "pronta para uso".
- **Impacto:** maior confiabilidade da entrega e reprodutibilidade; o custo é a necessidade de manter Dockerfiles multi-stage (build e runtime separados) para imagens finais enxutas.

---

## 3. Justificativa conceitual (arquitetura)

### 3.1 Estrutura geral da aplicação

A aplicação segue uma arquitetura **cliente-servidor desacoplada**: um frontend SPA (React) consome uma API REST (Express) via HTTP/JSON, e a API é a única camada com acesso ao banco de dados. Essa separação permite que cada parte evolua, seja testada e seja implantada de forma independente.

```
┌──────────────┐        HTTPS/JSON         ┌──────────────┐        SQL        ┌──────────────┐
│   Frontend    │  ───────────────────────▶ │   Backend     │ ─────────────────▶ │  PostgreSQL   │
│  React + Vite │ ◀─────────────────────── │ Express + TS   │ ◀───────────────── │              │
└──────────────┘     cookie httpOnly        └──────────────┘      Prisma         └──────────────┘
```

### 3.2 Organização em camadas do backend

O backend segue uma separação de responsabilidades em quatro camadas, cada uma em seu próprio diretório:

```
routes        → define endpoints e aplica middlewares (auth, validate)
controllers   → traduz request/response HTTP; não contém regra de negócio
services      → contém as regras de negócio (quem pode editar o quê, cálculo de indicadores)
Prisma Client → acesso a dados (faz o papel de camada de repositório)
```

Essa divisão existe para que, por exemplo, uma regra como "só o dono pode editar uma solicitação aberta" (`garantirEdicaoPermitida` em `solicitacoes.service.ts`) fique isolada da camada HTTP — podendo ser reaproveitada ou testada sem precisar simular uma requisição Express.

Duas camadas transversais (middlewares) cobrem preocupações que se repetem em várias rotas:

- `middlewares/auth.ts` — verifica o cookie de sessão e popula `req.user`.
- `middlewares/validate.ts` — valida `body`/`query`/`params` contra um schema Zod antes do controller rodar.
- `middlewares/errorHandler.ts` — centraliza a tradução de erros (de validação, do Prisma ou de regra de negócio) em respostas HTTP consistentes, evitando `try/catch` repetido em cada controller (viabilizado pelo `asyncHandler`, que encaminha rejeições de Promise para o Express).

### 3.3 Estratégia de modelagem de dados

O modelo tem duas tabelas (`usuarios` e `solicitacoes`) ligadas por uma chave estrangeira, e dois valores de domínio (`categoria`, `status`) modelados como **ENUM nativo do PostgreSQL** em vez de uma tabela de apoio ou uma string livre. Essa escolha:

- garante, no próprio banco, que apenas os valores previstos no edital possam ser gravados (defesa em profundidade: a validação não depende só do Zod na aplicação);
- evita o overhead de tabelas de "categorias"/"status" para um conjunto de valores fixo e pequeno, que não é gerenciado por usuários finais.

O campo `solicitante_id` é obrigatório e protegido por `ON DELETE RESTRICT`, uma decisão deliberada: impedir a exclusão de um usuário que já tenha solicitações associadas, preservando o histórico (a alternativa, `ON DELETE CASCADE`, apagaria solicitações junto com o usuário — indesejável para um sistema de registro).

### 3.4 Estratégia de autenticação

Login por e-mail/senha gera um JWT assinado (`jsonwebtoken`) contendo `id`, `nome` e `email`, armazenado em um cookie `httpOnly`, `sameSite=lax` (e `secure` em produção). Todas as rotas de domínio (`/api/solicitacoes/*`, `/api/dashboard`) passam pelo middleware `requireAuth`, que rejeita com `401` qualquer requisição sem um token válido. Essa escolha concentra toda a lógica de "quem está logado" em um único middleware, reutilizado em todas as rotas protegidas via `router.use(requireAuth)`.

### 3.5 Estratégia de comunicação frontend ↔ backend

Comunicação via **REST sobre JSON**, com Axios configurado com `withCredentials: true` para que o cookie de sessão seja enviado automaticamente. No frontend, toda chamada HTTP passa por um módulo dedicado em `frontend/src/api/` (um arquivo por recurso: `auth.ts`, `solicitacoes.ts`, `dashboard.ts`), isolando o restante da aplicação de detalhes de URL, método HTTP e formato de payload — as páginas e componentes só conhecem funções como `criarSolicitacao(dados)`, nunca a URL `/api/solicitacoes` diretamente.

O estado de autenticação é compartilhado via `AuthContext`, que carrega o usuário atual (`GET /api/auth/me`) uma vez ao montar a aplicação e expõe `login`/`logout` para o restante da árvore de componentes. Rotas protegidas usam um componente `ProtectedRoute` (baseado em `<Outlet />` do React Router) que redireciona para `/login` quando não há usuário autenticado.

### 3.6 Padrões de projeto aplicados

- **Camada de serviço (Service Layer):** regras de negócio isoladas dos controllers (seção 3.2).
- **Middleware pattern:** autenticação, validação e tratamento de erros como funções compostas pelo Express, reaproveitadas em múltiplas rotas.
- **Repository (implícito via Prisma Client):** o Prisma Client atua como camada de acesso a dados, isolando o restante do backend de SQL cru.
- **DTO por schema de validação:** os schemas Zod em `validators/` funcionam como contrato de entrada (Data Transfer Object) de cada endpoint, validados antes de qualquer lógica de negócio rodar.

### 3.7 Organização do código-fonte

O repositório é um monorepo simples, com `backend/` e `frontend/` como projetos Node independentes (cada um com seu próprio `package.json`), mais `database/` (script SQL e dicionário de dados) e `docs/` (este memorial) na raiz. Essa estrutura permite buildar, testar e conteinerizar cada parte separadamente, refletida também no `docker-compose.yml`, que define um serviço por parte da aplicação.

---

## 4. Decisões de negócio explícitas (não triviais a partir do enunciado)

O edital deixa algumas regras em aberto; as decisões abaixo foram tomadas de forma deliberada e estão documentadas aqui para transparência:

1. **Quem pode editar/excluir uma solicitação "Aberta":** apenas o próprio solicitante. Decisão: evita que um colaborador altere ou apague solicitações de outro. Alternativa possível seria permitir a qualquer usuário (não implementada, por risco de uso indevido).
2. **Quem pode alterar o status:** qualquer usuário autenticado, não apenas um "atendente". Decisão: o edital não define papéis de usuário (todos são "colaboradores"), então não havia base para restringir essa ação a um papel que não existe no modelo. Isso é discutido como limitação na seção 5.
3. **Transições de status:** livres entre os três estados (Aberto, Em Atendimento, Concluído), sem máquina de estados que impeça, por exemplo, voltar de "Concluído" para "Aberto". Decisão: o edital não especifica um fluxo obrigatório, e restringir demais poderia atrapalhar casos legítimos (reabertura de uma solicitação concluída incorretamente).

---

## 5. Análise crítica

### Limitações da solução implementada

- **Ausência de papéis de usuário (RBAC):** todo usuário autenticado tem os mesmos poderes (pode ver e alterar o status de qualquer solicitação). Em um ambiente real, provavelmente existiria um papel de "atendente"/"administrador" com permissões diferentes das de um colaborador comum.
- **Sem testes automatizados:** dado o prazo do desafio, a prioridade foi entregar as funcionalidades completas e validadas manualmente (via requisições HTTP reais durante o desenvolvimento) em vez de escrever suíte de testes.
- **Sem pipeline de CI/CD:** o build e a validação do projeto foram feitos localmente; não há automação de testes/lint a cada push.
- **Sem histórico de alterações de status:** a tabela `solicitacoes` guarda apenas o status atual e `atualizado_em`, não um log de quem mudou o quê e quando.
- **Exclusão física (hard delete):** excluir uma solicitação remove o registro definitivamente, sem trilha de auditoria.
- **Sem rate limiting no login:** não há proteção explícita contra tentativas repetidas de força bruta no endpoint de autenticação.
- **Tipos duplicados manualmente entre backend e frontend:** os tipos TypeScript do domínio (`Solicitacao`, `Categoria`, etc.) são escritos uma vez no backend (Prisma) e replicados manualmente em `frontend/src/types`, já que são dois projetos/deploys independentes.

### Melhorias futuras

- Introduzir papéis de usuário (`colaborador` vs. `atendente`/`admin`), restringindo troca de status e visão de todas as solicitações ao segundo grupo.
- Adicionar uma tabela de histórico (`solicitacao_status_historico`) para rastrear cada mudança de status, com autor e timestamp.
- Adicionar testes automatizados: unitários para os `services` (regras de negócio) e de integração para os endpoints (ex.: Vitest/Jest + Supertest), além de testes de componentes no frontend (React Testing Library).
- Adicionar um pipeline de CI (ex.: GitHub Actions) rodando build, lint e testes a cada push/PR.
- Gerar os tipos compartilhados a partir de uma única fonte (ex.: publicar os tipos do Prisma/Zod como pacote interno, ou gerar um cliente a partir de um contrato OpenAPI), eliminando a duplicação manual de tipos entre backend e frontend.
- Adicionar rate limiting (`express-rate-limit`) e bloqueio temporário após tentativas de login malsucedidas.
- Soft delete (campo `excluido_em`) em vez de exclusão física, preservando histórico para auditoria.

### O que seria diferente em um ambiente corporativo de produção

- **Secrets:** `JWT_SECRET` e credenciais do banco viriam de um gerenciador de segredos (ex.: AWS Secrets Manager, Vault) em vez de variáveis de ambiente simples versionadas como exemplo no `.env.example`.
- **Observabilidade:** adicionar logging estruturado (ex.: Pino) e métricas/tracing, hoje inexistentes além dos logs padrão do Express/console.
- **Banco gerenciado:** usar um PostgreSQL gerenciado (RDS, Cloud SQL) com backups automáticos, em vez do container Docker usado neste desafio.
- **Autenticação:** possivelmente migrar para um fluxo de access token de vida curta + refresh token, permitindo revogação de sessão sem esperar a expiração natural do JWT.
- **Política de senhas e MFA:** não exigidas pelo edital, mas esperadas em um sistema corporativo real.
