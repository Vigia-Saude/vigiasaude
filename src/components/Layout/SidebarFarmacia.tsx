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
  Shield
} from 'lucide-react';

interface SidebarFarmaciaProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function SidebarFarmacia({ isOpen, setIsOpen }: SidebarFarmaciaProps) {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/farmacia/dashboard', icon: Home },
    { name: 'Meu Estoque', path: '/farmacia/meu-estoque', icon: Package },
    { name: 'Pedidos de Recomposição', path: '/farmacia/pedidos-recomposicao', icon: ShoppingCart },
    { name: 'Dispensação', path: '/farmacia/dispensacao', icon: Pill },
    { name: 'Entregas de Reposição', path: '/farmacia/entregas', icon: Truck },
    { name: 'Notificações', path: '/farmacia/notificacoes', icon: Bell },
    { name: 'Configurações', path: '/farmacia/configuracoes', icon: Settings },
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
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-emerald-950 text-emerald-100 shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between pl-5 pr-4 border-b border-emerald-900">
          <Link to="/farmacia/dashboard" className="flex items-center gap-3 select-none">
            <Shield className="h-9 w-9 text-emerald-500 stroke-[1.5]" />
            <div className="flex flex-col">
              <span className="font-semibold text-white text-base leading-tight">Vigia Saúde</span>
              <span className="text-xs text-emerald-400 font-normal mt-0.5">Farmácia</span>
            </div>
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-emerald-400 hover:bg-emerald-900 hover:text-white lg:hidden transition-colors"
          >
            <ChevronLeft className="h-5 w-5 stroke-[1.5]" />
          </button>
          <button 
            className="hidden lg:flex items-center justify-center rounded-lg p-1 text-emerald-400 hover:bg-emerald-900 hover:text-white transition-colors"
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
                    ? 'bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-900/30'
                    : 'text-emerald-300 hover:bg-emerald-900 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-105 duration-200 ${isActive ? 'text-white' : 'text-emerald-400 group-hover:text-white'}`} />
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
