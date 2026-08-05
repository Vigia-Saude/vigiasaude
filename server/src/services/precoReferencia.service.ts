import prisma from '../config/prisma';

/**
 * Preços de referência para compra pública.
 *
 * Duas fontes oficiais, com naturezas diferentes:
 *
 *  - BPS (Banco de Preços em Saúde): o que outros órgãos públicos REALMENTE
 *    pagaram. `preco_unitario` já vem por unidade de fornecimento, então é
 *    diretamente comparável ao preço unitário da ATA. É o parâmetro forte.
 *
 *  - CMED (Câmara de Regulação do Mercado de Medicamentos): o PMVG é o teto
 *    legal de venda ao governo, mas é publicado POR APRESENTAÇÃO ("CX 100 AMP
 *    VD AMB X 2 ML"), não por unidade. Converter isso para preço unitário
 *    exigiria interpretar texto livre e produziria número errado com
 *    frequência — em compra pública, um teto errado reprova proposta válida ou
 *    aprova proposta abusiva. Por isso NÃO derivamos preço unitário do CMED:
 *    devolvemos as apresentações encontradas para o comprador escolher a que
 *    corresponde ao item da ata.
 *
 * O elo entre CATMAT e as duas bases é o princípio ativo normalizado, porque
 * os identificadores não são compatíveis: o CATMAT usa o código BR
 * (BR0270558-2) e o BPS usa o código de material do ComprasNet (393138).
 */

export interface ResumoBps {
  precoMediano: number;
  precoMinimo: number;
  precoMaximo: number;
  anoCompra: number;
  amostras: number;
  unidadeFornecimento: string | null;
  /**
   * true  = amostras restritas à mesma unidade de fornecimento do item CATMAT.
   * false = não havia amostra na unidade certa, então a estatística mistura
   *         apresentações (comprimido com frasco, por exemplo) e serve só como
   *         ordem de grandeza.
   */
  filtradoPorUnidade: boolean;
}

export interface ApresentacaoCmed {
  produto: string;
  laboratorio: string | null;
  apresentacao: string;
  precoPmvg: number;
  aliquotaIcms: number | null;
  publicadoEm: Date;
}

export interface PrecosReferencia {
  codigoBr: string;
  principioAtivo: string | null;
  bps: ResumoBps | null;
  cmed: ApresentacaoCmed[];
  /** Avisos para exibir ao comprador (ex.: base sem cobertura para o item). */
  avisos: string[];
}

/** Resolve princípio ativo e unidade de fornecimento de um código BR do CATMAT. */
async function obterItemCatmat(
  codigoBr: string,
): Promise<{ principioAtivo: string; unidadeFornecimento: string | null } | null> {
  const registro = await prisma.catmatMedicamento.findFirst({
    where: { codigoBr, ativo: true },
    select: { principioAtivo: true, unidadeFornecimento: true },
  });
  if (!registro) return null;
  return {
    principioAtivo: registro.principioAtivo,
    unidadeFornecimento: registro.unidadeFornecimento,
  };
}

/**
 * Mediana dos preços praticados no BPS para o princípio ativo, restrita ao ano
 * de compra mais recente disponível. Mediana e não média: o BPS tem outliers
 * de compras emergenciais que distorcem a média para cima.
 *
 * `unidadeFornecimento` vem do CATMAT como texto longo ("Frasco 100 ml") e no
 * BPS como palavra única ("FRASCO"), por isso a comparação usa só o primeiro
 * termo. Sem esse recorte a estatística mistura comprimido com frasco e o
 * intervalo perde utilidade — em Amoxicilina, por exemplo, vai de R$ 0,19 a
 * R$ 22,86 sem o filtro e de R$ 0,71 a R$ 3,27 com ele.
 */
async function buscarResumoBps(
  principioAtivo: string,
  unidadeFornecimento: string | null,
  restringirPorUnidade: boolean,
): Promise<ResumoBps | null> {
  const unidadeAlvo = restringirPorUnidade ? (unidadeFornecimento ?? '') : null;

  const linhas = await prisma.$queryRaw<
    {
      preco_mediano: number | null;
      preco_minimo: number | null;
      preco_maximo: number | null;
      ano_compra: number | null;
      amostras: bigint;
      unidade_fornecimento: string | null;
    }[]
  >`
    WITH alvo AS (
      SELECT
        public.normalizar_substancia(${principioAtivo}) AS substancia,
        CASE
          WHEN ${unidadeAlvo}::text IS NULL THEN NULL
          ELSE public.normalizar_substancia(split_part(${unidadeAlvo}::text, ' ', 1))
        END AS unidade
    ),
    correspondencias AS (
      SELECT b.preco_unitario, b.ano_compra, b.unidade_fornecimento
      FROM public.etl_bps b, alvo
      WHERE public.normalizar_substancia(split_part(b.descricao_catmat, ',', 1)) = alvo.substancia
        AND (alvo.unidade IS NULL
             OR public.normalizar_substancia(b.unidade_fornecimento) = alvo.unidade)
        AND b.preco_unitario IS NOT NULL
        AND b.preco_unitario > 0
    ),
    ano_recente AS (
      SELECT max(ano_compra) AS ano FROM correspondencias
    )
    SELECT
      percentile_cont(0.5) WITHIN GROUP (ORDER BY c.preco_unitario)::float8 AS preco_mediano,
      min(c.preco_unitario)::float8                                        AS preco_minimo,
      max(c.preco_unitario)::float8                                        AS preco_maximo,
      max(c.ano_compra)                                                    AS ano_compra,
      count(*)                                                             AS amostras,
      mode() WITHIN GROUP (ORDER BY c.unidade_fornecimento)                AS unidade_fornecimento
    FROM correspondencias c, ano_recente a
    WHERE c.ano_compra = a.ano
  `;

  const linha = linhas[0];
  if (!linha || linha.preco_mediano === null || Number(linha.amostras) === 0) {
    return null;
  }

  return {
    precoMediano: Number(linha.preco_mediano),
    precoMinimo: Number(linha.preco_minimo),
    precoMaximo: Number(linha.preco_maximo),
    anoCompra: Number(linha.ano_compra),
    amostras: Number(linha.amostras),
    unidadeFornecimento: linha.unidade_fornecimento,
    filtradoPorUnidade: restringirPorUnidade,
  };
}

