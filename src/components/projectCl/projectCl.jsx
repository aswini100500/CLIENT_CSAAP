import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { store } from '../../store/store';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    X,
    AlertCircle,
    Building2,
    MapPin,
    Calendar,
    DollarSign,
    Clock,
    Code,
    ChevronDown,
    Filter,
    Check,
    RefreshCw,
    Download,
    ChevronLeft,
    ChevronRight,
    Briefcase,
    Target,
    CalendarClock
} from 'lucide-react';

// ==================== Configuration ====================

const API_BASE_URL = import.meta.env.VITE_CSAAP_URL || 'https://csaapnodeapi.csaap.com';
const API_ENDPOINTS = {
    PROJECTS: '/api/tenant/clprojects',
    PROJECT_BY_ID: (id) => `/api/tenant/clprojects/${id}`,
    PROJECT_BY_CODE: (code) => `/api/tenant/clprojects/code/${code}`,
};

// ==================== API Service ====================

const apiService = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const state = store.getState();
        const authToken = state.user?.token || sessionStorage.getItem('token');

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
        };

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (response.status === 401) {
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                window.location.href = '/login';
                throw new Error('Session expired. Please login again.');
            }

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorJson.error || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    },

    async getProjects(companyId, slug = '') {
        if (!companyId) {
            throw new Error('Company ID is required');
        }

        let endpoint = `${API_ENDPOINTS.PROJECTS}?company_id=${companyId}`;
        if (slug) {
            endpoint += `&slug=${slug}`;
        }

        const result = await this.request(endpoint);
        return result.data;
    },

    async getProjectById(id, companyId) {
        if (!companyId) {
            throw new Error('Company ID is required');
        }

        const endpoint = `${API_ENDPOINTS.PROJECT_BY_ID(id)}?company_id=${companyId}`;
        const result = await this.request(endpoint);
        return result.data;
    },

    async getProjectByCode(code, companyId) {
        if (!companyId) {
            throw new Error('Company ID is required');
        }

        const endpoint = `${API_ENDPOINTS.PROJECT_BY_CODE(code)}?company_id=${companyId}`;
        const result = await this.request(endpoint);
        return result.data;
    },

    async createProject(payload) {
        const result = await this.request(API_ENDPOINTS.PROJECTS, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return result;
    },

    async updateProject(id, payload, companyId) {
        if (!companyId) {
            throw new Error('Company ID is required');
        }

        const { company_id, ...cleanPayload } = payload;

        const endpoint = `${API_ENDPOINTS.PROJECT_BY_ID(id)}?company_id=${companyId}`;
        const result = await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(cleanPayload),
        });
        return result;
    },

    async deleteProject(id, companyId) {
        if (!companyId) {
            throw new Error('Company ID is required');
        }

        const endpoint = `${API_ENDPOINTS.PROJECT_BY_ID(id)}?company_id=${companyId}`;
        const result = await this.request(endpoint, {
            method: 'DELETE',
        });
        return result;
    },

    // Fetch unique companies with complete details from projects
    async getCompaniesFromProjects(companyId) {
        try {
            const projects = await this.getProjects(companyId);
            // Extract unique companies with all details
            const companyMap = new Map();
            projects.forEach(project => {
                if (project.client_company_name) {
                    const key = project.client_company_name;
                    if (!companyMap.has(key)) {
                        companyMap.set(key, {
                            company_name: project.client_company_name,
                            contact_person: project.contact_person || '',
                            email: project.email || '',
                            phone: project.phone || '',
                            address: project.address || '',
                            website: project.website || '',
                        });
                    } else {
                        // Update with any missing details
                        const existing = companyMap.get(key);
                        if (!existing.contact_person && project.contact_person) {
                            existing.contact_person = project.contact_person;
                        }
                        if (!existing.email && project.email) {
                            existing.email = project.email;
                        }
                        if (!existing.phone && project.phone) {
                            existing.phone = project.phone;
                        }
                        if (!existing.address && project.address) {
                            existing.address = project.address;
                        }
                        if (!existing.website && project.website) {
                            existing.website = project.website;
                        }
                        companyMap.set(key, existing);
                    }
                }
            });
            return Array.from(companyMap.values());
        } catch (error) {
            console.error('Error fetching companies from projects:', error);
            return [];
        }
    }
};

// ==================== Constants ====================

const STATUS_OPTIONS = ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];
const ENVIRONMENT_OPTIONS = ['Development', 'Staging', 'Production', 'Testing'];

