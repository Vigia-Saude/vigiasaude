import { Link, useLocation } from 'react-router';
import { 
  LayoutGrid, 
  ShoppingCart, 
  FileCheck, 
  Search, 
  Users, 
  Shield, 
  ChevronLeft 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const location = useLocation();
  const { user } = useAuth();

  const allLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid, roles: ['COMPRADOR', 'FORNECEDOR'] },
    { name: 'Pedidos de Compra (PdC)', path: '/pedidos', icon: ShoppingCart, roles: ['COMPRADOR', 'FORNECEDOR'] },
    { name: 'ATAs', path: '/atas', icon: FileCheck, roles: ['COMPRADOR', 'FORNECEDOR'] },
    { name: 'Auditoria', path: '/auditoria', icon: Search, roles: ['COMPRADOR'] },
    { name: 'Fornecedores', path: '/fornecedores', icon: Users, roles: ['COMPRADOR'] },
  ];

  const filteredLinks = allLinks.filter(link => 
    !link.roles || (user && link.roles.includes(user.role))
  );

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
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between pl-5 pr-4 border-b border-gray-100">
          <Link to="/dashboard" className="flex items-center gap-3 select-none">
            <Shield className="h-9 w-9 text-blue-600 stroke-[1.5]" />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 text-base leading-tight">Vigia Saúde</span>
              <span className="text-xs text-gray-400 font-normal mt-0.5">Sistema de Compras</span>
            </div>
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600 lg:hidden transition-colors"
          >
            <ChevronLeft className="h-5 w-5 stroke-[1.5]" />
          </button>
          {/* Desktop design chevron matching the print */}
          <button 
            className="hidden lg:flex items-center justify-center rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
            title="Recolher menu"
          >
            <ChevronLeft className="h-5 w-5 stroke-[1.5]" />
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-1 px-4">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-sm leading-snug">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

