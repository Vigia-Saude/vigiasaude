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
      const filePath = path.join(uploadDir, filename);
      await fs.promises.writeFile(filePath, req.file.buffer);

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

      let countImported = 0;

      for (const row of approvedRows) {
        const raw = row.rawData as any;
        const name = raw.name || 'Paciente Não Identificado';
        const phone = raw.phone_raw || '67999999999';
        const cns = raw.cns_raw || null;

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
              dataNascimento: new Date(2000, 0, 1),
              sexo: 'OUTRO',
              cep: '79900-000',
              logradouro: 'Não informado',
              numero: 'S/N',
              bairro: 'Centro',
              municipio: 'Ponta Porã'
            }
          });
        }


        // Posição na fila
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
      }

      await prisma.pdfImport.update({
        where: { id: importId },
        data: {
          status: 'PROCESSED',
          rowsImported: countImported
        }
      });

      res.json({ mensagem: 'Linhas aprovadas e encaminhadas para a fila com sucesso!', importados: countImported });
    } catch (err: any) {
      console.error('Erro ao aprovar importação:', err);
      res.status(500).json({ erro: err.message });
    }
  };
}
