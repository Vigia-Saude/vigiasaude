import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, LogOut, Clock, AlertTriangle, AlertCircle, Info, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import { useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Buscar solicitações pendentes se for secretário usando React Query
  const { data: pendentes = [] } = useQuery({
    queryKey: ['solicitacoesPendentes'],
    queryFn: async () => {
      const res = await apiClient.get<any[]>('/auth/pendentes');
      return res.data;
    },
    refetchInterval: 30000,
    enabled: user?.perfil === 'SECRETARIO_SAUDE',
  });

  // Buscar alertas do CD se for perfil do CD
  const { data: cdAlertas = [] } = useQuery({
    queryKey: ['cdAlertasHeader'],
    queryFn: async () => {
      const res = await apiClient.get('/api/cd/alertas');
      return res.data?.dados || res.data || [];
    },
    refetchInterval: 15000,
    enabled: user?.perfil === 'GESTOR_ESTOQUE' || user?.role === 'FORNECEDOR',
  });

  const novosCdAlertas = cdAlertas.filter((a: any) => a.status === 'NOVO');
  const totalNotificacoes = (user?.perfil === 'SECRETARIO_SAUDE' ? pendentes.length : 0) + novosCdAlertas.length;

  const handleMarcarAlertaLido = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.patch(`/api/cd/alertas/${id}/lido`);
      queryClient.invalidateQueries({ queryKey: ['cdAlertasHeader'] });
      queryClient.invalidateQueries({ queryKey: ['cdAlertasSidebar'] });
      queryClient.invalidateQueries({ queryKey: ['cdDashboardStats'] });
    } catch (err) {
      console.error('Erro ao marcar alerta como lido:', err);
    }
  };

  const handleMarcarTodosLidos = async () => {
    try {
      await Promise.all(novosCdAlertas.map((a: any) => apiClient.patch(`/api/cd/alertas/${a.id}/lido`)));
      queryClient.invalidateQueries({ queryKey: ['cdAlertasHeader'] });
      queryClient.invalidateQueries({ queryKey: ['cdAlertasSidebar'] });
      queryClient.invalidateQueries({ queryKey: ['cdDashboardStats'] });
    } catch (err) {
      console.error('Erro ao marcar todos os alertas como lidos:', err);
    }
  };

  const getPerfilDisplayName = () => {
    if (user?.role === 'FORNECEDOR') return 'FORNECEDOR';
    if (!user?.perfil) return 'COMPRADOR';
    
    let perfilName = user.perfil.replace(/_/g, ' ');
    if (user.perfil === 'FARMACIA') perfilName = 'Farmácia';
    else if (user.perfil === 'POSTO_SAUDE') perfilName = 'Posto de Saúde';
    else if (user.perfil === 'GESTOR_ESTOQUE') perfilName = 'Gerente de Estoque';
    else if (user.perfil === 'SECRETARIO_SAUDE') perfilName = 'Secretário de Saúde';
    
    if (user.unidadeNome) {
      return `${perfilName} - ${user.unidadeNome}`;
    }
    return perfilName;
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (userId: string) => {
    setIsDropdownOpen(false);
    navigate(`/solicitacoes?id=${userId}`);
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        {user && (
          <div className="hidden sm:block">
            <h2 className="text-sm font-semibold text-gray-800">Bem-vindo, {user.nome}</h2>
            <p className="text-xs text-gray-500 font-medium">
              {getPerfilDisplayName()}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Notificações Sino */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-650 transition-colors relative cursor-pointer"
            aria-label="Abrir notificações"
          >
            <Bell className="h-5 w-5" />
            {totalNotificacoes > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                {totalNotificacoes}
              </span>
            )}
          </button>

          {/* Dropdown Card */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-88 rounded-2xl border border-gray-150 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-fade-in z-50">
              {/* Header do Dropdown */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
                <span className="text-[10px] font-extrabold text-gray-900 uppercase tracking-wider">
                  {user?.perfil === 'SECRETARIO_SAUDE' ? 'Solicitações de Acesso' : 'Notificações & Alertas'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                    {totalNotificacoes} pendente{totalNotificacoes !== 1 && 's'}
                  </span>
                  {novosCdAlertas.length > 0 && (
                    <button
                      onClick={handleMarcarTodosLidos}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-100 cursor-pointer border-0"
                      title="Marcar todas como lidas"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lista de Notificações */}
              <div className="max-h-80 overflow-y-auto py-1 divide-y divide-gray-50">
                {/* 1. Alertas do CD */}
                {novosCdAlertas.length > 0 && novosCdAlertas.map((alerta: any) => (
                  <div
                    key={alerta.id}
                    className="p-3 hover:bg-gray-50/80 transition-colors flex items-start gap-3 rounded-xl"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {alerta.tipo === 'ESTOQUE_MINIMO' ? (
                        <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
                      ) : alerta.tipo === 'RECALL' ? (
                        <AlertCircle className="h-4.5 w-4.5 text-amber-500" />
                      ) : (
                        <Info className="h-4.5 w-4.5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{alerta.titulo}</p>
                        <span className="text-[9px] text-gray-400 font-medium">
                          {new Date(alerta.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">{alerta.descricao}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="inline-flex px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-50 text-red-700 border border-red-150">
                          {alerta.tipo === 'ESTOQUE_MINIMO' ? 'Estoque Crítico' : alerta.tipo}
                        </span>
                        <button
                          onClick={(e) => handleMarcarAlertaLido(alerta.id, e)}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline border-0 bg-transparent cursor-pointer flex items-center gap-0.5"
                        >
                          <Check className="h-3 w-3" />
                          Marcar como lida
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 2. Solicitações de Acesso para Secretário */}
                {user?.perfil === 'SECRETARIO_SAUDE' && pendentes.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleNotificationClick(p.id)}
                    className="w-full flex items-start gap-3 rounded-xl p-3 text-left hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 text-xs font-bold">
                      {p.nome.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">
                        {p.nome}
                      </p>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                        {p.perfil ? p.perfil.replace(/_/g, ' ') : p.role}
                      </p>
                      <div className="flex items-center gap-1 text-[9px] text-gray-400 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>{new Date(p.criadoEm).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </button>
                ))}

                {/* Estado vazio */}
                {totalNotificacoes === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400">
                    <Bell className="h-8 w-8 text-gray-300 mb-2 stroke-[1.5]" />
                    <p className="text-xs font-semibold text-gray-600">Nenhuma notificação pendente</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Tudo em dia com o seu estoque!</p>
                  </div>
                )}
              </div>

              {user?.perfil === 'SECRETARIO_SAUDE' && (
                <div className="border-t border-gray-100 pt-2 px-2 pb-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/solicitacoes');
                    }}
                    className="w-full rounded-xl bg-gray-50 py-2.5 text-center text-[10px] font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    Ver Central de Solicitações
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="h-8 w-px bg-gray-200 mx-2" />

        <button 
          onClick={logout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden sm:block">Sair</span>
        </button>
      </div>
    </header>
  );
}
