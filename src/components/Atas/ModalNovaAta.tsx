import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, HelpCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { FileUpload } from '../ui/FileUpload';
import { criarAta, buscarCatmat, uploadFile } from '../../services/ataService';
import type { CatmatMedicamento } from '../../types';

interface ModalNovaAtaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface MedicamentoInput {
  catmatCodigo?: string;
  nome: string;
  unidadeFornecimento?: string;
  unidadeAta?: string;
  marca?: string;
  modelo?: string;
  precoUnitario: number;
  qtdeInicial: number;
  precoBPS?: number;
  precoCMED?: number;
  observacoes?: string;
}

export function ModalNovaAta({ isOpen, onClose, onSuccess }: ModalNovaAtaProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form fields
  const [numero, setNumero] = useState('');
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [fornecedorCnpj, setFornecedorCnpj] = useState('');
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  
  const [processoLicitatorio, setProcessoLicitatorio] = useState('');
  const [numeroPregao, setNumeroPregao] = useState('');
  const [numeroEdital, setNumeroEdital] = useState('');
  const [vigenciaInicio, setVigenciaInicio] = useState('');
  const [vigenciaFim, setVigenciaFim] = useState('');
  const [valorTeto, setValorTeto] = useState<number>(0);
  const [observacoes, setObservacoes] = useState('');
  
  // File upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Dynamic Medicines list
  const [medicamentos, setMedicamentos] = useState<MedicamentoInput[]>([
    { nome: '', precoUnitario: 0, qtdeInicial: 0, unidadeAta: 'UNIDADE' }
  ]);

  // Autocomplete CATMAT states per index
  const [catmatQueries, setCatmatQueries] = useState<{ [key: number]: string }>({});
  const [catmatResults, setCatmatResults] = useState<{ [key: number]: CatmatMedicamento[] }>({});
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);

  // CNPJ autocomplete via BrasilAPI
  useEffect(() => {
    const cleanCnpj = fornecedorCnpj.replace(/\D/g, '');
    if (cleanCnpj.length === 14) {
      const fetchCnpj = async () => {
        try {
          setIsSearchingCnpj(true);
          const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
          if (res.ok) {
            const data = await res.json();
            if (data.razao_social) {
              setFornecedorNome(data.razao_social);
              toast.success('Fornecedor localizado com sucesso via BrasilAPI!');
            }
          }
        } catch (err) {
          console.error('Erro ao buscar CNPJ:', err);
        } finally {
          setIsSearchingCnpj(false);
        }
      };
      fetchCnpj();
    }
  }, [fornecedorCnpj]);

  // Auto-calculate Total Value (Valor Teto) as the sum of all medicines total values
  useEffect(() => {
    const total = medicamentos.reduce((acc, med) => acc + (med.precoUnitario * med.qtdeInicial), 0);
    setValorTeto(total);
  }, [medicamentos]);

  if (!isOpen) return null;

  // Handle CATMAT Search for a specific index
  const handleCatmatSearch = async (index: number, query: string) => {
    setCatmatQueries(prev => ({ ...prev, [index]: query }));
    if (query.trim().length < 3) {
      setCatmatResults(prev => ({ ...prev, [index]: [] }));
      return;
    }

    try {
      const results = await buscarCatmat(query);
      setCatmatResults(prev => ({ ...prev, [index]: results }));
    } catch (error) {
      console.error('Erro ao buscar CATMAT:', error);
    }
  };

  const handleSelectCatmat = (index: number, item: CatmatMedicamento) => {
    const newMedicamentos = [...medicamentos];
    newMedicamentos[index] = {
      ...newMedicamentos[index],
      catmatCodigo: item.codigoBr,
      nome: item.descricao,
      unidadeFornecimento: item.unidadeFornecimento,
      unidadeAta: item.unidadeFornecimento || 'UNIDADE',
    };
    setMedicamentos(newMedicamentos);
    
    // Clear search results
    setCatmatResults(prev => ({ ...prev, [index]: [] }));
    setCatmatQueries(prev => ({ ...prev, [index]: '' }));
    setActiveSearchIndex(null);
  };

  const handleAddMedicine = () => {
    setMedicamentos(prev => [...prev, { nome: '', precoUnitario: 0, qtdeInicial: 0, unidadeAta: 'UNIDADE' }]);
  };

  const handleRemoveMedicine = (index: number) => {
    if (medicamentos.length === 1) {
      toast.warning('A ATA precisa de pelo menos 1 medicamento.');
      return;
    }
    setMedicamentos(prev => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: keyof MedicamentoInput, value: any) => {
    const newMedicamentos = [...medicamentos];
    newMedicamentos[index] = {
      ...newMedicamentos[index],
      [field]: value
    };
    setMedicamentos(newMedicamentos);
  };

  const handleFilesChange = (files: File[]) => {
    if (files.length > 0) {
      setPdfFile(files[0]);
    } else {
      setPdfFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!numero || !fornecedorNome || !vigenciaInicio || !vigenciaFim) {
      toast.error('Preencha todos os campos obrigatórios da ATA.');
      return;
    }

    // Validate medicines
    for (let i = 0; i < medicamentos.length; i++) {
      const med = medicamentos[i];
      if (!med.nome) {
        toast.error(`Informe o nome do medicamento na linha ${i + 1}.`);
        return;
      }
      if (med.precoUnitario <= 0 || med.qtdeInicial <= 0) {
        toast.error(`Informe preço unitário e quantidade válidos para ${med.nome || 'o item ' + (i + 1)}.`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      
      let documentoPdfUrl = undefined;
      
      // Upload file first if exists
      if (pdfFile) {
        toast.info('Fazendo upload do arquivo PDF...');
        const uploadRes = await uploadFile(pdfFile);
        documentoPdfUrl = uploadRes.url;
      }

      const payload = {
        numero,
        fornecedorNome,
        fornecedorCnpj,
        processoLicitatorio,
        numeroPregao,
        numeroEdital,
        vigenciaInicio,
        vigenciaFim,
        valorTeto,
        documentoPdfUrl,
        observacoes,
        medicamentos
      };

      await criarAta(payload);
      toast.success('Ata de Registro de Preços cadastrada com sucesso!');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Erro ao salvar a ATA.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop overlay */}
        <div 
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" 
          onClick={onClose}
        ></div>

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
          <div className="pointer-events-auto w-screen max-w-4xl transform transition-transform duration-500 ease-in-out">
            <form onSubmit={handleSubmit} className="flex h-full flex-col bg-white shadow-2xl">
              
              {/* Header */}
              <div className="bg-blue-600 px-6 py-5 sm:px-8 flex items-center justify-between shadow-md">
                <div>
                  <h2 className="text-xl font-bold text-white" id="modal-title">Nova Ata de Registro de Preços (SRP)</h2>
                  <p className="mt-1 text-sm text-blue-100">Cadastre uma nova ata licitatória e seus medicamentos.</p>
                </div>
                <button
                  type="button"
                  className="rounded-md bg-blue-600 text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                  onClick={onClose}
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
                
                {/* Seção 1: Dados Gerais da ATA */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informações Gerais</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Número da Ata *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 2024/002"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CNPJ do Fornecedor</label>
                      <div className="relative mt-1">
                        <input
                          type="text"
                          placeholder="Ex: 12345678000199 (Apenas números)"
                          value={fornecedorCnpj}
                          onChange={(e) => setFornecedorCnpj(e.target.value)}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                        {isSearchingCnpj && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Razão Social / Nome Fornecedor *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nome ou Razão Social"
                        value={fornecedorNome}
                        onChange={(e) => setFornecedorNome(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Processo Licitatório</label>
                      <input
                        type="text"
                        placeholder="Ex: 123/2024"
                        value={processoLicitatorio}
                        onChange={(e) => setProcessoLicitatorio(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Número do Pregão</label>
                      <input
                        type="text"
                        placeholder="Ex: 45/2024"
                        value={numeroPregao}
                        onChange={(e) => setNumeroPregao(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Número do Edital</label>
                      <input
                        type="text"
                        placeholder="Ex: 01/2024"
                        value={numeroEdital}
                        onChange={(e) => setNumeroEdital(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Início da Vigência *</label>
                      <input
                        type="date"
                        required
                        value={vigenciaInicio}
                        onChange={(e) => setVigenciaInicio(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fim da Vigência *</label>
                      <input
                        type="date"
                        required
                        value={vigenciaFim}
                        onChange={(e) => setVigenciaFim(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Valor Teto (Calculado)</label>
                      <div className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-300 px-3 py-2 text-sm text-gray-700 font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTeto)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Observações Gerais</label>
                    <textarea
                      rows={2}
                      placeholder="Observações complementares sobre a ATA"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Seção 2: Documento da Ata */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Documento da ATA (Anexo PDF)</h3>
                  <FileUpload 
                    maxFiles={1} 
                    accept=".pdf" 
                    onFilesChange={handleFilesChange}
                    className="border-gray-200" 
                  />
                </div>

                {/* Seção 3: Medicamentos Licitados */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Medicamentos da ATA</h3>
                    <button
                      type="button"
                      onClick={handleAddMedicine}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 rounded-md transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar Item
                    </button>
                  </div>

                  {medicamentos.map((med, index) => (
                    <div key={index} className="relative p-5 border border-gray-200 rounded-xl bg-gray-50/50 space-y-4 shadow-sm">
                      
                      {/* Botão de Remover Item */}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(index)}
                        className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Remover medicamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                          {index + 1}
                        </span>
                        <h4 className="text-sm font-semibold text-gray-700">Medicamento</h4>
                      </div>

                      {/* CATMAT Search */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-4 relative">
                          <label className="block text-xs font-medium text-gray-500">Busca CATMAT / Código BR</label>
                          <input
                            type="text"
                            placeholder="Buscar código ou descrição..."
                            value={catmatQueries[index] !== undefined ? catmatQueries[index] : (med.catmatCodigo || '')}
                            onFocus={() => setActiveSearchIndex(index)}
                            onChange={(e) => {
                              handleCatmatSearch(index, e.target.value);
                            }}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                          />
                          
                          {/* Autocomplete Dropdown */}
                          {activeSearchIndex === index && catmatResults[index] && catmatResults[index].length > 0 && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto text-xs">
                              {catmatResults[index].map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => handleSelectCatmat(index, item)}
                                  className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0 flex flex-col"
                                >
                                  <span className="font-semibold text-gray-800">{item.descricao}</span>
                                  <span className="text-gray-500 text-[10px]">Código: {item.codigoBr} | {item.unidadeFornecimento}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-5">
                          <label className="block text-xs font-medium text-gray-500">Nome Comercial / Descrição Comercial *</label>
                          <input
                            type="text"
                            required
                            placeholder="Descrição completa"
                            value={med.nome}
                            onChange={(e) => handleMedicineChange(index, 'nome', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-xs font-medium text-gray-500">Unidade (Ata) *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: COMPRIMIDO, FRASCO"
                            value={med.unidadeAta}
                            onChange={(e) => handleMedicineChange(index, 'unidadeAta', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                          />
                        </div>
                      </div>

                      {/* Brand, Unit price, Qty */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500">Preço Unitário Licitado (R$) *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="0.00"
                            value={med.precoUnitario || ''}
                            onChange={(e) => handleMedicineChange(index, 'precoUnitario', parseFloat(e.target.value) || 0)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500">Quantidade Inicial *</label>
                          <input
                            type="number"
                            required
                            placeholder="Qtd total licitada"
                            value={med.qtdeInicial || ''}
                            onChange={(e) => handleMedicineChange(index, 'qtdeInicial', parseInt(e.target.value, 10) || 0)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500">Marca</label>
                          <input
                            type="text"
                            placeholder="Ex: EMS, Medley"
                            value={med.marca || ''}
                            onChange={(e) => handleMedicineChange(index, 'marca', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500">Modelo / Apresentação</label>
                          <input
                            type="text"
                            placeholder="Ex: Caixa c/ 30 compr."
                            value={med.modelo || ''}
                            onChange={(e) => handleMedicineChange(index, 'modelo', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                          />
                        </div>
                      </div>

                      {/* BPS and CMED prices */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 flex items-center gap-1">
                            Preço de Referência BPS
                            <span title="Banco de Preços em Saúde"><HelpCircle className="w-3.5 h-3.5 text-gray-400" /></span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Opcional"
                            value={med.precoBPS || ''}
                            onChange={(e) => handleMedicineChange(index, 'precoBPS', parseFloat(e.target.value) || undefined)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 flex items-center gap-1">
                            Preço Teto CMED (Anvisa)
                            <span title="Câmara de Regulação do Mercado de Medicamentos"><HelpCircle className="w-3.5 h-3.5 text-gray-400" /></span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Opcional"
                            value={med.precoCMED || ''}
                            onChange={(e) => handleMedicineChange(index, 'precoCMED', parseFloat(e.target.value) || undefined)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500">Valor Total Estimado (Item)</label>
                          <div className="mt-1 block w-full rounded-md bg-gray-100 border border-gray-200 px-3 py-1.5 text-xs text-gray-600 font-semibold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(med.precoUnitario * med.qtdeInicial)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-6 py-4 sm:px-8 flex justify-end gap-3 bg-gray-50 shadow-inner">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Ata'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
