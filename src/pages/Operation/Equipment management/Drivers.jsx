import React, { useState, useEffect } from "react";
import { PlusCircle, Edit2, Trash2, User2 } from "lucide-react";
import operationApi from "../../../api/operation";

const Drivers = () => {
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);

  const [newDriver, setNewDriver] = useState({
    name: "",
    license_number: "",
    contact: "",
    experience: "",
    status: "Available",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await operationApi.getDrivers();

      
      setDrivers(response.data.data);
    } catch (error) {

      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleAddDriver = async () => {
    if (
      !newDriver.name ||
      !newDriver.license_number ||
      !newDriver.contact ||
      !newDriver.experience
    ) {
      alert("Please fill all fields before adding a driver.");
      return;
    }


    try {
      setLoading(true);
      await operationApi.createDriver(newDriver);
      setNewDriver({
        name: "",
        license_number: "",
        contact: "",
        experience: "",
        status: "Available",
      });
      fetchDrivers();
    } catch (error) {
      console.error("Error adding driver:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (id) => {
    const driver = drivers.find((d) => d.id === id);
    setNewDriver(driver);
    setEditingId(id);
  };


  const handleUpdate = async () => {
    try {
      setLoading(true);
      await operationApi.updateDriver(editingId, newDriver);
      setEditingId(null);
      setNewDriver({
        name: "",
        license_number: "",
        contact: "",
        experience: "",
        status: "Available",
      });
      fetchDrivers();
    } catch (error) {
      console.error("Error updating driver:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await operationApi.deleteDriver(id);
      fetchDrivers();
    } catch (error) {
      console.error("Error deleting driver:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2">
          <User2 className="w-6 h-6 text-blue-600" />
          Driver Management
        </h2>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <input
          type="text"
          placeholder="Driver Name"
          value={newDriver.name}
          onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
          className="border border-gray-300 rounded-lg p-2 text-sm"
        />
        <input
          type="text"
          placeholder="License Number"
          value={newDriver.license_number}
          onChange={(e) =>
            setNewDriver({ ...newDriver, license_number: e.target.value })
          }
          className="border border-gray-300 rounded-lg p-2 text-sm"
        />
        <input
          type="text"
          placeholder="Contact Number"
          value={newDriver.contact}
          onChange={(e) =>
            setNewDriver({ ...newDriver, contact: e.target.value })
          }
          className="border border-gray-300 rounded-lg p-2 text-sm"
        />
        <input
          type="text"
          placeholder="Experience"
          value={newDriver.experience}
          onChange={(e) =>
            setNewDriver({ ...newDriver, experience: e.target.value })
          }
          className="border border-gray-300 rounded-lg p-2 text-sm"
        />
        <button
          onClick={editingId ? handleUpdate : handleAddDriver}
          disabled={loading}
          className={`flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm transition-all ${loading
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <PlusCircle className="w-4 h-4" />
          )}
          {loading ? "Processing..." : editingId ? "Update" : "Add"}
        </button>
      </div>


      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="border border-gray-200 p-2 text-left">#</th>
              <th className="border border-gray-200 p-2 text-left">
                Driver Name
              </th>
              <th className="border border-gray-200 p-2 text-left">
                License Number
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
            {drivers.length > 0 ? (
              drivers.map((driver, index) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-2">{index + 1}</td>
                  <td className="border border-gray-200 p-2">{driver.name}</td>
                  <td className="border border-gray-200 p-2">
                    {driver.license_number}
                  </td>
                  <td className="border border-gray-200 p-2">
                    {driver.contact}
                  </td>
                  <td className="border border-gray-200 p-2">
                    {driver.experience}
                  </td>
                  <td className="border border-gray-200 p-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${driver.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {driver.status}
                    </span>
                  </td>
                  <td className="border border-gray-200 p-2 text-center">
                    <button
                      onClick={() => handleEdit(driver.id)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(driver.id)}
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
                  colSpan="7"
                  className="text-center py-4 text-gray-500 italic"
                >
                  No drivers available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Drivers;
