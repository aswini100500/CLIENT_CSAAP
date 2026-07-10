import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import { Trash2, Pencil, FileDown, FileSpreadsheet, Printer, UserRound } from "lucide-react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useAuth from "../../../hooks/useAuth";

const ListOfGroups = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmployeeActivity, setShowEmployeeActivity] = useState(false);
  
  const { companyId, companyName } = useCompany();
  const API = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group`;


  const demoGroups = [
    {
      groupName: "Sundry Debtors",
      alias: "Debtors",
      under: "Current Assets",
      nature: "Asset",
      subLedger: "Yes",
    },
    {
      groupName: "Sundry Creditors",
      alias: "Creditors",
      under: "Current Liabilities",
      nature: "Liability",
      subLedger: "Yes",
    },
    {
      groupName: "Bank Accounts",
      alias: "Banks",
      under: "Current Assets",
      nature: "Asset",
      subLedger: "Yes",
    },
    {
      groupName: "Direct Expenses",
      alias: "Expenses",
      under: "Expenses",
      nature: "Expense",
      subLedger: "No",
    },
    {
      groupName: "Sales Account",
      alias: "Sales",
      under: "Revenue Accounts",
      nature: "Income",
      subLedger: "No",
    },
  ];

  const fetchData = async () => {
    if (!companyId) return;
    setLoading(true);
    try {

      const res = await axios.get(`${API}/all/${companyId}`);
      if (res.data && res.data.length > 0) {
        setGroups(res.data);
        localStorage.setItem("tallyGroups", JSON.stringify(res.data));
      } else {
        throw new Error("No backend data");
      }
    } catch (err) {
      console.log("Backend failed → Using localStorage/demo data");


      const storedGroups = JSON.parse(localStorage.getItem("tallyGroups"));

      if (storedGroups && storedGroups.length > 0) {
        setGroups(storedGroups);
      } else {

        localStorage.setItem("tallyGroups", JSON.stringify(demoGroups));
        setGroups(demoGroups);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  const handleDelete = async (id) => {
    if (!id) {
      Swal.fire("Error", "Cannot delete default/demo groups from backend.", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Deleting this group may affect dependent ledgers!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`${API}/${companyId}/${id}`);
        if (res.data) {
          Swal.fire("Deleted!", "Group has been deleted.", "success");
          fetchData();
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to delete group. It might be in use.", "error");
      }
    }
  };

  const loggedInRole = role?.toLowerCase() || "admin";
  const loggedInEmployeeId = user?.employee_id || null;

  const filteredGroups = groups.filter((g) => {
    if (loggedInRole === "employee") {
      return g.employee_id == loggedInEmployeeId && g.role?.toLowerCase() === 'employee';
    }
    const isCreatedByEmployee = g.employee_id && g.role?.toLowerCase() === 'employee';
    if (showEmployeeActivity) {
      return isCreatedByEmployee;
    } else {
      return !isCreatedByEmployee;
    }
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("en-IN");


    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text("ACCOUNTING GROUPS REPORT", 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("List of Accounting Groups Summary", 14, 26);

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Generated on: ${today}`, 195, 18, { align: "right" });

    doc.setDrawColor(220);
    doc.line(14, 32, 195, 32);


    const tableData = filteredGroups.map((g, i) => [
      i + 1,
      g.groupName || "-",
      g.alias || "-",
      g.under || "-",
      g.nature || "-",
      g.subLedger || "No"
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["#", "Group Name", "Alias", "Under", "Nature", "Sub-Ledger"]],
      body: tableData,
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 3, valign: "middle" },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 40 },
        4: { cellWidth: 30 },
        5: { halign: "center", cellWidth: 25 }
      }
    });


    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(230);
      doc.line(14, 285, 195, 285);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text("Accounting Groups", 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" });
    }

    doc.save(`Groups_Report_${today}.pdf`);
  };

  const handleExportExcel = () => {
    if (filteredGroups.length === 0) return;
    const exportData = filteredGroups.map(g => ({
      "Group Name": g.groupName,
      Alias: g.alias || "-",
      Under: g.under || "-",
      Nature: g.nature || "-",
      "Sub-Ledger": g.subLedger || "No"
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Groups");
    XLSX.writeFile(wb, "Groups_Report.xlsx");
  };

  const handlePrint = () => {
    if (filteredGroups.length === 0) {
      Swal.fire("Info", "No groups to print", "info");
      return;
    }

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("en-IN");


    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text("ACCOUNTING GROUPS REPORT", 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("List of Accounting Groups Summary", 14, 26);

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Generated on: ${today}`, 195, 18, { align: "right" });

    doc.setDrawColor(220);
    doc.line(14, 32, 195, 32);


    const tableData = filteredGroups.map((g, i) => [
      i + 1,
      g.groupName || "-",
      g.alias || "-",
      g.under || "-",
      g.nature || "-",
      g.subLedger || "No"
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["#", "Group Name", "Alias", "Under", "Nature", "Sub-Ledger"]],
      body: tableData,
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 3, valign: "middle" },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 40 },
        4: { cellWidth: 30 },
        5: { halign: "center", cellWidth: 25 }
      }
    });


    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(230);
      doc.line(14, 285, 195, 285);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text("Accounting Groups", 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" });
    }

    doc.autoPrint();
    const blobUrl = doc.output("bloburl");
    window.open(blobUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-white p-6 font-[monospace]">
      <div className="max-w-5xl mx-auto border border-gray-300 rounded-md shadow-md bg-[#fffef7]">
        

        <div className="flex flex-wrap justify-between items-center border-b border-gray-300 py-3 px-4 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-blue-800">List of Groups</h2>
            
            {loggedInRole !== "employee" && (
              <button
                onClick={() => setShowEmployeeActivity(!showEmployeeActivity)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  showEmployeeActivity
                    ? "bg-purple-100 text-purple-700 border-purple-300 shadow-inner"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <UserRound size={16} className={showEmployeeActivity ? "text-purple-600" : "text-gray-500"} />
                {showEmployeeActivity ? "Employee Activity" : "My Groups"}
              </button>
            )}
          </div>

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
              disabled={filteredGroups.length === 0}
              className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded border border-green-500 hover:bg-green-700 transition-colors text-sm font-medium shadow-sm disabled:opacity-50"
            >
              <FileSpreadsheet size={16} />
               Excel
            </button>
            <button
              onClick={handleExportPDF}
              disabled={filteredGroups.length === 0}
              className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown size={16} />
               PDF
            </button>
            <Link
              to="/groupCreation"
              className="bg-blue-700 text-white px-3 py-1.5 rounded hover:bg-blue-800 transition-colors text-sm font-medium shadow-sm"
            >
              + Create New Group
            </Link>
          </div>
        </div>


        {loading ? (
          <p className="text-center text-gray-500 py-6">Loading...</p>
        ) : filteredGroups.length === 0 ? (
          <p className="text-center text-gray-500 py-6">
            {showEmployeeActivity ? "No employee groups created yet." : "No groups created yet."}
          </p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="bg-[#2563eb] text-white">
              <tr className="text-left font-bold">
                <th className="py-3 px-3 border-r border-blue-400 w-10 text-center">#</th>
                <th className="py-3 px-3 border-r border-blue-400">Group Name</th>
                <th className="py-3 px-3 border-r border-blue-400 text-center">Alias</th>
                <th className="py-3 px-3 border-r border-blue-400 text-center">Under</th>
                <th className="py-3 px-3 border-r border-blue-400 text-center">Nature</th>
                <th className="py-3 px-3 border-r border-blue-400 text-center">Sub-Ledger</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((g, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-blue-50 border-b border-gray-200 transition"
                >
                  <td className="py-3 px-3 border-r border-gray-300 text-center">{idx + 1}</td>
                  <td className="py-3 px-3 border-r border-gray-300 font-medium text-gray-800">
                    {g.groupName}
                  </td>
                  <td className="py-3 px-3 border-r border-gray-300 text-gray-600 text-center">
                    {g.alias || "-"}
                  </td>
                  <td className="py-3 px-3 border-r border-gray-300 text-gray-600 text-center">
                    {g.under || "-"}
                  </td>
                  <td className="py-3 px-3 border-r border-gray-300 text-gray-600 text-center">
                    {g.nature || "-"}
                  </td>
                  <td className="py-3 px-3 border-r border-gray-300 text-gray-600 text-center">
                    {g.subLedger || "No"}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/groupCreation`)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Edit Group"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete Group"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ListOfGroups;
