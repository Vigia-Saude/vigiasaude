import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats, DashboardStats } from '../../services/dashboardService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  FileText, 
  ShoppingCart, 
  AlertTriangle, 
  Loader2 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'COMPRADOR') {
      setLoading(false);
      return;
    }

    async function loadStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
        setError('Não foi possível carregar as informações do painel.');
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [user]);

  if (user?.role === 'FORNECEDOR') {
    return (
      <div className="space-y-8 pb-8 animate-in fade-in duration-300">
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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        {error || 'Ocorreu um erro ao carregar o dashboard.'}
      </div>
    );
  }

  // Formatador de valores (Ex: R$ 450k ou R$ 1.000k)
  const formatK = (value: number) => {
    const kValue = value / 1000;
    return `R$ ${kValue.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`;
  };

  // Porcentagens do orçamento
  const totalBudget = stats.budget.total || 1;
  const pctDisponivel = (stats.budget.disponivel / totalBudget) * 100;
  const pctComprometido = (stats.budget.comprometido / totalBudget) * 100;
  const pctConsumido = (stats.budget.consumido / totalBudget) * 100;

  const chartData = [
    { name: 'Disponível', value: stats.budget.disponivel, color: '#10b981' }, // Verde
    { name: 'Comprometido', value: stats.budget.comprometido, color: '#f59e0b' }, // Amarelo
    { name: 'Consumido', value: stats.budget.consumido, color: '#ef4444' }, // Vermelho
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            PENDENTE
          </span>
        );
      case 'APROVADO':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            APROVADO
          </span>
        );
      case 'ENTREGUE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            ENTREGUE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Banner de Alerta Superior (Laranja) */}
      {stats.expiringAtasCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-xl flex items-start gap-3 shadow-sm select-none">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-amber-950 text-sm">
              Atenção: {stats.expiringAtasCount} ATAs vencem em menos de 45 dias
            </p>
            <p className="text-xs text-amber-800 mt-0.5 font-medium">
              Revise os contratos e inicie o processo de renovação.
            </p>
          </div>
        </div>
      )}

      {/* Grid de Cards de Métricas Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card ATAs Ativas */}
        <div className="bg-white p-6 rounded-xl border border-gray-250 shadow-sm flex flex-col gap-3 transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-gray-900 leading-tight">{stats.activeAtasCount}</span>
            <span className="text-xs text-gray-500 font-semibold mt-1">ATAs Ativas</span>
          </div>
        </div>

        {/* Card PdCs Pendentes */}
        <div className="bg-white p-6 rounded-xl border border-gray-250 shadow-sm flex flex-col gap-3 transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-500 border border-amber-100">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-gray-900 leading-tight">{stats.pendingPdcsCount}</span>
            <span className="text-xs text-gray-500 font-semibold mt-1">PdCs Pendentes</span>
          </div>
        </div>

        {/* Card ATAs Próximas de Vencimento */}
        <div className="bg-white p-6 rounded-xl border border-gray-250 shadow-sm flex flex-col gap-3 transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-500 border border-orange-100">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-gray-900 leading-tight">{stats.expiringAtasCount}</span>
            <span className="text-xs text-gray-500 font-semibold mt-1">ATAs Próximas do Vencimento</span>
          </div>
        </div>
      </div>

      {/* Seção principal: Pedidos Recentes e Saldo de ATAs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Tabela de Pedidos Recentes (Esquerda) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-900">Pedidos de Compra Recentes</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs text-gray-400 font-bold uppercase border-b border-gray-150">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">ID</th>
                  <th scope="col" className="px-4 py-3 text-left">Descrição</th>
                  <th scope="col" className="px-4 py-3 text-left">Data</th>
                  <th scope="col" className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {stats.recentPdcs.length > 0 ? (
                  stats.recentPdcs.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-gray-55/50 transition-colors">
                      <td className="px-4 py-4 font-bold text-gray-900 whitespace-nowrap">{pedido.numero}</td>
                      <td className="px-4 py-4 text-gray-700">{pedido.descricao}</td>
                      <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(pedido.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{getStatusBadge(pedido.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      Nenhum pedido de compra recente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Saldo de ATAs e Donut Chart (Direita) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Saldo de ATAs</h2>
            <p className="text-xs text-gray-400 font-medium">Distribuição orçamentária consolidada</p>
          </div>

          {/* Gráfico Donut */}
          <div className="h-56 relative flex flex-col justify-center items-center mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [
                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0)), 
                    'Valor'
                  ]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legenda Inline */}
            <div className="flex justify-center flex-wrap gap-4 text-xs font-semibold select-none mt-2">
              <div className="flex items-center gap-1 text-emerald-600">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                Disponível ({pctDisponivel.toFixed(1)}%)
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                Comprometido ({pctComprometido.toFixed(1)}%)
              </div>
              <div className="flex items-center gap-1 text-rose-500">
                <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                Consumido ({pctConsumido.toFixed(1)}%)
              </div>
            </div>
          </div>

          {/* Valores detalhados */}
          <div className="space-y-2 mt-6 select-none">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Disponível
              </div>
              <span className="text-sm font-bold text-gray-900">{formatK(stats.budget.disponivel)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Comprometido
              </div>
              <span className="text-sm font-bold text-gray-900">{formatK(stats.budget.comprometido)}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                Consumido
              </div>
              <span className="text-sm font-bold text-gray-900">{formatK(stats.budget.consumido)}</span>
            </div>
            
            <div className="pt-4 border-t border-gray-200 flex items-center justify-between font-bold text-gray-950 text-sm">
              <span>Total</span>
              <span>{formatK(stats.budget.total)}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
