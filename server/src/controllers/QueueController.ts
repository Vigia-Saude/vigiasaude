import { Response } from 'express';
import prisma from '../config/prisma';
import { convocarEntrada, convocarTodosService } from '../services/confirmacao.service';
import { AuthRequest } from '../middlewares/auth';

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param || '';
}

export class QueueController {
  listarQueues = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const entries=await prisma.queueEntry.findMany({orderBy:{posicao:'asc'}});
      const groups=new Map<string,any>();
      for(const e of entries){
        const name=e.procedimentoNome||e.procedimentoId||'Regulação';
        const id=name.toLowerCase().replace(/[^a-z0-9]/g,'-');
        const g=groups.get(id)||{procedureId:id,name,total:0,confirmed:0,awaiting:0,cancelled:0};
        g.total++;if(['CONFIRMADO','RECONFIRMADO'].includes(e.statusPaciente))g.confirmed++;
        else if(['RECUSOU','CANCELADO','NAO_RESPONDEU'].includes(e.statusPaciente))g.cancelled++;else g.awaiting++;
        groups.set(id,g);
      }
      res.json([...groups.values()]);
    } catch(err:any){res.status(500).json({erro:err.message});}
  };
  detalhesQueue = async (req: AuthRequest,res: Response): Promise<void> => {
    try {
      const id=getParam(req.params.procedureId);
      const entries=(await prisma.queueEntry.findMany({orderBy:{posicao:'asc'},include:{ciclos:{orderBy:{enviadoEm:'desc'},take:1},messages:{orderBy:{criadoEm:'desc'},take:10}}})).filter(e=>(e.procedimentoNome||'').toLowerCase().replace(/[^a-z0-9]/g,'-')===id);
      res.json({procedure:{id,name:entries[0]?.procedimentoNome||id},entries});
    }catch(err:any){res.status(500).json({erro:err.message});}
  };
  resendAll = async(req:AuthRequest,res:Response):Promise<void> => {
    try {
      const id=getParam(req.params.procedureId);
      const all=await prisma.queueEntry.findMany({select:{procedimentoNome:true}});
      const name=all.find(e=>(e.procedimentoNome||'').toLowerCase().replace(/[^a-z0-9]/g,'-')===id)?.procedimentoNome;
      if(!name){res.status(404).json({erro:'Fila não encontrada.'});return;}
      res.json(await convocarTodosService(null,name));
    }catch(err:any){res.status(400).json({erro:err.message});}
  };
  resendSingle = async(req:AuthRequest,res:Response):Promise<void> => {
    try {const e=await convocarEntrada(null,getParam(req.params.entryId));res.json({mensagem:'Convocação registrada. Consulte o status de entrega.',queueEntryId:e.id});}
    catch(err:any){res.status(400).json({erro:err.message});}
  };

  // DELETE /api/regulacao/queues/:procedureId
  excluirQueue = async (req: AuthRequest, res: Response): Promise<void> => {
    const procedureId = getParam(req.params.procedureId);
    if (!procedureId) {
      res.status(400).json({ erro: 'ID ou nome do procedimento é obrigatório.' });
      return;
    }

    try {
      // 1. Localizar procedimentos correspondentes
      const fichas = await prisma.filaRegulacao.findMany({
        select: { id: true, procedimentoSolicitado: true, pacienteId: true }
      });
      const matchingProcNames = new Set<string>();
      const candidatePacienteIds = new Set<string>();

      for (const f of fichas) {
        const procName = f.procedimentoSolicitado || 'Procedimento Geral';
        const pId = procName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (pId === procedureId || procName.toLowerCase() === procedureId.toLowerCase()) {
          matchingProcNames.add(procName);
          if (f.pacienteId) candidatePacienteIds.add(f.pacienteId);
        }
      }

      // 2. Localizar entradas em QueueEntry
      const queueEntries = await prisma.queueEntry.findMany({
        select: { id: true, procedimentoNome: true, procedimentoId: true, pacienteId: true }
      });
      const matchingQueueEntryIds: string[] = [];
      for (const qe of queueEntries) {
        const procName = qe.procedimentoNome || '';
        const pId = (qe.procedimentoId || procName).toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (pId === procedureId || procName.toLowerCase() === procedureId.toLowerCase() || matchingProcNames.has(procName)) {
          matchingQueueEntryIds.push(qe.id);
          if (procName) matchingProcNames.add(procName);
          if (qe.pacienteId) candidatePacienteIds.add(qe.pacienteId);
        }
      }

      const procNamesList = Array.from(matchingProcNames);

      // 3. Remover registros em transação atômica
      await prisma.$transaction(async (tx) => {
        if (matchingQueueEntryIds.length > 0) {
          await tx.messageLog.deleteMany({
            where: { queueEntryId: { in: matchingQueueEntryIds } }
          });

          await tx.cicloConfirmacao.deleteMany({
            where: { queueEntryId: { in: matchingQueueEntryIds } }
          });

          await tx.pdfImportRow.updateMany({
            where: { queueEntryId: { in: matchingQueueEntryIds } },
            data: { queueEntryId: null }
          });

          await tx.queueEntry.deleteMany({
            where: { id: { in: matchingQueueEntryIds } }
          });
        }

        if (procNamesList.length > 0) {
          await tx.filaRegulacao.deleteMany({
            where: { procedimentoSolicitado: { in: procNamesList } }
          });

          await tx.slotAgenda.deleteMany({
            where: { procedimento: { in: procNamesList } }
          });
        } else if (procedureId) {
          await tx.filaRegulacao.deleteMany({
            where: {
              OR: [
                { procedimentoSolicitado: { equals: procedureId, mode: 'insensitive' } },
                { procedimentoSolicitado: { contains: procedureId, mode: 'insensitive' } }
              ]
            }
          });
          await tx.slotAgenda.deleteMany({
            where: {
              procedimento: { equals: procedureId, mode: 'insensitive' }
            }
          });
        }

        // 4. Limpar pacientes que não possuem mais nenhuma fila ou registro vinculado
        if (candidatePacienteIds.size > 0) {
          const pIds = Array.from(candidatePacienteIds);
          for (const pId of pIds) {
            const hasOtherQueue = await tx.queueEntry.count({ where: { pacienteId: pId } });
            const hasOtherFila = await tx.filaRegulacao.count({ where: { pacienteId: pId } });
            const hasViagens = await tx.viagemPassageiro.count({ where: { pacienteId: pId } });

            if (hasOtherQueue === 0 && hasOtherFila === 0 && hasViagens === 0) {
              await tx.pdfImportRow.updateMany({
                where: { pacienteId: pId },
                data: { pacienteId: null }
              });
              await tx.paciente.delete({ where: { id: pId } }).catch(() => {});
            }
          }
        }
      });

      res.json({
        ok: true,
        mensagem: 'Fila excluída com sucesso!',
        procedureId,
        procedimentosAfetados: procNamesList
      });
    } catch (err: any) {
      console.error('Erro ao excluir fila:', err);
      res.status(500).json({ erro: err.message || 'Falha ao excluir fila.' });
    }
  };
}
