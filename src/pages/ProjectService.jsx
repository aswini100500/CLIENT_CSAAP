import React from "react";
import axios from "axios";
import { getAuthToken } from "../store/authSession";

const API_URL = `${import.meta.env.VITE_CRM_BASE_URL}/api/tenant`;

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
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

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

const projectService = {
  createApartment: async (projectData) => {
    const response = await axiosInstance.post(
      `${API_URL}/api/tenant/apartment`,
      projectData,
    );
    return response.data;
  },

  getAllApartments: async () => {
    const response = await axiosInstance.get(`${API_URL}/api/tenant/apartment`);
    return response.data;
  },

  getApartmentById: async (id) => {
    const response = await axiosInstance.get(
      `${API_URL}/api/tenant/apartment/${id}`,
    );
    return response.data;
  },

  updateApartment: async (id, projectData) => {
    const response = await axiosInstance.put(
      `${API_URL}/api/tenant/apartment/${id}`,
      projectData,
    );
    return response.data;
  },

  deleteApartment: async (id) => {
    const response = await axiosInstance.delete(
      `${API_URL}/api/tenant/apartment/${id}`,
    );
    return response.data;
  },

  createCommercial: async (projectData) => {
    const response = await axiosInstance.post(
      `${API_URL}/api/tenant/commercial`,
      projectData,
    );
    return response.data;
  },

  getAllCommercials: async () => {
    const response = await axiosInstance.get(
      `${API_URL}/api/tenant/commercial`,
    );
    return response.data;
  },

  getCommercialById: async (id) => {
    const response = await axiosInstance.get(
      `${API_URL}/api/tenant/commercial/${id}`,
    );
    return response.data;
  },

  updateCommercial: async (id, projectData) => {
    const response = await axiosInstance.put(
      `${API_URL}/api/tenant/commercial/${id}`,
      projectData,
    );
    return response.data;
  },

  deleteCommercial: async (id) => {
    const response = await axiosInstance.delete(
      `${API_URL}/api/tenant/commercial/${id}`,
    );
    return response.data;
  },

  createPlotting: async (projectData) => {
    const response = await axiosInstance.post(
      `${API_URL}/api/tenant/plotting`,
      projectData,
    );
    return response.data;
  },

  getAllPlottings: async () => {
    const response = await axiosInstance.get(`${API_URL}/api/tenant/plotting`);
    return response.data;
  },

  getPlottingById: async (id) => {
    const response = await axiosInstance.get(
      `${API_URL}/api/tenant/plotting/${id}`,
    );
    return response.data;
  },

  updatePlotting: async (id, projectData) => {
    const response = await axiosInstance.put(
      `${API_URL}/api/tenant/plotting/${id}`,
      projectData,
    );
    return response.data;
  },

  deletePlotting: async (id) => {
    const response = await axiosInstance.delete(
      `${API_URL}/api/tenant/plotting/${id}`,
    );
    return response.data;
  },

  createDuplex: async (projectData) => {
    const response = await axiosInstance.post(
      `${API_URL}/api/tenant/duplex`,
      projectData,
    );
    return response.data;
  },

  getAllDuplexes: async () => {
    const response = await axiosInstance.get(`${API_URL}/api/tenant/duplex`);
    return response.data;
  },

  getDuplexById: async (id) => {
    const response = await axiosInstance.get(
      `${API_URL}/api/tenant/duplex/${id}`,
    );
    return response.data;
  },

  updateDuplex: async (id, projectData) => {
    const response = await axiosInstance.put(
      `${API_URL}/api/tenant/duplex/${id}`,
      projectData,
    );
    return response.data;
  },

  deleteDuplex: async (id) => {
    const response = await axiosInstance.delete(
      `${API_URL}/api/tenant/duplex/${id}`,
    );
    return response.data;
  },

  createTriplex: async (projectData) => {
    const response = await axiosInstance.post(
      `${API_URL}/api/tenant/triplex`,
      projectData,
    );
    return response.data;
  },

  getAllTriplexes: async () => {
    const response = await axiosInstance.get(`${API_URL}/api/tenant/triplex`);
    return response.data;
  },

  getTriplexById: async (id) => {
    const response = await axiosInstance.get(
      `${API_URL}/api/tenant/triplex/${id}`,
    );
    return response.data;
  },

  updateTriplex: async (id, projectData) => {
    const response = await axiosInstance.put(
      `${API_URL}/api/tenant/triplex/${id}`,
      projectData,
    );
    return response.data;
  },

  deleteTriplex: async (id) => {
    const response = await axiosInstance.delete(
      `${API_URL}/api/tenant/triplex/${id}`,
    );
    return response.data;
  },
};

export default projectService;
