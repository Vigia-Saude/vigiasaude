export interface ParsedRow {
  ficha: string | null;
  name: string | null;
  cns_raw: string | null;
  phone_raw: string | null;
  birth_date_raw: string | null;
  procedure_name: string | null;
  cid10: string | null;
  scheduled_date_raw: string | null;
}

/**
 * Extrai os registros da agenda impressa pelo sistema da Regulação (SES-MS).
 * Cada linha de paciente começa com "HH:MM -" (horário). Os campos são
 * localizados por âncoras textuais (CNS:, TELEFONE:, data dd/mm/aaaa) em vez
 * de posição fixa, tratando nomes que variam no número de quebras de linha.
 */
export function extractTableRows(text: string): ParsedRow[] {
  const agendaMatch = text.match(/AGENDA:\s*(\d{2}\/\d{2}\/\d{4})/);
  const scheduledDateRaw = agendaMatch?.[1] ?? null;

  const parts = text.split(/(\d{2}:\d{2}\s*-)\s*\n/).slice(1);
  const rows: ParsedRow[] = [];

  for (let i = 0; i < parts.length; i += 2) {
    const chunk = parts[i + 1];
    if (!chunk) continue;

    const fichaMatch = chunk.match(/(\d{6,8})([A-ZÀ-Ú])/);
    const cnsMatch = chunk.match(/CNS:\s*\n?\s*(\d{15})/);
    const telMatch = chunk.match(/TELEFONE:\s*(\d{2,3})\s*\n?\s*(\d{6,9})/);
    const birthMatch = chunk.match(/-(\d{2}\/\d{2}\/\d{4})/);
    const cidMatch = chunk.match(/([A-Z]\d{3})\s*-\s*EXAME/);

    let name: string | null = null;
    if (fichaMatch && cnsMatch) {
      const nameStart = chunk.indexOf(fichaMatch[0]) + fichaMatch[1].length;
      const nameEnd = chunk.indexOf('CNS:');
      name = chunk.slice(nameStart, nameEnd).replace(/\s+/g, ' ').trim();
    }

    let procedureName: string | null = null;
    if (fichaMatch) {
      procedureName = chunk
        .slice(0, chunk.indexOf(fichaMatch[0]))
        .replace(/^EXAME\s*-\s*EXTERNO\s*/i, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    rows.push({
      ficha: fichaMatch?.[1] ?? null,
      name,
      cns_raw: cnsMatch?.[1] ?? null,
      phone_raw: telMatch ? telMatch[1] + telMatch[2] : null,
      birth_date_raw: birthMatch?.[1] ?? null,
      procedure_name: procedureName || null,
      cid10: cidMatch?.[1] ?? null,
      scheduled_date_raw: scheduledDateRaw,
    });
  }

  return rows;
}
