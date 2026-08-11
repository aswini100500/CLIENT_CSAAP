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
  Hash,
  RefreshCw,
  Barcode,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const HSNList = () => {
  const [hsnData, setHsnData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { companyId } = useAuth();

  useEffect(() => {
    if (companyId) fetchHSNData();
  }, [companyId]);

  const fetchHSNData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/stock/getStockHSN/${companyId}`
      );
      if (response.data.message === "HSN data fetched successfully") {
        setHsnData(response.data.data);
      } else {
        throw new Error("Failed to fetch HSN data");
      }
    } catch (err) {
      setError(err.message);
      Swal.fire("Error", "Failed to load HSN data: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = (isPrint = false) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("HSN Codes Report", 14, 18);

    const tableData = filteredHSN.map((item, index) => [
      index + 1,
      item.hsn || "N/A",
    ]);

    autoTable(doc, {
      startY: 28,
      head: [["S.No", "HSN Code"]],
      body: tableData,
      styles: { fontSize: 10 },
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
      doc.save("HSN_Codes_Report.pdf");
    }
  };

  const handlePrint = () => {
    handleExportPDF(true);
  };

  const filteredHSN = hsnData.filter((item) => {
    return (item.hsn || "").toLowerCase().includes(searchTerm.toLowerCase());
  });

  const uniqueHSN = [
    ...new Set(hsnData.map((item) => item.hsn).filter(Boolean)),
  ];

  const handleExportExcel = () => {
    if (hsnData.length === 0) return;
    const exportData = filteredHSN.map((item, index) => ({
      "S.No": index + 1,
      "HSN Code": item.hsn || "N/A",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "HSNCodes");
    XLSX.writeFile(wb, "HSN_Codes_Report.xlsx");
  };

  if (loading) {
    return (
      <div className="erp-root app-shell min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#00a651] border-t-transparent mx-auto" />
          <p className="text-xs font-semibold text-[#475569]">Loading HSN data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="erp-root app-shell min-h-screen flex items-center justify-center p-4">
        <div className="app-panel p-6 max-w-md text-center border border-rose-200 rounded-2xl bg-white space-y-3">
          <Barcode className="mx-auto text-rose-500" size={40} />
          <p className="text-sm font-bold text-rose-700">Failed to load HSN data</p>
          <p className="text-xs text-[#475569]">{error}</p>
          <button
            onClick={fetchHSNData}
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
                <Barcode className="size-6 text-[#00a651]" />
              </div>
              <div>
                <h1 className="app-title text-xl font-extrabold text-[#042f2e]">
                  HSN Summary
                </h1>
                <p className="app-subtitle text-xs md:text-sm text-[#475569] font-medium mt-0.5">
                  Harmonized System Nomenclature code index for inventory items.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap no-print">
              <button
                onClick={fetchHSNData}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="app-panel p-5 border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#475569]">Stock Items with HSN</p>
                  <div className="mt-2 text-2xl font-extrabold text-[#042f2e]">
                    {hsnData.length}
                  </div>
                  <p className="mt-2 text-xs font-medium text-[#94a3b8]">
                    Configured stock items
                  </p>
                </div>
                <div className="size-11 rounded-2xl bg-[#ecfdf5] border border-[#c6f1d6] flex items-center justify-center shrink-0">
                  <Barcode className="size-5 text-[#00a651]" />
                </div>
              </div>
            </div>

            <div className="app-panel p-5 border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#475569]">Unique HSN Codes</p>
                  <div className="mt-2 text-2xl font-extrabold text-[#00a651]">
                    {uniqueHSN.length}
                  </div>
                  <p className="mt-2 text-xs font-medium text-[#94a3b8]">
                    Distinct tax tariff codes
                  </p>
                </div>
                <div className="size-11 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
                  <Hash className="size-5 text-purple-600" />
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
                placeholder="Search by HSN code..."
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
                HSN / SAC Code Master Register
              </h3>
              <span className="text-xs text-[#00a651] font-bold bg-[#f0fdf4] px-3 py-1 rounded-full border border-[#c6f1d6]">
                {filteredHSN.length} shown
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f8faf8] border-b border-[#e2f2e9]">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider w-16">
                      S.No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      HSN / SAC Code
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2f2e9] bg-white">
                  {filteredHSN.length > 0 ? (
                    filteredHSN.map((item, index) => (
                      <tr
                        key={item.id || index}
                        className="hover:bg-[#f0fdf4]/50 transition-colors duration-150"
                      >
                        <td className="px-4 py-3.5 text-center text-xs font-medium text-slate-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-[#ecfdf5] border border-[#c6f1d6] flex items-center justify-center shrink-0">
                              <Hash className="size-4 text-[#00a651]" />
                            </div>
                            {item.hsn ? (
                              <span className="text-sm font-bold text-slate-900">
                                {item.hsn}
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-slate-400 italic">
                                Not specified
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="px-4 py-12 text-center">
                        <Hash className="size-8 mx-auto mb-3 text-[#94a3b8]" />
                        <p className="text-sm font-bold text-[#042f2e]">
                          No HSN codes found
                        </p>
                        <p className="text-xs mt-1 font-medium text-[#475569]">
                          {searchTerm
                            ? "Try refining your search filter."
                            : "Configure HSN codes in stock items to list them here."}
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

export default HSNList;
