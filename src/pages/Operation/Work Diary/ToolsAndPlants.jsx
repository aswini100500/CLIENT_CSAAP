import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Save } from "lucide-react";
import Swal from "sweetalert2";
import operationApi from "../../../api/operation";

const ToolsAndPlants = ({ projectSetup }) => {
  const DEFAULT_TOOLS = ["jcb", "concreteMixer", "transit Mixer", "tractor", "vibrator"];

  const [tools, setTools] = useState(
    DEFAULT_TOOLS.reduce((acc, tool) => ({ ...acc, [tool]: 0 }), {})
  );
  const [newTool, setNewTool] = useState("");
  const [savedData, setSavedData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectSetup) {
      fetchToolsDetails();
    }
  }, [projectSetup]);

  const fetchToolsDetails = async () => {
    try {
      setLoading(true);
      const res = await operationApi.getToolsPlants();
      const details = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const existingData = details.find(d => d.project_setup_id === projectSetup.id);
      if (existingData) {
        let loadedTools = existingData.tools_data;
        if (typeof loadedTools === 'string') {
          try { loadedTools = JSON.parse(loadedTools); } catch (e) { loadedTools = {}; }
        }
        setTools(loadedTools || {});
        setSavedData(loadedTools);
      } else {
        setTools(DEFAULT_TOOLS.reduce((acc, tool) => ({ ...acc, [tool]: 0 }), {}));
        setSavedData(null);
      }
    } catch (error) {
      console.error("Error fetching tools details:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setTools({ ...tools, [name]: Number(value) });
  };


  const handleAddTool = () => {
    const tool = newTool.trim().replace(/\s+/g, "_");
    if (!tool) return Swal.fire("Oops!", "Please enter a valid tool name!", "warning");
    if (tools[tool] !== undefined) return Swal.fire("Duplicate!", "Tool already exists!", "info");

    setTools({ ...tools, [tool]: 0 });
    setNewTool("");
    Swal.fire("Added!", "New tool added successfully.", "success");
  };


  const handleDeleteTool = (tool) => {
    const updated = { ...tools };
    delete updated[tool];
    setTools(updated);
    Swal.fire("Deleted!", `${tool.replace(/_/g, " ")} removed successfully.`, "success");
  };


  const handleSave = async () => {
    if (!projectSetup) {
        return Swal.fire("Error", "Please complete Project Setup first!", "error");
    }

    try {
        setLoading(true);
        const submissionData = {
            project_setup_id: projectSetup.id,
            tools_data: JSON.stringify(tools),
            remarks: "Daily tools allocation"
        };

        const res = await operationApi.getToolsPlants();
        const details = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const existingData = details.find(d => d.project_setup_id === projectSetup.id);

        if (existingData) {
            await operationApi.updateToolsPlants(existingData.id, submissionData);
        } else {
            await operationApi.createToolsPlants(submissionData);
        }

        setSavedData(tools);
        Swal.fire({
            icon: "success",
            title: "Tools & Plants Saved!",
            text: "Your tools and plants details have been saved.",
            timer: 2000,
            showConfirmButton: false,
        });
        fetchToolsDetails();
    } catch (error) {
        console.error("Error saving tools details:", error);
        Swal.fire("Error", "Failed to save tools details.", "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-[95%] mx-auto max-w-6xl bg-gray-50 p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Tools & Plants</h2>


      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter new tool (e.g., Crane)"
          className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={newTool}
          onChange={(e) => setNewTool(e.target.value)}
        />
        <button
          onClick={handleAddTool}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          <PlusCircle size={18} /> Add Tool
        </button>
      </div>


      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.keys(tools).map((tool) => (
          <div
            key={tool}
            className="flex justify-between items-center bg-white border border-gray-200 shadow-sm rounded-lg p-2 hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <label className="capitalize font-medium text-gray-700 w-36">
                {tool.replace(/_/g, " ").replace(/([A-Z])/g, " $1")}:
              </label>
              <input
                type="number"
                min="0"
                name={tool}
                value={tools[tool]}
                onChange={handleChange}
                className="border border-gray-300 p-1.5 rounded w-24 text-center focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>


            {!DEFAULT_TOOLS.includes(tool) && (
              <button
                onClick={() => handleDeleteTool(tool)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
      </div>


      <div className="mt-8 text-right">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition mx-auto sm:mx-0"
        >
          <Save size={18} /> Save Tools & Plants
        </button>
      </div>


      {savedData && (
        <div className="mt-10 bg-white shadow-md rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Saved Tools & Plants</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(savedData).map(([tool, count]) => (
              <div
                key={tool}
                className="border border-gray-100 rounded-lg p-4 bg-gray-50 hover:shadow transition"
              >
                <p className="font-semibold capitalize text-gray-800">
                  {tool.replace(/_/g, " ").replace(/([A-Z])/g, " $1")}
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

export default ToolsAndPlants;
