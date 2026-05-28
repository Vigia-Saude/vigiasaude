# Vigia Saúde — Referência Rápida do Projeto

> **Leia esta seção antes de explorar qualquer arquivo.** Contém o mapa completo do sistema. Última atualização: 2026-05-26.

## Identidade
- **Sistema:** Vigia Saúde — gestão de medicamentos para saúde pública municipal
- **Supabase project_id:** `oxanubfolkoulklrhrpr` (região `sa-east-1`, status `ACTIVE_HEALTHY`)
- **Branch ativa:** `developer` → merges para `main`
- **Stack:** React 19 + Vite 8 (frontend) | Express 5 + Prisma 7 + Node.js (backend) | PostgreSQL 17 via Supabase
- **Deploy frontend:** Vercel (`vercel.json` na raiz)
- **Monorepo:** `src/` = frontend, `server/` = backend. Dois `package.json` independentes.

---

## Estrutura de Arquivos — Mapa Crítico

```
vigiasaude/
├── src/                          # Frontend React 19
│   ├── pages/                    # Atas/, Pedidos/, Fornecedores/, Dashboard/, Auth/
│   ├── components/               # Atas/, Dashboard/, Layout/, ui/ (shadcn)
│   ├── services/                 # apiClient.ts + *Service.ts (chamadas REST)
│   ├── context/                  # AuthContext, ThemeContext
│   └── routes/                   # Roteamento React Router v7
└── server/                       # Backend Express 5
    ├── prisma/
    │   ├── schema.prisma          # Schema público (Hub Central) — FONTE DA VERDADE
    │   └── schema.tenant.prisma  # Referência do schema por farmácia (não migrado diretamente)
    └── src/
        ├── index.ts              # Entry point Express; porta 3001
        ├── config/prisma.ts      # Cliente Prisma padrão (schema public)
        ├── lib/prismaFactory.ts  # getPrismaForSchema(schema) — clientes tenant dinâmicos
        ├── middlewares/
        │   ├── auth.ts           # authMiddleware + roleMiddleware; injeta req.user
        │   └── tenantMiddleware.ts
        ├── routes/
        │   ├── apiRoutes.ts      # Todas as rotas /api/* (requer JWT)
        │   └── authRoutes.ts     # /auth/login, /auth/register (público)
        ├── controllers/          # Um arquivo por domínio (classe com arrow functions)
        │   ├── AtaController.ts
        │   ├── AuditoriaController.ts
        │   ├── AuthController.ts
        │   ├── CatmatController.ts
        │   ├── CdController.ts   # Módulo CD (NF, estoque, recall, alertas)
        │   ├── DashboardController.ts
        │   ├── FornecedorController.ts
        │   ├── PedidoController.ts
        │   └── UploadController.ts
        └── services/
            └── tenantService.ts  # cadastrarUnidade() chama provisionar_tenant() no DB
```

---

## Database — Schema `public` (Hub Central)

### Padrão universal das PKs
Todas as PKs são `TEXT DEFAULT gen_random_uuid()::text` — **não** UUID nativo PostgreSQL. Toda FK deve ser `TEXT NOT NULL REFERENCES`.

### Tabelas

