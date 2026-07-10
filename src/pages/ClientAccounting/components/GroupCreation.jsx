import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";

const GroupCreation = () => {
  const { companyId } = useCompany();

  const API = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group`;

  const [formData, setFormData] = useState({
    groupName: "",
    alias: "",
    under: "",
    nature: "",
    subLedger: "No",
  });

  const [groups, setGroups] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (companyId) fetchGroups();
  }, [companyId]);

  const fetchGroups = async () => {
    const res = await axios.get(`${API}/all/${companyId}`);
    setGroups(res.data);
  };

  useEffect(() => {
    if (selectedId) {
      loadSingleGroup(selectedId);
    } else {
      resetForm();
    }
  }, [selectedId]);

  const loadSingleGroup = async (id) => {
    const res = await axios.get(`${API}/${companyId}/${id}`);
    setFormData(res.data);
    setEditMode(true);
  };

  const resetForm = () => {
    setFormData({
      groupName: "",
      alias: "",
      under: "",
      nature: "",
      subLedger: "No",
    });
    setEditMode(false);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      if (!companyId) {
        alert("❌ No company selected!");
        return;
      }

      if (editMode) {
        await axios.put(`${API}/${companyId}/${selectedId}`, formData);
        alert("✅ Group updated successfully!");
      } else {
        await axios.post(`${API}/${companyId}`, formData);
        alert("✅ Group created successfully!");
      }

      fetchGroups();
      resetForm();
      setSelectedId("");
    } catch (err) {
      alert("❌ Error saving group");
    }
  };

  return (
    <div className="min-h-screen w-full bg-white font-[monospace] flex justify-center px-3 py-6">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-md p-6 border border-gray-300">
        <h2 className="text-center text-lg md:text-xl text-blue-800 font-semibold mb-6">
          Group Creation {editMode && "(Editing)"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-y-4 gap-x-4 items-center">
          <label className="md:text-right text-gray-700">Name :</label>
          <input
            type="text"
            value={formData.groupName}
            onChange={(e) => handleChange("groupName", e.target.value)}
            className="border border-gray-400 p-2 w-full rounded-sm text-sm focus:ring-1 focus:ring-blue-400"
          />

          <label className="md:text-right text-gray-700">Alias :</label>
          <input
            type="text"
            value={formData.alias}
            onChange={(e) => handleChange("alias", e.target.value)}
            className="border border-gray-400 p-2 w-full rounded-sm text-sm"
          />

          <label className="md:text-right text-gray-700">
            Nature of Group :
          </label>
          <select
            value={formData.nature}
            onChange={(e) => handleChange("nature", e.target.value)}
            className="border border-gray-400 p-2 w-full rounded-sm text-sm"
          >
            <option value="">-- Select Nature --</option>
            <option value="Assets">Assets</option>
            <option value="Liabilities">Liabilities</option>
            <option value="Income">Income</option>
            <option value="Expenses">Expenses</option>
          </select>

          <label className="md:text-right text-gray-700">
            Behaves like a Sub-Ledger :
          </label>
          <select
            value={formData.subLedger}
            onChange={(e) => handleChange("subLedger", e.target.value)}
            className="border border-gray-400 p-2 w-full rounded-sm text-sm"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        <div className="border-t border-gray-400 my-6"></div>

        <div className="flex justify-center gap-6">
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-sm text-sm"
          >
            Yes
          </button>

          <button
            onClick={resetForm}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-sm text-sm"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupCreation;
