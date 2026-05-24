import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import { Check, X, Loader2, Calendar, User, Building2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface PendingUser {
  id: string;
  nome: string;
  cpf: string;
  email: string | null;
  role: 'COMPRADOR' | 'FORNECEDOR';
  perfil: 'SECRETARIO_SAUDE' | 'GESTOR_ESTOQUE' | 'FARMACIA' | 'MEDICO' | 'ENTREGADOR' | null;
  justificativa: string | null;
  fornecedorId: string | null;
  fornecedor?: {
    nomeFantasia: string;
  } | null;
  criadoEm: string;
}

interface Unidade {
  id: string;
  nome: string;
  cnes: string | null;
  tenant_schema: string;
  ativa: boolean;
}

export function SolicitacoesMembro() {
  const { user } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState<PendingUser[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal States
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form States - Approval
  const [selectedUnidadeId, setSelectedUnidadeId] = useState('');
  const [approvePerfil, setApprovePerfil] = useState('');
  const [permissoesExtras, setPermissoesExtras] = useState({
    verAuditoria: false,
    gerenciarAtas: false,
    gerenciarFornecedores: false,
  });

  // Form States - Rejection
  const [motivoRecusa, setMotivoRecusa] = useState('');

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const resPendentes = await apiClient.get<PendingUser[]>('/auth/pendentes');
      setSolicitacoes(resPendentes.data);

      const resUnidades = await apiClient.get<Unidade[]>('/unidades');
      setUnidades(resUnidades.data);
    } catch (err: any) {
      console.error('Erro ao buscar dados do Hub de Aprovação:', err);
      setErrorMsg('Não foi possível carregar as solicitações pendentes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCPF = (c: string | null) => {
    if (!c) return '';
    return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPerfilLabel = (p: string | null) => {
    switch (p) {
      case 'SECRETARIO_SAUDE':
        return 'Secretário de Saúde';
      case 'GESTOR_ESTOQUE':
        return 'Gestor de Estoque';
      case 'FARMACIA':
        return 'Farmácia / Dispensa';
      case 'MEDICO':
        return 'Médico Prescritor';
      case 'ENTREGADOR':
        return 'Entregador';
      default:
        return '-';
    }
  };

  const handleOpenApproveModal = (u: PendingUser) => {
    setSelectedUser(u);
    setApprovePerfil(u.perfil || 'GESTOR_ESTOQUE');
    if (unidades.length > 0) {
      setSelectedUnidadeId(unidades[0].id);
    } else {
      setSelectedUnidadeId('');
    }
    setPermissoesExtras({
      verAuditoria: u.perfil === 'SECRETARIO_SAUDE',
      gerenciarAtas: u.perfil === 'SECRETARIO_SAUDE' || u.perfil === 'GESTOR_ESTOQUE',
      gerenciarFornecedores: u.perfil === 'SECRETARIO_SAUDE',
    });
    setShowApproveModal(true);
  };

  const handleOpenRejectModal = (u: PendingUser) => {
    setSelectedUser(u);
    setMotivoRecusa('');
    setShowRejectModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const selectedUnidade = unidades.find((u) => u.id === selectedUnidadeId);

    const payload: any = {};
    if (selectedUser.role === 'COMPRADOR') {
      payload.perfil = approvePerfil;
      payload.unidadeId = selectedUnidadeId;
      payload.tenantSchema = selectedUnidade?.tenant_schema;
      payload.permissoesExtras = {
        ver_auditoria: permissoesExtras.verAuditoria,
        gerenciar_atas: permissoesExtras.gerenciarAtas,
        gerenciar_fornecedores: permissoesExtras.gerenciarFornecedores,
      };
    }

    try {
      await apiClient.post(`/auth/aprovar/${selectedUser.id}`, payload);
      setSuccessMsg(`Usuário "${selectedUser.nome}" aprovado com sucesso.`);
      setShowApproveModal(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Erro ao aprovar usuário.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedUser || motivoRecusa.trim().length < 5) return;
    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await apiClient.post(`/auth/recusar/${selectedUser.id}`, { motivoRecusa });
      setSuccessMsg(`Solicitação de "${selectedUser.nome}" recusada com sucesso.`);
      setShowRejectModal(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Erro ao recusar usuário.');
    } finally {
      setActionLoading(false);
    }
  };

  if (user?.role !== 'COMPRADOR' || user?.perfil !== 'SECRETARIO_SAUDE') {
    return (
      <div className="flex h-96 flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Acesso Restrito</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md">
          Apenas o Secretário de Saúde (Administrador) tem acesso ao Hub de Aprovação de novos usuários do sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Solicitações de Acesso</h1>
        <p className="mt-1 text-sm text-gray-500">Aprove ou recuse os novos cadastros solicitados no portal.</p>
      </div>

      {errorMsg && (
        <div className="p-4 text-sm bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 text-sm bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center bg-white border border-gray-200 rounded-xl">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs text-gray-400 font-bold uppercase border-b border-gray-150">
                <tr>
                  <th scope="col" className="px-6 py-4">Solicitante</th>
                  <th scope="col" className="px-6 py-4">Tipo</th>
                  <th scope="col" className="px-6 py-4">Vínculo Pedido</th>
                  <th scope="col" className="px-6 py-4">Justificativa</th>
                  <th scope="col" className="px-6 py-4">Data Solicitação</th>
                  <th scope="col" className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {solicitacoes.length > 0 ? (
                  solicitacoes.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{item.nome}</span>
                          <span className="text-xs text-gray-400 mt-0.5">CPF: {formatCPF(item.cpf)}</span>
                          <span className="text-xs text-gray-400">{item.email || 'Nenhum e-mail informado'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.role === 'COMPRADOR' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            <User className="w-3.5 h-3.5" />
                            Comprador
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                            <Building2 className="w-3.5 h-3.5" />
                            Fornecedor
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.role === 'COMPRADOR' ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">
                              {getPerfilLabel(item.perfil)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">
                              {item.fornecedor?.nomeFantasia || 'Fornecedor Vinculado'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate" title={item.justificativa || ''}>
                        <span className="text-gray-500 italic">
                          {item.justificativa ? `"${item.justificativa}"` : 'Sem justificativa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.criadoEm)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenApproveModal(item)}
                            className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-100"
                            title="Aprovar Solicitação"
                          >
                            <Check className="w-4.5 h-4.5 stroke-[2.5]" />
                          </button>
                          <button
                            onClick={() => handleOpenRejectModal(item)}
                            className="inline-flex items-center justify-center p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer border border-rose-100"
                            title="Recusar Solicitação"
                          >
                            <X className="w-4.5 h-4.5 stroke-[2.5]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      Nenhuma solicitação de acesso pendente no momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL DE APROVAÇÃO ================= */}
      {showApproveModal && selectedUser && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-6 animate-in scale-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Aprovar Cadastro</h3>
              <p className="text-sm text-gray-500">Defina o vínculo e as permissões para <strong>{selectedUser.nome}</strong>.</p>
            </div>

            {selectedUser.role === 'COMPRADOR' ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="modal-unidade" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Secretaria / Unidade de Origem
                  </label>
                  <select
                    id="modal-unidade"
                    value={selectedUnidadeId}
                    onChange={(e) => setSelectedUnidadeId(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm"
                  >
                    {unidades.length === 0 ? (
                      <option value="">Nenhuma unidade disponível</option>
                    ) : (
                      unidades.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome} ({u.cnes || 'Sem CNES'})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="modal-perfil" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Perfil Definido
                    </label>
                    <select
                      id="modal-perfil"
                      value={approvePerfil}
                      onChange={(e) => setApprovePerfil(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm"
                    >
                      <option value="SECRETARIO_SAUDE">Secretário de Saúde</option>
                      <option value="GESTOR_ESTOQUE">Gestor de Estoque</option>
                      <option value="FARMACIA">Farmácia / Dispensa</option>
                      <option value="MEDICO">Médico</option>
                      <option value="ENTREGADOR">Entregador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Tenant Schema
                    </label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={unidades.find((u) => u.id === selectedUnidadeId)?.tenant_schema || '-'}
                      className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Permissões Adicionais (Extras)
                  </span>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissoesExtras.verAuditoria}
                        onChange={(e) => setPermissoesExtras({ ...permissoesExtras, verAuditoria: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Visualizar Logs de Auditoria
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissoesExtras.gerenciarAtas}
                        onChange={(e) => setPermissoesExtras({ ...permissoesExtras, gerenciarAtas: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Gerenciar ATAs de Preços
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissoesExtras.gerenciarFornecedores}
                        onChange={(e) => setPermissoesExtras({ ...permissoesExtras, gerenciarFornecedores: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Gerenciar Fornecedores
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Cadastro de Fornecedor</p>
                  <p className="mt-1">
                    Este usuário será associado diretamente à empresa fornecedora <strong>{selectedUser.fornecedor?.nomeFantasia}</strong>. Não é necessário atribuir perfil ou unidade interna da secretaria de saúde para fornecedores.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={actionLoading || (selectedUser.role === 'COMPRADOR' && !selectedUnidadeId)}
                onClick={handleApproveConfirm}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Aprovação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DE RECUSA ================= */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-6 animate-in scale-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recusar Solicitação</h3>
              <p className="text-sm text-gray-500">Informe o motivo da recusa para <strong>{selectedUser.nome}</strong>.</p>
            </div>

            <div>
              <label htmlFor="modal-motivo" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Motivo da Recusa (mínimo 5 caracteres)
              </label>
              <textarea
                id="modal-motivo"
                required
                rows={4}
                value={motivoRecusa}
                onChange={(e) => setMotivoRecusa(e.target.value)}
                placeholder="Ex: CPF informado não confere com os registros oficiais..."
                className="mt-1 block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={actionLoading || motivoRecusa.trim().length < 5}
                onClick={handleRejectConfirm}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Recusa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Exportação padrão com o nome correto usado na rota
export default SolicitacoesMembro;
