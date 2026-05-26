import { XMLParser, XMLValidator } from 'fast-xml-parser';

type XmlRecord = Record<string, unknown>;

export interface ParsedNfeItem {
  medicamentoCatmatId: string;
  lote: string;
  validade: string;
  quantidade_esperada: number;

  // Aliases aceitos pelo POST /api/cd/notas-fiscais atual.
  catmatCodigo: string;
  medicamentoNome: string;
  numeroLote: string;
  dataValidade: string;
  quantidadeEsperada: number;
  precoUnitario: number;
}

export interface ParsedNfeXml {
  numeroNf: string;
  numeroNF: string;
  serie: string;
  chaveAcesso: string;
  fornecedorCnpj: string;
  dataEmissao: string;
  valorTotal: number;
  itens: ParsedNfeItem[];
}

export class NfeXmlParseError extends Error {
  constructor(
    message: string,
    public readonly issues: string[] = [message],
  ) {
    super(message);
    this.name = 'NfeXmlParseError';
  }
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
  removeNSPrefix: true,
});

export function parseNfeXml(xml: string): ParsedNfeXml {
  if (typeof xml !== 'string' || xml.trim().length === 0) {
    throw new NfeXmlParseError('XML da NF-e vazio ou inválido.');
  }

  const validation = XMLValidator.validate(xml);
  if (validation !== true) {
    const message = validation.err
      ? `XML da NF-e corrompido na linha ${validation.err.line}, coluna ${validation.err.col}: ${validation.err.msg}`
      : 'XML da NF-e corrompido.';
    throw new NfeXmlParseError(message);
  }

  let parsed: unknown;
  try {
    parsed = parser.parse(xml);
  } catch {
    throw new NfeXmlParseError('Não foi possível interpretar o XML da NF-e.');
  }

  const root = asRecord(parsed);
  if (!root) {
    throw new NfeXmlParseError('XML fora do padrão nacional da SEFAZ: raiz do documento inválida.');
  }
  const infNfe = findFirstRecordByKey(root, 'infNFe');
  if (!infNfe) {
    throw new NfeXmlParseError('XML fora do padrão nacional da SEFAZ: tag <infNFe> não encontrada.');
  }

  const ide = asRecord(infNfe.ide);
  const emit = asRecord(infNfe.emit);
  const det = asArray(infNfe.det).map(asRecord).filter(Boolean) as XmlRecord[];
  const total = asRecord(asRecord(infNfe.total)?.ICMSTot);

  const numeroNf = readRequiredString(ide, 'nNF', 'tag <ide><nNF> ausente.');
  const serie = readRequiredString(ide, 'serie', 'tag <ide><serie> ausente.');
  const dataEmissao = readRequiredString(ide, 'dhEmi', 'tag <ide><dhEmi> ausente.');
  const fornecedorCnpj = onlyDigits(readRequiredString(emit, 'CNPJ', 'tag <emit><CNPJ> ausente.'));
  const chaveAcesso = extractChaveAcesso(root, infNfe);
  const valorTotal = parseRequiredNumber(total, 'vNF', 'tag <total><ICMSTot><vNF> ausente ou inválida.');

  const issues: string[] = [];
  if (fornecedorCnpj.length !== 14) {
    issues.push('tag <emit><CNPJ> deve conter 14 dígitos.');
  }
  if (!isValidDateLike(dataEmissao)) {
    issues.push('tag <ide><dhEmi> contém data de emissão inválida.');
  }
  if (!/^\d{44}$/.test(chaveAcesso)) {
    issues.push('chave de acesso da NF-e deve conter 44 dígitos.');
  }
  if (det.length === 0) {
    issues.push('XML fora do padrão nacional da SEFAZ: nenhum item <det> encontrado.');
  }

  const itens = det.flatMap((detItem, index) => parseItem(detItem, index, issues));
  if (itens.length === 0) {
    issues.push('Nenhum item de NF-e com rastreabilidade válida foi encontrado.');
  }

  if (issues.length > 0) {
    throw new NfeXmlParseError('XML da NF-e não possui os dados obrigatórios para entrada no CD.', issues);
  }

  return {
    numeroNf,
    numeroNF: numeroNf,
    serie,
    chaveAcesso,
    fornecedorCnpj,
    dataEmissao,
    valorTotal,
    itens,
  };
}

