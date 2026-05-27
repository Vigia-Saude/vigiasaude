import { Link, useLocation } from 'react-router';
import { 
  Home, 
  Package, 
  Truck, 
  FileDigit, 
  ShoppingCart, 
  MapPin, 
  AlertTriangle, 
  ScanBarcode, 
  History, 
  Bell, 
  ExternalLink, 
  Settings,
  ChevronLeft,
  Shield
} from 'lucide-react';

interface SidebarCDProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function SidebarCD({ isOpen, setIsOpen }: SidebarCDProps) {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/cd/dashboard', icon: Home },
    { name: 'Meu Estoque', path: '/cd/meu-estoque', icon: Package },
    { name: 'Recebimento', path: '/cd/recebimento', icon: Truck },
    { name: 'Importação NF', path: '/cd/importar', icon: FileDigit },
    { name: 'Pedidos', path: '/cd/pedidos', icon: ShoppingCart },
    { name: 'Entregas', path: '/cd/entregas', icon: MapPin },
    { name: 'Recalls', path: '/cd/recalls', icon: AlertTriangle, badge: '2' },
    { name: 'Rastreabilidade', path: '/cd/rastreabilidade', icon: ScanBarcode },
    { name: 'Auditoria', path: '/cd/auditoria', icon: History },
    { name: 'Notificações', path: '/cd/notificacoes', icon: Bell, badge: '3' },
    { name: 'Portal Público', path: '/cd/portal-publico', icon: ExternalLink, external: true },
    { name: 'Configurações', path: '/cd/configuracoes', icon: Settings },
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
          <Link to="/cd/dashboard" className="flex items-center gap-3 select-none">
            <Shield className="h-9 w-9 text-blue-500 stroke-[1.5]" />
            <div className="flex flex-col">
              <span className="font-semibold text-white text-base leading-tight">Vigia Saúde</span>
              <span className="text-xs text-blue-400 font-normal mt-0.5">CD Manager</span>
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
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className={`flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-105 duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  <span className="text-sm leading-snug">{link.name}</span>
                </div>
                {link.badge && (
                  <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full ${
                    isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white animate-pulse'
                  }`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
