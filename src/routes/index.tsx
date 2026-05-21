import { createBrowserRouter, Navigate } from 'react-router';
import Layout from '../components/Layout/Layout';
import LoginPage from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import Fornecedor from '../pages/Fornecedor';
import Fallback from '../pages/Fallback';
import AccessDenied from '../pages/AccessDenied';
import { ProtectedRoute } from '../components/ProtectedRoute';

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
        element: <Dashboard />,
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
          return { Component: AtasLista };
        },
      },
      {
        path: 'atas/:id',
        lazy: async () => {
          const { AtasDetalhes } = await import('../pages/Atas/Detalhes');
          return { Component: AtasDetalhes };
        },
      },
      {
        path: 'pedidos',
        lazy: async () => {
          const { PedidosLista } = await import('../pages/Pedidos');
          return { Component: PedidosLista };
        },
      },
      {
        path: 'pedidos/novo',
        lazy: async () => {
          const { NovoPedido } = await import('../pages/Pedidos/Novo');
          return { Component: NovoPedido };
        },
      },
      {
        path: 'confirmar-entrega/:id',
        lazy: async () => {
          const { ConfirmarEntrega } = await import('../pages/Pedidos/ConfirmarEntrega');
          return { Component: ConfirmarEntrega };
        },
      },
      {
        path: 'comparar-orcamentos/:id',
        lazy: async () => {
          const { CompararOrcamentos } = await import('../pages/CompararOrcamentos');
          return { Component: CompararOrcamentos };
        },
      },

      {
        path: 'fornecedores',
        lazy: async () => {
          const { FornecedoresLista } = await import('../pages/Fornecedores');
          return {
            Component: () => (
              <ProtectedRoute allowedRoles={['COMPRADOR']}>
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
              <ProtectedRoute allowedRoles={['COMPRADOR']}>
                <AuditoriaLista />
              </ProtectedRoute>
            ) 
          };
        },
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
