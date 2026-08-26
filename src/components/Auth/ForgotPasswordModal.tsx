import React, { useState, useEffect, useCallback } from 'react';
import { X, KeyRound, Loader2, Mail, Phone, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { formatCPF } from '../../lib/utils';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (cpf: string) => void;
}

export function ForgotPasswordModal({ isOpen, onClose, onSuccessLogin }: ForgotPasswordModalProps) {
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

  const resetModal = useCallback(() => {
    onClose();
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
  }, [onClose]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={resetModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5">
          <button
            onClick={resetModal}
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
                  resetModal();
                  onSuccessLogin(forgotCpf);
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
  );
}
