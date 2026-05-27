import { createBrowserRouter, Navigate } from 'react-router';
import Layout from '../components/Layout/Layout';
import LoginPage from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import Fornecedor from '../pages/Fornecedor';
import Fallback from '../pages/Fallback';
import AccessDenied from '../pages/AccessDenied';
import { ProtectedRoute } from '../components/ProtectedRoute';

// CD Pages
import { DashboardCD } from '../pages/CD/DashboardCD';
import { MeuEstoque } from '../pages/CD/MeuEstoque';
import { Recebimento } from '../pages/CD/Recebimento';
import { PedidosCD } from '../pages/CD/PedidosCD';
import { Entregas } from '../pages/CD/Entregas';
import { Recalls } from '../pages/CD/Recalls';
import { Rastreabilidade } from '../pages/CD/Rastreabilidade';
import { AuditoriaCD } from '../pages/CD/AuditoriaCD';
import { Notificacoes } from '../pages/CD/Notificacoes';
import { PortalPublico } from '../pages/CD/PortalPublico';
import { Configuracoes } from '../pages/CD/Configuracoes';

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
          <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE']}>
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
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE']}>
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
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE']}>
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
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE']}>
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
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE']}>
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
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE']}>
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
              <ProtectedRoute excludePerfil={['GESTOR_ESTOQUE']}>
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
              <ProtectedRoute allowedRoles={['COMPRADOR']} excludePerfil={['GESTOR_ESTOQUE']}>
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
              <ProtectedRoute allowedRoles={['COMPRADOR']} excludePerfil={['GESTOR_ESTOQUE']}>
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
              <ProtectedRoute allowedRoles={['COMPRADOR']} excludePerfil={['GESTOR_ESTOQUE']}>
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
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
