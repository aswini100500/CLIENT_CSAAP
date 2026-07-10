import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Printer,
  Search,
  Package,
  RefreshCw,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useAuth from "../../../hooks/useAuth";
const StockNamesList = () => {
  const { user } = useAuth();
  const [stockNames, setStockNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmployeeActivity, setShowEmployeeActivity] = useState(false);
  const { companyId, employees } = useCompany();

  const loggedInRole = user?.role?.toLowerCase() || "admin";
  const loggedInEmployeeId = user?.employee_id || null;
  const isEmployeeDashboard = loggedInRole === "employee";

  const getEmployeeName = (id) => {
    const emp = employees?.find((e) => e.id == id);
    return emp ? emp.name : "Unknown Employee";
  };

  useEffect(() => {
    if (companyId) fetchStockNames();
  }, [companyId]);

  const fetchStockNames = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/stock/getStockNames/${companyId}`,
      );
      if (response.data.message === "Stock names fetched successfully") {
        setStockNames(response.data.data);
      } else {
        throw new Error("Failed to fetch stock names");
      }
    } catch (err) {
      setError(err.message);
      Swal.fire("Error", "Failed to load stock names: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredNames = stockNames.filter((stock) => {
    if (isEmployeeDashboard) {
      if (stock.employee_id != loggedInEmployeeId) return false;
    } else {
      const isCreatedByEmployee =
        stock.employee_id && stock.role?.toLowerCase() === "employee";
      if (showEmployeeActivity) {
        if (!isCreatedByEmployee) return false;
      } else {
        if (isCreatedByEmployee) return false;
      }
    }
    return stock.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleExportExcel = () => {
    if (stockNames.length === 0) return;
    const exportData = stockNames.map((stock, index) => ({
      "S.No": index + 1,
      "Stock Name": stock.name,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StockNames");
    XLSX.writeFile(wb, "Stock_Names_Report.xlsx");
  };

  const handleExportPDF = (isPrint = false) => {
    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text("Stock Names Report", 14, 18);

    const tableData = filteredNames.map((stock, index) => [
      index + 1,
      stock.name,
    ]);

    autoTable(doc, {
      startY: 28,

      head: [["S.No", "Stock Name"]],

      body: tableData,

      styles: {
        fontSize: 10,
      },

      headStyles: {
        fillColor: [37, 99, 235],
      },
    });

    if (isPrint) {
      const blobURL = doc.output("bloburl");

      const printWindow = window.open(blobURL);

      printWindow.onload = () => {
        printWindow.focus();

        printWindow.print();
      };
    } else {
      doc.save("Stock_Names_Report.pdf");
    }
  };

  const handlePrint = () => {
    handleExportPDF(true);
  };

  const getInitialColor = (name) => {
    const colors = [
      "bg-blue-100 text-blue-700",
      "bg-emerald-100 text-emerald-700",
      "bg-violet-100 text-violet-700",
      "bg-amber-100 text-amber-700",
      "bg-rose-100 text-rose-700",
      "bg-cyan-100 text-cyan-700",
      "bg-orange-100 text-orange-700",
      "bg-teal-100 text-teal-700",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading stock names...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-700 font-medium">
            Failed to load stock names
          </p>
          <p className="text-gray-400 text-sm mt-1">{error}</p>
          <button
            onClick={fetchStockNames}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
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
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="text-blue-600" size={22} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">
                  Stock Names
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  All stock item names
                </p>
              </div>
            </div>
            <div className="flex gap-2 no-print">
              <button
                onClick={fetchStockNames}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={14} /> Refresh
              </button>
              {!isEmployeeDashboard && (
                <button
                  onClick={() => setShowEmployeeActivity((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                    showEmployeeActivity
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Package size={14} />
                  {showEmployeeActivity ? "Back to Stock" : "Employee Activity"}
                </button>
              )}
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

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Total items</p>
              <p className="text-2xl font-semibold text-gray-800">
                {stockNames.length}
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Showing</p>
              <p className="text-2xl font-semibold text-blue-600">
                {filteredNames.length}
              </p>
            </div>
          </div>

          <div className="relative mb-4 no-print">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={15}
            />
            <input
              type="text"
              placeholder="Search stock names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">
                Stock items
              </span>
              <span className="text-xs bg-blue-100 text-blue-600 font-medium px-2.5 py-0.5 rounded-full">
                {filteredNames.length} shown
              </span>
            </div>

            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-14">
                    S.No
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Stock Name
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredNames.length > 0 ? (
                  filteredNames.map((stock, index) => (
                    <tr
                      key={stock.id}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${getInitialColor(stock.name)}`}
                          >
                            {stock.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-800">
                            {stock.name}
                            {stock.employee_id &&
                              stock.role?.toLowerCase() === "employee" && (
                                <span className="ml-2 text-xs text-gray-500 font-normal">
                                  (Created by:{" "}
                                  {getEmployeeName(stock.employee_id)})
                                </span>
                              )}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="px-4 py-12 text-center">
                      <Package
                        className="mx-auto mb-2 text-gray-300"
                        size={32}
                      />
                      <p className="text-sm text-gray-400 font-medium">
                        No stock names found
                      </p>
                      <p className="text-xs text-gray-300 mt-1">
                        {searchTerm
                          ? "Try a different search term"
                          : "Add stock items to see them here"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default StockNamesList;
