import { useState } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import SidebarCD from './SidebarCD';
import SidebarFarmacia from './SidebarFarmacia';
import SidebarPosto from './SidebarPosto';
import SidebarMotorista from './SidebarMotorista';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';
import ErrorBoundary from './ErrorBoundary';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const renderSidebar = () => {
    switch (user?.perfil) {
      case 'GESTOR_ESTOQUE':
        return <SidebarCD isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />;
      case 'FARMACIA':
        return <SidebarFarmacia isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />;
      case 'POSTO_SAUDE':
        return <SidebarPosto isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />;
      case 'ENTREGADOR':
        return <SidebarMotorista isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />;
      default:
        return <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {renderSidebar()}
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
