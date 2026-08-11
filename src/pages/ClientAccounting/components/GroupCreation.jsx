import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Save, RotateCcw, X, ArrowLeft, Layers, BarChart2 } from "lucide-react";
import Swal from "sweetalert2";

import useAuth from "../../../hooks/useAuth";

const API = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group`;

const GroupCreation = () => {
  const { role: userRole, companyId } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const role = userRole || "admin";
  const listPath =
    role === "employee"
      ? "/employee/hr/accounting/client/listOfGroups"
      : "/accounting/client/listOfGroups";

  const [formData, setFormData] = useState({
    groupName: "",
    alias: "",
    under: "",
    nature: "",
    subLedger: "No",
  });

  const [loading, setLoading] = useState(false);

  const [isGlobal, setIsGlobal] = useState(false);

  const handleChange = (field, value) => {
    if (isGlobal) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setIsGlobal(false);
    setFormData({
      groupName: "",
      alias: "",
      under: "",
      nature: "",
      subLedger: "No",
    });
  };

  useEffect(() => {
    if (!id || !companyId) return;

    const fetchGroup = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/${companyId}/${id}`);
        const data = res.data;
        const globalGroup =
          data.companyId === null || data.companyId === undefined;
        setIsGlobal(globalGroup);

        setFormData({
          groupName: data.groupName || "",
          alias: data.alias || "",
          under: data.under || "",
          nature: data.nature || "",
          subLedger: data.subLedger || "No",
        });

        if (globalGroup) {
          Swal.fire({
            icon: "info",
            title: "Default Global Group",
            text: "This is a default global system group and cannot be modified.",
          });
        }
      } catch (err) {
        console.error("Error fetching group:", err);
        Swal.fire("Error", "Could not load group data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id, companyId]);

  const handleSubmit = async () => {
    if (isGlobal) {
      Swal.fire(
        "Info",
        "Default global system groups cannot be modified.",
        "info",
      );
      return;
    }
    if (!formData.groupName) {
      Swal.fire("Error", "Group name is required!", "error");
      return;
    }
    if (!companyId) {
      Swal.fire("Error", "Company not selected!", "error");
      return;
    }

    try {
      if (id) {
        await axios.put(`${API}/${companyId}/${id}`, formData);
        Swal.fire({
          icon: "success",
          title: "Group Updated Successfully",
          text: "The group has been updated.",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(listPath);
        return;
      } else {
        await axios.post(`${API}/${companyId}`, formData);

        const result = await Swal.fire({
          icon: "success",
          title: "Group Created Successfully",
          text: "The group has been saved. Would you like to create another group?",
          showCancelButton: true,
          confirmButtonColor: "#00a651",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Create Another",
          cancelButtonText: "Go to Group List",
        });

        if (!result.isConfirmed) {
          navigate(listPath);
          return;
        }

        resetForm();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Could not save group!";
      Swal.fire("Error", msg, "error");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans">
      <div className="max-w-3xl mx-auto bg-white app-panel border border-[#e2f2e9]/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex justify-between items-center border-b border-[#e2f2e9] pb-5 mb-8">
          <h2 className="app-title text-xl font-extrabold text-[#042f2e]">
            {id ? "Group Alteration" : "Group Creation"}
          </h2>
          <button
            onClick={() => navigate(listPath)}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors text-sm font-medium cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Group List
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 text-sm italic">
            Loading group data...
          </div>
        ) : (
          <>
            <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
              <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider mb-5 border-b border-[#cbe0d2] pb-1.5 flex items-center gap-2">
                <Layers size={16} className="text-[#00a651]" /> Group Identity
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                    Group Name : <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.groupName}
                    onChange={(e) => handleChange("groupName", e.target.value)}
                    className="app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium"
                    placeholder="Enter group name"
                  />
                </div>

                <div>
                  <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                    (alias) :
                  </label>
                  <input
                    type="text"
                    value={formData.alias}
                    onChange={(e) => handleChange("alias", e.target.value)}
                    className="app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium"
                    placeholder="Enter alias (optional)"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
              <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider mb-5 border-b border-[#cbe0d2] pb-1.5 flex items-center gap-2">
                <BarChart2 size={16} className="text-[#00a651]" />{" "}
                Classification &amp; Behaviour
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                    Nature of Group :
                  </label>
                  <select
                    value={formData.nature}
                    onChange={(e) => handleChange("nature", e.target.value)}
                    className="app-input w-full mt-1 bg-white border-[#c8ddcd]! text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] cursor-pointer font-medium"
                  >
                    <option value="">-- Select Nature --</option>
                    <option value="Assets">Assets</option>
                    <option value="Liabilities">Liabilities</option>
                    <option value="Income">Income</option>
                    <option value="Expenses">Expenses</option>
                  </select>
                </div>

                <div>
                  <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                    Behaves like a Sub-Ledger :
                  </label>
                  <select
                    value={formData.subLedger}
                    onChange={(e) => handleChange("subLedger", e.target.value)}
                    className="app-input w-full mt-1 bg-white border-[#c8ddcd]! text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] cursor-pointer font-medium"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-4 italic">
                Enabling sub-ledger allows ledgers under this group to act as
                individual cost centres.
              </p>
            </div>

            <div className="mt-8 flex justify-end gap-4 border-t border-[#e2f2e9] pt-6">
              <button
                onClick={handleSubmit}
                className="app-btn-primary flex items-center justify-center gap-2 cursor-pointer shadow-md min-w-30 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Save size={16} /> {id ? "Update Group" : "Save Group"}
              </button>

              <button
                onClick={resetForm}
                className="app-btn-secondary flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 hover:text-slate-800 min-w-30 transition-all"
              >
                <RotateCcw size={16} /> Reset Form
              </button>

              <button
                onClick={() => navigate(listPath)}
                className="app-btn-secondary flex items-center justify-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl cursor-pointer hover:bg-rose-100 hover:text-rose-800 hover:border-rose-300 min-w-30 transition-all"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupCreation;
