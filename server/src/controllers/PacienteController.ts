import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import { Prisma, Sexo } from '@prisma/client';

export class PacienteController {
  /**
   * Criar um novo paciente
   */
  async criar(req: AuthRequest, res: Response) {
    try {
      const {
        cpf,
        cartaoSus,
        nomeCompleto,
        dataNascimento,
        sexo,
        nomeMae,
        telefone,
        cep,
        logradouro,
        numero,
        bairro,
        municipio,
      } = req.body;

      // Validação de campos obrigatórios
      if (!cpf || !nomeCompleto || !dataNascimento || !sexo || !telefone || !cep || !logradouro || !numero || !bairro || !municipio) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios (*).' });
      }

      // Validação de formato de CPF
      const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
      if (!cpfRegex.test(cpf)) {
        return res.status(400).json({ error: 'CPF em formato inválido. Formato: 000.000.000-00' });
      }

      // Validação de formato de Telefone
      const phoneRegex = /^\(\d{2}\) 9\d{4}-\d{4}$/;
      if (!phoneRegex.test(telefone)) {
        return res.status(400).json({ error: 'Telefone em formato inválido. Formato: (XX) 9XXXX-XXXX' });
      }

      // Validar sexo enum
      if (!Object.values(Sexo).includes(sexo as Sexo)) {
        return res.status(400).json({ error: 'Gênero/Sexo selecionado é inválido.' });
      }

      // Verificar se CPF já está cadastrado
      const pacienteExistente = await prisma.paciente.findUnique({
        where: { cpf },
      });
      if (pacienteExistente) {
        return res.status(400).json({ error: 'Já existe um paciente cadastrado com este CPF.' });
      }

      // Gerar Prontuário automaticamente (PAC-YYYY-NNNN)
      const currentYear = new Date().getFullYear();
      const prefix = `PAC-${currentYear}-`;
      
      const lastPaciente = await prisma.paciente.findFirst({
        where: {
          prontuario: {
            startsWith: prefix,
          },
        },
        orderBy: {
          prontuario: 'desc',
        },
      });

      let nextNum = 1;
      if (lastPaciente) {
        const parts = lastPaciente.prontuario.split('-');
        if (parts.length === 3) {
          const num = parseInt(parts[2], 10);
          if (!isNaN(num)) {
            nextNum = num + 1;
          }
        }
      }
      const prontuario = `${prefix}${String(nextNum).padStart(4, '0')}`;

      // Definir unidade de origem caso o criador seja um posto de saúde
      let unidadeOrigemId = null;
      if (req.user?.perfil === 'POSTO_SAUDE') {
        unidadeOrigemId = req.user.unidadeId;
      }

      // Criar o paciente
      const paciente = await prisma.paciente.create({
        data: {
          prontuario,
          cpf,
          cartaoSus: cartaoSus || null,
          nomeCompleto,
          dataNascimento: new Date(dataNascimento),
          sexo: sexo as Sexo,
          nomeMae: nomeMae || null,
          telefone,
          unidadeOrigemId,
          cep,
          logradouro,
          numero,
          bairro,
          municipio,
        },
      });

      console.log(`[Paciente] Criado prontuário ${prontuario} com sucesso.`);
      return res.status(201).json(paciente);
    } catch (err: any) {
      console.error('Erro ao criar paciente:', err);
      return res.status(500).json({ error: 'Erro interno ao cadastrar paciente.' });
    }
  }

  /**
   * Listar pacientes com paginação e filtros
   */
  async listar(req: AuthRequest, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const skip = (page - 1) * limit;
      const busca = (req.query.busca as string || '').trim();

      let whereClause: Prisma.PacienteWhereInput = {};

      if (busca) {
        const isExactCpf = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(busca) || /^\d{11}$/.test(busca);
        const isExactSus = /^\d{15}$/.test(busca);

        if (isExactCpf || isExactSus) {
          // Busca global (ignora unidade) por CPF ou SUS exato
          const cleanBusca = busca.replace(/\D/g, '');
          whereClause = {
            OR: [
              { cpf: busca },
              { cpf: cleanBusca },
              { cartaoSus: busca },
              { cartaoSus: cleanBusca }
            ]
          };
        } else {
          // Busca parcial (filtra por unidade se for POSTO_SAUDE)
          whereClause = {
            OR: [
              { nomeCompleto: { contains: busca, mode: 'insensitive' } },
              { cpf: { contains: busca } },
              { cartaoSus: { contains: busca } }
            ]
          };
          if (req.user?.perfil === 'POSTO_SAUDE') {
            whereClause.unidadeOrigemId = req.user.unidadeId;
          }
        }
      } else {
        // Sem busca, filtra por unidade do usuário posto
        if (req.user?.perfil === 'POSTO_SAUDE') {
          whereClause.unidadeOrigemId = req.user.unidadeId;
        }
      }

      const [total, dados] = await prisma.$transaction([
        prisma.paciente.count({ where: whereClause }),
        prisma.paciente.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { criadoEm: 'desc' },
          include: {
            unidadeOrigem: {
              select: { id: true, nome: true }
            }
          }
        })
      ]);

      return res.json({
        total,
        pagina: page,
        limite: limit,
        dados
      });
    } catch (err: any) {
      console.error('Erro ao listar pacientes:', err);
      return res.status(500).json({ error: 'Erro interno ao listar pacientes.' });
    }
  }

  /**
   * Consulta/busca rápida (usada no autocomplete e cadsus local)
   */
  async buscar(req: AuthRequest, res: Response) {
    try {
      const busca = (req.query.busca as string || '').trim();
      if (!busca) {
        return res.json([]);
      }

      const isExactCpf = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(busca) || /^\d{11}$/.test(busca);
      const isExactSus = /^\d{15}$/.test(busca);

      let whereClause: Prisma.PacienteWhereInput = {};

      if (isExactCpf || isExactSus) {
        // Busca global por documento exato
        const cleanBusca = busca.replace(/\D/g, '');
        whereClause = {
          OR: [
            { cpf: busca },
            { cpf: cleanBusca },
            { cartaoSus: busca },
            { cartaoSus: cleanBusca }
          ]
        };
      } else {
        // Busca parcial por nome ou iniciais (filtrado por unidade do usuário)
        whereClause = {
          OR: [
            { nomeCompleto: { contains: busca, mode: 'insensitive' } },
            { cpf: { contains: busca } }
          ]
        };
        if (req.user?.perfil === 'POSTO_SAUDE') {
          whereClause.unidadeOrigemId = req.user.unidadeId;
        }
      }

      const pacientes = await prisma.paciente.findMany({
        where: whereClause,
        take: 10,
        orderBy: { nomeCompleto: 'asc' }
      });

      return res.json(pacientes);
    } catch (err: any) {
      console.error('Erro na consulta rápida de pacientes:', err);
      return res.status(500).json({ error: 'Erro interno ao buscar pacientes.' });
    }
  }

  /**
   * Obter detalhes do paciente
   */
  async detalhes(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;

      const paciente = await prisma.paciente.findUnique({
        where: { id },
        include: {
          unidadeOrigem: {
            select: { id: true, nome: true }
          }
        }
      });

      if (!paciente) {
        return res.status(404).json({ error: 'Paciente não encontrado.' });
      }

      return res.json(paciente);
    } catch (err: any) {
      console.error('Erro ao obter detalhes do paciente:', err);
      return res.status(500).json({ error: 'Erro interno ao buscar paciente.' });
    }
  }

  /**
   * Atualizar dados do paciente
   */
  async atualizar(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const {
        cartaoSus,
        nomeCompleto,
        dataNascimento,
        sexo,
        nomeMae,
        telefone,
        cep,
        logradouro,
        numero,
        bairro,
        municipio,
      } = req.body;

      const paciente = await prisma.paciente.findUnique({
        where: { id }
      });

      if (!paciente) {
        return res.status(404).json({ error: 'Paciente não encontrado.' });
      }

      // Validar telefone se enviado
      if (telefone) {
        const phoneRegex = /^\(\d{2}\) 9\d{4}-\d{4}$/;
        if (!phoneRegex.test(telefone)) {
          return res.status(400).json({ error: 'Telefone em formato inválido. Formato: (XX) 9XXXX-XXXX' });
        }
      }

      // Validar sexo se enviado
      if (sexo && !Object.values(Sexo).includes(sexo as Sexo)) {
        return res.status(400).json({ error: 'Gênero/Sexo selecionado é inválido.' });
      }

      const pacienteAtualizado = await prisma.paciente.update({
        where: { id },
        data: {
          cartaoSus: cartaoSus !== undefined ? cartaoSus : paciente.cartaoSus,
          nomeCompleto: nomeCompleto || paciente.nomeCompleto,
          dataNascimento: dataNascimento ? new Date(dataNascimento) : paciente.dataNascimento,
          sexo: (sexo as Sexo) || paciente.sexo,
          nomeMae: nomeMae !== undefined ? nomeMae : paciente.nomeMae,
          telefone: telefone || paciente.telefone,
          cep: cep || paciente.cep,
          logradouro: logradouro || paciente.logradouro,
          numero: numero || paciente.numero,
          bairro: bairro || paciente.bairro,
          municipio: municipio || paciente.municipio,
        }
      });

      return res.json(pacienteAtualizado);
    } catch (err: any) {
      console.error('Erro ao atualizar paciente:', err);
      return res.status(500).json({ error: 'Erro interno ao atualizar paciente.' });
    }
  }
}
