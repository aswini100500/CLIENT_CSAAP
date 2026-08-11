import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";
import {
  RefreshCw,
  FileText,
  Truck,
  User,
  X,
  Eye,
  CheckCircle2,
  ListOrdered,
} from "lucide-react";

const EwayBillVouchers = () => {
  const { companyId } = useAuth();
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
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div className="bg-white rounded-2xl border border-[#e2f2e9] shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="sticky top-0 bg-white border-b border-[#e2f2e9] px-6 py-4 flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-[#f0fdf4] border border-[#c6f1d6] flex items-center justify-center text-[#00a651]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="app-title text-base font-extrabold text-[#042f2e]">
                  E-way Bill Details
                </h3>
                <p className="app-subtitle text-xs text-[#475569] font-mono mt-0.5">
                  Invoice #{selectedVoucher.invoiceNo || "N/A"}
                </p>
              </div>
            </div>
            <button
              onClick={closeDetailsModal}
              className="size-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6 text-xs">
            <div className="bg-[#f8faf8] border border-[#e2f2e9] rounded-xl p-4">
              <h4 className="text-xs font-extrabold text-[#042f2e] uppercase tracking-wider mb-3 pb-2 border-b border-[#e2f2e9] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00a651]" />
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-[#475569] font-medium">Invoice Number</p>
                  <p className="font-bold text-[#042f2e] mt-0.5 font-mono">
                    {selectedVoucher.invoiceNo || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[#475569] font-medium">Invoice Date</p>
                  <p className="font-bold text-[#042f2e] mt-0.5">
                    {formatDate(selectedVoucher.date)}
                  </p>
                </div>
                <div>
                  <p className="text-[#475569] font-medium">Customer</p>
                  <p className="font-bold text-[#042f2e] mt-0.5">
                    {selectedVoucher.customer || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[#475569] font-medium">Grand Total</p>
                  <p className="font-extrabold text-[#00a651] text-sm mt-0.5">
                    {formatCurrency(selectedVoucher.grand_total)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#f8faf8] border border-[#e2f2e9] rounded-xl p-4">
              <h4 className="text-xs font-extrabold text-[#042f2e] uppercase tracking-wider mb-3 pb-2 border-b border-[#e2f2e9] flex items-center gap-2">
                <Truck className="w-4 h-4 text-teal-600" />
                E-way Bill Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-[#475569] font-medium">
                    E-way Bill Number
                  </p>
                  <p className="font-bold text-[#00a651] mt-0.5 font-mono">
                    {selectedVoucher.ewayBillNo || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[#475569] font-medium">E-way Bill Date</p>
                  <p className="font-bold text-[#042f2e] mt-0.5">
                    {formatDate(selectedVoucher.ewayBillDate)}
                  </p>
                </div>
                <div>
                  <p className="text-[#475569] font-medium">
                    Consolidated E-way Bill No
                  </p>
                  <p className="font-bold text-[#042f2e] mt-0.5">
                    {selectedVoucher.consolidatedEwayBillNo || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[#475569] font-medium">Sub Type</p>
                  <p className="font-bold text-[#042f2e] mt-0.5">
                    {selectedVoucher.subType || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#f8faf8] border border-[#e2f2e9] rounded-xl p-4">
              <h4 className="text-xs font-extrabold text-[#042f2e] uppercase tracking-wider mb-3 pb-2 border-b border-[#e2f2e9] flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600" />
                Transport Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-[#475569] font-medium">Transport Mode</p>
                  <p className="font-bold text-[#042f2e] mt-0.5">
                    {selectedVoucher.transportMode || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[#475569] font-medium">Vehicle Number</p>
                  <p className="font-bold text-[#042f2e] mt-0.5 font-mono">
                    {selectedVoucher.vehicleNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[#475569] font-medium">Vehicle Type</p>
                  <p className="font-bold text-[#042f2e] mt-0.5">
                    {selectedVoucher.vehicleType || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[#475569] font-medium">Distance (KM)</p>
                  <p className="font-bold text-[#042f2e] mt-0.5">
                    {selectedVoucher.distanceKM || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[#475569] font-medium">Transport Date</p>
                  <p className="font-bold text-[#042f2e] mt-0.5">
                    {formatDate(selectedVoucher.transportDate)}
                  </p>
                </div>
                <div>
                  <p className="text-[#475569] font-medium">Document No</p>
                  <p className="font-bold text-[#042f2e] mt-0.5 font-mono">
                    {selectedVoucher.documentNo || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {selectedVoucher.consignorName && (
              <div className="bg-[#f8faf8] border border-[#e2f2e9] rounded-xl p-4">
                <h4 className="text-xs font-extrabold text-[#042f2e] uppercase tracking-wider mb-3 pb-2 border-b border-[#e2f2e9] flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-600" />
                  Consignor Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#475569] font-medium">Name</p>
                    <p className="font-bold text-[#042f2e] mt-0.5">
                      {selectedVoucher.consignorName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#475569] font-medium">GSTIN</p>
                    <p className="font-bold text-[#042f2e] mt-0.5 font-mono">
                      {selectedVoucher.consignorGSTIN || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#475569] font-medium">State</p>
                    <p className="font-bold text-[#042f2e] mt-0.5">
                      {selectedVoucher.consignorState || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#475569] font-medium">Pincode</p>
                    <p className="font-bold text-[#042f2e] mt-0.5">
                      {selectedVoucher.consignorPincode || "N/A"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[#475569] font-medium">Address</p>
                    <p className="font-medium text-[#042f2e] mt-0.5">
                      {selectedVoucher.consignorAddress || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedVoucher.consigneeName && (
              <div className="bg-[#f8faf8] border border-[#e2f2e9] rounded-xl p-4">
                <h4 className="text-xs font-extrabold text-[#042f2e] uppercase tracking-wider mb-3 pb-2 border-b border-[#e2f2e9] flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  Consignee Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#475569] font-medium">Name</p>
                    <p className="font-bold text-[#042f2e] mt-0.5">
                      {selectedVoucher.consigneeName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#475569] font-medium">GSTIN</p>
                    <p className="font-bold text-[#042f2e] mt-0.5 font-mono">
                      {selectedVoucher.consigneeGSTIN || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#475569] font-medium">State</p>
                    <p className="font-bold text-[#042f2e] mt-0.5">
                      {selectedVoucher.consigneeState || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#475569] font-medium">Pincode</p>
                    <p className="font-bold text-[#042f2e] mt-0.5">
                      {selectedVoucher.consigneePincode || "N/A"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[#475569] font-medium">Address</p>
                    <p className="font-medium text-[#042f2e] mt-0.5">
                      {selectedVoucher.consigneeAddress || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedVoucher.transporterName && (
              <div className="bg-[#f8faf8] border border-[#e2f2e9] rounded-xl p-4">
                <h4 className="text-xs font-extrabold text-[#042f2e] uppercase tracking-wider mb-3 pb-2 border-b border-[#e2f2e9] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Transporter Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#475569] font-medium">
                      Transporter Name
                    </p>
                    <p className="font-bold text-[#042f2e] mt-0.5">
                      {selectedVoucher.transporterName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#475569] font-medium">Transporter ID</p>
                    <p className="font-bold text-[#042f2e] mt-0.5 font-mono">
                      {selectedVoucher.transporterID || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end px-6 py-4 bg-slate-50 border-t border-[#e2f2e9]">
            <button
              onClick={closeDetailsModal}
              className="px-5 py-2 bg-[#042f2e] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#e2f2e9] rounded-2xl py-3 px-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl border bg-teal-50 border-teal-200 text-teal-600">
            <ListOrdered className="w-4 h-4" />
          </div>
          <div>
            <h2 className="app-title text-base font-extrabold text-[#042f2e] tracking-tight">
              E-way Bill Vouchers
            </h2>
            <p className="app-subtitle text-[11px] text-[#475569] font-medium">
              Generate and manage e-way bill transport documentation
            </p>
          </div>
        </div>
        <button
          onClick={fetchEwayBillVouchers}
          disabled={loading}
          className="h-9 flex items-center gap-1.5 bg-linear-to-r from-[#00a651] to-[#00c853] hover:from-[#008c44] hover:to-[#00a651] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-3">
          <div className="animate-spin h-8 w-8 rounded-full border-2 border-[#00a651] border-t-transparent" />
          <span className="text-xs font-semibold text-slate-500">
            Loading E-way Bill Vouchers…
          </span>
        </div>
      ) : (
        <>
          {vouchers.length === 0 ? (
            <div className="bg-white border border-[#e2f2e9] rounded-2xl p-12 text-center shadow-2xs">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#042f2e] mb-1">
                No E-way Bill Vouchers Found
              </h3>
              <p className="text-xs text-[#475569]">
                No sale vouchers with e-way bill details are recorded for this
                company.
              </p>
            </div>
          ) : (
            <div className="app-panel overflow-hidden border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
              <div className="app-section-bar px-4 py-3 bg-white border-b border-[#e2f2e9] flex items-center justify-between">
                <h3 className="app-heading text-xs font-extrabold text-[#042f2e] uppercase tracking-wider">
                  E-way Bill Documentation List
                </h3>
                <span className="text-xs text-[#475569] font-medium">
                  {vouchers.length} Vouchers
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse bg-white">
                  <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9]">
                    <tr className="text-left text-[#475569]">
                      <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        Invoice No
                      </th>
                      <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        Customer
                      </th>
                      <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        E-way Bill No
                      </th>
                      <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        Date
                      </th>
                      <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                        Total Amount
                      </th>
                      <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        Transport Mode
                      </th>
                      <th className="py-2.5 px-3.5 text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2f2e9] bg-white">
                    {vouchers.map((voucher) => (
                      <tr
                        key={voucher.id}
                        className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-200"
                      >
                        <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] font-mono text-xs font-bold text-[#042f2e] whitespace-nowrap">
                          {voucher.invoiceNo || "N/A"}
                        </td>
                        <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] font-bold text-[#042f2e] text-[13px]">
                          {voucher.customer || "N/A"}
                        </td>
                        <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] font-mono font-bold text-[#00a651] whitespace-nowrap">
                          {voucher.ewayBillNo || "N/A"}
                        </td>
                        <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[#475569] font-medium whitespace-nowrap">
                          {formatDate(voucher.date)}
                        </td>
                        <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-right font-bold text-[#00a651] whitespace-nowrap">
                          {formatCurrency(voucher.grand_total)}
                        </td>
                        <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f8faf8] text-slate-700 border border-[#e2f2e9]">
                            <Truck className="w-3 h-3 text-[#475569]" />
                            {voucher.transportMode || "N/A"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => viewVoucherDetails(voucher)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#f0fdf4] text-[#00a651] hover:bg-[#c6f1d6] rounded-lg text-xs font-bold transition-all border border-[#c6f1d6] cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {vouchers.length > 0 && (
            <div className="p-3.5 bg-white border border-[#e2f2e9] text-[#042f2e] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00a651]" />
                <span className="text-xs text-[#475569]">
                  Total{" "}
                  <span className="text-[#042f2e] font-bold">
                    {vouchers.length}
                  </span>{" "}
                  e-way bill voucher{vouchers.length !== 1 ? "s" : ""} found
                </span>
              </div>
              <div className="text-xs text-[#475569]">
                Total Amount:{" "}
                <span className="text-[#00a651] text-sm ml-1 font-extrabold">
                  {formatCurrency(
                    vouchers.reduce(
                      (sum, voucher) =>
                        sum + parseFloat(voucher.grand_total || 0),
                      0,
                    ),
                  )}
                </span>
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
