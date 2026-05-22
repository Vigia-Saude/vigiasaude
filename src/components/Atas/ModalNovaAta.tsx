import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Plus, Trash2, HelpCircle, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { FileUpload } from '../ui/FileUpload';
import { criarAta, buscarCatmat, buscarCatmatPorCodigo, uploadFile } from '../../services/ataService';
import { getFornecedores } from '../../services/fornecedorService';
import type { CatmatMedicamento, Fornecedor } from '../../types';

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
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoadingFornecedores, setIsLoadingFornecedores] = useState(false);
  const [selectedFornecedorId, setSelectedFornecedorId] = useState('');
  

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
  const [catmatLoading, setCatmatLoading] = useState<{ [key: number]: boolean }>({});
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);
  // Debounce timers ref
  const debounceTimers = useRef<{ [key: number]: ReturnType<typeof setTimeout> }>({});

  // Fetch suppliers and reset modal fields when open
  useEffect(() => {
    if (isOpen) {
      setNumero('');
      setFornecedorNome('');
      setFornecedorCnpj('');
      setSelectedFornecedorId('');
      setVigenciaInicio('');
      setVigenciaFim('');
      setObservacoes('');
      setPdfFile(null);
      setMedicamentos([{ nome: '', precoUnitario: 0, qtdeInicial: 0, unidadeAta: 'UNIDADE' }]);
      
      const fetchFornecedores = async () => {
        try {
          setIsLoadingFornecedores(true);
          const data = await getFornecedores();
          setFornecedores(data.filter(f => f.status === 'ATIVO'));
        } catch (err) {
          console.error('Erro ao buscar fornecedores:', err);
          toast.error('Erro ao carregar fornecedores.');
        } finally {
          setIsLoadingFornecedores(false);
        }
      };
      fetchFornecedores();
    }
  }, [isOpen]);

  const handleFornecedorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedFornecedorId(id);
    const selected = fornecedores.find(f => f.id === id);
    if (selected) {
      setFornecedorNome(selected.razaoSocial);
      setFornecedorCnpj(selected.cnpj);
    } else {
      setFornecedorNome('');
      setFornecedorCnpj('');
    }
  };

  // Auto-calculate Total Value (Valor Teto) as the sum of all medicines total values
  useEffect(() => {
    const total = medicamentos.reduce((acc, med) => acc + (med.precoUnitario * med.qtdeInicial), 0);
    setValorTeto(total);
  }, [medicamentos]);



  // Handle CATMAT Search with 300ms debounce
  const handleCatmatSearch = useCallback((index: number, query: string) => {
    setCatmatQueries(prev => ({ ...prev, [index]: query }));

    // Clear previous timer
    if (debounceTimers.current[index]) {
      clearTimeout(debounceTimers.current[index]);
    }

    // Se o usuário limpou o campo, removemos a associação com o CATMAT
    if (query.trim() === '') {
      const newMedicamentos = [...medicamentos];
      newMedicamentos[index] = {
        ...newMedicamentos[index],
        catmatCodigo: undefined,
        unidadeFornecimento: undefined,
      };
      setMedicamentos(newMedicamentos);
      setCatmatResults(prev => ({ ...prev, [index]: [] }));
      setCatmatLoading(prev => ({ ...prev, [index]: false }));
      return;
    }

    if (query.trim().length < 2) {
      setCatmatResults(prev => ({ ...prev, [index]: [] }));
      setCatmatLoading(prev => ({ ...prev, [index]: false }));
      return;
    }

    // Debounce: wait 300ms before searching
    debounceTimers.current[index] = setTimeout(async () => {
      setCatmatLoading(prev => ({ ...prev, [index]: true }));
      try {
        // Se o query parece um código BR exato (começa com BR + dígitos), tenta busca direta primeiro
        const isBrCode = /^BR\d+$/i.test(query.trim());
        if (isBrCode && query.trim().length >= 8) {
          const exact = await buscarCatmatPorCodigo(query.trim());
          if (exact) {
            // Auto-preencher automaticamente sem precisar selecionar
            handleSelectCatmat(index, exact);
            return;
          }
        }
        const results = await buscarCatmat(query);
        setCatmatResults(prev => ({ ...prev, [index]: results }));
      } catch (error) {
        console.error('Erro ao buscar CATMAT:', error);
      } finally {
        setCatmatLoading(prev => ({ ...prev, [index]: false }));
      }
    }, 300);
  }, [medicamentos]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectCatmat = (index: number, item: CatmatMedicamento) => {
    const newMedicamentos = [...medicamentos];
    newMedicamentos[index] = {
      ...newMedicamentos[index],
      catmatCodigo: item.codigoBr,
      nome: item.descricao,
      unidadeFornecimento: item.unidadeFornecimento,
      // Preenche unidadeAta com a unidade do CATMAT (editável pelo usuário)
      unidadeAta: item.unidadeFornecimento || 'UNIDADE',
    };
    setMedicamentos(newMedicamentos);

    // Limpar busca e fechar dropdown
    setCatmatResults(prev => ({ ...prev, [index]: [] }));
    // Removemos a query para que o valor exibido no input seja o med.catmatCodigo selecionado
    setCatmatQueries(prev => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
    setCatmatLoading(prev => ({ ...prev, [index]: false }));
    setActiveSearchIndex(null);
    toast.success(`Medicamento CATMAT preenchido: ${item.codigoBr}`);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop overlay */}
        <div 
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" 
          onClick={onClose}
        ></div>

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
          <div className="pointer-events-auto w-screen max-w-4xl h-full transform transition-transform duration-500 ease-in-out">
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
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        Razão Social / Nome Fornecedor *
                        {isLoadingFornecedores && <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />}
                      </label>
                      <select
                        required
                        value={selectedFornecedorId}
                        onChange={handleFornecedorChange}
                        disabled={isLoadingFornecedores}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Selecione um fornecedor...</option>
                        {fornecedores.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.razaoSocial} {f.nomeFantasia && f.nomeFantasia !== f.razaoSocial ? `(${f.nomeFantasia})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">CNPJ do Fornecedor</label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        placeholder="Selecione o fornecedor acima"
                        value={fornecedorCnpj}
                        className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 shadow-sm text-sm text-gray-500 cursor-not-allowed focus:outline-none"
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

                      {/* CATMAT Search com Autocomplete */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-4 relative">
                          <label className="block text-xs font-medium text-gray-500 flex items-center gap-1">
                            <Search className="w-3 h-3" />
                            Busca CATMAT / Código BR
                          </label>
                          {/* Exibe badge verde quando medicamento já está vinculado ao CATMAT */}
                          {med.catmatCodigo && !catmatQueries[index] && (
                            <div className="absolute top-0 right-0 flex items-center">
                              <span className="text-[10px] bg-green-100 text-green-700 rounded px-1.5 py-0.5 font-semibold">
                                ✓ {med.catmatCodigo}
                              </span>
                            </div>
                          )}
                          <div className="relative mt-1">
                            <input
                              type="text"
                              placeholder="Digite o código BR ou parte da descrição..."
                              value={catmatQueries[index] !== undefined ? catmatQueries[index] : (med.catmatCodigo || '')}
                              onFocus={() => setActiveSearchIndex(index)}
                              onBlur={() => {
                                // Delay para permitir clique no dropdown
                                setTimeout(() => setActiveSearchIndex(null), 200);
                              }}
                              onChange={(e) => handleCatmatSearch(index, e.target.value)}
                              className="block w-full rounded-md border border-gray-300 px-3 py-1.5 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                            />
                            {/* Spinner de carregamento */}
                            {catmatLoading[index] && (
                              <div className="absolute inset-y-0 right-2 flex items-center">
                                <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                              </div>
                            )}
                          </div>

                          {/* Dropdown de resultados */}
                          {activeSearchIndex === index && catmatResults[index] && catmatResults[index].length > 0 && (
                            <div className="absolute z-20 mt-1 w-full min-w-[320px] bg-white border border-gray-200 rounded-lg shadow-xl max-h-56 overflow-y-auto text-xs">
                              <div className="px-3 py-1.5 bg-gray-50 border-b text-[10px] text-gray-500 font-medium">
                                {catmatResults[index].length} resultado(s) encontrado(s)
                              </div>
                              {catmatResults[index].map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onMouseDown={() => handleSelectCatmat(index, item)}
                                  className="w-full text-left px-3 py-2.5 hover:bg-blue-50 border-b last:border-b-0 flex flex-col gap-0.5 transition-colors"
                                >
                                  <span className="font-semibold text-gray-800 text-xs leading-tight">{item.descricao}</span>
                                  <span className="text-gray-400 text-[10px]">Código: <strong className="text-blue-600">{item.codigoBr}</strong> &nbsp;·&nbsp; {item.unidadeFornecimento}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Mensagem quando não há resultados mas há busca ativa */}
                          {activeSearchIndex === index && (catmatQueries[index]?.length ?? 0) >= 2 && !catmatLoading[index] && catmatResults[index]?.length === 0 && (
                            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2.5 text-xs text-gray-500">
                              Nenhum medicamento encontrado para "<strong>{catmatQueries[index]}</strong>"
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
