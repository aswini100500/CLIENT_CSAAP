import React from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Eye,
  FileDown,
  FileSpreadsheet,
  FileText,
  Pencil,
  Printer,
  Search,
  SearchX,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import useAuth from "../../../hooks/useAuth";
import ManufacturingDetailModal from "./ManufacturingDetailModal";

const ManufacturingList = () => {
  const { user, companyId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const loggedInRole = user?.role?.toLowerCase() || "admin";
  const loggedInEmployeeId = user?.employee_id || null;

  useEffect(() => {
    if (!companyId) return;
    fetchJournals();
  }, [companyId]);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_ACCOUNTING_URL;
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/manufacturing/list/${companyId}`,
      );
      if (res.data.success) {
        setJournals(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching manufacturing list:", error);
      Swal.fire("Error", "Failed to load manufacturing journals", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (journals.length === 0) {
      Swal.fire("Info", "No manufacturing journals to print", "info");
      return;
    }

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("en-IN");

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Manufacturing Report", 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${today}`, 195, 18, { align: "right" });

    doc.setDrawColor(220);
    doc.line(14, 24, 195, 24);

    const totalValue = sortedJournals.reduce(
      (sum, j) => sum + Number(j.grandTotal || 0),
      0,
    );

    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(`Total Journals: ${sortedJournals.length}`, 14, 34);

    doc.setFont("helvetica", "bold");
    doc.text(
      `Total Value: Rs. ${totalValue.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      195,
      34,
      { align: "right" },
    );

    const tableData = sortedJournals.map((j, i) => [
      i + 1,
      new Date(j.date).toLocaleDateString("en-IN"),
      j.voucherNo || j.id || "-",
      j.productName || "-",
      j.finishedQty ?? "-",
      `Rs. ${Number(j.effectiveRatePerFinished || 0).toFixed(2)}`,
      `Rs. ${Number(j.grandTotal || 0).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 42,
      head: [
        [
          "#",
          "Date",
          "Voucher No",
          "Product Name",
          "Finished Qty",
          "Effective Rate",
          "Total Cost",
        ],
      ],
      body: tableData,
      foot: [
        [
          "",
          "",
          "",
          "",
          "",
          "TOTAL",
          `Rs. ${totalValue.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        ],
      ],
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 4, valign: "middle" },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        fontSize: 9.5,
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [15, 23, 42],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 50 },
        4: { halign: "center", cellWidth: 25 },
        5: { halign: "right", cellWidth: 28 },
        6: { halign: "right", cellWidth: 30 },
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(230);
      doc.line(14, 285, 195, 285);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text("Manufacturing Report", 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" });
    }

    const blobURL = doc.output("bloburl");
    const printWindow = window.open(blobURL);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  };

  const handleExportExcel = () => {
    if (sortedJournals.length === 0) return;
    const today = new Date().toLocaleDateString("en-IN");
    const exportData = sortedJournals.map((j, i) => ({
      "S.No": i + 1,
      Date: j.date ? new Date(j.date).toLocaleDateString("en-IN") : "-",
      "Voucher No": j.voucherNo || j.id,
      "Product Name": j.productName || "-",
      "Batch Name": j.batchName || "-",
      "Finished Qty": j.finishedQty ?? 0,
      "Effective Rate": Number(j.effectiveRatePerFinished || 0),
      "Total Cost": Number(j.grandTotal || 0),
      Narration: j.narration || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Manufacturing");
    XLSX.writeFile(wb, `Manufacturing_Report_${today}.xlsx`);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Manufacturing Journal?",
      text: "This action cannot be undone and will reverse stock adjustments.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (result.isConfirmed) {
      try {
        const API_BASE_URL =
          import.meta.env.VITE_ACCOUNTING_URL || "http://localhost:5000";
        await axios.delete(`${API_BASE_URL}/api/v1/manufacturing/delete/${id}`);
        Swal.fire({
          icon: "success",
          title: "Deleted Successfully",
          text: "Manufacturing journal has been deleted.",
          timer: 1800,
          showConfirmButton: false,
        });
        fetchJournals();
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire("Error", "Failed to delete manufacturing journal.", "error");
      }
    }
  };

  const handleDownloadPDF = (id) => {
    const API_BASE_URL =
      import.meta.env.VITE_ACCOUNTING_URL || "http://localhost:5000";
    window.open(
      `${API_BASE_URL}/api/v1/manufacturing/download-pdf/${id}`,
      "_blank",
    );
  };

  const handleEdit = (id) => {
    const editPath =
      loggedInRole === "employee"
        ? `/employee/hr/accounting/client/manfacturing/${id}`
        : `/accounting/client/manfacturing/${id}`;
    navigate(editPath);
  };

  const handleViewDetails = (journal) => {
    setSelectedJournal(journal);
  };

  const filteredJournals = journals.filter((j) => {
    if (loggedInRole === "employee") {
      if (j.employee_id != loggedInEmployeeId) return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const voucherNo = (j.voucherNo || "").toString().toLowerCase();
      const productName = (j.productName || "").toString().toLowerCase();
      const batchName = (j.batchName || "").toString().toLowerCase();
      if (
        !voucherNo.includes(query) &&
        !productName.includes(query) &&
        !batchName.includes(query)
      ) {
        return false;
      }
    }

    return true;
  });

  const sortedJournals = [...filteredJournals].sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt || 0).getTime();
    const dateB = new Date(b.date || b.createdAt || 0).getTime();
    if (dateA !== dateB) {
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    }
    return sortOrder === "desc"
      ? Number(b.id || 0) - Number(a.id || 0)
      : Number(a.id || 0) - Number(b.id || 0);
  });

  const totalAmount = sortedJournals.reduce(
    (acc, j) => acc + Number(j.grandTotal || 0),
    0,
  );

  const createPath =
    loggedInRole === "employee"
      ? "/employee/hr/accounting/client/manfacturing"
      : "/accounting/client/manfacturing";

  return (
    <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans">
      <div className="max-w-7xl mx-auto app-panel overflow-hidden border border-[#e2f2e9] bg-white">
        <div className="flex flex-wrap justify-between items-center app-section-bar py-5 px-6 border-b border-[#e2f2e9] gap-4 bg-white">
          <h2 className="app-title text-xl font-extrabold text-[#042f2e]">
            List of Manufacturing Journals
          </h2>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Product / Voucher No..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-60 pl-9 pr-3 py-2 text-[13px] bg-white border border-[#e2f2e9] rounded-xl focus:outline-none focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] transition-all placeholder:text-slate-400"
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 h-10 rounded-xl border border-slate-200 transition-colors text-sm font-semibold cursor-pointer active:scale-[0.98]"
            >
              <Printer size={16} />
              Print
            </button>

            <button
              onClick={handleExportExcel}
              disabled={filteredJournals.length === 0}
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 h-10 rounded-xl border border-emerald-200 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
            >
              <FileSpreadsheet size={16} />
              Export Excel
            </button>

            <button
              onClick={handlePrint}
              disabled={filteredJournals.length === 0}
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 h-10 rounded-xl border border-blue-200 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
            >
              <FileDown size={16} />
              Export PDF
            </button>

            <Link
              to={createPath}
              className="flex items-center justify-center gap-2 bg-linear-to-r from-[#00a651] to-[#00c853] hover:from-[#008c44] hover:to-[#00a651] text-white px-5 h-10 rounded-xl text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              + Create Manufacturing Journal
            </Link>
          </div>
        </div>

        {loading && (
          <p className="text-center text-slate-500 py-10">
            Loading manufacturing journals...
          </p>
        )}

        {!loading && filteredJournals.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse bg-white">
              <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9]">
                <tr className="text-left text-slate-700">
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-center w-12">
                    #
                  </th>
                  <th
                    onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                    className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] cursor-pointer select-none hover:bg-emerald-100/50 transition-colors"
                    title="Click to toggle sort order"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date</span>
                      {sortOrder === "desc" ? (
                        <ArrowDown size={14} className="text-[#00a651]" />
                      ) : (
                        <ArrowUp size={14} className="text-[#00a651]" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                    Voucher No.
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                    Product Name
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-center">
                    Finished Qty
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                    Effective Rate (₹)
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                    Total Cost (₹)
                  </th>
                  <th className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-center w-32">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e2f2e9]">
                {sortedJournals.map((j, idx) => (
                  <tr
                    key={j.id}
                    className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-200"
                  >
                    <td className="py-3 px-4 border-r border-[#e2f2e9] text-center text-[#475569] text-[13px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 border-r border-[#e2f2e9] text-slate-600 text-[13px] whitespace-nowrap">
                      {j.date
                        ? new Date(j.date).toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                    <td className="py-3 px-4 border-r border-[#e2f2e9] font-bold text-[#042f2e] text-[13px] whitespace-nowrap">
                      {j.voucherNo || j.id}
                    </td>
                    <td className="py-3 px-4 border-r border-[#e2f2e9] font-semibold text-slate-800 text-[13px]">
                      {j.productName || "-"}
                    </td>
                    <td className="py-3 px-4 border-r border-[#e2f2e9] text-center font-medium text-slate-700 text-[13px]">
                      {j.finishedQty ?? "-"}
                    </td>
                    <td className="py-3 px-4 border-r border-[#e2f2e9] text-right text-slate-700 text-[13px] whitespace-nowrap font-medium">
                      {Number(j.effectiveRatePerFinished || 0).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </td>
                    <td className="py-3 px-4 border-r border-[#e2f2e9] text-right font-bold text-[#042f2e] text-[13px] whitespace-nowrap">
                      {Number(j.grandTotal || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleViewDetails(j)}
                          title="View Journal Details"
                          className="text-slate-400 hover:text-[#00a651] p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(j.id)}
                          title="Edit Manufacturing Journal"
                          className="text-slate-400 hover:text-amber-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(j.id)}
                          title="Delete Manufacturing Journal"
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(j.id)}
                          title="Download PDF"
                          className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <FileDown size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredJournals.length === 0 && (
          <div className="px-4 py-12 text-center">
            <SearchX className="size-10 mx-auto mb-3 text-slate-400" />
            <p className="text-[14px] font-bold text-[#042f2e]">
              No manufacturing journals found
            </p>
            <p className="text-[13px] mt-1 text-slate-500">
              Try adjusting your search criteria or create a new manufacturing
              journal.
            </p>
          </div>
        )}

        {!loading && filteredJournals.length > 0 && (
          <div className="flex flex-wrap justify-between items-center py-4 px-6 bg-[#f0fdf4]/30 border-t border-[#e2f2e9] text-sm gap-4">
            <div className="flex items-center gap-2 text-[#042f2e] font-extrabold">
              <FileText size={18} className="text-[#00a651]" />
              <span>TOTAL JOURNALS: {filteredJournals.length}</span>
            </div>
            <div className="text-base font-extrabold text-[#042f2e] tracking-wide">
              TOTAL AMOUNT: ₹{" "}
              {totalAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        )}
      </div>

      {selectedJournal && (
        <ManufacturingDetailModal
          journal={selectedJournal}
          onClose={() => setSelectedJournal(null)}
          onEdit={(id) => {
            setSelectedJournal(null);
            handleEdit(id);
          }}
          onDownload={handleDownloadPDF}
        />
      )}
    </div>
  );
};

export default ManufacturingList;
