import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { formatCPF, formatPhone } from '../../lib/utils';

interface RegisterFormProps {
  onBackToLogin: () => void;
  onSuccess: () => void;
  onError: (msg: string | null) => void;
}

export function RegisterForm({ onBackToLogin, onSuccess, onError }: RegisterFormProps) {
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

  const handleRegCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegCpf(formatCPF(e.target.value));
  };

  const handleRegPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegPhone(formatPhone(e.target.value));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    setShowRegValidation(true);

    const cleanCPF = regCpf.replace(/\D/g, '');
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail);
    const isJustificativaValid = regJustificativa.trim().length >= 30;

    if (!regNome.trim() || cleanCPF.length !== 11 || !isEmailValid || regPassword.length < 8 || regPassword !== regConfirmPassword || !isJustificativaValid) {
      if (regPassword.length < 8) {
        onError('A senha precisa ter no mínimo 8 caracteres.');
      } else if (regPassword !== regConfirmPassword) {
        onError('As senhas não coincidem.');
      } else if (!isEmailValid) {
        onError('Por favor, informe um e-mail válido.');
      } else if (!isJustificativaValid) {
        onError('A justificativa de acesso deve conter pelo menos 30 caracteres.');
      } else {
        onError('Por favor, preencha todos os campos obrigatórios.');
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
      onSuccess();
      setRegNome('');
      setRegCpf('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegJustificativa('');
      setShowRegValidation(false);
    } catch (err: any) {
      onError(err.response?.data?.error || 'Não foi possível enviar a solicitação. Tente novamente.');
    } finally {
      setIsRegLoading(false);
    }
  };

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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToLogin}
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
            className="mt-1 block w-full rounded-xl border px-4 py-2.5 text-gray-900 transition-all focus:bg-white focus:ring-4 sm:text-sm border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-blue-500/10"
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
          onClick={onBackToLogin}
          className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
        >
          Voltar para o Login
        </button>
      </div>
    </div>
  );
}
