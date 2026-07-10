import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import { Eye, FileDown, FileSpreadsheet, Printer, Search, Edit, Trash2, Download, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BulkImportButton from "./BulkImportButton";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import useAuth from "../../../hooks/useAuth";

const ListOfJournalVoucher = () => {
  const { user, role } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [showEmployeeActivity, setShowEmployeeActivity] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [ledgersList, setLedgersList] = useState([]);
  const { companyId, employees } = useCompany();
  const navigate = useNavigate();
  const [modalData, setModalData] = useState(null);

  const getEmployeeName = (id) => {
    const emp = employees?.find(e => e.id == id);
    return emp ? (emp.name || emp.first_name || "Employee") : "Unknown Employee";
  };

  const fetchCompanyDetails = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/company/${companyId}`);
      setCompanyDetails(res.data);
    } catch (err) {
      console.error("Error fetching company details:", err);
    }
  };

  const fetchLedgers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`);
      const ledgers = Array.isArray(res.data) ? res.data : res.data.data || [];
      setLedgersList(ledgers);
    } catch (err) {
      console.error("Error fetching ledgers:", err);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchVouchers();
      fetchCompanyDetails();
      fetchLedgers();
    }
  }, [companyId]);

  const fetchVouchers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/journal-voucher/all/${companyId}`
      );
      setVouchers(res.data);
    } catch (error) {
      console.error(error);
    }
  };
  const handleViewDetails = async (id) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/journal-voucher/${id}`
      );
      setModalData(res.data);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to fetch voucher details.", "error");
    }
  };

  const handleEdit = (id) => {
    navigate(`/accounting/client/journalvoucher/${id}`);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/journal-voucher/delete/${id}`);
        Swal.fire("Deleted!", "Your voucher has been deleted.", "success");
        fetchVouchers();
      } catch (err) {
        console.error(err);
        Swal.fire("Error!", "Failed to delete voucher.", "error");
      }
    }
  };


  const handleBulkImport = async (data) => {
    try {
      const grouped = {};
      data.forEach((row) => {
        const vNo = row["Voucher No"] || row["voucherNo"] || `JRN-${Date.now()}`;
        if (!grouped[vNo]) {
          grouped[vNo] = {
            date: row["Date"] || row["date"] || new Date().toISOString().split('T')[0],
            narration: row["Voucher Narration"] || row["narration"] || "",
            transactions: []
          };
        }

        const ledgerName = row["Particulars"] || row["ledgerId"] || row["Ledger"];
        grouped[vNo].transactions.push({
          ledgerId: resolveLedgerId(ledgerName),
          particulars: ledgerName || "",
          debit: Number(row["Debit"] || row["debit"] || 0),
          credit: Number(row["Credit"] || row["credit"] || 0)
        });
      });

      const vouchersPayload = Object.values(grouped);
      if (vouchersPayload.length === 0) {
        Swal.fire("Error", "No valid vouchers found in sheet.", "error");
        return;
      }

      await axios.post(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/journal-voucher/bulk-create`, {
        companyId,
        vouchers: vouchersPayload
      });

      Swal.fire("Success", "Vouchers imported successfully!", "success");
      fetchVouchers();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to import vouchers. " + (err.response?.data?.message || err.message), "error");
    }
  };

  const generatePDF = (shouldPrint = false) => {
    const doc = new jsPDF();
    const companyNameForExport = companyDetails?.name || companyName || "Company";
    const today = new Date().toLocaleDateString("en-IN");
    const filtered = vouchers.filter((v) =>
      (v.narration || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(v.voucherNo || v.voucherno || v.id)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    const formatAmount = (amount) => {
      const num = Number(amount || 0);
      const formatted = Math.abs(num).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return num < 0 ? `-Rs. ${formatted}` : `Rs. ${formatted}`;
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

    const { company, summaryY, tableStartY } = addReportHeader(doc, {
      companyName: companyNameForExport,
      companyAddress,
      reportTitle: "Journal Voucher Report",
      generatedOn: today,
    });

    const totalDebit = filtered.reduce((acc, v) => acc + Number(v.totalDebit || 0), 0);
    const totalCredit = filtered.reduce((acc, v) => acc + Number(v.totalCredit || 0), 0);
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(`Total Vouchers: ${filtered.length}`, 14, summaryY);

    doc.setFont("helvetica", "bold");
    doc.text(`Total Debit: ${formatAmount(totalDebit)}   Total Credit: ${formatAmount(totalCredit)}`, 195, summaryY, { align: "right" });

    const tableData = filtered.map((v, i) => [
      i + 1,
      formatDate(v.date),
      v.voucherNo || v.voucherno || v.id,
      v.narration || "-",
      formatAmount(v.totalDebit),
      formatAmount(v.totalCredit)
    ]);

    autoTable(doc, {
      startY: tableStartY,
      head: [["#", "Date", "Voucher No.", "Narration", "Debit", "Credit"]],
      body: tableData,
      foot: [["", "", "", "TOTAL", formatAmount(totalDebit), formatAmount(totalCredit)]],
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 5, valign: "middle" },
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
        0: { halign: "center", cellWidth: 12 },
        4: { halign: "right", cellWidth: 32 },
        5: { halign: "right", cellWidth: 32 }
      }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(230);
      doc.line(14, 285, 195, 285);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`${company} • Journal Voucher Report`, 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" });
    }

    if (shouldPrint) {
      doc.autoPrint();
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = doc.output("bloburl");
      document.body.appendChild(iframe);
      iframe.contentWindow.print();
    } else {
      doc.save(`Journal_Voucher_Report_${today}.pdf`);
    }
  };

  const handleExportPDF = () => generatePDF(false);
  const handlePrint = () => generatePDF(true);

  const handleExportExcel = () => {
    const filtered = vouchers.filter((v) =>
      (v.narration || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(v.voucherNo || v.voucherno || v.id)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    if (filtered.length === 0) return;
    const today = new Date().toLocaleDateString("en-IN");
    const companyNameForExport = companyDetails?.name || companyName || "Company";
    const exportData = filtered.map(v => ({
      Date: new Date(v.date).toLocaleDateString(),
      "Voucher No": v.voucherNo || v.voucherno || v.id,
      Narration: v.narration || "-",
      Debit: v.totalDebit,
      Credit: v.totalCredit
    }));
    const ws = XLSX.utils.json_to_sheet(exportData, { origin: "A6" });
    addWorkbookHeader(XLSX, ws, {
      companyName: companyNameForExport,
      companyAddress,
      reportTitle: "Journal Voucher Report",
      generatedOn: today,
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Journal");
    XLSX.writeFile(wb, "Journal_Vouchers_Report.xlsx");
  };

  const loggedInRole = role?.toLowerCase() || "admin";
  const loggedInEmployeeId = user?.employee_id || null;


  const filtered = vouchers.filter((v) => {
    if (loggedInRole === "employee") {
      if (v.employee_id != loggedInEmployeeId || v.role?.toLowerCase() !== 'employee') return false;
    } else {
      const isCreatedByEmployee = v.employee_id && v.role?.toLowerCase() === 'employee';
      if (showEmployeeActivity) {
        if (!isCreatedByEmployee) return false;
      } else {
        if (isCreatedByEmployee) return false;
      }
    }

    return (v.narration || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-4 bg-white font-[monospace] min-h-screen">


      <div className="bg-[#005AB3] text-white px-5 py-3 shadow">
        <div className="flex items-center justify-between gap-4 flex-wrap">

          <h1 className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">
            List of Journal Vouchers
          </h1>


          <div className="flex items-center gap-2.5 flex-wrap">


            <div className="relative">
              <Search
                size={15}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search Voucher No / Narration..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 pl-8 pr-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-56"
              />
            </div>


            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const basePath = loggedInRole === "employee" ? "/employee/hr/accounting/client" : "/accounting/client";
                  navigate(`${basePath}/journalvoucher`);
                }}
                className="flex items-center gap-1.5 bg-[#1a56db] hover:bg-blue-600 text-white px-3 h-8 rounded-md text-xs font-medium transition-all whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-700 text-white px-3 h-8 rounded-md text-xs font-medium transition-all whitespace-nowrap"
              >
                <Printer size={14} /> Print
              </button>


              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={filtered.length === 0}
                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 h-8 rounded-md text-xs font-medium transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileDown size={14} /> Export
                  <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-1 w-28 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        handleExportExcel();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                    >
                      <FileSpreadsheet size={14} className="text-green-600" /> Excel
                    </button>
                    <button
                      onClick={() => {
                        handleExportPDF();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                    >
                      <FileDown size={14} className="text-red-600" /> PDF
                    </button>
                  </div>
                )}
              </div>

              {loggedInRole !== "employee" && (
                <button
                  onClick={() => setShowEmployeeActivity(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-all whitespace-nowrap border ${
                    showEmployeeActivity 
                      ? "bg-slate-900 text-white border-slate-900" 
                      : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  }`}
                >
                  <UserRound size={14} />
                  {showEmployeeActivity ? "Back to Vouchers" : "Employee Activity"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto border border-black rounded-md">


        <div className="grid grid-cols-12 bg-gray-200 border-b border-black text-sm font-semibold">
          <div className="col-span-1 p-2 border-r border-black">Voucher ID</div>
          <div className="col-span-2 p-2 border-r border-black">Date</div>
          <div className="col-span-3 p-2 border-r border-black">Narration</div>
          <div className="col-span-1 p-2 border-r border-black text-right">Debit</div>
          <div className="col-span-1 p-2 border-r border-black text-right">Credit</div>
          {showEmployeeActivity && <div className="col-span-2 p-2 border-r border-black">Employee Name</div>}
          <div className={`${showEmployeeActivity ? 'col-span-2' : 'col-span-4'} p-2 text-center`}>Actions</div>
        </div>


        {filtered.length === 0 ? (
          <div className="text-center p-4 text-gray-500">No vouchers found</div>
        ) : (
          filtered.map((v) => (
            <div
              key={v.id}
              className="grid grid-cols-12 text-sm border-b border-gray-300 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleViewDetails(v.id)}
            >
              <div className="col-span-1 p-2 border-r border-gray-300">{v.voucherNo || v.voucherno || v.id}</div>

              <div className="col-span-2 p-2 border-r border-gray-300">
                {new Date(v.date).toLocaleDateString()}
              </div>

              <div className="col-span-3 p-2 border-r border-gray-300 truncate">
                {v.narration || "-"}
              </div>

              <div className="col-span-1 p-2 text-right border-r border-gray-300">
                {Number(v.totalDebit).toFixed(2)}
              </div>

              <div className="col-span-1 p-2 text-right border-r border-gray-300">
                {Number(v.totalCredit).toFixed(2)}
              </div>

              {showEmployeeActivity && (
                <div className="col-span-2 p-2 border-r border-gray-300 truncate">
                  {getEmployeeName(v.employee_id)}
                </div>
              )}

              <div className={`${showEmployeeActivity ? 'col-span-2' : 'col-span-4'} px-2 py-2 text-center flex items-center justify-center gap-3`}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleViewDetails(v.id); }}
                  className="text-blue-600 hover:text-blue-800 transition"
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(v.id); }}
                  className="text-yellow-600 hover:text-yellow-800 transition"
                  title="Edit Voucher"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(v.id); }}
                  className="text-red-600 hover:text-red-800 transition"
                  title="Delete Voucher"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = `${import.meta.env.VITE_ACCOUNTING_URL}/${v.pdf_path}`;
                    window.open(url, "_blank");
                  }}
                  className="text-green-600 hover:text-green-800 transition"
                  title="Download PDF"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {modalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setModalData(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="bg-[#005AB3] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                  <FileDown size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-[15px]">Journal voucher</p>
                  <p className="text-white/70 text-xs">
                    {modalData.voucher?.voucherNo || modalData.voucher?.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                  Balanced
                </span>
                <button
                  onClick={() => setModalData(null)}
                  className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white hover:bg-white/25"
                >
                  ✕
                </button>
              </div>
            </div>


            <div className="grid grid-cols-3 divide-x divide-gray-200 border-b border-gray-200 bg-gray-50">
              {[
                ["Date", new Date(modalData.voucher?.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })],
                ["Voucher no.", modalData.voucher?.voucherNo || modalData.voucher?.id],
                ["Entries", `${modalData.transactions?.length} lines`],
              ].map(([label, value]) => (
                <div key={label} className="px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{value}</p>
                </div>
              ))}
            </div>


            {modalData.voucher?.narration && (
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-sm text-gray-500 flex items-center gap-2">
                <span>📝</span> {modalData.voucher.narration}
              </div>
            )}


            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-medium w-8">#</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-medium">Particulars</th>
                    <th className="px-4 py-2.5 text-right text-xs text-gray-400 font-medium w-28">Debit (₹)</th>
                    <th className="px-4 py-2.5 text-right text-xs text-gray-400 font-medium w-28">Credit (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {modalData.transactions?.map((t, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-gray-800">{t.particulars || "N/A"}</p>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${t.debit > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                          }`}>
                          {t.debit > 0 ? "Dr" : "Cr"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-red-600">
                        {t.debit > 0 ? Number(t.debit).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-green-600">
                        {t.credit > 0 ? Number(t.credit).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t border-gray-200">
                    <td colSpan={2} className="px-4 py-2.5 text-xs text-gray-400 font-medium">Total</td>
                    <td className="px-4 py-2.5 text-right font-mono font-medium text-red-600">
                      {Number(modalData.voucher?.totalDebit || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-medium text-green-600">
                      {Number(modalData.voucher?.totalCredit || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>


            <div className="grid grid-cols-3 divide-x divide-gray-200 border-t border-gray-200">
              {[
                ["Total debit", modalData.voucher?.totalDebit, "text-red-600"],
                ["Total credit", modalData.voucher?.totalCredit, "text-green-600"],
                ["Difference", Math.abs((modalData.voucher?.totalDebit || 0) - (modalData.voucher?.totalCredit || 0)), "text-gray-800"],
              ].map(([label, val, cls]) => (
                <div key={label} className="px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">{label}</p>
                  <p className={`text-lg font-medium font-mono ${cls}`}>
                    ₹{Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>


            <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Created {new Date(modalData.voucher?.createdAt || modalData.voucher?.date).toLocaleString("en-IN")}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setModalData(null)}
                  className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 text-sm bg-[#005AB3] text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5"
                >
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOfJournalVoucher;
