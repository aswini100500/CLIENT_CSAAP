import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  FileDown,
  FileSpreadsheet,
  Printer,
  X,
  Package,
  MapPin,
  Truck,
  UserRound,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  addReportHeader,
  addWorkbookHeader,
  getCompanyAddress,
} from "../utils/exportReportUtils";
import useAuth from "../../../hooks/useAuth";

const ListOfPurchaseVoucher = () => {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [showEmployeeActivity, setShowEmployeeActivity] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [ledgersList, setLedgersList] = useState([]);
  const { companyId, companyName, employees } = useCompany();

  const getEmployeeName = (id) => {
    const emp = employees?.find((e) => e.id == id);
    return emp ? emp.name || emp.first_name || "Employee" : "Unknown Employee";
  };

  const navigate = useNavigate();
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

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
      fetchCompanyDetails();
      fetchLedgers();
    }
  }, [companyId]);

  const fetchLedgers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`,
      );
      const ledgers = Array.isArray(res.data) ? res.data : res.data.data || [];
      setLedgersList(ledgers);
    } catch (err) {
      console.error("Error fetching ledgers:", err);
    }
  };

  const resolveLedgerId = (name) => {
    if (!name) return "";
    const cleanName = String(name).trim().toLowerCase();
    const found = ledgersList.find(
      (l) => String(l.name).trim().toLowerCase() === cleanName,
    );
    return found ? found.id : name;
  };

  const handleBulkImport = async (data) => {
    try {
      const grouped = {};
      data.forEach((row) => {
        const vNo =
          row["Voucher No"] || row["voucherNo"] || `PUR-${Date.now()}`;
        if (!grouped[vNo]) {
          grouped[vNo] = {
            date:
              row["Date"] ||
              row["date"] ||
              new Date().toISOString().split("T")[0],
            customer:
              row["Supplier Name"] || row["supplier"] || "Walk-in Supplier",
            ledger: resolveLedgerId(row["Supplier Name"] || row["supplier"]),
            narration: row["Voucher Narration"] || row["narration"] || "",
            invoiceNo: vNo,
            subtotal: 0,
            gst_percentage: Number(
              row["GST Percentage"] || row["gst_percentage"] || 0,
            ),
            gst_amount: 0,
            grand_total: 0,
            items: [],
          };
        }

        const itemQty = Number(row["Qty"] || row["qty"] || 0);
        const itemRate = Number(row["Rate"] || row["rate"] || 0);
        const itemAmount =
          itemQty * itemRate || Number(row["Amount"] || row["amount"] || 0);

        grouped[vNo].subtotal += itemAmount;
        grouped[vNo].items.push({
          item: row["Item Name"] || row["item"] || "Stock Item",
          qty: itemQty,
          rate: itemRate,
          amount: itemAmount,
          hsn_code: String(row["HSN Code"] || row["hsn_code"] || ""),
        });
      });

      const vouchersPayload = Object.values(grouped).map((v) => {
        const gst_amount = (v.subtotal * v.gst_percentage) / 100;
        return {
          ...v,
          gst_amount,
          grand_total: v.subtotal + gst_amount,
        };
      });

      if (vouchersPayload.length === 0) {
        Swal.fire("Error", "No valid vouchers found in sheet.", "error");
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/purchase-voucher/bulk-create`,
        {
          companyId,
          vouchers: vouchersPayload,
        },
      );

      Swal.fire("Success", "Vouchers imported successfully!", "success");
      fetchVouchers();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        "Failed to import vouchers. " +
          (err.response?.data?.message || err.message),
        "error",
      );
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

  const companyAddress = getCompanyAddress(companyDetails);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const companyNameForExport =
      companyDetails?.name || companyName || "Company";
    const today = new Date().toLocaleDateString("en-IN");

    const formatAmount = (amount) => {
      const num = Number(amount || 0);
      const formatted = Math.abs(num).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return num < 0 ? `-Rs. ${formatted}` : `Rs. ${formatted}`;
    };

    const { company, summaryY, tableStartY } = addReportHeader(doc, {
      companyName: companyNameForExport,
      companyAddress,
      reportTitle: "Purchase Voucher Report",
      generatedOn: today,
    });

    const totalAmount = filteredVouchers.reduce(
      (acc, v) => acc + (Number(v.amount) || 0),
      0,
    );
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(`Total Vouchers: ${filteredVouchers.length}`, 14, summaryY);

    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: ${formatAmount(totalAmount)}`, 195, summaryY, {
      align: "right",
    });

    const tableData = filteredVouchers.map((v, i) => [
      i + 1,
      v.date,
      v.voucherNumber,
      v.supplierName,
      formatAmount(v.amount),
    ]);

    autoTable(doc, {
      startY: tableStartY,
      head: [["#", "Date", "Voucher No.", "Supplier Name", "Amount"]],
      body: tableData,
      foot: [["", "", "", "TOTAL", formatAmount(totalAmount)]],
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
        1: { cellWidth: 30 },
        2: { cellWidth: 35 },
        4: { halign: "right", cellWidth: 40 },
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(230);
      doc.line(14, 285, 195, 285);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`${company} • Purchase Voucher Report`, 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" });
    }

    doc.save(`Purchase_Voucher_Report_${today}.pdf`);
  };

  const handleExportExcel = () => {
    if (vouchers.length === 0) return;
    const today = new Date().toLocaleDateString("en-IN");
    const companyNameForExport =
      companyDetails?.name || companyName || "Company";
    const exportData = filteredVouchers.map((v) => ({
      Date: v.date,
      "Voucher No": v.voucherNumber,
      Supplier: v.supplierName,
      Amount: v.amount,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData, { origin: "A6" });
    addWorkbookHeader(XLSX, ws, {
      companyName: companyNameForExport,
      companyAddress,
      reportTitle: "Purchase Voucher Report",
      generatedOn: today,
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchase");
    XLSX.writeFile(wb, "Purchase_Vouchers_Report.xlsx");
  };

  const handlePrint = () => {
    if (filteredVouchers.length === 0) {
      Swal.fire("Info", "No purchase vouchers to print", "info");

      return;
    }

    const doc = new jsPDF();

    const companyNameForExport =
      companyDetails?.name || companyName || "Company";

    const today = new Date().toLocaleDateString("en-IN");

    const formatAmount = (amount) => {
      const num = Number(amount || 0);

      const formatted = Math.abs(num).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return num < 0 ? `-Rs. ${formatted}` : `Rs. ${formatted}`;
    };

    const { company, summaryY, tableStartY } = addReportHeader(doc, {
      companyName: companyNameForExport,

      companyAddress,

      reportTitle: "Purchase Voucher Report",

      generatedOn: today,
    });

    const totalAmount = filteredVouchers.reduce(
      (acc, v) => acc + (Number(v.amount) || 0),
      0,
    );

    doc.setFontSize(10);

    doc.setTextColor(40);

    doc.text(`Total Vouchers: ${filteredVouchers.length}`, 14, summaryY);

    doc.setFont("helvetica", "bold");

    doc.text(`Total Amount: ${formatAmount(totalAmount)}`, 195, summaryY, {
      align: "right",
    });

    const tableData = filteredVouchers.map((v, i) => [
      i + 1,
      v.date,
      v.voucherNumber,
      v.supplierName,
      formatAmount(v.amount),
    ]);

    autoTable(doc, {
      startY: tableStartY,

      head: [["#", "Date", "Voucher No.", "Supplier Name", "Amount"]],

      body: tableData,

      foot: [["", "", "", "TOTAL", formatAmount(totalAmount)]],

      theme: "grid",

      tableWidth: "auto",

      styles: {
        fontSize: 9,

        cellPadding: {
          top: 5,
          right: 5,
          bottom: 5,
          left: 5,
        },

        valign: "middle",

        lineColor: [220, 220, 220],

        lineWidth: 0.3,

        overflow: "linebreak",

        textColor: [40, 40, 40],
      },

      headStyles: {
        fillColor: [37, 99, 235],

        textColor: [255, 255, 255],

        fontStyle: "bold",

        halign: "center",

        valign: "middle",

        fontSize: 10,
      },

      bodyStyles: {
        valign: "middle",
      },

      footStyles: {
        fillColor: [245, 245, 245],

        textColor: [15, 23, 42],

        fontStyle: "bold",

        fontSize: 10,
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
          halign: "center",

          cellWidth: 32,
        },

        2: {
          halign: "center",

          cellWidth: 38,
        },

        3: {
          halign: "left",

          cellWidth: 78,
        },

        4: {
          halign: "right",

          cellWidth: 28,
        },
      },

      didParseCell: function (data) {
        if (data.section === "head") {
          data.cell.styles.halign = "center";
        }

        if (data.section === "foot" && data.column.index === 3) {
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

      doc.text(`${company} • Purchase Voucher Report`, 14, 290);

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

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/purchase-voucher/${companyId}`,
      );
      setVouchers(
        res.data.map((v) => ({
          ...v,
          voucherNumber: v.voucherNo || v.invoiceNo || v.id,
          supplierName: v.customer,
          amount: v.grand_total,
          date: v.date?.split("T")[0],
        })),
      );
    } catch (error) {
      Swal.fire("Error", "Failed to fetch purchase vouchers.", "error");
    }
    setLoading(false);
  };

  const handleView = async (id) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/purchase-voucher/single/${id}`,
      );
      setSelectedVoucher(res.data);
      setViewModalOpen(true);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load voucher details.", "error");
    }
  };

  const handleEdit = (id) => {
    navigate(`/accounting/client/purchasevoucher/${id}`);
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
        await axios.delete(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/purchase-voucher/${id}`,
        );
        Swal.fire("Deleted!", "Voucher has been deleted.", "success");
        fetchVouchers();
      } catch {
        Swal.fire("Error", "Failed to delete voucher.", "error");
      }
    }
  };

  const loggedInRole = user?.role?.toLowerCase() || "admin";
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

    return (
      v.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.voucherNumber?.toString().includes(searchQuery)
    );
  });

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-[monospace]">
      <div className="bg-[#005AB3] text-white px-5 py-3 shadow">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">
            List of Purchase Vouchers
          </h1>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search Supplier / Voucher No."
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
                  navigate(`${basePath}/purchasevoucher`);
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

      <div className="max-w-6xl mx-auto mt-6 bg-white shadow rounded-lg border border-gray-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-[#E6EEF8] border-b border-gray-300">
              <tr className="text-left text-gray-700">
                <th className="px-4 py-2 border-r">Date</th>
                <th className="px-4 py-2 border-r">Voucher No.</th>
                <th className="px-4 py-2 border-r">Supplier Name</th>
                <th className="px-4 py-2 border-r">Amount (₹)</th>
                {showEmployeeActivity && (
                  <th className="text-left px-2 py-2">Employee Name</th>
                )}
                <th className="px-4 py-2 border-r text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Loading vouchers...
                  </td>
                </tr>
              ) : filteredVouchers.length > 0 ? (
                filteredVouchers.map((voucher, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-200 hover:bg-[#F9FCFF] transition ${
                      index % 2 === 0 ? "bg-white" : "bg-[#F7F9FB]"
                    }`}
                  >
                    <td className="px-4 py-2">{voucher.date}</td>
                    <td className="px-4 py-2">{voucher.voucherNumber}</td>
                    <td className="px-4 py-2">{voucher.supplierName}</td>
                    <td className="px-4 py-2 text-right">{voucher.amount}</td>

                    {showEmployeeActivity && (
                      <td className="px-4 py-2 truncate max-w-37.5">
                        {getEmployeeName(voucher.employee_id)}
                      </td>
                    )}
                    <td className="px-4 py-2 text-center flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleView(voucher.id)}
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
                          if (!voucher.pdf_path) {
                            Swal.fire(
                              "Info",
                              "No PDF available for this voucher.",
                              "info",
                            );
                            return;
                          }
                          const url = `${import.meta.env.VITE_ACCOUNTING_URL}/${voucher.pdf_path}`;
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
                  <td
                    colSpan={5}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No purchase vouchers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewModalOpen && selectedVoucher && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setViewModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-blue-700 to-blue-500 rounded-t-2xl">
              <div>
                <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest">
                  Purchase Voucher
                </p>
                <h2 className="text-white text-xl font-bold">
                  {selectedVoucher.invoiceNo || `#${selectedVoucher.id}`}
                </h2>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="text-white hover:text-blue-200 transition"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  ["Date", selectedVoucher.date?.split("T")[0] || "—"],
                  ["Supplier", selectedVoucher.customer || "—"],
                  [
                    "Voucher No",
                    selectedVoucher.invoiceNo || `#${selectedVoucher.id}`,
                  ],
                  ["Place of Supply", selectedVoucher.placeOfSupply || "—"],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">{val}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-3 flex items-center gap-1">
                    <MapPin size={12} /> Supplier Details
                  </p>
                  <div className="space-y-1.5 text-sm">
                    {[
                      ["Mailing Name", selectedVoucher.mailingName],
                      ["Address", selectedVoucher.address],
                      ["State", selectedVoucher.state],
                      ["Country", selectedVoucher.country],
                      ["GSTIN", selectedVoucher.gstin],
                      ["GST Reg. Type", selectedVoucher.gstRegistrationType],
                    ]
                      .filter(([, v]) => v)
                      .map(([label, val]) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-gray-500">{label}</span>
                          <span className="font-medium text-gray-800 text-right max-w-[60%]">
                            {val}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-3">
                    Tax Summary
                  </p>
                  <div className="space-y-1.5 text-sm">
                    {[
                      [
                        "Subtotal",
                        `₹ ${Number(selectedVoucher.subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                      ],
                      [
                        "IGST",
                        `₹ ${Number(selectedVoucher.igst || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                      ],
                      [
                        "CGST",
                        `₹ ${Number(selectedVoucher.cgst || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                      ],
                      [
                        "SGST",
                        `₹ ${Number(selectedVoucher.sgst || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                      ],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-gray-500">{label}</span>
                        <span className="font-medium text-gray-800">{val}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="font-bold text-gray-700">
                        Grand Total
                      </span>
                      <span className="font-bold text-blue-700 text-base">
                        ₹{" "}
                        {Number(
                          selectedVoucher.grand_total || 0,
                        ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedVoucher.items && selectedVoucher.items.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-1">
                    <Package size={12} /> Line Items
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-2 text-left">#</th>
                          <th className="px-4 py-2 text-left">Item</th>
                          <th className="px-4 py-2 text-left">HSN</th>
                          <th className="px-4 py-2 text-right">Qty</th>
                          <th className="px-4 py-2 text-center">per</th>
                          <th className="px-4 py-2 text-right">Rate</th>
                          <th className="px-4 py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVoucher.items.map((item, i) => (
                          <tr
                            key={i}
                            className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                          >
                            <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                            <td className="px-4 py-2 font-medium text-gray-800">
                              {item.item || item.itemName}
                            </td>
                            <td className="px-4 py-2 text-gray-500">
                              {item.hsn_code || "—"}
                            </td>
                            <td className="px-4 py-2 text-right">{item.qty}</td>
                            <td className="px-4 py-2 text-center text-gray-500">
                              {item.per || "Nos"}
                            </td>
                            <td className="px-4 py-2 text-right">
                              ₹{" "}
                              {Number(item.rate).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold">
                              ₹{" "}
                              {Number(item.amount).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(selectedVoucher.dispatchedThrough ||
                selectedVoucher.destination ||
                selectedVoucher.receiptNoteNo) && (
                <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-3 flex items-center gap-1">
                    <Truck size={12} /> Receipt / Dispatch
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {[
                      ["Receipt Note No.", selectedVoucher.receiptNoteNo],
                      ["Dispatched Through", selectedVoucher.dispatchedThrough],
                      ["Destination", selectedVoucher.destination],
                      ["Vehicle No.", selectedVoucher.motorVehicleNo],
                      ["Bill of Lading", selectedVoucher.billOfLading],
                      [
                        "Supplier Invoice No.",
                        selectedVoucher.supplierInvoiceNo,
                      ],
                    ]
                      .filter(([, v]) => v)
                      .map(([label, val]) => (
                        <div key={label}>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold">
                            {label}
                          </p>
                          <p className="text-gray-800 font-medium">{val}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {selectedVoucher.narration && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Narration
                  </p>
                  <p className="text-sm text-gray-700 italic">
                    {selectedVoucher.narration}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => {
                    setViewModalOpen(false);
                    handleEdit(selectedVoucher.id);
                  }}
                  className="px-5 py-2 border border-yellow-400 text-yellow-600 rounded-lg hover:bg-yellow-50 text-sm font-medium transition"
                >
                  Edit Voucher
                </button>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOfPurchaseVoucher;
