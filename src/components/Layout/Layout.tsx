import { useState, lazy, Suspense } from 'react';
import { Outlet } from 'react-router';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';
import ErrorBoundary from './ErrorBoundary';

const Sidebar = lazy(() => import('./Sidebar'));
const SidebarCD = lazy(() => import('./SidebarCD'));
const SidebarFarmacia = lazy(() => import('./SidebarFarmacia'));
const SidebarPosto = lazy(() => import('./SidebarPosto'));
const SidebarMotorista = lazy(() => import('./SidebarMotorista'));
const SidebarRegulador = lazy(() => import('./SidebarRegulador'));

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
      case 'REGULADOR':
        return <SidebarRegulador isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />;
      default:
        return <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />;
    }
  };

  const sidebarFallback = <div className="hidden lg:block w-64 bg-white border-r border-gray-200 h-full shrink-0" />;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Suspense fallback={sidebarFallback}>
        {renderSidebar()}
      </Suspense>
      
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
