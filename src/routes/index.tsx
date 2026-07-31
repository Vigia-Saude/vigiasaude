import { createBrowserRouter, Navigate } from 'react-router';
import Layout from '../components/Layout/Layout';
import LoginPage from '../pages/LoginPage';
import Fallback from '../pages/Fallback';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
    errorElement: <Fallback />,
  },
  {
    path: '/acesso-negado',
    lazy: async () => {
      const AccessDenied = (await import('../pages/AccessDenied')).default;
      return { Component: AccessDenied };
    }
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    errorElement: <Fallback />,
    children: [
      {
        path: 'dashboard',
        lazy: async () => {
          const Dashboard = (await import('../pages/Dashboard')).default;
          return {
            Component: () => (
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE', 'ENTREGADOR']}>
                <Dashboard />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'fornecedor',
        lazy: async () => {
          const Fornecedor = (await import('../pages/Fornecedor')).default;
          return {
            Component: () => (
              <ProtectedRoute allowedRoles={['FORNECEDOR']}>
                <Fornecedor />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'atas',
        lazy: async () => {
          const { AtasLista } = await import('../pages/Atas');
          return {
            Component: () => (
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE', 'ENTREGADOR']}>
                <AtasLista />
              </ProtectedRoute>
            )
          };
        },
      },
      {
        path: 'atas/:id',
        lazy: async () => {
          const { AtasDetalhes } = await import('../pages/Atas/Detalhes');
          return {
            Component: () => (
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE', 'ENTREGADOR']}>
                <AtasDetalhes />
              </ProtectedRoute>
            )
          };
        },
      },
      {
        path: 'pedidos',
        lazy: async () => {
          const { PedidosLista } = await import('../pages/Pedidos');
          return {
            Component: () => (
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE', 'ENTREGADOR']}>
                <PedidosLista />
              </ProtectedRoute>
            )
          };
        },
      },
      {
        path: 'pedidos/novo',
        lazy: async () => {
          const { NovoPedido } = await import('../pages/Pedidos/Novo');
          return {
            Component: () => (
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE', 'ENTREGADOR']}>
                <NovoPedido />
              </ProtectedRoute>
            )
          };
        },
      },
      {
        path: 'confirmar-entrega/:id',
        lazy: async () => {
          const { ConfirmarEntrega } = await import('../pages/Pedidos/ConfirmarEntrega');
          return {
            Component: () => (
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE', 'ENTREGADOR']}>
                <ConfirmarEntrega />
              </ProtectedRoute>
            )
          };
        },
      },
      {
        path: 'comparar-orcamentos/:id',
        lazy: async () => {
          const { CompararOrcamentos } = await import('../pages/CompararOrcamentos');
          return {
            Component: () => (
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE', 'ENTREGADOR']}>
                <CompararOrcamentos />
              </ProtectedRoute>
            )
          };
        },
      },
      {
        path: 'fornecedores',
        lazy: async () => {
          const { FornecedoresLista } = await import('../pages/Fornecedores');
          return {
            Component: () => (
              <ProtectedRoute allowedRoles={['COMPRADOR']} excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE', 'ENTREGADOR']}>
                <FornecedoresLista />
              </ProtectedRoute>
            )
          };
        },
      },
      {
        path: 'auditoria',
        lazy: async () => {
          const { AuditoriaLista } = await import('../pages/Auditoria');
          return { 
            Component: () => (
              <ProtectedRoute allowedRoles={['COMPRADOR']} excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE', 'ENTREGADOR']}>
                <AuditoriaLista />
              </ProtectedRoute>
            ) 
          };
        },
      },
      {
        path: 'solicitacoes',
        lazy: async () => {
          const { SolicitacoesMembro } = await import('../pages/Solicitacoes');
          return {
            Component: () => (
              <ProtectedRoute allowedRoles={['COMPRADOR']} excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE', 'ENTREGADOR']}>
                <SolicitacoesMembro />
              </ProtectedRoute>
            )
          };
        },
      },

      // CD Manager Protected Routes
      {
        path: 'cd/dashboard',
        lazy: async () => {
          const { DashboardCD } = await import('../pages/Cd/DashboardCD');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
                <DashboardCD />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'cd/meu-estoque',
        lazy: async () => {
          const { MeuEstoque } = await import('../pages/Cd/MeuEstoque');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
                <MeuEstoque />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'cd/recebimento',
        lazy: async () => {
          const { Recebimento } = await import('../pages/Cd/Recebimento');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
                <Recebimento />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'cd/importar',
        lazy: async () => {
          const { ImportarNota } = await import('../pages/Cd/ImportarNota');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE', 'SECRETARIO_SAUDE']}>
                <ImportarNota />
              </ProtectedRoute>
            )
          };
        },
      },
      {
        path: 'cd/pedidos',
        lazy: async () => {
          const { PedidosCD } = await import('../pages/Cd/PedidosCD');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
                <PedidosCD />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'cd/entregas',
        lazy: async () => {
          const { Entregas } = await import('../pages/Cd/Entregas');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
                <Entregas />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'cd/recalls',
        lazy: async () => {
          const { Recalls } = await import('../pages/Cd/Recalls');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
                <Recalls />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'cd/rastreabilidade',
        lazy: async () => {
          const { Rastreabilidade } = await import('../pages/Cd/Rastreabilidade');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
                <Rastreabilidade />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'cd/auditoria',
        lazy: async () => {
          const { AuditoriaCD } = await import('../pages/Cd/AuditoriaCD');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
                <AuditoriaCD />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'cd/notificacoes',
        lazy: async () => {
          const { Notificacoes } = await import('../pages/Cd/Notificacoes');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
                <Notificacoes />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'cd/portal-publico',
        lazy: async () => {
          const { PortalPublico } = await import('../pages/Cd/PortalPublico');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
                <PortalPublico />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'cd/configuracoes',
        lazy: async () => {
          const { Configuracoes } = await import('../pages/Cd/Configuracoes');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
                <Configuracoes />
              </ProtectedRoute>
            )
          };
        }
      },

      // Farmacia Protected Routes
      {
        path: 'farmacia/dashboard',
        lazy: async () => {
          const { DashboardFarmacia } = await import('../pages/Farmacia/DashboardFarmacia');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['FARMACIA']}>
                <DashboardFarmacia />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'farmacia/meu-estoque',
        lazy: async () => {
          const { MeuEstoqueFarmacia } = await import('../pages/Farmacia/MeuEstoqueFarmacia');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['FARMACIA']}>
                <MeuEstoqueFarmacia />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'farmacia/pedidos-recomposicao',
        lazy: async () => {
          const { PedidosRecomposicao: PedidosRecomposicaoFarmacia } = await import('../pages/Farmacia/PedidosRecomposicao');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['FARMACIA']}>
                <PedidosRecomposicaoFarmacia />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'farmacia/dispensacao',
        lazy: async () => {
          const { Dispensacao: DispensacaoFarmacia } = await import('../pages/Farmacia/Dispensacao');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['FARMACIA']}>
                <DispensacaoFarmacia />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'farmacia/entregas',
        lazy: async () => {
          const { EntregasReposicao: EntregasReposicaoFarmacia } = await import('../pages/Farmacia/EntregasReposicao');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['FARMACIA']}>
                <EntregasReposicaoFarmacia />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'farmacia/notificacoes',
        lazy: async () => {
          const { NotificacoesFarmacia } = await import('../pages/Farmacia/NotificacoesFarmacia');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['FARMACIA']}>
                <NotificacoesFarmacia />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'farmacia/configuracoes',
        lazy: async () => {
          const { ConfiguracoesFarmacia } = await import('../pages/Farmacia/ConfiguracoesFarmacia');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['FARMACIA']}>
                <ConfiguracoesFarmacia />
              </ProtectedRoute>
            )
          };
        }
      },

      // Posto de Saude Protected Routes
      {
        path: 'posto/dashboard',
        lazy: async () => {
          const { DashboardPosto } = await import('../pages/Posto/DashboardPosto');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
                <DashboardPosto />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'posto/meu-estoque',
        lazy: async () => {
          const { MeuEstoquePosto } = await import('../pages/Posto/MeuEstoquePosto');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
                <MeuEstoquePosto />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'posto/pedidos-recomposicao',
        lazy: async () => {
          const { PedidosRecomposicao: PedidosRecomposicaoPosto } = await import('../pages/Posto/PedidosRecomposicao');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
                <PedidosRecomposicaoPosto />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'posto/dispensacao',
        lazy: async () => {
          const { Dispensacao: DispensacaoPosto } = await import('../pages/Posto/Dispensacao');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
                <DispensacaoPosto />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'posto/entregas',
        lazy: async () => {
          const { EntregasReposicao: EntregasReposicaoPosto } = await import('../pages/Posto/EntregasReposicao');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
                <EntregasReposicaoPosto />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'posto/notificacoes',
        lazy: async () => {
          const { NotificacoesPosto } = await import('../pages/Posto/NotificacoesPosto');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
                <NotificacoesPosto />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'posto/configuracoes',
        lazy: async () => {
          const { ConfiguracoesPosto } = await import('../pages/Posto/ConfiguracoesPosto');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
                <ConfiguracoesPosto />
              </ProtectedRoute>
            )
          };
        }
      },

      // Posto de Saude - Pacientes Routes
      {
        path: 'posto/pacientes',
        lazy: async () => {
          const { PacientesGrid } = await import('../pages/Pacientes/PacientesGrid');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
                <PacientesGrid />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'posto/pacientes/novo',
        lazy: async () => {
          const { CadastrarPaciente } = await import('../pages/Pacientes/CadastrarPaciente');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
                <CadastrarPaciente />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'posto/pacientes/editar/:id',
        lazy: async () => {
          const { CadastrarPaciente } = await import('../pages/Pacientes/CadastrarPaciente');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
                <CadastrarPaciente />
              </ProtectedRoute>
            )
          };
        }
      },

      // Posto de Saude - Regulação Routes
      {
        path: 'posto/regulacao/nova',
        lazy: async () => {
          const { NovaFichaRegulacao } = await import('../pages/Regulacao/NovaFichaRegulacao');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
                <NovaFichaRegulacao />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'posto/regulacao/acoes',
        lazy: async () => {
          const { PainelAcoesRegulacao } = await import('../pages/Regulacao/PainelAcoesRegulacao');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
                <PainelAcoesRegulacao />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'posto/regulacao/consulta',
        lazy: async () => {
          const { ConsultaRapidaRegulacao } = await import('../pages/Regulacao/ConsultaRapidaRegulacao');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
                <ConsultaRapidaRegulacao />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'posto/regulacao/:id',
        lazy: async () => {
          const { DetalhesFichaRegulacao } = await import('../pages/Regulacao/DetalhesFichaRegulacao');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
                <DetalhesFichaRegulacao />
              </ProtectedRoute>
            )
          };
        }
      },

      // Regulador (Secretaria) Protected Routes
      {
        path: 'regulador/validacao-pdf',
        lazy: async () => {
          const { ValidacaoPdfPage } = await import('../pages/Regulacao/ValidacaoPdfPage');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['REGULADOR']}>
                <ValidacaoPdfPage />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'regulador/validacao-pdf/:id',
        lazy: async () => {
          const { ValidacaoPdfDetailPage } = await import('../pages/Regulacao/ValidacaoPdfDetailPage');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['REGULADOR']}>
                <ValidacaoPdfDetailPage />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'regulador/filas',
        lazy: async () => {
          const { GestaoFilasPage } = await import('../pages/Regulacao/GestaoFilasPage');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['REGULADOR']}>
                <GestaoFilasPage />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'regulador/filas/:procedureId',
        lazy: async () => {
          const { DetalhesFilaPage } = await import('../pages/Regulacao/DetalhesFilaPage');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['REGULADOR']}>
                <DetalhesFilaPage />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'regulador/fila',
        lazy: async () => {
          const { FilaRegulacaoSecretaria } = await import('../pages/Regulacao/FilaRegulacaoSecretaria');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['REGULADOR']}>
                <FilaRegulacaoSecretaria />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'regulador/agendamento/:id',
        lazy: async () => {
          const { AgendamentoRegulacao } = await import('../pages/Regulacao/AgendamentoRegulacao');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['REGULADOR']}>
                <AgendamentoRegulacao />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'regulador/:id',
        lazy: async () => {
          const { DetalhesFichaRegulacao } = await import('../pages/Regulacao/DetalhesFichaRegulacao');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['REGULADOR']}>
                <DetalhesFichaRegulacao />
              </ProtectedRoute>
            )
          };
        }
      },

      // Motorista Protected Routes
      {
        path: 'motorista/dashboard',
        lazy: async () => {
          const { DashboardMotorista } = await import('../pages/Motorista/DashboardMotorista');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['ENTREGADOR']}>
                <DashboardMotorista />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'motorista/coletas',
        lazy: async () => {
          const { ColetasPendentes } = await import('../pages/Motorista/ColetasPendentes');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['ENTREGADOR']}>
                <ColetasPendentes />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'motorista/entregas',
        lazy: async () => {
          const { MinhasEntregas } = await import('../pages/Motorista/MinhasEntregas');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['ENTREGADOR']}>
                <MinhasEntregas />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'motorista/historico',
        lazy: async () => {
          const { HistoricoMotorista } = await import('../pages/Motorista/HistoricoMotorista');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['ENTREGADOR']}>
                <HistoricoMotorista />
              </ProtectedRoute>
            )
          };
        }
      },
      {
        path: 'motorista/configuracoes',
        lazy: async () => {
          const { ConfiguracoesMotorista } = await import('../pages/Motorista/ConfiguracoesMotorista');
          return {
            Component: () => (
              <ProtectedRoute allowedPerfil={['ENTREGADOR']}>
                <ConfiguracoesMotorista />
              </ProtectedRoute>
            )
          };
        }
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
