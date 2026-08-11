import React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Trash2,
  Pencil,
  FileDown,
  FileSpreadsheet,
  Printer,
  X,
  Layers,
  Search,
  Landmark,
  Wallet,
  Users,
  Building2,
  Coins,
  TrendingUp,
  ShoppingCart,
  Percent,
  PiggyBank,
  ShieldCheck,
  Building,
  Briefcase,
  GitFork,
  HelpCircle,
  Shield,
  Receipt,
  Scale,
  DollarSign,
  TrendingDown,
  Boxes,
  HandCoins,
  Vault,
} from "lucide-react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useAuth from "../../../hooks/useAuth";

const API = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group`;

const GLOBAL_GROUP_ICONS = {
  "bank accounts": Landmark,
  "bank occ a/c": Landmark,
  "bank od a/c": Landmark,
  "cash-in-hand": Wallet,
  "sundry debtors": Users,
  "sundry creditors": Building2,
  "stock-in-hand": Boxes,
  "secured loans": Vault,
  "loans (liability)": HandCoins,
  "loans & advances (asset)": HandCoins,
  "sales accounts": TrendingUp,
  "purchase accounts": ShoppingCart,
  "retained earnings": ShieldCheck,
  "reserves & surplus": PiggyBank,
  "capital account": PiggyBank,
  provisions: Shield,
  "misc. expenses (asset)": Receipt,
  "suspense a/c": HelpCircle,
  "duties & taxes": Percent,
  "branch / divisions": GitFork,
  "fixed assets": Building,
  investments: Briefcase,
  "deposits (asset)": Coins,
  "current assets": TrendingUp,
  "current liabilities": Scale,
  "direct expenses": TrendingDown,
  "expenses (direct)": TrendingDown,
  "indirect expenses": TrendingDown,
  "expenses (indirect)": TrendingDown,
  "direct incomes": DollarSign,
  "income (direct)": DollarSign,
  "indirect incomes": DollarSign,
  "income (indirect)": DollarSign,
};

const NATURE_ICONS = {
  Assets: TrendingUp,
  Liabilities: Scale,
  Income: DollarSign,
  Expenses: TrendingDown,
};

const getGroupIcon = (groupName, nature) => {
  if (groupName) {
    const key = groupName.trim().toLowerCase();
    if (GLOBAL_GROUP_ICONS[key]) {
      return GLOBAL_GROUP_ICONS[key];
    }
  }
  if (nature && NATURE_ICONS[nature]) {
    return NATURE_ICONS[nature];
  }
  return Layers;
};

const NATURE_COLORS = {
  Assets: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  Liabilities: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  Income: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  Expenses: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
};

const getNatureColor = (nature) =>
  NATURE_COLORS[nature] || {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
  };

const ListOfGroups = () => {
  const { user, role, companyId, companyName } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loggedInRole = role?.toLowerCase() || "admin";

  const groupCreationPath =
    loggedInRole === "employee"
      ? "/employee/hr/accounting/client/groupCreation"
      : "/accounting/client/groupCreation";

  const fetchData = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/all/${companyId}`);
      setGroups(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching groups from API:", err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) fetchData();
  }, [companyId]);

  const filteredGroups = groups.filter(
    (g) =>
      !searchQuery ||
      g.groupName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.alias?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.nature?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async (group) => {
    if (
      !group ||
      !group.id ||
      group.companyId === null ||
      group.companyId === undefined
    ) {
      Swal.fire("Info", "Default global groups cannot be deleted.", "info");
      return;
    }
    const result = await Swal.fire({
      title: "Delete Group?",
      text: "Deleting this group may affect dependent ledgers!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API}/${companyId}/${group.id}`);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Group has been deleted.",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchData();
      } catch (err) {
        console.error(err);
        Swal.fire(
          "Error",
          "Failed to delete group. It might be in use or is a default group.",
          "error",
        );
      }
    }
  };

  const handleEdit = (group) => {
    if (
      !group ||
      !group.id ||
      group.companyId === null ||
      group.companyId === undefined
    ) {
      Swal.fire("Info", "Default global groups cannot be modified.", "info");
      return;
    }
    navigate(`${groupCreationPath}/${group.id}`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const company = (companyName || "Company").toUpperCase();
    const today = new Date().toLocaleDateString("en-IN");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text(company, 14, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Accounting Groups Report", 14, 26);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Generated on: ${today}`, 195, 18, { align: "right" });
    doc.setDrawColor(220);
    doc.line(14, 32, 195, 32);

    const tableData = filteredGroups.map((g, i) => [
      i + 1,
      g.groupName || "-",
      g.alias || "-",
      g.nature || "-",
      g.subLedger || "No",
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["#", "Group Name", "Alias", "Nature", "Sub-Ledger"]],
      body: tableData,
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 3, valign: "middle" },
      headStyles: {
        fillColor: [0, 166, 81],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { cellWidth: 65 },
        2: { cellWidth: 35 },
        3: { cellWidth: 40 },
        4: { halign: "center", cellWidth: 30 },
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(230);
      doc.line(14, 285, 195, 285);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`${company} • Groups Report`, 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" });
    }
    doc.save(`Groups_Report_${today}.pdf`);
  };

  const handleExportExcel = () => {
    if (filteredGroups.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(
      filteredGroups.map((g) => ({
        "Group Name": g.groupName,
        Alias: g.alias || "-",
        Nature: g.nature || "-",
        "Sub-Ledger": g.subLedger || "No",
      })),
    );
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
    const company = (companyName || "Company").toUpperCase();
    const today = new Date().toLocaleDateString("en-IN");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text(company, 14, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Accounting Groups Report", 14, 26);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Generated on: ${today}`, 195, 18, { align: "right" });
    doc.setDrawColor(220);
    doc.line(14, 32, 195, 32);

    const tableData = filteredGroups.map((g, i) => [
      i + 1,
      g.groupName || "-",
      g.alias || "-",
      g.nature || "-",
      g.subLedger || "No",
    ]);
    autoTable(doc, {
      startY: 40,
      head: [["#", "Group Name", "Alias", "Nature", "Sub-Ledger"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 8.5, cellPadding: 3, valign: "middle" },
      headStyles: {
        fillColor: [0, 166, 81],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { cellWidth: 65 },
        2: { cellWidth: 35 },
        3: { cellWidth: 40 },
        4: { halign: "center", cellWidth: 30 },
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(230);
      doc.line(14, 285, 195, 285);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`${company} • Groups Report`, 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" });
    }
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans">
      <div className="max-w-7xl mx-auto app-panel overflow-hidden border border-[#e2f2e9] bg-white">
        <div className="flex flex-wrap justify-between items-center app-section-bar py-5 px-6 border-b border-[#e2f2e9] gap-4 bg-white">
          <h2 className="app-title text-xl font-extrabold text-[#042f2e]">
            List of Groups
          </h2>
          <Link
            to={groupCreationPath}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-[#00a651] to-[#00c853] hover:from-[#008c44] hover:to-[#00a651] text-white px-5 h-10 rounded-xl text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
          >
            + Create New Group
          </Link>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3 px-6 py-4 border-b border-[#e2f2e9] bg-[#f8faf8]/60">
          <div className="flex-1 min-w-50 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, alias or nature..."
                className="app-input w-full pl-9 bg-white border-[#c8ddcd] text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] text-sm font-medium"
              />
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 h-10 rounded-xl border border-slate-200 transition-colors text-sm font-semibold cursor-pointer active:scale-[0.98]"
            >
              <Printer size={16} /> Print
            </button>
            <button
              onClick={handleExportExcel}
              disabled={filteredGroups.length === 0}
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 h-10 rounded-xl border border-emerald-200 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
            >
              <FileSpreadsheet size={16} /> Export Excel
            </button>
            <button
              onClick={handleExportPDF}
              disabled={filteredGroups.length === 0}
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 h-10 rounded-xl border border-blue-200 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
            >
              <FileDown size={16} /> Export PDF
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-center text-slate-500 py-6">Loading groups...</p>
        )}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse bg-white">
              <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9]">
                <tr className="text-left text-slate-700">
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-center w-12">
                    #
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                    Group Name
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                    Alias
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                    Nature
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-center">
                    Sub-Ledger
                  </th>
                  <th className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-center w-28">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e2f2e9]">
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((g, idx) => {
                    const nc = getNatureColor(g.nature);
                    return (
                      <tr
                        key={g.id || idx}
                        className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-200"
                      >
                        <td className="py-3 px-4 border-r border-[#e2f2e9] text-center text-[#475569] text-[13px]">
                          {idx + 1}
                        </td>

                        <td className="py-3 px-4 border-r border-[#e2f2e9]">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const GroupIcon = getGroupIcon(
                                g.groupName,
                                g.nature,
                              );
                              return (
                                <div className="size-8 rounded-xl bg-[#ecfdf5] border border-[#c6f1d6] flex items-center justify-center shrink-0">
                                  <GroupIcon
                                    size={15}
                                    className="text-[#00a651]"
                                  />
                                </div>
                              );
                            })()}
                            <div>
                              <p className="text-[14px] font-bold text-[#042f2e]">
                                {g.groupName}
                              </p>
                              {g.alias && (
                                <div className="text-[12px] text-slate-400 font-medium">
                                  {g.alias}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 border-r border-[#e2f2e9] text-slate-600 text-[13px]">
                          {g.alias || (
                            <span className="text-slate-400 text-[12px]">
                              N/A
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 border-r border-[#e2f2e9]">
                          {g.nature ? (
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold border ${nc.bg} ${nc.text} ${nc.border}`}
                            >
                              {g.nature}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[12px]">
                              N/A
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 border-r border-[#e2f2e9] text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                              g.subLedger === "Yes"
                                ? "bg-sky-50 text-sky-700"
                                : "bg-slate-50 text-slate-500"
                            }`}
                          >
                            {g.subLedger || "No"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          {(() => {
                            const isGlobal =
                              !g.id ||
                              g.companyId === null ||
                              g.companyId === undefined;
                            return (
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleEdit(g)}
                                  disabled={isGlobal}
                                  title={
                                    isGlobal
                                      ? "Default global groups cannot be modified"
                                      : "Edit Group"
                                  }
                                  className={
                                    isGlobal
                                      ? "text-slate-400 opacity-60 cursor-not-allowed p-1.5 rounded-lg"
                                      : "text-slate-400 hover:text-amber-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                                  }
                                >
                                  <Pencil size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(g)}
                                  disabled={isGlobal}
                                  title={
                                    isGlobal
                                      ? "Default global groups cannot be deleted"
                                      : "Delete Group"
                                  }
                                  className={
                                    isGlobal
                                      ? "text-slate-400 opacity-60 cursor-not-allowed p-1.5 rounded-lg"
                                      : "text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                                  }
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-14 text-center">
                      <Layers
                        size={32}
                        className="mx-auto mb-3 text-slate-300"
                      />
                      <p className="text-[14px] font-medium text-slate-600">
                        {searchQuery
                          ? "No groups match your search"
                          : "No groups created yet."}
                      </p>
                      <p className="text-[13px] mt-1 text-slate-400">
                        {searchQuery
                          ? "Try a different keyword."
                          : 'Click "Create New Group" to add one.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListOfGroups;
