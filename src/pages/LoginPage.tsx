import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Eye, EyeOff, Loader2, ArrowLeft, Building2, User } from 'lucide-react';
import apiClient from '../services/apiClient';

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Login States
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');

  // Register States
  const [regNome, setRegNome] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'COMPRADOR' | 'FORNECEDOR'>('COMPRADOR');
  const [regPerfil, setRegPerfil] = useState('SECRETARIO_SAUDE');
  const [regJustificativa, setRegJustificativa] = useState('');
  const [regFornecedorId, setRegFornecedorId] = useState('');
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [isRegLoading, setIsRegLoading] = useState(false);

  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    async function loadFornecedores() {
      try {
        const response = await apiClient.get('/auth/fornecedores');
        setFornecedores(response.data);
        if (response.data.length > 0) {
          setRegFornecedorId(response.data[0].id);
        }
      } catch (err) {
        console.error('Erro ao carregar fornecedores públicos:', err);
      }
    }
    loadFornecedores();
  }, []);

  const formatCPF = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleRegCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegCpf(formatCPF(e.target.value));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) {
      setErrorMsg('CPF inválido. O CPF deve conter 11 dígitos.');
      return;
    }

    try {
      await login({ cpf: cleanCPF, password });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Falha na autenticação. Verifique suas credenciais.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanCPF = regCpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) {
      setErrorMsg('CPF inválido. O CPF deve conter 11 dígitos.');
      return;
    }

    const payload: any = {
      nome: regNome,
      cpf: cleanCPF,
      email: regEmail || undefined,
      password: regPassword,
      role: regRole,
    };

    if (regRole === 'COMPRADOR') {
      payload.perfil = regPerfil;
      payload.justificativa = regJustificativa;
    } else {
      if (!regFornecedorId) {
        setErrorMsg('Selecione o fornecedor correspondente.');
        return;
      }
      payload.fornecedorId = regFornecedorId;
    }

    setIsRegLoading(true);
    try {
      await apiClient.post('/auth/solicitar-acesso', payload);
      setIsSuccess(true);
      // Reset forms
      setRegNome('');
      setRegCpf('');
      setRegEmail('');
      setRegPassword('');
      setRegJustificativa('');
      if (fornecedores.length > 0) {
        setRegFornecedorId(fornecedores[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Não foi possível enviar a solicitação. Tente novamente.');
    } finally {
      setIsRegLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Coluna da Esquerda (Azul) */}
      <div className="relative hidden md:flex md:w-[40%] bg-blue-600 text-white flex-col justify-center p-16 overflow-hidden">
        {/* Círculos e curvas decorativas da imagem */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full border-2 border-white/5 pointer-events-none" />
        <div className="absolute bottom-[5%] right-[5%] w-[45%] aspect-square rounded-full border-2 border-white/5 pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[35%] aspect-square rounded-full bg-white/5 pointer-events-none" />
        
        <div className="relative z-10 space-y-8 select-none">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-lg border border-white/20">
              <Shield className="h-11 w-11 text-white stroke-[1.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold tracking-tight leading-none">Vigia Saúde</span>
              <span className="text-sm text-blue-200 mt-2 font-medium">Sistema de Compras de Medicamentos</span>
            </div>
          </div>
          <p className="text-xl text-blue-100 font-medium max-w-sm leading-relaxed border-t border-white/10 pt-6">
            Transparência nas compras públicas de medicamentos
          </p>
        </div>
      </div>

      {/* Coluna da Direita (Branca - Formulários) */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-300">
          
          {errorMsg && (
            <div className="p-4 text-sm bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {errorMsg}
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Shield className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Solicitação Enviada!</h2>
                <p className="text-sm text-gray-500">
                  Seu cadastro foi salvo com status <strong>PENDENTE</strong>. O Secretário de Saúde receberá a solicitação para avaliar e conceder as permissões necessárias.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setIsRegistering(false);
                }}
                className="w-full flex justify-center rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-all"
              >
                Voltar para o Login
              </button>
            </div>
          ) : !isRegistering ? (
            /* ================= LOGIN FORM ================= */
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Acesse sua conta</h2>
                <p className="mt-2 text-sm text-gray-500">Informe suas credenciais para acessar o portal.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label htmlFor="cpf" className="block text-sm font-semibold text-gray-700">
                    CPF
                  </label>
                  <div className="mt-1.5 relative">
                    <input
                      id="cpf"
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={handleCpfChange}
                      className="block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                      Senha
                    </label>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Por favor, entre em contato com a Secretaria de Saúde para redefinir sua senha.');
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Esqueci minha senha
                    </a>
                  </div>
                  <div className="mt-1.5 relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-4 pr-11 py-3 text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-70 transition-all cursor-pointer mt-6"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Entrar'}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setIsRegistering(true);
                    setErrorMsg(null);
                  }}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Fazer cadastro
                </button>
              </div>
            </div>
          ) : (
            /* ================= REGISTER FORM ================= */
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsRegistering(false)}
                  className="p-2 -ml-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900">Solicitar acesso</h2>
                  <p className="text-xs text-gray-500">Preencha o formulário para cadastro no sistema.</p>
                </div>
              </div>

              {/* Seletor de Perfil Comprador / Fornecedor */}
              <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRegRole('COMPRADOR')}
                  className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    regRole === 'COMPRADOR'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Comprador
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('FORNECEDOR')}
                  className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    regRole === 'FORNECEDOR'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Fornecedor
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reg-nome" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Nome Completo
                  </label>
                  <input
                    id="reg-nome"
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={regNome}
                    onChange={(e) => setRegNome(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-cpf" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      CPF
                    </label>
                    <input
                      id="reg-cpf"
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={regCpf}
                      onChange={handleRegCpfChange}
                      className="mt-1 block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      E-mail (Opcional)
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      placeholder="exemplo@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-pass" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Senha (mínimo 8 caracteres)
                  </label>
                  <input
                    id="reg-pass"
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm"
                  />
                </div>

                {regRole === 'COMPRADOR' ? (
                  <>
                    <div>
                      <label htmlFor="reg-perfil" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Perfil Solicitado
                      </label>
                      <select
                        id="reg-perfil"
                        value={regPerfil}
                        onChange={(e) => setRegPerfil(e.target.value)}
                        className="mt-1 block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm"
                      >
                        <option value="SECRETARIO_SAUDE">Secretário de Saúde</option>
                        <option value="GESTOR_ESTOQUE">Gestor de Estoque</option>
                        <option value="FARMACIA">Farmácia</option>
                        <option value="MEDICO">Médico</option>
                        <option value="ENTREGADOR">Entregador</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="reg-just" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Justificativa de Acesso (mínimo 10 caracteres)
                      </label>
                      <textarea
                        id="reg-just"
                        required
                        minLength={10}
                        rows={3}
                        placeholder="Descreva o motivo de solicitar o acesso ao sistema..."
                        value={regJustificativa}
                        onChange={(e) => setRegJustificativa(e.target.value)}
                        className="mt-1 block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm placeholder:text-gray-400"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label htmlFor="reg-forn" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Empresa / Fornecedor Vinculado
                    </label>
                    <select
                      id="reg-forn"
                      required
                      value={regFornecedorId}
                      onChange={(e) => setRegFornecedorId(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm"
                    >
                      {fornecedores.length === 0 ? (
                        <option value="">Carregando fornecedores...</option>
                      ) : (
                        fornecedores.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.nomeFantasia} ({f.cnpj})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isRegLoading}
                  className="w-full flex justify-center items-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-70 transition-all cursor-pointer mt-6"
                >
                  {isRegLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enviar Solicitação'}
                </button>
              </form>

              <div className="text-center pt-1">
                <button
                  onClick={() => setIsRegistering(false)}
                  className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Voltar para o Login
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
