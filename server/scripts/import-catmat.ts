/**
 * Script de Importação da Base CATMAT
 *
 * Uso:
 *   npx ts-node scripts/import-catmat.ts [caminho-do-arquivo.csv]
 *
 * Se não informar o caminho, usa o padrão: ../../catmat_medicamentos.csv
 * (relativo à raiz do projeto: VigiaSaude/catmat_medicamentos.csv)
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ─── Configuração do Prisma com adapter PG (igual ao resto do projeto) ────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface RawRow {
  codigo_br?: string;
  descricao?: string;
  unidade_fornecimento?: string;
  [key: string]: string | undefined;
}

interface Stats {
  total: number;
  importados: number;
  atualizados: number;
  ignorados: number;
  erros: number;
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

/** Remove espaços extras e padroniza o valor */
function limpar(valor: string | undefined): string {
  return (valor ?? '').trim().replace(/\s+/g, ' ');
}

/** Padroniza codigo_br em maiúsculo e sem espaços */
function normalizarCodigo(codigo: string): string {
  return limpar(codigo).toUpperCase();
}

/** Lê o CSV e retorna um array de objetos */
async function lerCsv(caminhoArquivo: string): Promise<RawRow[]> {
  return new Promise((resolve, reject) => {
    const rows: RawRow[] = [];

    fs.createReadStream(caminhoArquivo, { encoding: 'utf8' })
      .pipe(
        parse({
          columns: true,           // usa a primeira linha como header
          skip_empty_lines: true,
          trim: true,
          bom: true,               // remove BOM UTF-8 se presente
          relax_quotes: true,
          relax_column_count: true,
        })
      )
      .on('data', (row: RawRow) => rows.push(row))
      .on('error', reject)
      .on('end', () => resolve(rows));
  });
}

