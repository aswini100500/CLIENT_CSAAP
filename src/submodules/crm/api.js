import axios from 'axios';
import { store } from '../../store/store';

/**
 * Custom Axios instance for CRM module.
 * Uses VITE_CRM_BASE_URL from .env as the baseURL.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_CRM_BASE_URL,
});

// Automatically add the Bearer token to every request from Redux store state
api.interceptors.request.use(
  (config) => {
    const token = store.getState().user?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
