import axios from 'axios';

export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_URL || '';
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
