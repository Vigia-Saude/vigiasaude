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
        orientacaoSexual,
        identidadeGenero,
        nomeSocial,
        municipioNascimento,
        nacionalidade,
        paisNascimento,
        corRaca,
        etnia,
        tipoSanguineo,
        prontuariosAntigos,
        alergias,
        familia,
        area,
        subarea,
        escolaridade,
        
        celular,
        telefone,
        email,
        nomeMae,
        maeDesconhecida,
        nomePai,
        paiDesconhecido,
        
        rg,
        orgaoEmissor,
        ufRg,
        dataExpedicaoRg,
        nis,
        certidaoNascimento,
        dataObito,
        tituloEleitor,
        estadoCivil,
        funcionarioExterno,
        observacao,
        profissaoCbo,
        localTrabalho,
        
        situacaoRua,
        cep,
        tipoLogradouro,
        logradouro,
        numero,
        bairro,
        complemento,
        municipio,
        localizacao,
      } = req.body;

      // Validação de campos obrigatórios
      if (
        !cpf || !nomeCompleto || !dataNascimento || !sexo || !nacionalidade || 
        !paisNascimento || !corRaca || !celular || !cep || 
        !tipoLogradouro || !logradouro || !numero || !bairro || !municipio
      ) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios (*).' });
      }

      // Validação de formato de CPF
      const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
      if (!cpfRegex.test(cpf)) {
        return res.status(400).json({ error: 'CPF em formato inválido. Formato: 000.000.000-00' });
      }

      // Validação de formato de Celular
      const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
      if (!phoneRegex.test(celular)) {
        return res.status(400).json({ error: 'Celular em formato inválido. Formato: (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX' });
      }

      // Validação de formato de CEP
      const cepRegex = /^\d{5}-\d{3}$/;
      if (!cepRegex.test(cep)) {
        return res.status(400).json({ error: 'CEP em formato inválido. Formato: 00000-000' });
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

      // Safe date parser
      const safeParseDate = (d: any): Date | null => {
        if (!d || typeof d !== 'string' || d.trim() === '') return null;
        const parsed = new Date(d.includes('T') ? d : `${d}T00:00:00.000Z`);
        return isNaN(parsed.getTime()) ? null : parsed;
      };

      const dateNasc = safeParseDate(dataNascimento);
      if (!dateNasc) {
        return res.status(400).json({ error: 'Data de nascimento em formato inválido.' });
      }

      // Criar o paciente
      const paciente = await prisma.paciente.create({
        data: {
          prontuario,
          cpf,
          cartaoSus: cartaoSus || null,
          nomeCompleto,
          dataNascimento: dateNasc,
          sexo: sexo as Sexo,
          orientacaoSexual: orientacaoSexual || null,
          identidadeGenero: identidadeGenero || null,
          nomeSocial: nomeSocial || null,
          municipioNascimento: municipioNascimento || null,
          nacionalidade: nacionalidade || 'BRASILEIRA',
          paisNascimento: paisNascimento || 'BRASIL',
          corRaca: corRaca || 'Não informada',
          etnia: etnia || null,
          tipoSanguineo: tipoSanguineo || null,
          prontuariosAntigos: prontuariosAntigos || null,
          alergias: alergias || null,
          familia: familia || null,
          area: area || null,
          subarea: subarea || null,
          escolaridade: escolaridade || null,
          
          celular,
          telefone: telefone || null,
          email: email || null,
          nomeMae: maeDesconhecida === true || maeDesconhecida === 'true' ? 'Desconhecida' : (nomeMae || null),
          maeDesconhecida: maeDesconhecida === true || maeDesconhecida === 'true',
          nomePai: paiDesconhecido === true || paiDesconhecido === 'true' ? 'Desconhecido' : (nomePai || null),
          paiDesconhecido: paiDesconhecido === true || paiDesconhecido === 'true',
          
          rg: rg || null,
          orgaoEmissor: orgaoEmissor || null,
          ufRg: ufRg || null,
          dataExpedicaoRg: safeParseDate(dataExpedicaoRg),
          nis: nis || null,
          certidaoNascimento: certidaoNascimento || null,
          dataObito: safeParseDate(dataObito),
          tituloEleitor: tituloEleitor || null,
          estadoCivil: estadoCivil || null,
          funcionarioExterno: funcionarioExterno === true || funcionarioExterno === 'true',
          observacao: observacao || null,
          profissaoCbo: profissaoCbo || null,
          localTrabalho: localTrabalho || null,
          
          situacaoRua: situacaoRua === true || situacaoRua === 'true',
          cep,
          tipoLogradouro: tipoLogradouro || 'RUA',
          logradouro,
          numero,
          bairro,
          complemento: complemento || null,
          municipio,
          localizacao: localizacao || 'URBANA',
          unidadeOrigemId,
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
      const busca = String(req.query.busca || '').trim();

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
      const busca = String(req.query.busca || '').trim();
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
        orientacaoSexual,
        identidadeGenero,
        nomeSocial,
        municipioNascimento,
        nacionalidade,
        paisNascimento,
        corRaca,
        etnia,
        tipoSanguineo,
        prontuariosAntigos,
        alergias,
        familia,
        area,
        subarea,
        escolaridade,
        
        celular,
        telefone,
        email,
        nomeMae,
        maeDesconhecida,
        nomePai,
        paiDesconhecido,
        
        rg,
        orgaoEmissor,
        ufRg,
        dataExpedicaoRg,
        nis,
        certidaoNascimento,
        dataObito,
        tituloEleitor,
        estadoCivil,
        funcionarioExterno,
        observacao,
        profissaoCbo,
        localTrabalho,
        
        situacaoRua,
        cep,
        tipoLogradouro,
        logradouro,
        numero,
        bairro,
        complemento,
        municipio,
        localizacao,
      } = req.body;

      const paciente = await prisma.paciente.findUnique({
        where: { id }
      });

      if (!paciente) {
        return res.status(404).json({ error: 'Paciente não encontrado.' });
      }

      // Validar celular se enviado
      if (celular) {
        const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
        if (!phoneRegex.test(celular)) {
          return res.status(400).json({ error: 'Celular em formato inválido. Formato: (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX' });
        }
      }

      // Validar sexo se enviado
      if (sexo && !Object.values(Sexo).includes(sexo as Sexo)) {
        return res.status(400).json({ error: 'Gênero/Sexo selecionado é inválido.' });
      }

      // Validar CEP se enviado
      if (cep) {
        const cepRegex = /^\d{5}-\d{3}$/;
        if (!cepRegex.test(cep)) {
          return res.status(400).json({ error: 'CEP em formato inválido. Formato: 00000-000' });
        }
      }

      const pacienteAtualizado = await prisma.paciente.update({
        where: { id },
        data: {
          cartaoSus: cartaoSus !== undefined ? cartaoSus : paciente.cartaoSus,
          nomeCompleto: nomeCompleto || paciente.nomeCompleto,
          dataNascimento: dataNascimento ? new Date(dataNascimento) : paciente.dataNascimento,
          sexo: (sexo as Sexo) || paciente.sexo,
          orientacaoSexual: orientacaoSexual !== undefined ? orientacaoSexual : paciente.orientacaoSexual,
          identidadeGenero: identidadeGenero !== undefined ? identidadeGenero : paciente.identidadeGenero,
          nomeSocial: nomeSocial !== undefined ? nomeSocial : paciente.nomeSocial,
          municipioNascimento: municipioNascimento !== undefined ? municipioNascimento : paciente.municipioNascimento,
          nacionalidade: nacionalidade || paciente.nacionalidade,
          paisNascimento: paisNascimento || paciente.paisNascimento,
          corRaca: corRaca || paciente.corRaca,
          etnia: etnia !== undefined ? etnia : paciente.etnia,
          tipoSanguineo: tipoSanguineo !== undefined ? tipoSanguineo : paciente.tipoSanguineo,
          prontuariosAntigos: prontuariosAntigos !== undefined ? prontuariosAntigos : paciente.prontuariosAntigos,
          alergias: alergias !== undefined ? alergias : paciente.alergias,
          familia: familia !== undefined ? familia : paciente.familia,
          area: area !== undefined ? area : paciente.area,
          subarea: subarea !== undefined ? subarea : paciente.subarea,
          escolaridade: escolaridade !== undefined ? escolaridade : paciente.escolaridade,
          
          celular: celular || paciente.celular,
          telefone: telefone !== undefined ? telefone : paciente.telefone,
          email: email !== undefined ? email : paciente.email,
          nomeMae: maeDesconhecida === true ? 'Desconhecida' : (nomeMae !== undefined ? nomeMae : paciente.nomeMae),
          maeDesconhecida: maeDesconhecida !== undefined ? Boolean(maeDesconhecida) : paciente.maeDesconhecida,
          nomePai: paiDesconhecido === true ? 'Desconhecido' : (nomePai !== undefined ? nomePai : paciente.nomePai),
          paiDesconhecido: paiDesconhecido !== undefined ? Boolean(paiDesconhecido) : paciente.paiDesconhecido,
          
          rg: rg !== undefined ? rg : paciente.rg,
          orgaoEmissor: orgaoEmissor !== undefined ? orgaoEmissor : paciente.orgaoEmissor,
          ufRg: ufRg !== undefined ? ufRg : paciente.ufRg,
          dataExpedicaoRg: dataExpedicaoRg !== undefined ? (dataExpedicaoRg ? new Date(dataExpedicaoRg) : null) : paciente.dataExpedicaoRg,
          nis: nis !== undefined ? nis : paciente.nis,
          certidaoNascimento: certidaoNascimento !== undefined ? certidaoNascimento : paciente.certidaoNascimento,
          dataObito: dataObito !== undefined ? (dataObito ? new Date(dataObito) : null) : paciente.dataObito,
          tituloEleitor: tituloEleitor !== undefined ? tituloEleitor : paciente.tituloEleitor,
          estadoCivil: estadoCivil !== undefined ? estadoCivil : paciente.estadoCivil,
          funcionarioExterno: funcionarioExterno !== undefined ? Boolean(funcionarioExterno) : paciente.funcionarioExterno,
          observacao: observacao !== undefined ? observacao : paciente.observacao,
          profissaoCbo: profissaoCbo !== undefined ? profissaoCbo : paciente.profissaoCbo,
          localTrabalho: localTrabalho !== undefined ? localTrabalho : paciente.localTrabalho,
          
          situacaoRua: situacaoRua !== undefined ? Boolean(situacaoRua) : paciente.situacaoRua,
          cep: cep || paciente.cep,
          tipoLogradouro: tipoLogradouro || paciente.tipoLogradouro,
          logradouro: logradouro || paciente.logradouro,
          numero: numero || paciente.numero,
          bairro: bairro || paciente.bairro,
          complemento: complemento !== undefined ? complemento : paciente.complemento,
          municipio: municipio || paciente.municipio,
          localizacao: localizacao || paciente.localizacao,
        }
      });

      return res.json(pacienteAtualizado);
    } catch (err: any) {
      console.error('Erro ao atualizar paciente:', err);
      return res.status(500).json({ error: 'Erro interno ao atualizar paciente.' });
    }
  }
}
