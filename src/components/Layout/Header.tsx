import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, LogOut, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendentes, setPendentes] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Buscar solicitações pendentes se for secretário
  useEffect(() => {
    if (user?.perfil !== 'SECRETARIO_SAUDE') return;

    async function fetchPendentes() {
      try {
        const token = localStorage.getItem('vigia_token') || localStorage.getItem('vigiasaude_token');
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/auth/pendentes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setPendentes(data);
        }
      } catch (err) {
        console.error('Erro ao buscar notificações pendentes:', err);
      }
    }

    fetchPendentes();

    // Poll a cada 30 segundos
    const interval = setInterval(fetchPendentes, 30000);
    return () => clearInterval(interval);
  }, [user]);

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
            <p className="text-xs text-gray-500 uppercase">
              {user.role === 'COMPRADOR' ? (user.perfil ? user.perfil.replace(/_/g, ' ') : 'COMPRADOR') : 'FORNECEDOR'}
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
            {pendentes.length > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                {pendentes.length}
              </span>
            )}
          </button>

          {/* Dropdown Card */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-150 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-fade-in z-50">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
                <span className="text-[10px] font-extrabold text-gray-900 uppercase tracking-wider">Solicitações de Acesso</span>
                <span className="rounded-full bg-orange-105 px-2 py-0.5 text-[10px] font-bold text-orange-600 bg-orange-50">
                  {pendentes.length} pendente{pendentes.length !== 1 && 's'}
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto py-1">
                {pendentes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400">
                    <Bell className="h-8 w-8 text-gray-300 mb-2 stroke-[1.5]" />
                    <p className="text-xs font-semibold">Nenhuma solicitação pendente</p>
                  </div>
                ) : (
                  pendentes.map((p) => (
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
                  ))
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
