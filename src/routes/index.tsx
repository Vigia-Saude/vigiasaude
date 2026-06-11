import { createBrowserRouter, Navigate } from 'react-router';
import Layout from '../components/Layout/Layout';
import LoginPage from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import Fornecedor from '../pages/Fornecedor';
import Fallback from '../pages/Fallback';
import AccessDenied from '../pages/AccessDenied';
import { ProtectedRoute } from '../components/ProtectedRoute';

// CD Pages
import { DashboardCD } from '../pages/Cd/DashboardCD';
import { MeuEstoque } from '../pages/Cd/MeuEstoque';
import { Recebimento } from '../pages/Cd/Recebimento';
import { PedidosCD } from '../pages/Cd/PedidosCD';
import { Entregas } from '../pages/Cd/Entregas';
import { Recalls } from '../pages/Cd/Recalls';
import { Rastreabilidade } from '../pages/Cd/Rastreabilidade';
import { AuditoriaCD } from '../pages/Cd/AuditoriaCD';
import { Notificacoes } from '../pages/Cd/Notificacoes';
import { PortalPublico } from '../pages/Cd/PortalPublico';
import { Configuracoes } from '../pages/Cd/Configuracoes';

// Farmacia Pages
import { DashboardFarmacia } from '../pages/Farmacia/DashboardFarmacia';
import { MeuEstoqueFarmacia } from '../pages/Farmacia/MeuEstoqueFarmacia';
import { PedidosRecomposicao as PedidosRecomposicaoFarmacia } from '../pages/Farmacia/PedidosRecomposicao';
import { Dispensacao as DispensacaoFarmacia } from '../pages/Farmacia/Dispensacao';
import { EntregasReposicao as EntregasReposicaoFarmacia } from '../pages/Farmacia/EntregasReposicao';
import { NotificacoesFarmacia } from '../pages/Farmacia/NotificacoesFarmacia';
import { ConfiguracoesFarmacia } from '../pages/Farmacia/ConfiguracoesFarmacia';

// Posto Pages
import { DashboardPosto } from '../pages/Posto/DashboardPosto';
import { MeuEstoquePosto } from '../pages/Posto/MeuEstoquePosto';
import { PedidosRecomposicao as PedidosRecomposicaoPosto } from '../pages/Posto/PedidosRecomposicao';
import { Dispensacao as DispensacaoPosto } from '../pages/Posto/Dispensacao';
import { EntregasReposicao as EntregasReposicaoPosto } from '../pages/Posto/EntregasReposicao';
import { NotificacoesPosto } from '../pages/Posto/NotificacoesPosto';
import { ConfiguracoesPosto } from '../pages/Posto/ConfiguracoesPosto';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
    errorElement: <Fallback />,
  },
  {
    path: '/acesso-negado',
    element: <AccessDenied />,
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
        element: (
          <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE']}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'fornecedor',
        element: (
          <ProtectedRoute allowedRoles={['FORNECEDOR']}>
            <Fornecedor />
          </ProtectedRoute>
        ),
      },
      {
        path: 'atas',
        lazy: async () => {
          const { AtasLista } = await import('../pages/Atas');
          return {
            Component: () => (
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE']}>
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
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE']}>
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
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE']}>
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
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE']}>
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
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE']}>
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
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE']}>
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
              <ProtectedRoute allowedRoles={['COMPRADOR']} excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE']}>
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
              <ProtectedRoute allowedRoles={['COMPRADOR']} excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE']}>
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
              <ProtectedRoute allowedRoles={['COMPRADOR']} excludePerfil={['GESTOR_ESTOQUE', 'FARMACIA', 'POSTO_SAUDE']}>
                <SolicitacoesMembro />
              </ProtectedRoute>
            )
          };
        },
      },

      // CD Manager Protected Routes
      {
        path: 'cd/dashboard',
        element: (
          <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
            <DashboardCD />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cd/meu-estoque',
        element: (
          <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
            <MeuEstoque />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cd/recebimento',
        element: (
          <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
            <Recebimento />
          </ProtectedRoute>
        ),
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
        element: (
          <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
            <PedidosCD />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cd/entregas',
        element: (
          <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
            <Entregas />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cd/recalls',
        element: (
          <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
            <Recalls />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cd/rastreabilidade',
        element: (
          <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
            <Rastreabilidade />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cd/auditoria',
        element: (
          <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
            <AuditoriaCD />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cd/notificacoes',
        element: (
          <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
            <Notificacoes />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cd/portal-publico',
        element: (
          <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
            <PortalPublico />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cd/configuracoes',
        element: (
          <ProtectedRoute allowedPerfil={['GESTOR_ESTOQUE']}>
            <Configuracoes />
          </ProtectedRoute>
        ),
      },

      // Farmacia Protected Routes
      {
        path: 'farmacia/dashboard',
        element: (
          <ProtectedRoute allowedPerfil={['FARMACIA']}>
            <DashboardFarmacia />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farmacia/meu-estoque',
        element: (
          <ProtectedRoute allowedPerfil={['FARMACIA']}>
            <MeuEstoqueFarmacia />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farmacia/pedidos-recomposicao',
        element: (
          <ProtectedRoute allowedPerfil={['FARMACIA']}>
            <PedidosRecomposicaoFarmacia />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farmacia/dispensacao',
        element: (
          <ProtectedRoute allowedPerfil={['FARMACIA']}>
            <DispensacaoFarmacia />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farmacia/entregas',
        element: (
          <ProtectedRoute allowedPerfil={['FARMACIA']}>
            <EntregasReposicaoFarmacia />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farmacia/notificacoes',
        element: (
          <ProtectedRoute allowedPerfil={['FARMACIA']}>
            <NotificacoesFarmacia />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farmacia/configuracoes',
        element: (
          <ProtectedRoute allowedPerfil={['FARMACIA']}>
            <ConfiguracoesFarmacia />
          </ProtectedRoute>
        ),
      },

      // Posto de Saude Protected Routes
      {
        path: 'posto/dashboard',
        element: (
          <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
            <DashboardPosto />
          </ProtectedRoute>
        ),
      },
      {
        path: 'posto/meu-estoque',
        element: (
          <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
            <MeuEstoquePosto />
          </ProtectedRoute>
        ),
      },
      {
        path: 'posto/pedidos-recomposicao',
        element: (
          <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
            <PedidosRecomposicaoPosto />
          </ProtectedRoute>
        ),
      },
      {
        path: 'posto/dispensacao',
        element: (
          <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
            <DispensacaoPosto />
          </ProtectedRoute>
        ),
      },
      {
        path: 'posto/entregas',
        element: (
          <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
            <EntregasReposicaoPosto />
          </ProtectedRoute>
        ),
      },
      {
        path: 'posto/notificacoes',
        element: (
          <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
            <NotificacoesPosto />
          </ProtectedRoute>
        ),
      },
      {
        path: 'posto/configuracoes',
        element: (
          <ProtectedRoute allowedPerfil={['POSTO_SAUDE']}>
            <ConfiguracoesPosto />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
