import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { getPedidoById, confirmarEntrega as confirmarEntregaApi } from '../../services/pedidoService';
import type { PedidoCompra } from '../../types';
import { FileUpload } from '../../components/ui/FileUpload';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

export function ConfirmarEntrega() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [pedido, setPedido] = useState<PedidoCompra | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // States for form
  const [checkedItems, setCheckedItems] = useState({
    nf: false,
    medicamentos: false,
    lote: false,
  });
  const [nfNumber, setNfNumber] = useState('');
  const [observations, setObservations] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchPedido = async () => {
      try {
        setIsLoading(true);
        const data = await getPedidoById(id);
        setPedido(data);
      } catch (err) {
        console.error('Erro ao buscar pedido:', err);
        toast.error('Erro ao buscar informações do pedido de compra.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPedido();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
        <span className="text-gray-500 font-medium">Carregando dados do pedido...</span>
      </div>
    );
  }

  if (!pedido || ['CANCELADO', 'REJEITADO', 'ENTREGUE', 'RASCUNHO'].includes(pedido.status)) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-xl border border-gray-200 text-center shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Pedido Inválido</h3>
        <p className="text-sm text-gray-500 mb-6">
          O pedido não foi localizado ou não está em um status que permite confirmação de recebimento (atual: <span className="font-semibold">{pedido?.status || 'N/A'}</span>).
        </p>
        <Link 
          to="/pedidos" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Pedidos
        </Link>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const isFormValid = checkedItems.nf && checkedItems.medicamentos && checkedItems.lote && nfNumber.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !id) return;
    
    try {
      await confirmarEntregaApi(id);
      setShowModal(true);
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { error?: string } } };
      const errMsg = axiosError.response?.data?.error || 'Erro ao confirmar entrega.';
      toast.error(errMsg);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/pedidos');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Confirmar Entrega - {pedido.numero}</h1>
          <p className="mt-1 text-sm text-gray-500">Preencha o checklist de recebimento para o pedido.</p>
        </div>
        <Link 
          to="/pedidos" 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resumo do Pedido */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Resumo do Pedido</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Ata Vinculada:</span>
                <span className="font-semibold text-gray-900">{pedido.ata?.numero || 'Sem ATA'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Fornecedor:</span>
                <span className="font-semibold text-gray-900 text-right">{pedido.fornecedor?.nomeFantasia || pedido.fornecedor?.razaoSocial}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Itens no Pedido:</span>
                <span className="font-semibold text-gray-900">{(pedido.itens || []).length}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-gray-500 font-medium">Valor Total:</span>
                <span className="font-bold text-gray-900">{formatCurrency(pedido.valorTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Checklist de Conformidade</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" 
                    checked={checkedItems.nf}
                    onChange={(e) => setCheckedItems(prev => ({ ...prev, nf: e.target.checked }))}
                  />
                  <span className="text-sm text-gray-700">A Nota Fiscal está em conformidade com o Pedido de Compra gerado.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" 
                    checked={checkedItems.medicamentos}
                    onChange={(e) => setCheckedItems(prev => ({ ...prev, medicamentos: e.target.checked }))}
                  />
                  <span className="text-sm text-gray-700">As quantidades e integridade física dos medicamentos estão corretas.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" 
                    checked={checkedItems.lote}
                    onChange={(e) => setCheckedItems(prev => ({ ...prev, lote: e.target.checked }))}
                  />
                  <span className="text-sm text-gray-700">Os lotes e as datas de validade conferem com a especificação técnica mínima.</span>
                </label>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div>
                <label htmlFor="nfNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Número da Nota Fiscal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nfNumber"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ex: 123456789"
                  value={nfNumber}
                  onChange={(e) => setNfNumber(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comprovante / Canhoto Assinado
                </label>
                <FileUpload accept="image/*,application/pdf" />
              </div>

              <div>
                <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1">
                  Observações de Recebimento
                </label>
                <textarea
                  id="observations"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Se houver alguma ressalva, descreva aqui..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={!isFormValid}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Confirmar Entrega
              </button>
            </div>
          </form>
        </div>
      </div>

      <SuccessModal 
        isOpen={showModal} 
        onClose={handleModalClose}
        title="Entrega Confirmada!"
        message="A nota fiscal foi processada e o estoque virtual foi atualizado com sucesso."
        autoCloseMs={3000}
      />
    </div>
  );
}
