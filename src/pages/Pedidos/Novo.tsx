import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { toast } from 'sonner';
import { 
  getAtas, 
  getAtaFullDetails, 
  buscarCatmat 
} from '../../services/ataService';
import type {
  AtaWithFornecedor,
  AtaFullDetails
} from '../../services/ataService';
import { getFornecedores } from '../../services/fornecedorService';
import { 
  createPedido, 
  updatePedido, 
  getPedidoById 
} from '../../services/pedidoService';
import type { 
  Fornecedor, 
  MedicamentoAta, 
  CatmatMedicamento
} from '../../types';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Info, 
  AlertTriangle, 
  Save, 
  Send, 
  Search, 
  Loader2,
  FileSpreadsheet
} from 'lucide-react';

interface LocalItem {
  id?: string;
  medicamentoId?: string | null;
  medicamentoNome: string;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
  ataItemId?: string | null;
  // Extra fields for frontend validation
  ataSaldo?: number | null;
}

export function NovoPedido() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  // Page States
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pcdNumber, setPcdNumber] = useState('PdC-YYYY-XXXX (Gerado Automaticamente)');

  // Form Fields
  const [isLinkedToAta, setIsLinkedToAta] = useState(true);
  const [dataSolicitacao, setDataSolicitacao] = useState(() => {
    return new Date().toISOString().substring(0, 10);
  });
  const [selectedAtaId, setSelectedAtaId] = useState('');
  const [selectedFornecedorId, setSelectedFornecedorId] = useState('');
  const [justificativa, setJustificativa] = useState('');

  // Loaded Data lists
  const [atas, setAtas] = useState<AtaWithFornecedor[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoadingAtaDetails, setIsLoadingAtaDetails] = useState(false);
  const [selectedAtaDetails, setSelectedAtaDetails] = useState<AtaFullDetails | null>(null);

  // Added Items
  const [addedItems, setAddedItems] = useState<LocalItem[]>([]);

  // Item Form Fields
  const [selectedAtaMedicamentoId, setSelectedAtaMedicamentoId] = useState('');
  
  // Non-ATA Medication Search
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const [medQuery, setMedQuery] = useState('');
  const [searchingMed, setSearchingMed] = useState(false);
  const [medSearchResults, setMedSearchResults] = useState<CatmatMedicamento[]>([]);
  const [selectedCatmatMed, setSelectedCatmatMed] = useState<CatmatMedicamento | null>(null);

  const [itemQuantity, setItemQuantity] = useState<number>(0);
  const [itemPrice, setItemPrice] = useState<number>(0);

  // Load Initial Data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [atasData, suppliersData] = await Promise.all([
          getAtas(),
          getFornecedores({ status: 'ATIVO' })
        ]);
        setAtas(atasData.filter(a => a.status === 'ATIVA'));
        setFornecedores(suppliersData);

        // If in Edit Mode, fetch details
        if (editId) {
          setIsEditMode(true);
          const pedido = await getPedidoById(editId);
          if (pedido) {
            if (pedido.status !== 'RASCUNHO') {
              toast.error('Apenas pedidos em Rascunho podem ser editados.');
              navigate('/pedidos');
              return;
            }
            setPcdNumber(pedido.numero);
            setDataSolicitacao(pedido.dataSolicitacao.substring(0, 10));
            setJustificativa(pedido.justificativa || '');
            
            if (pedido.ataId) {
              setIsLinkedToAta(true);
              setSelectedAtaId(pedido.ataId);
              // Fetch details of ATA
              setIsLoadingAtaDetails(true);
              const ataDetails = await getAtaFullDetails(pedido.ataId);
              if (ataDetails) {
                setSelectedAtaDetails(ataDetails);
                
                // Map items
                const mappedItens = (pedido.itens || []).map(item => {
                  const ataItem = ataDetails.medicamentos.find(m => m.id === item.ataItemId);
                  const saldo = ataItem ? (ataItem.qtdeInicial - ataItem.quantidadeUsada) : null;
                  return {
                    id: item.id,
                    medicamentoId: item.medicamentoId,
                    medicamentoNome: item.medicamentoNome,
                    quantidade: item.quantidade,
                    precoUnitario: item.precoUnitario,
                    valorTotal: item.valorTotal,
                    ataItemId: item.ataItemId,
                    ataSaldo: saldo
                  };
                });
                setAddedItems(mappedItens);
              }
              setIsLoadingAtaDetails(false);
            } else {
              setIsLinkedToAta(false);
              setSelectedFornecedorId(pedido.fornecedorId || '');
              const mappedItens = (pedido.itens || []).map(item => ({
                id: item.id,
                medicamentoId: item.medicamentoId,
                medicamentoNome: item.medicamentoNome,
                quantidade: item.quantidade,
                precoUnitario: item.precoUnitario,
                valorTotal: item.valorTotal,
                ataItemId: null,
                ataSaldo: null
              }));
              setAddedItems(mappedItens);
            }
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        toast.error('Erro ao inicializar formulário.');
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [editId, navigate]);

  useEffect(() => {
    if (!isLinkedToAta || !selectedAtaId) {
      Promise.resolve().then(() => {
        setSelectedAtaDetails(null);
      });
      return;
    }
    const loadAtaDetails = async () => {
      try {
        setIsLoadingAtaDetails(true);
        const data = await getAtaFullDetails(selectedAtaId);
        setSelectedAtaDetails(data);
        // Clear items if changing ATA
        if (!isEditMode) {
          setAddedItems([]);
        }
      } catch (err) {
        console.error(err);
        toast.error('Erro ao carregar detalhes da ATA.');
      } finally {
        setIsLoadingAtaDetails(false);
      }
    };
    loadAtaDetails();
  }, [selectedAtaId, isLinkedToAta, isEditMode]);

  // Handle toggle "Vincular a ATA"
  const handleToggleAta = (val: boolean) => {
    setIsLinkedToAta(val);
    setSelectedAtaId('');
    setSelectedFornecedorId('');
    setSelectedAtaDetails(null);
    setAddedItems([]);
    clearItemForm();
  };

  // Debounced medicine query search
  useEffect(() => {
    if (isLinkedToAta || medQuery.trim().length < 2) {
      const t = setTimeout(() => {
        setMedSearchResults([]);
      }, 0);
      return () => clearTimeout(t);
    }

    const handler = setTimeout(async () => {
      try {
        setSearchingMed(true);
        const results = await buscarCatmat(medQuery);
        setMedSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchingMed(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [medQuery, isLinkedToAta]);

  // Close autocomplete dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setMedSearchResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-fill price and clear inputs when selected ATA medicine changes
  const handleAtaMedicineChange = (medId: string) => {
    setSelectedAtaMedicamentoId(medId);
    if (!medId || !selectedAtaDetails) {
      setItemPrice(0);
      return;
    }
    const med = selectedAtaDetails.medicamentos.find((m: MedicamentoAta) => m.id === medId);
    if (med) {
      setItemPrice(med.precoUnitario);
    }
  };

  const clearItemForm = () => {
    setSelectedAtaMedicamentoId('');
    setMedQuery('');
    setSelectedCatmatMed(null);
    setMedSearchResults([]);
    setItemQuantity(0);
    setItemPrice(0);
  };

  // Add Item handler
  const handleAddItem = () => {
    if (isLinkedToAta) {
      if (!selectedAtaMedicamentoId || !selectedAtaDetails) {
        toast.warning('Selecione um medicamento da ATA.');
        return;
      }
      const med = selectedAtaDetails.medicamentos.find((m: MedicamentoAta) => m.id === selectedAtaMedicamentoId);
      if (!med) return;

      if (itemQuantity <= 0) {
        toast.warning('A quantidade deve ser maior que zero.');
        return;
      }

      // Check if already in list
      if (addedItems.some(i => i.ataItemId === med.id)) {
        toast.warning('Este medicamento já foi adicionado ao pedido.');
        return;
      }

      const saldo = med.qtdeInicial - med.quantidadeUsada;

      const newItem: LocalItem = {
        medicamentoId: med.catmatCodigo || null,
        medicamentoNome: med.nome,
        quantidade: itemQuantity,
        precoUnitario: med.precoUnitario,
        valorTotal: itemQuantity * med.precoUnitario,
        ataItemId: med.id,
        ataSaldo: saldo
      };

      setAddedItems(prev => [...prev, newItem]);
      clearItemForm();
      toast.success('Medicamento adicionado!');
    } else {
      if (!selectedCatmatMed) {
        toast.warning('Busque e selecione um medicamento do CATMAT.');
        return;
      }
      if (itemQuantity <= 0) {
        toast.warning('A quantidade deve ser maior que zero.');
        return;
      }
      if (itemPrice <= 0) {
        toast.warning('O preço unitário deve ser maior que zero.');
        return;
      }

      if (addedItems.some(i => i.medicamentoId === selectedCatmatMed.id)) {
        toast.warning('Este medicamento já foi adicionado ao pedido.');
        return;
      }

      const newItem: LocalItem = {
        medicamentoId: selectedCatmatMed.id,
        medicamentoNome: selectedCatmatMed.descricao,
        quantidade: itemQuantity,
        precoUnitario: itemPrice,
        valorTotal: itemQuantity * itemPrice,
        ataItemId: null,
        ataSaldo: null
      };

      setAddedItems(prev => [...prev, newItem]);
      clearItemForm();
      toast.success('Medicamento adicionado!');
    }
  };

  // Remove Item handler
  const handleRemoveItem = (index: number) => {
    setAddedItems(prev => prev.filter((_, i) => i !== index));
    toast.info('Medicamento removido.');
  };

  // Calculate live values
  const totalPedido = useMemo(() => {
    return addedItems.reduce((acc, curr) => acc + curr.valorTotal, 0);
  }, [addedItems]);

  // Check if justification is required:
  // If linked to ATA and any item quantity exceeds available balance
  const requiresJustification = useMemo(() => {
    if (!isLinkedToAta) return false;
    return addedItems.some(item => {
      if (item.ataSaldo === null || item.ataSaldo === undefined) return false;
      return item.quantidade > item.ataSaldo;
    });
  }, [addedItems, isLinkedToAta]);

  // Remaining ATA balance
  const ataSaldoGeral = useMemo(() => {
    if (!isLinkedToAta || !selectedAtaDetails) return 0;
    const totalAta = selectedAtaDetails.valorTeto;
    const consumidoAta = selectedAtaDetails.valorConsumido || 0;
    
    // In edit mode, we exclude the original total of this order since it's already there
    return totalAta - consumidoAta;
  }, [selectedAtaDetails, isLinkedToAta]);

  // Form submission handler
  const handleSubmitForm = async (status: 'RASCUNHO' | 'PENDENTE') => {
    if (addedItems.length === 0) {
      toast.warning('Adicione pelo menos um medicamento ao pedido.');
      return;
    }

    if (isLinkedToAta && !selectedAtaId) {
      toast.warning('Selecione uma ATA.');
      return;
    }

    if (!isLinkedToAta && !selectedFornecedorId) {
      toast.warning('Selecione um fornecedor.');
      return;
    }

    // Check justification length if required
    if (requiresJustification && justificativa.trim().length < 15) {
      toast.warning('Justificativa detalhada é obrigatória (mínimo de 15 caracteres) pois há itens excedendo o saldo da ATA.');
      return;
    }

    // Check teto of ATA
    if (isLinkedToAta && totalPedido > ataSaldoGeral) {
      toast.error('O valor total do pedido excede o saldo financeiro disponível na ATA.');
      return;
    }

    const resolvedFornecedor = isLinkedToAta 
      ? selectedAtaDetails?.fornecedorId 
      : selectedFornecedorId;

    const payload = {
      ataId: isLinkedToAta ? selectedAtaId : null,
      fornecedorId: resolvedFornecedor,
      status,
      dataSolicitacao: new Date(dataSolicitacao).toISOString(),
      itens: addedItems.map(item => ({
        medicamentoId: item.medicamentoId,
        medicamentoNome: item.medicamentoNome,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        ataItemId: item.ataItemId
      })),
      justificativa: justificativa.trim() || undefined
    };

    try {
      setIsSubmitting(true);
      if (isEditMode && editId) {
        await updatePedido(editId, payload);
        toast.success(status === 'RASCUNHO' ? 'Rascunho atualizado!' : 'Pedido enviado com sucesso!');
      } else {
        await createPedido(payload);
        toast.success(status === 'RASCUNHO' ? 'Rascunho criado!' : 'Pedido enviado com sucesso!');
      }
      navigate('/pedidos');
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { error?: string } } };
      const errMsg = axiosError.response?.data?.error || 'Erro ao salvar o pedido de compra.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Find info about the selected ATA medicine to show details
  const selectedAtaMedInfo = useMemo(() => {
    if (!selectedAtaMedicamentoId || !selectedAtaDetails) return null;
    return selectedAtaDetails.medicamentos.find((m: MedicamentoAta) => m.id === selectedAtaMedicamentoId);
  }, [selectedAtaMedicamentoId, selectedAtaDetails]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
        <span className="text-gray-500 font-medium">Carregando formulário...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/pedidos" className="hover:text-blue-600 transition-colors">Pedidos</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{isEditMode ? 'Editar Pedido' : 'Novo Pedido'}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-blue-600" />
            {isEditMode ? `Editar Pedido - ${pcdNumber}` : 'Criar Novo Pedido de Compra'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Preencha os dados abaixo para gerar um novo pedido. Pedidos vinculados a ATA reduzem saldos automaticamente.
          </p>
        </div>
        <Link 
          to="/pedidos" 
          className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: General Info & Medicine Selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Cabeçalho do Pedido */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Informações Gerais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data Solicitação */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Data do Pedido *</label>
                <input 
                  type="date"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  value={dataSolicitacao}
                  onChange={(e) => setDataSolicitacao(e.target.value)}
                />
              </div>

              {/* Toggle Vincular ATA */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vincular a uma ATA?</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleAta(true)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-all ${
                      isLinkedToAta 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Sim (Recomendado)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleAta(false)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-all ${
                      !isLinkedToAta 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Não
                  </button>
                </div>
              </div>
            </div>

            {/* Conditional selectors */}
            <div className="grid grid-cols-1 gap-4 pt-2">
              {isLinkedToAta ? (
                <>
                  {/* Select ATA */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Selecionar ATA Ativa *</label>
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      value={selectedAtaId}
                      onChange={(e) => setSelectedAtaId(e.target.value)}
                      disabled={isEditMode}
                    >
                      <option value="">Selecione uma ATA da lista...</option>
                      {atas.map(ata => (
                        <option key={ata.id} value={ata.id}>
                          Ata {ata.numero} - {ata.fornecedorNome}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Auto-filled Supplier info */}
                  {selectedAtaDetails && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600 flex justify-between items-center">
                      <div>
                        <span className="font-semibold block text-gray-700">Fornecedor Vinculado:</span>
                        <span>{selectedAtaDetails.fornecedorNome}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold block text-gray-700">Saldo Financeiro ATA:</span>
                        <span className="font-bold text-green-600">{formatCurrency(ataSaldoGeral)}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Select Supplier directly */
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Selecionar Fornecedor *</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    value={selectedFornecedorId}
                    onChange={(e) => setSelectedFornecedorId(e.target.value)}
                    disabled={isEditMode && addedItems.length > 0}
                  >
                    <option value="">Selecione um fornecedor ativo...</option>
                    {fornecedores.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.nomeFantasia || f.razaoSocial} ({f.cnpj})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Adicionar Medicamento */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Adicionar Medicamento</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Medicine field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Medicamento *</label>
                
                {isLinkedToAta ? (
                  /* ATA linked medicine select */
                  <select
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                    value={selectedAtaMedicamentoId}
                    onChange={(e) => handleAtaMedicineChange(e.target.value)}
                    disabled={!selectedAtaId || isLoadingAtaDetails}
                  >
                    <option value="">
                      {!selectedAtaId ? 'Selecione a ATA primeiro...' : 'Selecione o medicamento...'}
                    </option>
                    {selectedAtaDetails?.medicamentos.map((med: MedicamentoAta) => {
                      const saldo = med.qtdeInicial - med.quantidadeUsada;
                      return (
                        <option key={med.id} value={med.id}>
                          {med.nome} (Saldo: {saldo} {med.unidadeAta || 'UN'}) - {formatCurrency(med.precoUnitario)}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  /* Autocomplete CATMAT Medicamentos */
                  <div ref={autocompleteRef} className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="Buscar por nome ou código BR..."
                        className="pl-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                        value={selectedCatmatMed ? selectedCatmatMed.descricao : medQuery}
                        onChange={(e) => {
                          if (selectedCatmatMed) {
                            setSelectedCatmatMed(null);
                            setMedQuery('');
                          } else {
                            setMedQuery(e.target.value);
                          }
                        }}
                      />
                      {searchingMed && (
                        <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-blue-500 animate-spin" />
                      )}
                    </div>

                    {/* Results Dropdown */}
                    {!selectedCatmatMed && medSearchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100 text-xs">
                        {medSearchResults.map(med => (
                          <button
                            key={med.id}
                            type="button"
                            onClick={() => {
                              setSelectedCatmatMed(med);
                              setMedSearchResults([]);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors block"
                          >
                            <span className="font-semibold text-gray-900 block">{med.descricao}</span>
                            <span className="text-[10px] text-gray-500 block">BR: {med.codigoBr} | {med.unidadeFornecimento}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Medicine details if selected (shows Saldo and pricing) */}
              <div className="md:col-span-1 flex flex-col justify-end">
                {isLinkedToAta && selectedAtaMedInfo && (
                  <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg text-xs space-y-1 text-blue-800">
                    <div className="flex justify-between">
                      <span>Saldo:</span>
                      <span className="font-bold">
                        {(selectedAtaMedInfo.qtdeInicial - selectedAtaMedInfo.quantidadeUsada).toLocaleString('pt-BR')} {selectedAtaMedInfo.unidadeAta || 'UN'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Preço Licitado:</span>
                      <span className="font-bold">{formatCurrency(selectedAtaMedInfo.precoUnitario)}</span>
                    </div>
                  </div>
                )}
                {!isLinkedToAta && selectedCatmatMed && (
                  <div className="p-2 bg-green-50 border border-green-100 rounded-lg text-xs text-green-800">
                    <span className="font-semibold block">Item Selecionado:</span>
                    <span className="block truncate">{selectedCatmatMed.unidadeFornecimento}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantidade *</label>
                <input 
                  type="number"
                  min="1"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  value={itemQuantity || ''}
                  onChange={(e) => setItemQuantity(Number(e.target.value))}
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preço Unitário *</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                  value={itemPrice || ''}
                  onChange={(e) => setItemPrice(Number(e.target.value))}
                  disabled={isLinkedToAta}
                />
              </div>

              {/* Total Item Calculation */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 active:scale-95 transition-all cursor-pointer h-[38px]"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Item
                </button>
              </div>
            </div>

            {/* Real-time total for adding item */}
            {itemQuantity > 0 && itemPrice > 0 && (
              <div className="text-xs text-gray-500 text-right font-medium">
                Total do Item: <span className="text-gray-900 font-bold">{formatCurrency(itemQuantity * itemPrice)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Resumo do Carrinho / Lançamentos */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-full space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Resumo Financeiro</h3>
              <div className="space-y-4 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Qtd de Itens:</span>
                  <span className="font-semibold text-gray-900">{addedItems.length}</span>
                </div>

                {isLinkedToAta && selectedAtaDetails && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Saldo da ATA:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(ataSaldoGeral)}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-900 font-bold">Total Geral:</span>
                    <span className="text-xl font-extrabold text-blue-600">{formatCurrency(totalPedido)}</span>
                  </div>
                  {isLinkedToAta && selectedAtaDetails && totalPedido > ataSaldoGeral && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      ⚠️ O total excede o saldo financeiro da ATA!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submission triggers */}
            <div className="space-y-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleSubmitForm('RASCUNHO')}
                disabled={isSubmitting || addedItems.length === 0}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4 text-gray-500" />
                Salvar como Rascunho
              </button>
              <button
                type="button"
                onClick={() => handleSubmitForm('PENDENTE')}
                disabled={isSubmitting || addedItems.length === 0 || (isLinkedToAta && totalPedido > ataSaldoGeral)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Enviar Pedido de Compra
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Added Items List Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-gray-900">Medicamentos Incluídos no Pedido</h3>
          <span className="text-xs text-gray-500">{addedItems.length} item(ns)</span>
        </div>

        {addedItems.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <Info className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <h4 className="text-sm font-semibold text-gray-700">Nenhum medicamento adicionado</h4>
            <p className="text-xs text-gray-500 mt-1">Preencha o formulário acima e clique em "Adicionar Item".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Medicamento</th>
                  <th className="px-4 py-3 text-right">Qtd Solicitada</th>
                  <th className="px-4 py-3 text-right">Preço Unitário</th>
                  <th className="px-4 py-3 text-right">Valor Total</th>
                  {isLinkedToAta && <th className="px-4 py-3 text-right">Saldo ATA</th>}
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {addedItems.map((item, index) => {
                  const exceedsBalance = isLinkedToAta && item.ataSaldo !== null && item.ataSaldo !== undefined && item.quantidade > item.ataSaldo;
                  
                  return (
                    <tr key={index} className={`hover:bg-gray-50 ${exceedsBalance ? 'bg-amber-50/50' : ''}`}>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-gray-900 block">{item.medicamentoNome}</span>
                        <span className="text-[10px] text-gray-400 block">ID: {item.medicamentoId || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-gray-950">
                        {item.quantidade.toLocaleString('pt-BR')}
                        {exceedsBalance && (
                          <span className="ml-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold border border-amber-100 inline-flex items-center gap-0.5" title="Excede o saldo do item na ATA">
                            <AlertTriangle className="w-3 h-3" />
                            Excede
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">{formatCurrency(item.precoUnitario)}</td>
                      <td className="px-4 py-3.5 text-right font-bold text-gray-900">{formatCurrency(item.valorTotal)}</td>
                      {isLinkedToAta && (
                        <td className={`px-4 py-3.5 text-right font-semibold ${exceedsBalance ? 'text-amber-600' : 'text-gray-600'}`}>
                          {item.ataSaldo !== null && item.ataSaldo !== undefined 
                            ? `${item.ataSaldo.toLocaleString('pt-BR')} UN` 
                            : 'N/A'}
                        </td>
                      )}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Conditional Justification Field */}
      {requiresJustification && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-800">Justificativa de Excesso Obrigatória</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Um ou mais medicamentos inseridos excedem o saldo inicial licitado na ATA. O sistema permite o envio (soft-limit), mas exige uma justificativa técnica formal (mínimo de 15 caracteres) para auditoria de controle.
              </p>
            </div>
          </div>

          <div>
            <textarea
              rows={3}
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
              placeholder="Descreva detalhadamente o motivo da compra com quantidade excedente ao saldo licitado da ATA..."
            />
            <div className="flex justify-between items-center text-[10px] text-amber-700 font-medium mt-1">
              <span>Mínimo exigido: 15 caracteres</span>
              <span className={justificativa.trim().length >= 15 ? 'text-green-600 font-bold' : 'text-amber-600'}>
                {justificativa.trim().length} / 15 caracteres
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
