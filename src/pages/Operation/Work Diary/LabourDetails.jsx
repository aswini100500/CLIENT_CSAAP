import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Save } from "lucide-react";
import Swal from "sweetalert2";
import operationApi from "../../../api/operation";

const LabourDetails = ({ projectSetup }) => {
  const DEFAULT_ROLES = [
    "engineers",
    "supervisors",
    "carpenters",
    "masons",
    "helpers",
    "plumber",
    "blacksmith",
    "metalsmith",
    "majdoor_male",
    "majdoor_female",
  ];

  const [labour, setLabour] = useState(
    DEFAULT_ROLES.reduce((acc, role) => ({ ...acc, [role]: 0 }), {})
  );

  const [newRole, setNewRole] = useState("");
  const [savedData, setSavedData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectSetup) {
      fetchLabourDetails();
    }
  }, [projectSetup]);

  const fetchLabourDetails = async () => {
    try {
      setLoading(true);
      const res = await operationApi.getLabourDetails();
      const details = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const existingData = details.find(d => d.project_setup_id === projectSetup.id);
      if (existingData) {
        let loadedLabour = existingData.labour_data;
        if (typeof loadedLabour === 'string') {
          try { loadedLabour = JSON.parse(loadedLabour); } catch (e) { loadedLabour = {}; }
        }
        setLabour(loadedLabour || {});
        setSavedData(loadedLabour);
      } else {
          setLabour(DEFAULT_ROLES.reduce((acc, role) => ({ ...acc, [role]: 0 }), {}));
          setSavedData(null);
      }
    } catch (error) {
      console.error("Error fetching labour details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLabour({ ...labour, [name]: Number(value) });
  };

  // Add a new role dynamically
  const handleAddRole = () => {
    const role = newRole.trim().toLowerCase().replace(/\s+/g, "_");
    if (!role)
      return Swal.fire("Oops!", "Please enter a valid role name!", "warning");
    if (labour[role] !== undefined)
      return Swal.fire("Duplicate!", "Role already exists!", "info");

    setLabour({ ...labour, [role]: 0 });
    setNewRole("");
    Swal.fire("Added!", "New labour role added successfully.", "success");
  };

  // Delete a custom role
  const handleDeleteRole = (role) => {
    const updated = { ...labour };
    delete updated[role];
    setLabour(updated);
    Swal.fire(
      "Deleted!",
      `${role.replace(/_/g, " ")} removed successfully.`,
      "success"
    );
  };

  // Save and show data
  const handleSave = async () => {
    if (!projectSetup) {
        return Swal.fire("Error", "Please complete Project Setup first!", "error");
    }

    try {
        setLoading(true);
        const submissionData = {
            project_setup_id: projectSetup.id,
            labour_data: JSON.stringify(labour), // Sending as stringified JSON
            remarks: "Daily labour allocation"
        };

        const res = await operationApi.getLabourDetails();
        const details = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const existingData = details.find(d => d.project_setup_id === projectSetup.id);

        if (existingData) {
            await operationApi.updateLabourDetails(existingData.id, submissionData);
        } else {
            await operationApi.createLabourDetails(submissionData);
        }

        setSavedData(labour);
        Swal.fire({
            icon: "success",
            title: "Labour Details Saved!",
            text: "Your labour details have been saved successfully.",
            timer: 2000,
            showConfirmButton: false,
        });
        fetchLabourDetails(); // Refresh
    } catch (error) {
        console.error("Error saving labour details:", error);
        Swal.fire("Error", "Failed to save labour details.", "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-[95%] mx-auto max-w-6xl bg-gray-50 p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        Labour Details
      </h2>

      {/* Add new role input */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter new role (e.g., Electrician)"
          className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        />
        <button
          onClick={handleAddRole}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          <PlusCircle size={18} /> Add Role
        </button>
      </div>

      {/* Labour roles grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.keys(labour).map((role) => (
          <div
            key={role}
            className="flex justify-between items-center bg-white border border-gray-200 shadow-sm rounded-lg p-2 hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <label className="capitalize font-medium text-gray-700 w-36">
                {role.replace(/_/g, " ")}:
              </label>
              <input
                type="number"
                min="0"
                name={role}
                value={labour[role]}
                onChange={handleChange}
                className="border border-gray-300 p-1.5 rounded w-24 text-center focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* Allow delete only for custom-added roles */}
            {!DEFAULT_ROLES.includes(role) && (
              <button
                onClick={() => handleDeleteRole(role)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="mt-8 text-right">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition mx-auto sm:mx-0"
        >
          <Save size={18} /> Save Labour Details
        </button>
      </div>

      {/* Display saved table */}
      {savedData && (
        <div className="mt-10 bg-white shadow-md rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
            Saved Labour Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(savedData).map(([role, count]) => (
              <div
                key={role}
                className="border border-gray-100 rounded-lg p-4 bg-gray-50 hover:shadow transition"
              >
                <p className="font-semibold capitalize text-gray-800">
                  {role.replace(/_/g, " ")}
                </p>
                <p className="text-xl font-bold text-blue-700 mt-1">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LabourDetails;