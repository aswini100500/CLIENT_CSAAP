import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useCompany } from "../context/CompanyContext";
import {
  HiTruck,
  HiDocumentText,
  HiCalendar,
  HiUser,
  HiCheckCircle,
  HiEye,
  HiRefresh,
} from "react-icons/hi";

const EwayBillVouchers = () => {
  const { companyId } = useCompany();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchEwayBillVouchers = async () => {
    if (!companyId) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/sale-voucher/getEwaybill/${companyId}`,
      );

      if (response.data.success) {
        setVouchers(response.data.data || []);
      } else {
        Swal.fire(
          "Error",
          response.data.message || "Failed to fetch e-way bill vouchers",
          "error",
        );
      }
    } catch (error) {
      console.error("Error fetching e-way bill vouchers:", error);
      Swal.fire("Error", "Failed to fetch e-way bill vouchers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEwayBillVouchers();
  }, [companyId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const viewVoucherDetails = (voucher) => {
    setSelectedVoucher(voucher);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedVoucher(null);
  };

  const VoucherDetailsModal = () => {
    if (!selectedVoucher) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <HiDocumentText className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">
                E-way Bill Details - Invoice #
                {selectedVoucher.invoiceNo || "N/A"}
              </h3>
            </div>
            <button
              onClick={closeDetailsModal}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <HiDocumentText className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Invoice Number</p>
                    <p className="font-medium">
                      {selectedVoucher.invoiceNo || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <HiCalendar className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Invoice Date</p>
                    <p className="font-medium">
                      {formatDate(selectedVoucher.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <HiUser className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium">
                      {selectedVoucher.customer || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <HiDocumentText className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Grand Total</p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(selectedVoucher.grand_total)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
                E-way Bill Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">
                    E-way Bill Number
                  </label>
                  <p className="font-medium text-blue-600">
                    {selectedVoucher.ewayBillNo || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">
                    E-way Bill Date
                  </label>
                  <p className="font-medium">
                    {formatDate(selectedVoucher.ewayBillDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">
                    Consolidated E-way Bill No
                  </label>
                  <p className="font-medium">
                    {selectedVoucher.consolidatedEwayBillNo || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Sub Type</label>
                  <p className="font-medium">
                    {selectedVoucher.subType || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
                Transport Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">
                    Transport Mode
                  </label>
                  <p className="font-medium">
                    {selectedVoucher.transportMode || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">
                    Vehicle Number
                  </label>
                  <p className="font-medium">
                    {selectedVoucher.vehicleNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Vehicle Type</label>
                  <p className="font-medium">
                    {selectedVoucher.vehicleType || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Distance (KM)</label>
                  <p className="font-medium">
                    {selectedVoucher.distanceKM || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">
                    Transport Date
                  </label>
                  <p className="font-medium">
                    {formatDate(selectedVoucher.transportDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Document No</label>
                  <p className="font-medium">
                    {selectedVoucher.documentNo || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {selectedVoucher.consignorName && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
                  Consignor Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <p className="font-medium">
                      {selectedVoucher.consignorName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">GSTIN</label>
                    <p className="font-medium">
                      {selectedVoucher.consignorGSTIN || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">State</label>
                    <p className="font-medium">
                      {selectedVoucher.consignorState || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Pincode</label>
                    <p className="font-medium">
                      {selectedVoucher.consignorPincode || "N/A"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600">Address</label>
                    <p className="font-medium">
                      {selectedVoucher.consignorAddress || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedVoucher.consigneeName && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
                  Consignee Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <p className="font-medium">
                      {selectedVoucher.consigneeName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">GSTIN</label>
                    <p className="font-medium">
                      {selectedVoucher.consigneeGSTIN || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">State</label>
                    <p className="font-medium">
                      {selectedVoucher.consigneeState || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Pincode</label>
                    <p className="font-medium">
                      {selectedVoucher.consigneePincode || "N/A"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600">Address</label>
                    <p className="font-medium">
                      {selectedVoucher.consigneeAddress || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedVoucher.transporterName && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
                  Transporter Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">
                      Transporter Name
                    </label>
                    <p className="font-medium">
                      {selectedVoucher.transporterName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Transporter ID
                    </label>
                    <p className="font-medium">
                      {selectedVoucher.transporterID || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={closeDetailsModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white mx-auto shadow-md rounded-xl border border-gray-300 max-w-6xl">
      <div className="border-b py-3 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <HiTruck className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-blue-800">
                E-way Bill Vouchers
              </h1>
              <p className="text-gray-600 text-sm">
                List of all sale vouchers with e-way bill details
              </p>
            </div>
          </div>
          <button
            onClick={fetchEwayBillVouchers}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
          >
            <HiRefresh
              className={`w-5 h-5 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {vouchers.length === 0 ? (
            <div className="text-center py-12">
              <HiDocumentText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No E-way Bill Vouchers
              </h3>
              <p className="text-gray-500">
                No sale vouchers with e-way bill details found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                      Invoice No
                    </th>
                    <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                      Customer
                    </th>
                    <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                      E-way Bill No
                    </th>
                    <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                      Total Amount
                    </th>
                    <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                      Transport Mode
                    </th>
                    <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((voucher) => (
                    <tr key={voucher.id} className="hover:bg-gray-50 border-b">
                      <td className="border px-4 py-3">
                        <div className="font-medium">
                          {voucher.invoiceNo || "N/A"}
                        </div>
                      </td>
                      <td className="border px-4 py-3">
                        <div className="flex items-center">
                          <HiUser className="w-4 h-4 text-gray-500 mr-2" />
                          <span>{voucher.customer || "N/A"}</span>
                        </div>
                      </td>
                      <td className="border px-4 py-3">
                        <div className="flex items-center">
                          <HiDocumentText className="w-4 h-4 text-blue-500 mr-2" />
                          <span className="font-medium text-blue-600">
                            {voucher.ewayBillNo || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="border px-4 py-3">
                        <div className="flex items-center">
                          <HiCalendar className="w-4 h-4 text-gray-500 mr-2" />
                          <span>{formatDate(voucher.date)}</span>
                        </div>
                      </td>
                      <td className="border px-4 py-3 font-semibold text-green-600">
                        {formatCurrency(voucher.grand_total)}
                      </td>
                      <td className="border px-4 py-3">
                        <div className="flex items-center">
                          <HiTruck className="w-4 h-4 text-gray-500 mr-2" />
                          <span>{voucher.transportMode || "N/A"}</span>
                        </div>
                      </td>
                      <td className="border px-4 py-3">
                        <button
                          onClick={() => viewVoucherDetails(voucher)}
                          className="flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm"
                        >
                          <HiEye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {vouchers.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <HiCheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-700">
                    Total {vouchers.length} e-way bill voucher
                    {vouchers.length !== 1 ? "s" : ""} found
                  </span>
                </div>
                <div className="text-lg font-semibold text-blue-800">
                  Total Amount:{" "}
                  {formatCurrency(
                    vouchers.reduce(
                      (sum, voucher) =>
                        sum + parseFloat(voucher.grand_total || 0),
                      0,
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showDetailsModal && <VoucherDetailsModal />}
    </div>
  );
};

export default EwayBillVouchers;
