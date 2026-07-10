import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Printer,
  Search,
  RefreshCw,
  Layers3,
  UserRound,
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
  const [showEmployeeActivity, setShowEmployeeActivity] = useState(false);
  const { companyId } = useCompany();
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
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/gst-summary/${companyId}${employeeIdQuery}`,
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

  const handleExportPDF = (isPrint = false) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("GST Summary Report", 14, 18);

    const tableData = filteredData.map((item, index) => [
      index + 1,
      item.date ? new Date(item.date).toLocaleDateString() : "N/A",
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
      styles: { fontSize: 10 },
      headStyles: { fillColor: [147, 51, 234] },
    });

    if (isPrint) {
      const blobURL = doc.output("bloburl");
      const printWindow = window.open(blobURL);
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    } else {
      doc.save("GST_Summary_Report.pdf");
    }
  };

  const handlePrint = () => handleExportPDF(true);

  const handleExportExcel = () => {
    if (gstData.length === 0) return;
    const exportData = filteredData.map((item, index) => ({
      "S.No": index + 1,
      Date: item.date ? new Date(item.date).toLocaleDateString() : "N/A",
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

  const filteredData = gstData.filter((item) => {
    let matchesRole = true;
    if (isEmployee && currentEmployeeId) {
      if (
        item.creator_employee_id != currentEmployeeId &&
        item.created_by_employee_id != currentEmployeeId &&
        item.created_by_user_id != currentEmployeeId
      ) {
        matchesRole = false;
      }
    } else if (!isEmployee) {
      const isCreatedByEmployee =
        item.creator_employee_id || item.created_by_employee_id;
      if (showEmployeeActivity) {
        if (!isCreatedByEmployee) matchesRole = false;
      } else {
        if (isCreatedByEmployee) matchesRole = false;
      }
    }

    const matchesSearch =
      (item.voucherNumber?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.voucherType || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Loading GST data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium">Failed to load GST data</p>
          <p className="text-gray-400 text-sm mt-1">{error}</p>
          <button
            onClick={fetchGSTData}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-purple-100 flex items-center justify-center">
                <Layers3 className="text-purple-600" size={22} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">
                  GST Summary
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  Sales and Purchase Vouchers GST
                </p>
              </div>
            </div>
            <div className="flex gap-2 no-print">
              {!isEmployee && (
                <button
                  onClick={() => setShowEmployeeActivity((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                    showEmployeeActivity
                      ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <UserRound size={14} />
                  {showEmployeeActivity ? "Back to GST" : "Employee Activity"}
                </button>
              )}
              <button
                onClick={fetchGSTData}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Printer size={14} /> Print
              </button>
              <div className="flex gap-2 no-print">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  <FileSpreadsheet size={14} />
                  Excel
                </button>
                <button
                  onClick={() => handleExportPDF()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                >
                  <Printer size={14} />
                  PDF
                </button>
              </div>
            </div>
          </div>

          <div className="relative mb-4 no-print">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={15}
            />
            <input
              type="text"
              placeholder="Search by Voucher Type or Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>

          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">
                GST Records
              </span>
              <span className="text-xs bg-purple-100 text-purple-600 font-medium px-2.5 py-0.5 rounded-full">
                {filteredData.length} records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Voucher Type
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Voucher Number
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                      IGST
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                      CGST
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                      SGST
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-purple-50/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.date
                            ? new Date(item.date).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${
                              item.voucherType === "Sales"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {item.voucherType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                          {item.voucherNumber || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                          ₹{item.igst || 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                          ₹{item.cgst || 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                          ₹{item.sgst || 0}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center">
                        <Layers3
                          className="mx-auto mb-2 text-gray-300"
                          size={32}
                        />
                        <p className="text-sm text-gray-400 font-medium">
                          No GST records found
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
