import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { toast } from 'sonner';
import { getAtaFullDetails } from '../../services/ataService';
import type { AtaFullDetails } from '../../services/ataService';
import { DataTable } from '../../components/ui/DataTable';
import type { ColumnDef } from '../../components/ui/DataTable';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { TableSkeleton } from '../../components/ui/TableSkeleton';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { 
  Clock, 
  AlertCircle, 
  ArrowLeft, 
  Download, 
  FileText, 
  Calendar, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Box 
} from 'lucide-react';
import type { MedicamentoAta } from '../../types';

export function AtasDetalhes() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AtaFullDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const result = await getAtaFullDetails(id);
      if (!result) {
        setError('Ata não encontrada.');
        toast.error('Ata não encontrada');
      } else {
        setData(result);
      }
    } catch (err) {
      console.error('Erro ao carregar detalhes da ata:', err);
      setError('Ocorreu um erro ao carregar os detalhes da Ata.');
      toast.error('Erro ao carregar detalhes');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse pb-8">
        <div className="h-8 w-64 bg-gray-200 rounded-md"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-150 rounded-xl border border-gray-200"></div>
          ))}
        </div>
        <TableSkeleton rows={3} columns={4} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-semibold text-red-900">Erro no carregamento</h3>
        <p className="mt-1 text-sm text-red-500">{error || 'Ata não encontrada'}</p>
        <Link 
          to="/atas"
          className="mt-4 inline-flex items-center text-sm font-semibold text-red-600 hover:text-red-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para listagem
        </Link>
      </div>
    );
  }

  const { medicamentos, pedidos, consumos, ...ata } = data;

  const valorTeto = ata.valorTeto;
  const valorConsumido = ata.valorConsumido ?? 0;
  const valorComprometido = ata.valorComprometido ?? 0;
  const valorDisponivel = ata.valorDisponivel ?? 0;

  // Lógica de alertas de vigência da Ata
  const hoje = new Date();
  const fim = new Date(ata.dataFim);
  const difTempo = fim.getTime() - hoje.getTime();
  const difDias = Math.ceil(difTempo / (1000 * 3600 * 24));
  const isVencendo = difDias >= 0 && difDias <= 45;
  const isVencida = difDias < 0 || ata.status === 'VENCIDA';

  // Alertas de estouro de medicamentos
  const hasEstouroMedicamento = medicamentos.some(med => med.quantidadeUsada > med.qtdeInicial);
  const hasAlertaProximoLimite = medicamentos.some(med => {
    const percent = (med.quantidadeUsada / med.qtdeInicial) * 100;
    return percent >= 80 && percent < 100;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR');
  };

  const chartData = [
    { name: 'Disponível', value: valorDisponivel, color: '#22c55e' },
    { name: 'Comprometido', value: valorComprometido, color: '#eab308' },
    { name: 'Consumido', value: valorConsumido, color: '#ef4444' },
  ];
  const totalBudget = valorDisponivel + valorComprometido + valorConsumido;
  const dataForChart = totalBudget > 0 ? chartData : [{ name: 'Vazio', value: 1, color: '#e5e7eb' }];

  // Definição das colunas da tabela de medicamentos licitados
  const columns: ColumnDef<MedicamentoAta>[] = [
    { 
      header: 'Medicamento', 
      cell: (row) => (
        <span className="font-semibold text-gray-900">{row.nome}</span>
      ),
      sortable: true 
    },
    { 
      header: 'Cód CATMAT', 
      cell: (row) => (
        <span className="text-gray-500 font-semibold">{row.catmatCodigo || 'Manual'}</span>
      ),
      sortable: true 
    },
    { 
      header: 'Preço Unitário', 
      cell: (row) => (
        <span className="font-bold text-gray-900">{formatCurrency(row.precoUnitario)}</span>
      ) 
    },
    {
      header: 'Controle de Quantidade',
      cell: (row) => {
        const qInit = row.quantidadeInicial ?? row.qtdeInicial ?? 0;
        const qUsed = row.qtdeConsumida ?? row.quantidadeUsada ?? 0;
        const qSaldo = row.saldoRestante ?? Math.max(0, qInit - qUsed);
        const pct = row.porcentagemConsumida ?? (qInit > 0 ? (qUsed / qInit) * 100 : 0);

        let progressColor = 'bg-emerald-500';
        if (pct >= 80) {
          progressColor = 'bg-red-500';
        } else if (pct >= 50) {
          progressColor = 'bg-amber-500';
        }

        return (
          <div className="flex flex-col gap-1 w-full max-w-[320px]">
            {/* Labels superiores */}
            <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold px-0.5 select-none">
              <span>Inicial: {qInit.toLocaleString('pt-BR')}</span>
              <span>Usado: {qUsed.toLocaleString('pt-BR')}</span>
              <span>Saldo: {qSaldo.toLocaleString('pt-BR')}</span>
            </div>
            
            {/* Barra de Progresso */}
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              ></div>
            </div>
            
            {/* Label inferior */}
            <div className="text-[10px] text-gray-400 font-bold select-none mt-0.5">
              {pct.toFixed(1)}% consumido
            </div>
          </div>
        );
      }
    }
  ];

  // Renderização do detalhe expandido: Histórico de Consumos reais do item
  const renderExpandedRow = (medicamento: MedicamentoAta) => {
    const consumosDoItem = medicamento.consumos || [];

    if (consumosDoItem.length === 0) {
      return (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
          <p className="text-xs text-gray-500">Nenhum consumo foi registrado para este medicamento até o momento.</p>
        </div>
      );
    }

    return (
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-inner">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 select-none">
            <Clock className="w-4 h-4 text-gray-500" />
            Histórico de Consumo do Item
          </h4>
          <span className="text-[10px] text-gray-400 select-none">{consumosDoItem.length} lançamento(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 border-b border-gray-200 select-none">
                <th className="px-3 py-2">Data do Lançamento</th>
                <th className="px-3 py-2">Setor Solicitante</th>
                <th className="px-3 py-2 text-right">Qtd Consumida</th>
                <th className="px-3 py-2 text-right">Valor Unitário</th>
                <th className="px-3 py-2 text-right">Valor Total</th>
                <th className="px-3 py-2">Observações</th>
              </tr>
            </thead>
            <tbody>
              {consumosDoItem.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 last:border-0 font-medium">
                  <td className="px-3 py-2 text-gray-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {formatDate(c.dataConsumo)}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {c.setorSolicitante ? (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-gray-400" />
                        {c.setorSolicitante}
                      </span>
                    ) : (
                      <span className="italic text-gray-450">Não informado</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-800">{c.quantidade.toLocaleString('pt-BR')}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{formatCurrency(c.valorUnitario)}</td>
                  <td className="px-3 py-2 text-right text-blue-600 font-bold">{formatCurrency(c.valorTotal)}</td>
                  <td className="px-3 py-2 text-gray-500 max-w-xs truncate" title={c.observacao || ''}>
                    {c.observacao || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/atas" className="hover:text-blue-600 transition-colors">Atas</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{ata.numero}</span>
          </div>
          <Link
            to="/atas"
            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Gestão de ATAs</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{ata.numero}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fornecedor: <span className="font-semibold text-gray-900">{ata.fornecedorNome}</span>
            {ata.fornecedorCnpj && <span className="ml-2 text-xs text-gray-400">CNPJ: {ata.fornecedorCnpj}</span>}
          </p>
        </div>
        
        {/* Top actions */}
        <div className="flex items-center gap-3 shrink-0">
          {ata.documentoPdfUrl && (
            <a
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${ata.documentoPdfUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-4 h-4 text-red-500" />
              <span>Ver Documento Original (PDF)</span>
            </a>
          )}
          
          {consumos && consumos.length > 0 && (
            <button
              onClick={() => {
                try {
                  const csvHeaders = [
                    'Código CATMAT',
                    'Medicamento',
                    'Data do Consumo',
                    'Setor Solicitante',
                    'Quantidade',
                    'Valor Unitário (R$)',
                    'Valor Total (R$)',
                    'Observação'
                  ];

                  const csvRows = consumos.map(c => {
                    const med = medicamentos.find(m => m.id === c.ataItemId);
                    return [
                      med?.catmatCodigo || 'Manual',
                      `"${(med?.nome || 'Medicamento Desconhecido').replace(/"/g, '""')}"`,
                      new Date(c.dataConsumo).toLocaleDateString('pt-BR'),
                      `"${(c.setorSolicitante || '').replace(/"/g, '""')}"`,
                      c.quantidade,
                      c.valorUnitario.toFixed(2),
                      c.valorTotal.toFixed(2),
                      `"${(c.observacao || '').replace(/"/g, '""')}"`
                    ];
                  });

                  const csvContent = [
                    csvHeaders.join(','),
                    ...csvRows.map(row => row.join(','))
                  ].join('\n');

                  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.setAttribute('href', url);
                  link.setAttribute('download', `Consumos_Ata_${ata.numero}.csv`);
                  link.style.visibility = 'hidden';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  toast.success('Relatório de consumos exportado com sucesso!');
                } catch (err) {
                  console.error(err);
                  toast.error('Erro ao exportar consumos.');
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              title="Exportar planilha de todos os consumos"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Exportar Relatório</span>
            </button>
          )}
        </div>
      </div>

      {/* Alertas Críticos da ATA */}
      {isVencida && (
        <AlertBanner variant="error" title="Atenção: ATA VENCIDA">
          Esta ata encerrou sua vigência em {formatDate(ata.dataFim)}. Não é recomendado novos consumos ou pedidos.
        </AlertBanner>
      )}

      {!isVencida && isVencendo && (
        <AlertBanner variant="warning" title="Atenção: Vigência próxima do fim">
          Ata vence em {difDias} {difDias === 1 ? 'dia' : 'dias'} ({formatDate(ata.dataFim)}). Planeje novas licitações para evitar desabastecimento.
        </AlertBanner>
      )}

      {hasEstouroMedicamento && (
        <AlertBanner variant="error" title="Crítico: Saldo Negativo Ativo">
          Existem medicamentos nesta ATA que superaram 100% da quantidade licitada (saldo negativo). Consumos adicionais estão autorizados via soft-limit, mas monitore as quantidades excedentes.
        </AlertBanner>
      )}

      {!hasEstouroMedicamento && hasAlertaProximoLimite && (
        <AlertBanner variant="warning" title="Atenção: Limite de Itens Próximo">
          Alguns medicamentos atingiram ou superaram 80% do total licitado inicial. Acompanhe o consumo para planejar eventuais aditivos.
        </AlertBanner>
      )}

      {/* 4 Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Vigência */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vigência da ATA</p>
            <p className="text-base font-extrabold text-gray-900 mt-1 select-all">
              {formatDate(ata.vigenciaInicio)} - {formatDate(ata.vigenciaFim)}
            </p>
          </div>
        </div>
        
        {/* Card 2: Valor Total */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Valor Total</p>
            <p className="text-base font-extrabold text-gray-900 mt-1 select-all">
              {formatCurrency(valorTeto)}
            </p>
          </div>
        </div>

        {/* Card 3: Valor Consumido */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Valor Consumido</p>
            <p className="text-base font-extrabold text-gray-900 mt-1 select-all">
              {formatCurrency(valorConsumido)}
            </p>
            <p className="text-[10px] text-gray-400 font-bold mt-0.5 select-none">
              {valorTeto > 0 ? ((valorConsumido / valorTeto) * 100).toFixed(1) : 0}% do total
            </p>
          </div>
        </div>

        {/* Card 4: Distribuição */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow min-h-[96px]">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Distribuição</p>
            </div>
          </div>
          <div className="w-[60px] h-[60px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataForChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={15}
                  outerRadius={24}
                  paddingAngle={totalBudget > 0 ? 3 : 0}
                  dataKey="value"
                >
                  {dataForChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Itens da Ata Licitados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Itens e Histórico de Pedidos</h3>
          <p className="text-xs text-gray-400 select-none">Clique na linha do item para visualizar o histórico de consumos específico.</p>
        </div>
        
        <DataTable 
          data={medicamentos}
          columns={columns}
          renderExpandedRow={renderExpandedRow}
        />
      </div>
    </div>
  );
}
