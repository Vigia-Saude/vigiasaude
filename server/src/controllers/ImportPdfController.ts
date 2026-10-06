import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import { lerPdf, validarLinhaPdf } from '../services/pdfImportacao.service';
import { parseCalendarDate } from '../services/regulacaoConfiavel.service';
import { ultimaPosicaoFila } from '../services/filaPosicoes.service';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'pdf-imports');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param || '';
}

export class ImportPdfController {
  // POST /api/regulacao/imports/upload
  uploadPdf = async (req: AuthRequest, res: Response): Promise<void> => {
    const isPdf =
      req.file &&
      (req.file.mimetype.includes('pdf') ||
        req.file.originalname?.toLowerCase().endsWith('.pdf') ||
        (req.file.buffer && req.file.buffer.length >= 4 && req.file.buffer.slice(0, 4).toString('ascii') === '%PDF'));

    if (!req.file || !isPdf) {
      res.status(400).json({ erro: 'Envie um arquivo PDF válido no campo "file".' });
      return;
    }

    try {
      let originalFilename = req.file.originalname || 'documento.pdf';
      try {
        originalFilename = Buffer.from(originalFilename, 'latin1').toString('utf8');
      } catch {
        originalFilename = req.file.originalname;
      }

      const filename = `${Date.now()}-${originalFilename}`;

      const parsed = await lerPdf(req.file.buffer);
      const rows = parsed.rows;

      if (rows.length === 0) {
        res.status(400).json({
          erro: 'Nenhum paciente identificado no PDF. Certifique-se de que o PDF foi salvo via navegador (Ctrl+P > Salvar como PDF da SES-MS).'
        });
        return;
      }

      const pdfImport = await prisma.pdfImport.create({
        data: {
          storagePath: filename,
          originalFilename,
          fileData: new Uint8Array(req.file.buffer),
          status: 'PROCESSING',
          rowsFound: rows.length,
          errorLog: parsed.warning,
        }
      });

      for (const row of rows) {
        await prisma.pdfImportRow.create({
          data: {
            importId: pdfImport.id,
            rawData: row as any,
            sourceIndex: row.source_index,
            sourcePage: row.source_page,
            error: validarLinhaPdf(row),
            approved: false
          }
        });
      }

      const result = await prisma.pdfImport.update({
        where: { id: pdfImport.id },
        data: {
          status: 'PROCESSED',
          processedAt: new Date()
        },
        omit: { fileData: true },
        include: { rows: { orderBy: [{ sourceIndex: 'asc' }, { criadoEm: 'asc' }] } }
      });

      res.status(201).json(result);
    } catch (err: any) {
      console.error('Erro no upload de PDF:', err);
      res.status(500).json({ erro: `Falha ao processar o PDF: ${err.message}` });
    }
  };

