import React from "react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import BulkImportButton from "./BulkImportButton";
import Swal from "sweetalert2";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import {
  Search,
  UserPlus,
  ArrowLeft,
  Save,
  X,
  FileText,
  Layers,
} from "lucide-react";

const SearchableLedgerSelect = ({
  ledgers = [],
  value,
  onSelect,
  onCreateNew,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const ledgerList = Array.isArray(ledgers) ? ledgers : [];
  const selectedLedger = ledgerList.find((l) => String(l.id) === String(value));

  useEffect(() => {
    if (selectedLedger) {
      setSearchTerm(selectedLedger.name || selectedLedger.ledgerName);
    } else {
      setSearchTerm("");
    }
  }, [selectedLedger]);

  const filtered = ledgerList.filter((l) =>
    (l.name || l.ledgerName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (selectedLedger)
          setSearchTerm(selectedLedger.name || selectedLedger.ledgerName);
        else setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedLedger]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          disabled={disabled}
          className={`app-input w-full border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium pr-8 py-1.5 text-xs ${disabled ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""}`}
          placeholder="Search or add ledger..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#00a651]">
          <Search size={14} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-9999 mt-1.5 w-full bg-white border border-[#cbe0d2] rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((l) => (
              <div
                key={l.id}
                className="px-3.5 py-2 text-xs font-semibold hover:bg-[#f0fdf4] hover:text-[#00a651] cursor-pointer text-slate-700 border-b border-[#e2f2e9] last:border-b-0 text-left transition-colors"
                onClick={() => {
                  onSelect(l.id);
                  setSearchTerm(l.name || l.ledgerName);
                  setIsOpen(false);
                }}
              >
                {l.name || l.ledgerName}
              </div>
            ))
          ) : (
            <div className="px-3.5 py-2 text-xs text-slate-400 italic text-left">
              No matches found
            </div>
          )}

          <div
            className="px-3.5 py-2 text-xs bg-[#f0fdf4] hover:bg-[#e1f9eb] cursor-pointer text-[#00a651] font-bold flex items-center gap-1.5 border-t border-[#cbe0d2] text-left transition-colors"
            onClick={() => {
              onCreateNew(searchTerm);
              setIsOpen(false);
            }}
          >
            <UserPlus size={14} /> Add "{searchTerm || "New Ledger"}"
          </div>
        </div>
      )}
    </div>
  );
};

