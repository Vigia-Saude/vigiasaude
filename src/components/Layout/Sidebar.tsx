import { Link, useLocation } from 'react-router';
import { LayoutDashboard, ShoppingCart, Truck, FileText, ClipboardList, Scale, CheckSquare, ShieldCheck, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const location = useLocation();
  const { user } = useAuth();

  const allLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['COMPRADOR', 'FORNECEDOR'] },
    { name: 'Comprador', path: '/comprador', icon: ShoppingCart, roles: ['COMPRADOR'] },
    { name: 'Fornecedor', path: '/fornecedor', icon: Truck, roles: ['FORNECEDOR'] },
    { name: 'Fornecedores', path: '/fornecedores', icon: Building2, roles: ['COMPRADOR'] },
    { name: 'Atas', path: '/atas', icon: FileText, roles: ['COMPRADOR', 'FORNECEDOR'] },
    { name: 'Pedidos', path: '/pedidos', icon: ClipboardList, roles: ['COMPRADOR', 'FORNECEDOR'] },
    { name: 'Solicitar Reequilíbrio', path: '/solicitar-reequilibrio', icon: Scale, roles: ['FORNECEDOR'] },
    { name: 'Aprovar Reequilíbrio', path: '/aprovar-reequilibrio', icon: CheckSquare, roles: ['COMPRADOR'] },
    { name: 'Auditoria TCU', path: '/auditoria', icon: ShieldCheck, roles: ['COMPRADOR'] },
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
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-blue-600 text-xl">
            <LayoutDashboard className="h-6 w-6" />
            Vigia Saúde
          </Link>
        </div>

        <nav className="mt-6 flex flex-col gap-2 px-4">
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
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
