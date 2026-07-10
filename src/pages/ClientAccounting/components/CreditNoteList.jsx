


















































































































                  <th className="border p-2 text-center">Actions</th>





































































import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import { Download, Edit, Trash2, FileDown, FileSpreadsheet, Printer, Eye, X, Clock, Calendar, FileText, Building2, CheckCircle, XCircle, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addReportHeader, addWorkbookHeader, getCompanyAddress } from "../utils/exportReportUtils";

const API = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/notes`;

const NoteDetailModal = ({ note, items, onClose }) => {
  if (!note) return null;

  const fmt = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const statusBadgeStyle = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-50 text-green-700 border-green-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-[#fbf7f0] text-[#a16207] border-[#f3e8d2]";
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle size={12} className="text-green-600" />;
      case "Rejected":
        return <XCircle size={12} className="text-red-600" />;
      default:
        return <Clock size={12} className="text-[#a16207]" />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-10 overflow-y-auto">
      <div className="bg-white rounded-xl border border-gray-200 w-full max-w-3xl shadow-xl my-8">


        <div className="flex justify-between items-start px-6 py-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900 capitalize">
                {note.note_type} Note Details
              </h2>
              <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusBadgeStyle(note.status)}`}>
                {statusIcon(note.status)}
                {note.status || "Pending"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1">
                <FileText size={14} className="text-gray-400" />
                {note.voucherNo || `Note-${note.id}`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={14} className="text-gray-400" />
                {note.date ? new Date(note.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building2 size={14} className="text-gray-400" />
                {note.partyLedgerName || note.PartyLedger || "—"}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 border border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm transition">
            <X size={18} className="text-gray-600" />
          </button>
        </div>


        <div className="px-6 py-4">
          <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Party & Ledger</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#faf9f5] rounded-xl p-4 border border-[#f3f0e8]/50">
              <p className="text-xs text-gray-500 mb-1">Party ledger</p>
              <p className="text-base font-semibold text-gray-900">{note.partyLedgerName || note.PartyLedger || "—"}</p>
            </div>
            <div className="bg-[#faf9f5] rounded-xl p-4 border border-[#f3f0e8]/50">
              <p className="text-xs text-gray-500 mb-1">Purchase / sales ledger</p>
              <p className="text-base font-semibold text-gray-900">{note.purchaseLedgerName || note.PurchaseLedger || "—"}</p>
            </div>
          </div>
        </div>


        <div className="px-6 py-4">
          <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">Billing & Dispatch</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">


            <div className="bg-[#faf9f5] rounded-xl p-4 border border-[#f3f0e8]/50">
              <h4 className="text-xs font-semibold text-blue-600 mb-3">Party / Billing Details</h4>
              <div className="space-y-2 text-xs leading-relaxed text-gray-800">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-medium">Mailing Name</span>
                  <span className="font-semibold">{note.mailingName || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-medium">Address</span>
                  <span className="font-semibold wrap-break-word">{note.address || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-medium">State</span>
                  <span className="font-semibold">{note.state || "—"} {note.country ? `(${note.country})` : ""}</span>
                </div>
                {note.gstin && (
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-medium">GSTIN</span>
                    <span className="font-semibold font-mono">{note.gstin}</span>
                  </div>
                )}
              </div>
            </div>


            <div className="bg-[#faf9f5] rounded-xl p-4 border border-[#f3f0e8]/50">
              <h4 className="text-xs font-semibold text-blue-600 mb-3">Consignee (Ship To)</h4>
              <div className="space-y-2 text-xs leading-relaxed text-gray-800">
                {note.consigneeSameAsBilling ? (
                  <div className="text-gray-500 italic py-2">Same as Party / Billing Details</div>
                ) : (
                  <>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-medium">Name</span>
                      <span className="font-semibold">{note.consigneeName || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-medium">Address</span>
                      <span className="font-semibold wrap-break-word">{note.consigneeAddress || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-medium">State</span>
                      <span className="font-semibold">{note.consigneeState || "—"}</span>
                    </div>
                    {note.consigneeGSTIN && (
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-medium">GSTIN</span>
                        <span className="font-semibold font-mono">{note.consigneeGSTIN}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>


            <div className="bg-[#faf9f5] rounded-xl p-4 border border-[#f3f0e8]/50">
              <h4 className="text-xs font-semibold text-blue-600 mb-3">Invoice & Order Info</h4>
              <div className="space-y-2 text-xs leading-relaxed text-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-400">Original Invoice No.</span>
                  <span className="font-semibold">{note.paymentTerms || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Original Invoice Date</span>
                  <span className="font-semibold">{formatDate(note.deliveryNoteDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Buyer Order No.</span>
                  <span className="font-semibold">{note.buyerOrderNo || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Date</span>
                  <span className="font-semibold">{formatDate(note.buyerOrderDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reference No.</span>
                  <span className="font-semibold">{note.referenceNo || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reference Date</span>
                  <span className="font-semibold">{formatDate(note.referenceDate)}</span>
                </div>
              </div>
            </div>


            <div className="bg-[#faf9f5] rounded-xl p-4 border border-[#f3f0e8]/50 lg:col-span-2">
              <h4 className="text-xs font-semibold text-blue-600 mb-3">Dispatch details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs text-gray-800">

                <div className="flex justify-between">
                  <span className="text-gray-400">Dispatch Doc No.</span>
                  <span className="font-semibold">{note.dispatchDocNo || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dispatched Through</span>
                  <span className="font-semibold">{note.dispatchedThrough || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Destination</span>
                  <span className="font-semibold">{note.destination || "—"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Other Reference</span>
                  <span className="font-semibold">{note.otherReferences || "—"}</span>
                </div>
              </div>
            </div>


            <div className="bg-[#faf9f5] rounded-xl p-4 border border-[#f3f0e8]/50">
              <h4 className="text-xs font-semibold text-blue-600 mb-3">Terms of Delivery</h4>
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                {note.termsOfDelivery || "—"}
              </p>
            </div>

          </div>
        </div>


        <div className="px-6 py-4">
          <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Items</h3>
          <div className="overflow-hidden border border-gray-100 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-center w-10">#</th>
                  <th className="px-4 py-3">Item Name</th>
                  <th className="px-4 py-3 text-center">HSN</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Rate</th>
                  <th className="px-4 py-3 text-right">Disc.</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50/80 transition">
                    <td className="px-4 py-3 text-center text-gray-400 font-medium">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.itemName || "—"}</td>
                    <td className="px-4 py-3 text-center text-gray-500 font-mono">{item.hsn_code || "—"}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-950">{item.qty} {item.per || "pcs"}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700">₹{fmt(item.rate)}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-500">{item.discount ? `${item.discount}%` : "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold font-mono text-gray-950">₹{fmt(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1 min-w-50">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Narration</p>
            <p className="text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-100 italic leading-relaxed shadow-sm">
              {note.narration || "No narration provided."}
            </p>
          </div>
          <div className="w-full md:w-80 space-y-2.5 text-xs text-gray-700 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-mono font-medium">₹{fmt(note.subtotal)}</span>
            </div>
            {note.cgst_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">CGST ({note.cgst_rate}%)</span>
                <span className="font-mono font-medium">₹{fmt(note.cgst_amount)}</span>
              </div>
            )}
            {note.sgst_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">SGST ({note.sgst_rate}%)</span>
                <span className="font-mono font-medium">₹{fmt(note.sgst_amount)}</span>
              </div>
            )}
            {note.igst_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">IGST ({note.igst_rate}%)</span>
                <span className="font-mono font-medium">₹{fmt(note.igst_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-blue-600 border-t border-dashed border-gray-200 pt-2.5">
              <span>Grand Total</span>
              <span className="font-mono text-base">₹{fmt(note.grand_total)}</span>
            </div>
          </div>
        </div>


        <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-white rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-600 font-semibold text-sm rounded-lg transition shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

const CreditNoteList = () => {
  const [creditNotes, setCreditNotes] = useState([]);
  const [showEmployeeActivity, setShowEmployeeActivity] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
  const { companyId, companyName, employees } = useCompany();

  const getEmployeeName = (id) => {
    const emp = employees?.find(e => e.id == id);
    return emp ? (emp.name || emp.first_name || "Employee") : "Unknown Employee";
  };

  const navigate = useNavigate();
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const { user, role } = useAuth();
  const loggedInRole = role?.toLowerCase() || "admin";
  const loggedInEmployeeId = user?.employee_id || null;

  const filteredCreditNotes = creditNotes.filter((n) => {
    if (loggedInRole === "employee") {
      if (n.employee_id != loggedInEmployeeId || n.role?.toLowerCase() !== 'employee') return false;
    } else {
      const isCreatedByEmployee = n.employee_id && n.role?.toLowerCase() === 'employee';
      if (showEmployeeActivity) {
        if (!isCreatedByEmployee) return false;
      } else {
        if (isCreatedByEmployee) return false;
      }
    }
    return true;
  });

const handlePrint = () => {

  if (filteredCreditNotes.length === 0) {

    Swal.fire(
      "Info",
      "No data to print",
      "info"
    );

    return;
  }

  const doc = new jsPDF();

  const today =
    new Date().toLocaleDateString(
      "en-IN"
    );

  const companyNameForExport =
    companyDetails?.name ||
    companyName ||
    "Company";

  const companyAddress =
    getCompanyAddress(
      companyDetails
    );

  const totalAmount =
    filteredCreditNotes.reduce(
      (acc, n) =>
        acc +
        Number(
          n.grand_total || 0
        ),
      0
    );

  const formatAmount =
    (amount) =>
      `Rs. ${Number(
        amount || 0
      ).toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`;

  const {
    company,
    summaryY,
    tableStartY,
  } = addReportHeader(doc, {

    companyName:
      companyNameForExport,

    companyAddress,

    reportTitle:
      "Credit Note Report",

    generatedOn: today,
  });

  doc.setFontSize(10);

  doc.setTextColor(40);

  doc.text(
    `Total Notes: ${filteredCreditNotes.length}`,
    14,
    summaryY
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.text(
    `Total Amount: ${formatAmount(totalAmount)}`,
    195,
    summaryY,
    { align: "right" }
  );

  autoTable(doc, {

    startY: tableStartY,

    head: [[
      "#",
      "Date",
      "Voucher No.",
      "Party",
      "Amount",
      "Status",
    ]],

    body:
      filteredCreditNotes.map(
        (n, index) => [
          index + 1,

          n.date
            ? new Date(
                n.date
              ).toLocaleDateString(
                "en-IN"
              )
            : "-",

          n.voucherNo ||
            n.id,

          n.PartyLedger ||
            "-",

          formatAmount(
            n.grand_total
          ),

          n.status ||
            "Pending",
        ]
      ),

    foot: [[
      "",
      "",
      "",
      "TOTAL",
      formatAmount(
        totalAmount
      ),
      "",
    ]],

    theme: "striped",

    styles: {
      fontSize: 9,
      cellPadding: 5,
      valign: "middle",
    },

    headStyles: {
      fillColor: [
        37, 99, 235,
      ],
      textColor: [
        255, 255, 255,
      ],
      fontStyle: "bold",
      halign: "center",
    },

    footStyles: {
      fillColor: [
        240, 240, 240,
      ],
      textColor: [
        15, 23, 42,
      ],
      fontStyle: "bold",
    },

    columnStyles: {
      0: {
        halign: "center",
        cellWidth: 12,
      },
      4: {
        halign: "right",
        cellWidth: 35,
      },
    },
  });

  const pageCount =
    doc.internal.getNumberOfPages();

  for (
    let i = 1;
    i <= pageCount;
    i++
  ) {

    doc.setPage(i);

    doc.setDrawColor(230);

    doc.line(
      14,
      285,
      195,
      285
    );

    doc.setFontSize(8);

    doc.setTextColor(120);

    doc.text(
      `${company} - Credit Note Report`,
      14,
      290
    );

    doc.text(
      `Page ${i} of ${pageCount}`,
      195,
      290,
      {
        align: "right",
      }
    );
  }



  const blobURL =
    doc.output("bloburl");

  const printWindow =
    window.open(blobURL);

  printWindow.onload =
    () => {

      printWindow.focus();

      printWindow.print();
    };
};

  const fetchCompanyDetails = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/company/${companyId}`);
      setCompanyDetails(res.data);
    } catch (err) {
      console.error("Error fetching company details:", err);
    }
  };

  const handleExportExcel = () => {
    if (filteredCreditNotes.length === 0) {
      Swal.fire("Info", "No data to export", "info");
      return;
    }
    const today = new Date().toLocaleDateString("en-IN");
    const companyNameForExport = companyDetails?.name || companyName || "Company";
    const companyAddress = getCompanyAddress(companyDetails);
    const exportData = filteredCreditNotes.map(n => ({
      "Voucher No": n.voucherNo,
      Date: n.date,
      Party: n.PartyLedger,
      Amount: n.grand_total,
      Status: n.status || "Pending"
    }));
    const ws = XLSX.utils.json_to_sheet(exportData, { origin: "A6" });
    addWorkbookHeader(XLSX, ws, {
      companyName: companyNameForExport,
      companyAddress,
      reportTitle: "Credit Note Report",
      generatedOn: today,
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CreditNotes");
    XLSX.writeFile(wb, "Credit_Notes_Report.xlsx");
  };

  const handleExportPDF = () => {
    if (filteredCreditNotes.length === 0) {
      Swal.fire("Info", "No data to export", "info");
      return;
    }

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("en-IN");
    const companyNameForExport = companyDetails?.name || companyName || "Company";
    const companyAddress = getCompanyAddress(companyDetails);
    const totalAmount = filteredCreditNotes.reduce((acc, n) => acc + Number(n.grand_total || 0), 0);
    const formatAmount = (amount) =>
      `Rs. ${Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    const { company, summaryY, tableStartY } = addReportHeader(doc, {
      companyName: companyNameForExport,
      companyAddress,
      reportTitle: "Credit Note Report",
      generatedOn: today,
    });

    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(`Total Notes: ${filteredCreditNotes.length}`, 14, summaryY);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: ${formatAmount(totalAmount)}`, 195, summaryY, { align: "right" });

    autoTable(doc, {
      startY: tableStartY,
      head: [["#", "Date", "Voucher No.", "Party", "Amount", "Status"]],
      body: filteredCreditNotes.map((n, index) => [
        index + 1,
        n.date ? new Date(n.date).toLocaleDateString("en-IN") : "-",
        n.voucherNo || n.id,
        n.PartyLedger || "-",
        formatAmount(n.grand_total),
        n.status || "Pending",
      ]),
      foot: [["", "", "", "TOTAL", formatAmount(totalAmount), ""]],
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 5, valign: "middle" },
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
      footStyles: { fillColor: [240, 240, 240], textColor: [15, 23, 42], fontStyle: "bold" },
      columnStyles: { 0: { halign: "center", cellWidth: 12 }, 4: { halign: "right", cellWidth: 35 } },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(230);
      doc.line(14, 285, 195, 285);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`${company} - Credit Note Report`, 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" });
    }

    doc.save(`Credit_Notes_Report_${today}.pdf`);
  };


  useEffect(() => {
    if (companyId) {
      fetchCreditNotes();
      fetchCompanyDetails();
    }
  }, [companyId]);

  const fetchCreditNotes = async () => {
    try {
      const res = await axios.get(`${API}/getAllCreditNotes/${companyId}`);
      console.log(res);

      setCreditNotes(res.data.data || []);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to fetch credit notes!", "error");
    }
  };


  const _handleAccept = async (id) => {
    Swal.fire({
      title: "Accept Credit Note?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Accept",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.patch(`${API}/updateCreditNoteStatus/${id}`, {
            status: "Accepted",
          });

          fetchCreditNotes();
          Swal.fire("Success", "Credit Note accepted!", "success");
        } catch {
          Swal.fire("Error", "Failed to accept!", "error");
        }
      }
    });
  };


  const _handleReject = async (id) => {
    Swal.fire({
      title: "Reject Credit Note?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Reject",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.patch(`${API}/updateCreditNoteStatus/${id}`, {
            status: "Rejected",
          });

          fetchCreditNotes();
          Swal.fire("Rejected", "Credit Note rejected!", "success");
        } catch {
          Swal.fire("Error", "Failed to reject!", "error");
        }
      }
    });
  };


  const handleDelete = async (id) => {
    Swal.fire({
      title: "Delete Credit Note?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/notes/delete/${id}`);
          fetchCreditNotes();
          Swal.fire("Deleted!", "Credit Note deleted!", "success");
        } catch (err) {
          console.error("Delete Error:", err);
          Swal.fire("Error", "Failed to delete credit note", "error");
        }
      }
    });
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/notes/single/${id}`);
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to fetch details");
      }
      setSelectedNote(res.data.note);
      setSelectedItems(res.data.items);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to fetch note details.", "error");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-4 border">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h1 className="text-2xl font-semibold">Credit Notes List</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white text-[12px] font-medium rounded hover:bg-gray-700 transition shadow-sm"
            >
              <Printer size={16} />
              <span>Print</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-[12px] font-medium rounded hover:bg-blue-700 transition shadow-sm"
            >
              <FileSpreadsheet size={16} />
              <span>Export Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-[12px] font-medium rounded hover:bg-green-700 transition shadow-sm"
            >
              <FileDown size={16} />
              <span>Export PDF</span>
            </button>
            {loggedInRole !== "employee" && (
              <button
                onClick={() => setShowEmployeeActivity(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all text-[12px] font-medium shadow-sm border ${
                  showEmployeeActivity 
                    ? "bg-slate-900 text-white border-slate-900" 
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <UserRound size={15} />
                {showEmployeeActivity ? "Back to Notes" : "Employee Activity"}
              </button>
            )}
          </div>
        </div>

        <table className="w-full border text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2 text-left">Voucher No</th>
              <th className="border p-2 text-left">Date</th>
              <th className="border p-2 text-left">Party</th>
              <th className="border p-2 text-right">Amount</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCreditNotes.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  No Credit Notes Found
                </td>
              </tr>
            ) : (
              filteredCreditNotes.map((note) => (
                <tr key={note.id}>
                  <td className="border p-2">{note.voucherNo}</td>
                  <td className="border p-2">{note.date ? new Date(note.date).toLocaleDateString() : "-"}</td>
                  <td className="border p-2">{note.PartyLedger}</td>
                  <td className="border p-2 text-right">
                    ₹ {Number(note.grand_total || 0).toFixed(2)}
                  </td>
                  {showEmployeeActivity && (
                        <td className="px-4 py-2 truncate max-w-37.5">
                          {getEmployeeName(note.employee_id)}
                        </td>
                      )}
                      <td className="border p-2 text-center flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleViewDetails(note.id)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const res = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/notes/generate-pdf/${note.id}`);
                          if (res.data.success) {
                            window.open(`${import.meta.env.VITE_ACCOUNTING_URL}${res.data.pdfPath}`, "_blank");
                          }
                        } catch (error) {
                          console.error("Error generating PDF:", error);
                          Swal.fire("Error", "Could not generate PDF", "error");
                        }
                      }}
                      className="text-green-600 hover:text-green-800 transition"
                      title="Download PDF"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => navigate(`/accounting/client/creditNote/${note.id}`)}
                      className="p-1 text-blue-600 hover:text-blue-800 transition"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <NoteDetailModal
        note={selectedNote}
        items={selectedItems}
        onClose={() => {
          setSelectedNote(null);
          setSelectedItems([]);
        }}
      />
    </div>
  );
};

export default CreditNoteList;
