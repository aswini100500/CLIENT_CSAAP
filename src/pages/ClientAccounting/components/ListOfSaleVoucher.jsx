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
import BulkImportButton from "./BulkImportButton";
import SaleVoucherDetailModal from "./SaleVoucherDetailModal";

const ListOfSaleVoucher = () => {
  const { user, role, companyId, companyName } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [ledgersList, setLedgersList] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");

  const Api = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/sale-voucher`;
  const navigate = useNavigate();

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${Api}/${companyId}/all`);
      const rawData = res.data?.data || [];
      setVouchers(rawData.sort((a, b) => (b.id || 0) - (a.id || 0)));
    } catch (err) {
      console.error("Failed to fetch sale vouchers", err);
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
      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`,
      );
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

  const loggedInRole = role?.toLowerCase() || "admin";
  const loggedInEmployeeId = user?.employee_id || null;

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
    const customerStr = (v.customer || v.customerName || "")
      .toString()
      .toLowerCase();
    const voucherNoStr = (
      v.invoiceNo ||
      v.voucherNo ||
      v.voucherNumber ||
      v.id ||
      ""
    )
      .toString()
      .toLowerCase();
    const narrationStr = (v.narration || "").toString().toLowerCase();
    const amountStr = (v.grand_total || v.totalAmount || v.amount || "")
      .toString()
      .toLowerCase();

    return (
      customerStr.includes(query) ||
      voucherNoStr.includes(query) ||
      narrationStr.includes(query) ||
      amountStr.includes(query)
    );
  });

  const sortedVouchers = [...filteredVouchers].sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt || 0).getTime();
    const dateB = new Date(b.date || b.createdAt || 0).getTime();
    if (dateA !== dateB) {
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    }
    return sortOrder === "desc"
      ? Number(b.id || 0) - Number(a.id || 0)
      : Number(a.id || 0) - Number(b.id || 0);
  });

  const totalAmount = sortedVouchers.reduce((acc, v) => {
    const amt = parseFloat(v.grand_total || v.totalAmount || v.amount || 0);
    return acc + amt;
  }, 0);

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
    doc.text("Sales Voucher Report", 14, 26);

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
      v.invoiceNo || v.voucherNo || v.voucherNumber || v.id || "-",
      v.customer || v.customerName || "-",
      formatAmount(v.grand_total || v.totalAmount || v.amount),
      v.narration || "-",
    ]);

    autoTable(doc, {
      startY: summaryY + 8,
      head: [
        [
          "#",
          "Date",
          "Invoice / Voucher No.",
          "Customer Name",
          "Amount",
          "Narration",
        ],
      ],
      body: tableData,
      foot: [["", "", "", "TOTAL", formatAmount(totalAmount), ""]],
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
        2: { cellWidth: 35 },
        3: { cellWidth: 45 },
        4: { halign: "right", cellWidth: 30 },
        5: { cellWidth: 35 },
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
      doc.save(`Sales_Voucher_Report_${today}.pdf`);
    }
  };

  const handleExportPDF = () => generatePDF(false);
  const handlePrint = () => generatePDF(true);

  const handleExportExcel = () => {
    if (sortedVouchers.length === 0) return;
    const company = companyDetails?.name || companyName || "Company";
    const today = new Date().toLocaleDateString("en-IN");
    const exportData = sortedVouchers.map((v, index) => ({
      "S.No": index + 1,
      Date: v.date ? new Date(v.date).toLocaleDateString("en-IN") : "-",
      "Invoice / Voucher No":
        v.invoiceNo || v.voucherNo || v.voucherNumber || v.id,
      Customer: v.customer || v.customerName || "-",
      Amount: Number(v.grand_total || v.totalAmount || v.amount || 0),
      Narration: v.narration || "-",
    }));

    const headerRows = [
      [`Company Name: ${company}`],
      [`Report: Sales Vouchers`],
      [`Generated On: ${today}`],
      [],
    ];
    const ws = XLSX.utils.aoa_to_sheet(headerRows);
    XLSX.utils.sheet_add_json(ws, exportData, { origin: "A5" });
    ws["!cols"] = [
      { wch: 8 },
      { wch: 14 },
      { wch: 22 },
      { wch: 30 },
      { wch: 16 },
      { wch: 30 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Vouchers");
    XLSX.writeFile(wb, "Sales_Vouchers_Report.xlsx");
  };

  const handleEdit = (id) => {
    const editPath =
      loggedInRole === "employee"
        ? `/employee/hr/accounting/client/salevoucher/${id}`
        : `/accounting/client/salevoucher/${id}`;
    navigate(editPath);
  };

  const handleViewDetails = async (v) => {
    try {
      const res = await axios.get(`${Api}/single/${v.id}`);
      setSelectedVoucher(res.data);
    } catch (err) {
      console.error("Error fetching voucher details:", err);
      setSelectedVoucher(v);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Sales Voucher?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${Api}/${id}`);
        Swal.fire({
          icon: "success",
          title: "Deleted Successfully",
          text: "Sales voucher has been deleted.",
          timer: 1800,
          showConfirmButton: false,
        });
        fetchVouchers();
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire("Error", "Failed to delete sales voucher.", "error");
      }
    }
  };

  const handleDownloadPDF = (v) => {
    if (v.pdf_path || v.pdfPath) {
      const pdfPath = v.pdf_path || v.pdfPath;
      const url = `${import.meta.env.VITE_ACCOUNTING_URL}/${pdfPath}`;
      window.open(url, "_blank");
    } else {
      Swal.fire("Info", "No PDF available for this sales voucher.", "info");
    }
  };

  const createPath =
    loggedInRole === "employee"
      ? "/employee/hr/accounting/client/salevoucher"
      : "/accounting/client/salevoucher";

  return (
    <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans">
      <div className="max-w-7xl mx-auto app-panel overflow-hidden border border-[#e2f2e9] bg-white">
        <div className="flex flex-wrap justify-between items-center app-section-bar py-5 px-6 border-b border-[#e2f2e9] gap-4 bg-white">
          <h2 className="app-title text-xl font-extrabold text-[#042f2e]">
            List of Sales Vouchers
          </h2>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Customer / Voucher No..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-3 py-2 text-[13px] bg-white border border-[#e2f2e9] rounded-xl focus:outline-none focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] transition-all placeholder:text-slate-400"
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <BulkImportButton onDataParsed={handleBulkImport} />

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
              + Create Sales Voucher
            </Link>
          </div>
        </div>

        {loading && (
          <p className="text-center text-slate-500 py-10">
            Loading sales vouchers...
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
                    Customer Name
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
                {sortedVouchers.map((v, idx) => (
                  <tr
                    key={v.id}
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
                      {v.invoiceNo || v.voucherNo || v.voucherNumber || v.id}
                    </td>
                    <td className="py-3 px-4 border-r border-[#e2f2e9] font-semibold text-slate-800 text-[13px]">
                      {v.customer || v.customerName || "-"}
                    </td>
                    <td className="py-3 px-4 border-r border-[#e2f2e9] text-right font-bold text-[#042f2e] text-[13px] whitespace-nowrap">
                      {Number(
                        v.grand_total || v.totalAmount || v.amount || 0,
                      ).toLocaleString("en-IN", {
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
                          onClick={() => handleViewDetails(v)}
                          title="View Sales Voucher Details"
                          className="text-slate-400 hover:text-[#00a651] p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(v.id)}
                          title="Edit Sales Voucher"
                          className="text-slate-400 hover:text-amber-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          title="Delete Sales Voucher"
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
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredVouchers.length === 0 && (
          <div className="px-4 py-12 text-center">
            <SearchX className="size-10 mx-auto mb-3 text-slate-400" />
            <p className="text-[14px] font-bold text-[#042f2e]">
              No sales vouchers found
            </p>
            <p className="text-[13px] mt-1 text-slate-500">
              Try adjusting your search criteria or create a new sales voucher.
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
        <SaleVoucherDetailModal
          voucher={selectedVoucher}
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

export default ListOfSaleVoucher;
