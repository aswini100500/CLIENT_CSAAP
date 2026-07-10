













































































































































































































































import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import {
  FileDown,
  Trash2,
  Pencil,
  Eye,
  X,
  FileSpreadsheet,
  Printer,
  UserRound,
} from "lucide-react";
import autoTable from "jspdf-autotable";
import useAuth from "../../../hooks/useAuth";

const API_BASE = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger`;

const ListOfLedger = () => {
  const { user, role: userRole } = useAuth();
  const [ledgers, setLedgers] = useState([]);
  const [showEmployeeActivity, setShowEmployeeActivity] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  const { companyId, companyName, employees } = useCompany();
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

      const token =
        sessionStorage.getItem("accountingToken") ||
        sessionStorage.getItem("adminToken") ||
        sessionStorage.getItem("employeeToken") ||
        sessionStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/gst/sync`,
        {
          headers: {
            "x-tenant-slug": currentSlug,
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          withCredentials: true
        }
      );
      if (res.data && res.data.success) {

        setCompanyDetails({
          ...res.data.data,
          name: res.data.data.company_name,
          address: res.data.data.street_address
        });
      }
    } catch (err) {
      console.error("Error fetching company details:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/getUpdateHistory/${companyId}`
      );


      setHistory(res.data.rows || []);
    } catch (err) {

      setHistory([]);
    }
  };
  useEffect(() => {
    if (companyId) {
      fetchLedgers();
      fetchHistory();
      fetchCompanyDetails();
    }
  }, [companyId]);

  const updateField = (id, field, value) => {
    setLedgers((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, [field]: parseFloat(value) || 0 } : l
      )
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

      await axios.put(
        `${API_BASE}/update/${companyId}/${l.id}`,
        payload
      );

      alert("Ledger updated successfully!");

      fetchLedgers();
      fetchHistory();
    } catch (err) {
      console.error(err);
      alert("Failed to update ledger");
    }
  };

  const loggedInRole = userRole?.toLowerCase() || "admin";
  const loggedInEmployeeId = user?.employee_id || null;

  const filteredLedgers = ledgers.filter((l) => {
    if (loggedInRole === "employee") {
      return l.employee_id == loggedInEmployeeId && l.role?.toLowerCase() === 'employee';
    }
    const isCreatedByEmployee = l.employee_id && l.role?.toLowerCase() === 'employee';
    if (showEmployeeActivity) {
      return isCreatedByEmployee;
    } else {
      return !isCreatedByEmployee;
    }
  });

  const getEmployeeName = (id) => {
    const emp = employees?.find(e => e.id == id);
    return emp ? (emp.name || emp.first_name || "Employee") : "Unknown Employee";
  };

  const getGroupName = (underGroup) => {
    return underGroup || "-";
  };

  const getCompanyAddress = (comp) => {
    return comp?.address || "-";
  };

  const addWorkbookHeader = (XLSX, ws, options) => {
    XLSX.utils.sheet_add_aoa(ws, [
      [options.companyName],
      [options.companyAddress],
      [options.reportTitle],
      [`Generated on: ${options.generatedOn}`],
      []
    ], { origin: "A1" });
  };

  const handleExportPDF = () => {
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


    const totalOpening = filteredLedgers.reduce((sum, l) => sum + Number(l.openingBalance || 0), 0);
    const totalClosing = filteredLedgers.reduce((sum, l) => sum + Number(getClosingBalance(l) || 0), 0);

    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(`Total Ledgers: ${filteredLedgers.length}`, 14, 40);

    doc.setFont("helvetica", "bold");
    doc.text(`Total Closing: ${formatAmount(totalClosing)}`, 195, 40, { align: "right" });


    const tableData = filteredLedgers.map((l, i) => [
      i + 1,
      l.name || "-",
      getGroupName(l.underGroup),
      formatAmount(l.openingBalance),
      formatAmount(getClosingBalance(l)),
      l.balanceType === "Debit" ? "Dr" : "Cr",
    ]);

    autoTable(doc, {
      startY: 48,
      head: [["#", "Ledger Name", "Under Group", "Opening", "Closing", "Type"]],
      body: tableData,
      foot: [["", "", "TOTAL", formatAmount(totalOpening), formatAmount(totalClosing), ""]],
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
        1: { cellWidth: 55 },
        2: { cellWidth: 45 },
        3: { halign: "right", cellWidth: 28 },
        4: { halign: "right", cellWidth: 32, fontStyle: "bold" },
        5: { halign: "center", cellWidth: 15 }
      }
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
    const companyNameForExport = companyDetails?.name || companyName || "Company";
    const companyAddress = getCompanyAddress(companyDetails);

    const exportData = filteredLedgers.map(l => ({
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
      "IFSC Code": l.ifsc || "-"
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

      Swal.fire(
        "Info",
        "No ledgers to print",
        "info"
      );

      return;
    }

    const doc = new jsPDF(
      "p",
      "mm",
      "a4"
    );

    const company =
      (
        companyDetails?.name ||
        companyName ||
        "Company"
      ).toUpperCase();

    const today =
      new Date()
        .toLocaleDateString(
          "en-IN"
        );

    const formatAmount =
      (amount) => {

        const num =
          Number(amount || 0);

        const formatted =
          Math.abs(num)
            .toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            );

        return num < 0
          ? `-Rs. ${formatted}`
          : `Rs. ${formatted}`;
      };





    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(20);

    doc.setTextColor(
      15,
      23,
      42
    );

    doc.text(
      company,
      14,
      18
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(10);

    doc.setTextColor(
      100
    );

    doc.text(
      "Ledger Report",
      14,
      26
    );

    doc.setFontSize(8);

    doc.setTextColor(
      120
    );

    doc.text(
      `Generated on: ${today}`,
      195,
      18,
      {
        align: "right"
      }
    );

    doc.setDrawColor(
      220
    );

    doc.line(
      14,
      32,
      195,
      32
    );





    const totalOpening =
      filteredLedgers.reduce(
        (sum, l) =>
          sum +
          Number(
            l.openingBalance || 0
          ),
        0
      );

    const totalClosing =
      filteredLedgers.reduce(
        (sum, l) =>
          sum +
          Number(
            getClosingBalance(l) || 0
          ),
        0
      );

    doc.setFontSize(10);

    doc.setTextColor(
      40
    );

    doc.text(
      `Total Ledgers: ${filteredLedgers.length}`,
      14,
      40
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      `Total Closing: ${formatAmount(totalClosing)}`,
      195,
      40,
      {
        align: "right"
      }
    );





    const tableData =
      filteredLedgers.map(
        (l, i) => [

          i + 1,

          l.name || "-",

          getGroupName(
            l.underGroup
          ),

          formatAmount(
            l.openingBalance
          ),

          formatAmount(
            getClosingBalance(l)
          ),

          l.type === "Debit"
            ? "Dr"
            : "Cr",
        ]
      );





    autoTable(doc, {

      startY: 48,

      margin: {
        left: 10,
        right: 10,
      },

      tableWidth: "auto",

      head: [[
        "#",
        "Ledger Name",
        "Under Group",
        "Opening",
        "Closing",
        "Type"
      ]],

      body: tableData,

      foot: [[
        "",
        "",
        "TOTAL",
        formatAmount(
          totalOpening
        ),
        formatAmount(
          totalClosing
        ),
        ""
      ]],

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

        lineColor: [
          220,
          220,
          220
        ],

        lineWidth: 0.3,

        textColor: [
          40,
          40,
          40
        ],
      },

      bodyStyles: {

        overflow: "hidden",
      },

      headStyles: {

        fillColor: [
          37,
          99,
          235
        ],

        textColor: [
          255,
          255,
          255
        ],

        fontStyle: "bold",

        halign: "center",

        valign: "middle",

        fontSize: 9.5,
      },

      footStyles: {

        fillColor: [
          245,
          245,
          245
        ],

        textColor: [
          15,
          23,
          42
        ],

        fontStyle: "bold",

        fontSize: 9,
      },

      alternateRowStyles: {

        fillColor: [
          252,
          252,
          252
        ],
      },

      columnStyles: {



        0: {

          halign: "center",

          cellWidth: 12,
        },



        1: {

          halign: "left",

          cellWidth: 58,
        },



        2: {

          halign: "left",

          cellWidth: 42,
        },



        3: {

          halign: "right",

          cellWidth: 28,
        },



        4: {

          halign: "right",

          cellWidth: 35,

          fontStyle: "bold",
        },



        5: {

          halign: "center",

          cellWidth: 15,
        },
      },

      didParseCell:
        function (data) {



          if (
            data.section === "head"
          ) {

            data.cell.styles.halign =
              "center";
          }



          if (
            data.section === "foot" &&
            data.column.index === 2
          ) {

            data.cell.styles.halign =
              "right";
          }
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

      doc.setDrawColor(
        230
      );

      doc.line(
        14,
        285,
        195,
        285
      );

      doc.setFontSize(8);

      doc.setTextColor(
        120
      );

      doc.text(
        `${company} • Ledger Report`,
        14,
        290
      );

      doc.text(
        `Page ${i} of ${pageCount}`,
        195,
        290,
        {
          align: "right"
        }
      );
    }





    const blobURL =
      doc.output(
        "bloburl"
      );

    const printWindow =
      window.open(
        blobURL
      );

    printWindow.onload =
      () => {

        printWindow.focus();

        printWindow.print();
      };
  };

  const handleView = async (id) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/${id}`
      );

      const transRes = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/transaction/ledger/${companyId}/${id}`
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
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/${id}`
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
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "";


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
    <div className="min-h-screen bg-white p-6 font-[monospace]">
      <div className="max-w-7xl mx-auto border border-gray-300 rounded-md shadow bg-[#fffef7]">


        <div className="flex justify-between items-center border-b border-gray-300 py-3 px-4">
          <h2 className="text-xl font-semibold text-blue-800">List of Ledgers</h2>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-gray-600 text-white px-3 py-1.5 rounded border border-gray-500 hover:bg-gray-700 transition-colors text-sm font-medium shadow-sm"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={handleExportExcel}
              disabled={ledgers.length === 0}
              className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded border border-green-500 hover:bg-green-700 transition-colors text-sm font-medium shadow-sm disabled:opacity-50"
            >
              <FileSpreadsheet size={16} />
              Export Excel
            </button>
            <button
              onClick={handleExportPDF}
              disabled={filteredLedgers.length === 0}
              className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown size={16} />
              Export PDF
            </button>
            {loggedInRole !== "employee" && (
              <button
                onClick={() => setShowEmployeeActivity(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors text-sm font-medium shadow-sm ${showEmployeeActivity
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
              >
                <UserRound size={16} />
                {showEmployeeActivity ? "Back to Ledgers" : "Employee Activity"}
              </button>
            )}
            <Link
              to={loggedInRole === "employee" ? "/employee/hr/accounting/client/ledger" : "/accounting/client/ledger"}
              className="bg-blue-700 text-white px-3 py-1.5 rounded hover:bg-blue-800 transition-colors text-sm font-medium shadow-sm"
            >
              + Create New Ledger
            </Link>
          </div>


          {showViewModal && viewLedger && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-blue-700 text-white px-6 py-4 flex justify-between items-center rounded-t-xl">
                  <h3 className="text-xl font-bold">Ledger Details: {viewLedger.name}</h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-8 space-y-8">

                  <div>
                    <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider border-b border-blue-100 pb-2 mb-4">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                      <div className="flex justify-between border-b border-gray-50 pb-1">
                        <span className="text-gray-500">Ledger Name:</span>
                        <span className="font-semibold text-gray-800">{viewLedger.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-1">
                        <span className="text-gray-500">Alias:</span>
                        <span className="font-semibold text-gray-800">{viewLedger.aliasName || "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-1">
                        <span className="text-gray-500">Under Group:</span>
                        <span className="font-semibold text-blue-600">{getGroupName(viewLedger.underGroup)}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-1">
                        <span className="text-gray-500">Opening Balance:</span>
                        <span className="font-semibold text-gray-800">
                          Rs. {parseFloat(viewLedger.openingBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })} ({viewLedger.balanceType})
                        </span>
                      </div>
                    </div>
                  </div>


                  <div>
                    <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider border-b border-blue-100 pb-2 mb-4">Mailing & Contact Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                      <div className="flex justify-between border-b border-gray-50 pb-1">
                        <span className="text-gray-500">Mailing Name:</span>
                        <span className="font-semibold text-gray-800">{viewLedger.mailingName || "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-1">
                        <span className="text-gray-500">State:</span>
                        <span className="font-semibold text-gray-800">{viewLedger.state || "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-1">
                        <span className="text-gray-500">Country:</span>
                        <span className="font-semibold text-gray-800">{viewLedger.country || "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-1">
                        <span className="text-gray-500">Pincode:</span>
                        <span className="font-semibold text-gray-800">{viewLedger.pincode || "N/A"}</span>
                      </div>
                      <div className="md:col-span-2 flex flex-col border-b border-gray-50 pb-1">
                        <span className="text-gray-500 mb-1">Address:</span>
                        <span className="font-semibold text-gray-800 whitespace-pre-wrap">{viewLedger.address || "N/A"}</span>
                      </div>
                    </div>
                  </div>


                  <div>
                    <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider border-b border-blue-100 pb-2 mb-4">Tax & Registration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                      <div className="flex justify-between border-b border-gray-50 pb-1">
                        <span className="text-gray-500">PAN/IT No:</span>
                        <span className="font-semibold text-gray-800">{viewLedger.pan || "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-1">
                        <span className="text-gray-500">Registration Type:</span>
                        <span className="font-semibold text-gray-800">{viewLedger.registrationType || "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-1">
                        <span className="text-gray-500">GSTIN/UIN:</span>
                        <span className="font-semibold text-green-700">{viewLedger.gstin || "N/A"}</span>
                      </div>
                    </div>
                  </div>


                  {viewLedger.haveBankDetails === "Yes" && viewLedger.bankDetails ? (
                    <div>
                      <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider border-b border-blue-100 pb-2 mb-4">Bank Account Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Bank Name:</span>
                          <span className="font-bold text-gray-800">{viewLedger.bankDetails.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Branch:</span>
                          <span className="font-semibold text-gray-800">{viewLedger.bankDetails.branch}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Account No:</span>
                          <span className="font-bold text-gray-800 font-mono tracking-tighter">{viewLedger.bankDetails.accountNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">IFSC Code:</span>
                          <span className="font-semibold text-gray-800 uppercase font-mono">{viewLedger.bankDetails.ifsc}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider border-b border-blue-100 pb-2 mb-4">Bank Account Details</h4>
                      <p className="text-gray-500 italic">No bank details provided for this ledger.</p>
                    </div>
                  )}


                  <div>
                    <h4 className="text-sm font-bold text-[#1f4e79] uppercase tracking-wider border-b border-blue-100 pb-2 mb-4">Voucher Transactions (Ledger Statement)</h4>
                    {ledgerTransactions.length === 0 ? (
                      <p className="text-gray-500 italic text-sm">No transactions found for this ledger.</p>
                    ) : (
                      <div className="overflow-x-auto border border-gray-300 rounded shadow-sm">
                        <table className="w-full text-xs text-left border-collapse bg-white">
                          <thead className="bg-[#f0f4f8] border-b border-gray-300 font-bold text-gray-700">
                            <tr>
                              <th className="py-2 px-3 border-r border-gray-300">Date</th>
                              <th className="py-2 px-3 border-r border-gray-300">Particulars</th>
                              <th className="py-2 px-3 border-r border-gray-300">Voucher Type</th>
                              <th className="py-2 px-3 border-r border-gray-300">Voucher No.</th>
                              <th className="py-2 px-3 border-r border-gray-300">Narration</th>
                              <th className="py-2 px-3 border-r border-gray-300 text-right">Debit (Dr)</th>
                              <th className="py-2 px-3 text-right">Credit (Cr)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ledgerTransactions.map((t) => (
                              <tr key={t.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                <td className="py-2 px-3 border-r border-gray-300">{t.date ? t.date.split('T')[0] : "—"}</td>
                                <td className="py-2 px-3 border-r border-gray-300 font-semibold text-gray-800">{t.particulars || "—"}</td>
                                <td className="py-2 px-3 border-r border-gray-300 font-bold text-[#1f4e79]">{t.voucherType}</td>
                                <td className="py-2 px-3 border-r border-gray-300 font-medium">{t.voucherId}</td>
                                <td className="py-2 px-3 border-r border-gray-300 text-gray-600 italic">{t.narration || "—"}</td>
                                <td className="py-2 px-3 border-r border-gray-300 text-right font-semibold text-gray-800">
                                  {t.debit > 0 ? parseFloat(t.debit).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "—"}
                                </td>
                                <td className="py-2 px-3 text-right font-semibold text-gray-800">
                                  {t.credit > 0 ? parseFloat(t.credit).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className="sticky bottom-0 bg-gray-50 px-8 py-4 flex justify-end border-t border-gray-200 rounded-b-xl">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="bg-blue-700 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-800 transition-shadow shadow-md active:shadow-inner"
                  >
                    Close View
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <p className="text-center text-gray-500 py-6">Loading ledgers...</p>
        )}


        {!loading && filteredLedgers.length > 0 && (
          <table className="w-full text-sm border-collapse">
            <thead className="bg-[#f4f4f4] border-b border-gray-300">
              <tr className="text-left text-gray-700">
                <th className="py-2 px-3 border-r">#</th>
                <th className="py-2 px-3 border-r">Ledger Name</th>
                <th className="py-2 px-3 border-r">Alias</th>
                <th className="py-2 px-3 border-r">Under</th>
                <th className="py-2 px-3 border-r text-right">Opening</th>
                <th className="py-2 px-3 border-r text-center">Dr/Cr</th>
                <th className="py-2 px-3 border-r text-right">Debit</th>
                <th className="py-2 px-3 border-r text-right">Credit</th>
                <th className="py-2 px-3 border-r text-right">Closing</th>
                {showEmployeeActivity && <th className="py-2 px-3 border-r">Employee Name</th>}
                <th className="py-2 px-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredLedgers.map((l, idx) => (
                <tr key={l.id} className="hover:bg-blue-50 border-b transition">
                  <td className="py-2 px-3 border-r">{idx + 1}</td>

                  <td className="py-2 px-3 border-r">{l.name}</td>

                  <td className="py-2 px-3 border-r">{l.aliasName || "--"}</td>

                  <td className="py-2 px-3 border-r">{l.underGroup}</td>

                  <td className="py-2 px-3 border-r text-right">
                    {l.openingBalance}
                  </td>

                  <td className="py-2 px-3 border-r text-center">
                    {l.balanceType === "Debit" ? "Dr" : "Cr"}
                  </td>


                  <td className="py-2 px-3 border-r text-right">
                    {l.isEditing ? (
                      <input
                        type="number"
                        value={l.debit}
                        onChange={(e) =>
                          updateField(l.id, "debit", e.target.value)
                        }
                        className="w-20 text-right border rounded px-2"
                      />
                    ) : (
                      l.debit
                    )}
                  </td>


                  <td className="py-2 px-3 border-r text-right">
                    {l.isEditing ? (
                      <input
                        type="number"
                        value={l.credit}
                        onChange={(e) =>
                          updateField(l.id, "credit", e.target.value)
                        }
                        className="w-20 text-right border rounded px-2"
                      />
                    ) : (
                      l.credit
                    )}
                  </td>


                  <td className="py-2 px-3 border-r text-right font-medium">
                    {getClosingBalance(l).toFixed(2)}
                  </td>

                  {showEmployeeActivity && (
                    <td className="py-2 px-3 border-r text-gray-700 font-medium">
                      {getEmployeeName(l.employee_id)}
                    </td>
                  )}

                  <td className="px-3 py-2">
                    <div className="flex gap-2">

                      <button
                        onClick={() => handleView(l.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => enableEdit(l.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(l.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}




        <div className="mt-12 p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Ledger Update History
          </h3>

          {history.length === 0 ? (
            <p className="text-gray-500 text-sm">No update history found.</p>
          ) : (
            <table className="w-full text-sm border-collapse border">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="py-2 px-3 border">Ledger</th>
                  <th className="py-2 px-3 border text-right">Opening</th>
                  <th className="py-2 px-3 border text-right">Debit</th>
                  <th className="py-2 px-3 border text-right">Credit</th>
                  <th className="py-2 px-3 border text-right">Closing</th>
                  <th className="py-2 px-3 border text-center">Date</th>
                </tr>
              </thead>

              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 border">{h.ledgerName}</td>

                    <td className="py-2 px-3 border text-right">
                      {h.openingBalance}
                    </td>

                    <td className="py-2 px-3 border text-right">{h.debit}</td>

                    <td className="py-2 px-3 border text-right">{h.credit}</td>

                    <td className="py-2 px-3 border text-right">
                      {h.closingBalance}
                    </td>

                    <td className="py-2 px-3 border text-center">
                      {new Date(h.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default ListOfLedger;



