export interface ParsedRow {
  ficha: string | null;
  name: string | null;
  cns_raw: string | null;
  phone_raw: string | null;
  birth_date_raw: string | null;
  age?: number | string | null;
  procedure_name: string | null;
  unidade_solicitante?: string | null;
  cid10: string | null;
  scheduled_date_raw: string | null;
  hora_raw?: string | null;
}

function calculateAgeFromBirthDate(birthDateStr: string | null): number | null {
  if (!birthDateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(birthDateStr)) return null;
  const [day, month, year] = birthDateStr.split('/').map(Number);
  const birth = new Date(year, month - 1, day);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

/**
 * Extrai os registros da agenda impressa pelo sistema da Regulacao (SES-MS).
 * Cada linha de paciente comeca com "HH:MM -" (horario). Os campos sao
 * localizados por ancoras textuais (CNS:, TELEFONE:, data dd/mm/aaaa) em vez
 * de posicao fixa, porque o nome do paciente quebra em numero de linhas
 * variavel — extracao posicional quebraria silenciosamente.
 * (Parser portado do PontaPoraSaude, validado com PDF real: 49/49 pacientes.)
 */
export function extractTableRows(text: string): ParsedRow[] {
  if (!text || text.trim().length === 0) return [];

  const agendaMatch =
    text.match(/AGENDA:\s*(\d{2}\/\d{2}\/\d{4})/) ||
    text.match(/(?:DATA|AGENDAMENTO):\s*(\d{2}\/\d{2}\/\d{4})/i);
  const scheduledDateRaw = agendaMatch?.[1] ?? null;

  const unidadeMatch = text.match(/(?:UNIDADE|POSTO|UBS):\s*([^\n\r]+)/i);
  const unidadeSolicitanteHeader = unidadeMatch?.[1]?.trim() || null;

  const parts = text.split(/(\d{2}:\d{2}\s*-)\s*\n/).slice(1);
  const rows: ParsedRow[] = [];

  for (let i = 0; i < parts.length; i += 2) {
    const timeHeader = parts[i];
    const chunk = parts[i + 1];
    if (!chunk) continue;

    const hora = timeHeader?.match(/(\d{2}:\d{2})/)?.[1] ?? null;

    const fichaMatch = chunk.match(/(\d{6,8})([A-ZÀ-Ú])/);
    const cnsMatch = chunk.match(/CNS:\s*\n?\s*(\d{15})/);
    const telMatch = chunk.match(/TELEFONE:\s*(\d{2,3})\s*\n?\s*(\d{6,9})/);
    const birthMatch = chunk.match(/-(\d{2}\/\d{2}\/\d{4})/);
    const cidMatch = chunk.match(/([A-Z]\d{3})\s*-\s*EXAME/);

    let name: string | null = null;
    if (fichaMatch && cnsMatch) {
      const nameStart = chunk.indexOf(fichaMatch[0]) + fichaMatch[1].length;
      const nameEnd = chunk.indexOf('CNS:');
      if (nameEnd > nameStart) {
        name = chunk.slice(nameStart, nameEnd).replace(/\s+/g, ' ').trim();
      }
    }

    let procedureName: string | null = null;
    if (fichaMatch) {
      procedureName = chunk
        .slice(0, chunk.indexOf(fichaMatch[0]))
        .replace(/^EXAME\s*-\s*EXTERNO\s*/i, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    const birthDateStr = birthMatch?.[1] ?? null;

    rows.push({
      ficha: fichaMatch?.[1] ?? null,
      name,
      cns_raw: cnsMatch?.[1] ?? null,
      phone_raw: telMatch ? telMatch[1] + telMatch[2] : null,
      birth_date_raw: birthDateStr,
      age: calculateAgeFromBirthDate(birthDateStr),
      procedure_name: procedureName || null,
      unidade_solicitante: unidadeSolicitanteHeader,
      cid10: cidMatch?.[1] ?? null,
      scheduled_date_raw: scheduledDateRaw,
      hora_raw: hora,
    });
  }

  if (rows.length > 0) return rows;

  // Fallback: relatorios em outros layouts, divididos por blocos com CNS/FICHA
  const cnsBlocks = text.split(/(?=(?:CNS|SUS|FICHA):\s*\d+)/i);
  for (const block of cnsBlocks) {
    const cnsMatch = block.match(/(?:CNS|SUS):\s*(\d{15})/i) || block.match(/\b([12789]\d{14})\b/);
    const fichaMatch = block.match(/(?:FICHA|SOLICITAÇÃO|SOLICITACAO):\s*(\d{6,10})/i);
    const telMatch = block.match(/(?:TELEFONE|TEL|FONE):\s*(\d{2,3})\s*\n?\s*(\d{6,9})/i) || block.match(/\b(67\d{8,9})\b/);
    const birthMatch = block.match(/(?:NASC|DN|NASCIMENTO):\s*(\d{2}\/\d{2}\/\d{4})/i) || block.match(/-(\d{2}\/\d{2}\/\d{4})/);
    const nameMatch = block.match(/([A-ZÀ-Ú]{2,}(?:\s+(?:D[AEO]S?\s+)?[A-ZÀ-Ú]{2,})+)/);

    if (!cnsMatch && !fichaMatch) continue;

    const birthDateStr = birthMatch?.[1] ?? null;

    rows.push({
      ficha: fichaMatch?.[1] ?? null,
      name: nameMatch?.[1]?.replace(/\s+/g, ' ').trim() ?? null,
      cns_raw: cnsMatch?.[1] ?? null,
      phone_raw: telMatch ? (telMatch[2] ? telMatch[1] + telMatch[2] : telMatch[1]) : null,
      birth_date_raw: birthDateStr,
      age: calculateAgeFromBirthDate(birthDateStr),
      procedure_name: null,
      unidade_solicitante: unidadeSolicitanteHeader,
      cid10: null,
      scheduled_date_raw: scheduledDateRaw,
      hora_raw: null,
    });
  }

  return rows;
}
