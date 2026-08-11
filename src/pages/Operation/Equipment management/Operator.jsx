import React, { useState, useEffect } from "react";
import { UserCog, PlusCircle, Edit2, Trash2 } from "lucide-react";
import operationApi from "../../../api/operation";

const Operator = () => {
  const [loading, setLoading] = useState(false);
  const [operators, setOperators] = useState([]);

  const [newOperator, setNewOperator] = useState({
    name: "",
    machine: "",
    contact: "",
    experience: "",
    licence_number: "",
    status: "Available",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const response = await operationApi.getOperators();

      setOperators(response.data.data);
    } catch (error) {
      console.error("Error fetching operators:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOperator = async () => {
    if (
      !newOperator.name ||
      !newOperator.machine ||
      !newOperator.contact ||
      !newOperator.experience ||
      !newOperator.licence_number
    ) {
      alert("Please fill all fields before adding an operator.");
      return;
    }

    try {
      setLoading(true);

      await operationApi.createOperator(newOperator);
      setNewOperator({
        name: "",
        machine: "",
        contact: "",
        experience: "",
        licence_number: "",
        status: "Available",
      });
      fetchOperators();
    } catch (error) {
      console.error("Error adding operator:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    const operator = operators.find((o) => o.id === id);
    setNewOperator(operator);
    setEditingId(id);
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await operationApi.updateOperator(editingId, newOperator);
      setEditingId(null);
      setNewOperator({
        name: "",
        machine: "",
        contact: "",
        experience: "",
        licence_number: "",
        status: "Available",
      });
      fetchOperators();
    } catch (error) {
      console.error("Error updating operator:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await operationApi.deleteOperator(id);
      fetchOperators();
    } catch (error) {
      console.error("Error deleting operator:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-green-700 flex items-center gap-2">
          <UserCog className="w-6 h-6 text-green-600" />
          Operator Management
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <input
          type="text"
          placeholder="Operator Name"
          value={newOperator.name}
          onChange={(e) =>
            setNewOperator({ ...newOperator, name: e.target.value })
          }
          className="border border-gray-300 rounded-lg p-2 text-sm"
        />
        <input
          type="text"
          placeholder="Assigned Machine"
          value={newOperator.machine}
          onChange={(e) =>
            setNewOperator({ ...newOperator, machine: e.target.value })
          }
          className="border border-gray-300 rounded-lg p-2 text-sm"
        />
        <input
          type="text"
          placeholder="Contact Number"
          value={newOperator.contact}
          onChange={(e) =>
            setNewOperator({ ...newOperator, contact: e.target.value })
          }
          className="border border-gray-300 rounded-lg p-2 text-sm"
        />
        <input
          type="text"
          placeholder="Experience"
          value={newOperator.experience}
          onChange={(e) =>
            setNewOperator({ ...newOperator, experience: e.target.value })
          }
          className="border border-gray-300 rounded-lg p-2 text-sm"
        />
        <input
          type="text"
          placeholder="licence_number Number"
          value={newOperator.licence_number}
          onChange={(e) =>
            setNewOperator({ ...newOperator, licence_number: e.target.value })
          }
          className="border border-gray-300 rounded-lg p-2 text-sm"
        />
        <div className="erp-root">
          <button
            onClick={editingId ? handleUpdate : handleAddOperator}
            className="app-btn-primary flex items-center justify-center gap-1"
          >
            <PlusCircle className="w-4 h-4" />
            {editingId ? "Update" : "Add"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead className="bg-green-50 text-green-900">
            <tr>
              <th className="border border-gray-200 p-2 text-left">#</th>
              <th className="border border-gray-200 p-2 text-left">
                Operator Name
              </th>
              <th className="border border-gray-200 p-2 text-left">
                licence_number Number
              </th>
              <th className="border border-gray-200 p-2 text-left">
                Assigned Machine
              </th>
              <th className="border border-gray-200 p-2 text-left">Contact</th>
              <th className="border border-gray-200 p-2 text-left">
                Experience
              </th>
              <th className="border border-gray-200 p-2 text-left">Status</th>
              <th className="border border-gray-200 p-2 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {operators.length > 0 ? (
              operators.map((operator, index) => (
                <tr key={operator.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-2">{index + 1}</td>
                  <td className="border border-gray-200 p-2">
                    {operator.name}
                  </td>
                  <td className="border border-gray-200 p-2">
                    {operator.licence_number}
                  </td>
                  <td className="border border-gray-200 p-2">
                    {operator.machine}
                  </td>
                  <td className="border border-gray-200 p-2">
                    {operator.contact}
                  </td>
                  <td className="border border-gray-200 p-2">
                    {operator.experience}
                  </td>
                  <td className="border border-gray-200 p-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${operator.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {operator.status}
                    </span>
                  </td>
                  <td className="border border-gray-200 p-2 text-center">
                    <button
                      onClick={() => handleEdit(operator.id)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(operator.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="text-center py-4 text-gray-500 italic"
                >
                  No operators available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Operator;
