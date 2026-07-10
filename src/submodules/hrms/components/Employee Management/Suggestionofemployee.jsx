import axios from "axios";
import React, { useEffect, useState } from "react";
import useAuth from "../../../../hooks/useAuth";

const SuggestionOfEmployee = () => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();

  const [suggestions, setSuggestions] = useState([]);

  const [formData, setFormData] = useState({
    suggestionDetails: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee-suggestions`,
        {
          user_id: user.id,
          company_id: user?.company_id ?? user?.id,
          suggestion: formData.suggestionDetails,
          category: "General",
        },
      );

      setShowAddForm(false);
      setFormData({ suggestionDetails: "" });

      fetchSuggestions();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee-suggestions/${user.id}`,
      );
      setSuggestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchSuggestions();
  }, [user.company_id]);

  const handleCancel = () => {
    setFormData({ suggestionDetails: "" });
    setShowAddForm(false);
  };

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.suggestion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suggestion.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredSuggestions.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedSuggestions = filteredSuggestions.slice(
    startIndex,
    startIndex + entriesPerPage,
  );

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "implemented":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "under review":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case "workflow":
        return "bg-purple-100 text-purple-800";
      case "technology":
        return "bg-indigo-100 text-indigo-800";
      case "hr":
        return "bg-pink-100 text-pink-800";
      case "facilities":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {showAddForm ? "Share Your Suggestion" : "Employee Suggestions"}
              </h1>
              <p className="text-gray-600">
                {showAddForm
                  ? "Share your ideas to help us improve"
                  : "View and manage employee suggestions"}
              </p>
            </div>

            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg flex items-center shadow-sm hover:shadow-md transition-all"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                New Suggestion
              </button>
            )}
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Suggestion Details
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Your Suggestion *
                </label>
                <textarea
                  name="suggestionDetails"
                  value={formData.suggestionDetails}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all"
                  placeholder="Share your ideas, feedback, or suggestions for improvement..."
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your suggestions help us create a better workplace for
                  everyone.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                >
                  Submit Suggestion
                </button>
              </div>
            </form>
          </div>
        )}

        {!showAddForm && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Show</span>
                    <select
                      value={entriesPerPage}
                      onChange={(e) =>
                        setEntriesPerPage(Number(e.target.value))
                      }
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-600">entries</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Search:</span>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 w-64"
                      placeholder="Search suggestions..."
                    />
                    <svg
                      className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">
                  All Suggestions
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                        Suggestion
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedSuggestions.length > 0 ? (
                      paginatedSuggestions.map((suggestion) => (
                        <tr
                          key={suggestion.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="max-w-md">
                              <p className="text-sm text-gray-900 line-clamp-2">
                                {suggestion.suggestion}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(suggestion.category)}`}
                            >
                              {suggestion.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {suggestion.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(suggestion.status)}`}
                            >
                              {suggestion.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                                View
                              </button>
                              <button className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <svg
                              className="w-16 h-16 mb-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1"
                                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                              />
                            </svg>
                            <p className="text-lg font-medium text-gray-500 mb-2">
                              No suggestions yet
                            </p>
                            <p className="text-sm text-gray-400">
                              Be the first to share your ideas and suggestions
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {paginatedSuggestions.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Showing{" "}
                      <span className="font-medium">
                        {paginatedSuggestions.length}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {filteredSuggestions.length}
                      </span>{" "}
                      suggestions
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-2 text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1),
                          )
                        }
                        disabled={
                          currentPage === totalPages || totalPages === 0
                        }
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionOfEmployee;
