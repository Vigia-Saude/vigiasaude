import { useNavigate } from 'react-router';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-red-600">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <h1 className="mb-2 text-4xl font-bold text-gray-900">Acesso Negado</h1>
      <p className="mb-8 max-w-md text-lg text-gray-600">
        Você não tem as permissões necessárias para acessar esta página. 
        Por favor, entre em contato com o administrador do sistema se acreditar que isso é um erro.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800"
      >
        <ArrowLeft className="h-5 w-5" />
        Voltar para a página anterior
      </button>
    </div>
  );
}
