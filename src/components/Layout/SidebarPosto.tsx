import { Link, useLocation } from 'react-router';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Pill, 
  Truck, 
  Bell, 
  Settings,
  ChevronLeft,
  Shield,
  FilePlus2,
  Send,
  Search,
  Users
} from 'lucide-react';

interface SidebarPostoProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function SidebarPosto({ isOpen, setIsOpen }: SidebarPostoProps) {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/posto/dashboard', icon: Home },
    { name: 'Meu Estoque', path: '/posto/meu-estoque', icon: Package },
    { name: 'Pedidos de Recomposição', path: '/posto/pedidos-recomposicao', icon: ShoppingCart },
    { name: 'Entregas de Reposição', path: '/posto/entregas', icon: Truck },
    { name: 'Nova Ficha (Regulação)', path: '/posto/regulacao/nova', icon: FilePlus2 },
    { name: 'Consulta Rápida', path: '/posto/regulacao/consulta', icon: Search },
    { name: 'Notificações', path: '/posto/notificacoes', icon: Bell },
    { name: 'Configurações', path: '/posto/configuracoes', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-slate-900 text-slate-100 shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between pl-5 pr-4 border-b border-slate-800">
          <Link to="/posto/dashboard" className="flex items-center gap-3 select-none">
            <Shield className="h-9 w-9 text-cyan-500 stroke-[1.5]" />
            <div className="flex flex-col">
              <span className="font-semibold text-white text-base leading-tight">Vigia Saúde</span>
              <span className="text-xs text-cyan-400 font-normal mt-0.5">Posto de Saúde</span>
            </div>
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden transition-colors"
          >
            <ChevronLeft className="h-5 w-5 stroke-[1.5]" />
          </button>
          <button 
            className="hidden lg:flex items-center justify-center rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Recolher menu"
          >
            <ChevronLeft className="h-5 w-5 stroke-[1.5]" />
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-1 px-4 overflow-y-auto max-h-[calc(100vh-7rem)]">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-200 group ${
                  isActive
                    ? 'bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-900/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-105 duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  <span className="text-sm leading-snug">{link.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
