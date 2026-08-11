import React from "react";

import { useEffect, useState, useRef } from "react";
import {
  Plus,
  Search,
  Trash2,
  UserPlus,
  ArrowLeft,
  Save,
  RotateCcw,
  X,
  FileText,
  Layers,
} from "lucide-react";

import Swal from "sweetalert2";
import axios from "axios";
import BulkImportButton from "./BulkImportButton";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

const SearchableLedgerSelect = ({
  ledgers,
  value,
  onSelect,
  onCreateNew,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedLedger = ledgers.find((l) => String(l.id) === String(value));

  useEffect(() => {
    if (selectedLedger) {
      setSearchTerm(selectedLedger.name);
    }
  }, [selectedLedger]);

  const filtered = ledgers.filter((l) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (selectedLedger) setSearchTerm(selectedLedger.name);
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
                  setSearchTerm(l.name);
                  setIsOpen(false);
                }}
              >
                {l.name}
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

const ReceiveVouchers = () => {
  const { user, companyId } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get("view") === "true";
  const [isEditMode, setIsEditMode] = useState(false);

  const userRole = user?.role?.toLowerCase() || "admin";
  const listPath =
    userRole === "employee"
      ? "/employee/hr/accounting/client/listOfReciptVoucher"
      : "/accounting/client/listOfReciptVoucher";

  const dropdownRef = useRef(null);
  const [ledgers, setLedgers] = useState([]);
  const [receiptLedgers, setReceiptLedgers] = useState([]);
  const [groups, setGroups] = useState([]);

  const [voucherNo, setVoucherNo] = useState("");
  const [date, setDate] = useState("");
  const [receiptAccountId, setReceiptAccountId] = useState("");
  const [instrumentType, setInstrumentType] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [narration, setNarration] = useState("");

  const [entries, setEntries] = useState([
    {
      ledgerId: "",
      amount: "",
      openingBalance: 0,
      closingBalance: 0,
      remainingBalance: 0,
      balanceType: "Credit",
    },
  ]);

  useEffect(() => {
    const loadLedgers = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`,
        );
        const allLedgers = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setLedgers(allLedgers);

        try {
          const bankRes = await axios.get(
            `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/all`,
          );
          const banks = bankRes.data.accounts || [];
          const contraOptions = banks.map((b) => ({
            id: `bank_${b.id}`,
            name: b.bankName
              ? `${b.accountName} (${b.bankName})`
              : b.accountName,
          }));

          const cashLedger = allLedgers.find(
            (l) =>
              l.name?.toLowerCase().includes("cash") ||
              l.underGroup === "Cash-in-Hand" ||
              l.under === "Cash-in-Hand",
          );

          if (cashLedger) {
            contraOptions.push({
              id: `ledger_${cashLedger.id}`,
              name: cashLedger.name,
            });
          } else {
            contraOptions.push({ id: "cash", name: "Cash" });
          }

          setReceiptLedgers(contraOptions);
        } catch (err) {
          console.error("Error fetching banks:", err);
          setReceiptLedgers(
            allLedgers.filter(
              (l) =>
                l.groupName === "Bank Accounts" ||
                l.groupName === "Cash-in-Hand",
            ),
          );
        }

        const groupRes = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group/all/${companyId}`,
        );
        setGroups(groupRes.data || []);

        const savedState = sessionStorage.getItem("receiptVoucherState");
        if (savedState) {
          const state = JSON.parse(savedState);
          setVoucherNo(state.voucherNo);
          setDate(state.date);
          setReceiptAccountId(state.receiptAccountId);
          setInstrumentType(state.instrumentType);
          setReferenceNo(state.referenceNo);
          setNarration(state.narration);
          setEntries(state.entries);
          sessionStorage.removeItem("receiptVoucherState");
          Swal.fire({
            title: "Welcome back!",
            text: "Your voucher progress has been restored.",
            icon: "info",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error("Failed to load initial data", error);
      }
    };

    const fetchVoucher = async () => {
      if (!id) return;
      try {
        setIsEditMode(true);
        const res = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/receive-voucher/${id}`,
        );
        const vData = res.data;
        if (vData) {
          setVoucherNo(vData.voucherId || "");
          setDate(
            vData.date ? new Date(vData.date).toISOString().split("T")[0] : "",
          );
          setReceiptAccountId(vData.receiptAccountId || "");
          setInstrumentType(vData.instrumentType || "");
          setReferenceNo(vData.referenceNo || "");
          setNarration(vData.narration || "");

          if (vData.items && vData.items.length > 0) {
            setEntries(
              vData.items.map((i) => ({
                ledgerId: i.ledgerId,
                amount: i.amount,
                openingBalance: 0,
                closingBalance: 0,
                remainingBalance: 0,
                balanceType: "Credit",
              })),
            );
          }
        }
      } catch (err) {
        console.error("Error fetching voucher", err);
        Swal.fire("Error", "Could not fetch voucher details", "error");
      }
    };

    if (companyId) {
      loadLedgers();
      if (id) {
        fetchVoucher();
      } else {
        axios
          .get(
            `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher-util/next/${companyId}/receipt`,
          )
          .then((res) => setVoucherNo(res.data.nextNumber))
          .catch(console.error);
      }
    }
  }, [companyId, id]);

  const formatBalance = (val, originalType) => {
    if (val === 0) return "0.00";
    if (val > 0) {
      return `${val.toFixed(2)} ${originalType === "Debit" ? "Dr" : "Cr"}`;
    } else {
      const absoluteVal = Math.abs(val);
      const flippedType = originalType === "Debit" ? "Cr" : "Dr";
      return `${absoluteVal.toFixed(2)} ${flippedType}`;
    }
  };

  const addRow = () => {
    setEntries([
      ...entries,
      {
        ledgerId: "",
        amount: "",
        openingBalance: 0,
        closingBalance: 0,
        remainingBalance: 0,
        balanceType: "Credit",
      },
    ]);
  };

  const removeRow = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const onLedgerSelect = (index, ledgerId) => {
    const ledger = ledgers.find((l) => l.id == ledgerId);
    const opening = parseFloat(ledger?.openingBalance) || 0;
    const closing = parseFloat(ledger?.closingBalance) || 0;
    const type = ledger?.balanceType || ledger?.type || "Credit";

    const updated = [...entries];
    updated[index].ledgerId = ledgerId;
    updated[index].openingBalance = opening;
    updated[index].closingBalance = closing;
    updated[index].balanceType = type;

    const amt = parseFloat(updated[index].amount) || 0;
    if (type === "Credit") {
      updated[index].remainingBalance = closing + amt;
    } else {
      updated[index].remainingBalance = closing - amt;
    }
    setEntries(updated);
  };

  const updateAmount = (index, value) => {
    const updated = [...entries];
    const amt = parseFloat(value) || 0;
    updated[index].amount = value;

    const closing = parseFloat(updated[index].closingBalance) || 0;
    const type = updated[index].balanceType || "Credit";

    if (type === "Credit") {
      updated[index].remainingBalance = closing + amt;
    } else {
      updated[index].remainingBalance = closing - amt;
    }
    setEntries(updated);
  };

  const handleQuickCreateLedger = async (index, initialName) => {
    const stateToSave = {
      voucherNo,
      date,
      receiptAccountId,
      instrumentType,
      referenceNo,
      narration,
      entries,
      editingIndex: index,
    };
    sessionStorage.setItem("receiptVoucherState", JSON.stringify(stateToSave));

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
      ? `${basePath}/receptVoucher/${id}`
      : `${basePath}/receptVoucher`;

    navigate(
      `${basePath}/ledger?redirect=${redirectPath}&name=${encodeURIComponent(initialName)}`,
    );
  };

  const totalAmount = entries.reduce(
    (sum, r) => sum + (parseFloat(r.amount) || 0),
    0,
  );

  const resetForm = () => {
    setVoucherNo(String(Number(voucherNo) + 1));
    setDate("");
    setReceiptAccountId("");
    setInstrumentType("");
    setReferenceNo("");
    setEntries([
      {
        ledgerId: "",
        amount: "",
        openingBalance: 0,
        closingBalance: 0,
        remainingBalance: 0,
        balanceType: "Credit",
      },
    ]);
    setNarration("");
  };

  const saveVoucher = async () => {
    if (!date) return Swal.fire("Error", "Please choose a date.", "error");
    if (!receiptAccountId)
      return Swal.fire(
        "Error",
        "Please select Account Type (Bank/Cash).",
        "error",
      );
    if (!entries.every((r) => r.ledgerId))
      return Swal.fire("Error", "Please select all party ledgers.", "error");

    const employeeId = user?.employee_id || null;
    const role = user?.role || "admin";

    const payload = {
      voucherNo,
      date,
      voucherType: "RECEIPT",
      receiptAccountId,
      instrumentType,
      referenceNo,
      narration,
      totalAmount,
      companyId,
      items: entries.map((r) => ({
        ledgerId: r.ledgerId,
        amount: parseFloat(r.amount) || 0,
      })),
      ...(employeeId && { employee_id: employeeId }),
      role,
    };

    try {
      if (isEditMode) {
        await axios.put(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/receive-voucher/update/${id}`,
          payload,
        );
        Swal.fire({
          icon: "success",
          title: "Receipt Voucher Updated Successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        if (!searchParams.get("redirect")) {
          navigate(listPath);
        }
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/receive-voucher/createReciptVoucher/${companyId}`,
          payload,
        );

        const result = await Swal.fire({
          icon: "success",
          title: "Receipt Voucher Created Successfully",
          text: "The receipt voucher has been saved. What would you like to do next?",
          showCancelButton: true,
          showDenyButton: !!res.data?.pdf_path,
          confirmButtonColor: "#00a651",
          cancelButtonColor: "#6b7280",
          denyButtonColor: "#2563eb",
          confirmButtonText: "Create Another",
          cancelButtonText: "Go to Receipt List",
          denyButtonText: "Download PDF",
        });

        if (result.isDenied && res.data?.pdf_path) {
          const pdfUrl = `${import.meta.env.VITE_ACCOUNTING_URL}/${res.data.pdf_path}`;
          window.open(pdfUrl, "_blank");
          fetch(pdfUrl)
            .then((response) => response.blob())
            .then((blob) => {
              const blobUrl = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = blobUrl;
              link.download =
                res.data.pdf_path.split("/").pop() || "ReceiptVoucher.pdf";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(blobUrl);
            })
            .catch((err) => console.error("Error downloading PDF:", err));

          const followUp = await Swal.fire({
            icon: "info",
            title: "What's Next?",
            text: "Choose your next action.",
            showCancelButton: true,
            confirmButtonColor: "#00a651",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Create Another",
            cancelButtonText: "Go to Receipt List",
          });

          if (followUp.isConfirmed) {
            resetForm();
          } else {
            navigate(listPath);
          }
        } else if (result.isConfirmed) {
          resetForm();
        } else {
          navigate(listPath);
        }
      }
    } catch (err) {
      console.log(err);
      if (err.response && err.response.status === 409) {
        Swal.fire("Warning", "Voucher Number Already Exists!", "warning");
      } else {
        Swal.fire("Error", "Failed to save voucher.", "error");
      }
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
            accountName: row.AccountName || "Cash",
            instrumentType: row.InstrumentType || "Cash",
            referenceNo: row.RefNo || "",
            narration: row.Narration || "",
            items: [],
          };
        }
        grouped[voucherNo].items.push({
          payerName: row.PayerName || row.LedgerName,
          amount: parseFloat(row.Amount || 0),
        });
      });

      const vouchers = Object.values(grouped).map((v) => {
        const receiptAcc = ledgers.find(
          (l) =>
            (l.ledgerName || l.name).toLowerCase() ===
            (v.accountName || "").toLowerCase(),
        );
        const items = v.items.map((i) => {
          const ledgerObj = ledgers.find(
            (l) =>
              (l.ledgerName || l.name).toLowerCase() ===
              (i.payerName || "").toLowerCase(),
          );
          return {
            ledgerId: ledgerObj ? ledgerObj.id : null,
            amount: i.amount,
            payerName: i.payerName,
          };
        });

        const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);

        return {
          voucherNo: v.voucherNo,
          date: v.date,
          receiptAccountId: receiptAcc ? receiptAcc.id : null,
          instrumentType: v.instrumentType,
          referenceNo: v.referenceNo,
          narration: v.narration,
          totalAmount,
          items,
          accountName: v.accountName,
        };
      });

      const missingPayers = vouchers.flatMap((v) =>
        v.items.filter((i) => !i.ledgerId).map((i) => i.payerName),
      );
      const uniqueMissing = [...new Set(missingPayers)];

      if (uniqueMissing.length > 0) {
        const result = await Swal.fire({
          icon: "warning",
          title: "Payer Ledgers Not Found",
          text: `The following Party Names were not found: ${uniqueMissing.join(", ")}.`,
          showCancelButton: true,
          confirmButtonText: "Create Missing Ledgers (Sundry Debtors)",
          cancelButtonText: "Cancel Import",
        });

        if (result.isConfirmed) {
          try {
            const debtorGroup = groups.find(
              (g) => g.groupName === "Sundry Debtors",
            );

            if (!debtorGroup) {
              Swal.fire(
                "Error",
                "Sundry Debtors group not found in system.",
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
                    name: "Sundry Debtors",
                    id: debtorGroup.id,
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
            const newLedgers = Array.isArray(ledgerRes.data) ? ledgerRes.data : ledgerRes.data?.data || [];
            setLedgers(newLedgers);

            vouchers.forEach((v) => {
              v.items.forEach((i) => {
                if (!i.ledgerId) {
                  const l = newLedgers.find(
                    (led) =>
                      (led.ledgerName || led.name).toLowerCase() ===
                      (i.payerName || "").toLowerCase(),
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

      const invalidVouchersIds = vouchers.flatMap((v) =>
        v.items.filter((i) => !i.ledgerId),
      );
      if (invalidVouchersIds.length > 0) {
        Swal.fire(
          "Error",
          "Some ledgers are still missing after attempt to create.",
          "error",
        );
        return;
      }

      const missingAccounts = vouchers.filter((v) => !v.receiptAccountId);
      if (missingAccounts.length > 0) {
        Swal.fire(
          "Error",
          `Receipt Account (Cash/Bank) not found: ${[...new Set(missingAccounts.map((v) => v.accountName))].join(", ")}`,
          "error",
        );
        return;
      }

      if (vouchers.length === 0) return;

      const res = await axios.post(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/receive-voucher/bulk-create`,
        {
          companyId,
          vouchers: vouchers.map((v) => ({
            ...v,
            items: v.items.map((i) => ({
              ledgerId: i.ledgerId,
              amount: i.amount,
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

  return (
    <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans">
      <div className="max-w-6xl mx-auto bg-white app-panel border border-[#e2f2e9]/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex justify-between items-center border-b border-[#e2f2e9] pb-5 mb-8">
          <div className="flex items-center gap-3">
            <h2 className="app-title text-xl font-extrabold text-[#042f2e]">
              {isViewMode
                ? "View Receipt Voucher"
                : isEditMode
                  ? "Receipt Voucher Alteration"
                  : "Receipt Voucher Creation"}
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f0fdf4] text-[#00a651] border border-[#c6f1d6]">
              RV
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
              <ArrowLeft size={16} /> Back to Receipt List
            </button>
          </div>
        </div>

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider mb-4 border-b border-[#cbe0d2] pb-1.5 flex items-center gap-2">
            <FileText size={16} className="text-[#00a651]" /> Basic & Instrument
            Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Receipt Account (Bank / Cash) :
              </label>
              <select
                className={inputClass}
                value={receiptAccountId}
                onChange={(e) => setReceiptAccountId(e.target.value)}
                disabled={isViewMode}
              >
                <option value="">Select Account</option>
                {receiptLedgers.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Voucher Number :
              </label>
              <input
                type="text"
                className={inputClass}
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                disabled={isViewMode}
                placeholder="Enter voucher number"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Instrument Type :
              </label>
              <select
                className={inputClass}
                value={instrumentType}
                onChange={(e) => setInstrumentType(e.target.value)}
                disabled={isViewMode}
              >
                <option value="">Select Type</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="UPI">UPI</option>
                <option value="RTGS">RTGS</option>
                <option value="NEFT">NEFT</option>
              </select>
            </div>

            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Reference Number :
              </label>
              <input
                type="text"
                className={inputClass}
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                disabled={isViewMode}
                placeholder="Enter reference number"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <div className="flex justify-between items-center mb-4 border-b border-[#cbe0d2] pb-1.5">
            <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} className="text-[#00a651]" /> Transaction
              Entries
            </h3>
            {!isViewMode && (
              <button
                type="button"
                className="flex items-center gap-1 text-xs font-bold text-[#00a651] bg-white border border-[#cbe0d2] px-3 py-1.5 rounded-lg hover:bg-[#f0fdf4] transition-colors cursor-pointer"
                onClick={addRow}
              >
                <Plus size={14} /> Add Row
              </button>
            )}
          </div>

          <div className="rounded-xl border border-[#cbe0d2] bg-white overflow-visible mb-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#f0fdf4] border-b border-[#cbe0d2]">
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e]">
                    Party Ledger
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e]">
                    Opening Balance
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e] w-36">
                    Amount (₹)
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e]">
                    Closing Balance
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e] w-14">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e2f2e9]">
                {entries.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-[#f8faf8] transition-colors relative hover:z-50"
                  >
                    <td className="p-2.5">
                      <SearchableLedgerSelect
                        ledgers={ledgers}
                        value={row.ledgerId}
                        onSelect={(val) => onLedgerSelect(index, val)}
                        onCreateNew={(name) =>
                          handleQuickCreateLedger(index, name)
                        }
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="p-2.5 text-right text-slate-600 font-medium text-xs">
                      {row.ledgerId
                        ? formatBalance(row.closingBalance, row.balanceType)
                        : "0.00"}
                    </td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={`${tableInputClass} text-right font-semibold`}
                        placeholder="0.00"
                        value={row.amount}
                        onChange={(e) => updateAmount(index, e.target.value)}
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="p-2.5 text-right text-[#042f2e] font-bold text-xs">
                      {row.ledgerId
                        ? formatBalance(row.remainingBalance, row.balanceType)
                        : "0.00"}
                    </td>
                    <td className="p-2.5 text-center">
                      {!isViewMode && entries.length > 1 && (
                        <button
                          type="button"
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded p-1 transition-colors cursor-pointer"
                          onClick={() => removeRow(index)}
                          title="Remove Row"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4">
            <div className="bg-white border border-[#cbe0d2] rounded-xl p-4 min-w-64 text-right shadow-xs">
              <div className="flex justify-between text-sm font-extrabold text-[#042f2e] gap-6">
                <span>Grand Total:</span>
                <span className="text-[#00a651]">
                  ₹ {totalAmount.toFixed(2)}
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
            placeholder="Enter narration for this voucher..."
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
              className="app-btn-primary flex items-center justify-center gap-2 cursor-pointer shadow-md min-w-36 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Save size={16} />{" "}
              {isEditMode ? "Update Voucher" : "Save Voucher"}
            </button>
          )}

          {!isViewMode && (
            <button
              type="button"
              onClick={resetForm}
              className="app-btn-secondary flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 hover:text-slate-800 min-w-30 transition-all"
            >
              <RotateCcw size={16} /> Reset Form
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (isViewMode || isEditMode) {
                navigate(listPath);
              } else {
                navigate(-1);
              }
            }}
            className="app-btn-secondary flex items-center justify-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl cursor-pointer hover:bg-rose-100 hover:text-rose-800 hover:border-rose-300 min-w-30 transition-all"
          >
            <X size={16} /> {isViewMode ? "Close" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiveVouchers;
