import { Settings, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function ConfiguracoesMotorista() {
  const { user } = useAuth();

  const fields = [
    { label: 'Nome', value: user?.nome || '—' },
    { label: 'CPF', value: user?.cpf || '—' },
    { label: 'E-mail', value: user?.email || '—' },
    { label: 'Perfil', value: user?.perfil || '—' },
    { label: 'Unidade', value: user?.unidadeNome || '—' },
  ];

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-amber-600" />
          Configurações
        </h1>
        <p className="mt-1 text-sm text-gray-500">Visualize suas informações de perfil.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-2xl">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm">
              <User className="h-8 w-8 text-white stroke-[1.5]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.nome || 'Motorista'}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <Shield className="h-3.5 w-3.5 text-amber-200" />
                <span className="text-sm text-amber-100 font-medium">Motorista / Entregador</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-0 divide-y divide-gray-100">
          {fields.map((field) => (
            <div key={field.label} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <span className="text-sm font-semibold text-gray-500">{field.label}</span>
              <span className="text-sm font-medium text-gray-900">{field.value}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Para alterar suas informações, entre em contato com a Secretaria de Saúde.
          </p>
        </div>
      </div>
    </div>
  );
}
