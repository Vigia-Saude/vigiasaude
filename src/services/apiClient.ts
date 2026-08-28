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

// Interceptor de Response: Tratar 401 (Não autorizado/Expirado)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpar dados de sessão
      localStorage.removeItem('vigiasaude_token');
      localStorage.removeItem('vigiasaude_user');
      
      // Redirecionar para o login (apenas se não estivermos já lá)
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
