import axios from "axios";
import { store } from "../../store/store";

const accountingApi = axios.create({
  baseURL: import.meta.env.VITE_ACCOUNTING_URL,
});

accountingApi.interceptors.request.use(
  (config) => {
    const token = store.getState().user?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default accountingApi;
