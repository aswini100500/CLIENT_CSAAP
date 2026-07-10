import React, { useState, useEffect } from "react";
import { Eye, Edit, Trash2, Download, Printer, Search, UserRound, FileSpreadsheet, FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import { useNavigate } from "react-router-dom";
import ReceiveVoucherDetailModal from "./Receivevoucherdetailmodal";
import useAuth from "../../../hooks/useAuth";

const ReciptVouchersList = () => {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [showEmployeeActivity, setShowEmployeeActivity] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [ledgerMap, setLedgerMap] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const { companyId, companyName, employees } = useCompany();

  const getEmployeeName = (id) => {
    const emp = employees?.find(e => e.id == id);
    return emp ? (emp.name || emp.first_name || "Employee") : "Unknown Employee";
  };

  const loggedInRole = user?.role?.toLowerCase() || "admin";
  const loggedInEmployeeId = user?.employee_id || null;

  const navigate = useNavigate();

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

  const fetchCompanyDetails = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/company/${companyId}`);
      setCompanyDetails(res.data);
    } catch (err) {
      console.error("Error fetching company details:", err);
    }
  };

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/receive-voucher/getReceiptVoucher/${companyId}`
      );

      const sortedVouchers = (res.data.data || []).slice().sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();

        if (dateA !== dateB) {
          return dateB - dateA;
        }

        const voucherA = Number(a.voucherId) || 0;
        const voucherB = Number(b.voucherId) || 0;

        return voucherB - voucherA;
      });

      setVouchers(sortedVouchers);
    } catch {
      Swal.fire("Error", "Failed to fetch vouchers.", "error");
    }
    setLoading(false);
  };

  const fetchLedgers = async () => {
    try {
      const [ledgersRes, banksRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`),
        axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/all`)
      ]);

      const map = {};
      const ledgers = Array.isArray(ledgersRes.data) ? ledgersRes.data : ledgersRes.data.data || [];
      ledgers.forEach(l => {
        map[l.id] = l.name;
        map[`ledger_${l.id}`] = l.name;
      });

      const banks = banksRes.data.accounts || [];
      banks.forEach(b => {
        map[b.id] = b.bankName ? `${b.accountName} (${b.bankName})` : b.accountName;
        map[`bank_${b.id}`] = b.bankName ? `${b.accountName} (${b.bankName})` : b.accountName;
      });

      map['cash'] = 'Cash';
      setLedgerMap(map);
    } catch (err) {
      console.error("Error fetching ledgers:", err);
    }
  };

  const getReceiptInto = (receiptAccountId) => {
    if (receiptAccountId === null || receiptAccountId === undefined || receiptAccountId === "") {
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

    if (/^\d+$/.test(normalized)) {
      return ledgerMap[value] || "Bank";
    }

    return ledgerMap[value] || "Bank";
  };

  const handleEdit = (voucherId) => {
    if (loggedInRole === "employee") {
      navigate(`/employee/hr/accounting/client/receptVoucher/${encodeURIComponent(voucherId)}`);
    } else {
      navigate(`/accounting/client/receptVoucher/${encodeURIComponent(voucherId)}`);
    }
  };

  const handleViewDetails = async (voucherId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/receive-voucher/${voucherId}?companyId=${companyId}`);
      setSelectedVoucher(res.data);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to fetch voucher details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/receive-voucher/delete/${encodeURIComponent(id)}?companyId=${companyId}`);
        Swal.fire("Deleted!", "Voucher has been deleted.", "success");
        fetchVouchers();
      } catch {
        Swal.fire("Error", "Failed to delete voucher.", "error");
      }
    }
  };

  const handleExportExcel = () => {
    if (filteredVouchers.length === 0) return;
    const company = companyDetails?.name || companyName || "Company";
    const today = new Date().toLocaleDateString("en-IN");
    const exportData = [];

    filteredVouchers.forEach((v, index) => {
      exportData.push({
        "S.No": index + 1,
        Date: v.date ? new Date(v.date).toLocaleDateString("en-IN") : "-",
        "Voucher No": v.voucherId || v.id,
        Customer: ledgerMap[v.customer] || v.customer || "-",
        "Receipt Into": getReceiptInto(v.receiptAccountId),
        Amount: Number(v.totalDebit || v.amount || 0),
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
      { wch: 25 },
      { wch: 25 },
      { wch: 14 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Receipts");
    XLSX.writeFile(wb, "Receipt_Vouchers_Report.xlsx");
  };

  const generatePDF = (shouldPrint = false) => {
    if (filteredVouchers.length === 0) return;

    const doc = new jsPDF();
    const company = (companyDetails?.name || companyName || "Company").toUpperCase();
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


    const totalAmount = filteredVouchers.reduce((acc, v) => acc + Number(v.totalDebit || v.amount || 0), 0);

    doc.setFontSize(10);
    doc.setTextColor(40);
    const summaryY = headerBottomY + 8;
    doc.text(`Total Vouchers: ${filteredVouchers.length}`, 14, summaryY);

    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: ${formatAmount(totalAmount)}`, 195, summaryY, { align: "right" });


    const tableData = filteredVouchers.map((v, i) => [
      i + 1,
      formatDate(v.date),
      v.voucherId || v.id || "-",
      ledgerMap[v.customer] || v.customer || "-",
      getReceiptInto(v.receiptAccountId),
      formatAmount(v.totalDebit || v.amount || 0),
    ]);

    autoTable(doc, {
      startY: summaryY + 8,
      head: [["#", "Date", "Voucher No.", "Customer", "Receipt Into", "Amount"]],
      body: tableData,
      foot: [["", "", "", "", "TOTAL", formatAmount(totalAmount)]],
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
        0: { halign: "center", cellWidth: 10 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 45 },
        4: { cellWidth: 45 },
        5: { halign: "right", cellWidth: 35 },
      }
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
      doc.autoPrint();
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = doc.output("bloburl");
      document.body.appendChild(iframe);
      iframe.contentWindow.print();
    } else {
      doc.save(`Receipt_Voucher_Report_${today}.pdf`);
    }
  };

  const handleExportPDF = () => {
    generatePDF(false);
  };

  const handlePrint = () => {
    generatePDF(true);
  };


  const filteredVouchers = vouchers.filter((v) => {
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

    const narration = v.narration?.toLowerCase() || "";
    const voucherNo = v.voucherNo?.toString() || "";
    const customer = (ledgerMap[v.customer] || v.customer || "").toString().toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      narration.includes(query) ||
      voucherNo.includes(query) ||
      customer.includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-[monospace]">

      <div className="bg-[#005AB3] text-white px-5 py-3 shadow">
        <div className="flex items-center justify-between gap-4 flex-wrap">


          <h1 className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">
            List of Receipt Vouchers
          </h1>


          <div className="flex items-center gap-2.5 flex-wrap">


            <div className="relative">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Narration / Voucher No."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 pl-8 pr-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-56"
              />
            </div>


            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const basePath = loggedInRole === "employee" ? "/employee/hr/accounting/client" : "/accounting/client";
                  navigate(`${basePath}/receptVoucher`);
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
                  disabled={filteredVouchers.length === 0}
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
                  className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-all whitespace-nowrap border ${showEmployeeActivity
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


      <div className="max-w-6xl mx-auto mt-6 bg-white shadow rounded-lg border border-gray-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-[#E6EEF8] border-b border-gray-300">
              <tr className="text-left text-gray-700">
                <th className="px-4 py-2 border-r">Date</th>
                <th className="px-4 py-2 border-r">Voucher No.</th>
                <th className="px-4 py-2 border-r">Customer</th>
                <th className="px-4 py-2 border-r">Receipt Into</th>
                <th className="px-4 py-2 border-r text-right">Amount (₹)</th>
                {showEmployeeActivity && <th className="px-4 py-2 border-r text-left">Employee Name</th>}
                <th className="px-4 py-2 border-r text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={showEmployeeActivity ? 7 : 6} className="text-center py-6 text-gray-500 italic">
                    Loading vouchers...
                  </td>
                </tr>
              ) : filteredVouchers.length > 0 ? (
                filteredVouchers.map((voucher, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-200 hover:bg-[#F9FCFF] transition ${index % 2 === 0 ? "bg-white" : "bg-[#F7F9FB]"
                      }`}
                  >
                    <td className="px-4 py-2">
                      {new Date(voucher.date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-2">{voucher.voucherId}</td>
                    <td className="px-4 py-2">{ledgerMap[voucher.customer] || voucher.customer}</td>
                    <td className="px-4 py-2">{getReceiptInto(voucher.receiptAccountId)}</td>


                    <td className="px-4 py-2 text-right">
                      {(voucher.totalDebit || voucher.amount || 0).toString()}
                    </td>
                    {showEmployeeActivity && (
                      <td className="px-4 py-2 truncate max-w-37.5">
                        {getEmployeeName(voucher.employee_id)}
                      </td>
                    )}

                    <td className="px-4 py-2 text-center flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleViewDetails(voucher.id)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(voucher.id)}
                        className="text-yellow-600 hover:text-yellow-800 transition"
                        title="Edit Voucher"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(voucher.id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete Voucher"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          const url = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/receive-voucher/download/${voucher.id}?companyId=${companyId}`;
                          window.open(url, "_blank");
                        }}
                        className="text-green-600 hover:text-green-800 transition"
                        title="Download PDF"
                      >
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={showEmployeeActivity ? 7 : 6} className="text-center py-6 text-gray-500 italic">
                    No vouchers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {selectedVoucher && (
        <ReceiveVoucherDetailModal
          voucher={selectedVoucher}
          ledgerMap={ledgerMap}
          onClose={() => setSelectedVoucher(null)}
          onEdit={(id) => { setSelectedVoucher(null); handleEdit(id); }}
          onDownload={(v) => {
            const url = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/receive-voucher/download/${v.id}?companyId=${companyId}`;
            window.open(url, "_blank");
          }}
        />
      )}
    </div>
  );
};

export default ReciptVouchersList;