| Tabela | Propósito | Soft Delete |
|---|---|---|
| `usuarios` | Usuários globais. Campos: `role`, `perfil`, `status`, `unidade_id`, `tenant_schema`, `fornecedor_id` | `deleted_at` |
| `fornecedores` | CNPJ único. Campos: `razao_social`, `nome_fantasia`, `taxa_aceitacao`, `categorias[]` | `deleted_at` |
| `unidades` | Unidade de saúde. Campos: `cnes`, `tenant_schema` (ex: `tenant_farmacia_centro`) | — |
| `atas` | Ata de Registro de Preço. Status: `ATIVA/VENCIDA/CANCELADA/EM_REVISAO/ESGOTADA` | `deleted_at` |
| `medicamentos_ata` | Itens de cada ATA. Campos: `catmat_codigo`, `preco_unitario`, `qtde_inicial`, `quantidade_usada`, `saldo_atual` | — |
| `ata_consumos` | Consumo de item de ATA, opcionalmente vinculado a pedido | — |
| `pedidos_compra` | Pedido de compra vinculado a ATA+fornecedor. Status: `RASCUNHO/PENDENTE/APROVADO/EM_TRANSITO/ENTREGUE/CANCELADO/ACEITO/REJEITADO` | `deleted_at` |
| `pedido_itens` | Itens do pedido com `ata_item_id` e preço | — |
| `catmat_medicamentos` | Catálogo federal CATMAT — 4.730 itens. `codigo_br` é único (ex: `BR0270027`). Read-only. | — |
| `auditorias` | Audit trail JSONB. Campos: `usuario_id`, `acao`, `entidade_id`, `dados_antes`, `dados_depois` | — |
| `permissoes_perfil` | Matriz de permissões por perfil | — |
| `notas_fiscais` | NF de entrada no CD. Status: `PENDENTE→CONFERIDA/CONFERIDO_DIVERGENCIA/CANCELADA`. Campos: `chave_acesso` (44 dígitos), `conferido_por`, `conferido_em` | `deleted_at` |
| `nota_fiscal_itens` | Itens da NF. `quantidade_esperada` (XML) vs `quantidade_recebida` (física). Flag `divergencia` boolean | — |
| `cd_estoque_lotes` | Lotes no CD pós-conferência. Status: `DISPONIVEL/BLOQUEADO_RECALL/ESGOTADO/VENCIDO`. Vinculado 1-1 com `nota_fiscal_itens` | `deleted_at` |
| `recalls` | Recall global por `catmat_codigo`+`numero_lote` (ambos opcionais individualmente). `ativo` boolean | — |
| `alertas_cd` | Alertas automáticos gerados por triggers. `perfis_destinatarios TEXT[]`. Status: `NOVO/LIDO/RESOLVIDO` | — |

### Funções PostgreSQL Customizadas

| Função | Assinatura | Propósito |
|---|---|---|
| `provisionar_tenant` | `(schema TEXT, nome TEXT, cnes TEXT?, endereco TEXT?, telefone TEXT?) → TEXT` | Cria schema tenant completo (tabelas + triggers + RLS). Chamada por `tenantService.ts`. |
| `is_lote_bloqueado_recall` | `(numero_lote TEXT, catmat_codigo TEXT) → BOOLEAN` | Verifica recall ativo. `SECURITY DEFINER`. Usada em triggers e pela API. |

### Triggers Críticos

| Trigger | Tabela | Tipo | O que faz |
|---|---|---|---|
| `trg_recall_insert` | `public.recalls` | AFTER INSERT (ativo=true) | Bloqueia lotes em `cd_estoque_lotes` + cria alerta SECRETARIO_SAUDE |
| `trg_recall_update` | `public.recalls` | AFTER UPDATE (ativo: false→true) | Idem acima |
| `trg_nfi_conferencia` | `public.nota_fiscal_itens` | AFTER UPDATE OF `quantidade_recebida` | Detecta divergência → muda status NF → cria alerta (deduplica por NF) |
| `trg_baixa_estoque` | `{tenant}.dispensacao_itens` | AFTER INSERT | Decrementa `quantidade_atual` do lote |
| `trg_dispensacao_recall` | `{tenant}.dispensacao_itens` | BEFORE INSERT | Chama `is_lote_bloqueado_recall()`; lança exceção `P0001` se bloqueado |

---

## Multi-tenancy

- Cada unidade/farmácia tem schema próprio: `tenant_farmacia_{slug}` (ex: `tenant_farmacia_centro`)
- **Regra de criação:** SEMPRE via `public.provisionar_tenant()` — nunca criar schema manualmente
- `getPrismaForSchema(schema)` em `server/src/lib/prismaFactory.ts` retorna cliente Prisma com `search_path={schema},public`
- Usa `DATABASE_URL_DIRECT` (conexão direta, sem pooler) para clientes tenant
- Clientes tenant são cacheados em Map; limpar com `disposePrismaForSchema(schema)`

