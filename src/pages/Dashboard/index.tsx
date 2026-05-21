import { useAuth } from '../../context/AuthContext';
import { KPICard } from '../../components/Dashboard/KPICard';
import { AtasStatusChart } from '../../components/Dashboard/AtasStatusChart';
import { PedidosVolumeChart } from '../../components/Dashboard/PedidosVolumeChart';
import { FileText, ShoppingCart, Clock, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'FORNECEDOR') {
    return (
      <div className="space-y-8 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Área do Fornecedor</h1>
          <p className="mt-1 text-sm text-gray-500">Acompanhe seus Pedidos de Compra e Atas associadas.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Bem-vindo, {user.nome}!</h2>
          <p className="text-sm text-gray-600">
            Utilize o menu lateral para gerenciar os Pedidos de Compra (PdCs) e visualizar as ATAs em que sua empresa está registrada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Visão geral das contratações e consumo da rede municipal.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Atas Ativas" 
          value="24" 
          icon={<FileText className="w-5 h-5" />} 
          description="Total de atas SRP vigentes"
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard 
          title="Volume Mensal" 
          value="R$ 550.000" 
          icon={<ShoppingCart className="w-5 h-5" />} 
          description="Gastos em Maio/2026"
          trend={{ value: 8, isPositive: true }}
        />
        <KPICard 
          title="Pedidos Pendentes" 
          value="7" 
          icon={<Clock className="w-5 h-5" />} 
          description="Aguardando aprovação/envio"
        />
        <KPICard 
          title="Alertas de Vencimento" 
          value="3" 
          icon={<AlertTriangle className="w-5 h-5" />} 
          description="Atas vencendo em 45 dias"
          className="border-orange-200 bg-orange-50/50"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AtasStatusChart />
        <PedidosVolumeChart />
      </div>
    </div>
  );
}
