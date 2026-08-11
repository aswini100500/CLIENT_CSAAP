import React from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Eye,
  FileDown,
  FileSpreadsheet,
  Pencil,
  Printer,
  Search,
  SearchX,
  Trash2,
  FileText,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import useAuth from "../../../hooks/useAuth";
import ReceiveVoucherDetailModal from "./Receivevoucherdetailmodal";

const ReceiveVouchersList = () => {
  const { user, role, companyId, companyName } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [ledgerMap, setLedgerMap] = useState({});
  const [sortOrder, setSortOrder] = useState("desc");

  const navigate = useNavigate();

  const loggedInRole =
    role?.toLowerCase() || user?.role?.toLowerCase() || "admin";
  const loggedInEmployeeId = user?.employee_id || null;

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/receive-voucher/getReceiptVoucher/${companyId}`,
      );

      const sortedVouchers = (res.data?.data || []).slice().sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();

        if (dateA !== dateB) {
          return dateB - dateA;
        }

        const voucherA = Number(a.voucherId || a.id) || 0;
        const voucherB = Number(b.voucherId || b.id) || 0;

        return voucherB - voucherA;
      });

      setVouchers(sortedVouchers);
    } catch (err) {
      console.error("Failed to fetch receipt vouchers", err);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyDetails = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/company/${companyId}`,
      );
      setCompanyDetails(res.data);
    } catch (err) {
      console.error("Error fetching company details:", err);
    }
  };

  const fetchLedgers = async () => {
    try {
      const [ledgersRes, banksRes] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`,
        ),
        axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/all`,
        ),
      ]);

      const map = {};
      const ledgers = Array.isArray(ledgersRes.data)
        ? ledgersRes.data
        : ledgersRes.data?.data || [];
      ledgers.forEach((l) => {
        map[l.id] = l.name;
        map[`ledger_${l.id}`] = l.name;
      });

      const banks = banksRes.data?.accounts || [];
      banks.forEach((b) => {
        map[b.id] = b.bankName
          ? `${b.accountName} (${b.bankName})`
          : b.accountName;
        map[`bank_${b.id}`] = b.bankName
          ? `${b.accountName} (${b.bankName})`
          : b.accountName;
      });

      map["cash"] = "Cash";
      setLedgerMap(map);
    } catch (err) {
      console.error("Error fetching ledgers:", err);
    }
  };

  useEffect(() => {
    if (!companyId) {
      Swal.fire({
        icon: "info",
        title: "No Company Selected",
        text: "Please select a company first.",
        confirmButtonText: "Go to Dashboard",
      }).then(() => {
        window.location.href = "/dashboard";
      });
    } else {
      fetchVouchers();
      fetchLedgers();
      fetchCompanyDetails();
    }
  }, [companyId]);

  const getReceiptInto = (receiptAccountId) => {
    if (
      receiptAccountId === null ||
      receiptAccountId === undefined ||
      receiptAccountId === ""
    ) {
      return "—";
    }

    const value = String(receiptAccountId).trim();
    const directLabel = ledgerMap[value];

    if (typeof directLabel === "string" && directLabel.trim()) {
      return directLabel;
    }

    const normalized = value.toLowerCase();

    if (normalized === "cash") {
      return "Cash";
    }

    if (normalized.startsWith("bank_")) {
      return ledgerMap[value] || "Bank";
    }

    return ledgerMap[value] || "Bank";
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (loggedInRole === "employee") {
      if (
        v.employee_id != loggedInEmployeeId ||
        v.role?.toLowerCase() !== "employee"
      ) {
        return false;
      }
    }

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const narrationStr = (v.narration || "").toString().toLowerCase();
    const voucherNoStr = (v.voucherId || v.voucherNo || v.id || "")
      .toString()
      .toLowerCase();
    const customerStr = (ledgerMap[v.customer] || v.customer || "")
      .toString()
      .toLowerCase();
    const receiptIntoStr = getReceiptInto(v.receiptAccountId).toLowerCase();
    const amountStr = (v.totalDebit || v.amount || v.totalAmount || "")
      .toString()
      .toLowerCase();

    return (
      narrationStr.includes(query) ||
      voucherNoStr.includes(query) ||
      customerStr.includes(query) ||
      receiptIntoStr.includes(query) ||
      amountStr.includes(query)
    );
  });

  const sortedVouchers = [...filteredVouchers].sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt || 0).getTime();
    const dateB = new Date(b.date || b.createdAt || 0).getTime();
    if (dateA !== dateB) {
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    }
    const voucherA = Number(a.voucherId || a.id) || 0;
    const voucherB = Number(b.voucherId || b.id) || 0;
    return sortOrder === "desc" ? voucherB - voucherA : voucherA - voucherB;
  });

  const totalAmount = sortedVouchers.reduce((acc, v) => {
    const amt = parseFloat(v.totalDebit || v.amount || v.totalAmount || 0);
    return acc + amt;
  }, 0);

  const generatePDF = (shouldPrint = false) => {
    if (filteredVouchers.length === 0) return;

    const doc = new jsPDF();
    const company = (
      companyDetails?.name ||
      companyName ||
      "Company"
    ).toUpperCase();
    const today = new Date().toLocaleDateString("en-IN");

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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text(company, 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Receipt Voucher Report", 14, 26);

    let headerBottomY = 32;

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Generated on: ${today}`, 195, 18, { align: "right" });

    doc.setDrawColor(220);
    doc.line(14, headerBottomY, 195, headerBottomY);

    const summaryY = headerBottomY + 8;
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(`Total Vouchers: ${sortedVouchers.length}`, 14, summaryY);

    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: ${formatAmount(totalAmount)}`, 195, summaryY, {
      align: "right",
    });

    const tableData = sortedVouchers.map((v, i) => [
      i + 1,
      formatDate(v.date),
      v.voucherId || v.voucherNo || v.id || "-",
      ledgerMap[v.customer] || v.customer || "-",
      getReceiptInto(v.receiptAccountId),
      formatAmount(v.totalDebit || v.amount || v.totalAmount || 0),
      v.narration || "-",
    ]);

    autoTable(doc, {
      startY: summaryY + 8,
      head: [
        [
          "#",
          "Date",
          "Voucher No.",
          "Customer",
          "Receipt Into",
          "Amount",
          "Narration",
        ],
      ],
      body: tableData,
      foot: [["", "", "", "", "TOTAL", formatAmount(totalAmount), ""]],
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
        1: { cellWidth: 22 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 },
        5: { halign: "right", cellWidth: 28 },
        6: { cellWidth: 26 },
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(230);
      doc.line(14, 285, 195, 285);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`${company} • Receipt Voucher Report`, 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" });
    }

    if (shouldPrint) {
      const blobURL = doc.output("bloburl");
      const printWindow = window.open(blobURL);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
        };
      }
    } else {
      doc.save(`Receipt_Voucher_Report_${today}.pdf`);
    }
  };

  const handleExportPDF = () => generatePDF(false);
  const handlePrint = () => generatePDF(true);

  const handleExportExcel = () => {
    if (sortedVouchers.length === 0) return;
    const company = companyDetails?.name || companyName || "Company";
    const today = new Date().toLocaleDateString("en-IN");
    const exportData = [];

    sortedVouchers.forEach((v, index) => {
      exportData.push({
        "S.No": index + 1,
        Date: v.date ? new Date(v.date).toLocaleDateString("en-IN") : "-",
        "Voucher No": v.voucherId || v.voucherNo || v.id,
        Customer: ledgerMap[v.customer] || v.customer || "-",
        "Receipt Into": getReceiptInto(v.receiptAccountId),
        Amount: Number(v.totalDebit || v.amount || v.totalAmount || 0),
        Narration: v.narration || "-",
      });
    });

    const headerRows = [
      [`Company Name: ${company}`],
      [`Report: Receipt Vouchers`],
      [`Generated On: ${today}`],
      [],
    ];
    const ws = XLSX.utils.aoa_to_sheet(headerRows);
    XLSX.utils.sheet_add_json(ws, exportData, { origin: "A5" });
    ws["!cols"] = [
      { wch: 8 },
      { wch: 14 },
      { wch: 16 },
      { wch: 28 },
      { wch: 28 },
      { wch: 16 },
      { wch: 30 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Receipt Vouchers");
    XLSX.writeFile(wb, "Receipt_Vouchers_Report.xlsx");
  };

  const handleEdit = (id) => {
    const editPath =
      loggedInRole === "employee"
        ? `/employee/hr/accounting/client/receptVoucher/${encodeURIComponent(id)}`
        : `/accounting/client/receptVoucher/${encodeURIComponent(id)}`;
    navigate(editPath);
  };

  const handleViewDetails = async (voucherId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/receive-voucher/${voucherId}?companyId=${companyId}`,
      );
      setSelectedVoucher(res.data);
    } catch (error) {
      console.error("Error fetching voucher details:", error);
      Swal.fire("Error", "Failed to fetch voucher details.", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Receipt Voucher?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/receive-voucher/delete/${encodeURIComponent(id)}?companyId=${companyId}`,
        );
        Swal.fire({
          icon: "success",
          title: "Deleted Successfully",
          text: "Receipt voucher has been deleted.",
          timer: 1800,
          showConfirmButton: false,
        });
        fetchVouchers();
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire("Error", "Failed to delete receipt voucher.", "error");
      }
    }
  };

  const handleDownloadPDF = (v) => {
    const url = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/receive-voucher/download/${v.id}?companyId=${companyId}`;
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `Receipt_Voucher_${v.voucherId || v.voucherNo || v.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => {
        console.error("Error downloading PDF:", err);
        window.open(url, "_blank");
      });
  };

  const createPath =
    loggedInRole === "employee"
      ? "/employee/hr/accounting/client/receptVoucher"
      : "/accounting/client/receptVoucher";

  return (
    <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans">
      <div className="max-w-7xl mx-auto app-panel overflow-hidden border border-[#e2f2e9] bg-white">
        <div className="flex flex-wrap justify-between items-center app-section-bar py-5 px-6 border-b border-[#e2f2e9] gap-4 bg-white">
          <h2 className="app-title text-xl font-extrabold text-[#042f2e]">
            List of Receipt Vouchers
          </h2>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Customer / Amount..."
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
              disabled={filteredVouchers.length === 0}
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 h-10 rounded-xl border border-emerald-200 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
            >
              <FileSpreadsheet size={16} />
              Export Excel
            </button>

            <button
              onClick={handleExportPDF}
              disabled={filteredVouchers.length === 0}
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 h-10 rounded-xl border border-blue-200 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
            >
              <FileDown size={16} />
              Export PDF
            </button>

            <Link
              to={createPath}
              className="flex items-center justify-center gap-2 bg-linear-to-r from-[#00a651] to-[#00c853] hover:from-[#008c44] hover:to-[#00a651] text-white px-5 h-10 rounded-xl text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              + Create Receipt Voucher
            </Link>
          </div>
        </div>

        {loading && (
          <p className="text-center text-slate-500 py-10">
            Loading receipt vouchers...
          </p>
        )}

        {!loading && filteredVouchers.length > 0 && (
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
                    Customer
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                    Receipt Into
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                    Amount (₹)
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                    Narration
                  </th>
                  <th className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-center w-32">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e2f2e9]">
                {sortedVouchers.map((v, idx) => {
                  const voucherNum = v.voucherId || v.voucherNo || v.id;
                  const customerName =
                    ledgerMap[v.customer] || v.customer || "—";
                  const receiptAccount = getReceiptInto(v.receiptAccountId);
                  const voucherAmt = Number(
                    v.totalDebit || v.amount || v.totalAmount || 0,
                  );

                  return (
                    <tr
                      key={v.id || idx}
                      className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-200"
                    >
                      <td className="py-3 px-4 border-r border-[#e2f2e9] text-center text-[#475569] text-[13px]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 border-r border-[#e2f2e9] text-slate-600 text-[13px] whitespace-nowrap">
                        {v.date
                          ? new Date(v.date).toLocaleDateString("en-IN")
                          : "-"}
                      </td>
                      <td className="py-3 px-4 border-r border-[#e2f2e9] font-bold text-[#042f2e] text-[13px] whitespace-nowrap">
                        {voucherNum}
                      </td>
                      <td className="py-3 px-4 border-r border-[#e2f2e9] text-slate-700 font-bold text-[13px]">
                        {customerName}
                      </td>
                      <td className="py-3 px-4 border-r border-[#e2f2e9] text-slate-600 text-[13px] whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#f0fdf4] text-[#00a651] border border-[#c6f1d6] font-semibold text-xs">
                          {receiptAccount}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-r border-[#e2f2e9] text-right font-bold text-[#042f2e] text-[13px] whitespace-nowrap">
                        {voucherAmt.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3 px-4 border-r border-[#e2f2e9] text-slate-600 text-[13px] max-w-xs truncate">
                        {v.narration || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleViewDetails(v.id)}
                            title="View Voucher Details"
                            className="text-slate-400 hover:text-[#00a651] p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(v.id)}
                            title="Edit Receipt Voucher"
                            className="text-slate-400 hover:text-amber-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            title="Delete Receipt Voucher"
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(v)}
                            title="Download PDF"
                            className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            <FileDown size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredVouchers.length === 0 && (
          <div className="px-4 py-12 text-center">
            <SearchX className="size-10 mx-auto mb-3 text-slate-400" />
            <p className="text-[14px] font-bold text-[#042f2e]">
              No receipt vouchers found
            </p>
            <p className="text-[13px] mt-1 text-slate-500">
              Try adjusting your search criteria or create a new receipt
              voucher.
            </p>
          </div>
        )}

        {!loading && filteredVouchers.length > 0 && (
          <div className="flex flex-wrap justify-between items-center py-4 px-6 bg-[#f0fdf4]/30 border-t border-[#e2f2e9] text-sm gap-4">
            <div className="flex items-center gap-2 text-[#042f2e] font-extrabold">
              <FileText size={18} className="text-[#00a651]" />
              <span>TOTAL VOUCHERS: {filteredVouchers.length}</span>
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

      {selectedVoucher && (
        <ReceiveVoucherDetailModal
          voucher={selectedVoucher}
          ledgerMap={ledgerMap}
          onClose={() => setSelectedVoucher(null)}
          onEdit={(id) => {
            setSelectedVoucher(null);
            handleEdit(id);
          }}
          onDownload={handleDownloadPDF}
        />
      )}
    </div>
  );
};

export default ReceiveVouchersList;
