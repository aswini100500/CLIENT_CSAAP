import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Trash2,
  X,
  AlertCircle
} from "lucide-react";
import Swal from "sweetalert2";
import useAuth from "../../../../../../hooks/useAuth";
import { store } from "../../../../../../store/store";



const API_BASE_URL = "https://csaapnodeapi.csaap.com";
const API_ENDPOINTS = {
  PROJECTS: "/api/tenant/clprojects",
};

const getUserData = () => {
  try {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
};

const apiService = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const state = store.getState();
    const authToken = state.user?.token || sessionStorage.getItem("token");

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
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
      console.error("API Request Failed:", error);
      throw error;
    }
  },

  async createProject(payload) {
    const result = await this.request(API_ENDPOINTS.PROJECTS, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return result;
  },
};



const STATUS_OPTIONS = ["Planning", "Active", "On Hold", "Completed", "Cancelled"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];
const ENVIRONMENT_OPTIONS = ["Development", "Staging", "Production", "Testing"];



const Modal = ({ isOpen, onClose, title, children, size = "max-w-2xl", onSubmit, footer }) => {
  if (!isOpen) return null;

  const innerContent = (
    <>
      <div className="flex items-center justify-between border-b border-[#e2f2e9] px-5 py-4 shrink-0 bg-white rounded-t-2xl">
        <h2 className="text-[18px] font-bold text-[#042f2e]">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-[#475569] hover:bg-[#f0fdf4] transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="overflow-y-auto p-5 flex-1 min-h-0">
        {children}
      </div>
      {footer && (
        <div className="border-t border-[#e2f2e9] px-5 py-4 bg-white rounded-b-2xl shrink-0">
          {footer}
        </div>
      )}
    </>
  );

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
      {onSubmit ? (
        <form
          onSubmit={onSubmit}
          className={`relative w-full ${size} rounded-2xl bg-white shadow-xl z-10 flex flex-col max-h-[calc(100vh-100px)]`}
        >
          {innerContent}
        </form>
      ) : (
        <div
          className={`relative w-full ${size} rounded-2xl bg-white shadow-xl z-10 flex flex-col max-h-[calc(100vh-100px)]`}
        >
          {innerContent}
        </div>
      )}
    </div>,
    document.body
  );
};

const ErrorAlert = ({ message }) => (
  <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 mb-4">
    <div className="flex items-center gap-2">
      <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
      <div>
        <p className="text-[13px] font-medium text-rose-800">Error creating project</p>
        <p className="text-[12px] text-rose-600">{message}</p>
      </div>
    </div>
  </div>
);



