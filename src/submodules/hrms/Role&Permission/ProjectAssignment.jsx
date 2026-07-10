import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit2, Trash2, X, Shield } from "lucide-react";
import useAuth from "../../../hooks/useAuth";

const ProjectAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    employeeid: "",
    project_id: "",
    project_role: "",
  });

  const { user, token, companyId } = useAuth();
  const company_id = companyId || 1;

  const API_ASSIGNMENTS = `${import.meta.env.VITE_CSAAP_URL}/api/tenant/project-assignments`;
  const API_EMPLOYEES = `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/all-employees`;
  const API_PROJECTS = `${import.meta.env.VITE_CSAAP_URL}/api/tenant/clprojects?company_id=${company_id}`;

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assignRes, empRes, projRes] = await Promise.all([
        axios.get(API_ASSIGNMENTS, { headers }),
        axios.get(API_EMPLOYEES, { headers }),
        axios
          .get(API_PROJECTS, { headers })
          .catch(() => ({ data: { data: [] } })),
      ]);

      setAssignments(assignRes.data.data || []);
      setEmployees(empRes.data.data || []);
      setProjects(projRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (assignment = null) => {
    if (assignment) {
      setEditId(assignment.id);
      setFormData({
        employeeid: assignment.employeeid,
        project_id: assignment.project_id,
        project_role: assignment.project_role,
      });
    } else {
      setEditId(null);
      setFormData({ employeeid: "", project_id: "", project_role: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_ASSIGNMENTS}/${editId}`, formData, { headers });
        alert("Assignment updated successfully!");
      } else {
        await axios.post(API_ASSIGNMENTS, formData, { headers });
        alert("Employee assigned to project successfully!");
      }
      closeModal();
      fetchData();
    } catch (error) {
      console.error("Error saving assignment:", error);
      alert("Failed to save assignment. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to remove this employee from the project?",
      )
    ) {
      try {
        await axios.delete(`${API_ASSIGNMENTS}/${id}`, { headers });
        fetchData();
      } catch (error) {
        console.error("Error deleting assignment:", error);
        alert("Failed to delete assignment.");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Shield className="mr-3 text-blue-600" />
            Control Panel: Project Assignments
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage employee allocations and roles for active projects.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-all shadow-md"
        >
          <Plus size={18} className="mr-2" /> Assign Employee
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading assignments...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase text-xs font-semibold">
                  <th className="p-4">Employee Name</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Project Role</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length > 0 ? (
                  assignments.map((assign) => (
                    <tr
                      key={assign.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 font-medium text-gray-800">
                        {employees.find((e) => e.id === assign.employeeid)
                          ?.name || `Employee ID: ${assign.employeeid}`}
                      </td>
                      <td className="p-4 text-gray-600">
                        {projects.find((p) => p.id === assign.project_id)
                          ?.project_name || `Project ID: ${assign.project_id}`}
                      </td>
                      <td className="p-4">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                          {assign.project_role}
                        </span>
                      </td>
                      <td className="p-4 flex justify-center space-x-3">
                        <button
                          onClick={() => openModal(assign)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(assign.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">
                      No project assignments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">
                {editId ? "Edit Assignment" : "Assign to Project"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Employee
                </label>
                <select
                  name="employeeid"
                  value={formData.employeeid}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Project
                </label>
                <select
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.project_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Role
                </label>
                <input
                  type="text"
                  name="project_role"
                  value={formData.project_role}
                  onChange={handleInputChange}
                  placeholder="e.g. Lead Developer, Sales Agent"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editId ? "Save Changes" : "Assign Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectAssignments;
