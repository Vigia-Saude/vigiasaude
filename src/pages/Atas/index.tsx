import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAtas } from '../../services/ataService';
import type { AtaWithFornecedor } from '../../services/ataService';
import { TableSkeleton } from '../../components/ui/TableSkeleton';
import { ModalNovaAta } from '../../components/Atas/ModalNovaAta';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { 
  Eye, 
  Clock, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle 
} from 'lucide-react';

export function AtasLista() {
  const [showModal, setShowModal] = useState(false);
  const [openAtaIds, setOpenAtaIds] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['atas', page],
    queryFn: () => getAtas(page, 50),
  });

  const data: AtaWithFornecedor[] = response?.data ?? [];
  const pagination = response?.pagination;

  const toggleAta = (id: string) => {
    setOpenAtaIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatCurrencyCompact = (value: number) => {
    if (value >= 1000) {
      const kValue = value / 1000;
      return `R$ ${kValue.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`;
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas ATAs</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie as Atas de Registro de Preços</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md hover:shadow-lg transition-all"
        >
          + Nova ATA
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <TableSkeleton columns={6} rows={3} />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-semibold text-red-900">Erro no carregamento</h3>
          <p className="mt-1 text-sm text-red-500">Ocorreu um erro ao carregar os dados das Atas.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 text-sm font-medium text-red-600 hover:text-red-500 underline"
          >
            Tentar novamente
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500 text-sm">Nenhuma ATA de Registro de Preços cadastrada.</p>
        </div>
      ) : (
        <div className="space-y-4 select-none">
          {data.map((ata) => {
            const isOpen = !!openAtaIds[ata.id];
            const isNearExpiring = ata.diasRestantes !== undefined && ata.diasRestantes <= 45 && ata.diasRestantes > 0;
            
            // Gráfico de Rosca
            const chartData = [
              { name: 'Disponível', value: ata.valorDisponivel || 0, color: '#22c55e' },
              { name: 'Comprometido', value: ata.valorComprometido || 0, color: '#eab308' },
              { name: 'Consumido', value: ata.valorConsumido || 0, color: '#ef4444' },
            ];
            const totalForChart = (ata.valorDisponivel || 0) + (ata.valorComprometido || 0) + (ata.valorConsumido || 0);
            const dataForChart = totalForChart > 0 ? chartData : [{ name: 'Vazio', value: 1, color: '#e5e7eb' }];

            return (
              <div 
                key={ata.id} 
                className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md ${
                  isNearExpiring ? 'border-orange-300 ring-1 ring-orange-100' : 'border-gray-200'
                }`}
              >
                {/* Header do Accordion */}
                <div 
                  onClick={() => toggleAta(ata.id)}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
                >
                  {/* Numero e Fornecedor */}
                  <div className="flex-1 min-w-[200px] flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{ata.numero}</h3>
                    <p className="text-sm text-gray-500 font-semibold mt-0.5">{ata.fornecedorNome}</p>
                    {isNearExpiring && (
                      <div className="mt-2 self-start flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                        <span>Vence em {ata.diasRestantes} dias</span>
                      </div>
                    )}
                  </div>

                  {/* Vigência */}
                  <div className="flex-1 min-w-[180px] flex flex-col justify-center">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Vigência</span>
                    <span className="text-sm font-bold text-gray-800 mt-1">
                      {formatDate(ata.vigenciaInicio)} a {formatDate(ata.vigenciaFim)}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5 font-medium">{ata.diasRestantes} dias restantes</span>
                  </div>

                  {/* Métricas */}
                  <div className="flex items-center gap-6 sm:gap-10">
                    <div className="flex flex-col justify-center min-w-[70px]">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Disponível</span>
                      <span className="text-sm font-extrabold text-emerald-600 mt-1">{formatCurrencyCompact(ata.valorDisponivel || 0)}</span>
                    </div>
                    <div className="flex flex-col justify-center min-w-[80px]">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Comprometido</span>
                      <span className="text-sm font-extrabold text-amber-500 mt-1">{formatCurrencyCompact(ata.valorComprometido || 0)}</span>
                    </div>
                    <div className="flex flex-col justify-center min-w-[70px]">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Consumido</span>
                      <span className="text-sm font-extrabold text-rose-500 mt-1">{formatCurrencyCompact(ata.valorConsumido || 0)}</span>
                    </div>
                  </div>

                  {/* Gráfico de Rosca e Chevron */}
                  <div className="flex items-center gap-4 shrink-0 justify-end">
                    <div className="w-[50px] h-[50px] relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dataForChart}
                            cx="50%"
                            cy="50%"
                            innerRadius={13}
                            outerRadius={20}
                            paddingAngle={totalForChart > 0 ? 3 : 0}
                            dataKey="value"
                          >
                            {dataForChart.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 transition-transform duration-300" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300" />
                    )}
                  </div>
                </div>

                {/* Barra de Progresso da Vigência */}
                <div className="px-6 pb-4 pt-1 flex items-center justify-between gap-4 text-xs font-semibold text-gray-500 select-none border-t border-gray-100">
                  <span className="shrink-0 text-gray-400 font-medium">Período de vigência</span>
                  <div className="flex-1 bg-gray-150 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        isNearExpiring ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${ata.porcentagemVigenciaDecorrente || 0}%` }}
                    ></div>
                  </div>
                  <span className="shrink-0 text-gray-500 font-bold">{ata.porcentagemVigenciaDecorrente || 0}% decorrido</span>
                </div>

                {/* Conteúdo Expandido (Medicamentos) */}
                {isOpen && (
                  <div className="border-t border-gray-150 bg-gray-50/40 px-6 py-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Medicamentos Registrados
                      </h4>
                      <Link 
                        to={`/atas/${ata.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver ATA</span>
                      </Link>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-150 bg-white">
                      <table className="min-w-full divide-y divide-gray-100 text-left text-xs text-gray-500">
                        <thead className="bg-gray-50 text-gray-400 font-bold uppercase">
                          <tr>
                            <th scope="col" className="px-4 py-3">Código CATMAT</th>
                            <th scope="col" className="px-4 py-3">Descrição</th>
                            <th scope="col" className="px-4 py-3">Unidade</th>
                            <th scope="col" className="px-4 py-3">Preço Unitário</th>
                            <th scope="col" className="px-4 py-3">Uso do Saldo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium">
                          {ata.medicamentos && ata.medicamentos.length > 0 ? (
                            ata.medicamentos.map((med) => {
                              const pct = med.porcentagemConsumida !== undefined ? med.porcentagemConsumida : 0;
                              
                              let progressColor = 'bg-emerald-500';
                              if (pct >= 80) {
                                progressColor = 'bg-red-500';
                              } else if (pct >= 50) {
                                progressColor = 'bg-amber-500';
                              }

                              return (
                                <tr key={med.id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-4 py-3 font-semibold text-gray-800">{med.catmatCodigo || 'Manual'}</td>
                                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate" title={med.nome}>
                                    {med.nome}
                                  </td>
                                  <td className="px-4 py-3 text-gray-500">{med.unidadeAta || med.unidadeFornecimento || 'UN'}</td>
                                  <td className="px-4 py-3 text-gray-900 font-bold">{formatCurrency(med.precoUnitario)}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-3 min-w-[140px]">
                                      <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-1.5 rounded-full transition-all duration-500 ${progressColor}`}
                                          style={{ width: `${Math.min(pct, 100)}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-xs font-bold text-gray-600">{pct.toFixed(0)}%</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                                Nenhum medicamento registrado nesta ATA.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Slide-Over de Nova Ata */}
      <ModalNovaAta
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['atas'] });
          toast.success('Listagem de Atas atualizada.');
        }}
      />

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-500">
            Página {page} de {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
