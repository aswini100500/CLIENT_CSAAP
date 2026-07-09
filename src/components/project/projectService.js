import axios from 'axios';
import { getAuthSlug, getAuthToken } from '../../store/authSession';

const API_URL = `${import.meta.env.VITE_CSAAP_URL}/api/tenant`;

const getSlug = () => getAuthSlug();

const projectService = {
    // --- APARTMENT APIS ---
    createApartment: async (projectData) => {
        const response = await axios.post(`${API_URL}/apartments`, projectData,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    getAllApartments: async () => {
        const response = await axios.get(`${API_URL}/apartments`,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    getApartmentById: async (id) => {
        const response = await axios.get(`${API_URL}/apartments/${id}`,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    updateApartment: async (id, projectData) => {
        const response = await axios.put(`${API_URL}/apartments/${id}`, projectData,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    deleteApartment: async (id) => {
        const response = await axios.delete(`${API_URL}/apartments/${id}`,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    // --- COMMERCIAL APIS ---
    createCommercial: async (projectData) => {
        const response = await axios.post(
            `${API_URL}/commercials`,
            projectData,
            {
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
            }
        );
        return response.data.data;
    },

    getAllCommercials: async () => {
        const response = await axios.get(`${API_URL}/commercials`,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    getCommercialById: async (id) => {
        const response = await axios.get(`${API_URL}/commercials/${id}`,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    updateCommercial: async (id, projectData) => {
        const response = await axios.put(`${API_URL}/commercials/${id}`, projectData,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    deleteCommercial: async (id) => {
        const response = await axios.delete(`${API_URL}/commercials/${id}`,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    // --- PLOTTING APIS ---
    createPlotting: async (projectData) => {
        const response = await axios.post(`${API_URL}/plottings`, projectData ,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    getAllPlottings: async () => {
        const response = await axios.get(`${API_URL}/plottings`,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        console.log(response);
        
        return response.data.data;
    },

    getPlottingById: async (id) => {
        const response = await axios.get(`${API_URL}/plottings/${id}`,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    updatePlotting: async (id, projectData) => {
        const response = await axios.put(`${API_URL}/plottings/${id}`, projectData,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    deletePlotting: async (id) => {
        const response = await axios.delete(`${API_URL}/plottings/${id}`,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    // --- DUPLEX APIS ---
    createDuplex: async (projectData) => {
        const response = await axios.post(`${API_URL}/duplexes`, projectData ,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    getAllDuplexes: async () => {
        const response = await axios.get(`${API_URL}/duplexes`,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    getDuplexById: async (id) => {
        const response = await axios.get(`${API_URL}/duplexes/${id}`,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    updateDuplex: async (id, projectData) => {
        const response = await axios.put(`${API_URL}/duplexes/${id}`, projectData,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    deleteDuplex: async (id) => {
        const response = await axios.delete(`${API_URL}/duplexes/${id}`,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    // --- TRIPLEX APIS ---
    createTriplex: async (projectData) => {
        const response = await axios.post(`${API_URL}/triplexes`, projectData ,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    getAllTriplexes: async () => {
        const response = await axios.get(`${API_URL}/triplexes`,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    getTriplexById: async (id) => {
        const response = await axios.get(`${API_URL}/triplexes/${id}`,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    updateTriplex: async (id, projectData) => {
        const response = await axios.put(`${API_URL}/triplexes/${id}`, projectData,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    deleteTriplex: async (id) => {
        const response = await axios.delete(`${API_URL}/triplexes/${id}`,{
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
        });
        return response.data.data;
    },

    // --- CUSTOM PROJECT APIS ---
    createCustomProject: async (projectData) => {
        const response = await axios.post(
            `${API_URL}/custom-projects`,
            projectData,
            {
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            }
        );
        return response.data.data;
    },

    getAllCustomProjects: async () => {
        const response = await axios.get(
            `${API_URL}/custom-projects`,
            {
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            }
        );
        return response.data.data;
    },

    getCustomProjectById: async (id) => {
        const response = await axios.get(
            `${API_URL}/custom-projects/${id}`,
            {
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            }
        );
        return response.data.data;
    },

    updateCustomProject: async (id, projectData) => {
        const response = await axios.put(
            `${API_URL}/custom-projects/${id}`,
            projectData,
            {
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            }
        );
        return response.data.data;
    },

    getCustomProjectStatus: async (id) => {
        const response = await axios.get(
            `${API_URL}/custom-projects/${id}/status`,
            {
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            }
        );
        return response.data.data;
    },

    deleteCustomProject: async (id) => {
        const response = await axios.delete(
            `${API_URL}/custom-projects/${id}`,
            {
                params: { slug: getSlug(), subdomain: getSlug() },
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            }
        );
        return response.data.data;
    },

    // --- SHARED APIS ---
    getAllBrokers: async () => {
        const response = await axios.get(`${API_URL}/broker`, {
            params: { slug: getSlug(), subdomain: getSlug() },
            headers: {
                Authorization: `Bearer ${getAuthToken()}`
            }
        });
        return response.data.data;
    },

    getAllContractors: async () => {
        const response = await axios.get(`${API_URL}/contractors`, {
            params: { slug: getSlug(), subdomain: getSlug() },
            headers: {
                Authorization: `Bearer ${getAuthToken()}`
            }
        });
        return response.data.data;
    },

    // --- UNIFIED PROJECT APIS ---
    getAllProjects: async () => {
        const response = await axios.get(`${API_URL}/all-types`, {
            params: { slug: getSlug(), subdomain: getSlug() },
            headers: {
                Authorization: `Bearer ${getAuthToken()}`
            }
        });
        return response.data.data;
    },

    bulkDeleteProjects: async (projects) => {
        const response = await axios.post(`${API_URL}/bulk-delete`, { projects }, {
            params: { slug: getSlug(), subdomain: getSlug() },
            headers: {
                Authorization: `Bearer ${getAuthToken()}`
            }
        });
        return response.data;
    },
};

export default projectService;

