import { useEffect, useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Building2, 
  Calendar, 
  DollarSign, 
  Hash, 
  Mail, 
  Phone, 
  Info,
  Loader2,
  FileText
} from 'lucide-react';
import { getPedidoById } from '../../services/pedidoService';
import type { PedidoCompra } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { cn } from '../../lib/utils';

interface ModalDetalhesPedidoProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: string | null;
}

export function ModalDetalhesPedido({ isOpen, onClose, pedidoId }: ModalDetalhesPedidoProps) {
  const [pedido, setPedido] = useState<PedidoCompra | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !pedidoId) {
      setPedido(null);
      setError(null);
      return;
    }

    const fetchPedidoDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getPedidoById(pedidoId);
        if (data) {
          setPedido(data);
        } else {
          setError('Pedido não encontrado.');
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes do pedido:', err);
        setError('Ocorreu um erro ao carregar os detalhes do pedido.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPedidoDetails();
  }, [isOpen, pedidoId]);

  if (!isOpen) return null;

  // Helpers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('pt-BR');
  };

  const formatCNPJ = (cnpj?: string) => {
    if (!cnpj) return 'Não informado';
    const clean = cnpj.replace(/\D/g, '');
    if (clean.length !== 14) return cnpj;
    return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return 'Não informado';
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 11) {
      return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }
    if (clean.length === 10) {
      return clean.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    return phone;
  };

  // Status mapping matching index.tsx
  const getStatusVariant = (status?: string) => {
    let variant: 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'purple' | 'gray' = 'gray';
    if (status === 'APROVADO') variant = 'blue';
    if (status === 'EM_TRANSITO') variant = 'yellow';
    if (status === 'ENTREGUE') variant = 'green';
    if (status === 'CANCELADO') variant = 'red';
    if (status === 'REJEITADO') variant = 'red';
    if (status === 'PENDENTE') variant = 'orange';
    if (status === 'ACEITO') variant = 'purple';
    return variant;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div 
        className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col transform transition-all border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        role="dialog"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 uppercase">
                  Pedido {pedido?.numero || '...'}
                </h2>
                {pedido?.status && (
                  <StatusBadge 
                    status={pedido.status} 
                    variant={getStatusVariant(pedido.status)} 
                  />
                )}
              </div>
              <p className="text-xs text-gray-500">
                Criado em: {formatDate(pedido?.criadoEm)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Carregando detalhes do pedido...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-sm font-semibold text-red-800">{error}</p>
            </div>
          ) : pedido ? (
            <>
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fornecedor Card */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    Dados do Fornecedor
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">Razão Social</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {pedido.fornecedor?.razaoSocial || 'Não informado'}
                      </p>
                    </div>
                    {pedido.fornecedor?.nomeFantasia && (
                      <div>
                        <p className="text-xs text-gray-400 font-semibold">Nome Fantasia</p>
                        <p className="text-sm font-medium text-gray-700">
                          {pedido.fornecedor.nomeFantasia}
                        </p>
                      </div>
                    )}
                    {/* Exibir CNPJ e Contatos se existirem no objeto */}
                    {('cnpj' in (pedido.fornecedor || {})) && (
                      <div>
                        <p className="text-xs text-gray-400 font-semibold">CNPJ</p>
                        <p className="text-sm font-medium text-gray-700">
                          {formatCNPJ((pedido.fornecedor as any).cnpj)}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200/60 mt-1">
                      <div>
                        <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                          <Mail className="w-3 h-3" /> E-mail
                        </p>
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {('email' in (pedido.fornecedor || {})) ? (pedido.fornecedor as any).email || '-' : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                          <Phone className="w-3 h-3" /> WhatsApp
                        </p>
                        <p className="text-xs font-medium text-gray-700">
                          {('whatsapp' in (pedido.fornecedor || {})) ? formatPhone((pedido.fornecedor as any).whatsapp) : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pedido Details Card */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-gray-400" />
                      Dados da Compra
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                          <Hash className="w-3 h-3" /> ATA Relacionada
                        </p>
                        <p className="text-sm font-bold text-blue-600">
                          {pedido.ata?.numero ? (
                            <span>{pedido.ata.numero}</span>
                          ) : (
                            <span className="text-gray-500 font-medium">Sem ATA vinculada</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Data de Envio
                        </p>
                        <p className="text-sm font-medium text-gray-750">
                          {formatDate(pedido.dataSolicitacao)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200/65 flex justify-between items-center mt-3 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Valor Total</span>
                    <span className="text-lg font-extrabold text-blue-900">
                      {formatCurrency(pedido.valorTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Justificativa (Se houver) */}
              {pedido.justificativa && (
                <div className="bg-amber-50/50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Justificativa do Pedido</h4>
                    <p className="text-sm text-amber-955 mt-1 leading-relaxed italic">
                      "{pedido.justificativa}"
                    </p>
                  </div>
                </div>
              )}

              {/* Tabela de Itens */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-450 uppercase tracking-wider">
                  Itens do Pedido ({pedido.itens?.length || 0})
                </h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold select-none">
                        <th className="px-4 py-3">Medicamento</th>
                        <th className="px-4 py-3 text-right">Qtd. Solicitada</th>
                        <th className="px-4 py-3 text-right">Preço Unitário</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 bg-white">
                      {pedido.itens && pedido.itens.length > 0 ? (
                        pedido.itens.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-800">
                              {item.medicamentoNome}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700 font-medium">
                              {item.quantidade.toLocaleString('pt-BR')}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">
                              {formatCurrency(item.precoUnitario)}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900">
                              {formatCurrency(item.valorTotal)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-gray-400 italic">
                            Nenhum item cadastrado neste pedido.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50/80 border-t-2 border-gray-200 font-bold text-gray-900">
                        <td colSpan={3} className="px-4 py-3 text-right text-xs uppercase tracking-wider text-gray-500">
                          Total do Pedido
                        </td>
                        <td className="px-4 py-3 text-right text-base text-gray-950 font-black">
                          {formatCurrency(pedido.valorTotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-750 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer shadow-sm hover:text-gray-900"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