const STATUS_COLORS = {
    Planning: 'bg-blue-50 text-blue-700 border-blue-200',
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'On Hold': 'bg-amber-50 text-amber-700 border-amber-200',
    Completed: 'bg-purple-50 text-purple-700 border-purple-200',
    Cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const PRIORITY_COLORS = {
    Low: 'bg-gray-50 text-gray-700 border-gray-200',
    Medium: 'bg-blue-50 text-blue-700 border-blue-200',
    High: 'bg-orange-50 text-orange-700 border-orange-200',
    Critical: 'bg-red-50 text-red-700 border-red-200',
};

// ==================== Custom Hooks ====================

const useProjects = (companyId) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [companyCache, setCompanyCache] = useState(() => {
        // Load company cache from localStorage
        try {
            const cached = localStorage.getItem('companyCache');
            return cached ? JSON.parse(cached) : {};
        } catch {
            return {};
        }
    });

    const fetchProjects = async (slugValue = '') => {
        if (!companyId) {
            setError('Company ID is not available');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getProjects(companyId, slugValue);
            setProjects(data || []);
            
            // Update company cache with any new company data
            if (data && data.length > 0) {
                const newCache = { ...companyCache };
                data.forEach(project => {
                    if (project.client_company_name) {
                        const key = project.client_company_name;
                        if (!newCache[key]) {
                            newCache[key] = {
                                company_name: project.client_company_name,
                                contact_person: project.contact_person || '',
                                email: project.email || '',
                                phone: project.phone || '',
                                address: project.address || '',
                                website: project.website || '',
                            };
                        } else {
                            // Update with any new information
                            if (!newCache[key].contact_person && project.contact_person) {
                                newCache[key].contact_person = project.contact_person;
                            }
                            if (!newCache[key].email && project.email) {
                                newCache[key].email = project.email;
                            }
                            if (!newCache[key].phone && project.phone) {
                                newCache[key].phone = project.phone;
                            }
                            if (!newCache[key].address && project.address) {
                                newCache[key].address = project.address;
                            }
                            if (!newCache[key].website && project.website) {
                                newCache[key].website = project.website;
                            }
                        }
                    }
                });
                setCompanyCache(newCache);
                localStorage.setItem('companyCache', JSON.stringify(newCache));
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (companyId) {
            fetchProjects();
        } else {
            setLoading(false);
            setError('Unable to load projects: Company ID missing');
        }
    }, [companyId]);

    return { projects, loading, error, refetch: fetchProjects, companyCache };
};

// ==================== Helper Functions ====================

const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

// ==================== Components ====================

const Modal = ({ isOpen, onClose, title, children, size = 'max-w-2xl' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
                <div className={`relative w-full ${size} rounded-2xl bg-white shadow-xl`}>
                    <div className="flex items-center justify-between border-b border-[#e2f2e9] px-5 py-4">
                        <h2 className="text-[18px] font-bold text-[#042f2e]">{title}</h2>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-[#475569] hover:bg-[#f0fdf4] transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-5">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00a651] border-t-transparent" />
        <p className="mt-3 text-[13px] font-medium text-[#475569]">Loading projects...</p>
    </div>
);

const ErrorAlert = ({ message, onRetry }) => (
    <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-600" />
                <div>
                    <p className="text-[13px] font-medium text-rose-800">Error loading projects</p>
                    <p className="text-[12px] text-rose-600">{message}</p>
                </div>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="rounded-lg bg-rose-100 px-3 py-1.5 text-[12px] font-medium text-rose-700 hover:bg-rose-200 transition-colors"
                >
                    Retry
                </button>
            )}
        </div>
    </div>
);

const StatsCard = ({ title, value, icon: Icon }) => (
    <div className="bg-white rounded-2xl border border-[#e2f2e9] p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3">
            <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">{title}</p>
                <div className="mt-2 text-[28px] font-extrabold leading-none text-[#042f2e]">
                    {value.toLocaleString()}
                </div>
            </div>
            <div className="size-10 rounded-2xl bg-[#ecfdf5] border border-[#e2f2e9] flex items-center justify-center">
                <Icon className="size-5 text-[#00a651]" />
            </div>
        </div>
    </div>
);

// Updated ProjectFormModal with company cache
// Updated ProjectFormModal with API integration for client details
const ProjectFormModal = ({ isOpen, onClose, onSuccess, initialData, isEditing = false, companyId, companyCache = {} }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [showNewCompany, setShowNewCompany] = useState(false);
    const [selectedCompanyData, setSelectedCompanyData] = useState(null);
    const [fetchingCompanyDetails, setFetchingCompanyDetails] = useState(false);
    const [projectIdForFetch, setProjectIdForFetch] = useState(null);

    const [client, setClient] = useState({
        company_id: '',
        company_name: '',
        slug: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        website: '',
    });

    const [project, setProject] = useState({
        project_name: '',
        project_code: '',
        slug: '',
        description: '',
        status: 'Planning',
        priority: 'Medium',
        start_date: '',
        end_date: '',
        budget: 0,
        estimated_hours: 0,
        technology_stack: '',
        environment: 'Development',
    });

    const [locations, setLocations] = useState([{ location_name: '', }]);

    // Fetch client details from API using project ID
    const fetchClientDetailsByProjectId = async (companyName) => {
        if (!companyId || !companyName) return null;
        
        setFetchingCompanyDetails(true);
        try {
            // First, get all projects to find the company
            const projects = await apiService.getProjects(companyId);
            
            // Find a project with matching client_company_name
            const matchingProject = projects.find(p => 
                p.client_company_name === companyName
            );

            if (matchingProject) {
                // Fetch full project details using the project ID
                const projectDetail = await apiService.getProjectById(matchingProject.id, companyId);
                
                if (projectDetail && projectDetail.client) {
                    return {
                        contact_person: projectDetail.client.contact_person || '',
                        email: projectDetail.client.email || '',
                        phone: projectDetail.client.phone || '',
                        address: projectDetail.client.address || '',
                        website: projectDetail.client.website || '',
                        company_name: projectDetail.client.company_name || companyName,
                        project_id: matchingProject.id
                    };
                }
            }
            return null;
        } catch (err) {
            console.error('Error fetching client details:', err);
            return null;
        } finally {
            setFetchingCompanyDetails(false);
        }
    };

    // Load companies from cache when modal opens
    useEffect(() => {
        if (isOpen && !isEditing) {
            setLoadingCompanies(true);
            try {
                const companyList = Object.values(companyCache);
                setCompanies(companyList);
            } catch (err) {
                console.error('Error loading companies from cache:', err);
            } finally {
                setLoadingCompanies(false);
            }
        }
    }, [isOpen, isEditing, companyCache]);

    useEffect(() => {
        if (initialData && isEditing) {
            setClient({
                company_id: initialData.client?.company_id || '',
                company_name: initialData.client?.company_name || '',
                slug: initialData.client?.slug || '',
                contact_person: initialData.client?.contact_person || '',
                email: initialData.client?.email || '',
                phone: initialData.client?.phone || '',
                address: initialData.client?.address || '',
                website: initialData.client?.website || '',
            });

            setProject({
                project_name: initialData.project?.project_name || '',
                project_code: initialData.project?.project_code || '',
                slug: initialData.project?.slug || '',
                description: initialData.project?.description || '',
                status: initialData.project?.status || 'Planning',
                priority: initialData.project?.priority || 'Medium',
                start_date: initialData.project?.start_date ? initialData.project.start_date.split('T')[0] : '',
                end_date: initialData.project?.end_date ? initialData.project.end_date.split('T')[0] : '',
                budget: initialData.project?.budget || 0,
                estimated_hours: initialData.project?.estimated_hours || 0,
                technology_stack: initialData.project?.technology_stack || '',
                environment: initialData.project?.environment || 'Development',
            });

            if (initialData.locations && initialData.locations.length > 0) {
                setLocations(initialData.locations.map(loc => ({
                    location_name: loc.location_name || '',
                    slug: loc.slug || ''
                })));
            } else {
                setLocations([{ location_name: '', slug: '' }]);
            }
        }
    }, [initialData, isEditing]);

    useEffect(() => {
        if (!isOpen) {
            setClient({
                company_id: '',
                company_name: '',
                slug: '',
                contact_person: '',
                email: '',
                phone: '',
                address: '',
                website: '',
            });
            setProject({
                project_name: '',
                project_code: '',
                slug: '',
                description: '',
                status: 'Planning',
                priority: 'Medium',
                start_date: '',
                end_date: '',
                budget: 0,
                estimated_hours: 0,
                technology_stack: '',
                environment: 'Development',
            });
            setLocations([{ location_name: '', slug: '' }]);
            setError(null);
            setShowNewCompany(false);
            setSelectedCompanyData(null);
            setProjectIdForFetch(null);
        }
    }, [isOpen]);

    const handleCompanySelect = async (e) => {
        const selectedCompanyName = e.target.value;
        
        if (!selectedCompanyName) {
            setClient(prev => ({
                ...prev,
                company_name: '',
                contact_person: '',
                email: '',
                phone: '',
                address: '',
                website: '',
            }));
            setSelectedCompanyData(null);
            setShowNewCompany(false);
            setProjectIdForFetch(null);
            return;
        }

        // Handle "New Company" option
        if (selectedCompanyName === '__new__') {
            setShowNewCompany(true);
            setClient(prev => ({
                ...prev,
                company_name: '',
                contact_person: '',
                email: '',
                phone: '',
                address: '',
                website: '',
            }));
            setSelectedCompanyData(null);
            setProjectIdForFetch(null);
            return;
        }

        // Check if company exists in cache with complete details
        const cachedCompany = companyCache[selectedCompanyName];
        if (cachedCompany && cachedCompany.contact_person && cachedCompany.email) {
            // Use cached data if available
            setClient(prev => ({
                ...prev,
                company_name: cachedCompany.company_name || selectedCompanyName,
                contact_person: cachedCompany.contact_person || '',
                email: cachedCompany.email || '',
                phone: cachedCompany.phone || '',
                address: cachedCompany.address || '',
                website: cachedCompany.website || '',
            }));
            setSelectedCompanyData(cachedCompany);
            setShowNewCompany(false);
            setProjectIdForFetch(null);
        } else {
            // Fetch from API using project ID
            const clientDetails = await fetchClientDetailsByProjectId(selectedCompanyName);
            if (clientDetails) {
                setClient(prev => ({
                    ...prev,
                    company_name: clientDetails.company_name || selectedCompanyName,
                    contact_person: clientDetails.contact_person || '',
                    email: clientDetails.email || '',
                    phone: clientDetails.phone || '',
                    address: clientDetails.address || '',
                    website: clientDetails.website || '',
                }));
                setSelectedCompanyData(clientDetails);
                setShowNewCompany(false);
                setProjectIdForFetch(clientDetails.project_id);

                // Update cache with fetched data
                const updatedCache = { ...companyCache };
                updatedCache[selectedCompanyName] = {
                    company_name: clientDetails.company_name || selectedCompanyName,
                    contact_person: clientDetails.contact_person || '',
                    email: clientDetails.email || '',
                    phone: clientDetails.phone || '',
                    address: clientDetails.address || '',
                    website: clientDetails.website || '',
                };
                localStorage.setItem('companyCache', JSON.stringify(updatedCache));
            } else {
                // If not found, use basic company name
                setClient(prev => ({
                    ...prev,
                    company_name: selectedCompanyName,
                    contact_person: '',
                    email: '',
                    phone: '',
                    address: '',
                    website: '',
                }));
                setSelectedCompanyData(null);
                setShowNewCompany(false);
                setProjectIdForFetch(null);
            }
        }
    };

    const addLocation = () => {
        setLocations([...locations, { location_name: '', slug: '' }]);
    };

    const removeLocation = (index) => {
        setLocations(locations.filter((_, i) => i !== index));
    };

    const updateLocation = (index, value) => {
        const updated = [...locations];
        updated[index].location_name = value;
        setLocations(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userSlug = user?.slug || generateSlug(project.project_name);

            // Validate company name
            if (!client.company_name || client.company_name.trim() === '') {
                throw new Error('Company name is required');
            }

            // Update company cache with new/updated company data
            const updatedCache = { ...companyCache };
            updatedCache[client.company_name] = {
                company_name: client.company_name,
                contact_person: client.contact_person || '',
                email: client.email || '',
                phone: client.phone || '',
                address: client.address || '',
                website: client.website || '',
            };
            localStorage.setItem('companyCache', JSON.stringify(updatedCache));

            if (isEditing && initialData) {
                const validLocations = locations
                    .filter(l => l.location_name && l.location_name.trim() !== '')
                    .map(loc => ({
                        location_name: loc.location_name,
                        slug: user.slug || userSlug
                    }));

                const updatePayload = {
                    project: {
                        project_name: project.project_name,
                        project_code: project.project_code,
                        slug: project.slug || userSlug,
                        description: project.description,
                        status: project.status,
                        priority: project.priority,
                        start_date: project.start_date,
                        end_date: project.end_date,
                        budget: Number(project.budget) || 0,
                        estimated_hours: Number(project.estimated_hours) || 0,
                        technology_stack: project.technology_stack,
                        environment: project.environment,
                    },
                    locations: validLocations,
                    slug: userSlug,
                    companyId: companyId
                };

                await apiService.updateProject(initialData.project.id, updatePayload, companyId);
            } else {
                const validLocations = locations
                    .filter(l => l.location_name && l.location_name.trim() !== '')
                    .map(loc => ({
                        location_name: loc.location_name,
                        slug: user.slug || userSlug,
                        companyId: companyId
                    }));

                const createPayload = {
                    company_id: companyId,
                    client: {
                        company_name: client.company_name,
                        contact_person: client.contact_person,
                        email: client.email,
                        phone: client.phone,
                        address: client.address,
                        website: client.website,
                        slug: userSlug
                    },
                    project: {
                        project_name: project.project_name,
                        project_code: project.project_code,
                        description: project.description,
                        status: project.status,
                        priority: project.priority,
                        start_date: project.start_date,
                        end_date: project.end_date,
                        budget: Number(project.budget) || 0,
                        estimated_hours: Number(project.estimated_hours) || 0,
                        technology_stack: project.technology_stack,
                        environment: project.environment,
                        slug: userSlug
                    },
                    locations: validLocations,
                    slug: userSlug,
                    companyId: companyId
                };

                console.log('Create Payload:', JSON.stringify(createPayload, null, 2));
                await apiService.createProject(createPayload);
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClientChange = (field, value) => {
        setClient(prev => ({ ...prev, [field]: value }));
    };

    const handleProjectChange = (field, value) => {
        setProject(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Project' : 'Create New Project'} size="max-w-3xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <ErrorAlert message={error} />}

                {!isEditing && (
                    <div>
                        <h3 className="text-[16px] font-bold text-[#042f2e] mb-3">Client Information</h3>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">
                                    Select Existing Company
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={client.company_name}
                                        onChange={handleCompanySelect}
                                        className="flex-1 rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                                        disabled={loadingCompanies || fetchingCompanyDetails}
                                    >
                                        <option value="">Select a company</option>
                                        {companies.length === 0 && !loadingCompanies && (
                                            <option value="" disabled>No companies found in cache</option>
                                        )}
                                        {companies.map((company, index) => (
                                            <option key={index} value={company.company_name}>
                                                {company.company_name}
                                                {company.contact_person && ` (${company.contact_person})`}
                                            </option>
                                        ))}
                                        <option value="__new__">+ Add New Company</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewCompany(!showNewCompany)}
                                        className="rounded-xl bg-[#ecfdf5] px-3 py-2 text-[13px] font-medium text-[#00a651] hover:bg-[#d1fae5] transition-colors border border-[#e2f2e9]"
                                    >
                                        {showNewCompany ? 'Hide' : 'New'}
                                    </button>
                                </div>
                                {loadingCompanies && (
                                    <p className="text-[11px] text-[#94a3b8] mt-1">Loading companies...</p>
                                )}
                                {fetchingCompanyDetails && (
                                    <p className="text-[11px] text-[#94a3b8] mt-1 flex items-center gap-1">
                                        <span className="inline-block h-3 w-3 animate-spin rounded-full border border-[#00a651] border-t-transparent" />
                                        Fetching client details from API...
                                    </p>
                                )}
                                {/* {projectIdForFetch && (
                                    <p className="text-[11px] text-[#00a651] mt-1">
                                        ✓ Details fetched from project ID: {projectIdForFetch}
                                    </p>
                                )}
                                {selectedCompanyData && (
                                    <div className="mt-2 p-3 bg-[#f0fdf4] rounded-lg border border-[#e2f2e9]">
                                        <p className="text-[12px] font-semibold text-[#042f2e]">Company Details:</p>
                                        <div className="grid grid-cols-2 gap-1 mt-1 text-[12px]">
                                            <div><span className="text-[#475569]">Contact:</span> {selectedCompanyData.contact_person || 'N/A'}</div>
                                            <div><span className="text-[#475569]">Email:</span> {selectedCompanyData.email || 'N/A'}</div>
                                            <div><span className="text-[#475569]">Phone:</span> {selectedCompanyData.phone || 'N/A'}</div>
                                            <div><span className="text-[#475569]">Website:</span> {selectedCompanyData.website || 'N/A'}</div>
                                            <div className="col-span-2"><span className="text-[#475569]">Address:</span> {selectedCompanyData.address || 'N/A'}</div>
                                        </div>
                                    </div>
                                )} */}
                            </div>

                            {(showNewCompany || !client.company_name) && (
                                <>
                                    <div className="md:col-span-2">
                                        <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">
                                            Company Name {!client.company_name && '*'}
                                        </label>
                                        <input
                                            type="text"
                                            value={client.company_name}
                                            onChange={(e) => handleClientChange('company_name', e.target.value)}
                                            className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                                            placeholder="Enter company name"
                                            required={!client.company_name}
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Contact Person</label>
                                <input
                                    type="text"
                                    value={client.contact_person}
                                    onChange={(e) => handleClientChange('contact_person', e.target.value)}
                                    className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                                    placeholder="Enter contact person name"
                                />
                            </div>
                            <div>
                                <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Email</label>
                                <input
                                    type="email"
                                    value={client.email}
                                    onChange={(e) => handleClientChange('email', e.target.value)}
                                    className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                                    placeholder="Enter email address"
                                />
                            </div>
                            <div>
                                <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Phone</label>
                                <input
                                    type="text"
                                    value={client.phone}
                                    onChange={(e) => handleClientChange('phone', e.target.value)}
                                    className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                                    placeholder="Enter phone number"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Address</label>
                                <input
                                    type="text"
                                    value={client.address}
                                    onChange={(e) => handleClientChange('address', e.target.value)}
                                    className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                                    placeholder="Enter company address"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Website</label>
                                <input
                                    type="url"
                                    value={client.website}
                                    onChange={(e) => handleClientChange('website', e.target.value)}
                                    className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Project Details Section - unchanged */}
                <div>
                    <h3 className="text-[16px] font-bold text-[#042f2e] mb-3">Project Details</h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Project Name *</label>
                            <input
                                type="text"
                                value={project.project_name}
                                onChange={(e) => handleProjectChange('project_name', e.target.value)}
                                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                                placeholder="Enter project name"
                                required
                            />
                        </div>
                        <div>
                            <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Project Code *</label>
                            <input
                                type="text"
                                value={project.project_code}
                                onChange={(e) => handleProjectChange('project_code', e.target.value)}
                                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] font-mono focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                                placeholder="PRJ-001"
                                required
                                disabled={isEditing}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Description</label>
                            <textarea
                                value={project.description}
                                onChange={(e) => handleProjectChange('description', e.target.value)}
                                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                                rows={3}
                                placeholder="Brief description of the project (optional)"
                            />
                        </div>
                        <div>
                            <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Status</label>
                            <select
                                value={project.status}
                                onChange={(e) => handleProjectChange('status', e.target.value)}
                                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                            >
                                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Priority</label>
                            <select
                                value={project.priority}
                                onChange={(e) => handleProjectChange('priority', e.target.value)}
                                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                            >
                                {PRIORITY_OPTIONS.map(p => <option key={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Start Date</label>
                            <input
                                type="date"
                                value={project.start_date ? project.start_date.split('T')[0] : ''}
                                onChange={(e) => handleProjectChange('start_date', e.target.value)}
                                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                            />
                        </div>
                        <div>
                            <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">End Date</label>
                            <input
                                type="date"
                                value={project.end_date ? project.end_date.split('T')[0] : ''}
                                onChange={(e) => handleProjectChange('end_date', e.target.value)}
                                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                            />
                        </div>
                        <div>
                            <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Budget ($)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={project.budget || ''}
                                onChange={(e) => handleProjectChange('budget', parseFloat(e.target.value) || 0)}
                                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                            />
                        </div>
                        <div>
                            <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Estimated Hours</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={project.estimated_hours || ''}
                                onChange={(e) => handleProjectChange('estimated_hours', parseInt(e.target.value) || 0)}
                                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Technology Stack</label>
                            <input
                                type="text"
                                placeholder="React, Node.js, MongoDB (optional)"
                                value={project.technology_stack}
                                onChange={(e) => handleProjectChange('technology_stack', e.target.value)}
                                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                            />
                        </div>
                        <div>
                            <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Environment</label>
                            <select
                                value={project.environment}
                                onChange={(e) => handleProjectChange('environment', e.target.value)}
                                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                            >
                                {ENVIRONMENT_OPTIONS.map(e => <option key={e}>{e}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Locations Section - unchanged */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[16px] font-bold text-[#042f2e]">Project Locations</h3>
                        <button
                            type="button"
                            onClick={addLocation}
                            className="flex items-center gap-1.5 rounded-lg bg-[#ecfdf5] px-3 py-1.5 text-[12px] font-medium text-[#00a651] hover:bg-[#d1fae5] transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" /> Add Location
                        </button>
                    </div>
                    <div className="space-y-2">
                        {locations.map((loc, idx) => (
                            <div key={idx} className="flex gap-2">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Enter location name"
                                        value={loc.location_name}
                                        onChange={(e) => updateLocation(idx, e.target.value)}
                                        className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                                    />
                                </div>
                                {locations.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeLocation(idx)}
                                        className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-[11px] text-[#94a3b8] mt-2">
                        Locations will use the same slug as the project and client
                    </p>
                </div>

                <div className="flex justify-end gap-2 border-t border-[#e2f2e9] pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-[#e2f2e9] bg-white px-4 py-2 text-[13px] font-medium text-[#475569] hover:bg-[#f8faf8] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-xl bg-linear-to-r from-[#00a651] to-[#008c44] px-4 py-2 text-[13px] font-medium text-white hover:from-[#008c44] hover:to-[#007a3a] transition-all disabled:opacity-50 shadow-sm"
                    >
                        {loading ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, projectName, loading }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Project" size="max-w-md">
            <div className="text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-rose-100">
                    <Trash2 className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="mb-2 text-[16px] font-bold text-[#042f2e]">Delete Project</h3>
                <p className="mb-6 text-[13px] text-[#475569]">
                    Are you sure you want to delete <span className="font-semibold text-[#042f2e]">{projectName}</span>?
                    <br />
                    <span className="text-[11px] text-rose-500">This action cannot be undone.</span>
                </p>
                <div className="flex justify-center gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-[#e2f2e9] bg-white px-4 py-2 text-[13px] font-medium text-[#475569] hover:bg-[#f8faf8] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="rounded-xl bg-rose-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Deleting...' : 'Delete Project'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const ProjectDetailModal = ({ isOpen, onClose, projectId, companyId }) => {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && projectId && companyId) {
            const fetchDetail = async () => {
                setLoading(true);
                try {
                    const data = await apiService.getProjectById(projectId, companyId);
                    setDetail(data);
                    setError(null);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchDetail();
        }
    }, [isOpen, projectId, companyId]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Project Details" size="max-w-3xl">
            {loading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            {detail && (
                <div className="space-y-5">
                    <div className="rounded-xl bg-[#f0fdf4] border border-[#e2f2e9] p-4">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                            <div>
                                <h3 className="text-[16px] font-bold text-[#042f2e]">{detail.project.project_name}</h3>
                                <p className="text-[11px] font-mono text-[#475569] mt-0.5">Code: {detail.project.project_code}</p>
                            </div>
                            <div className="flex gap-1.5">
                                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[detail.project.status]}`}>
                                    {detail.project.status}
                                </span>
                                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${PRIORITY_COLORS[detail.project.priority]}`}>
                                    {detail.project.priority}
                                </span>
                            </div>
                        </div>
                        {detail.project.description && (
                            <p className="mt-3 text-[13px] text-[#475569]">{detail.project.description}</p>
                        )}
                    </div>

                    <div>
                        <h4 className="text-[13px] font-bold text-[#475569] mb-2 flex items-center gap-1.5">
                            <Building2 className="h-4 w-4" /> Client Information
                        </h4>
                        <div className="rounded-xl bg-[#f8faf8] border border-[#e2f2e9] p-3">
                            <div className="grid grid-cols-2 gap-2 text-[13px]">
                                <div>
                                    <p className="text-[11px] text-[#94a3b8]">Company</p>
                                    <p className="font-medium text-[#042f2e]">{detail.client.company_name}</p>
                                </div>
                                {detail.client.contact_person && (
                                    <div>
                                        <p className="text-[11px] text-[#94a3b8]">Contact</p>
                                        <p className="font-medium text-[#042f2e]">{detail.client.contact_person}</p>
                                    </div>
                                )}
                                {detail.client.email && (
                                    <div>
                                        <p className="text-[11px] text-[#94a3b8]">Email</p>
                                        <a href={`mailto:${detail.client.email}`} className="text-[#00a651] hover:underline">
                                            {detail.client.email}
                                        </a>
                                    </div>
                                )}
                                {detail.client.phone && (
                                    <div>
                                        <p className="text-[11px] text-[#94a3b8]">Phone</p>
                                        <p>{detail.client.phone}</p>
                                    </div>
                                )}
                            </div>
                            {detail.client.address && (
                                <div className="mt-2 pt-2 border-t border-[#e2f2e9]">
                                    <p className="text-[11px] text-[#94a3b8]">Address</p>
                                    <p className="text-[13px]">{detail.client.address}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[13px] font-bold text-[#475569] mb-2">Project Metrics</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="rounded-xl bg-[#f8faf8] border border-[#e2f2e9] p-3">
                                <div className="flex items-center gap-1 text-[11px] text-[#94a3b8]">
                                    <DollarSign className="h-3 w-3" /> Budget
                                </div>
                                <p className="text-[16px] font-bold text-[#042f2e] mt-1">{formatCurrency(detail.project.budget)}</p>
                            </div>
                            <div className="rounded-xl bg-[#f8faf8] border border-[#e2f2e9] p-3">
                                <div className="flex items-center gap-1 text-[11px] text-[#94a3b8]">
                                    <Clock className="h-3 w-3" /> Est. Hours
                                </div>
                                <p className="text-[16px] font-bold text-[#042f2e] mt-1">{detail.project.estimated_hours?.toLocaleString() || 0}</p>
                            </div>
                            <div className="rounded-xl bg-[#f8faf8] border border-[#e2f2e9] p-3">
                                <div className="flex items-center gap-1 text-[11px] text-[#94a3b8]">
                                    <Calendar className="h-3 w-3" /> Start Date
                                </div>
                                <p className="text-[12px] font-medium mt-1">{formatDate(detail.project.start_date)}</p>
                            </div>
                            <div className="rounded-xl bg-[#f8faf8] border border-[#e2f2e9] p-3">
                                <div className="flex items-center gap-1 text-[11px] text-[#94a3b8]">
                                    <CalendarClock className="h-3 w-3" /> End Date
                                </div>
                                <p className="text-[12px] font-medium mt-1">{formatDate(detail.project.end_date)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-[11px] font-medium text-[#94a3b8] mb-1">Environment</p>
                            <div className="rounded-xl bg-[#f8faf8] border border-[#e2f2e9] p-2">
                                <p className="text-[13px] font-medium">{detail.project.environment}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[11px] font-medium text-[#94a3b8] mb-1">Slug</p>
                            <div className="rounded-xl bg-[#f8faf8] border border-[#e2f2e9] p-2">
                                <p className="text-[11px] font-mono">{detail.project.slug}</p>
                            </div>
                        </div>
                    </div>

                    {detail.project.technology_stack && (
                        <div>
                            <h4 className="text-[13px] font-bold text-[#475569] mb-2 flex items-center gap-1.5">
                                <Code className="h-4 w-4" /> Tech Stack
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {detail.project.technology_stack.split(',').map((tech, idx) => (
                                    <span key={idx} className="rounded-full bg-[#f0fdf4] border border-[#e2f2e9] px-2 py-0.5 text-[11px] font-medium text-[#042f2e]">
                                        {tech.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {detail.locations && detail.locations.length > 0 && (
                        <div>
                            <h4 className="text-[13px] font-bold text-[#475569] mb-2 flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" /> Locations ({detail.locations.length})
                            </h4>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {detail.locations.map((loc) => (
                                    <div key={loc.id} className="rounded-xl bg-[#f8faf8] border border-[#e2f2e9] p-2">
                                        <p className="text-[13px] font-medium">{loc.location_name}</p>
                                        <p className="text-[10px] font-mono text-[#94a3b8]">{loc.slug}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

const ProjectTableRow = ({ project, onView, onEdit, onDelete }) => {
    return (
        <tr className="border-b border-[#e2f2e9] hover:bg-[#f0fdf4]/70 transition-colors duration-200">
            <td className="px-4 py-3">
                <div>
                    <div className="text-[14px] font-bold text-[#042f2e]">{project.project_name}</div>
                    <div className="text-[11px] font-mono text-[#94a3b8] mt-0.5">{project.project_code}</div>
                </div>
            </td>
            <td className="px-4 py-3">
                <div>
                    <div className="text-[13px] font-semibold text-[#042f2e]">{project.client_company_name}</div>
                    {project.contact_person && (
                        <div className="text-[11px] font-medium text-[#94a3b8] mt-0.5">{project.contact_person}</div>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[project.status]}`}>
                    {project.status}
                </span>
            </td>
            <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-1">
                    <button
                        onClick={() => onView(project.id)}
                        className="rounded-lg p-1.5 text-[#475569] hover:text-[#00a651] hover:bg-[#ecfdf5] transition-all"
                        title="View Details"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onEdit(project.id)}
                        className="rounded-lg p-1.5 text-[#475569] hover:text-[#00a651] hover:bg-[#ecfdf5] transition-all"
                        title="Edit Project"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(project.id, project.project_name)}
                        className="rounded-lg p-1.5 text-[#475569] hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete Project"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

// ==================== Main Page Component ====================

const ProjectsPage = () => {
    const { companyId } = useAuth();
    const { projects, loading, error, refetch, companyCache } = useProjects(companyId);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedProjectName, setSelectedProjectName] = useState('');
    const [editingProject, setEditingProject] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const filteredProjects = projects.filter(p => {
        const matchesSearch = !searchTerm ||
            p.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.project_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.client_company_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = !statusFilter || p.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'Active').length,
        planning: projects.filter(p => p.status === 'Planning').length,
        completed: projects.filter(p => p.status === 'Completed').length,
    };

    const handleView = async (id) => {
        setSelectedProjectId(id);
        setIsDetailModalOpen(true);
    };

    const handleEdit = async (id) => {
        try {
            const detail = await apiService.getProjectById(id, companyId);
            if (!detail || !detail.project) {
                throw new Error('Invalid project data received');
            }
            setEditingProject(detail);
            setIsEditModalOpen(true);
        } catch (err) {
            console.error('Failed to load project for editing:', err);
            alert(`Failed to load project: ${err.message}`);
        }
    };

    const handleDelete = (id, name) => {
        setSelectedProjectId(id);
        setSelectedProjectName(name);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedProjectId) return;
        setDeleteLoading(true);
        try {
            await apiService.deleteProject(selectedProjectId, companyId);
            await refetch();
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error('Delete failed:', err);
            alert(`Delete failed: ${err.message}`);
        } finally {
            setDeleteLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
    };

    if (!companyId) {
        return (
            <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center">
                <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-[#e2f2e9] max-w-md">
                    <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-rose-100">
                        <AlertCircle className="h-6 w-6 text-rose-600" />
                    </div>
                    <h2 className="text-[18px] font-bold text-[#042f2e] mb-1">Configuration Error</h2>
                    <p className="text-[13px] text-[#475569] mb-4">
                        Unable to load projects: Company ID not found. Please log in again.
                    </p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="rounded-xl bg-linear-to-r from-[#00a651] to-[#008c44] px-4 py-2 text-[13px] font-medium text-white hover:from-[#008c44] hover:to-[#007a3a] transition-all"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8faf8]">
            <div className="app-shell p-4">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Page Header */}
                    <div>
                        <h1 className="app-title max-w-3xl text-[24px] font-extrabold text-[#042f2e]">Client Projects</h1>
                        <p className="app-subtitle mt-1 text-[13px] text-[#475569]">
                            Manage and track all your client projects in one centralized dashboard
                        </p>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCard title="Total Projects" value={stats.total} icon={Briefcase} />
                        <StatsCard title="Active Projects" value={stats.active} icon={Check} />
                        <StatsCard title="Planning" value={stats.planning} icon={Clock} />
                        <StatsCard title="Completed" value={stats.completed} icon={Target} />
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] size-3.5" />
                            <input
                                type="text"
                                placeholder="Search by project name, code, or client..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl border border-[#e2f2e9] bg-white py-2 pl-9 pr-3 text-[13px] placeholder:text-[#94a3b8] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => refetch()}
                                className="flex items-center gap-1.5 rounded-xl border border-[#e2f2e9] bg-white px-3 py-2 text-[12px] font-medium text-[#475569] hover:bg-[#f8faf8] transition-colors"
                            >
                                <RefreshCw className="size-3.5" /> Refresh
                            </button>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-1.5 rounded-xl bg-linear-to-r from-[#00a651] to-[#008c44] px-4 py-2 text-[12px] font-medium text-white hover:from-[#008c44] hover:to-[#007a3a] transition-all shadow-sm"
                            >
                                <Plus className="size-4" /> New Project
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-1.5 rounded-xl border border-[#e2f2e9] bg-white px-3 py-1.5 text-[12px] font-medium text-[#475569] hover:bg-[#f8faf8] transition-colors"
                        >
                            <Filter className="size-3.5" />
                            Filters
                            <ChevronDown className={`size-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                        {(searchTerm || statusFilter) && (
                            <button
                                onClick={clearFilters}
                                className="text-[12px] font-medium text-rose-600 hover:text-rose-700"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                    {showFilters && (
                        <div className="bg-white rounded-xl border border-[#e2f2e9] p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="app-label block mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#475569]">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                                    >
                                        <option value="">All Status</option>
                                        {STATUS_OPTIONS.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="app-label block mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#475569]">Priority</label>
                                    <select
                                        className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                                    >
                                        <option value="">All Priorities</option>
                                        {PRIORITY_OPTIONS.map(priority => (
                                            <option key={priority} value={priority}>{priority}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Projects Table */}
                    <div className="bg-white rounded-2xl border border-[#e2f2e9] overflow-hidden">
                        <div className="app-section-bar px-4 py-3 bg-[#f8faf8] border-b border-[#e2f2e9]">
                            <h3 className="app-heading text-[14px] font-bold text-[#042f2e]">
                                All Projects ({filteredProjects.length} projects)
                            </h3>
                        </div>

                        {loading ? (
                            <LoadingSpinner />
                        ) : error ? (
                            <div className="p-6">
                                <ErrorAlert message={error} onRetry={() => refetch()} />
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            <div className="py-12 text-center">
                                <Search className="size-10 mx-auto mb-3 text-[#94a3b8]" />
                                <p className="text-[14px] font-medium text-[#042f2e] mb-1">No projects found</p>
                                <p className="text-[12px] text-[#475569]">
                                    {searchTerm || statusFilter
                                        ? "Try adjusting your search or filters"
                                        : "Get started by creating your first project"}
                                </p>
                                {!searchTerm && !statusFilter && (
                                    <button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-[#00a651] to-[#008c44] px-4 py-2 text-[12px] font-medium text-white hover:from-[#008c44] hover:to-[#007a3a] transition-all"
                                    >
                                        <Plus className="size-4" /> New Project
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-[#f8faf8]">
                                            <tr>
                                                <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">Project</th>
                                                <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">Client</th>
                                                <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">Status</th>
                                                <th className="px-4 py-2.5 text-right text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#e2f2e9]">
                                            {filteredProjects.map((project) => (
                                                <ProjectTableRow
                                                    key={project.id}
                                                    project={project}
                                                    onView={handleView}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center justify-between border-t border-[#e2f2e9] bg-[#f8faf8] px-4 py-3">
                                    <div className="text-[12px] font-medium text-[#475569]">
                                        Showing <span className="font-bold text-[#042f2e]">{filteredProjects.length}</span> of{' '}
                                        <span className="font-bold text-[#042f2e]">{projects.length}</span> projects
                                    </div>
                                    <div className="flex gap-1">
                                        <button className="rounded-lg border border-[#e2f2e9] bg-white px-2 py-1 text-[12px] text-[#475569] hover:bg-[#f8faf8] disabled:opacity-50">
                                            <ChevronLeft className="size-3.5" />
                                        </button>
                                        <button className="rounded-lg bg-[#00a651] px-3 py-1 text-[12px] font-medium text-white shadow-sm">1</button>
                                        <button className="rounded-lg border border-[#e2f2e9] bg-white px-3 py-1 text-[12px] text-[#475569] hover:bg-[#f8faf8]">2</button>
                                        <button className="rounded-lg border border-[#e2f2e9] bg-white px-3 py-1 text-[12px] text-[#475569] hover:bg-[#f8faf8]">3</button>
                                        <button className="rounded-lg border border-[#e2f2e9] bg-white px-2 py-1 text-[12px] text-[#475569] hover:bg-[#f8faf8]">
                                            <ChevronRight className="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ProjectFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    refetch();
                    setIsCreateModalOpen(false);
                }}
                companyId={companyId}
                companyCache={companyCache}
            />

            <ProjectFormModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingProject(null);
                }}
                onSuccess={() => {
                    refetch();
                    setIsEditModalOpen(false);
                    setEditingProject(null);
                }}
                initialData={editingProject || undefined}
                isEditing={true}
                companyId={companyId}
                companyCache={companyCache}
            />

            <ProjectDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedProjectId(null);
                }}
                projectId={selectedProjectId}
                companyId={companyId}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                projectName={selectedProjectName}
                loading={deleteLoading}
            />
        </div>
    );
};

export default ProjectsPage;