import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import {
  Calendar,
  Search,
  FileText,
  Download,
  Trash2,
  Eye,
  Edit,
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useNavigate } from "react-router-dom";
import { useCompany } from "../context/CompanyContext";
import {
  addReportHeader,
  addWorkbookHeader,
  getCompanyAddress,
} from "../utils/exportReportUtils";
import useAuth from "../../../hooks/useAuth";

const ListOfSaleVoucher = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ledgersList, setLedgersList] = useState([]);
  const handleEdit = (id) => {
    navigate(`/accounting/client/salevoucher/${id}`);
  };
  const [fromDate, setFromDate] = useState("2025-11-01");
  const [toDate, setToDate] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [showEmployeeActivity, setShowEmployeeActivity] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const { companyId, companyName, employees } = useCompany();

  const getEmployeeName = (id) => {
    const emp = employees?.find((e) => e.id == id);
    return emp ? emp.name || emp.first_name || "Employee" : "Unknown Employee";
  };

  const API = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/sale-voucher`;

  const fetchVouchers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/${companyId}/all`);

      setVouchers(
        res.data.data
          .map((v) => ({
            id: v.id,
            date: v.date?.split("T")[0] || "",
            voucherNumber: v.invoiceNo || v.id,
            customerName: v.customer || "Unknown",
            amount: Number(v.grand_total) || 0,
            type: "Sales",
            pdfPath: v.pdf_path,
            employee_id: v.employee_id,
            role: v.role,
          }))
          .sort((a, b) => b.id - a.id),
      );
    } catch (err) {
      console.error("Error fetching vouchers:", err);
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
      reportTitle: "Sales Voucher Report",
      generatedOn: today,
    });

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
      v.customerName,
      formatAmount(v.amount),
    ]);

    autoTable(doc, {
      startY: tableStartY,
      head: [["#", "Date", "Voucher No.", "Customer Name", "Amount"]],
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
      doc.text(`${company} • Sales Voucher Report`, 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" });
    }

    doc.save(`Sales_Voucher_Report_${today}.pdf`);
  };

  const handleExportExcel = () => {
    if (vouchers.length === 0) return;
    const today = new Date().toLocaleDateString("en-IN");
    const companyNameForExport =
      companyDetails?.name || companyName || "Company";
    const exportData = filteredVouchers.map((v) => ({
      Date: v.date,
      "Voucher No": v.voucherNumber,
      Customer: v.customerName,
      Amount: v.amount,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData, { origin: "A6" });
    addWorkbookHeader(XLSX, ws, {
      companyName: companyNameForExport,
      companyAddress,
      reportTitle: "Sales Voucher Report",
      generatedOn: today,
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
    XLSX.writeFile(wb, "Sales_Vouchers_Report.xlsx");
  };

  const handlePrint = () => {
    if (filteredVouchers.length === 0) {
      Swal.fire("Info", "No sales vouchers to print", "info");

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

      reportTitle: "Sales Voucher Report",

      generatedOn: today,
    });

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

      v.customerName,

      formatAmount(v.amount),
    ]);

    autoTable(doc, {
      startY: tableStartY,

      margin: {
        left: 14,
        right: 14,
      },

      tableWidth: "auto",

      head: [["#", "Date", "Voucher No.", "Customer Name", "Amount"]],

      body: tableData,

      foot: [["", "", "", "TOTAL", formatAmount(totalAmount)]],

      theme: "grid",

      styles: {
        fontSize: 9,

        overflow: "hidden",

        cellPadding: {
          top: 6,
          right: 6,
          bottom: 6,
          left: 6,
        },

        valign: "middle",

        textColor: [40, 40, 40],

        lineColor: [220, 220, 220],

        lineWidth: 0.4,
      },

      headStyles: {
        fillColor: [37, 99, 235],

        textColor: [255, 255, 255],

        fontStyle: "bold",

        fontSize: 10,

        halign: "center",

        valign: "middle",
      },

      bodyStyles: {
        fontSize: 9,
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

      didParseCell: (data) => {
        if (data.section === "head") {
          data.cell.styles.halign = "center";
        }

        if (data.section === "foot") {
          if (data.column.index === 3) {
            data.cell.styles.halign = "right";
          }

          if (data.column.index === 4) {
            data.cell.styles.halign = "right";
          }
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

      doc.text(`${company} • Sales Voucher Report`, 14, 290);

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
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/sale-voucher/single/${id}`,
      );
      setSelectedVoucher(res.data);
      setViewModalOpen(true);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load voucher details.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sales voucher?"))
      return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/sale-voucher/${id}`,
      );
      Swal.fire("Deleted!", "Voucher has been deleted.", "success");
      fetchVouchers();
    } catch {
      Swal.fire("Error", "Failed to delete voucher.", "error");
    }
  };

  useEffect(() => {
    if (companyId) {
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
          row["Voucher No"] || row["voucherNo"] || `SAL-${Date.now()}`;
        if (!grouped[vNo]) {
          grouped[vNo] = {
            date:
              row["Date"] ||
              row["date"] ||
              new Date().toISOString().split("T")[0],
            customer:
              row["Customer Name"] || row["customer"] || "Walk-in Customer",
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
        const ledgerObj = ledgersList.find(
          (l) =>
            String(l.name).trim().toLowerCase() ===
            String(v.customer).trim().toLowerCase(),
        );
        const gst_amount = (v.subtotal * v.gst_percentage) / 100;
        return {
          ...v,
          ledgerId: ledgerObj ? ledgerObj.id : null,
          gst_amount,
          grand_total: v.subtotal + gst_amount,
        };
      });

      if (vouchersPayload.length === 0) {
        Swal.fire("Error", "No valid vouchers found in sheet.", "error");
        return;
      }

      const missingLedgers = vouchersPayload
        .filter((v) => !v.ledgerId)
        .map((v) => v.customer);
      const uniqueMissing = [...new Set(missingLedgers)];

      if (uniqueMissing.length > 0) {
        const result = await Swal.fire({
          icon: "warning",
          title: "Ledgers Not Found",
          text: `The following Party Names were not found: ${uniqueMissing.join(", ")}.`,
          showCancelButton: true,
          confirmButtonText: "Create Missing Ledgers",
          cancelButtonText: "Cancel Import",
        });

        if (result.isConfirmed) {
          try {
            const groupRes = await axios.get(
              `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group/all/${companyId}`,
            );
            const groups = groupRes.data;
            const debtorsGroup = groups.find(
              (g) => g.groupName === "Sundry Debtors",
            );

            if (!debtorsGroup) {
              Swal.fire(
                "Error",
                "Sundry Debtors group not found in system.",
                "error",
              );
              return;
            }

            for (const name of uniqueMissing) {
              await axios.post(
                `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/create`,
                {
                  name: name,
                  under: JSON.stringify({
                    name: "Sundry Debtors",
                    id: debtorsGroup.id,
                  }),
                  mailingName: name,
                  openingBalance: 0,
                  state: "Not Applicable",
                  country: "India",
                  registrationType: "Regular",
                  companyId,
                },
              );
            }

            Swal.fire(
              "Success",
              `${uniqueMissing.length} Ledgers created. Retrying import...`,
              "success",
            );

            const ledgerRes = await axios.get(
              `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`,
            );
            const newLedgers = Array.isArray(ledgerRes.data)
              ? ledgerRes.data
              : ledgerRes.data.data || [];
            setLedgersList(newLedgers);

            vouchersPayload.forEach((v) => {
              if (!v.ledgerId) {
                const l = newLedgers.find(
                  (led) =>
                    String(led.name).trim().toLowerCase() ===
                    String(v.customer).trim().toLowerCase(),
                );
                if (l) v.ledgerId = l.id;
              }
            });
          } catch (err) {
            console.error(err);
            Swal.fire(
              "Error",
              "Failed to create ledgers automatically.",
              "error",
            );
            return;
          }
        } else {
          return;
        }
      }

      const finalValid = vouchersPayload.filter((v) => v.ledgerId);
      if (finalValid.length === 0) {
        Swal.fire("Error", "All vouchers are missing valid ledgers.", "error");
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/sale-voucher/bulk-create`,
        {
          companyId,
          vouchers: finalValid,
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
      v.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.voucherNumber
        .toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  const totalAmount = filteredVouchers.reduce((acc, v) => acc + v.amount, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-[Inter]">
      <div className="bg-blue-700 text-white p-4 rounded-t-xl shadow-md">
        <h1 className="text-xl font-semibold tracking-wide">
          List of Sales Vouchers
        </h1>
        <p className="text-sm text-blue-100">
          From {fromDate} to {toDate}
        </p>
      </div>

      <div className="bg-white shadow p-4 flex flex-wrap gap-4 justify-between items-center rounded-b-xl">
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-600" size={18} />
          <div className="flex gap-2 items-center">
            <label className="text-gray-700 text-sm">From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm"
            />

            <label className="text-gray-700 text-sm">To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm"
            />
          </div>
        </div>
        <div className="bg-[#005AB3] text-white px-5 py-3 shadow">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">
              List of Sales Vouchers
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
                    navigate(`${basePath}/salevoucher`);
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
        </div>{" "}
      </div>

      <div className="max-w-6xl mx-auto mt-6 bg-white shadow rounded-lg border border-gray-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-[#E6EEF8] border-b border-gray-300">
              <tr className="text-left text-gray-700">
                <th className="px-4 py-2 border-r">Date</th>
                <th className="px-4 py-2 border-r">Voucher No.</th>
                <th className="px-4 py-2 border-r">Customer Name</th>
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
                    <td className="px-4 py-2">{voucher.customerName}</td>
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
                          if (!voucher.pdfPath) {
                            Swal.fire(
                              "Info",
                              "No PDF available for this voucher.",
                              "info",
                            );
                            return;
                          }
                          const url = `${import.meta.env.VITE_ACCOUNTING_URL}/${voucher.pdfPath}`;
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
                    No vouchers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center bg-blue-50 border-t mt-4 p-4 rounded-xl shadow-inner">
          <div className="flex items-center gap-2 text-blue-700">
            <FileText size={18} />
            <span className="font-medium">
              Total Vouchers: {filteredVouchers.length}
            </span>
          </div>
          <div className="text-lg font-semibold text-blue-800">
            Total Amount: ₹{totalAmount.toLocaleString()}
          </div>
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
            <div className="flex items-center justify-between px-6 py-4 border-b bg-linear-to-r from-blue-700 to-blue-500 rounded-t-2xl">
              <div>
                <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest">
                  Sales Voucher
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
                  ["Customer", selectedVoucher.customer || "—"],
                  ["Invoice No", selectedVoucher.invoiceNo || "—"],
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
                    <MapPin size={12} /> Party Details
                  </p>
                  <div className="space-y-1.5 text-sm">
                    {[
                      ["Mailing Name", selectedVoucher.mailingName],
                      ["Address", selectedVoucher.address],
                      ["State", selectedVoucher.state],
                      ["Pincode", selectedVoucher.pincode],
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
                      [
                        "GST Amount",
                        `₹ ${Number(selectedVoucher.gst_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
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
                          <th className="px-4 py-2 text-right">Rate</th>
                          <th className="px-4 py-2 text-left">Per</th>
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
                              {item.item}
                            </td>
                            <td className="px-4 py-2 text-gray-500">
                              {item.hsn_code || "—"}
                            </td>
                            <td className="px-4 py-2 text-right">{item.qty}</td>
                            <td className="px-4 py-2 text-right">
                              ₹{" "}
                              {Number(item.rate).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-4 py-2 text-gray-500">
                              {item.per || "Nos"}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold text-gray-800">
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
                selectedVoucher.motorVehicleNo ||
                selectedVoucher.deliveryNoteNo) && (
                <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-3 flex items-center gap-1">
                    <Truck size={12} /> Dispatch Details
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {[
                      ["Delivery Note", selectedVoucher.deliveryNoteNo],
                      ["Dispatched Through", selectedVoucher.dispatchedThrough],
                      ["Destination", selectedVoucher.destination],
                      ["Vehicle No.", selectedVoucher.motorVehicleNo],
                      [
                        "Dispatch Date",
                        selectedVoucher.dispatchDate?.split("T")[0],
                      ],
                      ["Bill of Lading", selectedVoucher.billOfLading],
                      ["Carrier Name", selectedVoucher.carrierName],
                      ["Reference No.", selectedVoucher.referenceNo],
                      ["Buyer Order No.", selectedVoucher.buyerOrderNo],
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

export default ListOfSaleVoucher;
