import { Clock } from "lucide-react";
import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaPlus } from "react-icons/fa";
import operationApi from "../../../api/operation";

const HinderingReport = () => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);

  const [newRecord, setNewRecord] = useState({
    record_date: "",
    description: "",
    remark: "",
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await operationApi.getHinderingRecords();
      setRecords(response.data.data || []);
    } catch (error) {
      console.error("Error fetching hindering records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecord((prev) => ({ ...prev, [name]: value }));
  };

  const addRecord = async () => {
    if (!newRecord.record_date || !newRecord.description) {
      alert("Date and Description are required");
      return;
    }

    try {
      setLoading(true);
      await operationApi.createHinderingRecord({
        ...newRecord,
        status: "pending",
      });
      setNewRecord({ record_date: "", description: "", remark: "" });
      fetchRecords();
    } catch (error) {
      console.error("Error adding record:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setLoading(true);
      const record = records.find((r) => r.id === id);
      if (!record) return;

      await operationApi.updateHinderingRecordStatus(id, status);
      fetchRecords();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-linear-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg space-y-6 border border-gray-200 dark:border-gray-700 transition-all duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          Hindering Records
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Total Records: {records.length}
        </span>
      </div>

      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">
          Add New Record
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="date"
            name="record_date"
            value={newRecord.record_date}
            onChange={handleInputChange}
            className="border rounded-lg p-2.5 dark:bg-gray-700 dark:text-white w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={newRecord.description}
            onChange={handleInputChange}
            className="border rounded-lg p-2.5 dark:bg-gray-700 dark:text-white w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            type="text"
            name="remark"
            placeholder="Remark"
            value={newRecord.remark}
            onChange={handleInputChange}
            className="border rounded-lg p-2.5 dark:bg-gray-700 dark:text-white w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button
          onClick={addRecord}
          disabled={loading}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
        >
          <FaPlus /> Add Record
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-blue-400 text-white text-left">
              <th className="p-3">Date</th>
              <th className="p-3">Description</th>
              <th className="p-3">Remark</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center p-6 text-gray-500 dark:text-gray-400"
                >
                  {loading ? "Loading..." : "No records available"}
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <td className="p-3 text-gray-700 dark:text-gray-300">
                    {record.record_date}
                  </td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">
                    {record.description}
                  </td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">
                    {record.remark || "-"}
                  </td>
                  <td className="p-3">
                    {record.status === "pending" && (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        Pending
                      </span>
                    )}
                    {record.status === "resolved" && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Resolved
                      </span>
                    )}
                    {record.status === "cancelled" && (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        Cancelled
                      </span>
                    )}
                  </td>
                  <td className="p-3 flex gap-2 justify-center">
                    <button
                      title="Mark as Resolved"
                      disabled={loading}
                      onClick={() => updateStatus(record.id, "resolved")}
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md shadow transition disabled:opacity-50"
                    >
                      <FaCheck />
                    </button>
                    <button
                      title="Mark as Pending"
                      disabled={loading}
                      onClick={() => updateStatus(record.id, "pending")}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-md shadow transition disabled:opacity-50"
                    >
                      <Clock size={16} />
                    </button>
                    <button
                      title="Cancel Record"
                      disabled={loading}
                      onClick={() => updateStatus(record.id, "cancelled")}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md shadow transition disabled:opacity-50"
                    >
                      <FaTimes />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HinderingReport;
