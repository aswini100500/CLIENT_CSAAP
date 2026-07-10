













const getEmployeeName = (id) => {
  const emp = employees?.find(e => e.id == id);
  return emp ? (emp.name || emp.first_name || "Employee") : "Unknown Employee";
};



































































































































import React, { useState, useEffect } from "react";
import { ArrowLeft, FileDown, FileSpreadsheet, Printer, Search, Eye, Edit, Trash2, Download, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import PaymentVoucherDetailModal from "./Paymentvoucherdetailmodal";
import useAuth from "../../../hooks/useAuth";

const ListOfPaymentVoucher = () => {
  const { user, role: userRole } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [showEmployeeActivity, setShowEmployeeActivity] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [ledgerMap, setLedgerMap] = useState({});
  const { companyId, employees } = useCompany();
  const navigate = useNavigate();
  const Api = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/payment-voucher`;

  const getEmployeeName = (id) => {
    const emp = employees?.find(e => e.id == id);
    return emp ? (emp.name || emp.first_name || "Employee") : "Unknown Employee";
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
    }
  }, [companyId]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/payment-voucher/all/${companyId}`
      );


      setVouchers(res.data || []);
    } catch (error) {
      Swal.fire("Error", "Failed to fetch vouchers.", "error");
    }
    setLoading(false);
  };

  const loggedInRole = userRole?.toLowerCase() || "admin";
  const loggedInEmployeeId = user?.employee_id || null;


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

    return (
      narration.includes(searchQuery.toLowerCase()) ||
      voucherNo.includes(searchQuery)
    );
  });


  const generatePDF = (shouldPrint = false) => {
    const doc = new jsPDF();
    const companyNameForExport = companyDetails?.name || companyName || "Company";
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

    const { company, summaryY, tableStartY } = addReportHeader(doc, {
      companyName: companyNameForExport,
      companyAddress,
      reportTitle: "Payment Voucher Report",
      generatedOn: today,
    });

    const totalAmount = filteredVouchers.reduce((acc, v) => acc + (Number(v.amount || v.totalCredit || 0)), 0);
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(`Total Vouchers: ${filteredVouchers.length}`, 14, summaryY);

    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: ${formatAmount(totalAmount)}`, 195, summaryY, { align: "right" });

    const tableData = filteredVouchers.map((v, i) => [
      i + 1,
      formatDate(v.date),
      v.voucherNo,
      formatAmount(v.amount || v.totalCredit || 0),
      ledgerMap[v.accountType] || v.accountType || "-"
    ]);

    autoTable(doc, {
      startY: tableStartY,
      head: [["#", "Date", "Voucher No.", "Amount", "Payment Mode"]],
      body: tableData,
      foot: [["", "", "TOTAL", formatAmount(totalAmount), ""]],
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
        3: { halign: "center", cellWidth: 40 }
      }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(230);
      doc.line(14, 285, 195, 285);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`${company} • Payment Voucher Report`, 14, 290);
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
      doc.save(`Payment_Voucher_Report_${today}.pdf`);
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
    const today = new Date().toLocaleDateString("en-IN");
    const companyNameForExport = companyDetails?.name || companyName || "Company";
    const exportData = filteredVouchers.map(v => ({
      Date: new Date(v.date).toLocaleDateString(),
      "Voucher No": v.voucherNo,
      Amount: v.amount || v.totalCredit || 0,
      "Payment Mode": ledgerMap[v.accountType] || v.accountType
    }));
    const ws = XLSX.utils.json_to_sheet(exportData, { origin: "A6" });
    addWorkbookHeader(XLSX, ws, {
      companyName: companyNameForExport,
      companyAddress,
      reportTitle: "Payment Voucher Report",
      generatedOn: today,
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, "Payment_Vouchers_Report.xlsx");
  };

  const handleEdit = (id) => {
    if (loggedInRole === "employee") {
      navigate(`/employee/hr/accounting/client/paymentVoucher/${id}`);
    } else {
      navigate(`/accounting/client/paymentVoucher/${id}`);
    }
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
        fetchVouchers();
      } catch {
        Swal.fire("Error", "Failed to delete voucher.", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-[monospace]">

      <div className="bg-[#005AB3] text-white px-5 py-3 shadow">
        <div className="flex items-center justify-between gap-4 flex-wrap">


          <h1 className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">
            List of Payment Vouchers
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
                  navigate(`${basePath}/paymentVoucher`);
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
                <th className="px-4 py-2 border-r">Amount (₹)</th>
                <th className="px-4 py-2 border-r"> Payment Mode</th>
                <th className="px-4 py-2 border-r">Narration</th>
                {showEmployeeActivity && <th className="px-4 py-2 border-r">Employee Name</th>}
                <th className="px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500 italic">
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
                    <td className="px-4 py-2">{voucher.voucherNo}</td>


                    <td className="px-4 py-2 text-right">
                      {(voucher.amount || voucher.totalCredit || 0).toString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {voucher.accountTypeName || voucher.accountType}
                    </td>

                    <td className="px-4 py-2">{voucher.narration || "-"}</td>
                    {showEmployeeActivity && (
                      <td className="px-4 py-2 truncate max-w-37.5">
                        {getEmployeeName(voucher.employee_id)}
                      </td>
                    )}
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleViewDetails(voucher)}
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
                            const url = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/payment-voucher/download/${voucher.id}`;
                            window.open(url, "_blank");
                          }}
                          className="text-green-600 hover:text-green-800 transition"
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500 italic">
                    No vouchers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedVoucher && (
        <PaymentVoucherDetailModal
          voucher={selectedVoucher}
          ledgerMap={ledgerMap}
          onClose={() => setSelectedVoucher(null)}
          onEdit={(id) => { setSelectedVoucher(null); handleEdit(id); }}
          onDownload={(v) => {
            const url = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/payment-voucher/download/${v.id}`;
            window.open(url, "_blank");
          }}
        />
      )}
    </div>
  );
};

export default ListOfPaymentVoucher;
