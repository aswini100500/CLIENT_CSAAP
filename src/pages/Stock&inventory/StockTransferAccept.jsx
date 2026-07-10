import React, { useState } from "react";
import axios from "axios";
import useSWR, { mutate } from "swr";
import { getAuthToken } from "../../store/authSession";
import { CheckCircle, AlertCircle, X, Eye, Check, XCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_CSAAP_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const fetcher = (url) => api.get(url).then((res) => res.data);

const StockTransferAccept = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [notification, setNotification] = useState({
    show: false,
    type: "",
    title: "",
    message: "",
  });

  const showNotification = (type, title, message) => {
    setNotification({
      show: true,
      type,
      title,
      message,
    });

    setTimeout(() => {
      setNotification({ show: false, type: "", title: "", message: "" });
    }, 5000);
  };

  const closeNotification = () => {
    setNotification({ show: false, type: "", title: "", message: "" });
  };

  const {
    data: pendingTransfersData,
    isLoading: pendingLoading,
    mutate: mutatePending,
  } = useSWR("/api/tenant/stock/transfer/pending", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const {
    data: transferHistoryData,
    isLoading: historyLoading,
    mutate: mutateHistory,
  } = useSWR("/api/tenant/stock/transfer/history", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const { data: masterData } = useSWR(
    "/api/tenant/stock/master-data",
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const pendingTransfers = pendingTransfersData?.success
    ? pendingTransfersData.data || []
    : [];
  const transferHistory = transferHistoryData?.success
    ? transferHistoryData.data || []
    : [];

  const master = masterData?.success ? masterData.data : {};
  const stores = master.stores || [];
  const products = master.products || [];
  const categories = master.categories || [];

  const allTransfers = [...pendingTransfers, ...transferHistory];

  const filteredTransfers = allTransfers.filter((transfer) => {
    const fromStoreName =
      stores.find((store) => store.id === transfer.from_store_id)?.name || "";
    const toStoreName =
      stores.find((store) => store.id === transfer.to_store_id)?.name || "";
    const productName =
      products.find((product) => product.id === transfer.product_id)?.name ||
      "";

    return (
      fromStoreName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      toStoreName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transfer.notes &&
        transfer.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const getStoreName = (storeId) => {
    const store = stores.find((s) => s.id === storeId);
    return store ? store.name : `Store ${storeId}`;
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : `Product ${productId}`;
  };

  const getCategoryName = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return "—";
    const category = categories.find((c) => c.id === product.category_id);
    return category ? category.name : "—";
  };

  const totalPages = Math.ceil(filteredTransfers.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const paginatedTransfers = filteredTransfers.slice(
    startIndex,
    startIndex + entriesToShow,
  );

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handleViewDetails = (transfer) => {
    setSelectedTransfer(transfer);
    setShowDetailsModal(true);
  };

  const handleAcceptTransfer = async (transferId) => {
    if (!transferId) {
      showNotification("error", "Error", "Invalid transfer ID");
      return;
    }

    setIsProcessing(true);
    try {
      const transferToAccept = allTransfers.find((t) => t.id === transferId);
      if (!transferToAccept) {
        throw new Error("Transfer not found");
      }

      const acceptData = {
        from_store_id: transferToAccept.from_store_id,
        to_store_id: transferToAccept.to_store_id,
        product_id: transferToAccept.product_id,
        quantity: transferToAccept.quantity,
        notes: transferToAccept.notes || "",
        requested_by: transferToAccept.requested_by || "System",
      };

      const response = await api.put(
        `/api/tenant/stock/transfer/accept/${transferId}`,
        acceptData,
      );

      if (response.data.success) {
        showNotification(
          "success",
          "Success!",
          "Transfer accepted successfully!",
        );

        mutatePending();
        mutateHistory();

        if (showDetailsModal) {
          setShowDetailsModal(false);
        }
      } else {
        throw new Error(response.data.message || "Failed to accept transfer");
      }
    } catch (error) {
      console.error("Error accepting transfer:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to accept transfer. Please try again.";
      showNotification("error", "Error", errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectTransfer = async (transferId) => {
    if (!transferId) {
      showNotification("error", "Error", "Invalid transfer ID");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.put(
        `/api/tenant/stock/transfer/reject/${transferId}`,
        {
          rejected_by: "Manager",
        },
      );

      if (response.data.success) {
        showNotification(
          "success",
          "Success!",
          "Transfer rejected successfully!",
        );

        mutatePending();
        mutateHistory();

        if (showDetailsModal) {
          setShowDetailsModal(false);
        }
      } else {
        throw new Error(response.data.message || "Failed to reject transfer");
      }
    } catch (error) {
      console.error("Error rejecting transfer:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to reject transfer. Please try again.";
      showNotification("error", "Error", errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (pendingLoading || historyLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transfer data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
            notification.type === "success"
              ? "bg-green-50 border-l-4 border-green-500"
              : notification.type === "error"
                ? "bg-red-50 border-l-4 border-red-500"
                : "bg-blue-50 border-l-4 border-blue-500"
          } p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out`}
        >
          <div className="flex items-start">
            <div
              className={`shrink-0 ${
                notification.type === "success"
                  ? "text-green-600"
                  : notification.type === "error"
                    ? "text-red-600"
                    : "text-blue-600"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle size={24} />
              ) : notification.type === "error" ? (
                <AlertCircle size={24} />
              ) : (
                <CheckCircle size={24} />
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${
                  notification.type === "success"
                    ? "text-green-800"
                    : notification.type === "error"
                      ? "text-red-800"
                      : "text-blue-800"
                }`}
              >
                {notification.title}
              </p>
              <p
                className={`mt-1 text-sm ${
                  notification.type === "success"
                    ? "text-green-700"
                    : notification.type === "error"
                      ? "text-red-700"
                      : "text-blue-700"
                }`}
              >
                {notification.message}
              </p>
            </div>
            <button
              onClick={closeNotification}
              className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 text-gray-400 hover:text-gray-900"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Accept Transfer</h1>
          <p className="text-gray-600 mt-1">
            Manage and accept stock transfers
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Show</span>
                <select
                  value={entriesToShow}
                  onChange={(e) => {
                    setEntriesToShow(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-sm text-gray-600 ml-2">entries</span>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search by store, product, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-4 h-4 text-gray-400"
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transfer Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransfers.length > 0 ? (
                paginatedTransfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(
                        transfer.transfer_date || transfer.created_at,
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getStoreName(transfer.from_store_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getStoreName(transfer.to_store_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getProductName(transfer.product_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transfer.quantity} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transfer.status === "accepted" ||
                          transfer.status === "Accepted"
                            ? "bg-green-100 text-green-800"
                            : transfer.status === "pending" ||
                                transfer.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : transfer.status === "rejected" ||
                                  transfer.status === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {transfer.status || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(transfer)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center"
                          title="View Details"
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </button>

                        {(transfer.status === "pending" ||
                          transfer.status === "Pending") && (
                          <>
                            <button
                              onClick={() => handleAcceptTransfer(transfer.id)}
                              disabled={isProcessing}
                              className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center disabled:opacity-50"
                              title="Accept Transfer"
                            >
                              {isProcessing ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-1"></div>
                              ) : (
                                <Check size={16} className="mr-1" />
                              )}
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectTransfer(transfer.id)}
                              disabled={isProcessing}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center disabled:opacity-50"
                              title="Reject Transfer"
                            >
                              <XCircle size={16} className="mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No transfer requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-700">
              Showing {paginatedTransfers.length > 0 ? startIndex + 1 : 0} to{" "}
              {Math.min(startIndex + entriesToShow, filteredTransfers.length)}{" "}
              of {filteredTransfers.length} entries
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                Previous
              </button>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  currentPage === totalPages || totalPages === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDetailsModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Transfer Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Transfer ID</p>
                    <p className="font-medium">#{selectedTransfer.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedTransfer.status === "accepted" ||
                        selectedTransfer.status === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : selectedTransfer.status === "pending" ||
                              selectedTransfer.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedTransfer.status === "rejected" ||
                                selectedTransfer.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedTransfer.status || "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">From Store</p>
                    <p className="font-medium">
                      {getStoreName(selectedTransfer.from_store_id)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">To Store</p>
                    <p className="font-medium">
                      {getStoreName(selectedTransfer.to_store_id)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Product</p>
                    <p className="font-medium">
                      {getProductName(selectedTransfer.product_id)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Category: {getCategoryName(selectedTransfer.product_id)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="font-medium">
                      {selectedTransfer.quantity} units
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Transfer Date</p>
                  <p className="font-medium">
                    {formatDate(
                      selectedTransfer.transfer_date ||
                        selectedTransfer.created_at,
                    )}
                  </p>
                </div>

                {selectedTransfer.requested_by && (
                  <div>
                    <p className="text-sm text-gray-600">Requested By</p>
                    <p className="font-medium">
                      {selectedTransfer.requested_by}
                    </p>
                  </div>
                )}

                {selectedTransfer.completed_at && (
                  <div>
                    <p className="text-sm text-gray-600">Completed At</p>
                    <p className="font-medium">
                      {formatDate(selectedTransfer.completed_at)}
                    </p>
                  </div>
                )}

                {selectedTransfer.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm">{selectedTransfer.notes}</p>
                    </div>
                  </div>
                )}

                {(selectedTransfer.status === "pending" ||
                  selectedTransfer.status === "Pending") && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() =>
                          handleRejectTransfer(selectedTransfer.id)
                        }
                        disabled={isProcessing}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {isProcessing ? "Processing..." : "Reject Transfer"}
                      </button>
                      <button
                        onClick={() =>
                          handleAcceptTransfer(selectedTransfer.id)
                        }
                        disabled={isProcessing}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check size={18} className="mr-2" />
                            Accept Transfer
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTransferAccept;
