import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://apibackend-development.up.railway.app',
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
