import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import { extractTableRows } from '../services/pdfParser.service';
import pdfParse from 'pdf-parse';
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
    if (!req.file || req.file.mimetype !== 'application/pdf') {
      res.status(400).json({ erro: 'Envie um arquivo PDF no campo "file".' });
      return;
    }

    try {
      const filename = `${Date.now()}-${req.file.originalname}`;

      const parsed = await pdfParse(req.file.buffer);
      const rows = extractTableRows(parsed.text);

      if (rows.length === 0) {
        res.status(400).json({
          erro: 'Nenhum paciente identificado no PDF. Certifique-se de que o PDF foi salvo via navegador (Ctrl+P > Salvar como PDF da SES-MS).'
        });
        return;
      }

      const pdfImport = await prisma.pdfImport.create({
        data: {
          storagePath: filename,
          originalFilename: req.file.originalname,
          fileData: new Uint8Array(req.file.buffer),
          status: 'PROCESSING',
          rowsFound: rows.length,
        }
      });

      for (const row of rows) {
        await prisma.pdfImportRow.create({
          data: {
            importId: pdfImport.id,
            rawData: row as any,
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
        include: { rows: true }
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
        include: { rows: true }
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
    const finalRawData = rawData || raw_data || {
      name: 'Novo Paciente',
      cns_raw: '',
      phone_raw: '',
      birth_date_raw: '',
      procedure_name: 'Mamografia Bilateral de Rastreamento',
      unidade_solicitante: 'UBS Centro - Ponta Porã',
      scheduled_date_raw: '',
      hora_raw: '08:30'
    };

    try {
      const newRow = await prisma.pdfImportRow.create({
        data: {
          importId,
          rawData: finalRawData,
          approved: false
        }
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

      if (!existing) {
        res.status(404).json({ erro: 'Registro não encontrado.' });
        return;
      }

      const updated = await prisma.pdfImportRow.update({
        where: { id: rowId },
        data: {
          rawData: rawData ? { ...(existing.rawData as object), ...rawData } : existing.rawData,
          approved: typeof approved === 'boolean' ? approved : existing.approved
        }
      });

      res.json(updated);
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
        }
      });

      if (!approvedRows || approvedRows.length === 0) {
        res.status(400).json({ erro: 'Nenhuma linha marcada como aprovada para processar.' });
        return;
      }

      // Obter ou definir a unidade ESF padrão
      let defaultUnidadeId = req.user?.unidadeId;
      if (!defaultUnidadeId) {
        const firstUnidade = await prisma.unidade.findFirst();
        if (firstUnidade) {
          defaultUnidadeId = firstUnidade.id;
        } else {
          const newUnidade = await prisma.unidade.create({
            data: {
              nome: 'Unidade Central de Saúde',
              cnes: '0000000',
              tenantSchema: 'tenant_central',
              ativa: true
            }
          });
          defaultUnidadeId = newUnidade.id;
        }
      }

      let countImported = 0;
      const results: { rowId: string; error?: string }[] = [];

      const parseDate = (value: unknown): Date | null => {
        if (typeof value !== 'string' || !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null;
        const [day, month, year] = value.split('/').map(Number);
        const d = new Date(year, month - 1, day);
        return isNaN(d.getTime()) ? null : d;
      };
      const onlyDigits = (value: unknown): string => (typeof value === 'string' ? value.replace(/\D/g, '') : '');

      for (const row of approvedRows) {
        try {
          const raw = row.rawData as any;
          const name = raw.name || 'Paciente Não Identificado';
          const phone = onlyDigits(raw.phone_raw) || '67999999999';
          const cns = onlyDigits(raw.cns_raw) || null;
          const procedimento = raw.procedure_name || 'MAMOGRAFIA / EXAME REGULAÇÃO';
          const horaAgendadaRaw = raw.hora_raw || null;
          const dataAgendada = parseDate(raw.scheduled_date_raw);
          const dataNascimento = parseDate(raw.birth_date_raw);

          // Busca ou cria o paciente no VigiaSaude
          let paciente = await prisma.paciente.findFirst({
            where: cns ? { cartaoSus: cns } : { nomeCompleto: { equals: name, mode: 'insensitive' } }
          });

          if (!paciente) {
            const generatedCpf = `${Math.floor(10000000000 + Math.random() * 90000000000)}`;
            const generatedProntuario = `PRONT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            paciente = await prisma.paciente.create({
              data: {
                nomeCompleto: name,
                telefone: phone,
                celular: phone,
                cartaoSus: cns,
                cpf: generatedCpf,
                prontuario: generatedProntuario,
                dataNascimento: dataNascimento ?? new Date(2000, 0, 1),
                sexo: 'OUTRO',
                cep: '79900-000',
                logradouro: 'Não informado',
                numero: 'S/N',
                bairro: 'Centro',
                municipio: 'Ponta Porã'
              }
            });
          }

          // Posição na fila WhatsApp
          const lastEntry = await prisma.queueEntry.findFirst({
            orderBy: { posicao: 'desc' }
          });
          const nextPos = (lastEntry?.posicao || 0) + 1;

          const queueEntry = await prisma.queueEntry.create({
            data: {
              pacienteId: paciente.id,
              importId,
              posicao: nextPos,
              status: 'PENDING',
              dataAgendada: dataAgendada
            }
          });

          // Criar registro na FilaRegulacao para aparecer na visão geral da Secretaria
          await prisma.filaRegulacao.create({
            data: {
              unidadeEsfId: defaultUnidadeId,
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

          await prisma.pdfImportRow.update({
            where: { id: row.id },
            data: {
              pacienteId: paciente.id,
              queueEntryId: queueEntry.id,
              error: null
            }
          });

          countImported++;
          results.push({ rowId: row.id });
        } catch (rowErr: any) {
          const message = rowErr?.message || 'Falha ao processar esta linha.';
          results.push({ rowId: row.id, error: message });
          await prisma.pdfImportRow.update({
            where: { id: row.id },
            data: { error: message }
          }).catch(() => {});
        }
      }

      await prisma.pdfImport.update({
        where: { id: importId },
        data: {
          status: 'PROCESSED',
          rowsImported: countImported
        }
      });

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