### Tabelas por Schema Tenant
`medicamentos`, `lotes`, `pacientes`, `prescricoes`, `dispensacoes`, `dispensacao_itens`

---

## Auth & Autorização

- **Mecanismo:** JWT Bearer — header `Authorization: Bearer <token>`
- **`req.user`:** `{ id, role, perfil, tenantSchema, unidadeId, fornecedorId }`
- **`authMiddleware`:** valida JWT, injeta `req.user`
- **`roleMiddleware(['ROLE'])`:** verifica `req.user.role` OU `req.user.perfil` contra lista permitida

### ENUMs de Auth

| ENUM | Valores |
|---|---|
| `Role` | `COMPRADOR`, `FORNECEDOR` |
| `Perfil` | `SECRETARIO_SAUDE`, `GESTOR_ESTOQUE`, `FARMACIA`, `MEDICO`, `ENTREGADOR` |
| `UsuarioStatus` | `PENDENTE`, `ATIVO`, `RECUSADO`, `DESATIVADO` |

---

## API Endpoints — Catálogo Completo

Base URL: `/api` (todas requerem JWT exceto auth)

### Auth (`/auth`)
| Método | Rota | Acesso |
|---|---|---|
| POST | `/auth/login` | público |
| POST | `/auth/register` | público |

### Hub Central
| Método | Rota | Controller | Guard |
|---|---|---|---|
| GET | `/unidades` | tenantService | JWT |
| GET | `/dashboard/stats` | DashboardController | JWT |
| GET | `/atas` | AtaController | JWT |
| GET | `/atas/:id` | AtaController | JWT |
| POST | `/atas` | AtaController | JWT |
| POST | `/atas/:ataId/consumos` | AtaController | JWT |
| GET | `/catmat/buscar` | CatmatController | JWT |
| GET | `/catmat/:codigoBr` | CatmatController | JWT |
| POST | `/upload` | UploadController | JWT |
| GET | `/pedidos` | PedidoController | JWT |
| GET | `/pedidos/:id` | PedidoController | JWT |
| POST | `/pedidos` | PedidoController | JWT |
| PUT | `/pedidos/:id` | PedidoController | JWT |
| PATCH | `/pedidos/:id/status` | PedidoController | JWT |
| PATCH | `/pedidos/:id/entrega` | PedidoController | JWT |
| GET | `/auditoria` | AuditoriaController | COMPRADOR |
| GET | `/fornecedores` | FornecedorController | JWT |
| GET | `/fornecedores/:id` | FornecedorController | JWT |
| POST | `/fornecedores` | FornecedorController | COMPRADOR |
| PUT | `/fornecedores/:id` | FornecedorController | COMPRADOR |
| PATCH | `/fornecedores/:id/status` | FornecedorController | COMPRADOR |

### Centro de Distribuição (CD)
| Método | Rota | Controller | Guard |
|---|---|---|---|
| POST | `/cd/notas-fiscais` | CdController | JWT |
| GET | `/cd/notas-fiscais` | CdController | JWT |
| GET | `/cd/notas-fiscais/:id` | CdController | JWT |
| POST | `/cd/notas-fiscais/:id/conferir` | CdController | JWT |
| GET | `/cd/estoque` | CdController | JWT |
| POST | `/cd/recalls` | CdController | COMPRADOR |
| GET | `/cd/recalls` | CdController | JWT |
| GET | `/cd/alertas` | CdController | JWT (filtrado por perfil) |
| PATCH | `/cd/alertas/:id/lido` | CdController | JWT |

---

## Domínio de Negócio — Glossário

