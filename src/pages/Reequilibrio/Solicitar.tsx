import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { mockAtas, mockMedicamentosAta } from '../../lib/mockData';
import { FileUpload } from '../../components/ui/FileUpload';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { Scale, ArrowRight, TrendingUp } from 'lucide-react';

export function SolicitarReequilibrio() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [selectedAtaId, setSelectedAtaId] = useState('');
  const [selectedMedId, setSelectedMedId] = useState('');
  const [novoPreco, setNovoPreco] = useState('');
  const [justificativa, setJustificativa] = useState('');

  // Derived state
  const medicamentosDisponiveis = useMemo(() => {
    return mockMedicamentosAta.filter(m => m.ataId === selectedAtaId);
  }, [selectedAtaId]);

  const medicamentoAtual = useMemo(() => {
    return medicamentosDisponiveis.find(m => m.id === selectedMedId);
  }, [selectedMedId, medicamentosDisponiveis]);

  const precoAtual = medicamentoAtual?.precoUnitario || 0;
  const precoSugerido = parseFloat(novoPreco) || 0;
  
  const divergenciaPercentual = precoAtual > 0 
    ? ((precoSugerido - precoAtual) / precoAtual) * 100 
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAtaId || !selectedMedId || precoSugerido <= precoAtual || !justificativa) return;
    setShowModal(true);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Scale className="w-6 h-6 text-blue-600" />
          Solicitar Reequilíbrio Econômico-Financeiro
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Formulário exclusivo do fornecedor para propor reajustes justificados por imprevisibilidade de mercado.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ata de Registro de Preço *</label>
              <select 
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={selectedAtaId}
                onChange={(e) => {
                  setSelectedAtaId(e.target.value);
                  setSelectedMedId('');
                }}
                required
              >
                <option value="">Selecione uma Ata...</option>
                {mockAtas.map(ata => (
                  <option key={ata.id} value={ata.id}>{ata.numero} - Vencimento: {new Date(ata.dataFim).toLocaleDateString()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medicamento/Item *</label>
              <select 
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                value={selectedMedId}
                onChange={(e) => setSelectedMedId(e.target.value)}
                disabled={!selectedAtaId}
                required
              >
                <option value="">Selecione o item...</option>
                {medicamentosDisponiveis.map(med => (
                  <option key={med.id} value={med.id}>{med.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {medicamentoAtual && (
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="text-center md:text-left">
                <p className="text-sm font-medium text-blue-600">Preço Atual</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(precoAtual)}</p>
              </div>
              
              <ArrowRight className="w-6 h-6 text-blue-300 hidden md:block" />

              <div className="w-full md:w-auto flex-1 max-w-xs">
                <label className="block text-sm font-medium text-blue-600 mb-1 text-center md:text-left">Novo Preço Solicitado (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min={precoAtual + 0.01}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 text-lg font-bold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center md:text-left"
                  placeholder="0,00"
                  value={novoPreco}
                  onChange={(e) => setNovoPreco(e.target.value)}
                  required
                />
              </div>

              <div className="text-center md:text-right">
                <p className="text-sm font-medium text-blue-600">Divergência / Reajuste</p>
                <div className="flex items-center justify-center md:justify-end gap-1 text-2xl font-bold text-orange-600">
                  <TrendingUp className="w-5 h-5" />
                  {divergenciaPercentual.toFixed(1)}%
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Justificativa Legal e Mercadológica *</label>
            <textarea
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Explique os motivos de força maior ou mudanças de mercado que impossibilitam o fornecimento no valor originalmente pactuado..."
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Evidências (Notas de compra, cartas do fabricante, etc) *</label>
            <FileUpload accept="application/pdf,image/*" maxFiles={5} />
            <p className="text-xs text-gray-500 mt-2">É obrigatório o envio de provas documentais do aumento do custo na cadeia de suprimentos.</p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!selectedAtaId || !selectedMedId || precoSugerido <= precoAtual || !justificativa}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            Enviar Solicitação
          </button>
        </div>
      </form>

      <SuccessModal 
        isOpen={showModal} 
        onClose={() => { setShowModal(false); navigate('/'); }}
        title="Solicitação Enviada"
        message="Seu pedido de reequilíbrio foi protocolado e será analisado pela área técnica e jurídica do órgão."
      />
    </div>
  );
}
