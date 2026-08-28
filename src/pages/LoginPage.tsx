import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { formatCPF } from '../lib/utils';
import { ForgotPasswordModal } from '../components/Auth/ForgotPasswordModal';
import { RegisterForm } from '../components/Auth/RegisterForm';

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Login States
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');

  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.perfil === 'GESTOR_ESTOQUE') {
        navigate('/cd/dashboard');
      } else if (user.perfil === 'FARMACIA') {
        navigate('/farmacia/dashboard');
      } else if (user.perfil === 'POSTO_SAUDE') {
        navigate('/posto/dashboard');
      } else if (user.perfil === 'ENTREGADOR') {
        navigate('/motorista/dashboard');
      } else if (user.perfil === 'REGULADOR') {
        navigate('/regulador/fila');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
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
      const backendError = err.response?.data?.error || err.response?.data?.erro;
      if (backendError) {
        setErrorMsg(backendError);
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setErrorMsg('Erro de conexão: Não foi possível conectar ao servidor. Verifique a URL da API ou o status do Railway.');
      } else if (err.response?.status === 404) {
        setErrorMsg('Servidor não encontrado (404). Verifique a URL do backend.');
      } else {
        setErrorMsg(err.message || 'Falha na autenticação. Verifique suas credenciais.');
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Coluna da Esquerda (Azul) */}
      <div className="relative hidden md:flex md:w-[40%] bg-blue-600 text-white flex-col justify-center p-16 overflow-hidden">
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
                        setShowForgotModal(true);
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
            <RegisterForm
              onBackToLogin={() => {
                setIsRegistering(false);
                setErrorMsg(null);
              }}
              onSuccess={() => {
                setIsSuccess(true);
                setErrorMsg(null);
              }}
              onError={(msg) => setErrorMsg(msg)}
            />
          )}

        </div>
      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onSuccessLogin={(newCpf) => {
          setCpf(newCpf);
        }}
      />
    </div>
  );
}
