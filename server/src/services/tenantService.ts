import prisma from '../config/prisma';

interface CadastrarUnidadeInput {
  nome: string;
  cnes?: string;
  endereco?: string;
  telefone?: string;
}

function gerarTenantSchema(nome: string): string {
  const slug = nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 50);
  return `tenant_${slug}`;
}

export async function cadastrarUnidade(input: CadastrarUnidadeInput): Promise<string> {
  const tenantSchema = gerarTenantSchema(input.nome);

  const result = await prisma.$queryRaw<[{ provisionar_tenant: string }]>`
    SELECT public.provisionar_tenant(
      ${tenantSchema}::text,
      ${input.nome}::text,
      ${input.cnes ?? null}::text,
      ${input.endereco ?? null}::text,
      ${input.telefone ?? null}::text
    )
  `;

  return result[0]!.provisionar_tenant;
}

export async function listarUnidades() {
  return prisma.$queryRaw<
    { id: string; nome: string; cnes: string | null; tenant_schema: string; ativa: boolean }[]
  >`
    SELECT id, nome, cnes, tenant_schema, ativa
    FROM public.unidades
    WHERE deleted_at IS NULL
    ORDER BY nome
  `;
}
