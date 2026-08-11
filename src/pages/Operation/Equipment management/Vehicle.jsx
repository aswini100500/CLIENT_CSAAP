import React, { useState, useEffect } from "react";
import { PlusCircle, Edit2, Trash2 } from "lucide-react";
import operationApi from "../../../api/operation";

const Vehicle = () => {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);

  const [newVehicle, setNewVehicle] = useState({
    name: "",
    mileage: "",
    odometer_start: "",
    odometer_end: "",
    cost: "",
    number_plate: "",
    fuel_type: "Diesel",
    status: "Available",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await operationApi.getVehicles();
      setVehicles(response.data.data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async () => {
    if (
      !newVehicle.name ||
      !newVehicle.mileage ||
      !newVehicle.odometer_start ||
      !newVehicle.odometer_end ||
      !newVehicle.cost ||
      !newVehicle.number_plate ||
      !newVehicle.fuel_type
    ) {
      alert("Please fill in all fields before adding a vehicle.");
      return;
    }

    try {
      setLoading(true);
      const vehicleData = {
        name: newVehicle.name,
        mileage: newVehicle.mileage,
        odometerStart: Number(newVehicle.odometer_start),
        odometerEnd: Number(newVehicle.odometer_end),
        cost: Number(newVehicle.cost),
        numberPlate: newVehicle.number_plate,
        fuelType: newVehicle.fuel_type,
        status: newVehicle.status,
      };
      await operationApi.createVehicle(vehicleData);
      setNewVehicle({
        name: "",
        mileage: "",
        odometer_start: "",
        odometer_end: "",
        cost: "",
        number_plate: "",
        fuel_type: "Diesel",
        status: "Available",
      });
      fetchVehicles();
    } catch (error) {
      console.error("Error adding vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await operationApi.deleteVehicle(id);
      fetchVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    const vehicle = vehicles.find((v) => v.id === id);
    setNewVehicle(vehicle);
    setEditingId(id);
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const vehicleData = {
        name: newVehicle.name,
        mileage: newVehicle.mileage,
        odometerStart: Number(newVehicle.odometer_start),
        odometerEnd: Number(newVehicle.odometer_end),
        cost: Number(newVehicle.cost),
        numberPlate: newVehicle.number_plate,
        fuelType: newVehicle.fuel_type,
        status: newVehicle.status,
      };
      await operationApi.updateVehicle(editingId, vehicleData);
      setEditingId(null);
      setNewVehicle({
        name: "",
        mileage: "",
        odometer_start: "",
        odometer_end: "",
        cost: "",
        number_plate: "",
        fuel_type: "Diesel",
        status: "Available",
      });
      fetchVehicles();
    } catch (error) {
      console.error("Error updating vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 bg-white rounded-xl shadow-md border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Vehicle Name
          </label>
          <input
            type="text"
            placeholder="Vehicle Name"
            value={newVehicle.name}
            onChange={(e) =>
              setNewVehicle({ ...newVehicle, name: e.target.value })
            }
            className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Mileage (ltr)
          </label>
          <input
            type="text"
            placeholder="e.g., 10 ltr"
            value={newVehicle.mileage}
            onChange={(e) =>
              setNewVehicle({ ...newVehicle, mileage: e.target.value })
            }
            className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Odometer Start
          </label>
          <input
            type="number"
            placeholder="Odometer Start"
            value={newVehicle.odometer_start}
            onChange={(e) =>
              setNewVehicle({ ...newVehicle, odometer_start: e.target.value })
            }
            className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Odometer End
          </label>
          <input
            type="number"
            placeholder="Odometer End"
            value={newVehicle.odometer_end}
            onChange={(e) =>
              setNewVehicle({ ...newVehicle, odometer_end: e.target.value })
            }
            className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Cost</label>
          <input
            type="number"
            placeholder="Cost"
            value={newVehicle.cost}
            onChange={(e) =>
              setNewVehicle({ ...newVehicle, cost: e.target.value })
            }
            className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Number Plate
          </label>
          <input
            type="text"
            placeholder="Number Plate"
            value={newVehicle.number_plate}
            onChange={(e) =>
              setNewVehicle({ ...newVehicle, number_plate: e.target.value })
            }
            className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Fuel Type
          </label>
          <select
            value={newVehicle.fuel_type}
            onChange={(e) =>
              setNewVehicle({ ...newVehicle, fuel_type: e.target.value })
            }
            className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="Diesel">Diesel</option>
            <option value="Petrol">Petrol</option>
            <option value="CNG">CNG</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div className="erp-root flex flex-col justify-end">
          <button
            onClick={editingId ? handleUpdate : handleAddVehicle}
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
                Vehicle Name
              </th>
              <th className="border border-gray-200 p-2 text-left">Mileage</th>
              <th className="border border-gray-200 p-2 text-left">
                Odometer Start
              </th>
              <th className="border border-gray-200 p-2 text-left">
                Odometer End
              </th>
              <th className="border border-gray-200 p-2 text-left">
                Total KM Run
              </th>
              <th className="border border-gray-200 p-2 text-left">Cost</th>
              <th className="border border-gray-200 p-2 text-left">
                Number Plate
              </th>
              <th className="border border-gray-200 p-2 text-left">
                Fuel Type
              </th>
              <th className="border border-gray-200 p-2 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length > 0 ? (
              vehicles.map((vehicle, index) => {
                const totalKm = vehicle.odometer_end - vehicle.odometer_start;
                return (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 p-2">{index + 1}</td>
                    <td className="border border-gray-200 p-2">
                      {vehicle.name}
                    </td>
                    <td className="border border-gray-200 p-2">
                      {vehicle.mileage} km/ltr
                    </td>
                    <td className="border border-gray-200 p-2">
                      {vehicle.odometerStart} km
                    </td>
                    <td className="border border-gray-200 p-2">
                      {vehicle.odometerEnd} km
                    </td>
                    <td className="border border-gray-200 p-2 font-semibold text-blue-700">
                      {vehicle.totalKm} km
                    </td>
                    <td className="border border-gray-200 p-2">
                      ₹{vehicle.cost?.toLocaleString()}
                    </td>
                    <td className="border border-gray-200 p-2">
                      {vehicle.numberPlate}
                    </td>
                    <td className="border border-gray-200 p-2">
                      {vehicle.fuelType}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <button
                        onClick={() => handleEdit(vehicle.id)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
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
                  No vehicles available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Vehicle;