| Termo | Definição |
|---|---|
| **ATA** | Ata de Registro de Preço — contrato público com fornecedor que define itens, preços teto e quantidades. Base de todo pedido de compra. |
| **CATMAT** | Catálogo de Materiais federal. `codigo_br` é o identificador global único de medicamento. |
| **CD** | Centro de Distribuição — recebe NFs dos fornecedores, confere fisicamente, abastece as farmácias tenant. |
| **Conferência de NF** | Comparação `quantidade_esperada` (XML do fornecedor) vs `quantidade_recebida` (contagem física). Divergência → alerta automático. |
| **Recall** | Bloqueio global de lote/produto. Ativado por INSERT em `recalls`. Impede CD e todos os tenants de usar o lote via trigger de banco. |
| **Tenant** | Schema PostgreSQL isolado por farmácia/unidade. Dados de pacientes e dispensações nunca cruzam schemas. |
| **Provisionar Tenant** | Ato de criar schema + tabelas + triggers + RLS via `provisionar_tenant()`. Registra unidade em `public.unidades`. |

---

## Padrões Específicos deste Projeto (Não Óbvios)

1. **PKs são TEXT, não UUID.** FK sempre `TEXT NOT NULL REFERENCES`. Nunca usar `UUID` nativo.
2. **Soft delete via `deleted_at`.** Sempre filtrar `WHERE deleted_at IS NULL` em queries.
3. **Triggers são a camada primária de segurança** para recall e divergência de NF. A API é camada secundária.
4. **`prisma.$queryRaw`** é o padrão para chamar funções PostgreSQL customizadas.
5. **Novos tenants APENAS via `provisionar_tenant()`** — nunca DDL manual.
6. **Controllers usam classes com arrow functions:** `listar = async (req, res) => {}` — não métodos de protótipo.
7. **`roleMiddleware` aceita role OU perfil** — um usuário com `perfil: 'SECRETARIO_SAUDE'` passa em `roleMiddleware(['SECRETARIO_SAUDE'])`.
8. **Paginação por offset** (skip/take) — não por cursor. Padrão: `limit=50`, `page=1`.
9. **Uploads** ficam em `server/uploads/` gerenciados pelo Multer.
10. **Variáveis de ambiente críticas:** `DATABASE_URL` (pooler porta 6543), `DIRECT_URL` (porta 5432 para migrations), `DATABASE_URL_DIRECT` (host direto para tenants), `JWT_SECRET`.
11. **Retorno Paginado de Pedidos:** O endpoint `/api/pedidos` retorna um objeto paginado contendo `{ data: PedidoCompra[], pagination: ... }` ao invés de um array direto. O frontend deve acessar `response.data.data` para obter a lista.
12. **Auto-cadastro de Fornecedor via XML:** O parser de XML (`/api/cd/notas-fiscais/xml`) realiza o auto-cadastro automático do fornecedor (com CNPJ, Razão Social e Nome Fantasia) caso ele não exista no banco de dados, retornando o `fornecedorId` criado no JSON de resposta.

---

# Engenharia de Software e Boas Práticas - Projetos Dev

Este documento consolida a arquitetura, padrões tecnológicos e boas práticas extraídos dos sistemas desenvolvidos (SOM, Patrimônio, PNEU+ ERP/Home, Hotspot e SIEM). Ele serve como guia para a manutenção do ecossistema e como base para acelerar a criação de novos projetos via IA.

---

## 1. Padrões de Arquitetura e Stack Tecnológica

Os projetos seguem um ecossistema moderno voltado à alta produtividade e segurança corporativa:

### Frontend
* **Core:** React 18/19.
* **Frameworks:** Next.js (App Router + Turbopack) para projetos conteinerizados ou Vite para SPAs rápidas e painéis administrativos.
* **Estilização e Componentes:** TailwindCSS (v3/v4), Radix UI e componentes baseados no **shadcn/ui** (cards, botões, modais, inputs). Uso do `framer-motion` para micro-interações fluidas.
* **Estado:** TanStack Query (via integração tRPC) e Contextos (ex: AuthContext, ThemeContext).

