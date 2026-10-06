import type { Prisma } from '@prisma/client';
// The advisory lock must be acquired before calling this helper.
export async function ultimaPosicaoFila(tx: Prisma.TransactionClient): Promise<number> {
  const rows=await tx.$queryRaw<Array<{ultima:number}>>`
    SELECT GREATEST(COALESCE((SELECT max(posicao) FROM queue_entries),0),
      COALESCE((SELECT max(queue_base_position+rows_found-1) FROM pdf_imports),0))::integer AS ultima`;
  return rows[0]?.ultima || 0;
}
