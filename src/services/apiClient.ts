import axios from 'axios';

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim();
    // Se estiver com a URL antiga do Railway sem -a091, redireciona para a ativa
    if (trimmed.includes('vigiasaude-production.up.railway.app') && !trimmed.includes('-a091')) {
      return 'https://vigiasaude-production-a091.up.railway.app';
    }
    // Se estiver rodando na Vercel mas o envUrl veio como localhost
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      if (trimmed.includes('localhost') || trimmed.includes('127.0.0.1')) {
        return 'https://vigiasaude-production-a091.up.railway.app';
      }
    }
    return trimmed;
  }

  // Se estiver rodando no navegador em domínio online (como *.vercel.app), aponta para o Railway
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://vigiasaude-production-a091.up.railway.app';
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
    if (config && (!error.response || error.code === 'ERR_NETWORK') && (config.__retryCount || 0) < 2) {
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
    return Promise.reject(error);
  }
);

export default apiClient;