### Backend
* **API e Tipagem:** **tRPC** é amplamente utilizado como substituto ao REST tradicional. As `procedures` permitem chamadas de backend fortemente tipadas diretamente do frontend, sem duplicar definições de tipos. Para endpoints públicos, utiliza-se Express ou rotas base do Next.js.
* **ORM e Banco de Dados:** Banco relacional sempre presente (PostgreSQL preferencialmente, ou MySQL/MariaDB). Gerenciamento de banco feito majoritariamente pelo **Drizzle ORM** (ou Prisma), garantindo migrações automáticas e tipagem estrita SQL-like.
* **Armazenamento / Arquivos:** Integração com NAS (protocolos SMB), MinIO (S3 compatible) e disco local (uploads controlados e em streaming via Multer).

### Infraestrutura e Deploy
* **Docker First:** Adoção unânime do Docker e Docker Compose (`docker-compose.yml`), empacotando os serviços (`db`, `cache`, `api`, `frontend`). Scripts `.sh` ou `.ps1` de inicialização automatizada e entrada via `docker-entrypoint.sh`.
* **Ambiente Híbrido:** Variáveis configuradas em múltiplos `.env` (ex: `.env.local`, `.env.homolog`).

---

## 2. Boas Práticas Estruturais e de Código

1. **Validação de Inputs (Zod):** Tudo o que transita na rede ou em variáveis de ambiente é validado usando Zod, impedindo dados corrompidos.
2. **Soft Deletes:** Nenhuma entidade sensível (Usuários, Ativos, Movimentações) recebe Hard Delete. É utilizada uma flag `deletedAt` tratada em todos os selects do ORM.
3. **Paginação com Cursores:** Em listagens extensas, utiliza-se "Cursores" com desempate por data e ID (`tie-breaker`), evitando duplicação e pulos de registros, algo comum na paginação por `offset`.
4. **Tratamento de Tema:** Utilização nativa do `next-themes` ou de variáveis CSS (tokens semânticos do Tailwind, como `bg-muted` e `dark:bg-slate-900`) garantindo suporte inteligente a Light/Dark Mode sem flashes (`ThemeApplier`).
5. **Auditoria (`Audit Trails`):** Tabelas isoladas (ex: `audit_logs`) que interceptam e salvam mudanças (quem alterou, ação, dados anteriores, dados novos). Possui scripts de "cleanup" para remoção de logs antigos mantendo o DB enxuto.

---

## 3. Gestão de Usuários, Autenticação e Perfil

Este é o fluxo padrão robusto que deve ser adotado (ou reusado) em todo novo projeto:

### Segurança e Login
* Senhas recebem hashing com **bcryptjs** (dinâmico ou de custo no mínimo 10).
* Autenticação transita via JWT (em cookies `HttpOnly`, `SameSite=Lax`, `Secure`) ou via provedor **NextAuth** (Credentials Provider).
* **Rate Limiting e Anti-Enumeração:** O backend limita as tentativas (ex: 10 em 15 minutos por IP e por E-mail). Respostas são genéricas ("Credenciais inválidas"), evitando confirmar para atacantes se o email existe.
* Usuários possuem flags de obrigatoriedade de re-login ou atualização de senha periódica.

### Perfil e Recuperação de Senha
* Os sistemas incluem a página `/profile` para gestão da própria conta, requerendo inserção da "senha atual" para realizar a troca pela "senha nova".
* Recuperação de senha implementada por fluxo de Tokens Temporários: A API cria um registro único e criptografado (`password_reset_tokens`), válido por tempo limitado, e gera um Link que dispara e-mail (via Nodemailer) ao usuário.

### Autorização Granular (RBAC)
* Abandono de "Roles Simples" (Admin/Viewer) em favor de Permissões Granulares (`permissions` e `groups`).
* Exemplo: Middleware avalia se o usuário autenticado contém a flag `asset.create` ou `settings.users` antes da execução (`requirePermission`).
* Menus na `Sidebar` reagem ao hook de permissões, escondendo opções automaticamente.

