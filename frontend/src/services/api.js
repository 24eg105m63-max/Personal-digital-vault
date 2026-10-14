import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vault_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vault_token');
      localStorage.removeItem('vault_user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const errorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error.response) return 'The server is unavailable. Check that the backend is running.';
  const responseMessage = error.response.data?.message || error.response.data?.error;
  if (error.response.status === 400) return responseMessage || 'Please check the information you entered.';
  if (error.response.status === 403) return 'You do not have permission to perform this action.';
  if (error.response.status === 404) return 'The requested item could not be found.';
  if (error.response.status >= 500) return 'The server encountered a problem. Please try again.';
  return responseMessage || fallback;
};

export default api;
