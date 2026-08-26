import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';

export class ViagemTransporteController {
  // GET /api/motorista/viagens
  listar = async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { status, data } = req.query;
      const where: any = {};

      if (user.perfil === 'ENTREGADOR' || user.role === 'ENTREGADOR') {
        where.motoristaId = user.id;
      }

      if (status && typeof status === 'string' && status !== 'TODOS') {
        where.status = status;
      }

      if (data && typeof data === 'string') {
        const d = new Date(data);
        const inicio = new Date(d.setHours(0, 0, 0, 0));
        const fim = new Date(d.setHours(23, 59, 59, 999));
        where.dataViagem = { gte: inicio, lte: fim };
      }

      const viagens = await prisma.viagemTransporte.findMany({
        where,
        include: {
          motorista: {
            select: { id: true, nome: true, email: true, telefone: true }
          },
          passageiros: {
            include: {
              paciente: {
                select: { id: true, nomeCompleto: true, cartaoSus: true, cpf: true, celular: true }
              }
            }
          }
        },
        orderBy: { dataViagem: 'desc' }
      });

      res.json(viagens);
    } catch (err: any) {
      console.error('Erro ao listar viagens:', err);
      res.status(500).json({ error: 'Erro ao listar viagens de transporte' });
    }
  };

  // GET /api/motorista/viagens/:id
  obterPorId = async (req: AuthRequest, res: Response) => {
    try {
      const id = String(req.params.id);

      const viagem = await prisma.viagemTransporte.findUnique({
        where: { id },
        include: {
          motorista: {
            select: { id: true, nome: true, email: true, telefone: true }
          },
          passageiros: {
            include: {
              paciente: {
                select: { id: true, nomeCompleto: true, cartaoSus: true, cpf: true, celular: true, logradouro: true, numero: true, bairro: true }
              }
            }
          }
        }
      });

      if (!viagem) {
        return res.status(404).json({ error: 'Viagem não encontrada' });
      }

      res.json(viagem);
    } catch (err: any) {
      console.error('Erro ao obter viagem:', err);
      res.status(500).json({ error: 'Erro ao buscar detalhes da viagem' });
    }
  };

  // POST /api/motorista/viagens
  criar = async (req: AuthRequest, res: Response) => {
    try {
      const {
        motoristaId,
        veiculo,
        placa,
        origem,
        destino,
        dataViagem,
        observacoes,
        passageiros
      } = req.body;

      const targetMotoristaId = motoristaId || req.user!.id;

      if (!veiculo || !destino || !dataViagem) {
        return res.status(400).json({ error: 'Veículo, destino e data da viagem são obrigatórios' });
      }

      const novaViagem = await prisma.viagemTransporte.create({
        data: {
          motoristaId: targetMotoristaId,
          veiculo,
          placa: placa || null,
          origem: origem || 'UBS Central / Regulação',
          destino,
          dataViagem: new Date(dataViagem),
          observacoes: observacoes || null,
          status: 'AGENDADA',
          passageiros: passageiros && Array.isArray(passageiros) ? {
            create: passageiros.map((p: any) => ({
              pacienteId: p.pacienteId || null,
              nomePaciente: p.nomePaciente,
              cartaoSus: p.cartaoSus || null,
              acompanhante: p.acompanhante || null,
              status: 'PENDENTE'
            }))
          } : undefined
        },
        include: {
          passageiros: true,
          motorista: { select: { id: true, nome: true } }
        }
      });

      res.status(201).json(novaViagem);
    } catch (err: any) {
      console.error('Erro ao criar viagem:', err);
      res.status(500).json({ error: 'Erro ao criar viagem de transporte' });
    }
  };

  // PATCH /api/motorista/viagens/:id/etapa (Gerencia as 4 etapas de ida e volta)
  avancarEtapa = async (req: AuthRequest, res: Response) => {
    try {
      const id = String(req.params.id);
      const { etapa, lat, lng, assinaturaBase64, observacoes } = req.body;

      const viagemExistente = await prisma.viagemTransporte.findUnique({
        where: { id },
        include: { passageiros: true }
      });

      if (!viagemExistente) {
        return res.status(404).json({ error: 'Viagem não encontrada' });
      }

      // Validar presença de todos os passageiros antes de sair da cidade
      if (etapa === 'SAIDA_CIDADE') {
        const pendentes = viagemExistente.passageiros?.filter((p: any) => p.status === 'PENDENTE') || [];
        if (pendentes.length > 0) {
          return res.status(400).json({
            error: `Antes de iniciar a rota, informe quem embarcou e quem faltou (${pendentes.length} paciente(s) pendente(s)).`
          });
        }
      }

      const agora = new Date();
      const pontosAtuais: any[] = Array.isArray(viagemExistente.gpsPontos) ? (viagemExistente.gpsPontos as any[]) : [];
      
      if (lat && lng) {
        pontosAtuais.push({
          lat: Number(lat),
          lng: Number(lng),
          timestamp: agora.toISOString(),
          etapa
        });
      }

      const updateData: any = {
        status: etapa,
        gpsPontos: pontosAtuais
      };

      if (observacoes) updateData.observacoes = observacoes;

      switch (etapa) {
        case 'SAIDA_CIDADE':
          updateData.saidaOrigemEm = agora;
          updateData.iniciadaEm = agora;
          if (lat && lng) {
            updateData.gpsInicioLat = Number(lat);
            updateData.gpsInicioLng = Number(lng);
          }
          break;

        case 'CHEGADA_DESTINO':
          updateData.chegadaDestinoEm = agora;
          break;

        case 'RETORNO_DESTINO':
          updateData.saidaDestinoEm = agora;
          break;

        case 'CONCLUIDA':
          updateData.chegadaOrigemEm = agora;
          updateData.concluidaEm = agora;
          if (lat && lng) {
            updateData.gpsFimLat = Number(lat);
            updateData.gpsFimLng = Number(lng);
          }
          if (assinaturaBase64) {
            updateData.assinaturaBase64 = assinaturaBase64;
          }
          break;

        default:
          return res.status(400).json({ error: `Etapa inválida: ${etapa}` });
      }

      const viagem = await prisma.viagemTransporte.update({
        where: { id },
        data: updateData,
        include: { passageiros: true }
      });

      res.json(viagem);
    } catch (err: any) {
      console.error('Erro ao avançar etapa da viagem:', err);
      res.status(500).json({ error: 'Erro ao registrar etapa da viagem' });
    }
  };

  // POST /api/motorista/viagens/:id/gps
  registrarPontoGps = async (req: AuthRequest, res: Response) => {
    try {
      const id = String(req.params.id);
      const { lat, lng, precisao, velocidade } = req.body;

      if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude e Longitude são obrigatórias' });
      }

      const viagem = await prisma.viagemTransporte.findUnique({
        where: { id },
        select: { id: true, status: true, gpsPontos: true }
      });

      if (!viagem) {
        return res.status(404).json({ error: 'Viagem não encontrada' });
      }

      if (viagem.status === 'AGENDADA' || viagem.status === 'CONCLUIDA' || viagem.status === 'CANCELADA') {
        return res.status(400).json({ error: 'Apenas viagens em trânsito registram telemetria' });
      }

      const pontosAtuais: any[] = Array.isArray(viagem.gpsPontos) ? (viagem.gpsPontos as any[]) : [];
      
      pontosAtuais.push({
        lat: Number(lat),
        lng: Number(lng),
        precisao: precisao ? Number(precisao) : null,
        velocidade: velocidade ? Number(velocidade) : null,
        timestamp: new Date().toISOString(),
        etapa: viagem.status
      });

      await prisma.viagemTransporte.update({
        where: { id },
        data: {
          gpsPontos: pontosAtuais
        }
      });

      res.json({ success: true, totalPontos: pontosAtuais.length });
    } catch (err: any) {
      console.error('Erro ao registrar GPS:', err);
      res.status(500).json({ error: 'Erro ao salvar coordenada GPS' });
    }
  };

  // PATCH /api/motorista/viagens/passageiro/:passageiroId
  atualizarStatusPassageiro = async (req: AuthRequest, res: Response) => {
    try {
      const passageiroId = String(req.params.passageiroId);
      const { status, motivoAusencia } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status do passageiro é obrigatório' });
      }

      const passageiro = await prisma.viagemPassageiro.update({
        where: { id: passageiroId },
        data: {
          status,
          motivoAusencia: motivoAusencia || null
        }
      });

      res.json(passageiro);
    } catch (err: any) {
      console.error('Erro ao atualizar passageiro:', err);
      res.status(500).json({ error: 'Erro ao atualizar status do passageiro' });
    }
  };

  // GET /api/motorista/viagens/:id/relatorio
  relatorio = async (req: AuthRequest, res: Response) => {
    try {
      const id = String(req.params.id);

      const viagem = await prisma.viagemTransporte.findUnique({
        where: { id },
        include: {
          motorista: {
            select: { id: true, nome: true, cpf: true, email: true, telefone: true }
          },
          passageiros: {
            include: {
              paciente: true
            }
          }
        }
      });

      if (!viagem) {
        return res.status(404).json({ error: 'Viagem não encontrada' });
      }

      const totalPassageiros = viagem.passageiros.length;
      const embarcados = viagem.passageiros.filter((p: any) => p.status === 'EMBARCOU' || p.status === 'DESEMBARCOU').length;
      const ausentes = viagem.passageiros.filter((p: any) => p.status === 'NAO_COMPARECEU').length;
      const pontosGps = Array.isArray(viagem.gpsPontos) ? (viagem.gpsPontos as any[]) : [];

      res.json({
        viagem,
        resumo: {
          totalPassageiros,
          embarcados,
          ausentes,
          totalPontosGps: pontosGps.length,
          tempoTotalMinutos: viagem.saidaOrigemEm && viagem.chegadaOrigemEm
            ? Math.round((new Date(viagem.chegadaOrigemEm).getTime() - new Date(viagem.saidaOrigemEm).getTime()) / 60000)
            : viagem.iniciadaEm && viagem.concluidaEm
            ? Math.round((new Date(viagem.concluidaEm).getTime() - new Date(viagem.iniciadaEm).getTime()) / 60000)
            : null
        }
      });
    } catch (err: any) {
      console.error('Erro ao gerar relatório:', err);
      res.status(500).json({ error: 'Erro ao gerar relatório consolidado da viagem' });
    }
  };
}
