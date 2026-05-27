import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  allowedPerfil?: ('SECRETARIO_SAUDE' | 'GESTOR_ESTOQUE' | 'FARMACIA' | 'MEDICO' | 'ENTREGADOR')[];
  excludePerfil?: ('SECRETARIO_SAUDE' | 'GESTOR_ESTOQUE' | 'FARMACIA' | 'MEDICO' | 'ENTREGADOR')[];
}

export function ProtectedRoute({ children, allowedRoles, allowedPerfil, excludePerfil }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  if (allowedPerfil && (!user.perfil || !allowedPerfil.includes(user.perfil))) {
    return <Navigate to="/acesso-negado" replace />;
  }

  if (excludePerfil && user.perfil && excludePerfil.includes(user.perfil)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <>{children}</>;
}
