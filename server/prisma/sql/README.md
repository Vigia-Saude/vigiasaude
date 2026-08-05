# Scripts SQL e registro de decisões de banco

A verdade do schema é `prisma/migrations/0_init/`. Esta pasta guarda apenas o
que o Prisma não expressa: decisões operacionais e scripts pendentes.

## Pendente

| Arquivo | O que faz |
|---|---|
| `04-restaurar-foreign-keys.sql` | Restaura 8 foreign keys ausentes no banco. **Não executado** — o bloco 2 apaga um registro órfão real e essa decisão é sua. |

## Aplicado em 2026-08-05 (auditoria de banco)

Nada a executar. Registro do que mudou e por quê.

### Tabelas removidas

- `schools`, `escola_usuarios`, `restricoes_alimentares` — resíduo de outro
  projeto (merenda escolar). Zero referências no código, no `schema.prisma` e
  nas functions do banco.
- `permissoes_perfil` — model declarado mas nunca lido nem escrito. A
  autorização real acontece em `roleMiddleware()` (arrays de perfis nas rotas)
  mais `usuarios.permissoes_extras`.
- `catmat_medicamentos` — estava com 0 linhas e quebrava o autocomplete do
  cadastro de ATA. Substituída por `etl_catmat`, que tem 3.343 registros e é
  mais rica (princípio ativo, concentração, forma farmacêutica).

  Consequências: `codigo_br` não é único em `etl_catmat` (a unicidade real é a
  combinação com princípio ativo, concentração, forma e unidade), então
  `CatmatController.buscarPorCodigo` usa `findFirst`, não `findUnique`. O
  importador CSV `scripts/import-catmat.ts` e o bloco de carga do seed foram
  removidos: `etl_catmat` pertence ao ETL, e um segundo escritor recriaria a
  divergência que causou o problema.

### RLS habilitado

Row Level Security ligado em 18 tabelas que estavam abertas, entre elas
`pacientes` (CPF, cartão SUS, nome da mãe, endereço, alergias — dado sensível
sob o art. 11 da LGPD). A API REST do Supabase é pública, então essas tabelas
eram legíveis e graváveis por quem tivesse a anon key, sem passar pelo Express.

Foi seguro porque a aplicação não usa `supabase-js`: o backend fala com o banco
via Prisma como owner (`postgres`), que faz BYPASSRLS.

Confirme em **Settings → API** que apenas `public` está em *Exposed schemas*.

### Preços de referência

Criada a função `public.normalizar_substancia(text)` (IMMUTABLE, para poder
indexar) e três índices funcionais em `etl_catmat`, `etl_cmed` e `etl_bps`.

Servem a `precoReferencia.service.ts`, que liga CATMAT ↔ BPS ↔ CMED por
princípio ativo normalizado. O elo não pode ser por código: o CATMAT usa o
código BR (`BR0270558-2`) e o BPS usa o código de material do ComprasNet
(`393138`) — o join direto retorna zero linhas.

## Regras de trabalho com o banco

Não use `prisma db push` contra produção. Ele considera tabelas fora do
`schema.prisma` como estranhas e propõe removê-las — as tabelas ETL (~425 MB de
preços oficiais) já estiveram a um comando de serem apagadas por isso. Hoje
estão declaradas no schema como models somente-leitura, o que neutraliza o
risco, mas o hábito continua perigoso.

Fluxo correto:

```bash
# ver exatamente o que mudaria antes de qualquer coisa
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma

npx prisma migrate dev     # só em ambiente local
npx prisma migrate deploy  # em produção
```
