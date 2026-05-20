import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Garantir que a pasta de uploads existe na raiz do servidor
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Armazena temporariamente na memória para que possamos validar os Magic Bytes antes de salvar no disco
export const uploadConfig = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Apenas arquivos PDF são permitidos!'));
  },
});

export class UploadController {
  upload = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      }

      // Verificação de Magic Bytes para PDF: os primeiros 4 bytes devem ser "%PDF" (Hex: 25 50 44 46)
      const buffer = req.file.buffer;
      if (!buffer || buffer.length < 4) {
        return res.status(400).json({ error: 'Arquivo inválido ou corrompido.' });
      }

      const isPDF = 
        buffer[0] === 0x25 && 
        buffer[1] === 0x50 && 
        buffer[2] === 0x44 && 
        buffer[3] === 0x46;

      if (!isPDF) {
        return res.status(400).json({ error: 'Assinatura do arquivo inválida. Apenas arquivos PDF reais são permitidos (prevenção contra spoofing de extensão).' });
      }

      // Gerar nome único e salvar o arquivo de forma segura no disco
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(req.file.originalname).toLowerCase();
      const filename = `${req.file.fieldname}-${uniqueSuffix}${ext}`;
      const filePath = path.join(uploadDir, filename);

      await fs.promises.writeFile(filePath, buffer);

      const fileUrl = `/uploads/${filename}`;
      return res.json({ url: fileUrl });
    } catch (error: any) {
      console.error('Erro no upload:', error);
      return res.status(500).json({ error: error.message || 'Erro interno ao realizar upload.' });
    }
  };
}
