import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AlertBanner } from '../ui/AlertBanner';
import { registrarConsumo } from '../../services/ataService';
import type { MedicamentoAta } from '../../types';

interface ModalNovoConsumoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ataId: string;
  item: MedicamentoAta | null;
}

export function ModalNovoConsumo({ isOpen, onClose, onSuccess, ataId, item }: ModalNovoConsumoProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantidade, setQuantidade] = useState<number>(0);
  const [valorUnitario, setValorUnitario] = useState<number>(0);
  const [setorSolicitante, setSetorSolicitante] = useState('');
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    if (item) {
      setValorUnitario(item.precoUnitario);
      setQuantidade(0);
      setSetorSolicitante('');
      setObservacao('');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const saldoDisponivel = item.qtdeInicial - item.quantidadeUsada;
  const valorTotal = quantidade * valorUnitario;
  const isEstourandoSaldo = quantidade > saldoDisponivel;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (quantidade <= 0) {
      toast.error('Informe uma quantidade de consumo válida.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        ataItemId: item.id,
        quantidade,
        valorUnitario,
        setorSolicitante: setorSolicitante || undefined,
        observacao: observacao || undefined
      };

      await registrarConsumo(ataId, payload);
      toast.success('Consumo de medicamento registrado com sucesso!');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Erro ao registrar o consumo.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100 animate-in fade-in scale-in duration-200">
        
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-white">Registrar Consumo</h3>
            <p className="text-xs text-blue-100">Registre o consumo real do medicamento licitado.</p>
          </div>
          <button
            type="button"
            className="rounded-md bg-blue-600 text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Medicamento Info */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm">
            <p className="font-semibold text-gray-800">{item.nome}</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-500">
              <p>Código CATMAT: <span className="font-semibold text-gray-700">{item.catmatCodigo || 'N/A'}</span></p>
              <p>Preço Unitário Licitado: <span className="font-semibold text-gray-700">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.precoUnitario)}</span></p>
              <p>Quantidade Licitada: <span className="font-semibold text-gray-700">{item.qtdeInicial.toLocaleString('pt-BR')}</span></p>
              <p>Saldo Atual: <span className={`font-bold ${saldoDisponivel <= 0 ? 'text-red-600' : 'text-blue-600'}`}>{saldoDisponivel.toLocaleString('pt-BR')} {item.unidadeAta || 'UN'}</span></p>
            </div>
          </div>

          {/* Alert if exceeding balance */}
          {isEstourandoSaldo && (
            <AlertBanner variant="warning" title="Alerta de Saldo Insuficiente">
              A quantidade informada ({quantidade}) excede o saldo disponível ({saldoDisponivel}). O consumo será registrado, mas o saldo deste item ficará negativo.
            </AlertBanner>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Quantidade Consumida *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="Ex: 50"
                value={quantidade || ''}
                onChange={(e) => setQuantidade(parseInt(e.target.value, 10) || 0)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Valor Unitário (R$)</label>
              <input
                type="number"
                disabled
                value={valorUnitario}
                className="mt-1 block w-full rounded-md bg-gray-100 border border-gray-200 px-3 py-2 text-sm text-gray-500 cursor-not-allowed font-medium"
              />
            </div>
          </div>

          {/* Total Value Row */}
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm font-semibold text-blue-900">
            <span>Valor Total do Lançamento:</span>
            <span className="text-base font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Setor/Unidade Solicitante</label>
            <input
              type="text"
              placeholder="Ex: UPA Central, Posto de Saúde..."
              value={setorSolicitante}
              onChange={(e) => setSetorSolicitante(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Observação / Justificativa {isEstourandoSaldo ? '*' : ''}
            </label>
            <textarea
              rows={2}
              required={isEstourandoSaldo}
              minLength={isEstourandoSaldo ? 15 : undefined}
              placeholder={
                isEstourandoSaldo 
                  ? "Obrigatório: Forneça uma justificativa detalhada de no mínimo 15 caracteres para o estouro de saldo..." 
                  : "Descreva detalhes ou justificativas adicionais sobre este lançamento..."
              }
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${
                isEstourandoSaldo 
                  ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500 bg-amber-50/10' 
                  : 'border-gray-300'
              }`}
            />
            {isEstourandoSaldo && (
              <p className="mt-1 text-[11px] text-amber-600 font-medium animate-pulse">
                * Justificativa obrigatória (mínimo 15 caracteres) pois o consumo excede o saldo.
              </p>
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Confirmar Lançamento'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