const CreateProjectModal = ({ lead, onClose, onSaveSuccess }) => {
  const { user, companyId } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [client, setClient] = useState({
    company_name: "",
    slug: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    website: "",
  });

  const [project, setProject] = useState({
    project_name: "",
    project_code: "",
    slug: "",
    description: "",
    status: "Planning",
    priority: "Medium",
    start_date: "",
    end_date: "",
    budget: 0,
    estimated_hours: 0,
    technology_stack: "",
    environment: "Development",
  });

  const [locations, setLocations] = useState([{ location_name: "" }]);


  useEffect(() => {
    if (lead) {
      const initialSlug = user?.slug || generateSlug(lead.name || "client");
      
      setClient({
        company_name: lead.name || "",
        slug: initialSlug,
        contact_person: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        address: lead.location || "",
        website: "",
      });


      const shortId = lead.id ? String(lead.id).slice(-4).toUpperCase() : Math.random().toString(36).substr(2, 4).toUpperCase();
      setProject({
        project_name: lead.name ? `${lead.name} Project` : "",
        project_code: `PROJ-${shortId}`,
        slug: initialSlug,
        description: "",
        status: "Planning",
        priority: "Medium",
        start_date: "",
        end_date: "",
        budget: 0,
        estimated_hours: 0,
        technology_stack: "",
        environment: "Development",
      });

      setLocations(lead.location ? [{ location_name: lead.location }] : [{ location_name: "" }]);
    }
  }, [lead, user?.slug]);

  const addLocation = () => {
    setLocations([...locations, { location_name: "" }]);
  };

  const removeLocation = (index) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const updateLocation = (index, value) => {
    const updated = [...locations];
    updated[index].location_name = value;
    setLocations(updated);
  };

  const handleClientChange = (field, value) => {
    setClient((prev) => ({ ...prev, [field]: value }));
  };

  const handleProjectChange = (field, value) => {
    setProject((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userSlug = user?.slug || generateSlug(project.project_name);
      
      const validLocations = locations
        .filter((l) => l.location_name && l.location_name.trim() !== "")
        .map((loc) => ({
          location_name: loc.location_name,
          slug: user?.slug || userSlug,
          companyId: companyId,
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
          slug: userSlug,
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
          slug: userSlug,
        },
        locations: validLocations,
        slug: userSlug,
        companyId: companyId,
      };


      await apiService.createProject(createPayload);

      await Swal.fire({
        title: "Success!",
        text: "Project created successfully!",
        icon: "success",
        confirmButtonColor: "#00a651",
      });

      if (onSaveSuccess) {
        onSaveSuccess();
      }
      onClose();
    } catch (err) {
      console.error("Failed to create project from lead:", err);
      setError(err.message);
      Swal.fire({
        title: "Error!",
        text: `Failed to create project: ${err.message}`,
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const footerContent = (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl border border-[#e2f2e9] bg-white px-4 py-2 text-[13px] font-medium text-[#475569] hover:bg-[#f8faf8] transition-colors cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-linear-to-r from-[#00a651] to-[#008c44] px-4 py-2 text-[13px] font-medium text-white hover:from-[#008c44] hover:to-[#007a3a] transition-all disabled:opacity-50 shadow-sm cursor-pointer"
      >
        {loading ? "Saving..." : "Create Project"}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create Project from Lead"
      size="max-w-3xl"
      onSubmit={handleSubmit}
      footer={footerContent}
    >
      <div className="space-y-6">
        {error && <ErrorAlert message={error} />}


        <div>
          <h3 className="text-[16px] font-bold text-[#042f2e] mb-3">Client Information</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Company Name *</label>
              <input
                type="text"
                value={client.company_name}
                onChange={(e) => handleClientChange("company_name", e.target.value)}
                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                required
              />
            </div>
            <div>
              <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Contact Person</label>
              <input
                type="text"
                value={client.contact_person}
                onChange={(e) => handleClientChange("contact_person", e.target.value)}
                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
              />
            </div>
            <div>
              <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Email</label>
              <input
                type="email"
                value={client.email}
                onChange={(e) => handleClientChange("email", e.target.value)}
                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
              />
            </div>
            <div>
              <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Phone</label>
              <input
                type="text"
                value={client.phone}
                onChange={(e) => handleClientChange("phone", e.target.value)}
                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Address</label>
              <input
                type="text"
                value={client.address}
                onChange={(e) => handleClientChange("address", e.target.value)}
                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Website</label>
              <input
                type="url"
                value={client.website}
                onChange={(e) => handleClientChange("website", e.target.value)}
                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
              />
            </div>
          </div>
        </div>


        <div>
          <h3 className="text-[16px] font-bold text-[#042f2e] mb-3">Project Details</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Project Name *</label>
              <input
                type="text"
                value={project.project_name}
                onChange={(e) => handleProjectChange("project_name", e.target.value)}
                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                required
              />
            </div>
            <div>
              <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Project Code *</label>
              <input
                type="text"
                value={project.project_code}
                onChange={(e) => handleProjectChange("project_code", e.target.value)}
                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] font-mono focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Description</label>
              <textarea
                value={project.description}
                onChange={(e) => handleProjectChange("description", e.target.value)}
                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                rows={3}
              />
            </div>
            <div>
              <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Status</label>
              <select
                value={project.status}
                onChange={(e) => handleProjectChange("status", e.target.value)}
                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Priority</label>
              <select
                value={project.priority}
                onChange={(e) => handleProjectChange("priority", e.target.value)}
                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Start Date</label>
              <input
                type="date"
                value={project.start_date}
                onChange={(e) => handleProjectChange("start_date", e.target.value)}
                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
              />
            </div>
            <div>
              <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">End Date</label>
              <input
                type="date"
                value={project.end_date}
                onChange={(e) => handleProjectChange("end_date", e.target.value)}
                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
              />
            </div>
            <div>
              <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Budget ($)</label>
              <input
                type="number"
                placeholder="0"
                value={project.budget || ""}
                onChange={(e) => handleProjectChange("budget", parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
              />
            </div>
            <div>
              <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Estimated Hours</label>
              <input
                type="number"
                placeholder="0"
                value={project.estimated_hours || ""}
                onChange={(e) => handleProjectChange("estimated_hours", parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Technology Stack</label>
              <input
                type="text"
                placeholder="React, Node.js, MongoDB"
                value={project.technology_stack}
                onChange={(e) => handleProjectChange("technology_stack", e.target.value)}
                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
              />
            </div>
            <div>
              <label className="modal-label block mb-1 text-[12px] font-bold text-[#475569]">Environment</label>
              <select
                value={project.environment}
                onChange={(e) => handleProjectChange("environment", e.target.value)}
                className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
              >
                {ENVIRONMENT_OPTIONS.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </div>
          </div>
        </div>


        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[16px] font-bold text-[#042f2e]">Project Locations</h3>
            <button
              type="button"
              onClick={addLocation}
              className="flex items-center gap-1.5 rounded-lg bg-[#ecfdf5] px-3 py-1.5 text-[12px] font-medium text-[#00a651] hover:bg-[#d1fae5] transition-colors cursor-pointer"
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
                    placeholder="Location name"
                    value={loc.location_name}
                    onChange={(e) => updateLocation(idx, e.target.value)}
                    className="w-full rounded-xl border border-[#e2f2e9] px-3 py-2 text-[13px] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[rgba(0,166,81,0.16)] transition-all"
                  />
                </div>
                {locations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLocation(idx)}
                    className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
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

      </div>
    </Modal>
  );
};

export default CreateProjectModal;
