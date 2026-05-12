import { useState } from 'react';
import { useNavigate } from 'react-router';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { Scale, FileText, FileDown, CheckCircle, XCircle } from 'lucide-react';
import { AlertBanner } from '../../components/ui/AlertBanner';

// Simulando dados que viriam de uma API do pedido criado no passo anterior
const solicitacaoMock = {
  id: 'REQ-2026-892',
  fornecedorNome: 'MedSupply Nacional LTDA',
  ataNumero: 'SRP 045/2025',
  medicamentoNome: 'Dipirona Sódica 500mg/ml',
  precoAntigo: 0.85,
  precoNovo: 1.15,
  percentual: 35.29,
  justificativa: 'Devido à escassez mundial de insumos ativos provenientes da Ásia (fato público e notório comprovado em anexo) e da forte valorização cambial do último semestre, o custo de aquisição na fábrica sofreu um repasse de 40%, inviabilizando o cumprimento da margem estipulada em edital.',
  documentos: [
    { nome: 'carta_fabricante.pdf', size: '2.4 MB' },
    { nome: 'notas_fiscais_novas_aquisicoes.pdf', size: '5.1 MB' }
  ]
};

export function AprovarReequilibrio() {
  const navigate = useNavigate();
  const [parecer, setParecer] = useState('');
  const [showModal, setShowModal] = useState<{ isOpen: boolean; isAprovado: boolean }>({ isOpen: false, isAprovado: false });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleAction = (isAprovado: boolean) => {
    if (!parecer.trim()) return;
    setShowModal({ isOpen: true, isAprovado });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Scale className="w-6 h-6 text-gray-700" />
          Análise de Reequilíbrio Econômico-Financeiro
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Revisão de pleitos do fornecedor para reajuste de preços de Atas vigentes.
        </p>
      </div>

      {solicitacaoMock.percentual > 20 && (
        <AlertBanner variant="warning" title="Atenção Jurídica">
          O percentual de reajuste pleiteado ultrapassa a margem padrão de 20%. Exige fundamentação legal estrita ou pesquisa mercadológica complementar para deferimento.
        </AlertBanner>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado Esquerdo: Dados da Solicitação */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-1">Fornecedor</p>
                <p className="text-lg font-bold text-gray-900">{solicitacaoMock.fornecedorNome}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-1">Protocolo / ATA</p>
                <p className="text-sm font-medium text-gray-900">{solicitacaoMock.id}</p>
                <p className="text-sm text-gray-500">{solicitacaoMock.ataNumero}</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-2">Item Pleiteado</p>
              <p className="text-base text-gray-900 font-medium">{solicitacaoMock.medicamentoNome}</p>
              
              <div className="flex gap-8 mt-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Preço Atual</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(solicitacaoMock.precoAntigo)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Preço Solicitado</p>
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(solicitacaoMock.precoNovo)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Variação</p>
                  <p className="text-xl font-bold text-red-600">+{solicitacaoMock.percentual}%</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Justificativa do Fornecedor</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100 leading-relaxed italic">
                "{solicitacaoMock.justificativa}"
              </p>
            </div>
          </div>
        </div>

        {/* Lado Direito: Documentos e Ações */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              Evidências Anexadas
            </h3>
            <div className="space-y-3">
              {solicitacaoMock.documentos.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.nome}</p>
                      <p className="text-xs text-gray-500">{doc.size}</p>
                    </div>
                  </div>
                  <FileDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 border-t-4 border-t-blue-600">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Decisão Técnica</h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parecer Técnico Consubstanciado *
            </label>
            <textarea
              rows={5}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-6"
              placeholder="Descreva a fundamentação técnica e jurídica para aprovar ou rejeitar o pleito..."
              value={parecer}
              onChange={(e) => setParecer(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleAction(false)}
                disabled={!parecer.trim()}
                className="flex flex-col items-center justify-center gap-2 p-3 border border-red-200 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-6 h-6" />
                <span className="font-semibold text-sm">Rejeitar Pleito</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction(true)}
                disabled={!parecer.trim()}
                className="flex flex-col items-center justify-center gap-2 p-3 border border-green-200 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-6 h-6" />
                <span className="font-semibold text-sm">Aprovar Reajuste</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal 
        isOpen={showModal.isOpen} 
        onClose={() => { setShowModal({ isOpen: false, isAprovado: false }); navigate('/'); }}
        title={showModal.isAprovado ? 'Reequilíbrio Aprovado!' : 'Reequilíbrio Rejeitado'}
        message={showModal.isAprovado 
          ? 'O preço do item foi reajustado com sucesso na Ata vigente e o fornecedor será notificado.' 
          : 'O pleito foi indeferido. O parecer técnico foi gravado no histórico da Ata e o fornecedor notificado da recusa.'}
        autoCloseMs={4000}
      />
    </div>
  );
}
