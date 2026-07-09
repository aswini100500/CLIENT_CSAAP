// src/api/client.js
import axios from 'axios';
import { getAuthToken } from '../store/authSession';

const client = axios.create({
  baseURL: import.meta.env.VITE_CSAAP_URL,
});

// Automatically add the Bearer token to every request
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
  }
);

export default client;