// ─── Função principal ─────────────────────────────────────────────────────────
async function importarCatmat() {
  // Determina o caminho do arquivo CSV
  const csvArg = process.argv[2];
  const csvPath = csvArg
    ? path.resolve(csvArg)
    : path.resolve(__dirname, '..', '..', 'catmat_medicamentos.csv');

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  📋  IMPORTAÇÃO DA BASE CATMAT — VigiaSaúde');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  Arquivo: ${csvPath}`);
  console.log(`  Banco:   ${(process.env.DATABASE_URL ?? '').replace(/:([^:@]+)@/, ':****@')}`);
  console.log('══════════════════════════════════════════════════════════\n');

  // ── Verificar se o arquivo existe ──────────────────────────────────────────
  if (!fs.existsSync(csvPath)) {
    console.error(`❌  Arquivo não encontrado: ${csvPath}`);
    console.error('   Informe o caminho como argumento: npx ts-node scripts/import-catmat.ts <caminho>');
    process.exit(1);
  }

  // ── Ler CSV ────────────────────────────────────────────────────────────────
  console.log('📂  Lendo arquivo CSV...');
  let rows: RawRow[];
  try {
    rows = await lerCsv(csvPath);
  } catch (err) {
    console.error('❌  Erro ao ler o CSV:', err);
    process.exit(1);
  }
  console.log(`✅  ${rows.length} linhas encontradas no arquivo.\n`);

  if (rows.length === 0) {
    console.warn('⚠️   Nenhuma linha encontrada no CSV. Encerrando.');
    process.exit(0);
  }

  // ── Validar colunas obrigatórias ───────────────────────────────────────────
  const primeiraLinha = rows[0];
  const colunasEncontradas = Object.keys(primeiraLinha).map((c) => c.toLowerCase());
  const colunasObrigatorias = ['codigo_br', 'descricao', 'unidade_fornecimento'];
  const colunasFaltando = colunasObrigatorias.filter(
    (col) => !colunasEncontradas.includes(col)
  );

  if (colunasFaltando.length > 0) {
    console.error('❌  Colunas obrigatórias ausentes no CSV:');
    colunasFaltando.forEach((c) => console.error(`   - ${c}`));
    console.error(`\n   Colunas encontradas: ${colunasEncontradas.join(', ')}`);
    process.exit(1);
  }
  console.log('✅  Colunas obrigatórias validadas: codigo_br, descricao, unidade_fornecimento\n');

  // ── Processar e importar ───────────────────────────────────────────────────
  const stats: Stats = { total: rows.length, importados: 0, atualizados: 0, ignorados: 0, erros: 0 };
  const BATCH_SIZE = 200; // Lotes para não sobrecarregar a conexão
  let loteAtual: typeof rows = [];

  console.log(`🚀  Iniciando importação em lotes de ${BATCH_SIZE} registros...\n`);

  const processar = async (lote: typeof rows) => {
    for (const row of lote) {
      const codigoRaw = row['codigo_br'] ?? row['CODIGO_BR'] ?? '';
      const descricaoRaw = row['descricao'] ?? row['DESCRICAO'] ?? '';
      const unidadeRaw = row['unidade_fornecimento'] ?? row['UNIDADE_FORNECIMENTO'] ?? '';

      const codigoBr = normalizarCodigo(codigoRaw);
      const descricao = limpar(descricaoRaw);
      const unidadeFornecimento = limpar(unidadeRaw);

      // Ignorar linhas sem código ou descrição
      if (!codigoBr || !descricao) {
        stats.ignorados++;
        continue;
      }

      try {
        const existing = await prisma.catmatMedicamento.findUnique({
          where: { codigoBr },
          select: { id: true, descricao: true, unidadeFornecimento: true },
        });

        if (existing) {
          // Atualizar se houver diferença
          if (
            existing.descricao !== descricao ||
            existing.unidadeFornecimento !== unidadeFornecimento
          ) {
            await prisma.catmatMedicamento.update({
              where: { codigoBr },
              data: { descricao, unidadeFornecimento },
            });
            stats.atualizados++;
          } else {
            stats.ignorados++; // Sem mudança
          }
        } else {
          // Inserir novo
          await prisma.catmatMedicamento.create({
            data: { codigoBr, descricao, unidadeFornecimento },
          });
          stats.importados++;
        }
      } catch (err) {
        console.error(`   ⚠️  Erro no registro ${codigoBr}:`, err);
        stats.erros++;
      }
    }
  };

  // Processar em lotes exibindo progresso
  for (let i = 0; i < rows.length; i++) {
    loteAtual.push(rows[i]);

    if (loteAtual.length >= BATCH_SIZE || i === rows.length - 1) {
      await processar(loteAtual);
      loteAtual = [];

      const processados = Math.min(i + 1, rows.length);
      const pct = Math.round((processados / rows.length) * 100);
      const barra = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
      process.stdout.write(`\r  [${barra}] ${pct}% — ${processados}/${rows.length}`);
    }
  }

  // ── Relatório Final ────────────────────────────────────────────────────────
  console.log('\n\n══════════════════════════════════════════════════════════');
  console.log('  📊  RELATÓRIO FINAL DE IMPORTAÇÃO');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  Total de linhas no CSV : ${stats.total}`);
  console.log(`  ✅  Importados (novos) : ${stats.importados}`);
  console.log(`  🔄  Atualizados        : ${stats.atualizados}`);
  console.log(`  ⏭️   Sem alteração      : ${stats.ignorados}`);
  console.log(`  ❌  Erros              : ${stats.erros}`);
  console.log('══════════════════════════════════════════════════════════\n');

  if (stats.erros > 0) {
    console.warn(`⚠️   ${stats.erros} registros falharam. Verifique os logs acima.`);
  } else {
    console.log('🎉  Importação concluída com sucesso!');
  }

  await prisma.$disconnect();
  await pool.end();
}

// ── Executar ───────────────────────────────────────────────────────────────────
importarCatmat().catch((err) => {
  console.error('\n❌  Erro fatal durante a importação:', err);
  process.exit(1);
});
