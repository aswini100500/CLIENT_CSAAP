import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";
import { usePermission } from "../../../../hooks/usePermission";
import useAuth from "../../../../hooks/useAuth";

const getLocaleDateString = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const getLocaleDayName = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

const AddHolidayModal = ({
  showAddModal,
  setShowAddModal,
  newHoliday,
  setNewHoliday,
  handleInputChange,
  handleAddHoliday,
}) => {
  if (!showAddModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-linear-to-r from-green-500 to-emerald-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Add New Holiday</h2>
          <button
            onClick={() => {
              setShowAddModal(false);
              setNewHoliday({ name: "", date: "", type: "Public Holiday" });
            }}
            className="text-white hover:text-gray-200 transition duration-150"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleAddHoliday} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="name"
              >
                Holiday Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newHoliday.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter holiday name"
              />
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="date"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={newHoliday.date}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="type"
              >
                Holiday Type
              </label>
              <select
                id="type"
                name="type"
                value={newHoliday.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="Public Holiday">Public Holiday</option>
                <option value="Federal Holiday">Federal Holiday</option>
                <option value="National Holiday">National Holiday</option>
                <option value="Regional Holiday">Regional Holiday</option>
                <option value="Bank Holiday">Bank Holiday</option>
              </select>
            </div>
          </div>

          {newHoliday.date && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-sm font-semibold text-green-800 mb-2">
                Preview
              </h3>
              <div className="flex items-center space-x-4">
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
                  <span className="text-sm text-gray-600">Day:</span>
                  <span className="ml-2 font-semibold text-green-700">
                    {getLocaleDayName(newHoliday.date)}
                  </span>
                </div>
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="ml-2 font-semibold text-green-700">
                    {getLocaleDateString(newHoliday.date)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setNewHoliday({ name: "", date: "", type: "Public Holiday" });
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-150 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition duration-150 font-semibold shadow-md"
            >
              Add Holiday
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditModal = ({
  showEditModal,
  setShowEditModal,
  editingHoliday,
  setEditingHoliday,
  handleEditSubmit,
}) => {
  if (!showEditModal) return null;

  const formattedDate = editingHoliday?.date
    ? editingHoliday.date.split("T")[0]
    : "";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-linear-to-r from-yellow-500 to-orange-500 px-6 py-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Edit Holiday</h2>
          <button
            onClick={() => setShowEditModal(false)}
            className="text-white hover:text-gray-200 transition duration-150"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="edit-name"
              >
                Holiday Name
              </label>
              <input
                type="text"
                id="edit-name"
                value={editingHoliday?.name || ""}
                onChange={(e) =>
                  setEditingHoliday({ ...editingHoliday, name: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter holiday name"
              />
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="edit-date"
              >
                Date
              </label>
              <input
                type="date"
                id="edit-date"
                value={formattedDate}
                onChange={(e) =>
                  setEditingHoliday({ ...editingHoliday, date: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="edit-type"
              >
                Holiday Type
              </label>
              <select
                id="edit-type"
                value={editingHoliday?.type || ""}
                onChange={(e) =>
                  setEditingHoliday({ ...editingHoliday, type: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="Public Holiday">Public Holiday</option>
                <option value="Federal Holiday">Federal Holiday</option>
                <option value="National Holiday">National Holiday</option>
                <option value="Regional Holiday">Regional Holiday</option>
                <option value="Bank Holiday">Bank Holiday</option>
              </select>
            </div>
          </div>

          {editingHoliday && editingHoliday.date && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                Preview
              </h3>
              <div className="flex items-center space-x-4">
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
                  <span className="text-sm text-gray-600">Day:</span>
                  <span className="ml-2 font-semibold text-yellow-700">
                    {getLocaleDayName(editingHoliday.date)}
                  </span>
                </div>
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="ml-2 font-semibold text-yellow-700">
                    {getLocaleDateString(editingHoliday.date)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-150 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg transition duration-150 font-semibold shadow-md"
            >
              Update Holiday
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Snackbar = ({ snackbar }) => {
  if (!snackbar.open) return null;

  const getSnackbarColor = () => {
    switch (snackbar.type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 ${getSnackbarColor()} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn`}
    >
      <div className="flex items-center gap-3">
        {snackbar.type === "success" && (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        {snackbar.type === "error" && (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        )}
        <span>{snackbar.message}</span>
      </div>
    </div>
  );
};

const HolidaysList = () => {
  const { has } = usePermission();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "All",
    year: "All",
    month: "All",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const [newHoliday, setNewHoliday] = useState({
    name: "",
    date: "",
    type: "Public Holiday",
  });

  const { user, token: authToken } = useAuth();

  const companyId = user?.company_id;
  const slug = user?.slug;

  const token = authToken;

  useEffect(() => {
    if (!companyId || !slug) {
      return;
    }

    fetchHolidays(false);
  }, [companyId, slug]);

  const fetchHolidays = async (showSuccessMessage = false) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/holiday`,
        {
          params: {
            company_id: companyId,
            slug: slug,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setHolidays(
        Array.isArray(response.data) ? response.data : response.data.data || [],
      );
      if (showSuccessMessage) {
        showSnackbar("Holidays fetched successfully", "success");
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
      if (showSuccessMessage) {
        showSnackbar("Failed to fetch holidays", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHoliday((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!has("hrms.calendar.holiday.create")) {
      showSnackbar(
        "Access Denied: You do not have permission to add holidays.",
        "error",
      );
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/holiday`,
        {
          name: newHoliday.name,
          date: newHoliday.date,
          type: newHoliday.type,
          company_id: companyId,
          slug: slug,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        showSnackbar("Holiday added successfully", "success");
        await fetchHolidays(false);
        setShowAddModal(false);
        setNewHoliday({ name: "", date: "", type: "Public Holiday" });
      }
    } catch (error) {
      console.error("Error adding holiday:", error);
      showSnackbar("Failed to add holiday", "error");
    }
  };

  const handleEdit = (holiday) => {
    if (!has("hrms.calendar.holiday.create")) {
      showSnackbar(
        "Access Denied: You do not have permission to edit holidays.",
        "error",
      );
      return;
    }
    setEditingHoliday(holiday);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!has("hrms.calendar.holiday.create")) {
      showSnackbar(
        "Access Denied: You do not have permission to edit holidays.",
        "error",
      );
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/holiday/${editingHoliday.id}`,
        {
          name: editingHoliday.name,
          date: editingHoliday.date,
          type: editingHoliday.type,
          company_id: companyId,
          slug: slug,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        showSnackbar("Holiday updated successfully", "success");
        await fetchHolidays(false);
        setShowEditModal(false);
        setEditingHoliday(null);
      }
    } catch (error) {
      console.error("Error updating holiday:", error);
      showSnackbar("Failed to update holiday", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!has("hrms.calendar.holiday.create")) {
      showSnackbar(
        "Access Denied: You do not have permission to delete holidays.",
        "error",
      );
      return;
    }
    if (window.confirm("Are you sure you want to delete this holiday?")) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/holiday/${id}`,
          {
            data: {
              company_id: companyId,
              slug: slug,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.data.success) {
          showSnackbar("Holiday deleted successfully", "success");
          await fetchHolidays(false);
        }
      } catch (error) {
        console.error("Error deleting holiday:", error);
        showSnackbar("Failed to delete holiday", "error");
      }
    }
  };

  const showSnackbar = (message, type = "success") => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, open: false }));
    }, 3000);
  };

  const years = [
    "All",
    ...new Set(
      (Array.isArray(holidays) ? holidays : []).map((h) =>
        new Date(h.date).getFullYear(),
      ),
    ),
  ];
  const months = [
    "All",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const types = [
    "All",
    "Public Holiday",
    "Federal Holiday",
    "National Holiday",
    "Regional Holiday",
    "Bank Holiday",
  ];

  const filteredHolidays = holidays.filter((holiday) => {
    const holidayDate = new Date(holiday.date);
    const holidayYear = holidayDate.getFullYear();
    const holidayMonth = holidayDate.getMonth();
    const searchMatch =
      holiday.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      holiday.type.toLowerCase().includes(filters.search.toLowerCase());

    const typeMatch = filters.type === "All" || holiday.type === filters.type;
    const yearMatch =
      filters.year === "All" || holidayYear === parseInt(filters.year);
    const monthMatch =
      filters.month === "All" ||
      months.indexOf(filters.month) - 1 === holidayMonth;

    return searchMatch && typeMatch && yearMatch && monthMatch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Snackbar snackbar={snackbar} />

      <AddHolidayModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        newHoliday={newHoliday}
        setNewHoliday={setNewHoliday}
        handleInputChange={handleInputChange}
        handleAddHoliday={handleAddHoliday}
      />

      <EditModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        editingHoliday={editingHoliday}
        setEditingHoliday={setEditingHoliday}
        handleEditSubmit={handleEditSubmit}
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Holidays</h1>
            <p className="text-gray-600 mt-2">Manage and track all holidays</p>
          </div>
          {has("hrms.calendar.holiday.create") && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Add Holiday</span>
            </button>
          )}
        </div>

        {(!companyId || !slug) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Company information is missing. Please ensure you are logged
                  in correctly.
                </p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading holidays...</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-600 text-sm mb-2">Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by name or type..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2">
                Holiday Type
              </label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2">Year</label>
              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2">Month</label>
              <select
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredHolidays.length} of {holidays.length} holidays
            </p>
            <button
              onClick={() =>
                setFilters({
                  search: "",
                  type: "All",
                  year: "All",
                  month: "All",
                })
              }
              className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-emerald-600 to-emerald-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Holiday Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Day
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHolidays.map((holiday, index) => (
                  <tr
                    key={holiday.id}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {holiday.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(holiday.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {holiday.day}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${holiday.type === "Public Holiday" ? "bg-green-100 text-green-800" : ""}
                        ${holiday.type === "Federal Holiday" ? "bg-emerald-100 text-emerald-800" : ""}
                        ${holiday.type === "National Holiday" ? "bg-purple-100 text-purple-800" : ""}
                        ${holiday.type === "Regional Holiday" ? "bg-yellow-100 text-yellow-800" : ""}
                        ${holiday.type === "Bank Holiday" ? "bg-red-100 text-red-800" : ""}
                      `}
                      >
                        {holiday.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        {has("hrms.calendar.holiday.create") && (
                          <button
                            onClick={() => handleEdit(holiday)}
                            className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-emerald-50 transition duration-150"
                            title="Edit"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                        )}
                        {has("hrms.calendar.holiday.create") && (
                          <button
                            onClick={() => handleDelete(holiday.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition duration-150"
                            title="Delete"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && filteredHolidays.length === 0 && (
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Holidays Found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or add a new holiday.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default HolidaysList;
