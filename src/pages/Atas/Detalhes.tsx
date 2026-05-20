import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { getAtaFullDetails } from '../../services/ataService';
import type { AtaFullDetails } from '../../services/ataService';
import { DataTable } from '../../components/ui/DataTable';
import type { ColumnDef } from '../../components/ui/DataTable';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { TableSkeleton } from '../../components/ui/TableSkeleton';
import { ModalNovoConsumo } from '../../components/Atas/ModalNovoConsumo';
import { Clock, AlertCircle, ArrowLeft, Plus, Download, FileText, Calendar, Building2 } from 'lucide-react';
import { Link } from 'react-router';
import type { MedicamentoAta, AtaConsumo } from '../../types';

export function AtasDetalhes() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AtaFullDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Consumo modal state
  const [isConsumoModalOpen, setIsConsumoModalOpen] = useState(false);
  const [selectedMedicamento, setSelectedMedicamento] = useState<MedicamentoAta | null>(null);

  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded-md"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl border border-gray-200"></div>
          ))}
        </div>
        <TableSkeleton rows={3} columns={6} />
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
          className="mt-4 inline-flex items-center text-sm font-medium text-red-600 hover:text-red-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para listagem
        </Link>
      </div>
    );
  }

  const { medicamentos, pedidos, consumos, ...ata } = data;

  // Lógica de valores e saldos gerais
  const valorTeto = ata.valorTeto;
  const valorConsumido = ata.valorConsumido || 0;
  
  // Comprometido = pedidos ativos que ainda não foram entregues ou cancelados
  const comprometido = pedidos
    .filter(p => p.status === 'APROVADO' || p.status === 'EM_TRANSITO' || p.status === 'PENDENTE')
    .reduce((acc, curr) => acc + curr.valorTotal, 0);

  const saldoDisponivel = valorTeto - valorConsumido;

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

  const handleOpenConsumoModal = (med: MedicamentoAta) => {
    setSelectedMedicamento(med);
    setIsConsumoModalOpen(true);
  };

  // Definição das colunas da tabela de medicamentos licitados
  const columns: ColumnDef<MedicamentoAta>[] = [
    { 
      header: 'Medicamento', 
      cell: (row) => (
        <div>
          <span className="font-semibold text-gray-900 block">{row.nome}</span>
          <span className="text-[10px] text-gray-500 block">CATMAT: {row.catmatCodigo || 'Manual'}</span>
        </div>
      ),
      sortable: true 
    },
    { header: 'P. Unitário', cell: (row) => formatCurrency(row.precoUnitario) },
    { header: 'Preço BPS', cell: (row) => row.precoBPS ? formatCurrency(row.precoBPS) : '-' },
    { header: 'Preço CMED', cell: (row) => row.precoCMED ? formatCurrency(row.precoCMED) : '-' },
    { header: 'Qtd Inicial', cell: (row) => `${row.qtdeInicial.toLocaleString('pt-BR')} ${row.unidadeAta || 'UN'}` },
    { header: 'Qtd Usada', cell: (row) => `${row.quantidadeUsada.toLocaleString('pt-BR')} ${row.unidadeAta || 'UN'}` },
    { 
      header: 'Saldo Restante', 
      cell: (row) => {
        const saldo = row.qtdeInicial - row.quantidadeUsada;
        const isNegativo = saldo < 0;
        return (
          <span className={`font-bold ${isNegativo ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100' : 'text-gray-800'}`}>
            {saldo.toLocaleString('pt-BR')} {row.unidadeAta || 'UN'}
          </span>
        );
      } 
    },
    {
      header: 'Progresso Consumo',
      cell: (row) => {
        const percent = (row.quantidadeUsada / row.qtdeInicial) * 100;
        const displayPercent = Math.round(percent);
        
        let barColor = 'bg-blue-600';
        let textColor = 'text-blue-700 bg-blue-50';
        
        if (percent >= 100) {
          barColor = 'bg-red-600';
          textColor = 'text-red-700 bg-red-50';
        } else if (percent >= 80) {
          barColor = 'bg-yellow-500';
          textColor = 'text-yellow-700 bg-yellow-50';
        }

        return (
          <div className="w-36 space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className={`px-1.5 py-0.5 rounded-full font-bold ${textColor}`}>
                {displayPercent}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${barColor}`} 
                style={{ width: `${Math.min(percent, 100)}%` }}
              ></div>
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
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-500" />
            Histórico de Consumo do Item
          </h4>
          <span className="text-[10px] text-gray-400">{consumosDoItem.length} lançamento(s)</span>
        </div>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 border-b border-gray-200">
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
              <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
                <td className="px-3 py-2 font-medium text-gray-700 flex items-center gap-1">
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
                    <span className="italic text-gray-400">Não informado</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right font-semibold text-gray-800">{c.quantidade.toLocaleString('pt-BR')}</td>
                <td className="px-3 py-2 text-right text-gray-600">{formatCurrency(c.valorUnitario)}</td>
                <td className="px-3 py-2 text-right font-bold text-blue-600">{formatCurrency(c.valorTotal)}</td>
                <td className="px-3 py-2 text-gray-500 max-w-xs truncate" title={c.observacao || ''}>
                  {c.observacao || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/atas" className="hover:text-blue-600 transition-colors">Atas</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{ata.numero}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Ata {ata.numero}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fornecedor: <span className="font-semibold text-gray-900">{ata.fornecedorNome}</span>
            {ata.fornecedorCnpj && <span className="ml-2 text-xs text-gray-400">CNPJ: {ata.fornecedorCnpj}</span>}
          </p>
        </div>
        
        // Top actions
        <div className="flex items-center gap-3">
          {consumos && consumos.length > 0 && (
            <button
              onClick={() => {
                try {
                  // Mapeia os consumos relacionando com o nome do medicamento
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

                  // UTF-8 BOM para garantir codificação correta no Excel brasileiro
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
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-blue-200 rounded-md bg-blue-50 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-100 transition-colors"
              title="Exportar planilha de todos os consumos"
            >
              <Download className="w-4 h-4 text-blue-600" />
              Exportar Consumos
            </button>
          )}

          {ata.documentoPdfUrl && (
            <a
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${ata.documentoPdfUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-4 h-4 text-red-500" />
              Visualizar PDF
            </a>
          )}
          
          <Link
            to="/atas"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
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
        
        {/* Card 1: Valor Teto */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-500">Valor Teto Licitado</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(valorTeto)}</p>
        </div>
        
        {/* Card 2: Consumido Real */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-500">Consumido Real (Lançamentos)</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(valorConsumido)}</p>
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="h-2 rounded-full bg-green-500 transition-all" 
                style={{ width: `${Math.min((valorConsumido / valorTeto) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] mt-1 text-gray-400 text-right">
              {Math.round((valorConsumido / valorTeto) * 100)}% consumido
            </p>
          </div>
        </div>

        {/* Card 3: Comprometido */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-500">Comprometido em Pedidos</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{formatCurrency(comprometido)}</p>
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="h-2 rounded-full bg-yellow-500 transition-all" 
                style={{ width: `${Math.min((comprometido / valorTeto) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] mt-1 text-gray-400 text-right">
              {Math.round((comprometido / valorTeto) * 100)}% do teto
            </p>
          </div>
        </div>

        {/* Card 4: Saldo Disponível */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-500">Saldo Disponível Licitado</p>
          <p className={`text-2xl font-bold mt-2 ${saldoDisponivel < 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {formatCurrency(saldoDisponivel)}
          </p>
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all ${saldoDisponivel < 0 ? 'bg-red-500' : 'bg-blue-500'}`} 
                style={{ width: `${Math.max(Math.min((saldoDisponivel / valorTeto) * 100, 100), 0)}%` }}
              ></div>
            </div>
            <p className="text-[10px] mt-1 text-gray-400 text-right">
              {Math.max(Math.round((saldoDisponivel / valorTeto) * 100), 0)}% restante
            </p>
          </div>
        </div>
      </div>

      {/* Itens da Ata Licitados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Medicamentos e Itens da Ata</h3>
          <p className="text-xs text-gray-400">Clique na linha do item para visualizar o histórico de consumos específico.</p>
        </div>
        
        <DataTable 
          data={medicamentos}
          columns={columns}
          renderExpandedRow={renderExpandedRow}
          rowActions={(row) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenConsumoModal(row);
              }}
              className="inline-flex items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-600 hover:bg-blue-100 hover:text-blue-700 h-8 px-3 transition-colors gap-1 shadow-sm"
              title="Registrar consumo deste item"
            >
              <Plus className="w-3.5 h-3.5" />
              Consumo
            </button>
          )}
        />
      </div>

      {/* Modal para Registrar Novo Consumo */}
      <ModalNovoConsumo 
        isOpen={isConsumoModalOpen} 
        onClose={() => {
          setIsConsumoModalOpen(false);
          setSelectedMedicamento(null);
        }} 
        onSuccess={() => {
          fetchData();
          toast.success('Valores atualizados com sucesso.');
        }}
        ataId={data.id}
        item={selectedMedicamento}
      />

    </div>
  );
}
