import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] w-full flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50/20 p-8 text-center backdrop-blur-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-650 shadow-xs mb-5 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Ops! Algo deu errado.</h2>
          <p className="text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
            Ocorreu um erro inesperado ao carregar esta tela. A equipe técnica já foi notificada.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-all cursor-pointer"
          >
            Recarregar Página
          </button>
          
          {import.meta.env.DEV && this.state.error && (
            <div className="mt-8 w-full max-w-2xl text-left">
              <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Detalhes do Erro (Apenas Dev):</span>
              <pre className="mt-2 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-red-400 font-mono shadow-inner max-h-48 border border-slate-850">
                {this.state.error.stack || this.state.error.toString()}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
