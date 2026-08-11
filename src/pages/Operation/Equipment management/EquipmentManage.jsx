import { PlusCircle, Edit2, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";

import operationApi from "../../../api/operation";

const EquipmentManage = () => {
  const [loading, setLoading] = useState(false);
  const [equipments, setEquipments] = useState([]);

  const [newEquipment, setNewEquipment] = useState({
    name: "",
    odometer_start: "",
    odometer_end: "",
    cost: "",
    number_plate: "",
    fuel_type: "Diesel",
    status: "Available",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const response = await operationApi.getEquipments();

      setEquipments(response.data.data);
    } catch (error) {
      console.error("Error fetching equipments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = async () => {
    if (
      !newEquipment.name ||
      !newEquipment.odometer_start ||
      !newEquipment.odometer_end ||
      !newEquipment.cost ||
      !newEquipment.number_plate ||
      !newEquipment.fuel_type
    ) {
      alert("Please fill in all fields before adding an equipment.");
      return;
    }

    try {
      setLoading(true);
      const equipmentData = {
        ...newEquipment,
        odometer_start: Number(newEquipment.odometer_start),
        odometer_end: Number(newEquipment.odometer_end),
        cost: Number(newEquipment.cost),
      };
      await operationApi.createEquipment(equipmentData);
      setNewEquipment({
        name: "",
        odometer_start: "",
        odometer_end: "",
        cost: "",
        number_plate: "",
        fuel_type: "Diesel",
        status: "Available",
        description: "",
      });
      fetchEquipments();
    } catch (error) {
      console.error("Error adding equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await operationApi.deleteEquipment(id);
      fetchEquipments();
    } catch (error) {
      console.error("Error deleting equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    const equipment = equipments.find((v) => v.id === id);
    setNewEquipment(equipment);
    setEditingId(id);
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const equipmentData = {
        ...newEquipment,
        odometer_start: Number(newEquipment.odometer_start),
        odometer_end: Number(newEquipment.odometer_end),
        cost: Number(newEquipment.cost),
      };
      await operationApi.updateEquipment(editingId, equipmentData);
      setEditingId(null);
      setNewEquipment({
        name: "",
        odometer_start: "",
        odometer_end: "",
        cost: "",
        number_plate: "",
        fuel_type: "Diesel",
        status: "Available",
        description: "",
      });
      fetchEquipments();
    } catch (error) {
      console.error("Error updating equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 bg-white rounded-xl shadow-md border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4 mb-6">
        <input
          type="text"
          placeholder="Equipment Name"
          value={newEquipment.name}
          onChange={(e) =>
            setNewEquipment({ ...newEquipment, name: e.target.value })
          }
          className="border border-gray-300 rounded-lg p-2 text-sm"
        />
        <input
          type="number"
          placeholder="Odometer Start"
          value={newEquipment.odometer_start}
          onChange={(e) =>
            setNewEquipment({ ...newEquipment, odometer_start: e.target.value })
          }
          className="border border-gray-300 rounded-lg p-2 text-sm"
        />
        <input
          type="number"
          placeholder="Odometer End"
          value={newEquipment.odometer_end}
          onChange={(e) =>
            setNewEquipment({ ...newEquipment, odometer_end: e.target.value })
          }
          className="border border-gray-300 rounded-lg p-2 text-sm"
        />
        <input
          type="number"
          placeholder="Cost (₹)"
          value={newEquipment.cost}
          onChange={(e) =>
            setNewEquipment({ ...newEquipment, cost: e.target.value })
          }
          className="border border-gray-300 rounded-lg p-2 text-sm"
        />
        <input
          type="text"
          placeholder="Number Plate"
          value={newEquipment.number_plate}
          onChange={(e) =>
            setNewEquipment({ ...newEquipment, number_plate: e.target.value })
          }
          className="border border-gray-300 rounded-lg p-2 text-sm"
        />

        <select
          value={newEquipment.fuel_type}
          onChange={(e) =>
            setNewEquipment({ ...newEquipment, fuel_type: e.target.value })
          }
          className="border border-gray-300 rounded-lg p-2 text-sm"
        >
          <option value="Diesel">Diesel</option>
          <option value="Petrol">Petrol</option>
          <option value="CNG">CNG</option>
          <option value="Electric">Electric</option>
          <option value="Hybrid">Hybrid</option>
        </select>

        <div className="erp-root">
          <button
            onClick={editingId ? handleUpdate : handleAddEquipment}
            disabled={loading}
            className="app-btn-primary flex items-center justify-center gap-1"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <PlusCircle className="w-4 h-4" />
            )}
            {loading ? "Processing..." : editingId ? "Update" : "Add"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead className="bg-green-50 text-green-900">
            <tr>
              <th className="border border-gray-200 p-2 text-left">#</th>
              <th className="border border-gray-200 p-2 text-left">
                Equipment Name
              </th>
              <th className="border border-gray-200 p-2 text-left">
                Odometer Start
              </th>
              <th className="border border-gray-200 p-2 text-left">
                Odometer End
              </th>
              <th className="border border-gray-200 p-2 text-left">Distance</th>
              <th className="border border-gray-200 p-2 text-left">Cost (₹)</th>
              <th className="border border-gray-200 p-2 text-left">
                Number Plate
              </th>
              <th className="border border-gray-200 p-2 text-left">
                Fuel Type
              </th>
              <th className="border border-gray-200 p-2 text-left">Status</th>
              <th className="border border-gray-200 p-2 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {equipments.length > 0 ? (
              equipments.map((eq, index) => {
                const totalHours = eq.odometer_end - eq.odometer_start;
                return (
                  <tr key={eq.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 p-2">{index + 1}</td>
                    <td className="border border-gray-200 p-2">{eq.name}</td>
                    <td className="border border-gray-200 p-2">
                      {eq.odometer_start}
                    </td>
                    <td className="border border-gray-200 p-2">
                      {eq.odometer_end}
                    </td>
                    <td className="border border-gray-200 p-2 font-semibold text-blue-700">
                      {totalHours}
                    </td>
                    <td className="border border-gray-200 p-2">
                      ₹{eq.cost.toLocaleString()}
                    </td>
                    <td className="border border-gray-200 p-2">
                      {eq.number_plate}
                    </td>
                    <td className="border border-gray-200 p-2">
                      {eq.fuel_type}
                    </td>
                    <td className="border border-gray-200 p-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          eq.status === "Available"
                            ? "bg-green-100 text-green-700"
                            : eq.status === "In Use"
                              ? "bg-yellow-100 text-yellow-700"
                              : eq.status === "Maintenance"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                        }`}
                      >
                        {eq.status}
                      </span>
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <button
                        onClick={() => handleEdit(eq.id)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(eq.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="10"
                  className="text-center py-4 text-gray-500 italic"
                >
                  No equipment available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EquipmentManage;
