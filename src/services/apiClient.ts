import axios from 'axios';

// Backends por ambiente. IMPORTANTE: o deploy da branch `developer` na Vercel
// (host contém "developer") deve falar com o backend developer do Railway, e não
// com o de produção — senão o frontend novo chama um backend possivelmente
// desatualizado.
const PROD_API = 'https://vigiasaude-production-a091.up.railway.app';
const DEV_API = 'https://vigiasaude-developer.up.railway.app';

export const getApiBaseUrl = (): string => {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isOnline = host !== '' && host !== 'localhost' && host !== '127.0.0.1';
  // Previews/deploys da branch developer na Vercel (ex.: vigia-saude-git-developer-*.vercel.app)
  const isDevDeploy = /(^|[.-])developer([.-]|$)/i.test(host);
  const backendDoAmbiente = isDevDeploy ? DEV_API : PROD_API;

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim();
    // Se estiver com a URL antiga do Railway sem -a091, redireciona para a ativa
    if (trimmed.includes('vigiasaude-production.up.railway.app') && !trimmed.includes('-a091')) {
      return PROD_API;
    }
    // Se estiver rodando online mas o envUrl veio como localhost, ignora e usa o backend do ambiente
    if (isOnline && (trimmed.includes('localhost') || trimmed.includes('127.0.0.1'))) {
      return backendDoAmbiente;
    }
    return trimmed;
  }

  // Sem VITE_API_URL: em domínio online (Vercel), aponta para o backend do ambiente
  if (isOnline) {
    return backendDoAmbiente;
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
