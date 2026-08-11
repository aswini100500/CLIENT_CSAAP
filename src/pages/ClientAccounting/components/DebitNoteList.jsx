import React from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Download,
  Edit,
  Eye,
  FileDown,
  FileSpreadsheet,
  FileText,
  Printer,
  Search,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import useAuth from "../../../hooks/useAuth";

import DebitNoteDetailModal from "./DebitNoteDetailModal";
import {
  addReportHeader,
  addWorkbookHeader,
  getCompanyAddress,
} from "../utils/exportReportUtils";

const API = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/notes/getDebitnotes`;

const DebitNoteList = () => {
  const { user, role, companyId, companyName } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [debitNotes, setDebitNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");

  const navigate = useNavigate();

  const fetchDebitNotes = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API}/${companyId}`);
      setDebitNotes(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch debit notes", err);
      setDebitNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyDetails = async () => {
    if (!companyId) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/company/${companyId}`,
      );
      setCompanyDetails(res.data);
    } catch (err) {
      console.error("Error fetching company details:", err);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchDebitNotes();
      fetchCompanyDetails();
    }
  }, [companyId]);

  const loggedInRole = role?.toLowerCase() || "admin";
  const loggedInEmployeeId = user?.employee_id || null;

  const filteredDebitNotes = debitNotes.filter((note) => {
    if (loggedInRole === "employee") {
      if (
        note.employee_id != loggedInEmployeeId ||
        note.role?.toLowerCase() !== "employee"
      ) {
        return false;
      }
    }

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const party = (
      note.PartyLedger ||
      note.partyLedgerName ||
      ""
    ).toLowerCase();
    const voucherNo = (note.voucherNo || note.id || "")
      .toString()
      .toLowerCase();
    const amount = (note.grand_total || note.totalAmount || "")
      .toString()
      .toLowerCase();
    const narration = (note.narration || "").toLowerCase();

    return (
      party.includes(query) ||
      voucherNo.includes(query) ||
      amount.includes(query) ||
      narration.includes(query)
    );
  });

  const sortedDebitNotes = [...filteredDebitNotes].sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt || 0).getTime();
    const dateB = new Date(b.date || b.createdAt || 0).getTime();
    if (dateA !== dateB) {
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    }
    return sortOrder === "desc"
      ? Number(b.id || 0) - Number(a.id || 0)
      : Number(a.id || 0) - Number(b.id || 0);
  });

  const totalAmount = sortedDebitNotes.reduce(
    (acc, note) => acc + Number(note.grand_total || note.totalAmount || 0),
    0,
  );

  const formatAmount = (amount) => {
    const num = Number(amount || 0);
    return `₹ ${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handlePrint = () => {
    if (filteredDebitNotes.length === 0) {
      Swal.fire("Info", "No data to print", "info");
      return;
    }

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("en-IN");
    const companyNameForExport =
      companyDetails?.name || companyName || "Company";
    const companyAddress = getCompanyAddress(companyDetails);

    const { company, summaryY, tableStartY } = addReportHeader(doc, {
      companyName: companyNameForExport,
      companyAddress,
      reportTitle: "Debit Note Report",
      generatedOn: today,
    });

    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(`Total Notes: ${filteredDebitNotes.length}`, 14, summaryY);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: ${formatAmount(totalAmount)}`, 195, summaryY, {
      align: "right",
    });

    autoTable(doc, {
      startY: tableStartY,
      head: [["#", "Date", "Voucher No.", "Party Ledger", "Amount", "Status"]],
      body: filteredDebitNotes.map((n, index) => [
        index + 1,
        formatDate(n.date),
        n.voucherNo || n.id || "-",
        n.PartyLedger || n.partyLedgerName || "-",
        formatAmount(n.grand_total || n.totalAmount),
        n.status || "Pending",
      ]),
      foot: [["", "", "", "TOTAL", formatAmount(totalAmount), ""]],
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 4, valign: "middle" },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [15, 23, 42],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        4: { halign: "right", cellWidth: 35 },
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(230);
      doc.line(14, 285, 195, 285);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`${company} • Debit Note Report`, 14, 290);
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

  const handleExportPDF = () => {
    if (filteredDebitNotes.length === 0) {
      Swal.fire("Info", "No data to export", "info");
      return;
    }

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("en-IN");
    const companyNameForExport =
      companyDetails?.name || companyName || "Company";
    const companyAddress = getCompanyAddress(companyDetails);

    const { company, summaryY, tableStartY } = addReportHeader(doc, {
      companyName: companyNameForExport,
      companyAddress,
      reportTitle: "Debit Note Report",
      generatedOn: today,
    });

    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(`Total Notes: ${filteredDebitNotes.length}`, 14, summaryY);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: ${formatAmount(totalAmount)}`, 195, summaryY, {
      align: "right",
    });

    autoTable(doc, {
      startY: tableStartY,
      head: [["#", "Date", "Voucher No.", "Party Ledger", "Amount", "Status"]],
      body: sortedDebitNotes.map((n, index) => [
        index + 1,
        formatDate(n.date),
        n.voucherNo || n.id || "-",
        n.PartyLedger || n.partyLedgerName || "-",
        formatAmount(n.grand_total || n.totalAmount),
        n.status || "Pending",
      ]),
      foot: [["", "", "", "TOTAL", formatAmount(totalAmount), ""]],
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 4, valign: "middle" },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [15, 23, 42],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        4: { halign: "right", cellWidth: 35 },
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(230);
      doc.line(14, 285, 195, 285);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`${company} • Debit Note Report`, 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" });
    }

    doc.save(`Debit_Notes_Report_${today}.pdf`);
  };

  const handleExportExcel = () => {
    if (sortedDebitNotes.length === 0) {
      Swal.fire("Info", "No data to export", "info");
      return;
    }
    const today = new Date().toLocaleDateString("en-IN");
    const companyNameForExport =
      companyDetails?.name || companyName || "Company";
    const companyAddress = getCompanyAddress(companyDetails);
    const exportData = sortedDebitNotes.map((n, i) => ({
      "S.No": i + 1,
      "Voucher No": n.voucherNo || n.id,
      Date: formatDate(n.date),
      Party: n.PartyLedger || n.partyLedgerName || "-",
      Amount: Number(n.grand_total || n.totalAmount || 0),
      Status: n.status || "Pending",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData, { origin: "A6" });
    addWorkbookHeader(XLSX, ws, {
      companyName: companyNameForExport,
      companyAddress,
      reportTitle: "Debit Note Report",
      generatedOn: today,
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Debit Notes");
    XLSX.writeFile(wb, "Debit_Notes_Report.xlsx");
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/notes/single/${id}`,
      );
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to fetch details");
      }
      setSelectedNote(res.data.note);
      setSelectedItems(res.data.items || []);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to fetch note details.", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Debit Note?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/notes/delete/${id}`,
        );
        Swal.fire({
          icon: "success",
          title: "Deleted Successfully",
          text: "Debit Note has been removed.",
          timer: 1800,
          showConfirmButton: false,
        });
        fetchDebitNotes();
      } catch (error) {
        console.error("Delete Error:", error);
        Swal.fire("Error", "Could not delete debit note", "error");
      }
    }
  };

  const handleDownloadPDF = async (note) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/notes/generate-pdf/${note.id}`,
      );
      if (res.data.success) {
        window.open(
          `${import.meta.env.VITE_ACCOUNTING_URL}${res.data.pdfPath}`,
          "_blank",
        );
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      Swal.fire("Error", "Could not generate PDF", "error");
    }
  };

  const handleEdit = (id) => {
    const editPath =
      loggedInRole === "employee"
        ? `/employee/hr/accounting/client/debitNote/${id}`
        : `/accounting/client/debitNote/${id}`;
    navigate(editPath);
  };

  const createPath =
    loggedInRole === "employee"
      ? "/employee/hr/accounting/client/debitNote"
      : "/accounting/client/debitNote";

  return (
    <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans">
      <div className="max-w-7xl mx-auto app-panel overflow-hidden border border-[#e2f2e9] bg-white">
        <div className="flex flex-wrap justify-between items-center app-section-bar py-5 px-6 border-b border-[#e2f2e9] gap-4 bg-white">
          <h2 className="app-title text-xl font-extrabold text-[#042f2e]">
            List of Debit Notes
          </h2>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Party / Voucher No / Amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-3 py-2 text-[13px] bg-white border border-[#e2f2e9] rounded-xl focus:outline-none focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] transition-all placeholder:text-slate-400"
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
              disabled={filteredDebitNotes.length === 0}
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 h-10 rounded-xl border border-emerald-200 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
            >
              <FileSpreadsheet size={16} />
              Export Excel
            </button>

            <button
              onClick={handleExportPDF}
              disabled={filteredDebitNotes.length === 0}
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 h-10 rounded-xl border border-blue-200 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
            >
              <FileDown size={16} />
              Export PDF
            </button>

            <Link
              to={createPath}
              className="flex items-center justify-center gap-2 bg-linear-to-r from-[#00a651] to-[#00c853] hover:from-[#008c44] hover:to-[#00a651] text-white px-5 h-10 rounded-xl text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              + Create Debit Note
            </Link>
          </div>
        </div>

        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-6 py-4 border-b border-[#e2f2e9] bg-[#f0fdf4]/30">
            <div className="bg-white rounded-xl p-3.5 border border-[#e2f2e9]">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Total Notes
              </p>
              <p className="text-xl font-extrabold text-[#042f2e] mt-0.5">
                {filteredDebitNotes.length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-3.5 border border-[#e2f2e9]">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Total Amount
              </p>
              <p className="text-xl font-extrabold text-[#00a651] mt-0.5">
                {formatAmount(totalAmount)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-3.5 border border-[#e2f2e9]">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Approved Notes
              </p>
              <p className="text-xl font-extrabold text-blue-600 mt-0.5">
                {
                  filteredDebitNotes.filter(
                    (n) => n.status === "Approved" || n.status === "Accepted",
                  ).length
                }
              </p>
            </div>
          </div>
        )}

        {loading && (
          <p className="text-center text-slate-500 py-10">
            Loading debit notes...
          </p>
        )}

        {!loading && filteredDebitNotes.length > 0 && (
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
                    Party Ledger
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                    Amount (₹)
                  </th>
                  <th className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-center w-36">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2f2e9]">
                {sortedDebitNotes.map((note, index) => (
                  <tr
                    key={note.id}
                    className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-150"
                  >
                    <td className="py-3 px-4 border-r border-[#e2f2e9] text-xs text-slate-400 font-mono text-center">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="py-3 px-4 border-r border-[#e2f2e9] text-xs font-semibold text-slate-700">
                      {formatDate(note.date)}
                    </td>
                    <td className="py-3 px-4 border-r border-[#e2f2e9]">
                      <div className="font-bold text-[#042f2e] text-[13px]">
                        {note.voucherNo || note.id}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-r border-[#e2f2e9]">
                      <div className="font-bold text-[#042f2e] text-[13px]">
                        {note.PartyLedger || note.partyLedgerName || "—"}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-r border-[#e2f2e9] text-right font-bold text-[#042f2e] text-[13px] tabular-nums">
                      {Number(
                        note.grand_total || note.totalAmount || 0,
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(note.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(note)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all cursor-pointer"
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(note.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all cursor-pointer"
                          title="Edit Note"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                          title="Delete Note"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredDebitNotes.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FileText size={24} />
            </div>
            <h3 className="text-base font-bold text-[#042f2e]">
              No Debit Notes Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchQuery
                ? `No debit notes match "${searchQuery}".`
                : "No debit notes have been created yet."}
            </p>
            <Link
              to={createPath}
              className="inline-flex items-center gap-2 bg-[#00a651] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#008c44] transition-all cursor-pointer shadow-xs"
            >
              + Create First Debit Note
            </Link>
          </div>
        )}
      </div>

      <DebitNoteDetailModal
        note={selectedNote}
        items={selectedItems}
        onClose={() => {
          setSelectedNote(null);
          setSelectedItems([]);
        }}
        onEdit={handleEdit}
        onDownload={handleDownloadPDF}
      />
    </div>
  );
};

export default DebitNoteList;
