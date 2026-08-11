import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Printer,
  Edit3,
  Trash2,
  FolderKanban,
  IndianRupee,
  ShieldCheck,
  ChevronDown,
  Boxes,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";

const StockList = () => {
  const { companyId } = useAuth();
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    if (companyId) fetchStockData();
  }, [companyId]);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/stock/getStockData/${companyId}`
      );
      if (response.data.message === "Data fetched successfully") {
        setStocks(response.data.data);
      } else {
        throw new Error("Failed to fetch stock data");
      }
    } catch (err) {
      setError(err.message);
      Swal.fire("Error", "Failed to load stock data: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStock = async (id) => {
    const stockName = stocks.find((s) => s.id === id)?.name || "this item";
    const result = await Swal.fire({
      title: "Delete stock item?",
      text: `"${stockName}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/stock/deleteStock/${companyId}/${id}`
        );
        if (response.data.message === "Stock deleted successfully") {
          Swal.fire({
            icon: "success",
            title: "Deleted",
            text: `${stockName} has been deleted`,
            timer: 1800,
            showConfirmButton: false,
          });
          fetchStockData();
          if (selectedStock?.id === id) setSelectedStock(null);
        }
      } catch (err) {
        Swal.fire("Error", "Error deleting stock: " + err.message, "error");
      }
    }
  };

  const handleEditClick = (stock) => {
    const userStr = sessionStorage.getItem("user");
    let role = "admin";
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        role = userObj.role || "admin";
      } catch (e) {}
    }
    const basePath =
      role === "employee"
        ? "/employee/hr/accounting/client"
        : "/accounting/client";
    navigate(`${basePath}/stockItemCreation?id=${stock.id}`, { state: stock });
  };

  const fmt = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? "0.00" : num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleExportExcel = () => {
    if (!stocks.length) return;
    const ws = XLSX.utils.json_to_sheet(
      stocks.map((s) => ({
        Name: s.name,
        Alias: s.alias,
        Category: s.under,
        Units: s.units,
        HSN: s.hsn,
        "GST Applicable": s.gstApplicable,
        "Opening Qty": s.openingBalanceQty,
        "Opening Rate": s.openingBalanceRate,
        "Opening Value": s.openingBalanceValue,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StockList");
    XLSX.writeFile(wb, "Stock_List_Report.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Stock List Report", 14, 15);

    const tableData = filteredStocks.map((s) => [
      s.name,
      s.alias || "-",
      s.under,
      s.units,
      s.hsn || "-",
      s.gstApplicable,
      fmt(s.openingBalanceQty),
      fmt(s.openingBalanceRate),
      fmt(s.openingBalanceValue),
    ]);

    autoTable(doc, {
      startY: 25,
      head: [
        [
          "Name",
          "Alias",
          "Category",
          "Units",
          "HSN",
          "GST",
          "Qty",
          "Rate",
          "Value",
        ],
      ],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 166, 81] },
    });

    doc.save("Stock_List_Report.pdf");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "width=1200,height=800");

    const rows = filteredStocks
      .map(
        (s) => `
      <tr>
        <td>${s.name}</td>
        <td>${s.alias || "-"}</td>
        <td>${s.under}</td>
        <td>${s.units}</td>
        <td>${s.hsn || "-"}</td>
        <td>${s.gstApplicable}</td>
        <td style="text-align:right;">${fmt(s.openingBalanceQty)}</td>
        <td style="text-align:right;">₹${fmt(s.openingBalanceRate)}</td>
        <td style="text-align:right;">₹${fmt(s.openingBalanceValue)}</td>
      </tr>
    `
      )
      .join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>Stock List Report</title>
        <style>
          body { font-family: sans-serif; padding: 24px; color: #042f2e; }
          h1 { margin-bottom: 20px; color: #00a651; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #e2f2e9; padding: 10px; font-size: 12px; }
          th { background: #f0fdf4; text-align: left; }
          tfoot td { font-weight: bold; background: #f8faf8; }
        </style>
      </head>
      <body>
        <h1>Stock List Report</h1>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Alias</th>
              <th>Category</th>
              <th>Units</th>
              <th>HSN</th>
              <th>GST</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="8">Total</td>
              <td style="text-align:right;">₹${filteredStocks
                .reduce((s, i) => s + parseFloat(i.openingBalanceValue || 0), 0)
                .toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const exportToCSV = () => {
    const rows = [
      [
        "Name",
        "Alias",
        "Category",
        "Units",
        "HSN",
        "GST Applicable",
        "Opening Qty",
        "Opening Rate",
        "Opening Value",
      ],
      ...stocks.map((s) => [
        s.name,
        s.alias,
        s.under,
        s.units,
        s.hsn,
        s.gstApplicable,
        s.openingBalanceQty,
        s.openingBalanceRate,
        s.openingBalanceValue,
      ]),
      [],
      [
        "Total Opening Value",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        totalValue().toFixed(2),
      ],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock_list_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalValue = () =>
    stocks.reduce((sum, s) => sum + parseFloat(s.openingBalanceValue || 0), 0);

  const uniqueCategories = () => new Set(stocks.map((s) => s.under)).size;

  const filteredStocks = stocks.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.alias || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.hsn || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.under.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="erp-root app-shell min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#00a651] border-t-transparent mx-auto"></div>
          <p className="text-xs font-semibold text-[#475569]">Loading stock data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="erp-root app-shell min-h-screen flex items-center justify-center p-4">
        <div className="app-panel p-6 max-w-md text-center border border-rose-200 rounded-2xl bg-white space-y-3">
          <p className="text-sm font-bold text-rose-700">Failed to load stock data</p>
          <p className="text-xs text-[#475569]">{error}</p>
          <button
            onClick={fetchStockData}
            className="h-10 px-4 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-all cursor-pointer inline-flex items-center justify-center"
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
          body { background: white; }
        }
      `}</style>

      <div className="erp-root app-shell min-h-screen p-6 font-sans">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-white app-panel border border-[#e2f2e9] rounded-2xl p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-2xl bg-[#ecfdf5] border border-[#c6f1d6] flex items-center justify-center shrink-0">
                <Boxes className="size-6 text-[#00a651]" />
              </div>
              <div>
                <h1 className="app-title text-xl font-extrabold text-[#042f2e]">
                  Stock Summary
                </h1>
                <p className="app-subtitle text-xs md:text-sm text-[#475569] font-medium mt-0.5">
                  Inventory items breakdown, category valuation, and stock group register.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap no-print">
              <button
                onClick={fetchStockData}
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

              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="h-10 px-4 text-xs font-bold text-[#00a651] bg-[#f0fdf4] border border-[#c6f1d6] rounded-xl hover:bg-[#00a651] hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="size-4" /> Export <ChevronDown className="size-4" />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-[#e2f2e9] rounded-xl shadow-lg z-20 overflow-hidden py-1">
                    <button
                      onClick={() => {
                        handleExportExcel();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#042f2e] hover:bg-[#f0fdf4] flex items-center gap-2"
                    >
                      <FileSpreadsheet className="size-4 text-[#00a651]" /> Excel Sheet
                    </button>
                    <button
                      onClick={() => {
                        exportToCSV();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#042f2e] hover:bg-[#f0fdf4] flex items-center gap-2"
                    >
                      <FileText className="size-4 text-sky-600" /> CSV File
                    </button>
                    <button
                      onClick={() => {
                        handleExportPDF();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#042f2e] hover:bg-[#f0fdf4] flex items-center gap-2"
                    >
                      <Printer className="size-4 text-rose-600" /> PDF Document
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  const userStr = sessionStorage.getItem("user");
                  let role = "admin";
                  if (userStr) {
                    try {
                      const userObj = JSON.parse(userStr);
                      role = userObj.role || "admin";
                    } catch (e) {}
                  }
                  const basePath =
                    role === "employee"
                      ? "/employee/hr/accounting/client"
                      : "/accounting/client";
                  navigate(`${basePath}/stockItemCreation`);
                }}
                className="h-10 px-4 app-btn-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="size-4" /> Add Stock Item
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="app-panel p-5 border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#475569]">Total Stock Items</p>
                  <div className="mt-2 text-2xl font-extrabold text-[#042f2e]">
                    {stocks.length}
                  </div>
                  <p className="mt-2 text-xs font-medium text-[#94a3b8]">
                    {filteredStocks.length} currently showing
                  </p>
                </div>
                <div className="size-11 rounded-2xl bg-[#ecfdf5] border border-[#c6f1d6] flex items-center justify-center shrink-0">
                  <Package className="size-5 text-[#00a651]" />
                </div>
              </div>
            </div>

            <div className="app-panel p-5 border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#475569]">Stock Groups</p>
                  <div className="mt-2 text-2xl font-extrabold text-[#042f2e]">
                    {uniqueCategories()}
                  </div>
                  <p className="mt-2 text-xs font-medium text-[#94a3b8]">
                    Active item categories
                  </p>
                </div>
                <div className="size-11 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                  <FolderKanban className="size-5 text-sky-600" />
                </div>
              </div>
            </div>

            <div className="app-panel p-5 border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#475569]">Total Opening Value</p>
                  <div className="mt-2 text-2xl font-extrabold text-[#00a651]">
                    ₹{totalValue().toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                  <p className="mt-2 text-xs font-medium text-[#94a3b8]">
                    Asset stock valuation
                  </p>
                </div>
                <div className="size-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <IndianRupee className="size-5 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="app-panel p-5 border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#475569]">GST Applicable</p>
                  <div className="mt-2 text-2xl font-extrabold text-[#042f2e]">
                    {stocks.filter((s) => s.gstApplicable === "Applicable").length}
                  </div>
                  <p className="mt-2 text-xs font-medium text-[#94a3b8]">
                    Tax registered stock items
                  </p>
                </div>
                <div className="size-11 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search Filter Panel */}
          <div className="app-panel p-4 border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs no-print">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] size-4" />
              <input
                type="text"
                placeholder="Search by stock item name, alias, HSN code, or group..."
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
                Stock Items Register ({filteredStocks.length} items)
              </h3>
              <span className="text-xs text-[#042f2e] font-bold">
                Total Value: ₹{filteredStocks.reduce((sum, s) => sum + parseFloat(s.openingBalanceValue || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
                      Item Name & Alias
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Group / Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Units
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      HSN Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      GST Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Opening Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Rate (₹)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Value (₹)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider no-print">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2f2e9] bg-white">
                  {filteredStocks.length > 0 ? (
                    filteredStocks.map((stock, index) => (
                      <tr
                        key={stock.id}
                        className="hover:bg-[#f0fdf4]/50 transition-colors duration-150"
                      >
                        <td className="px-4 py-3.5 text-center text-xs font-medium text-slate-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-[#ecfdf5] border border-[#c6f1d6] flex items-center justify-center shrink-0 font-bold text-[#00a651] text-xs">
                              {stock.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-slate-900 block leading-snug">
                                {stock.name}
                              </span>
                              {stock.alias && (
                                <span className="text-xs font-normal text-slate-500 block mt-0.5">
                                  Alias: {stock.alias}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                            {stock.under}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-sm font-medium text-slate-800">
                          {stock.units}
                        </td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">
                          {stock.hsn || "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg ${
                              stock.gstApplicable === "Applicable"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {stock.gstApplicable}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right text-sm font-medium text-slate-800">
                          {fmt(stock.openingBalanceQty)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-sm font-medium text-slate-800">
                          ₹{fmt(stock.openingBalanceRate)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-sm font-bold text-[#00a651]">
                          ₹{fmt(stock.openingBalanceValue)}
                        </td>
                        <td className="px-4 py-3.5 text-center no-print">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEditClick(stock)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#00a651] hover:bg-[#f0fdf4] transition-all cursor-pointer"
                              title="Edit Stock Item"
                            >
                              <Edit3 className="size-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStock(stock.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                              title="Delete Stock Item"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="px-4 py-12 text-center">
                        <Package className="size-8 mx-auto mb-3 text-[#94a3b8]" />
                        <p className="text-sm font-bold text-[#042f2e]">
                          No stock items found
                        </p>
                        <p className="text-xs mt-1 font-medium text-[#475569]">
                          {searchTerm
                            ? "Try refining your search keyword."
                            : "Click 'Add Stock Item' to register your first product."}
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

export default StockList;
