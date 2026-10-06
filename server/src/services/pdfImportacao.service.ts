// Import library entry directly: the package root runs a debug fixture when module.parent is absent.
const pdfParse: typeof import('pdf-parse') = require('pdf-parse/lib/pdf-parse.js');
import { extractTableRows } from './pdfParser.service';
import { parseCalendarDate, validPhone } from './regulacaoConfiavel.service';

export async function lerPdf(buffer: Buffer) {
  const pages: string[] = [];
  // pdf.js needs Uint8Array slice semantics; Buffer.slice shares memory.
  const data = new Uint8Array(buffer);
  await pdfParse(data as any, { pagerender: async (page: any) => {
    const content = await page.getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false });
    let text = '', lastY: number | undefined;
    for (const item of content.items) {
      const y = item.transform?.[5];
      text += lastY === y || lastY === undefined ? item.str : `\n${item.str}`;
      lastY = y;
    }
    pages.push(text);
    return text;
  } } as any);
  const text = pages.join('\n\f\n');
  const rows = extractTableRows(text);
  const anchors = [...text.matchAll(/\d{2}:\d{2}\s*-\s*\n/g)];
  const local = text.match(/PROFISSIONAL:[\s\S]*?-\s*UNIDADE\s+([\s\S]*?)\n[^\n]*AGENDA:/i)?.[1]?.replace(/\s+/g,' ').trim() || null;
  const indexed = rows.map((row, i) => ({ ...row, local_atendimento: local, source_index: i + 1,
    source_page: anchors[i] ? text.slice(0, anchors[i].index).split('\f').length : null,
  }));
  const declared = text.match(/QUANTIDADE\s+(?:DE\s+)?ATENDIMENTO\s*:\s*(\d+)/i);
  const declaredCount = declared ? Number(declared[1]) : null;
  return { rows: indexed, text, declaredCount,
    warning: declaredCount !== null && declaredCount !== rows.length ? `O PDF informa ${declaredCount} pacientes, mas foram extraídos ${rows.length}. Confira antes de aprovar.` : null };
}

export function validarLinhaPdf(raw: any): string | null {
  const errors: string[] = [];
  if (typeof raw.name !== 'string' || raw.name.trim().length < 3 || raw.name === 'Novo Paciente') errors.push('Nome obrigatório');
  if (!/^\d{15}$/.test(String(raw.cns_raw || '').replace(/\D/g,'')) && !/^\d{6,10}$/.test(String(raw.ficha || ''))) errors.push('Informe CNS ou ficha válida');
  if (!validPhone(raw.phone_raw)) errors.push('Celular inválido');
  if (!raw.local_atendimento?.trim()) errors.push('Local do atendimento obrigatório');
  if (!raw.procedure_name?.trim()) errors.push('Procedimento obrigatório');
  if (!parseCalendarDate(raw.scheduled_date_raw)) errors.push('Data de agendamento inválida');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(raw.hora_raw || '')) errors.push('Horário inválido');
  const nascimento=parseCalendarDate(raw.birth_date_raw);
  if (!nascimento || nascimento > new Date()) errors.push('Data de nascimento inválida');
  return errors.length ? errors.join('; ') : null;
}