const JournalVoucher = () => {
  const { user, role: userRole, companyId } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get("mode") === "view";
  const isEditMode = !!id;

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [narration, setNarration] = useState("");
  const [rows, setRows] = useState([{ ledgerId: "", debit: "", credit: "" }]);
  const [ledgers, setLedgers] = useState([]);
  const [voucherno, setVoucherNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!companyId) return;
    (async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`,
        );
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setLedgers(data);

        const savedState = sessionStorage.getItem("journalVoucherState");
        if (savedState) {
          const state = JSON.parse(savedState);
          setVoucherNo(state.voucherno);
          setDate(state.date);
          setNarration(state.narration);
          setRows(state.rows);
          sessionStorage.removeItem("journalVoucherState");
          Swal.fire({
            title: "Welcome back!",
            text: "Your voucher progress has been restored.",
            icon: "info",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error(error);
        alert("Error loading ledgers");
      }
    })();
  }, [companyId]);

  useEffect(() => {
    if (id) {
      const fetchVoucher = async () => {
        try {
          const { data } = await axios.get(
            `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/journal-voucher/${id}`,
          );
          if (data && data.voucher) {
            setDate(new Date(data.voucher.date).toISOString().split("T")[0]);
            setNarration(data.voucher.narration || "");
            setVoucherNo(data.voucher.voucherNo || "");

            if (data.transactions && data.transactions.length > 0) {
              setRows(
                data.transactions.map((t) => ({
                  ledgerId: t.ledgerId || "",
                  debit: t.debit || "",
                  credit: t.credit || "",
                })),
              );
            }
          }
        } catch (error) {
          console.error("Error fetching voucher:", error);
          Swal.fire("Error", "Could not load the voucher", "error");
        }
      };
      fetchVoucher();
    } else if (companyId) {
      axios
        .get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher-util/next/${companyId}/journal`,
        )
        .then((res) => setVoucherNo(res.data.nextNumber))
        .catch((err) => console.error(err));
    }
  }, [id, companyId]);

  const addRow = () => {
    setRows([...rows, { ledgerId: "", debit: "", credit: "" }]);
  };

  const updateRow = (index, field, value) => {
    const updated = [...rows];

    if (field === "debit" && value) updated[index].credit = "";
    if (field === "credit" && value) updated[index].debit = "";

    updated[index][field] = value;
    setRows(updated);
  };

  const handleQuickCreateLedger = async (index, initialName) => {
    const stateToSave = {
      voucherno,
      date,
      narration,
      rows,
      editingIndex: index,
    };
    sessionStorage.setItem("journalVoucherState", JSON.stringify(stateToSave));

    const userStr = sessionStorage.getItem("user");
    let role = "admin";
    if (userStr) {
      const userObj = JSON.parse(userStr);
      role = userObj.role || "admin";
    }
    const basePath =
      role === "employee"
        ? "/employee/hr/accounting/client"
        : "/accounting/client";
    const redirectPath = id
      ? `${basePath}/journalvoucher/${id}`
      : `${basePath}/journalvoucher`;

    navigate(
      `${basePath}/ledger?redirect=${redirectPath}&name=${encodeURIComponent(initialName)}`,
    );
  };

  const totalDebit = rows.reduce((sum, r) => sum + Number(r.debit || 0), 0);
  const totalCredit = rows.reduce((sum, r) => sum + Number(r.credit || 0), 0);

  const fetchNextVoucherNo = () => {
    if (!companyId) return;
    axios
      .get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher-util/next/${companyId}/journal`,
      )
      .then((res) => setVoucherNo(res.data.nextNumber))
      .catch((err) => console.error(err));
  };

  const saveVoucher = async () => {
    if (rows.some((r) => !r.ledgerId)) {
      setMessage("❌ Please select all ledgers");
      return;
    }

    const employeeId = user?.employee_id || null;
    const role = userRole || "admin";

    const payload = {
      voucherno,
      companyId,
      voucherType: "journal",
      date,
      narration,
      transactions: rows.map((r) => ({
        ledgerId: Number(r.ledgerId) || null,
        debit: parseFloat(r.debit) || 0,
        credit: parseFloat(r.credit) || 0,
      })),
      ...(employeeId && { employee_id: employeeId }),
      role,
    };

    try {
      setLoading(true);
      setMessage("");

      if (isEditMode) {
        await axios.put(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/journal-voucher/update/${id}`,
          payload,
        );
        Swal.fire({
          icon: "success",
          title: "Journal Voucher Updated Successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(listPath);
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/journal-voucher/create/${companyId}`,
        payload,
      );

      try {
        await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher/createVoucher`,
          payload,
        );
      } catch (error) {
        console.log("Voucher table error:", error);
      }

      const result = await Swal.fire({
        icon: "success",
        title: "Journal Voucher Created Successfully",
        text: "The journal voucher has been saved. What would you like to do next?",
        showCancelButton: true,
        showDenyButton: !!res.data?.pdf_path,
        confirmButtonColor: "#00a651",
        cancelButtonColor: "#6b7280",
        denyButtonColor: "#2563eb",
        confirmButtonText: "Create Another",
        cancelButtonText: "Go to Journal Voucher List",
        denyButtonText: "Download PDF",
      });

      if (result.isDenied && res.data?.pdf_path) {
        const pdfUrl = `${import.meta.env.VITE_ACCOUNTING_URL}/${res.data.pdf_path}`;
        window.open(pdfUrl, "_blank");
        setNarration("");
        setRows([{ ledgerId: "", debit: "", credit: "" }]);
        fetchNextVoucherNo();
      } else if (result.isConfirmed) {
        setNarration("");
        setRows([{ ledgerId: "", debit: "", credit: "" }]);
        fetchNextVoucherNo();
      } else {
        navigate(listPath);
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 409) {
        Swal.fire("Warning", "Voucher Number Already Exists!", "warning");
      } else {
        Swal.fire(
          "Error",
          isEditMode
            ? "Failed to update journal voucher."
            : "Failed to save journal voucher.",
          "error",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async (data) => {
    try {
      const grouped = {};

      data.forEach((row) => {
        const voucherNo = row.VoucherNo || "Unknown";
        if (!grouped[voucherNo]) {
          grouped[voucherNo] = {
            voucherNo,
            date: row.Date
              ? new Date(row.Date).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            narration: row.Narration || "",
            items: [],
          };
        }
        grouped[voucherNo].items.push({
          ledgerName: row.Particulars || row.LedgerName,
          debit: parseFloat(row.Debit || 0),
          credit: parseFloat(row.Credit || 0),
        });
      });

      const vouchers = Object.values(grouped).map((v) => {
        const items = v.items.map((i) => {
          const ledgerObj = ledgers.find(
            (l) =>
              (l.ledgerName || l.name || "").toLowerCase() ===
              (i.ledgerName || "").toLowerCase(),
          );
          return {
            ledgerId: ledgerObj ? ledgerObj.id : null,
            debit: i.debit,
            credit: i.credit,
            ledgerName: i.ledgerName,
          };
        });

        return {
          voucherNo: v.voucherNo,
          date: v.date,
          narration: v.narration,
          items,
        };
      });

      const missingLedgers = vouchers.flatMap((v) =>
        v.items.filter((i) => !i.ledgerId).map((i) => i.ledgerName),
      );
      const uniqueMissing = [...new Set(missingLedgers)];

      if (uniqueMissing.length > 0) {
        const result = await Swal.fire({
          icon: "warning",
          title: "Ledgers Not Found",
          text: `The following Ledger Names were not found: ${uniqueMissing.join(", ")}.`,
          showCancelButton: true,
          confirmButtonText: "Create Missing Ledgers (Sundry Creditors)",
          cancelButtonText: "Cancel Import",
        });

        if (result.isConfirmed) {
          try {
            const groupRes = await axios.get(
              `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group/all/${companyId}`,
            );
            const groups = groupRes.data;
            const creditorGroup = groups.find(
              (g) => g.groupName === "Sundry Creditors",
            );

            if (!creditorGroup) {
              Swal.fire(
                "Error",
                "Sundry Creditors group not found in system.",
                "error",
              );
              return;
            }

            let createdCount = 0;
            for (const name of uniqueMissing) {
              await axios.post(
                `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/create`,
                {
                  name: name,
                  under: JSON.stringify({
                    name: "Sundry Creditors",
                    id: creditorGroup.id,
                  }),
                  mailingName: name,
                  openingBalance: 0,
                  state: "Not Applicable",
                  country: "India",
                  registrationType: "Regular",
                  companyId,
                },
              );
              createdCount++;
            }

            Swal.fire(
              "Success",
              `${createdCount} Ledgers created. Retrying import...`,
              "success",
            );

            const ledgerRes = await axios.get(
              `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`,
            );
            const newLedgers = ledgerRes.data || [];
            setLedgers(newLedgers);

            vouchers.forEach((v) => {
              v.items.forEach((i) => {
                if (!i.ledgerId) {
                  const l = newLedgers.find(
                    (led) =>
                      (led.ledgerName || led.name).toLowerCase() ===
                      (i.ledgerName || "").toLowerCase(),
                  );
                  if (l) i.ledgerId = l.id;
                }
              });
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

      const invalidItems = vouchers.flatMap((v) =>
        v.items.filter((i) => !i.ledgerId).map((i) => i.ledgerName),
      );
      if (invalidItems.length > 0) {
        Swal.fire(
          "Error",
          `Ledgers not found: ${[...new Set(invalidItems)].join(", ")}`,
          "error",
        );
        return;
      }

      const unbalanced = vouchers.filter((v) => {
        const totalDr = v.items.reduce((s, i) => s + i.debit, 0);
        const totalCr = v.items.reduce((s, i) => s + i.credit, 0);
        return Math.abs(totalDr - totalCr) > 0.01;
      });

      if (unbalanced.length > 0) {
        Swal.fire(
          "Error",
          `${unbalanced.length} vouchers are not balanced (Debit != Credit).`,
          "error",
        );
        return;
      }

      if (vouchers.length === 0) return;

      const res = await axios.post(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/journal-voucher/bulk-create`,
        {
          companyId,
          vouchers: vouchers.map((v) => ({
            ...v,
            items: v.items.map((i) => ({
              ledgerId: i.ledgerId,
              debit: i.debit,
              credit: i.credit,
            })),
          })),
        },
      );

      Swal.fire(
        "Success",
        res.data.message || "Bulk Import Successful",
        "success",
      );
      window.location.reload();
    } catch (error) {
      console.error("Bulk Import Error", error);
      Swal.fire("Error", "Bulk Import Failed", "error");
    }
  };

  const inputClass =
    "app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium";

  const tableInputClass =
    "w-full border border-[#c8ddcd] bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] rounded-xl font-semibold py-2.25 px-3 text-xs outline-none transition-all";

  const role = userRole || "admin";
  const listPath =
    role === "employee"
      ? "/employee/hr/accounting/client/listOfJournalVoucher"
      : "/accounting/client/listOfJournalVoucher";

  return (
    <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans">
      <div className="max-w-6xl mx-auto bg-white app-panel border border-[#e2f2e9]/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex justify-between items-center border-b border-[#e2f2e9] pb-5 mb-8">
          <div className="flex items-center gap-3">
            <h2 className="app-title text-xl font-extrabold text-[#042f2e]">
              {isViewMode
                ? "View Journal Voucher"
                : isEditMode
                  ? "Journal Voucher Alteration"
                  : "Journal Voucher Creation"}
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f0fdf4] text-[#00a651] border border-[#c6f1d6]">
              JV
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isViewMode && (
              <BulkImportButton onDataParsed={handleBulkImport} />
            )}
            <button
              type="button"
              onClick={() => navigate(listPath)}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors text-sm font-medium cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Journal List
            </button>
          </div>
        </div>

        {message && (
          <div className="p-3 mb-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-semibold">
            {message}
          </div>
        )}

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider mb-4 border-b border-[#cbe0d2] pb-1.5 flex items-center gap-2">
            <FileText size={16} className="text-[#00a651]" /> Basic Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Voucher Number :
              </label>
              <input
                type="text"
                className={inputClass}
                value={voucherno}
                onChange={(e) => setVoucherNo(e.target.value)}
                placeholder="Auto / Enter voucher number"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Date :
              </label>
              <input
                type="date"
                className={inputClass}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <div className="flex justify-between items-center mb-4 border-b border-[#cbe0d2] pb-1.5">
            <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} className="text-[#00a651]" /> Journal Entries
            </h3>
            {!isViewMode && (
              <button
                type="button"
                className="flex items-center gap-1 text-xs font-bold text-[#00a651] bg-white border border-[#cbe0d2] px-3 py-1.5 rounded-lg hover:bg-[#f0fdf4] transition-colors cursor-pointer"
                onClick={addRow}
              >
                + Add Entry
              </button>
            )}
          </div>

          <div className="rounded-xl border border-[#cbe0d2] bg-white overflow-visible mb-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#f0fdf4] border-b border-[#cbe0d2]">
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e]">
                    Particulars (Ledger)
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e] w-44">
                    Debit (₹)
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e] w-44">
                    Credit (₹)
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e2f2e9]">
                {rows.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-[#f8faf8] transition-colors relative hover:z-50 focus-within:z-50"
                  >
                    <td className="p-2.5">
                      <SearchableLedgerSelect
                        ledgers={ledgers}
                        value={row.ledgerId}
                        onSelect={(val) => updateRow(index, "ledgerId", val)}
                        onCreateNew={(name) =>
                          handleQuickCreateLedger(index, name)
                        }
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        className={`${tableInputClass} text-right font-semibold`}
                        placeholder="0.00"
                        value={row.debit}
                        onChange={(e) =>
                          updateRow(index, "debit", e.target.value)
                        }
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        className={`${tableInputClass} text-right font-semibold`}
                        placeholder="0.00"
                        value={row.credit}
                        onChange={(e) =>
                          updateRow(index, "credit", e.target.value)
                        }
                        disabled={isViewMode}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4">
            <div className="bg-white border border-[#cbe0d2] rounded-xl p-4 min-w-72 shadow-xs space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Total Debit:</span>
                <span className="font-bold text-slate-800">
                  ₹ {totalDebit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Total Credit:</span>
                <span className="font-bold text-slate-800">
                  ₹ {totalCredit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#042f2e] border-t border-[#e2f2e9] pt-2">
                <span>Difference:</span>
                <span
                  className={
                    Math.abs(totalDebit - totalCredit) < 0.01
                      ? "text-[#00a651]"
                      : "text-rose-600"
                  }
                >
                  ₹ {Math.abs(totalDebit - totalCredit).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <label className="app-label block text-xs font-bold text-slate-800 mb-1">
            Narration / Note :
          </label>
          <textarea
            className="app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium resize-none h-20"
            placeholder="Enter narration for this journal voucher..."
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            disabled={isViewMode}
          />
        </div>

        <div className="mt-8 flex justify-end gap-4 border-t border-[#e2f2e9] pt-6">
          {!isViewMode && (
            <button
              type="button"
              onClick={saveVoucher}
              disabled={loading}
              className="app-btn-primary flex items-center justify-center gap-2 cursor-pointer shadow-md min-w-36 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <Save size={16} />{" "}
              {loading
                ? "Saving..."
                : isEditMode
                  ? "Update Voucher"
                  : "Save Voucher"}
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate(listPath)}
            className="app-btn-secondary flex items-center justify-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl cursor-pointer hover:bg-rose-100 hover:text-rose-800 hover:border-rose-300 min-w-30 transition-all"
          >
            <X size={16} /> {isViewMode ? "Close" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalVoucher;
