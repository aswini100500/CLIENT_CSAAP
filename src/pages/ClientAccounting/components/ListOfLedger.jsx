import React from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  Eye,
  FileDown,
  FileSpreadsheet,
  Pencil,
  Printer,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";
import ViewLedgerModal from "./ViewLedgerModal";

const API_BASE = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger`;

const ListOfLedger = () => {
  const { user, role: userRole, companyId, companyName } = useAuth();
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [viewLedger, setViewLedger] = useState(null);
  const [ledgerTransactions, setLedgerTransactions] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const navigate = useNavigate();

  const fetchLedgers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/${companyId}/all`);

      const formatted = res.data.map((item) => ({
        ...item,
        isEditing: false,
        debit: item.debit || 0,
        credit: item.credit || 0,
      }));

      console.log("Fetched Ledgers from API:", formatted);

      setLedgers(formatted);
    } catch (err) {
      console.error("Error fetching ledgers:", err);
      setLedgers([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchCompanyDetails = async () => {
    try {
      let currentSlug = window.location.hostname.split(".")[0];
      if (user?.slug || user?.subdomain) {
        currentSlug = user.slug || user.subdomain;
      }

      const token = authToken || getAuthToken();

      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/gst/sync`,
        {
          headers: {
            "x-tenant-slug": currentSlug,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          withCredentials: true,
        },
      );
      if (res.data && res.data.success) {
        setCompanyDetails({
          ...res.data.data,
          name: res.data.data.company_name,
          address: res.data.data.street_address,
        });
      }
    } catch (err) {
      console.error("Error fetching company details:", err);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchLedgers();
      fetchCompanyDetails();
    }
  }, [companyId]);
  const updateField = (id, field, value) => {
    setLedgers((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, [field]: parseFloat(value) || 0 } : l,
      ),
    );
  };

  const formatBalanceText = (val, originalType) => {
    const num = parseFloat(val) || 0;
    if (num === 0) return "0.00";

    const isDebit =
      originalType === "Debit" ||
      originalType === "Dr" ||
      originalType === "DR";

    if (num > 0) {
      const formatted = num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `${formatted} ${isDebit ? "DR" : "CR"}`;
    } else {
      const absoluteVal = Math.abs(num);
      const formatted = absoluteVal.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const flippedType = isDebit ? "CR" : "DR";
      return `${formatted} ${flippedType}`;
    }
  };

  const renderBalanceJSX = (val, originalType, extraClass = "") => {
    const num = parseFloat(val) || 0;
    const isDebit =
      originalType === "Debit" ||
      originalType === "Dr" ||
      originalType === "DR";

    let amountStr = "0.00";
    let typeStr = "";
    let colorClass = "";

    if (num > 0) {
      amountStr = num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      typeStr = isDebit ? "DR" : "CR";
      colorClass = isDebit ? "text-emerald-600" : "text-rose-500";
    } else if (num < 0) {
      amountStr = Math.abs(num).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      typeStr = isDebit ? "CR" : "DR";
      colorClass = isDebit ? "text-rose-500" : "text-emerald-600";
    }

    return (
      <div
        className={`flex items-center justify-end font-semibold ${extraClass}`}
      >
        <span className="tabular-nums">{amountStr}</span>
        <span
          className={`w-6 text-left ml-2 select-none text-[11px] font-bold tracking-wider ${colorClass}`}
        >
          {typeStr}
        </span>
      </div>
    );
  };

  const getClosingBalance = (l) => {
    const closing = l.closingBalance ?? l.ClosingBalance;
    if (closing !== undefined && closing !== null) return parseFloat(closing);

    const opening = parseFloat(l.openingBalance) || 0;
    const debit = parseFloat(l.debit) || 0;
    const credit = parseFloat(l.credit) || 0;

    if (l.balanceType === "Debit" || l.type === "Debit") {
      return opening + debit - credit;
    } else {
      return opening - debit + credit;
    }
  };

  const enableEdit = (id) => {
    const role = userRole || "admin";
    if (role === "employee") {
      navigate(`/employee/hr/accounting/client/ledger/${id}`);
    } else {
      navigate(`/accounting/client/ledger/${id}`);
    }
  };

  const cancelEdit = async () => {
    fetchLedgers();
  };

  const saveLedger = async (l) => {
    try {
      const payload = {
        name: l.name,
        alias: l.aliasName,
        under: l.underGroup,
        openingBalance: l.openingBalance,
        type: l.balanceType,
        mailingName: l.mailingName,
        address: l.address,
        state: l.state,
        country: l.country,
        pincode: l.pincode,
        provideBankDetails: l.haveBankDetails,
        pan: l.pan,
        registrationType: l.registrationType,
        gstin: l.gstin,
        alterGst: l.alterGstDetails,
        bankDetails: {
          bankName: l.bankName,
          branch: l.branch,
          accountNumber: l.accountNumber,
          ifsc: l.ifsc,
        },
        debit: l.debit,
        credit: l.credit,
      };

      await axios.put(`${API_BASE}/update/${companyId}/${l.id}`, payload);

      alert("Ledger updated successfully!");

      fetchLedgers();
    } catch (err) {
      console.error(err);
      alert("Failed to update ledger");
    }
  };

  const loggedInRole = userRole?.toLowerCase() || "admin";
  const loggedInEmployeeId = user?.employee_id || null;

  const filteredLedgers = ledgers.filter((l) => {
    if (loggedInRole === "employee") {
      return (
        l.employee_id == loggedInEmployeeId &&
        l.role?.toLowerCase() === "employee"
      );
    }
    return true;
  });

  const getGroupName = (underGroup) => {
    return underGroup || "-";
  };

  const getCompanyAddress = (comp) => {
    return comp?.address || "-";
  };

  const addWorkbookHeader = (XLSX, ws, options) => {
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [options.companyName],
        [options.companyAddress],
        [options.reportTitle],
        [`Generated on: ${options.generatedOn}`],
        [],
      ],
      { origin: "A1" },
    );
  };

  const handleExportPDF = () => {
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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text(company, 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Ledger Report", 14, 26);

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Generated on: ${today}`, 195, 18, { align: "right" });

    doc.setDrawColor(220);
    doc.line(14, 32, 195, 32);

    const totalOpening = filteredLedgers.reduce(
      (sum, l) => sum + Number(l.openingBalance || 0),
      0,
    );
    const totalClosing = filteredLedgers.reduce(
      (sum, l) => sum + Number(getClosingBalance(l) || 0),
      0,
    );

    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(`Total Ledgers: ${filteredLedgers.length}`, 14, 40);

    doc.setFont("helvetica", "bold");
    doc.text(`Total Closing: ${formatAmount(totalClosing)}`, 195, 40, {
      align: "right",
    });

    const tableData = filteredLedgers.map((l, i) => [
      i + 1,
      l.name || "-",
      getGroupName(l.underGroup),
      formatBalanceText(l.openingBalance, l.balanceType),
      formatBalanceText(getClosingBalance(l), l.balanceType),
    ]);

    autoTable(doc, {
      startY: 48,
      head: [
        [
          "#",
          "Ledger Name",
          "Under Group",
          "Opening Balance",
          "Closing Balance",
        ],
      ],
      body: tableData,
      foot: [
        [
          "",
          "",
          "TOTAL",
          formatAmount(totalOpening),
          formatAmount(totalClosing),
        ],
      ],
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 3, valign: "middle" },
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
        1: { cellWidth: 65 },
        2: { cellWidth: 50 },
        3: { halign: "right", cellWidth: 32 },
        4: { halign: "right", cellWidth: 35, fontStyle: "bold" },
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(230);
      doc.line(14, 285, 195, 285);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`${company} • Ledger Report`, 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" });
    }

    doc.save(`Ledger_Report_${today}.pdf`);
  };

  const handleExportExcel = () => {
    if (filteredLedgers.length === 0) return;
    const today = new Date().toLocaleDateString("en-IN");
    const companyNameForExport =
      companyDetails?.name || companyName || "Company";
    const companyAddress = getCompanyAddress(companyDetails);

    const exportData = filteredLedgers.map((l) => ({
      "Ledger Name": l.name,
      Alias: l.aliasName || "-",
      "Under Group": getGroupName(l.underGroup),
      "Opening Balance": l.openingBalance || 0,
      "Debit (Dr)": l.debit || 0,
      "Credit (Cr)": l.credit || 0,
      "Closing Balance": getClosingBalance(l) || 0,
      "Balance Type": l.balanceType || "-",
      "Mailing Name": l.mailingName || "-",
      Address: l.address || "-",
      State: l.state || "-",
      Country: l.country || "-",
      Pincode: l.pincode || "-",
      "PAN/IT No.": l.pan || "-",
      "Registration Type": l.registrationType || "-",
      "GSTIN/UIN": l.gstin || "-",
      "Bank Name": l.bankName || "-",
      Branch: l.branch || "-",
      "Account Number": l.accountNumber || "-",
      "IFSC Code": l.ifsc || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData, { origin: "A6" });
    addWorkbookHeader(XLSX, ws, {
      companyName: companyNameForExport,
      companyAddress,
      reportTitle: "Ledger Report",
      generatedOn: today,
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ledgers");
    XLSX.writeFile(wb, "Ledger_Report.xlsx");
  };

  const handlePrint = () => {
    if (filteredLedgers.length === 0) {
      Swal.fire("Info", "No ledgers to print", "info");

      return;
    }

    const doc = new jsPDF("p", "mm", "a4");

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

    doc.setFont("helvetica", "bold");

    doc.setFontSize(20);

    doc.setTextColor(15, 23, 42);

    doc.text(company, 14, 18);

    doc.setFont("helvetica", "normal");

    doc.setFontSize(10);

    doc.setTextColor(100);

    doc.text("Ledger Report", 14, 26);

    doc.setFontSize(8);

    doc.setTextColor(120);

    doc.text(`Generated on: ${today}`, 195, 18, {
      align: "right",
    });

    doc.setDrawColor(220);

    doc.line(14, 32, 195, 32);

    const totalOpening = filteredLedgers.reduce(
      (sum, l) => sum + Number(l.openingBalance || 0),
      0,
    );

    const totalClosing = filteredLedgers.reduce(
      (sum, l) => sum + Number(getClosingBalance(l) || 0),
      0,
    );

    doc.setFontSize(10);

    doc.setTextColor(40);

    doc.text(`Total Ledgers: ${filteredLedgers.length}`, 14, 40);

    doc.setFont("helvetica", "bold");

    doc.text(`Total Closing: ${formatAmount(totalClosing)}`, 195, 40, {
      align: "right",
    });

    const tableData = filteredLedgers.map((l, i) => [
      i + 1,

      l.name || "-",

      getGroupName(l.underGroup),

      formatBalanceText(l.openingBalance, l.balanceType),

      formatBalanceText(getClosingBalance(l), l.balanceType),
    ]);

    autoTable(doc, {
      startY: 48,

      margin: {
        left: 10,
        right: 10,
      },

      tableWidth: "auto",

      head: [
        [
          "#",
          "Ledger Name",
          "Under Group",
          "Opening Balance",
          "Closing Balance",
        ],
      ],

      body: tableData,

      foot: [
        [
          "",
          "",
          "TOTAL",
          formatAmount(totalOpening),
          formatAmount(totalClosing),
        ],
      ],

      theme: "grid",

      styles: {
        fontSize: 8.5,

        overflow: "hidden",

        cellWidth: "wrap",

        valign: "middle",

        whiteSpace: "nowrap",

        cellPadding: {
          top: 4,
          right: 4,
          bottom: 4,
          left: 4,
        },

        lineColor: [220, 220, 220],

        lineWidth: 0.3,

        textColor: [40, 40, 40],
      },

      bodyStyles: {
        overflow: "hidden",
      },

      headStyles: {
        fillColor: [37, 99, 235],

        textColor: [255, 255, 255],

        fontStyle: "bold",

        halign: "center",

        valign: "middle",

        fontSize: 9.5,
      },

      footStyles: {
        fillColor: [245, 245, 245],

        textColor: [15, 23, 42],

        fontStyle: "bold",

        fontSize: 9,
      },

      alternateRowStyles: {
        fillColor: [252, 252, 252],
      },

      columnStyles: {
        0: {
          halign: "center",

          cellWidth: 12,
        },

        1: {
          halign: "left",

          cellWidth: 63,
        },

        2: {
          halign: "left",

          cellWidth: 47,
        },

        3: {
          halign: "right",

          cellWidth: 33,
        },

        4: {
          halign: "right",

          cellWidth: 35,

          fontStyle: "bold",
        },
      },

      didParseCell: function (data) {
        if (data.section === "head") {
          data.cell.styles.halign = "center";
        }

        if (data.section === "foot" && data.column.index === 2) {
          data.cell.styles.halign = "right";
        }
      },
    });

    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      doc.setDrawColor(230);

      doc.line(14, 285, 195, 285);

      doc.setFontSize(8);

      doc.setTextColor(120);

      doc.text(`${company} • Ledger Report`, 14, 290);

      doc.text(`Page ${i} of ${pageCount}`, 195, 290, {
        align: "right",
      });
    }

    const blobURL = doc.output("bloburl");

    const printWindow = window.open(blobURL);

    printWindow.onload = () => {
      printWindow.focus();

      printWindow.print();
    };
  };

  const handleView = async (id) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/${id}`,
      );

      const transRes = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/transaction/ledger/${companyId}/${id}`,
      );

      setViewLedger(res.data);
      setLedgerTransactions(transRes.data.transactions || []);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching ledger details:", err);
      alert("Failed to fetch ledger details");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Ledger?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/${id}`,
      );

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted Successfully",
          text: "Ledger has been deleted.",
          timer: 1800,
          showConfirmButton: false,
        });

        fetchLedgers();
      }
    } catch (err) {
      console.error(err);

      const backendMessage =
        err?.response?.data?.error || err?.response?.data?.message || "";

      if (
        backendMessage.includes("foreign key") ||
        backendMessage.includes("sales_vouchers") ||
        backendMessage.includes("purchase_vouchers")
      ) {
        Swal.fire({
          icon: "warning",
          title: "Unable to Delete Ledger",
          html: `
          <div style="font-size:14px; line-height:1.8; text-align:left;">

            <p>
              This ledger is already used in vouchers or accounting transactions.
            </p>

            <p>
              To maintain accounting records and reports,
              the ledger cannot be deleted.
            </p>

            <div style="
              background:#eff6ff;
              border:1px solid #bfdbfe;
              padding:12px;
              border-radius:8px;
              margin-top:12px;
              color:#1e40af;
              font-weight:500;
            ">
              Suggested Action:
              Mark this ledger as inactive instead of deleting it.
            </div>

          </div>
        `,
          confirmButtonText: "OK",
          confirmButtonColor: "#2563eb",
        });

        return;
      }

      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: "Failed to delete ledger.",
      });
    }
  };
  return (
    <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans">
      <div className="max-w-7xl mx-auto app-panel overflow-hidden border border-[#e2f2e9] bg-white">
        <div className="flex flex-wrap justify-between items-center app-section-bar py-5 px-6 border-b border-[#e2f2e9] gap-4 bg-white">
          <h2 className="app-title text-xl font-extrabold text-[#042f2e]">
            List of Ledgers
          </h2>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 h-10 rounded-xl border border-slate-200 transition-colors text-sm font-semibold cursor-pointer active:scale-[0.98]"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={handleExportExcel}
              disabled={ledgers.length === 0}
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 h-10 rounded-xl border border-emerald-200 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
            >
              <FileSpreadsheet size={16} />
              Export Excel
            </button>
            <button
              onClick={handleExportPDF}
              disabled={filteredLedgers.length === 0}
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 h-10 rounded-xl border border-blue-200 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
            >
              <FileDown size={16} />
              Export PDF
            </button>
            <Link
              to={
                loggedInRole === "employee"
                  ? "/employee/hr/accounting/client/ledger"
                  : "/accounting/client/ledger"
              }
              className="flex items-center justify-center gap-2 bg-linear-to-r from-[#00a651] to-[#00c853] hover:from-[#008c44] hover:to-[#00a651] text-white px-5 h-10 rounded-xl text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              + Create New Ledger
            </Link>
          </div>

          <ViewLedgerModal
            isOpen={showViewModal}
            onClose={() => setShowViewModal(false)}
            viewLedger={viewLedger}
            ledgerTransactions={ledgerTransactions}
            companyDetails={companyDetails}
            companyName={companyName}
          />
        </div>

        {loading && (
          <p className="text-center text-slate-500 py-6">Loading ledgers...</p>
        )}

        {!loading && filteredLedgers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse bg-white">
              <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9]">
                <tr className="text-left text-slate-700">
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-center w-12">
                    #
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                    Ledger Name
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                    Alias
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                    Under
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                    Opening Balance
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                    Debit
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                    Credit
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                    Closing Balance
                  </th>
                  <th className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-center w-28">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e2f2e9]">
                {filteredLedgers.map((l, idx) => (
                  <tr
                    key={l.id}
                    className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-200"
                  >
                    <td className="py-3 px-4 border-r border-[#e2f2e9] text-center text-[#475569] text-[13px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 border-r border-[#e2f2e9] font-bold text-[#042f2e] text-[13px]">
                      {l.name}
                    </td>
                    <td className="py-3 px-4 border-r border-[#e2f2e9] text-slate-600 text-[13px]">
                      {l.aliasName || "--"}
                    </td>
                    <td className="py-3 px-4 border-r border-[#e2f2e9] text-slate-600 text-[13px]">
                      {l.underGroup}
                    </td>
                    <td className="py-3 px-4 border-r border-[#e2f2e9] text-slate-800 text-[13px]">
                      {renderBalanceJSX(l.openingBalance, l.balanceType)}
                    </td>

                    <td className="py-3 px-4 border-r border-[#e2f2e9] text-right text-slate-800 text-[13px]">
                      {l.isEditing ? (
                        <input
                          type="number"
                          value={l.debit}
                          onChange={(e) =>
                            updateField(l.id, "debit", e.target.value)
                          }
                          className="w-24 text-right border border-[#e2f2e9] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] text-[13px]"
                        />
                      ) : (
                        parseFloat(l.debit || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })
                      )}
                    </td>

                    <td className="py-3 px-4 border-r border-[#e2f2e9] text-right text-slate-800 text-[13px]">
                      {l.isEditing ? (
                        <input
                          type="number"
                          value={l.credit}
                          onChange={(e) =>
                            updateField(l.id, "credit", e.target.value)
                          }
                          className="w-24 text-right border border-[#e2f2e9] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] text-[13px]"
                        />
                      ) : (
                        parseFloat(l.credit || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })
                      )}
                    </td>

                    <td className="py-3 px-4 border-r border-[#e2f2e9] text-[13px]">
                      {renderBalanceJSX(
                        getClosingBalance(l),
                        l.balanceType,
                        "text-[#042f2e] font-bold",
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleView(l.id)}
                          title="View Statement"
                          className="text-slate-400 hover:text-[#00a651] p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => enableEdit(l.id)}
                          title="Alter Ledger"
                          className="text-slate-400 hover:text-amber-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(l.id)}
                          title="Delete Ledger"
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListOfLedger;
