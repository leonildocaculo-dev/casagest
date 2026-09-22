import axios from 'axios';

// Normaliza NEXT_PUBLIC_API_URL: aceita o valor com ou sem barra final e com
// ou sem o sufixo /api (ex.: "https://casagest-api.onrender.com/").
export const BACKEND_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

const API_BASE_URL = `${BACKEND_BASE_URL}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Essencial para cookies Sanctum HTTP-only
});

// Intercetor para injetar o token de autorização se existente no localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('casagest_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const getCsrfCookie = async () => {
  await axios.get(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
};
