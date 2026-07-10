import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Save,
  Download,
  Edit3,
  Check,
  PlusIcon,
} from "lucide-react";
import jsPDF from "jspdf";
import Swal from "sweetalert2";
import operationApi from "../../../api/operation";

const LabourRates = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalWorkers: 0,
    totalCost: 0,
    averageWage: 0,
  });

  const [workers, setWorkers] = useState([]);
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    fetchLabourRates();
  }, []);

  const fetchLabourRates = async () => {
    try {
      setLoading(true);
      const response = await operationApi.getLabourRates();
      const { workers: fetchedWorkers, facilities: fetchedFacilities } =
        response.data.data || {};

      if (Array.isArray(fetchedWorkers)) {
        setWorkers(fetchedWorkers.map((w) => ({ ...w, isEditing: false })));
      }
      if (Array.isArray(fetchedFacilities)) {
        setFacilities(
          fetchedFacilities.map((f) => ({ ...f, isEditing: false })),
        );
      }
    } catch (error) {
      console.error("Error fetching labour rates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateSummary();
  }, [workers]);

  const calculateSummary = () => {
    const validWorkers = workers.filter(
      (w) => w.type && w.minWage && w.maxWage,
    );
    const totalCost = validWorkers.reduce(
      (sum, w) =>
        sum + ((parseFloat(w.minWage) || 0) + (parseFloat(w.maxWage) || 0)) / 2,
      0,
    );
    const avgWage = validWorkers.length ? totalCost / validWorkers.length : 0;

    setSummary({
      totalWorkers: validWorkers.length,
      totalCost,
      averageWage: avgWage,
    });
  };

  const handleWorkerChange = (id, field, value) => {
    const updated = workers.map((worker) =>
      worker.id === id ? { ...worker, [field]: value } : worker,
    );
    setWorkers(updated);
  };

  const handleFacilityChange = (id, field, value) => {
    const updated = facilities.map((facility) =>
      facility.id === id ? { ...facility, [field]: value } : facility,
    );
    setFacilities(updated);
  };

  const addWorker = () => {
    const newWorker = {
      id: Date.now(),
      type: "",
      minWage: "",
      maxWage: "",
      isEditing: true,
    };
    setWorkers([...workers, newWorker]);
  };

  const removeWorker = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This worker will be removed permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    });

    if (result.isConfirmed) {
      try {
        if (typeof id === "number" && id > 1000000000) {
          setWorkers(workers.filter((w) => w.id !== id));
        } else {
          setLoading(true);
          await operationApi.deleteLabourRate(id);
          fetchLabourRates();
        }
        Swal.fire("Removed!", "Worker has been removed.", "success");
      } catch (error) {
        console.error("Error removing worker:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const addFacility = () => {
    const newFacility = {
      id: Date.now(),
      name: "",
      description: "",
      isEditing: true,
    };
    setFacilities([...facilities, newFacility]);
  };

  const toggleWorkerEdit = async (id) => {
    const worker = workers.find((w) => w.id === id);
    if (worker.isEditing) {
      if (!worker.type || !worker.minWage || !worker.maxWage) {
        Swal.fire(
          "Warning",
          "Please fill all fields for the worker",
          "warning",
        );
        return;
      }

      try {
        setLoading(true);
        if (typeof id === "number" && id > 1000000000) {
          const payload = {
            workers: workers.map((w) => ({
              type: w.type,
              minWage: w.minWage,
              maxWage: w.maxWage,
              description: w.description || "General",
            })),
            facilities: facilities.map((f) => ({
              name: f.name,
              description: f.description || "",
            })),
          };
          await operationApi.createLabourRate(payload);
        } else {
          await operationApi.updateLabourRate(id, worker);
        }
        fetchLabourRates();
      } catch (error) {
        console.error("Error saving worker:", error);
        Swal.fire(
          "Error",
          error.response?.data?.message || "Failed to save worker",
          "error",
        );
      } finally {
        setLoading(false);
      }
    } else {
      setWorkers(
        workers.map((w) => (w.id === id ? { ...w, isEditing: true } : w)),
      );
    }
  };

  const removeFacility = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This facility will be removed permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    });

    if (result.isConfirmed) {
      try {
        if (typeof id === "number" && id > 1000000000) {
          setFacilities(facilities.filter((f) => f.id !== id));
        } else {
          setLoading(true);
          await operationApi.deleteLabourFacility(id);
          fetchLabourRates();
        }
        Swal.fire("Removed!", "Facility has been removed.", "success");
      } catch (error) {
        console.error("Error removing facility:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleFacilityEdit = async (id) => {
    const facility = facilities.find((f) => f.id === id);
    if (facility.isEditing) {
      if (!facility.name) {
        Swal.fire("Warning", "Please enter facility name", "warning");
        return;
      }

      try {
        setLoading(true);
        if (typeof id === "number" && id > 1000000000) {
          const payload = {
            workers: workers.map((w) => ({
              type: w.type,
              minWage: w.minWage,
              maxWage: w.maxWage,
              description: w.description || "General",
            })),
            facilities: facilities.map((f) => ({
              name: f.name,
              description: f.description || "",
            })),
          };
          await operationApi.createLabourRate(payload);
        } else {
          await operationApi.updateLabourFacility(id, facility);
        }
        fetchLabourRates();
      } catch (error) {
        console.error("Error saving facility:", error);
        Swal.fire("Error", "Failed to save facility", "error");
      } finally {
        setLoading(false);
      }
    } else {
      setFacilities(
        facilities.map((f) => (f.id === id ? { ...f, isEditing: true } : f)),
      );
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(20);
    doc.text("Construction Labour Details", 105, y, { align: "center" });
    y += 20;
    doc.setFontSize(12);
    doc.text(`Total Workers: ${summary.totalWorkers}`, 20, y);
    y += 10;
    doc.text(`Total Cost: ₹${summary.totalCost.toLocaleString()}`, 20, y);
    y += 20;

    workers.forEach((w) => {
      doc.text(`${w.type}: ₹${w.minWage} - ₹${w.maxWage}`, 20, y);
      y += 10;
    });

    doc.save("labour-details.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Labour Work Order & Wage Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage worker types, wages, and facilities provided
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex gap-3">
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200"
                >
                  <Download className="h-5 w-5" /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Worker Types & Wage Details
            </h2>
            <button
              onClick={addWorker}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Plus size={18} /> Add Worker
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left">
                    Worker Type
                  </th>
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left">
                    Min Wage (₹)
                  </th>
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left">
                    Max Wage (₹)
                  </th>
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id}>
                    <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                      {worker.isEditing ? (
                        <input
                          type="text"
                          value={worker.type}
                          onChange={(e) =>
                            handleWorkerChange(
                              worker.id,
                              "type",
                              e.target.value,
                            )
                          }
                          className="w-full bg-transparent border rounded p-1"
                        />
                      ) : (
                        worker.type || "-"
                      )}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                      {worker.isEditing ? (
                        <input
                          type="number"
                          value={worker.minWage}
                          onChange={(e) =>
                            handleWorkerChange(
                              worker.id,
                              "minWage",
                              e.target.value,
                            )
                          }
                          className="w-full bg-transparent border rounded p-1"
                        />
                      ) : (
                        `₹${worker.minWage || "0"}`
                      )}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                      {worker.isEditing ? (
                        <input
                          type="number"
                          value={worker.maxWage}
                          onChange={(e) =>
                            handleWorkerChange(
                              worker.id,
                              "maxWage",
                              e.target.value,
                            )
                          }
                          className="w-full bg-transparent border rounded p-1"
                        />
                      ) : (
                        `₹${worker.maxWage || "0"}`
                      )}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => toggleWorkerEdit(worker.id)}
                          disabled={loading}
                          className="p-1 bg-blue-600 text-white rounded"
                        >
                          {worker.isEditing ? (
                            <Check size={16} />
                          ) : (
                            <Edit3 size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => removeWorker(worker.id)}
                          disabled={loading}
                          className="p-1 bg-red-600 text-white rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Facilities Provided
            </h2>
            <button
              onClick={addFacility}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Plus size={18} /> Add Facility
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left">
                    Facility Name
                  </th>
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left">
                    Description
                  </th>
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((facility) => (
                  <tr key={facility.id}>
                    <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                      {facility.isEditing ? (
                        <input
                          type="text"
                          value={facility.name}
                          onChange={(e) =>
                            handleFacilityChange(
                              facility.id,
                              "name",
                              e.target.value,
                            )
                          }
                          className="w-full bg-transparent border rounded p-1"
                        />
                      ) : (
                        facility.name || "-"
                      )}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                      {facility.isEditing ? (
                        <input
                          type="text"
                          value={facility.description}
                          onChange={(e) =>
                            handleFacilityChange(
                              facility.id,
                              "description",
                              e.target.value,
                            )
                          }
                          className="w-full bg-transparent border rounded p-1"
                        />
                      ) : (
                        facility.description || "-"
                      )}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => toggleFacilityEdit(facility.id)}
                          disabled={loading}
                          className="p-1 bg-blue-600 text-white rounded"
                        >
                          {facility.isEditing ? (
                            <Check size={16} />
                          ) : (
                            <Edit3 size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => removeFacility(facility.id)}
                          disabled={loading}
                          className="p-1 bg-red-600 text-white rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabourRates;