function parseItem(detItem: XmlRecord, index: number, issues: string[]): ParsedNfeItem[] {
  const prod = asRecord(detItem.prod);
  const itemLabel = `Item ${index + 1}${readString(prod, 'cProd') ? ` (${readString(prod, 'cProd')})` : ''}`;

  if (!prod) {
    issues.push(`${itemLabel}: tag <prod> ausente.`);
    return [];
  }

  const rastros = asArray(prod.rastro).map(asRecord).filter(Boolean) as XmlRecord[];
  if (rastros.length === 0) {
    issues.push(`${itemLabel}: tag <prod><rastro> ausente; lote e validade são obrigatórios.`);
    return [];
  }

  const cProd = readRequiredItemString(prod, 'cProd', `${itemLabel}: tag <prod><cProd> ausente.`, issues);
  const xProd = readString(prod, 'xProd');
  const quantidadeEsperada = parseItemNumber(prod, 'qCom', `${itemLabel}: tag <prod><qCom> ausente ou inválida.`, issues);
  const precoUnitario = parseItemNumber(prod, 'vUnCom', `${itemLabel}: tag <prod><vUnCom> ausente ou inválida.`, issues);

  return rastros.flatMap((rastro, rastroIndex) => {
    const rastroLabel = rastros.length > 1 ? `${itemLabel}, rastro ${rastroIndex + 1}` : itemLabel;
    const lote = readRequiredItemString(rastro, 'nLote', `${rastroLabel}: tag <rastro><nLote> ausente.`, issues);
    const validade = readRequiredItemString(rastro, 'dVal', `${rastroLabel}: tag <rastro><dVal> ausente.`, issues);

    if (validade && !isValidDateLike(validade)) {
      issues.push(`${rastroLabel}: tag <rastro><dVal> contém data inválida.`);
    }

    if (!cProd || !lote || !validade || quantidadeEsperada === null || precoUnitario === null) {
      return [];
    }

    return [{
      medicamentoCatmatId: cProd,
      lote,
      validade,
      quantidade_esperada: quantidadeEsperada,
      catmatCodigo: cProd,
      medicamentoNome: xProd ?? cProd,
      numeroLote: lote,
      dataValidade: validade,
      quantidadeEsperada,
      precoUnitario,
    }];
  });
}

function extractChaveAcesso(root: XmlRecord, infNfe: XmlRecord): string {
  const protChave = readString(findFirstRecordByKey(root, 'infProt'), 'chNFe');
  if (protChave) return onlyDigits(protChave);

  const directChave = readString(root, 'chNFe') ?? readString(findFirstRecordByKey(root, 'NFe'), 'chNFe');
  if (directChave) return onlyDigits(directChave);

  const id = readString(infNfe, '@_Id');
  if (id) return onlyDigits(id.replace(/^NFe/i, ''));

  throw new NfeXmlParseError('XML fora do padrão nacional da SEFAZ: chave de acesso não encontrada em <chNFe> ou no atributo Id de <infNFe>.');
}

function asRecord(value: unknown): XmlRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as XmlRecord : null;
}

function asArray(value: unknown): unknown[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function findFirstRecordByKey(record: XmlRecord | null, key: string): XmlRecord | null {
  if (!record) return null;
  const direct = asRecord(record[key]);
  if (direct) return direct;

  for (const value of Object.values(record)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = findFirstRecordByKey(asRecord(item), key);
        if (found) return found;
      }
    } else {
      const found = findFirstRecordByKey(asRecord(value), key);
      if (found) return found;
    }
  }

  return null;
}

function readString(record: XmlRecord | null, key: string): string | null {
  if (!record) return null;
  const value = record[key];
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function readRequiredString(record: XmlRecord | null, key: string, message: string): string {
  const value = readString(record, key);
  if (!value) throw new NfeXmlParseError(message);
  return value;
}

function readRequiredItemString(record: XmlRecord | null, key: string, message: string, issues: string[]): string | null {
  const value = readString(record, key);
  if (!value) issues.push(message);
  return value;
}

function parseRequiredNumber(record: XmlRecord | null, key: string, message: string): number {
  const value = parseNumber(readString(record, key));
  if (value === null) throw new NfeXmlParseError(message);
  return value;
}

function parseItemNumber(record: XmlRecord | null, key: string, message: string, issues: string[]): number | null {
  const value = parseNumber(readString(record, key));
  if (value === null) issues.push(message);
  return value;
}

function parseNumber(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function isValidDateLike(value: string): boolean {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
}
