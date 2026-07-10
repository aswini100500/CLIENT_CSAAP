import axios from "axios";
import { getAuthToken } from "../store/authSession";

const client = axios.create({
  baseURL: import.meta.env.VITE_CSAAP_URL,
});

client.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const plansService = {
  getCompanyById: (companyId) =>
    client.get(`/api/builder-companies/${companyId}`).then((r) => r.data),

  getAvailablePlans: () =>
    client.get("/api/master/builder-erp-plans").then((r) => r.data),
};

export default plansService;