/**
 * Apresentações com PMVG vigente para o princípio ativo. Considera apenas a
 * publicação mais recente da CMED e a alíquota de ICMS 0%, que é a aplicável
 * às compras públicas com isenção (CONFAZ 87/2002).
 */
async function buscarApresentacoesCmed(
  principioAtivo: string,
  limite: number,
): Promise<ApresentacaoCmed[]> {
  const linhas = await prisma.$queryRaw<
    {
      produto: string;
      laboratorio: string | null;
      apresentacao: string;
      preco_pmvg: number;
      aliquota_icms: number | null;
      publicado_em: Date;
    }[]
  >`
    WITH alvo AS (
      SELECT public.normalizar_substancia(${principioAtivo}) AS substancia
    ),
    produtos AS (
      SELECT m.codigo_ggrem, m.produto, m.laboratorio, m.apresentacao
      FROM public.etl_cmed m, alvo
      WHERE public.normalizar_substancia(m.substancia) = alvo.substancia
        AND m.comercializado IS NOT FALSE
    ),
    publicacao AS (
      SELECT max(publicado_em) AS em
      FROM public.etl_cmed_precos
      WHERE tipo_preco = 'PMVG'
    )
    -- A CMED publica várias linhas por apresentação (combinações de ALC e
    -- "sem impostos"). O DISTINCT ON interno mantém uma linha por produto,
    -- com o menor PMVG; a ordenação por preço fica na consulta externa, senão
    -- o LIMIT cortaria pela ordem de codigo_ggrem em vez da mais barata.
    SELECT * FROM (
      SELECT DISTINCT ON (p.codigo_ggrem)
        p.produto,
        p.laboratorio,
        p.apresentacao,
        pr.valor::float8         AS preco_pmvg,
        pr.aliquota_icms::float8 AS aliquota_icms,
        pr.publicado_em
      FROM produtos p
      JOIN public.etl_cmed_precos pr ON pr.codigo_ggrem = p.codigo_ggrem
      JOIN publicacao pub ON pr.publicado_em = pub.em
      WHERE pr.tipo_preco = 'PMVG'
        AND pr.valor IS NOT NULL
        AND pr.valor > 0
        AND coalesce(pr.aliquota_icms, 0) = 0
      ORDER BY p.codigo_ggrem, pr.valor ASC
    ) dedup
    ORDER BY dedup.preco_pmvg ASC
    LIMIT ${limite}
  `;

  return linhas.map((l) => ({
    produto: l.produto,
    laboratorio: l.laboratorio,
    apresentacao: l.apresentacao,
    precoPmvg: Number(l.preco_pmvg),
    aliquotaIcms: l.aliquota_icms === null ? null : Number(l.aliquota_icms),
    publicadoEm: l.publicado_em,
  }));
}

/** Consolida BPS + CMED para um código BR do CATMAT. */
export async function obterPrecosReferencia(
  codigoBr: string,
  limiteCmed = 10,
): Promise<PrecosReferencia> {
  const avisos: string[] = [];
  const item = await obterItemCatmat(codigoBr);

  if (!item) {
    return {
      codigoBr,
      principioAtivo: null,
      bps: null,
      cmed: [],
      avisos: [`Código ${codigoBr} não encontrado no catálogo CATMAT.`],
    };
  }

  const { principioAtivo, unidadeFornecimento } = item;

  // Primeiro tenta a estatística restrita à unidade de fornecimento do item.
  // Só relaxa o filtro se não houver nenhuma amostra — assim o número exibido é
  // o mais preciso disponível, e o comprador sabe quando ele é aproximado.
  const [bpsRestrito, cmed] = await Promise.all([
    buscarResumoBps(principioAtivo, unidadeFornecimento, true),
    buscarApresentacoesCmed(principioAtivo, limiteCmed),
  ]);

  const bps =
    bpsRestrito ?? (await buscarResumoBps(principioAtivo, unidadeFornecimento, false));

  if (!bps) {
    avisos.push(
      `Sem histórico no Banco de Preços em Saúde para "${principioAtivo}". Informe o preço de referência manualmente.`,
    );
  } else if (!bps.filtradoPorUnidade) {
    avisos.push(
      `Não há compra registrada no BPS na unidade "${unidadeFornecimento ?? 'informada'}". Os valores abaixo misturam apresentações diferentes e servem apenas como ordem de grandeza.`,
    );
  }
  if (cmed.length === 0) {
    avisos.push(
      `Sem PMVG publicado pela CMED para "${principioAtivo}". Pode ser insumo/correlato, que não é regulado por preço-teto.`,
    );
  } else {
    avisos.push(
      'O PMVG da CMED é por apresentação (embalagem), não por unidade. Selecione a apresentação equivalente ao item da ata antes de usá-lo como teto.',
    );
  }

  return { codigoBr, principioAtivo, bps, cmed, avisos };
}
