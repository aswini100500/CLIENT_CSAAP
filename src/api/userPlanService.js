
import axios from 'axios';
import { getAuthToken } from '../store/authSession';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_CSAAP_URL,
});


apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const userPlanService = {

  getCompanyDetailsById: (companyId) =>
    apiClient.get(`/api/builder-companies/${companyId}`).then(r => r.data),


  getAllServices: () =>
    apiClient.get('/api/master/services').then(r => r.data),
};

export default userPlanService;
