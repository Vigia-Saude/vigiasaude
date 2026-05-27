import { useState } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import SidebarCD from './SidebarCD';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const isGestorEstoque = user?.perfil === 'GESTOR_ESTOQUE';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {isGestorEstoque ? (
        <SidebarCD isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      ) : (
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      )}
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
