import React from "react";

import { useState, useEffect, useRef } from "react";
import {
  Trash2,
  Plus,
  Search,
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
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

const SearchableLedgerSelect = ({ ledgers, value, onSelect, onCreateNew }) => {
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
          className="app-input w-full border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium pr-8 py-1.5 text-xs"
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

const PaymentVoucher = () => {
  const { user, role: userRole, companyId } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const userRoleStr = (userRole || user?.role || "admin").toLowerCase();
  const listPath =
    userRoleStr === "employee"
      ? "/employee/hr/accounting/client/listOfPaymentVoucher"
      : "/accounting/client/listOfPaymentVoucher";

  const [ledgers, setLedgers] = useState([]);
  const [bankCashLedgers, setBankCashLedgers] = useState([]);
  const [voucherNo, setVoucherNo] = useState("1");
  const [date, setDate] = useState("");
  const [accountType, setAccountType] = useState("");
  const [narration, setNarration] = useState("");
  const [savedVouchers, setSavedVouchers] = useState([]);
  const [entries, setEntries] = useState([
    {
      ledger: "",
      amount: "",
      openingBalance: 0,
      closingBalance: 0,
      remainingBalance: 0,
      balanceType: "Debit",
    },
  ]);
  const [groups, setGroups] = useState([]);

  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`,
        );
        const allLedgers = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setLedgers(allLedgers);

        const bankRes = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/all`,
        );
        const banks = bankRes.data.accounts || [];

        const bankOptions = banks.map((b) => ({
          id: `bank_${b.id}`,
          name: b.bankName ? `${b.accountName} (${b.bankName})` : b.accountName,
          type: "bank",
          originalId: b.id,
        }));

        const cashLedger = allLedgers.find(
          (l) =>
            l.name.toLowerCase().includes("cash") ||
            l.underGroup === "Cash-in-Hand" ||
            l.under === "Cash-in-Hand",
        );

        bankOptions.push(
          cashLedger
            ? {
                id: `ledger_${cashLedger.id}`,
                name: cashLedger.name,
                type: "cash",
                originalId: cashLedger.id,
              }
            : { id: "cash", name: "Cash", type: "cash", originalId: "cash" },
        );

        setBankCashLedgers(bankOptions);

        const groupRes = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group/all/${companyId}`,
        );
        setGroups(groupRes.data || []);

        const savedState = sessionStorage.getItem("paymentVoucherState");
        if (savedState) {
          const state = JSON.parse(savedState);
          setVoucherNo(state.voucherNo);
          setDate(state.date);
          setAccountType(state.accountType);
          setNarration(state.narration);
          setEntries(state.entries);
          sessionStorage.removeItem("paymentVoucherState");
          Swal.fire({
            title: "Welcome back!",
            text: "Your voucher progress has been restored.",
            icon: "info",
            timer: 2000,
            showConfirmButton: false,
          });
        }

        if (id) {
          setIsEditMode(true);
          const voucherRes = await axios.get(
            `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/payment-voucher/get/${id}`,
          );
          const v = voucherRes.data;
          if (v && v.voucherNo) {
            setVoucherNo(v.voucherNo);
            setDate(v.date ? new Date(v.date).toISOString().split("T")[0] : "");

            let rawAccType = v.accountType;
            if (
              rawAccType &&
              !rawAccType.toString().startsWith("bank_") &&
              !rawAccType.toString().startsWith("ledger_")
            ) {
              const isBank = banks.some(
                (b) => String(b.id) === String(rawAccType),
              );
              if (isBank) {
                rawAccType = `bank_${rawAccType}`;
              } else {
                rawAccType = `ledger_${rawAccType}`;
              }
            }
            setAccountType(rawAccType);

            setNarration(v.narration || "");
            const entriesList = v.entries || v.items || [];
            if (entriesList.length > 0) {
              setEntries(
                entriesList.map((item) => {
                  const ledgerObj = allLedgers.find(
                    (l) => String(l.id) === String(item.ledgerId),
                  );
                  const opening = parseFloat(ledgerObj?.openingBalance) || 0;
                  const debit = parseFloat(ledgerObj?.debit) || 0;
                  const credit = parseFloat(ledgerObj?.credit) || 0;
                  const type =
                    ledgerObj?.balanceType || ledgerObj?.type || "Debit";

                  let closing = 0;
                  if (type === "Debit") {
                    closing = opening + debit - credit;
                  } else {
                    closing = opening - debit + credit;
                  }

                  const amt = parseFloat(item.amount) || 0;
                  let rem = 0;
                  if (type === "Debit") {
                    rem = closing + amt;
                  } else {
                    rem = closing - amt;
                  }
                  return {
                    ledger: item.ledgerId,
                    amount: item.amount,
                    openingBalance: opening,
                    closingBalance: closing,
                    remainingBalance: rem,
                    balanceType: type,
                  };
                }),
              );
            }
          }
        } else if (companyId) {
          try {
            const nextRes = await axios.get(
              `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher-util/next/${companyId}/payment`,
            );
            if (nextRes.data && nextRes.data.nextNumber) {
              setVoucherNo(nextRes.data.nextNumber);
            }
          } catch (e) {
            console.error(e);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    if (companyId) fetchData();
  }, [companyId, id]);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/payment-voucher/all/${companyId}`,
        );
        setSavedVouchers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVouchers();
  }, [companyId]);

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
        ledger: "",
        amount: "",
        openingBalance: 0,
        closingBalance: 0,
        remainingBalance: 0,
        balanceType: "Debit",
      },
    ]);
  };

  const removeRow = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const onLedgerSelect = (index, ledgerId) => {
    const ledger = ledgers.find((l) => l.id == ledgerId);
    const opening = parseFloat(ledger?.openingBalance) || 0;
    const debit = parseFloat(ledger?.debit) || 0;
    const credit = parseFloat(ledger?.credit) || 0;
    const type = ledger?.balanceType || ledger?.type || "Debit";

    let closing = 0;
    if (type === "Debit") {
      closing = opening + debit - credit;
    } else {
      closing = opening - debit + credit;
    }

    const updated = [...entries];
    updated[index].ledger = ledgerId;
    updated[index].openingBalance = opening;
    updated[index].closingBalance = closing;
    updated[index].balanceType = type;

    const amt = parseFloat(updated[index].amount) || 0;
    if (type === "Debit") {
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
      accountType,
      narration,
      entries,
      editingIndex: index,
    };
    sessionStorage.setItem("paymentVoucherState", JSON.stringify(stateToSave));

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
      ? `${basePath}/paymentvoucher/${id}`
      : `${basePath}/paymentvoucher`;
    navigate(
      `${basePath}/ledger?redirect=${redirectPath}&name=${encodeURIComponent(initialName)}`,
    );
  };

  const updateAmount = (index, value) => {
    const updated = [...entries];
    const amt = parseFloat(value) || 0;
    updated[index].amount = value;

    const closing = parseFloat(updated[index].closingBalance) || 0;
    const type = updated[index].balanceType || "Debit";

    if (type === "Debit") {
      updated[index].remainingBalance = closing + amt;
    } else {
      updated[index].remainingBalance = closing - amt;
    }
    setEntries(updated);
  };

  const totalAmount = entries.reduce(
    (sum, r) => sum + (parseFloat(r.amount) || 0),
    0,
  );

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setAccountType("");
    setEntries([
      {
        ledger: "",
        amount: "",
        openingBalance: 0,
        closingBalance: 0,
        remainingBalance: 0,
        balanceType: "Debit",
      },
    ]);
    setNarration("");
    if (companyId) {
      axios
        .get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher-util/next/${companyId}/payment`,
        )
        .then((res) => {
          if (res.data?.nextNumber) setVoucherNo(res.data.nextNumber);
        })
        .catch((e) => console.error(e));
    }
  };

  const handleBulkImport = async (data) => {
    try {
      if (!data || data.length === 0) {
        Swal.fire("Error", "No data found in file", "error");

        return;
      }

      const firstRow = data[0];

      const ledgerRes = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`,
      );

      let latestLedgers = Array.isArray(ledgerRes.data) ? ledgerRes.data : ledgerRes.data?.data || [];

      const bankRes = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/all`,
      );

      const latestBanks = bankRes.data.accounts || [];

      const latestBankCash = latestBanks.map((b) => ({
        id: `bank_${b.id}`,

        name: b.bankName ? `${b.accountName} (${b.bankName})` : b.accountName,

        type: "bank",
      }));

      const cashLedger = latestLedgers.find(
        (l) =>
          l.name?.toLowerCase().includes("cash") ||
          l.underGroup === "Cash-in-Hand" ||
          l.under === "Cash-in-Hand",
      );

      if (cashLedger) {
        latestBankCash.push({
          id: `ledger_${cashLedger.id}`,

          name: cashLedger.name,

          type: "cash",
        });
      } else {
        latestBankCash.push({
          id: "cash",
          name: "Cash",
          type: "cash",
        });
      }

      const rawPaymentMode = String(
        firstRow["Payment Mode"] || firstRow["accountType"] || "",
      )
        .trim()
        .toLowerCase();

      let selectedAccount = "";

      if (rawPaymentMode === "cash") {
        selectedAccount = cashLedger ? `ledger_${cashLedger.id}` : "cash";
      } else {
        let matchedBank = latestBankCash.find(
          (b) => b.name?.toLowerCase()?.trim() === rawPaymentMode,
        );

        if (!matchedBank && rawPaymentMode) {
          try {
            const createBank = await axios.post(
              `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/create`,
              {
                accountName: rawPaymentMode,

                bankName: rawPaymentMode,

                currentBalance: 0,
              },
            );

            matchedBank = {
              id: `bank_${createBank.data.id}`,

              name: rawPaymentMode,

              type: "bank",
            };

            latestBankCash.push(matchedBank);
          } catch (err) {
            console.log("Bank create failed", err);
          }
        }

        selectedAccount = matchedBank?.id || "";
      }

      const importedEntries = [];

      for (const row of data) {
        const ledgerName = String(
          row["Paid To"] || row["ledgerId"] || "",
        ).trim();

        let matchedLedger = latestLedgers.find(
          (l) =>
            l.name?.toLowerCase()?.trim() === ledgerName?.toLowerCase()?.trim(),
        );

        if (!matchedLedger && ledgerName) {
          try {
            const creditorGroup = groups.find(
              (g) => g.groupName === "Sundry Creditors",
            );

            const createRes = await axios.post(
              `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/create`,
              {
                name: ledgerName,

                under: JSON.stringify({
                  id: creditorGroup?.id,

                  name: "Sundry Creditors",
                }),

                openingBalance: 0,

                mailingName: ledgerName,

                address: "",

                city: "",

                state: "Odisha",

                country: "India",

                pincode: "",

                pan: "",

                gstin: "",

                registrationType: "Regular",

                companyId,
              },
            );

            matchedLedger = {
              id: createRes.data.id,

              name: ledgerName,

              openingBalance: 0,

              closingBalance: 0,

              balanceType: "Debit",
            };

            latestLedgers.push(matchedLedger);
          } catch (err) {
            console.log("Ledger auto create failed", err);
          }
        }

        const opening = parseFloat(matchedLedger?.openingBalance) || 0;
        const debit = parseFloat(matchedLedger?.debit) || 0;
        const credit = parseFloat(matchedLedger?.credit) || 0;
        const type = matchedLedger?.balanceType || "Debit";

        let closing = 0;
        if (type === "Debit") {
          closing = opening + debit - credit;
        } else {
          closing = opening - debit + credit;
        }

        importedEntries.push({
          ledger: matchedLedger ? matchedLedger.id : "",

          amount: row["Amount"] || row["amount"] || "",

          openingBalance: opening,

          closingBalance: closing,

          remainingBalance: closing,

          balanceType: type,
        });
      }

      setLedgers(latestLedgers);

      setBankCashLedgers(latestBankCash);

      setVoucherNo(firstRow["Voucher No"] || firstRow["voucherNo"] || "");

      setDate(
        firstRow["Date"]
          ? new Date(firstRow["Date"]).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      );

      setNarration(
        firstRow["Voucher Narration"] || firstRow["narration"] || "",
      );

      setAccountType(selectedAccount);

      setEntries(importedEntries);

      Swal.fire({
        icon: "success",

        title: "Import Successful",

        text: "Imported data loaded successfully. Review and click Save Voucher.",
      });
    } catch (err) {
      console.log(err);

      Swal.fire("Error", "Import failed", "error");
    }
  };

  const saveVoucher = async () => {
    if (!date) return Swal.fire("Error", "Please select a date", "error");
    if (!accountType)
      return Swal.fire("Error", "Please select Account Type", "error");
    if (entries.some((e) => !e.ledger))
      return Swal.fire("Error", "Select all debit ledgers", "error");

    const formattedItems = entries.map((e) => ({
      ledgerId: Number(e.ledger),
      amount: parseFloat(e.amount) || 0,
    }));

    const employeeId = user?.employee_id || null;
    const role = user?.role || "admin";

    const payload = {
      voucherNo,
      date,
      accountType,
      narration,
      totalAmount,
      companyId,
      items: formattedItems,
      ...(employeeId && { employee_id: employeeId }),
      role,
    };

    const listPath =
      role?.toLowerCase() === "employee"
        ? "/employee/hr/accounting/client/listOfPaymentVoucher"
        : "/accounting/client/listOfPaymentVoucher";

    try {
      if (isEditMode) {
        await axios.put(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/payment-voucher/update/${id}`,
          payload,
        );
        Swal.fire({
          icon: "success",
          title: "Payment Voucher Updated Successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(listPath);
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/payment-voucher/create/${companyId}`,
        payload,
      );

      const result = await Swal.fire({
        icon: "success",
        title: "Payment Voucher Created Successfully",
        text: "The payment voucher has been saved. What would you like to do next?",
        showCancelButton: true,
        showDenyButton: !!res.data?.pdf_path,
        confirmButtonColor: "#00a651",
        cancelButtonColor: "#6b7280",
        denyButtonColor: "#2563eb",
        confirmButtonText: "Create Another",
        cancelButtonText: "Go to Payment Voucher List",
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
              res.data.pdf_path.split("/").pop() || "PaymentVoucher.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          })
          .catch((err) => console.error("Error downloading PDF:", err));

        const followUp = await Swal.fire({
          icon: "info",
          title: "What's Next?",
          text: "Would you like to create another payment voucher or go to the list?",
          showCancelButton: true,
          confirmButtonColor: "#00a651",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Create Another",
          cancelButtonText: "Go to Payment Voucher List",
        });
        if (!followUp.isConfirmed) {
          navigate(listPath);
          return;
        }
      } else if (!result.isConfirmed) {
        navigate(listPath);
        return;
      }

      resetForm();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 409) {
        Swal.fire("Warning", "Voucher Number Already Exists!", "warning");
      } else {
        Swal.fire(
          "Error",
          `Failed to ${isEditMode ? "update" : "save"} voucher`,
          "error",
        );
      }
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
              {isEditMode
                ? "Payment Voucher Alteration"
                : "Payment Voucher Creation"}
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f0fdf4] text-[#00a651] border border-[#c6f1d6]">
              PV
            </span>
          </div>

          <div className="flex items-center gap-3">
            <BulkImportButton onImport={handleBulkImport} />
            <button
              type="button"
              onClick={() => navigate(listPath)}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors text-sm font-medium cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Payment List
            </button>
          </div>
        </div>

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider mb-4 border-b border-[#cbe0d2] pb-1.5 flex items-center gap-2">
            <FileText size={16} className="text-[#00a651]" /> Basic Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Account Type (Bank / Cash) :
              </label>
              <select
                className={inputClass}
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
              >
                <option value="">Select Bank / Cash Account</option>
                {bankCashLedgers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
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
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1 text-xs font-bold text-[#00a651] bg-white border border-[#cbe0d2] px-3 py-1.5 rounded-lg hover:bg-[#f0fdf4] transition-colors cursor-pointer"
            >
              <Plus size={14} /> Add Row
            </button>
          </div>

          <div className="rounded-xl border border-[#cbe0d2] bg-white overflow-visible mb-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#f0fdf4] border-b border-[#cbe0d2]">
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e]">
                    Particulars
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e]">
                    Opening
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e]">
                    Closing
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e] w-36">
                    Amount (₹)
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e]">
                    Remaining
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
                        value={row.ledger}
                        onSelect={(val) => onLedgerSelect(index, val)}
                        onCreateNew={(name) =>
                          handleQuickCreateLedger(index, name)
                        }
                      />
                    </td>
                    <td className="p-2.5 text-right text-slate-600 font-medium text-xs">
                      {row.ledger
                        ? formatBalance(row.openingBalance, row.balanceType)
                        : "0.00"}
                    </td>
                    <td className="p-2.5 text-right text-slate-600 font-medium text-xs">
                      {row.ledger
                        ? formatBalance(row.closingBalance, row.balanceType)
                        : "0.00"}
                    </td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        placeholder="0.00"
                        className={`${tableInputClass} text-right font-semibold`}
                        value={row.amount}
                        onChange={(e) => updateAmount(index, e.target.value)}
                      />
                    </td>
                    <td className="p-2.5 text-right text-[#042f2e] font-bold text-xs">
                      {row.ledger
                        ? formatBalance(row.remainingBalance, row.balanceType)
                        : "0.00"}
                    </td>
                    <td className="p-2.5 text-center">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded p-1 transition-colors cursor-pointer"
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
            rows="2"
            placeholder="Enter narration (optional)..."
            className="app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium resize-none h-20"
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
          />
        </div>

        <div className="mt-8 flex justify-end gap-4 border-t border-[#e2f2e9] pt-6">
          <button
            type="button"
            onClick={saveVoucher}
            className="app-btn-primary flex items-center justify-center gap-2 cursor-pointer shadow-md min-w-36 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Save size={16} /> {isEditMode ? "Update Voucher" : "Save Voucher"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="app-btn-secondary flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 hover:text-slate-800 min-w-30 transition-all"
          >
            <RotateCcw size={16} /> Reset Form
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="app-btn-secondary flex items-center justify-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl cursor-pointer hover:bg-rose-100 hover:text-rose-800 hover:border-rose-300 min-w-30 transition-all"
          >
            <X size={16} /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentVoucher;
