import React, { useEffect, useState, useRef } from "react";
import { Plus, Search, Trash2, UserPlus } from "lucide-react";

import Swal from "sweetalert2";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
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
          className={`w-full rounded border border-slate-200 px-2 py-1.5 text-sm outline-none transition pr-8 ${disabled ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "text-slate-800 focus:border-blue-400 focus:bg-white"}`}
          placeholder="Search or add ledger..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={14} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-100 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((l) => (
              <div
                key={l.id}
                className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer text-slate-700 border-b border-slate-50 last:border-b-0"
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
            <div className="px-3 py-2 text-sm text-slate-500 italic">
              No matches found
            </div>
          )}

          <div
            className="px-3 py-2 text-sm bg-slate-50 hover:bg-blue-100 cursor-pointer text-blue-600 font-medium flex items-center gap-2 border-t border-slate-200"
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
  const { user } = useAuth();
  const { companyId } = useCompany();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get("view") === "true";
  const [isEditMode, setIsEditMode] = useState(false);

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
        const allLedgers = res.data || [];
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
        Swal.fire("Success", "Receipt Voucher Updated!", "success");
        if (!searchParams.get("redirect")) {
          if (role === "employee") {
            navigate("/employee/hr/accounting/client/listOfReciptVoucher");
          } else {
            navigate("/accounting/client/listOfReciptVoucher");
          }
        }
      } else {
        await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/receive-voucher/createReciptVoucher/${companyId}`,
          payload,
        );
        Swal.fire("Success", "Receipt Voucher Saved!", "success");
        resetForm();
        if (role === "employee") {
          navigate("/employee/hr/accounting/client/listOfReciptVoucher");
        } else {
          navigate("/accounting/client/listOfReciptVoucher");
        }
      }
    } catch (err) {
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
            const newLedgers = ledgerRes.data || [];
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
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition bg-white";

  const tableInputClass =
    "w-full rounded border border-transparent px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition bg-transparent";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 mx-auto">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-slate-800">
            {isViewMode
              ? "View Receipt Voucher"
              : isEditMode
                ? "Edit Receipt Voucher"
                : "Receipt Voucher"}
          </h1>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
            RV
          </span>
        </div>
        {!isViewMode && <BulkImportButton onDataParsed={handleBulkImport} />}
      </div>

      <div className="flex flex-col gap-1 mb-5">
        <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
          Receipt Account (Bank / Cash)
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

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
            Voucher Number
          </label>
          <input
            type="text"
            className={inputClass}
            value={voucherNo}
            onChange={(e) => setVoucherNo(e.target.value)}
            disabled={isViewMode}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
            Date
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

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
            Instrument Type
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
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
            Reference Number
          </label>
          <input
            type="text"
            className={inputClass}
            value={referenceNo}
            onChange={(e) => setReferenceNo(e.target.value)}
            disabled={isViewMode}
          />
        </div>
      </div>

      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
        Transaction Details
      </p>

      <div className="rounded-lg border border-slate-200 overflow-visible mb-3">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 font-medium text-left">
                Party Ledger
              </th>
              <th className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 font-medium text-right">
                Opening Balance
              </th>
              <th className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 font-medium text-right">
                Amount (₹)
              </th>
              <th className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 font-medium text-right">
                Closing Balance
              </th>
              <th className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 font-medium text-center w-10"></th>
            </tr>
          </thead>

          <tbody>
            {entries.map((row, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors relative hover:z-50"
              >
                <td className="px-2 py-1">
                  <SearchableLedgerSelect
                    ledgers={ledgers}
                    value={row.ledgerId}
                    onSelect={(val) => onLedgerSelect(index, val)}
                    onCreateNew={(name) => handleQuickCreateLedger(index, name)}
                    disabled={isViewMode}
                  />
                </td>

                <td className="px-3 py-2 text-right text-slate-500 text-sm">
                  {row.ledgerId
                    ? formatBalance(row.closingBalance, row.balanceType)
                    : "0.00"}
                </td>

                <td className="px-2 py-1">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={`${tableInputClass} text-right`}
                    placeholder="0.00"
                    value={row.amount}
                    onChange={(e) => updateAmount(index, e.target.value)}
                    disabled={isViewMode}
                  />
                </td>

                <td className="px-3 py-2 text-right text-slate-800 font-medium text-sm">
                  {row.ledgerId
                    ? formatBalance(row.remainingBalance, row.balanceType)
                    : "0.00"}
                </td>

                <td className="px-2 py-1 text-center">
                  {!isViewMode && entries.length > 1 && (
                    <button
                      className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
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

          <tfoot>
            <tr className="bg-slate-50 border-t border-slate-200">
              <td className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Total
              </td>
              <td />
              <td className="px-3 py-2 text-right text-sm font-semibold text-slate-800">
                ₹ {totalAmount.toFixed(2)}
              </td>
              <td />
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {!isViewMode && (
        <div className="px-3 py-2 border-t border-slate-100 bg-slate-50 rounded-b-lg">
          <button
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            onClick={addRow}
          >
            <Plus size={14} /> Add Row
          </button>
        </div>
      )}

      <div className="flex justify-end mb-5">
        <div className="bg-slate-50 rounded-lg px-5 py-3 flex flex-col items-end gap-1 min-w-48">
          <div className="flex justify-between w-full text-sm font-semibold text-slate-800 gap-8">
            <span>Grand Total</span>
            <span>₹ {totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 mb-5">
        <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
          Narration
        </label>
        <textarea
          className={`${inputClass} min-h-20 resize-y`}
          placeholder="Enter narration for this voucher..."
          value={narration}
          onChange={(e) => setNarration(e.target.value)}
          disabled={isViewMode}
        ></textarea>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <button
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-colors"
          onClick={() => {
            if (isViewMode || isEditMode) {
              navigate("/accounting/client/listOfReciptVoucher");
            } else {
              resetForm();
            }
          }}
        >
          {isViewMode || isEditMode ? "Cancel" : "Clear"}
        </button>
        {!isViewMode && (
          <button
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
            onClick={saveVoucher}
          >
            {isEditMode ? "Update Voucher" : "Save Voucher"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReceiveVouchers;
