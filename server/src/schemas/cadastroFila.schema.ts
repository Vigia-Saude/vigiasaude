import { z } from 'zod';
import { parseCalendarDate } from '../services/regulacaoConfiavel.service';

const vazioParaNull = (value: unknown) => typeof value === 'string' ? value.trim() || null : value;

export const identificacaoPacienteFilaSchema = z.object({
  cartaoSus: z.preprocess(vazioParaNull, z.string().regex(/^\d{15}$/, 'CNS deve conter 15 dígitos').nullish()).transform(value => value ?? null),
  dataNascimento: z.preprocess(vazioParaNull, z.string().refine(value => {
    const date = parseCalendarDate(value);
    return !!date && date <= new Date();
  }, 'Informe uma data de nascimento válida').nullish()).transform(value => value ? parseCalendarDate(value)! : null),
});

export function pendenciasPacienteFila(paciente: {cartaoSus: string | null; dataNascimento: Date | null}, aceitaFicha = false): string[] {
  const pendencias: string[] = [];
  if (!paciente.cartaoSus && !aceitaFicha) pendencias.push('CNS');
  if (!paciente.dataNascimento) pendencias.push('data de nascimento');
  return pendencias;
}
