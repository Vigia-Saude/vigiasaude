import axios from 'axios';

export const getApiBaseUrl = (): string => {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isOnline = host !== '' && host !== 'localhost' && host !== '127.0.0.1';

  // Quando rodando online na Vercel, usamos caminho relativo ('') para acionar
  // os rewrites transparentes do vercel.mjs. Isso garante funcionamento mesmo
  // em redes com firewall restrito (ex: TCE-MS, hospitais) e elimina problemas de CORS.
  if (isOnline) {
    return '';
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    if (['api.13.140.41.170.sslip.io', 'vigiasaude-brown.vercel.app', 'vigiasaude-tiscinovacoes-projects.vercel.app'].includes(new URL(trimmed).hostname)) {
      throw new Error('Execução local bloqueada: VITE_API_URL aponta para produção.');
    }
    return trimmed;
  }

  return 'http://localhost:3001';
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000, // 15 segundos de timeout
});

// Interceptor de Request: Injetar JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vigiasaude_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de Response: Retry para cold start + tratamento de 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as any;

    // Retry automático (até 2 vezes) em caso de queda de rede ou cold-start do Railway
    if (config && ['get','head','options'].includes((config.method || 'get').toLowerCase()) && (!error.response || error.code === 'ERR_NETWORK') && (config.__retryCount || 0) < 2) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      await new Promise((resolve) => setTimeout(resolve, 1000 * config.__retryCount));
      return apiClient(config);
    }

    if (error.response?.status === 401) {
      // Se for a rota de login, não limpa nem redireciona (deixa o formulário exibir a mensagem)
      if (!config?.url?.includes('/auth/login')) {
        localStorage.removeItem('vigiasaude_token');
        localStorage.removeItem('vigiasaude_user');
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }

    // Normalização de mensagens amigáveis
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'string' && data.startsWith('<!DOCTYPE')) {
        error.friendlyMessage = 'Serviço temporariamente indisponível. Tente novamente em instantes.';
      } else if (data.erro || data.error || data.message) {
        error.friendlyMessage = data.erro || data.error || data.message;
      }
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.friendlyMessage = 'O servidor demorou para responder. Por favor, tente novamente.';
    } else if (!error.response) {
      error.friendlyMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