  // GET /api/regulacao/imports
  listarImports = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const imports = await prisma.pdfImport.findMany({
        orderBy: { criadoEm: 'desc' },
        take: 50,
        omit: { fileData: true },
        include: { _count: { select: { rows: true } } }
      });
      res.json(imports);
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // GET /api/regulacao/imports/:id
  obterImport = async (req: AuthRequest, res: Response): Promise<void> => {
    const id = getParam(req.params.id);
    try {
      const item = await prisma.pdfImport.findUnique({
        where: { id },
        omit: { fileData: true },
        include: { rows: { orderBy: [{ sourceIndex: 'asc' }, { criadoEm: 'asc' }] } }
      });

      if (!item) {
        res.status(404).json({ erro: 'Importação não encontrada.' });
        return;
      }
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // GET /api/regulacao/imports/:id/pdf-url
  obterPdfUrl = async (req: AuthRequest, res: Response): Promise<void> => {
    const id = getParam(req.params.id);
    try {
      const item = await prisma.pdfImport.findUnique({
        where: { id },
        select: { storagePath: true }
      });

      if (!item || !item.storagePath) {
        res.status(404).json({ erro: 'Arquivo PDF não encontrado.' });
        return;
      }

      res.json({ url: `/api/regulacao/imports/${id}/pdf` });
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // GET /api/regulacao/imports/:id/pdf — serve o arquivo para o preview (iframe via blob)
  servirPdf = async (req: AuthRequest, res: Response): Promise<void> => {
    const id = getParam(req.params.id);
    try {
      const item = await prisma.pdfImport.findUnique({
        where: { id },
        select: { storagePath: true, originalFilename: true, fileData: true }
      });

      if (!item) {
        res.status(404).json({ erro: 'Importação não encontrada.' });
        return;
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${item.originalFilename || 'documento.pdf'}"`);

      if (item.fileData) {
        res.send(Buffer.from(item.fileData));
        return;
      }

      // Fallback: importações antigas gravadas apenas em disco
      const filePath = item.storagePath ? path.join(uploadDir, item.storagePath) : null;
      if (!filePath || !fs.existsSync(filePath)) {
        res.status(404).json({ erro: 'Arquivo PDF não encontrado.' });
        return;
      }
      fs.createReadStream(filePath).pipe(res);
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // POST /api/regulacao/imports/:importId/rows
  criarRowManual = async (req: AuthRequest, res: Response): Promise<void> => {
    const importId = getParam(req.params.importId);
    const { rawData, raw_data } = req.body;
    const finalRawData = rawData || raw_data || {};

    try {
      const newRow = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('regulacao-importacao'))`;
      const last = await tx.pdfImportRow.findFirst({ where: { importId }, orderBy: { sourceIndex: 'desc' } });
      const created = await tx.pdfImportRow.create({
        data: {
          importId,
          rawData: finalRawData,
          sourceIndex: (last?.sourceIndex || 0) + 1,
          error: validarLinhaPdf(finalRawData),
          approved: false
        }
      });
      await tx.pdfImport.update({ where: { id: importId }, data: { rowsFound: { increment: 1 } } });
      return created;
      });
      res.status(201).json(newRow);
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // PATCH /api/regulacao/imports/:importId/rows/:rowId
  atualizarRow = async (req: AuthRequest, res: Response): Promise<void> => {
    const rowId = getParam(req.params.rowId);
    const { rawData, approved } = req.body;

    try {
      const existing = await prisma.pdfImportRow.findUnique({
        where: { id: rowId }
      });

      if (!existing || existing.importId !== getParam(req.params.importId)) {
        res.status(404).json({ erro: 'Registro não encontrado.' });
        return;
      }

      if (existing.queueEntryId) { res.status(409).json({ erro: 'Esta linha já foi encaminhada à fila. Corrija o cadastro pela regulação.' }); return; }
      const updated = await prisma.pdfImportRow.update({
        where: { id: rowId },
        data: {
          rawData: rawData ? { ...(existing.rawData as object), ...rawData } : existing.rawData,
          approved: typeof approved === 'boolean' ? approved : existing.approved,
          error: validarLinhaPdf(rawData ? { ...(existing.rawData as object), ...rawData } : existing.rawData)
        }
      });

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // PATCH /api/regulacao/imports/:importId/rows-bulk
  bulkAtualizarRows = async (req: AuthRequest, res: Response): Promise<void> => {
    const importId = getParam(req.params.importId);
    const { scheduled_date_raw, local_atendimento, approvedAll } = req.body;

    try {
      const rows = await prisma.pdfImportRow.findMany({
        where: { importId }
      });

      await prisma.$transaction(async tx => {
      for (const r of rows) {
        if (r.queueEntryId) continue;
        const raw = (r.rawData || {}) as any;
        const updatedRaw = {
          ...raw,
          ...(scheduled_date_raw ? { scheduled_date_raw } : {}),
          ...(typeof local_atendimento === 'string' ? { local_atendimento: local_atendimento.trim() } : {})
        };
        await tx.pdfImportRow.update({
          where: { id: r.id },
          data: {
            rawData: updatedRaw,
            error: validarLinhaPdf(updatedRaw),
            ...(typeof approvedAll === 'boolean' ? { approved: approvedAll } : {})
          }
        });
      }

      });
      const updatedRows = await prisma.pdfImportRow.findMany({
        where: { importId },
        orderBy: [{ sourceIndex: 'asc' }, { criadoEm: 'asc' }]
      });

      res.json(updatedRows);
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // POST /api/regulacao/imports/:importId/approve
  aprovarImport = async (req: AuthRequest, res: Response): Promise<void> => {
    const importId = getParam(req.params.importId);

    try {
      const approvedRows = await prisma.pdfImportRow.findMany({
        where: {
          importId,
          approved: true,
          queueEntryId: null
        },
        orderBy: [{ sourceIndex: 'asc' }, { criadoEm: 'asc' }]
      });

      if (!approvedRows || approvedRows.length === 0) {
        res.status(200).json({ mensagem: 'Nenhuma nova linha aprovada para processar.', importados: 0, imported: 0, results: [] });
        return;
      }

      const invalidRows = approvedRows.map(row => ({ id: row.id, error: validarLinhaPdf(row.rawData) })).filter(row => row.error);
      if (invalidRows.length) { res.status(400).json({ erro: 'Corrija os campos obrigatórios antes de encaminhar.', results: invalidRows }); return; }

      const documentoInicial = await prisma.pdfImport.findUniqueOrThrow({ where: { id: importId } });
      const defaultUnidadeId = req.body?.unidadeId || documentoInicial.unidadeResponsavelId || req.user?.unidadeId;
      if (!defaultUnidadeId || !await prisma.unidade.findFirst({ where: { id: defaultUnidadeId, ativa: true } })) {
        res.status(400).json({ erro: 'Selecione a unidade responsável pela agenda antes de encaminhar.' }); return;
      }
      if (documentoInicial.unidadeResponsavelId && documentoInicial.unidadeResponsavelId !== defaultUnidadeId) {
        res.status(409).json({ erro: 'Esta importação já tem outra unidade responsável. Confira a agenda.' }); return;
      }

      const imported = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('regulacao-importacao'))`;
      const documento = await tx.pdfImport.findUniqueOrThrow({ where: { id: importId } });
      if (documento.unidadeResponsavelId && documento.unidadeResponsavelId !== defaultUnidadeId) throw new Error('Esta importação já tem outra unidade responsável. Confira a agenda.');
      if (!documento.unidadeResponsavelId) await tx.pdfImport.update({ where: { id: importId }, data: { unidadeResponsavelId: defaultUnidadeId } });
      const base = documento.queueBasePosition ?? (await ultimaPosicaoFila(tx)) + 1;
      if (documento.queueBasePosition === null) await tx.pdfImport.update({ where: { id: importId }, data: { queueBasePosition: base } });
      let countImported = 0;
      const results: { rowId: string; error?: string }[] = [];

      const parseDate = parseCalendarDate;
      const onlyDigits = (value: unknown): string => (typeof value === 'string' ? value.replace(/\D/g, '') : '');

      for (const row of approvedRows) {
        await tx.$executeRawUnsafe('SAVEPOINT import_row');
        try {
          const current = await tx.pdfImportRow.findUniqueOrThrow({ where: { id: row.id } });
          if (current.queueEntryId || !current.approved) { await tx.$executeRawUnsafe('RELEASE SAVEPOINT import_row'); continue; }
          const raw = current.rawData as any;
          const invalid = validarLinhaPdf(raw);
          if (invalid) throw new Error(invalid);
          const name = raw.name.trim();
          const phone = onlyDigits(raw.phone_raw);
          const cns = onlyDigits(raw.cns_raw) || null;
          const procedimento = raw.procedure_name.trim();
          const horaAgendadaRaw = raw.hora_raw || null;
          const dataAgendada = parseDate(raw.scheduled_date_raw);
          const dataNascimento = parseDate(raw.birth_date_raw);

          // Busca ou cria o paciente no VigiaSaude
          let paciente = await tx.paciente.findFirst({
            where: cns ? { cartaoSus: cns } : { nomeCompleto: { equals: name, mode: 'insensitive' }, dataNascimento: dataNascimento! }
          });

          if (!paciente && name) {
            paciente = await tx.paciente.findFirst({
              where: { nomeCompleto: { equals: name, mode: 'insensitive' } }
            });
          }
          if (!paciente) {

            const generatedProntuario = `PRONT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            paciente = await tx.paciente.create({
              data: {
                nomeCompleto: name,
                telefone: phone,
                celular: phone,
                cartaoSus: cns,
                cpf: null,
                prontuario: generatedProntuario,
                dataNascimento: dataNascimento!,
                sexo: 'OUTRO',
                cep: '',
                logradouro: 'Não informado',
                numero: '',
                bairro: '',
                municipio: ''
              }
            });
          }

          else await tx.paciente.update({
            where: { id: paciente.id },
            data: {
              ...(phone ? { celular: phone, telefone: phone } : {}),
              ...(dataNascimento ? { dataNascimento } : {}),
              ...(cns && !paciente.cartaoSus ? { cartaoSus: cns } : {})
            }
          });

          // Deduplicação inteligente de QueueEntry
          let queueEntry = await tx.queueEntry.findFirst({
            where: {
              pacienteId: paciente.id,
              unidadeId: defaultUnidadeId,
              procedimentoNome: procedimento,
              horaAgendada: horaAgendadaRaw,
              dataAgendada: dataAgendada ? { equals: dataAgendada } : undefined,
              statusPaciente: { in: ['AGUARDANDO', 'CONVOCADO', 'CONFIRMADO', 'RECONFIRMADO'] }
            }
          });

          if (!queueEntry) {
            if (!current.sourceIndex) throw new Error('Recupere a ordem deste PDF antes de aprovar.');
            const nextPos = current.sourcePage ? base + current.sourceIndex - 1 : (await ultimaPosicaoFila(tx)) + 1;

            queueEntry = await tx.queueEntry.create({
              data: {
                pacienteId: paciente.id,
                importId,
                posicao: nextPos,
                status: 'PENDING',
                dataAgendada: dataAgendada,
                horaAgendada: horaAgendadaRaw,
                unidadeId: defaultUnidadeId,
                procedimentoNome: procedimento,
                statusPaciente: 'AGUARDANDO',
                localAtendimento: raw.local_atendimento || null,
                unidadeSolicitante: raw.unidade_solicitante || null
              }
            });
          } else {
            // Atualiza para vincular à importação atual e garantir a data mais recente
            queueEntry = await tx.queueEntry.update({
              where: { id: queueEntry.id },
              data: {
                importId: queueEntry.importId || importId,
                ...(queueEntry.statusPaciente === 'AGUARDANDO' ? { dataAgendada: dataAgendada ?? queueEntry.dataAgendada, horaAgendada: horaAgendadaRaw ?? queueEntry.horaAgendada, localAtendimento: raw.local_atendimento || queueEntry.localAtendimento } : {}),
              }
            });
          }

          // Busca ou vincula Unidade Solicitante do PDF se especificada
          let rowUnidadeId = defaultUnidadeId;
          const unidadeNomeRaw = (raw.unidade_solicitante || '').trim();
          if (unidadeNomeRaw) {
            const existingUnidade = await tx.unidade.findFirst({
              where: { nome: { equals: unidadeNomeRaw, mode: 'insensitive' } }
            });
            if (existingUnidade) {
              rowUnidadeId = existingUnidade.id;

            }
          }

          // Deduplicação em FilaRegulacao
          const existingFila = await tx.filaRegulacao.findFirst({
            where: {
              pacienteId: paciente.id,
              procedimentoSolicitado: procedimento,
              dataAgendada: dataAgendada ? { equals: dataAgendada } : undefined,
            }
          });

          if (!existingFila) {
            await tx.filaRegulacao.create({
              data: {
                unidadeEsfId: rowUnidadeId,
                responsavelEncaminhamento: 'Importação PDF (SES-MS / Regulação)',
                acsResponsavel: 'Regulação Central',
                pacienteId: paciente.id,
                tipoAtendimento: 'SUS',
                procedimentoSolicitado: procedimento,
                observacaoClinica: raw.cid10 ? `CID-10: ${raw.cid10}` : 'Importado via PDF',
                dataAgendada: dataAgendada,
                horaAgendada: horaAgendadaRaw,
                statusAgendamento: dataAgendada ? 'PRE_AGENDADO' : 'AGUARDANDO_REGULACAO',
                criadoPorUsuarioId: req.user!.id,
              }
            });
          } else {
            await tx.filaRegulacao.update({
              where: { id: existingFila.id },
              data: {
                horaAgendada: horaAgendadaRaw || existingFila.horaAgendada,
                observacaoClinica: raw.cid10 ? `CID-10: ${raw.cid10}` : existingFila.observacaoClinica,
              }
            });
          }

          await tx.pdfImportRow.update({
            where: { id: row.id },
            data: {
              pacienteId: paciente.id,
              queueEntryId: queueEntry.id,
              error: null
            }
          });

          await tx.$executeRawUnsafe('RELEASE SAVEPOINT import_row');
          countImported++;
          results.push({ rowId: row.id });
        } catch (rowErr: any) {
          await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT import_row');
          await tx.$executeRawUnsafe('RELEASE SAVEPOINT import_row');
          const message = rowErr?.message || 'Falha ao processar esta linha.';
          results.push({ rowId: row.id, error: message });
          await tx.pdfImportRow.update({
            where: { id: row.id },
            data: { error: message }
          }).catch(() => {});
        }
      }

      await tx.pdfImport.update({
        where: { id: importId },
        data: {
          status: 'PROCESSED',
          rowsImported: (documento.rowsImported || 0) + countImported
        }
      });

      return { countImported, results };
      }, { timeout: 120000 });
      const { countImported, results } = imported;

      res.json({
        mensagem: 'Linhas aprovadas processadas.',
        importados: countImported,
        imported: countImported,
        total: approvedRows.length,
        results
      });
    } catch (err: any) {
      console.error('Erro ao aprovar importação:', err);
      res.status(500).json({ erro: err.message });
    }
  };
}
