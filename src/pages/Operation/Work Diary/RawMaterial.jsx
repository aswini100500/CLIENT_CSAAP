import React, { useState, useEffect } from "react";
import { FaWarehouse, FaPlus, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import operationApi from "../../../api/operation";

const RawMaterial = ({ projectSetup }) => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState("store");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (projectSetup) {
      fetchEquipment();
    }
  }, [projectSetup]);

  const fetchEquipment = async () => {
    try {
      setIsLoading(true);
      const res = await operationApi.getRawMaterials();
      const details = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const existingData = details.filter(
        (d) => d.project_setup_id === projectSetup.id,
      );
      if (existingData.length > 0) {
        setEquipmentList(existingData);
      }
    } catch (error) {
      console.error("Error fetching equipment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addEquipment = async () => {
    if (!name.trim() || !quantity) {
      return Swal.fire("Warning", "Please fill in all fields.", "warning");
    }

    try {
      setIsLoading(true);
      const submissionData = {
        project_setup_id: projectSetup.id,
        item_name: name,
        quantity: quantity,
        source_type: type,
        unit: "Nos",
      };

      await operationApi.createRawMaterial(submissionData);

      setEquipmentList((prev) => [
        ...prev,
        { ...submissionData, id: Date.now() },
      ]);
      setName("");
      setQuantity("");
      Swal.fire("Success", "Equipment added successfully.", "success");
    } catch (error) {
      console.error("Error adding equipment:", error);
      Swal.fire("Error", "Failed to add equipment.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const removeEquipment = async (id) => {
    setEquipmentList((prev) => prev.filter((eq) => eq.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <FaWarehouse className="text-blue-600" /> Equipment & Raw Materials
      </h2>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <FaPlus size={16} /> Add New Entry
        </h3>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Equipment/Material Name"
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="w-full md:w-32">
            <input
              type="number"
              placeholder="Quantity"
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400 outline-none"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="w-full md:w-40">
            <select
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400 outline-none bg-white"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={isLoading}
            >
              <option value="store">Store</option>
              <option value="own">Own</option>
            </select>
          </div>
          <button
            onClick={addEquipment}
            disabled={isLoading || !projectSetup}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? (
              "Adding..."
            ) : (
              <>
                <FaPlus /> Add
              </>
            )}
          </button>
        </div>
      </div>

      {equipmentList.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-bold border-b border-gray-200">
                <th className="p-4">#</th>
                <th className="p-4">Material Name</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {equipmentList.map((eq, index) => (
                <tr
                  key={eq.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 text-gray-500">{index + 1}</td>
                  <td className="p-4 font-medium text-gray-800">
                    {eq.item_name}
                  </td>
                  <td className="p-4 text-gray-600">
                    {eq.quantity} {eq.unit}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        eq.source_type === "store"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {eq.source_type}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => removeEquipment(eq.id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-2"
                    >
                      <FaTrash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <FaWarehouse className="mx-auto text-gray-300 mb-2" size={48} />
          <p className="text-gray-500">
            No equipment added yet for this project.
          </p>
        </div>
      )}
    </div>
  );
};

export default RawMaterial;
