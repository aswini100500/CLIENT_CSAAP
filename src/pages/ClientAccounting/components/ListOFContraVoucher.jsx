import React, { useState, useEffect } from "react";
import {
  Calendar,
  Search,
  FileText,
  Printer,
  FileSpreadsheet,
  FileDown,
  Eye,
  Edit,
  Trash2,
  Download,
  UserRound,
} from "lucide-react";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import ContraVoucherDetailModal from "./ContraVoucherDetailModal";
import useAuth from "../../../hooks/useAuth";

const ListOFContraVoucher = () => {
  const { user, role } = useAuth();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [showEmployeeActivity, setShowEmployeeActivity] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const { companyId, companyName, employees } = useCompany();

  const getEmployeeName = (id) => {
    const emp = employees?.find((e) => e.id == id);
    return emp ? emp.name || emp.first_name || "Employee" : "Unknown Employee";
  };

  const Api = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/contra-voucher`;
  const navigate = useNavigate();
  const fetchContraVouchers = async () => {
    try {
      const res = await axios.get(`${Api}/${companyId}/all`);
      setVouchers(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch contra vouchers", err);
      setVouchers([]);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchContraVouchers();
      fetchCompanyDetails();
    }
  }, [companyId]);

  const loggedInRole = role?.toLowerCase() || "admin";
  const loggedInEmployeeId = user?.employee_id || null;

  const filteredVouchers = vouchers.filter((v) => {
    if (loggedInRole === "employee") {
      if (
        v.employee_id != loggedInEmployeeId ||
        v.role?.toLowerCase() !== "employee"
      )
        return false;
    } else {
      const isCreatedByEmployee =
        v.employee_id && v.role?.toLowerCase() === "employee";
      if (showEmployeeActivity) {
        if (!isCreatedByEmployee) return false;
      } else {
        if (isCreatedByEmployee) return false;
      }
    }

    const query = searchQuery.toLowerCase();

    const hasMatchingTransaction = v.transactions?.some((t) => {
      const fromAcc = (t.fromAccountName || t.fromAccount || "")
        .toString()
        .toLowerCase();
      const toAcc = (t.toAccountName || t.toAccount || "")
        .toString()
        .toLowerCase();
      const amount = (t.amount || "").toString().toLowerCase();

      return (
        fromAcc.includes(query) ||
        toAcc.includes(query) ||
        amount.includes(query)
      );
    });

    const voucherNoStr = (v.voucherNo || v.id || "").toString().toLowerCase();

    return (
      hasMatchingTransaction ||
      voucherNoStr.includes(query) ||
      (v.transactions?.length === 0 && query === "")
    );
  });

  const totalAmount = filteredVouchers.reduce((acc, v) => {
    const amt = parseFloat(v.transactions?.[0]?.amount || 0);
    return acc + amt;
  }, 0);

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

  const generatePDF = (shouldPrint = false) => {
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
    doc.text("Contra Voucher Report", 14, 26);

    let headerBottomY = 32;

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Generated on: ${today}`, 195, 18, { align: "right" });

    doc.setDrawColor(220);
    doc.line(14, headerBottomY, 195, headerBottomY);

    const totalAmount = filteredVouchers.reduce(
      (acc, v) => acc + Number(v.transactions?.[0]?.amount || 0),
      0,
    );
    doc.setFontSize(10);
    doc.setTextColor(40);
    const summaryY = headerBottomY + 8;
    doc.text(`Total Vouchers: ${filteredVouchers.length}`, 14, summaryY);

    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: ${formatAmount(totalAmount)}`, 195, summaryY, {
      align: "right",
    });

    const tableData = filteredVouchers.map((v, i) => {
      const t = v.transactions?.[0] || {};
      return [
        i + 1,
        formatDate(v.date),
        v.voucherNo || v.id || "-",
        t.fromAccountName || t.fromAccount || "-",
        t.toAccountName || t.toAccount || "-",
        formatAmount(t.amount),
        v.narration || "-",
      ];
    });

    autoTable(doc, {
      startY: summaryY + 8,
      head: [
        [
          "#",
          "Date",
          "Voucher No.",
          "From Account",
          "To Account",
          "Amount",
          "Narration",
        ],
      ],
      body: tableData,
      foot: [["", "", "", "", "TOTAL", formatAmount(totalAmount), ""]],
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
        3: { cellWidth: 35 },
        4: { cellWidth: 35 },
        5: { halign: "right", cellWidth: 28 },
        6: { cellWidth: 32 },
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(230);
      doc.line(14, 285, 195, 285);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`${company} • Contra Voucher Report`, 14, 290);
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
      doc.save(`Contra_Voucher_Report_${today}.pdf`);
    }
  };

  const handleExportPDF = () => {
    generatePDF(false);
  };

  const handlePrint = () => {
    generatePDF(true);
  };

  const handleExportExcel = () => {
    if (filteredVouchers.length === 0) return;
    const company =
      companyDetails?.name ||
      companyName ||
      filteredVouchers[0]?.companyName ||
      "Company";

    const today = new Date().toLocaleDateString("en-IN");
    const exportData = [];

    filteredVouchers.forEach((v) => {
      const transactions = v.transactions?.length ? v.transactions : [{}];

      transactions.forEach((t, index) => {
        exportData.push({
          "S.No": exportData.length + 1,
          Date: v.date ? new Date(v.date).toLocaleDateString("en-IN") : "-",
          "Voucher No": v.voucherNo || v.id,
          "Transaction No": index + 1,
          "From Account": t.fromAccountName || t.fromAccount || "-",
          "To Account": t.toAccountName || t.toAccount || "-",
          Amount: Number(t.amount || 0),
          "Transaction Narration": t.narration || "-",
          "Voucher Narration": v.narration || "-",
          "GST Type": v.gstType || "-",
          "GST Rate": Number(v.gstRate || 0),
          "GST Amount": Number(v.gstAmount || 0),
          "Voucher Total": Number(v.totalAmount || 0),
          "Grand Total": Number(v.grandTotal || v.totalAmount || 0),
        });
      });
    });

    const headerRows = [
      [`Company Name: ${company}`],

      [`Report: Contra Vouchers`],
      [`Generated On: ${today}`],
      [],
    ];
    const ws = XLSX.utils.aoa_to_sheet(headerRows);
    XLSX.utils.sheet_add_json(ws, exportData, { origin: "A6" });
    ws["!cols"] = [
      { wch: 8 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      { wch: 28 },
      { wch: 28 },
      { wch: 14 },
      { wch: 28 },
      { wch: 28 },
      { wch: 14 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contra");
    XLSX.writeFile(wb, "Contra_Vouchers_Report.xlsx");
  };

  const handleEdit = (id) => {
    navigate(`/accounting/client/contravoucher/${id}`);
  };

  const handleViewDetails = (v) => setSelectedVoucher(v);

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
        await axios.delete(`${Api}/delete/${id}`);
        Swal.fire("Deleted!", "Voucher has been deleted.", "success");
        fetchContraVouchers();
      } catch {
        Swal.fire("Error", "Failed to delete voucher.", "error");
      }
    }
  };

  return (
    <div className="p-2 bg-gray-50 min-h-screen font-[Inter]">
      <div className="bg-[#005AB3] text-white px-5 py-3 shadow">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">
            List of Contra Vouchers
          </h1>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search Account / Amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 pl-8 pr-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-56"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const basePath =
                    loggedInRole === "employee"
                      ? "/employee/hr/accounting/client"
                      : "/accounting/client";
                  navigate(`${basePath}/contravoucher`);
                }}
                className="flex items-center gap-1.5 bg-[#1a56db] hover:bg-blue-600 text-white px-3 h-8 rounded-md text-xs font-medium transition-all whitespace-nowrap"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
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
                  <svg
                    className="w-3 h-3 ml-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
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
                      <FileSpreadsheet size={14} className="text-green-600" />{" "}
                      Excel
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
                  onClick={() => setShowEmployeeActivity((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-all whitespace-nowrap border ${
                    showEmployeeActivity
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  }`}
                >
                  <UserRound size={14} />
                  {showEmployeeActivity
                    ? "Back to Vouchers"
                    : "Employee Activity"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-md overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        <table className="w-full border-collapse min-w-max">
          <thead className="bg-blue-100 text-gray-800">
            <tr>
              <th className="text-left px-2 py-2 ">Date</th>
              <th className="px-4 py-2 ">Voucher No.</th>
              <th className="text-left px-2 py-2 ">From Account</th>
              <th className="text-left px-2 py-2 ">To Account</th>
              <th className="text-right px-2 py-2 ">Amount (₹)</th>
              <th className="text-left px-2 py-2 ">Narration</th>
              {showEmployeeActivity && (
                <th className="text-left px-2 py-2 ">Employee Name</th>
              )}
              <th className="px-4 py-2 ">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredVouchers.length > 0 ? (
              filteredVouchers.map((v) => {
                const t = v.transactions?.[0] || {};
                return (
                  <tr
                    key={v.id}
                    className="hover:bg-blue-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-2">
                      {new Date(v.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 font-medium text-blue-700">
                      {v.voucherNo || v.id}
                    </td>
                    <td className="px-4 py-2">
                      {v.transactions?.map((t, i) => (
                        <div key={i} className="whitespace-nowrap">
                          {t.fromAccountName || t.fromAccount}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-2">
                      {v.transactions?.map((t, i) => (
                        <div key={i} className="whitespace-nowrap">
                          {t.toAccountName || t.toAccount}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {Number(v.totalAmount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-2 truncate max-w-37.5">
                      {v.narration || "-"}
                    </td>
                    {showEmployeeActivity && (
                      <td className="px-4 py-2 truncate max-w-37.5">
                        {getEmployeeName(v.employee_id)}
                      </td>
                    )}
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleViewDetails(v)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(v.id)}
                          className="text-yellow-600 hover:text-yellow-800 transition"
                          title="Edit Voucher"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Delete Voucher"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            const url = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/contra-voucher/download/${v.id}`;

                            fetch(url)
                              .then((response) => response.blob())
                              .then((blob) => {
                                const blobUrl =
                                  window.URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = blobUrl;
                                link.download = `Contra_Voucher_${v.voucherNo || v.id}.pdf`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(blobUrl);
                              })
                              .catch((err) => {
                                console.error("Error downloading:", err);
                                window.open(url, "_blank");
                              });
                          }}
                          className="text-green-600 hover:text-green-800 transition"
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-gray-400 italic"
                >
                  No contra vouchers found for the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="max-w-7xl mx-auto mt-4 bg-[#E6EEF8] p-4 rounded-lg flex justify-between items-center shadow-inner border border-blue-200">
        <div className="flex items-center gap-2 text-blue-800 font-bold">
          <FileText size={20} />
          <span>TOTAL VOUCHERS: {filteredVouchers.length}</span>
        </div>
        <div className="text-lg font-black text-blue-900 tracking-wider">
          TOTAL AMOUNT: ₹{" "}
          {totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
      </div>

      {selectedVoucher && (
        <ContraVoucherDetailModal
          voucher={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
          onEdit={(id) => {
            setSelectedVoucher(null);
            handleEdit(id);
          }}
          onDownload={(v) => {
            const url = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/contra-voucher/download/${v.id}`;
            fetch(url)
              .then((response) => response.blob())
              .then((blob) => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = `Contra_Voucher_${v.voucherNo || v.id}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
              })
              .catch((err) => {
                console.error("Error downloading:", err);
                window.open(url, "_blank");
              });
          }}
        />
      )}
    </div>
  );
};

export default ListOFContraVoucher;
