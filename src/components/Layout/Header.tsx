import { Menu, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useAuth();

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
            <p className="text-xs text-gray-500 uppercase">{user.role}</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <Bell className="h-5 w-5" />
        </button>
        
        <div className="h-8 w-px bg-gray-200 mx-2" />

        <button 
          onClick={logout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden sm:block">Sair</span>
        </button>
      </div>
    </header>
  );
}
