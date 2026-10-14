import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

api.interceptors.request.use((config) => {
  const requestPath = config.url || '';
  const isPublicAuthRequest = /(?:^|\/)auth\/(?:login|register)(?:$|\?)/.test(requestPath);
  const token = localStorage.getItem('vault_token');
  if (token && !isPublicAuthRequest) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Keep the saved JWT intact on unauthorized responses. This lets the user retry or
// explicitly sign out without an incidental API response destroying their session.
api.interceptors.response.use((response) => response, (error) => Promise.reject(error));

export const errorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error.response) return 'The server is unavailable. Check that the backend is running.';
  const responseMessage = error.response.data?.message || error.response.data?.error;
  if (error.response.status === 401) return 'Your session could not be authenticated. Your saved token is still on this device; retry or sign out explicitly.';
  if (error.response.status === 400) return responseMessage || 'Please check the information you entered.';
  if (error.response.status === 403) return responseMessage || 'The server rejected this request.';
  if (error.response.status === 404) return 'The requested item could not be found.';
  if (error.response.status >= 500) return 'The server encountered a problem. Please try again.';
  return responseMessage || fallback;
};

export default api;
