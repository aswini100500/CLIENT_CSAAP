import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Printer,
  Search,
  RefreshCw,
  Layers3,
  FileText,
  ShieldCheck,
  Receipt,
  IndianRupee,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

const GSTSummary = () => {
  const [gstData, setGstData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { companyId } = useAuth();
  const location = useLocation();
  const { user } = useUser();

  const isEmployee = location.pathname.includes("/employee");

  const getSessionEmployeeId = () => {
    try {
      const userStr =
        sessionStorage.getItem("employeeUser") ||
        sessionStorage.getItem("adminUser") ||
        sessionStorage.getItem("user");
      const sessionUser = userStr ? JSON.parse(userStr) : null;
      return (
        sessionUser?.employee_id ||
        sessionUser?.id ||
        sessionUser?.employeeProfileId ||
        user?.employee_id ||
        user?.id ||
        null
      );
    } catch (e) {
      return user?.employee_id || user?.id || null;
    }
  };

  const currentEmployeeId = getSessionEmployeeId();

  useEffect(() => {
    if (companyId) fetchGSTData();
  }, [companyId]);

  const fetchGSTData = async () => {
    try {
      setLoading(true);
      setError(null);
      let employeeIdQuery = "";

      if (isEmployee && currentEmployeeId) {
        employeeIdQuery = `?employeeId=${currentEmployeeId}`;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/gst-summary/${companyId}${employeeIdQuery}`
      );

      if (response.data.success) {
        setGstData(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch GST data");
      }
    } catch (err) {
      setError(err.message);
      Swal.fire("Error", "Failed to load GST data: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = gstData.filter((item) => {
    return (
      (item.voucherNumber?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.voucherType || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleExportPDF = (isPrint = false) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("GST Summary Report", 14, 18);

    const tableData = filteredData.map((item, index) => [
      index + 1,
      item.date ? new Date(item.date).toLocaleDateString("en-IN") : "N/A",
      item.voucherType,
      item.voucherNumber || "N/A",
      item.igst || 0,
      item.cgst || 0,
      item.sgst || 0,
    ]);

    autoTable(doc, {
      startY: 28,
      head: [
        [
          "S.No",
          "Date",
          "Voucher Type",
          "Voucher Number",
          "IGST",
          "CGST",
          "SGST",
        ],
      ],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 166, 81] },
    });

    if (isPrint) {
      const blobURL = doc.output("bloburl");
      const printWindow = window.open(blobURL);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
        };
      }
    } else {
      doc.save("GST_Summary_Report.pdf");
    }
  };

  const handlePrint = () => handleExportPDF(true);

  const handleExportExcel = () => {
    if (gstData.length === 0) return;
    const exportData = filteredData.map((item, index) => ({
      "S.No": index + 1,
      Date: item.date ? new Date(item.date).toLocaleDateString("en-IN") : "N/A",
      "Voucher Type": item.voucherType,
      "Voucher Number": item.voucherNumber || "N/A",
      IGST: item.igst || 0,
      CGST: item.cgst || 0,
      SGST: item.sgst || 0,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GST_Summary");
    XLSX.writeFile(wb, "GST_Summary_Report.xlsx");
  };

  const totalIGST = () =>
    filteredData.reduce((sum, item) => sum + parseFloat(item.igst || 0), 0);
  const totalCGST = () =>
    filteredData.reduce((sum, item) => sum + parseFloat(item.cgst || 0), 0);
  const totalSGST = () =>
    filteredData.reduce((sum, item) => sum + parseFloat(item.sgst || 0), 0);
  const totalTax = () => totalIGST() + totalCGST() + totalSGST();

  if (loading) {
    return (
      <div className="erp-root app-shell min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#00a651] border-t-transparent mx-auto" />
          <p className="text-xs font-semibold text-[#475569]">Loading GST summary data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="erp-root app-shell min-h-screen flex items-center justify-center p-4">
        <div className="app-panel p-6 max-w-md text-center border border-rose-200 rounded-2xl bg-white space-y-3">
          <Layers3 className="mx-auto text-rose-500" size={40} />
          <p className="text-sm font-bold text-rose-700">Failed to load GST data</p>
          <p className="text-xs text-[#475569]">{error}</p>
          <button
            onClick={fetchGSTData}
            className="h-10 px-4 text-xs font-bold text-white bg-[#00a651] rounded-xl hover:bg-[#008c44] transition-all cursor-pointer inline-flex items-center justify-center"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="erp-root app-shell min-h-screen p-6 font-sans">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-white app-panel border border-[#e2f2e9] rounded-2xl p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-2xl bg-[#ecfdf5] border border-[#c6f1d6] flex items-center justify-center shrink-0">
                <Layers3 className="size-6 text-[#00a651]" />
              </div>
              <div>
                <h1 className="app-title text-xl font-extrabold text-[#042f2e]">
                  GST Summary
                </h1>
                <p className="app-subtitle text-xs md:text-sm text-[#475569] font-medium mt-0.5">
                  Tax liabilities breakdown for Sales and Purchase Vouchers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap no-print">
              <button
                onClick={fetchGSTData}
                className="h-10 px-4 app-btn-secondary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="size-4" /> Refresh
              </button>

              <button
                onClick={handlePrint}
                className="h-10 px-4 app-btn-secondary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="size-4" /> Print
              </button>

              <button
                onClick={handleExportExcel}
                className="h-10 px-4 text-xs font-bold text-[#00a651] bg-[#f0fdf4] border border-[#c6f1d6] rounded-xl hover:bg-[#00a651] hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileSpreadsheet className="size-4" /> Excel
              </button>

              <button
                onClick={() => handleExportPDF()}
                className="h-10 px-4 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-600 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="size-4" /> PDF
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="app-panel p-5 border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#475569]">Total GST Amount</p>
                  <div className="mt-2 text-2xl font-extrabold text-[#00a651]">
                    ₹{totalTax().toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                  <p className="mt-2 text-xs font-medium text-[#94a3b8]">
                    Combined IGST + CGST + SGST
                  </p>
                </div>
                <div className="size-11 rounded-2xl bg-[#ecfdf5] border border-[#c6f1d6] flex items-center justify-center shrink-0">
                  <IndianRupee className="size-5 text-[#00a651]" />
                </div>
              </div>
            </div>

            <div className="app-panel p-5 border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#475569]">Total IGST</p>
                  <div className="mt-2 text-2xl font-extrabold text-purple-700">
                    ₹{totalIGST().toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                  <p className="mt-2 text-xs font-medium text-[#94a3b8]">
                    Integrated tax liability
                  </p>
                </div>
                <div className="size-11 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-5 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="app-panel p-5 border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#475569]">Total CGST / SGST</p>
                  <div className="mt-2 text-2xl font-extrabold text-[#042f2e]">
                    ₹{(totalCGST() + totalSGST()).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                  <p className="mt-2 text-xs font-medium text-[#94a3b8]">
                    Central & State tax totals
                  </p>
                </div>
                <div className="size-11 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                  <Receipt className="size-5 text-sky-600" />
                </div>
              </div>
            </div>

            <div className="app-panel p-5 border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#475569]">Tax Records</p>
                  <div className="mt-2 text-2xl font-extrabold text-[#042f2e]">
                    {filteredData.length}
                  </div>
                  <p className="mt-2 text-xs font-medium text-[#94a3b8]">
                    Sales and Purchase vouchers
                  </p>
                </div>
                <div className="size-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <Layers3 className="size-5 text-slate-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="app-panel p-4 border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs no-print">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] size-4" />
              <input
                type="text"
                placeholder="Search by Voucher Type or Voucher Number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="app-input w-full pl-10 pr-4 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white placeholder-[#94a3b8] focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] outline-none"
              />
            </div>
          </div>

          {/* Table Panel */}
          <div className="app-panel overflow-hidden border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
            <div className="app-section-bar px-6 py-4 bg-[#f0fdf4]/60 border-b border-[#e2f2e9] flex items-center justify-between">
              <h3 className="app-heading text-sm font-bold text-[#042f2e]">
                GST Tax Voucher Register
              </h3>
              <span className="text-xs text-[#00a651] font-bold bg-[#f0fdf4] px-3 py-1 rounded-full border border-[#c6f1d6]">
                {filteredData.length} records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f8faf8] border-b border-[#e2f2e9]">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider w-12">
                      S.No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Voucher Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Voucher Number
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                      IGST (₹)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                      CGST (₹)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                      SGST (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2f2e9] bg-white">
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-[#f0fdf4]/50 transition-colors duration-150"
                      >
                        <td className="px-4 py-3.5 text-center text-xs font-medium text-slate-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3.5 text-sm font-medium text-slate-800">
                          {item.date
                            ? new Date(item.date).toLocaleDateString("en-IN")
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg ${
                              item.voucherType === "Sales"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-sky-50 text-sky-700 border border-sky-200"
                            }`}
                          >
                            {item.voucherType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">
                          {item.voucherNumber || "N/A"}
                        </td>
                        <td className="px-4 py-3.5 text-right text-sm font-semibold text-purple-700">
                          ₹{parseFloat(item.igst || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3.5 text-right text-sm font-medium text-slate-800">
                          ₹{parseFloat(item.cgst || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3.5 text-right text-sm font-medium text-slate-800">
                          ₹{parseFloat(item.sgst || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center">
                        <Layers3 className="size-8 mx-auto mb-3 text-[#94a3b8]" />
                        <p className="text-sm font-bold text-[#042f2e]">
                          No GST records found
                        </p>
                        <p className="text-xs mt-1 font-medium text-[#475569]">
                          {searchTerm
                            ? "Try refining your search keyword."
                            : "Sales or purchase vouchers with GST entries will appear here."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GSTSummary;