### Sugestão de Autenticação de Dois Fatores (2FA - TOTP)
*(Estrutura pronta para acoplar)*
* **Banco:** Colunas extras no `users`: `totp_secret` (texto) e `is_2fa_enabled` (bool).
* **Setup:** Rota gera o secret (via lib `otplib`), retorna um QRCode e o usuário escaneia (Google Authenticator/Authy).
* **Verificação:** Ao logar, a API confere o JWT com status `pending_2fa`. O Frontend exibe campo pro código. A rota envia os 6 dígitos para o servidor, valida e emite o Token final da sessão.

---

## 4. Prompts de IA Reutilizáveis (Para Agentes e Novos Projetos)

Caso precise criar um novo projeto, copie os prompts abaixo para alimentar sua IA de programação, garantindo o seguimento dos padrões estabelecidos:

### Prompt 1: Inicialização do Repositório (Base Next.js)
> **Prompt:** "Inicialize um projeto novo em Next.js (App Router), React 19, TypeScript e TailwindCSS v4. Instale e configure o shadcn/ui. Inclua o pacote tRPC v11 e integre com o Drizzle ORM apontando para PostgreSQL. Quero também que você crie um `docker-compose.yml` local para subir a base de dados PostgreSQL e gere o schema do Zod para validação das variáveis de ambiente (`DATABASE_URL`, `JWT_SECRET`)."

### Prompt 2: Sistema de Autenticação e Usuários
> **Prompt:** "Baseado no Drizzle ORM, crie o schema de banco de dados para gestão de Usuários com permissões granulares granulares. Crie as tabelas `users`, `permissions`, `groups`, `group_permissions` e `user_groups`. Inclua soft-delete (`deletedAt`) e a senha usando hashing (`bcrypt_hash`). Após os schemas, construa os routers do tRPC com middlewares protegidos: um para listar os usuários com paginação em cursor, outro para criar o usuário com validação completa no Zod e outro para desativar. Adicione uma funcionalidade de log automático inserindo na tabela `audit_logs` quando um usuário for editado."

### Prompt 3: Regras de Segurança, Rate Limit e Login
> **Prompt:** "Escreva a rota/endpoint de login do sistema. O body da requisição deve ser validado por Zod. Implemente 'In-Memory Rate Limiting' que bloqueie as chamadas se ultrapassarem 10 tentativas a cada 15 minutos do mesmo IP. Muito importante: retorne uma mensagem de erro genérica ('Credenciais inválidas') tanto para senha incorreta quanto para usuário inexistente. Caso o login seja bem-sucedido, defina um cookie de sessão assinado JWT com as tags `HttpOnly`, `SameSite=Lax` e `Secure` (caso em produção)."

### Prompt 4: View de Perfil e Reset de Senha (com UI)
> **Prompt:** "Usando componentes shadcn/ui (Card, Button, Label, Input e toast do Sonner), crie a página de Perfil (`/profile`), onde o usuário pode alterar sua própria senha. Para a rota no backend via tRPC, é OBRIGATÓRIO receber a `senha atual`, a `nova senha` e validar o bcrypt antes de atualizar. Crie também o fluxo esqueci a senha: o backend cria um UUID em uma tabela `reset_tokens` vinculada ao userId com expiração de 1 hora. Construa as telas React que fazem essa chamada."

### Prompt 5: Adição de 2FA (TOTP)
> **Prompt:** "Quero adicionar Autenticação de Dois Fatores. Crie um endpoint backend que gere um secret TOTP (com otplib) e devolva um URI para formar um QRCode para Authy/Google Authenticator. Crie um endpoint de validação. Ajuste o controlador de login original para: se o usuário tiver `is_2fa_enabled` no banco de dados, o login não devolve a sessão completa; devolve um status `require_2fa` e o frontend deve redirecionar para uma tela que pede o PIN de 6 dígitos. Após validar este PIN no servidor, o token JWT real é emitido."

---
_Gerado a partir da inteligência extraída dos arquivos CLAUDE.md, READMEs, Dockerfiles e código fonte dos sistemas PNEU+, SOM, Patrimônio e parceiros._
