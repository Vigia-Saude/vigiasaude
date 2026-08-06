import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Eye, EyeOff, Loader2, ArrowLeft, Building2, User, Mail, Phone, KeyRound, CheckCircle2, X } from 'lucide-react';
import apiClient from '../services/apiClient';
import { formatCPF, formatPhone } from '../lib/utils';


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
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegValidation, setShowRegValidation] = useState(false);
  const [regPerfil, setRegPerfil] = useState('RECEPCIONISTA_UBS');
  const [regJustificativa, setRegJustificativa] = useState('');
  const [isRegLoading, setIsRegLoading] = useState(false);

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotCpf, setForgotCpf] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

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

  const handleRegCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegCpf(formatCPF(e.target.value));
  };

  const handleRegPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegPhone(formatPhone(e.target.value));
  };

  // ========== FORGOT PASSWORD HANDLERS ==========

  const resetForgotModal = useCallback(() => {
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotCpf('');
    setForgotError(null);
    setForgotSuccess(null);
    setMaskedEmail(null);
    setMaskedPhone(null);
    setOtpCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setOtpTimer(0);
    setCanResend(false);
  }, []);

  // Timer countdown for OTP
  useEffect(() => {
    if (otpTimer <= 0) {
      if (forgotStep === 2) setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setOtpTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer, forgotStep]);

  const handleForgotPasswordSubmit = async () => {
    const cleanCPF = forgotCpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) {
      setForgotError('CPF inválido. O CPF deve conter 11 dígitos.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    try {
      const res = await apiClient.post('/auth/forgot-password', { cpf: cleanCPF });
      setMaskedEmail(res.data.email);
      setMaskedPhone(res.data.telefone);
      setForgotStep(2);
      setOtpTimer(900); // 15 min
      setCanResend(false);
    } catch (err: any) {
      setForgotError(err.response?.data?.error || 'Erro ao enviar código. Tente novamente.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    setCanResend(false);
    setForgotLoading(true);
    setForgotError(null);
    try {
      const cleanCPF = forgotCpf.replace(/\D/g, '');
      await apiClient.post('/auth/forgot-password', { cpf: cleanCPF });
      setOtpTimer(900);
      setForgotSuccess('Novo código enviado!');
      setTimeout(() => setForgotSuccess(null), 3000);
    } catch (err: any) {
      setForgotError(err.response?.data?.error || 'Erro ao reenviar código.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (otpCode.length !== 6) {
      setForgotError('Digite o código de 6 dígitos.');
      return;
    }
    if (newPassword.length < 8) {
      setForgotError('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('As senhas não coincidem.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    try {
      const cleanCPF = forgotCpf.replace(/\D/g, '');
      await apiClient.post('/auth/reset-password', {
        cpf: cleanCPF,
        codigo: otpCode,
        novaSenha: newPassword,
      });
      setForgotStep(3);
      setForgotSuccess('Senha redefinida com sucesso!');
    } catch (err: any) {
      setForgotError(err.response?.data?.error || 'Erro ao redefinir senha.');
    } finally {
      setForgotLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
    setShowRegValidation(true);

    const cleanCPF = regCpf.replace(/\D/g, '');
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail);
    const isJustificativaValid = regJustificativa.trim().length >= 30;

    if (!regNome.trim() || cleanCPF.length !== 11 || !isEmailValid || regPassword.length < 8 || regPassword !== regConfirmPassword || !isJustificativaValid) {
      if (regPassword.length < 8) {
        setErrorMsg('A senha precisa ter no mínimo 8 caracteres.');
      } else if (regPassword !== regConfirmPassword) {
        setErrorMsg('As senhas não coincidem.');
      } else if (!isEmailValid) {
        setErrorMsg('Por favor, informe um e-mail válido.');
      } else if (!isJustificativaValid) {
        setErrorMsg('A justificativa de acesso deve conter pelo menos 30 caracteres.');
      } else {
        setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      }
      return;
    }

    const payload = {
      nome: regNome,
      cpf: cleanCPF,
      email: regEmail,
      telefone: regPhone.replace(/\D/g, '') || undefined,
      password: regPassword,
      role: 'COMPRADOR' as const,
      perfil: regPerfil,
      justificativa: regJustificativa,
    };

    setIsRegLoading(true);
    try {
      await apiClient.post('/auth/solicitar-acesso', payload);
      setIsSuccess(true);
      // Reset forms
      setRegNome('');
      setRegCpf('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegJustificativa('');
      setShowRegValidation(false);
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
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsRegistering(false);
                    setShowRegValidation(false);
                  }}
                  className="p-2 -ml-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900">Solicitar acesso</h2>
                  <p className="text-xs text-gray-500">Preencha o formulário para cadastro no sistema.</p>
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {(() => {
                  const cleanCPF = regCpf.replace(/\D/g, '');
                  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail);
                  const isNomeInvalid = showRegValidation && !regNome.trim();
                  const isCpfInvalid = showRegValidation && cleanCPF.length !== 11;
                  const isEmailInvalid = showRegValidation && !isEmailValid;
                  const isPasswordInvalid = showRegValidation && regPassword.length < 8;
                  const isConfirmPasswordInvalid = showRegValidation && regConfirmPassword !== regPassword;
                  const isJustificativaInvalid = showRegValidation && regJustificativa.trim().length < 30;

                  const inputClass = (isInvalid: boolean) =>
                    `mt-1 block w-full rounded-xl border px-4 py-2.5 text-gray-900 transition-all focus:bg-white focus:ring-4 sm:text-sm ${
                      isInvalid
                        ? 'border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500/10'
                        : 'border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-blue-500/10'
                    }`;

                  return (
                    <>
                      <div>
                        <label htmlFor="reg-nome" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Nome Completo *
                        </label>
                        <input
                          id="reg-nome"
                          type="text"
                          required
                          placeholder="Ex: João da Silva"
                          value={regNome}
                          onChange={(e) => setRegNome(e.target.value)}
                          className={inputClass(isNomeInvalid)}
                        />
                        {isNomeInvalid && (
                          <p className="mt-1 text-xs text-red-500 font-medium">Nome completo é obrigatório.</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="reg-cpf" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            CPF *
                          </label>
                          <input
                            id="reg-cpf"
                            type="text"
                            required
                            placeholder="000.000.000-00"
                            value={regCpf}
                            onChange={handleRegCpfChange}
                            className={inputClass(isCpfInvalid)}
                          />
                          {isCpfInvalid && (
                            <p className="mt-1 text-xs text-red-500 font-medium">CPF inválido (11 dígitos).</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="reg-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            E-mail *
                          </label>
                          <input
                            id="reg-email"
                            type="email"
                            required
                            placeholder="exemplo@email.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className={inputClass(isEmailInvalid)}
                          />
                          {isEmailInvalid && (
                            <p className="mt-1 text-xs text-red-500 font-medium">Informe um e-mail válido.</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="reg-phone" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Telefone / WhatsApp
                        </label>
                        <input
                          id="reg-phone"
                          type="tel"
                          placeholder="(99) 99999-9999"
                          value={regPhone}
                          onChange={handleRegPhoneChange}
                          className={`mt-1 block w-full rounded-xl border px-4 py-2.5 text-gray-900 transition-all focus:bg-white focus:ring-4 sm:text-sm border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-blue-500/10`}
                        />
                        <p className="mt-1 text-[10px] text-gray-400">Opcional — usado para recuperação de senha</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="reg-pass" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Senha * (mín. 8 caracteres)
                          </label>
                          <input
                            id="reg-pass"
                            type="password"
                            required
                            minLength={8}
                            placeholder="••••••••"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className={inputClass(isPasswordInvalid)}
                          />
                          {isPasswordInvalid && (
                            <p className="mt-1 text-xs text-red-500 font-medium">Mínimo de 8 caracteres.</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="reg-confirm-pass" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Confirmar Senha *
                          </label>
                          <input
                            id="reg-confirm-pass"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            className={inputClass(isConfirmPasswordInvalid)}
                          />
                          {isConfirmPasswordInvalid && (
                            <p className="mt-1 text-xs text-red-500 font-medium">As senhas não coincidem.</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="reg-perfil" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Perfil Solicitado *
                        </label>
                        <select
                          id="reg-perfil"
                          value={regPerfil}
                          onChange={(e) => setRegPerfil(e.target.value)}
                          className="mt-1 block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm"
                        >
                          <option value="RECEPCIONISTA_UBS">Recepcionista da UBS</option>
                          <option value="MEDICO">Médico</option>
                          <option value="GESTOR_UBS">Gestor da UBS</option>
                          <option value="SECRETARIO_SAUDE">Secretário de Saúde</option>
                          <option value="GESTOR_ESTOQUE">Gestor de Estoque (CD)</option>
                          <option value="FARMACIA">Farmácia</option>
                          <option value="REGULADOR">Regulador (Secretaria)</option>
                          <option value="ENTREGADOR">Entregador</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between items-center">
                          <label htmlFor="reg-just" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Justificativa de Acesso * (mínimo 30 caracteres)
                          </label>
                          <span className={`text-[10px] font-bold ${regJustificativa.trim().length >= 30 ? 'text-emerald-600' : 'text-gray-500'}`}>
                            {regJustificativa.trim().length}/30 caracteres
                          </span>
                        </div>
                        <textarea
                          id="reg-just"
                          required
                          minLength={30}
                          rows={3}
                          placeholder="Descreva detalhadamente o motivo de solicitar o acesso ao sistema..."
                          value={regJustificativa}
                          onChange={(e) => setRegJustificativa(e.target.value)}
                          className={inputClass(isJustificativaInvalid)}
                        />
                        {isJustificativaInvalid && (
                          <p className="mt-1 text-xs text-red-500 font-medium">Justificativa precisa ter pelo menos 30 caracteres.</p>
                        )}
                      </div>
                    </>
                  );
                })()}

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
                  onClick={() => {
                    setIsRegistering(false);
                    setShowRegValidation(false);
                  }}
                  className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Voltar para o Login
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={resetForgotModal}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5">
              <button
                onClick={resetForgotModal}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <KeyRound className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Recuperar Senha</h3>
                  <p className="text-xs text-blue-100">
                    {forgotStep === 1 && 'Informe seu CPF para receber o código'}
                    {forgotStep === 2 && 'Digite o código enviado'}
                    {forgotStep === 3 && 'Senha redefinida!'}
                  </p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-4 flex gap-1.5">
                {[1, 2, 3].map(step => (
                  <div
                    key={step}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      step <= forgotStep ? 'bg-white' : 'bg-white/25'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {forgotError && (
                <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2">
                  <X className="h-4 w-4 mt-0.5 shrink-0" />
                  {forgotError}
                </div>
              )}
              {forgotSuccess && forgotStep !== 3 && (
                <div className="p-3 text-sm bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  {forgotSuccess}
                </div>
              )}

              {/* Step 1: Enter CPF */}
              {forgotStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">CPF</label>
                    <input
                      id="forgot-cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={forgotCpf}
                      onChange={(e) => setForgotCpf(formatCPF(e.target.value))}
                      onKeyDown={(e) => e.key === 'Enter' && handleForgotPasswordSubmit()}
                      className="block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm placeholder:text-gray-400"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleForgotPasswordSubmit}
                    disabled={forgotLoading}
                    className="w-full flex justify-center items-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-70 transition-all cursor-pointer"
                  >
                    {forgotLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enviar código'}
                  </button>
                </div>
              )}

              {/* Step 2: Enter OTP + New Password */}
              {forgotStep === 2 && (
                <div className="space-y-4">
                  {/* Show where code was sent */}
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-1.5">
                    <p className="text-xs font-semibold text-blue-800">Código enviado para:</p>
                    {maskedEmail && (
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <Mail className="h-4 w-4" />
                        <span>{maskedEmail}</span>
                      </div>
                    )}
                    {maskedPhone && (
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <Phone className="h-4 w-4" />
                        <span>{maskedPhone}</span>
                        <span className="text-[10px] text-blue-400">(em breve)</span>
                      </div>
                    )}
                    {!maskedEmail && !maskedPhone && (
                      <p className="text-sm text-blue-600">Se o CPF estiver cadastrado, um código será enviado.</p>
                    )}
                  </div>

                  {/* OTP Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Código de 6 dígitos</label>
                    <input
                      id="otp-code"
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-300 placeholder:tracking-[0.5em]"
                      autoFocus
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-xs font-medium ${otpTimer > 0 ? 'text-gray-500' : 'text-red-500'}`}>
                        {otpTimer > 0 ? `Expira em ${formatTimer(otpTimer)}` : 'Código expirado'}
                      </span>
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={!canResend || forgotLoading}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Reenviar código
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nova Senha (mín. 8 caracteres)</label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Digite sua nova senha"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-4 pr-11 py-3 text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar Nova Senha</label>
                    <input
                      id="confirm-new-password"
                      type="password"
                      placeholder="Confirme sua nova senha"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm placeholder:text-gray-400"
                    />
                  </div>

                  <button
                    onClick={handleResetPasswordSubmit}
                    disabled={forgotLoading || otpCode.length !== 6}
                    className="w-full flex justify-center items-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-70 transition-all cursor-pointer"
                  >
                    {forgotLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Redefinir Senha'}
                  </button>
                </div>
              )}

              {/* Step 3: Success */}
              {forgotStep === 3 && (
                <div className="space-y-5 text-center py-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Senha Redefinida!</h3>
                    <p className="text-sm text-gray-500">
                      Sua senha foi atualizada com sucesso. Faça login com sua nova senha.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      resetForgotModal();
                      setCpf(forgotCpf);
                    }}
                    className="w-full flex justify-center items-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all cursor-pointer"
                  >
                    Fazer Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
