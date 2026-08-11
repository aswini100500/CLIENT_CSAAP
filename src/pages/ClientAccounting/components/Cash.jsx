import React from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ArrowUpDown,
  Download,
  Eye,
  FileText,
  Search,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import useAuth from "../../../hooks/useAuth";

const CashActivities = () => {
  const [cashAccounts, setCashAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateSortAsc, setDateSortAsc] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const { companyId } = useAuth();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatBalanceWithDrCr = (amount) => {
    const numericAmount = parseFloat(amount) || 0;
    const absVal = Math.abs(numericAmount);
    if (absVal === 0) return formatCurrency(0);
    const suffix = numericAmount > 0 ? " Dr" : " Cr";
    return formatCurrency(absVal) + suffix;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const getCleanParticulars = (txn) => {
    if (txn.particulars && txn.particulars.trim())
      return txn.particulars.trim();
    if (txn.oppositeLedgerName && txn.oppositeLedgerName.trim())
      return txn.oppositeLedgerName.trim();
    if (txn.ledgerName && txn.ledgerName.trim()) return txn.ledgerName.trim();
    if (txn.narration && txn.narration.trim()) return txn.narration.trim();
    if (txn.description && txn.description.trim())
      return txn.description.trim();
    return `${txn.voucherType || "Voucher"} Entry`;
  };

  const fetchCashAccounts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`,
      );

      const ledgers = Array.isArray(data) ? data : data?.data || [];
      const cashLedgers = ledgers.filter(
        (ledger) =>
          (ledger.underGroup || "").toLowerCase().includes("cash-in-hand") ||
          (ledger.under || "").toLowerCase().includes("cash-in-hand") ||
          (ledger.name || "").toLowerCase() === "cash",
      );

      let formattedAccounts = cashLedgers.map((account) => {
        const bal =
          parseFloat(account.closingBalance || account.openingBalance) || 0;
        return {
          ...account,
          id: account.id,
          accountName: account.name,
          currentBalance: bal,
          formattedBalance: formatBalanceWithDrCr(bal),
        };
      });

      if (formattedAccounts.length === 0) {
        formattedAccounts.push({
          id: "cash",
          accountName: "Default Cash",
          underGroup: "Cash-in-hand",
          currentBalance: 0,
          formattedBalance: formatBalanceWithDrCr(0),
        });
      }

      setCashAccounts(formattedAccounts);

      if (formattedAccounts.length > 0 && !selectedAccount) {
        setSelectedAccount(formattedAccounts[0]);
      }
    } catch (err) {
      console.error("Error fetching cash accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (ledgerId) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/transaction/ledger/${companyId}/${ledgerId}`,
      );

      if (data.success) {
        const formattedTransactions = data.transactions.map((transaction) => {
          const isIncoming = (parseFloat(transaction.debit) || 0) > 0;
          const amount = isIncoming
            ? parseFloat(transaction.debit)
            : parseFloat(transaction.credit);

          return {
            ...transaction,
            transactionType: isIncoming ? "credit" : "debit",
            amount: amount,
            formattedAmount: formatCurrency(amount),
            description:
              transaction.narration || `${transaction.voucherType} Voucher`,
          };
        });
        setTransactions(formattedTransactions);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchCashAccounts();
    }
  }, [companyId]);

  const filteredCashAccounts = cashAccounts.filter((account) => {
    if (!ledgerSearchTerm.trim()) return true;
    const term = ledgerSearchTerm.toLowerCase();
    const matchName = (account.accountName || "").toLowerCase().includes(term);
    const matchGroup = (account.underGroup || account.under || "")
      .toLowerCase()
      .includes(term);
    return matchName || matchGroup;
  });

  useEffect(() => {
    if (filteredCashAccounts.length > 0) {
      const stillExists =
        selectedAccount &&
        filteredCashAccounts.some((a) => a.id === selectedAccount.id);
      if (!stillExists) {
        setSelectedAccount(filteredCashAccounts[0]);
      }
    } else {
      setSelectedAccount(null);
    }
  }, [cashAccounts, ledgerSearchTerm]);

  useEffect(() => {
    if (selectedAccount) {
      fetchTransactions(selectedAccount.id);
    }
  }, [selectedAccount]);

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
  };

  const getFilteredTransactionsWithBalances = () => {
    let currentBal = selectedAccount
      ? parseFloat(selectedAccount.currentBalance) || 0
      : 0;
    const sortedTransactions = [...transactions].sort((a, b) => {
      const dateDiff =
        new Date(b.date || b.createdAt || 0) -
        new Date(a.date || a.createdAt || 0);
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    const transactionsWithBalances = sortedTransactions.map((t) => {
      const balanceAfter = currentBal;
      const isIncoming =
        (parseFloat(t.debit) || 0) > 0 || t.transactionType === "credit";
      const amount = Math.abs(
        parseFloat(t.amount || (isIncoming ? t.debit : t.credit)) || 0,
      );

      if (isIncoming) {
        currentBal -= amount;
      } else {
        currentBal += amount;
      }
      return {
        ...t,
        isIncoming,
        amount,
        formattedAmount: formatCurrency(amount),
        formattedBalanceAfter: formatBalanceWithDrCr(balanceAfter),
        balanceAfter,
      };
    });

    return transactionsWithBalances.filter((t) => {
      const tDate = new Date((t.date || t.createdAt || "").split("T")[0]);
      if (startDate && new Date(startDate) > tDate) return false;
      if (endDate && new Date(endDate) < tDate) return false;
      return true;
    });
  };

  const handleDownloadExcel = () => {
    if (!selectedAccount) return;
    const filteredTxns = getFilteredTransactionsWithBalances();
    const chronologicalTxns = [...filteredTxns].reverse();

    const exportData = chronologicalTxns.map((t) => ({
      Date: formatDate(t.date || t.createdAt),
      Particulars: getCleanParticulars(t),
      "Voucher Type": t.voucherType || "Voucher",
      "Voucher ID": t.voucherId || t.voucherNo || t.id || "-",
      "Outgoing(Cr)": !t.isIncoming ? t.amount : "",
      "Incoming(Dr)": t.isIncoming ? t.amount : "",
      "Balance(INR)": formatCurrency(t.balanceAfter).replace(/₹/g, "Rs. "),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cash Statement");
    XLSX.writeFile(
      workbook,
      `${selectedAccount.accountName}_Cash_Statement.xlsx`,
    );
  };

  const handleDownloadPDF = () => {
    if (!selectedAccount) return;
    const doc = new jsPDF();
    const filteredTxns = getFilteredTransactionsWithBalances();
    const chronologicalTxns = [...filteredTxns].reverse();

    doc.setFontSize(16);
    doc.text(`Cash Statement: ${selectedAccount.accountName}`, 14, 15);
    doc.setFontSize(10);
    doc.text(
      `Group: ${selectedAccount.underGroup || selectedAccount.under || "Cash-in-hand"} | Balance: ${selectedAccount.formattedBalance}`,
      14,
      22,
    );

    const tableData = chronologicalTxns.map((t) => [
      formatDate(t.date || t.createdAt),
      getCleanParticulars(t),
      t.voucherType || "Voucher",
      t.voucherId || t.voucherNo || t.id || "-",
      !t.isIncoming ? formatCurrency(t.amount).replace("₹", "").trim() : "",
      t.isIncoming ? formatCurrency(t.amount).replace("₹", "").trim() : "",
      formatCurrency(t.balanceAfter).replace(/₹/g, "Rs. "),
    ]);

    autoTable(doc, {
      startY: 30,
      head: [
        [
          "Date",
          "Particulars",
          "Voucher Type",
          "Voucher ID",
          "Outgoing(Cr)",
          "Incoming(Dr)",
          "Balance(INR)",
        ],
      ],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] },
    });

    doc.save(`${selectedAccount.accountName}_Cash_Statement.pdf`);
  };

  const totalCashBalance = cashAccounts.reduce(
    (sum, acc) => sum + (acc.currentBalance || 0),
    0,
  );
  const mtdIncoming = transactions
    .filter(
      (t) => (parseFloat(t.debit) || 0) > 0 || t.transactionType === "credit",
    )
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const mtdOutgoing = transactions
    .filter(
      (t) =>
        (parseFloat(t.credit) || 0) > 0 && (parseFloat(t.debit) || 0) === 0,
    )
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="erp-root app-shell p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="app-title flex items-center gap-2.5">
              <Wallet className="size-7 text-(--brand)" />
              Cash Activities
            </h1>
            <p className="app-subtitle mt-1">
              Manage cash-in-hand ledgers, monitor daily cash inflows and
              outflows, and track petty cash.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="app-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-(--text-soft)">
                  Total Cash Balance
                </p>
                <div className="mt-2 text-[26px] font-extrabold leading-none text-(--text-strong)">
                  {formatBalanceWithDrCr(totalCashBalance)}
                </div>
                <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
                  Across {cashAccounts.length} cash{" "}
                  {cashAccounts.length === 1 ? "ledger" : "ledgers"}
                </p>
              </div>
              <div className="size-10 rounded-2xl bg-(--brand-soft) border border-(--border-soft) flex items-center justify-center shrink-0">
                <Wallet className="size-5 text-(--brand)" />
              </div>
            </div>
          </div>

          <div className="app-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-(--text-soft)">
                  Incoming (MTD)
                </p>
                <div className="mt-2 text-[26px] font-extrabold leading-none text-emerald-600">
                  {formatCurrency(mtdIncoming)}
                </div>
                <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
                  Cash received for active ledger
                </p>
              </div>
              <div className="size-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <TrendingUp className="size-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="app-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-(--text-soft)">
                  Outgoing (MTD)
                </p>
                <div className="mt-2 text-[26px] font-extrabold leading-none text-rose-600">
                  {formatCurrency(mtdOutgoing)}
                </div>
                <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
                  Cash paid out for active ledger
                </p>
              </div>
              <div className="size-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <TrendingDown className="size-5 text-rose-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="app-panel overflow-hidden flex flex-col h-full">
              <div className="app-section-bar px-4 py-3 flex items-center justify-between">
                <h3 className="app-heading flex items-center gap-2">
                  <Wallet className="size-4 text-(--brand)" />
                  Cash Ledgers
                </h3>
              </div>

              <div className="p-3 border-b border-(--border-soft) bg-white">
                <div className="relative">
                  <input
                    type="text"
                    value={ledgerSearchTerm}
                    onChange={(e) => setLedgerSearchTerm(e.target.value)}
                    placeholder="Search cash ledger..."
                    className="app-input w-full pl-9 pr-8 text-[13px]"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-(--text-faint)" />
                  {ledgerSearchTerm && (
                    <button
                      onClick={() => setLedgerSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-faint) hover:text-(--text-strong)"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-(--border-soft) overflow-y-auto max-h-150">
                {filteredCashAccounts.length === 0 ? (
                  <div className="p-8 text-center">
                    <Wallet className="size-10 text-(--text-faint) mx-auto mb-3" />
                    <p className="text-[14px] font-bold text-(--text-strong)">
                      No cash ledgers found
                    </p>
                    <p className="text-[12px] text-(--text-soft) mt-1">
                      {ledgerSearchTerm
                        ? "Try adjusting your search query."
                        : "Create a ledger under Cash-in-hand group."}
                    </p>
                  </div>
                ) : (
                  filteredCashAccounts.map((account) => {
                    const isSelected = selectedAccount?.id === account.id;

                    return (
                      <div
                        key={account.id}
                        onClick={() => handleAccountSelect(account)}
                        className={`p-4 transition-all duration-180 cursor-pointer hover:bg-(--bg-subtle)/60 ${
                          isSelected ? "bg-(--brand-soft)/80" : "bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "bg-(--brand) text-white"
                                  : "bg-(--brand-soft) text-(--brand)"
                              }`}
                            >
                              <Wallet className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-[14px] font-bold text-(--text-strong) truncate">
                                {account.accountName}
                              </h4>
                              <p className="text-[11px] font-semibold text-(--text-faint) uppercase tracking-wider mt-0.5">
                                {account.underGroup ||
                                  account.under ||
                                  "Cash-in-hand"}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-[14px] font-extrabold text-(--text-strong)">
                              {account.formattedBalance}
                            </p>
                            <p className="text-[11px] font-medium text-(--text-faint)">
                              Current Balance
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {selectedAccount ? (
              <div className="space-y-6">
                <div className="app-panel p-4 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-(--text-strong)">
                      {selectedAccount.accountName}
                    </h3>
                    <p className="text-[12px] text-(--text-soft) mt-0.5">
                      Group:{" "}
                      <strong className="text-slate-700">
                        {selectedAccount.underGroup ||
                          selectedAccount.under ||
                          "Cash-in-hand"}
                      </strong>
                      <span className="mx-2 text-slate-300">|</span>
                      Current Balance:{" "}
                      <strong className="text-emerald-700 font-bold">
                        {selectedAccount.formattedBalance}
                      </strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-end gap-3">
                    <div>
                      <label className="modal-label block text-[11px] mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="app-input py-1.5 px-3 text-[13px] h-9.5"
                      />
                    </div>
                    <div>
                      <label className="modal-label block text-[11px] mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="app-input py-1.5 px-3 text-[13px] h-9.5"
                      />
                    </div>
                    {(startDate || endDate) && (
                      <button
                        type="button"
                        onClick={() => {
                          setStartDate("");
                          setEndDate("");
                        }}
                        className="size-8 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center cursor-pointer shrink-0 mb-1"
                        title="Clear Date Filters"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setShowStatementModal(true)}
                      className="app-btn-secondary flex items-center gap-2 text-[13px] bg-white cursor-pointer shadow-xs h-9.5"
                    >
                      <FileText className="size-4 text-(--brand)" />
                      Statement
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="app-panel p-10 flex flex-col justify-center items-center gap-3">
                    <div className="animate-spin rounded-full size-8 border-3 border-(--brand) border-t-transparent" />
                    <span className="text-[13px] font-semibold text-(--text-soft)">
                      Fetching cash activities...
                    </span>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="app-panel p-10 text-center">
                    <FileText className="size-12 text-(--text-faint) mx-auto mb-3" />
                    <h4 className="text-[16px] font-bold text-(--text-strong) mb-1">
                      No Cash Activities Found
                    </h4>
                    <p className="text-[13px] text-(--text-soft) max-w-sm mx-auto">
                      There are no cash transactions recorded for this ledger
                      yet.
                    </p>
                  </div>
                ) : (
                  <div className="app-panel overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse bg-white">
                        <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9]">
                          <tr className="text-left text-slate-700">
                            <th
                              className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] cursor-pointer select-none hover:bg-[#e2f2e9]/60 transition-colors"
                              onClick={() => setDateSortAsc((prev) => !prev)}
                            >
                              <div className="flex items-center gap-1.5">
                                Date
                                <ArrowUpDown className="size-3.5 text-slate-400" />
                              </div>
                            </th>
                            <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                              Particulars
                            </th>
                            <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                              Voucher Type
                            </th>
                            <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                              Voucher ID
                            </th>
                            <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                              Outgoing (Cr)
                            </th>
                            <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                              Incoming (Dr)
                            </th>
                            <th className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                              Balance (INR)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2f2e9]">
                          {[...getFilteredTransactionsWithBalances()]
                            .sort((a, b) => {
                              const da = new Date(a.date || a.createdAt);
                              const db = new Date(b.date || b.createdAt);
                              return dateSortAsc ? da - db : db - da;
                            })
                            .map((transaction) => {
                              const isIncoming = transaction.isIncoming;
                              return (
                                <tr
                                  key={`${transaction.id || transaction._id}-${transaction.date}`}
                                  className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-200 group"
                                >
                                  <td className="py-3 px-4 border-r border-[#e2f2e9] text-[13px] font-medium text-slate-600 whitespace-nowrap">
                                    {formatDate(
                                      transaction.date || transaction.createdAt,
                                    )}
                                  </td>
                                  <td
                                    className="py-3 px-4 border-r border-[#e2f2e9] font-semibold text-[#042f2e] text-[13px] max-w-xs truncate"
                                    title={getCleanParticulars(transaction)}
                                  >
                                    {getCleanParticulars(transaction)}
                                  </td>
                                  <td className="py-3 px-4 border-r border-[#e2f2e9] text-[13px] font-medium text-slate-600 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                      {transaction.voucherType || "Voucher"}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 border-r border-[#e2f2e9] text-[13px] font-semibold text-slate-700 whitespace-nowrap">
                                    {transaction.voucherId ||
                                      transaction.voucherNo ||
                                      transaction.referenceNumber ||
                                      "—"}
                                  </td>
                                  <td className="py-3 px-4 border-r border-[#e2f2e9] text-right text-[13px] font-bold text-rose-600 whitespace-nowrap">
                                    {!isIncoming
                                      ? formatCurrency(transaction.amount)
                                          .replace("₹", "")
                                          .trim()
                                      : ""}
                                  </td>
                                  <td className="py-3 px-4 border-r border-[#e2f2e9] text-right text-[13px] font-bold text-emerald-600 whitespace-nowrap">
                                    {isIncoming
                                      ? formatCurrency(transaction.amount)
                                          .replace("₹", "")
                                          .trim()
                                      : ""}
                                  </td>
                                  <td className="py-3 px-4 text-right text-[13px] font-bold text-slate-800 whitespace-nowrap">
                                    {(
                                      transaction.formattedBalanceAfter ||
                                      formatBalanceWithDrCr(
                                        transaction.balanceAfter,
                                      )
                                    )
                                      .replace("₹", "")
                                      .trim()}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="app-panel p-12 text-center">
                <Eye className="size-12 text-(--text-faint) mx-auto mb-3" />
                <h4 className="text-[16px] font-bold text-(--text-strong) mb-1">
                  Select a Cash Ledger
                </h4>
                <p className="text-[13px] text-(--text-soft) max-w-xs mx-auto">
                  Choose a cash ledger from the left panel to inspect its
                  transaction history and cash movements.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showStatementModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 app-modal-backdrop">
          <div className="app-modal bg-(--bg-elevated) w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-(--border-soft) px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <FileText className="size-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="modal-title">
                    Cash Statement: {selectedAccount?.accountName}
                  </h3>
                  <p className="modal-subtitle">
                    Group:{" "}
                    <strong>
                      {selectedAccount?.underGroup ||
                        selectedAccount?.under ||
                        "Cash-in-hand"}
                    </strong>{" "}
                    | Current Balance:{" "}
                    <strong>{selectedAccount?.formattedBalance}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStatementModal(false)}
                className="app-icon-button p-2 text-(--text-soft) hover:text-(--text-strong) hover:bg-slate-100 rounded-xl"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 flex flex-col">
              <div className="app-panel p-4 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="modal-label block text-[11px] mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="app-input py-1.5 px-3 text-[13px] h-9.5"
                    />
                  </div>
                  <div>
                    <label className="modal-label block text-[11px] mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="app-input py-1.5 px-3 text-[13px] h-9.5"
                    />
                  </div>
                  {(startDate || endDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        setStartDate("");
                        setEndDate("");
                      }}
                      className="size-8 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center cursor-pointer shrink-0 mb-1"
                      title="Clear Date Filters"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    className="app-btn-secondary flex items-center gap-2 text-[13px] bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 cursor-pointer"
                  >
                    <FileText className="size-4" />
                    Download PDF
                  </button>
                  <button
                    onClick={handleDownloadExcel}
                    className="app-btn-secondary flex items-center gap-2 text-[13px] bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                  >
                    <Download className="size-4" />
                    Export Excel
                  </button>
                </div>
              </div>

              <div className="app-panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-(--border-soft)">
                    <thead className="app-section-bar">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                          Date
                        </th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                          Particulars
                        </th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                          Voucher Type
                        </th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                          Voucher ID
                        </th>
                        <th className="px-4 py-2.5 text-right text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                          Outgoing(Cr)
                        </th>
                        <th className="px-4 py-2.5 text-right text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                          Incoming(Dr)
                        </th>
                        <th className="px-4 py-2.5 text-right text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                          Balance(INR)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-(--border-soft)">
                      {getFilteredTransactionsWithBalances().map(
                        (transaction) => (
                          <tr
                            key={`${transaction.id || transaction._id}-${transaction.date}`}
                            className="hover:bg-(--bg-subtle)/70 transition-colors"
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-[13px] font-medium text-(--text-body)">
                              {formatDate(
                                transaction.date || transaction.createdAt,
                              )}
                            </td>
                            <td
                              className="px-4 py-3 text-[13px] font-semibold text-(--text-strong) max-w-70 truncate"
                              title={getCleanParticulars(transaction)}
                            >
                              {getCleanParticulars(transaction)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-[13px] font-medium text-(--text-body)">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                {transaction.voucherType || "Voucher"}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-[13px] font-semibold text-(--text-strong)">
                              {transaction.voucherId ||
                                transaction.voucherNo ||
                                transaction.referenceNumber ||
                                "—"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-[13px] font-bold text-rose-600 text-right">
                              {!transaction.isIncoming
                                ? formatCurrency(transaction.amount)
                                    .replace("₹", "")
                                    .trim()
                                : ""}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-[13px] font-bold text-emerald-600 text-right">
                              {transaction.isIncoming
                                ? formatCurrency(transaction.amount)
                                    .replace("₹", "")
                                    .trim()
                                : ""}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-[13px] font-bold text-(--text-strong) text-right">
                              {(
                                transaction.formattedBalanceAfter ||
                                formatBalanceWithDrCr(transaction.balanceAfter)
                              )
                                .replace("₹", "")
                                .trim()}
                            </td>
                          </tr>
                        ),
                      )}

                      {getFilteredTransactionsWithBalances().length === 0 && (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-4 py-8 text-center text-(--text-soft) text-[13px]"
                          >
                            No transactions found for the selected date range.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashActivities;
