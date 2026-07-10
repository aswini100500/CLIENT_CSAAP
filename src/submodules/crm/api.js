import axios from "axios";
import { store } from "../../store/store";

const api = axios.create({
  baseURL: import.meta.env.VITE_CRM_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = store.getState().user?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
