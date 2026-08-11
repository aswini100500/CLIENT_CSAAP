import React from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ArrowUpDown,
  Banknote,
  Building2,
  Check,
  Copy,
  CreditCard,
  Download,
  Eye,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import useAuth from "../../../hooks/useAuth";
import { useUser } from "../context/UserContext";

const BankActivities = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isEditingTransaction, setIsEditingTransaction] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [accountSearchTerm, setAccountSearchTerm] = useState("");
  const [voucherDateFilter, setVoucherDateFilter] = useState("");
  const [dateSortAsc, setDateSortAsc] = useState(true);
  const { user: authUser, role, companyId } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const [groups, setGroups] = useState([]);
  const isEmployee = location.pathname.includes("/employee");
  const currentEmployeeId = authUser?.employee_id || authUser?.id || null;
  const loggedInRole = role?.toLowerCase() || "admin";
  const loggedInEmployeeId = authUser?.employee_id || null;

  const [newAccount, setNewAccount] = useState({
    accountName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    openingBalance: 0,
    openingBalanceType: "Cr",
    openingDate: "",
    accountType: "savings",
  });

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    transactionType: "credit",
    amount: 0,
    category: "",
    referenceNumber: "",
  });

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
    const suffix = numericAmount >= 0 ? " Cr" : " Dr";
    return formatCurrency(absVal) + suffix;
  };



  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/all`,
      );

      if (data.success) {
        const formattedAccounts = data.accounts
          .map((account) => ({
            ...account,
            formattedBalance: formatBalanceWithDrCr(account.currentBalance),
          }))
          .sort((a, b) => b.id - a.id);
        setBankAccounts(formattedAccounts);
      }
    } catch (err) {
      console.error("Error fetching bank accounts:", err);
      alert("Failed to fetch bank accounts");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (accountId, voucherDate = "") => {
    try {
      setLoading(true);
      const dateParam = voucherDate ? `?date=${voucherDate}` : "";
      const { data } = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank-transaction/${accountId}/all${dateParam}`,
      );

      if (data.success) {
        const formattedTransactions = data.transactions.map((transaction) => ({
          ...transaction,
          formattedAmount: formatCurrency(transaction.amount),
          formattedBalanceAfter: formatBalanceWithDrCr(
            transaction.balanceAfter,
          ),
        }));
        setTransactions(formattedTransactions);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      alert("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group/all/${companyId}`,
      );
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.groups)
          ? data.groups
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setGroups(list);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setGroups([]);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchBankAccounts();
      fetchGroups();
    }
  }, [companyId]);

  const filteredBankAccounts = bankAccounts.filter((account) => {
    if (isEmployee && currentEmployeeId) {
      if (
        account.creator_employee_id != currentEmployeeId &&
        account.created_by_employee_id != currentEmployeeId &&
        account.created_by_user_id != currentEmployeeId &&
        account.employee_id != currentEmployeeId
      ) {
        return false;
      }
    } else if (!isEmployee) {
    }
    if (accountSearchTerm.trim()) {
      const term = accountSearchTerm.toLowerCase();
      const matchName = account.accountName?.toLowerCase().includes(term);
      const matchBank = account.bankName?.toLowerCase().includes(term);
      const matchAcc = account.accountNumber?.toLowerCase().includes(term);
      if (!matchName && !matchBank && !matchAcc) return false;
    }
    return true;
  });

  useEffect(() => {
    if (filteredBankAccounts.length > 0) {
      const stillExists =
        selectedAccount &&
        filteredBankAccounts.some((a) => a.id === selectedAccount.id);
      if (!stillExists) {
        setSelectedAccount(filteredBankAccounts[0]);
      }
    } else {
      setSelectedAccount(null);
    }
  }, [bankAccounts, accountSearchTerm]);

  useEffect(() => {
    if (selectedAccount) {
      fetchTransactions(selectedAccount.id, voucherDateFilter);
    }
  }, [selectedAccount, voucherDateFilter]);

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
  };

  const handleAddAccount = () => {
    setIsEditingAccount(false);
    setNewAccount({
      accountName: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      branchName: "",
      openingBalance: 0,
      openingBalanceType: "Cr",
      openingDate: "",
      accountType: "savings",
    });
    fetchGroups();
    setShowAddAccount(true);
  };

  const handleEditAccount = (account) => {
    setIsEditingAccount(true);
    const signedOpeningBalance = parseFloat(account.openingBalance) || 0;
    const absOpeningBalance = Math.abs(signedOpeningBalance);
    const openingBalanceType = signedOpeningBalance >= 0 ? "Cr" : "Dr";

    setNewAccount({
      ...account,
      openingBalance: absOpeningBalance,
      openingBalanceType: openingBalanceType,
      openingDate: account.openingDate
        ? new Date(account.openingDate).toISOString().split("T")[0]
        : "",
    });
    fetchGroups();
    setShowAddAccount(true);
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bank account?"))
      return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${id}/delete`,
      );

      setBankAccounts(bankAccounts.filter((a) => a.id !== id));
      if (selectedAccount?.id === id) {
        setSelectedAccount(null);
        setTransactions([]);
      }
      alert("Bank account deleted successfully");
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("Failed to delete bank account");
    }
  };

  const handleAddTransaction = () => {
    if (!selectedAccount) {
      alert("Please select a bank account first");
      return;
    }

    setIsEditingTransaction(false);
    setNewTransaction({
      date: new Date().toISOString().split("T")[0],
      description: "",
      transactionType: "credit",
      amount: 0,
      category: "",
      referenceNumber: "",
    });
    setShowAddTransaction(true);
  };

  const handleEditTransaction = (transaction) => {
    setIsEditingTransaction(true);
    setNewTransaction({
      ...transaction,
      date: transaction.date.split("T")[0],
      amount: parseFloat(transaction.amount) || 0,
    });
    setShowAddTransaction(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank-transaction/${id}/delete`,
      );

      setTransactions(transactions.filter((t) => t.id !== id));
      alert("Transaction deleted successfully");
    } catch (err) {
      console.error("Error deleting transaction:", err);
      alert("Failed to delete transaction");
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();

    if (
      !newAccount.accountName ||
      !newAccount.bankName ||
      !newAccount.accountNumber ||
      !newAccount.ifscCode
    ) {
      alert("Please fill all required fields");
      return;
    }

    const signedOpeningBalance =
      newAccount.openingBalanceType === "Cr"
        ? parseFloat(newAccount.openingBalance) || 0
        : -(parseFloat(newAccount.openingBalance) || 0);

    try {
      if (isEditingAccount) {
        const updateData = {
          ...newAccount,
          openingBalance: signedOpeningBalance,
        };

        await axios.put(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${newAccount.id}/update`,
          updateData,
        );

        const updatedAccounts = bankAccounts.map((acc) =>
          acc.id === newAccount.id
            ? {
                ...acc,
                ...newAccount,
                openingBalance: signedOpeningBalance,
              }
            : acc,
        );
        setBankAccounts(updatedAccounts);

        if (selectedAccount?.id === newAccount.id) {
          setSelectedAccount({
            ...selectedAccount,
            ...newAccount,
            openingBalance: signedOpeningBalance,
          });
        }
      } else {
        const createData = {
          ...newAccount,
          openingBalance: signedOpeningBalance,
          currentBalance: signedOpeningBalance,
        };

        const response = await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/create`,
          createData,
        );

        if (response.data.success) {
          const newAccountWithId = {
            ...newAccount,
            id: response.data.id,
            openingBalance: signedOpeningBalance,
            currentBalance: signedOpeningBalance,
            formattedBalance: formatBalanceWithDrCr(signedOpeningBalance),
          };
          setBankAccounts([...bankAccounts, newAccountWithId]);
        }
      }

      setShowAddAccount(false);
      alert(
        isEditingAccount
          ? "Account updated successfully"
          : "Account created successfully",
      );
    } catch (err) {
      console.error("Error saving account:", err);
      alert("Failed to save bank account");
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAccount) {
      alert("Please select a bank account first");
      return;
    }

    if (
      !newTransaction.date ||
      !newTransaction.description ||
      !newTransaction.amount
    ) {
      alert("Please fill all required fields");
      return;
    }

    const transactionData = {
      ...newTransaction,
      accountId: selectedAccount.id,
      amount: parseFloat(newTransaction.amount) || 0,
    };

    try {
      if (isEditingTransaction) {
        await axios.put(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank-transaction/${newTransaction.id}/update`,
          transactionData,
        );

        const updatedTransactions = transactions.map((t) =>
          t.id === newTransaction.id
            ? {
                ...transactionData,
                formattedAmount: formatCurrency(transactionData.amount),
              }
            : t,
        );
        setTransactions(updatedTransactions);
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank-transaction/${companyId}/create`,
          transactionData,
        );

        if (response.data.success) {
          const newTransactionWithId = {
            ...transactionData,
            id: response.data.id,
            formattedAmount: formatCurrency(transactionData.amount),
          };
          setTransactions([...transactions, newTransactionWithId]);

          fetchBankAccounts();
          if (selectedAccount) {
            const updatedBalance =
              transactionData.transactionType === "credit"
                ? parseFloat(selectedAccount.currentBalance) +
                  parseFloat(transactionData.amount)
                : parseFloat(selectedAccount.currentBalance) -
                  parseFloat(transactionData.amount);

            setSelectedAccount({
              ...selectedAccount,
              currentBalance: updatedBalance,
              formattedBalance: formatBalanceWithDrCr(updatedBalance),
            });
          }
        }
      }

      setShowAddTransaction(false);
      alert(
        isEditingTransaction
          ? "Transaction updated successfully"
          : "Transaction created successfully",
      );
    } catch (err) {
      console.error("Error saving transaction:", err);
      alert("Failed to save transaction");
    }
  };

  const getPeriodOpeningBalance = () => {
    if (!selectedAccount) return 0;
    const baseOpening = parseFloat(selectedAccount.openingBalance) || 0;
    if (!startDate) return baseOpening;

    const start = new Date(startDate);
    const sortedTxns = [...transactions].sort((a, b) => {
      const da = new Date((a.date || a.createdAt || "").split("T")[0]);
      const db = new Date((b.date || b.createdAt || "").split("T")[0]);
      if (da - db !== 0) return da - db;
      return (a.id || 0) - (b.id || 0);
    });

    let priorSum = 0;
    for (const t of sortedTxns) {
      const tDate = new Date((t.date || t.createdAt || "").split("T")[0]);
      if (tDate < start) {
        const amt = parseFloat(t.amount) || 0;
        if (t.transactionType === "credit") {
          priorSum += amt;
        } else {
          priorSum -= amt;
        }
      }
    }
    return baseOpening + priorSum;
  };

  const getOpeningBalanceDate = () => {
    if (startDate) return startDate;
    if (!selectedAccount) return "";

    let earliestDate = new Date(selectedAccount.openingDate || new Date());

    if (transactions && transactions.length > 0) {
      const sortedTxns = [...transactions].sort((a, b) => {
        const da = new Date(a.date || a.createdAt);
        const db = new Date(b.date || b.createdAt);
        if (da - db !== 0) return da - db;
        return (a.id || 0) - (b.id || 0);
      });
      const oldestTxnDate = new Date((sortedTxns[0].date || "").split("T")[0]);
      if (oldestTxnDate < earliestDate) {
        earliestDate = oldestTxnDate;
      }
    }

    return earliestDate.toISOString().split("T")[0];
  };

  const getFilteredTransactionsWithBalances = () => {
    if (!selectedAccount) return [];

    const sortedTransactions = [...transactions].sort((a, b) => {
      const da = new Date((a.date || a.createdAt || "").split("T")[0]);
      const db = new Date((b.date || b.createdAt || "").split("T")[0]);
      if (da - db !== 0) return da - db;
      return (a.id || 0) - (b.id || 0);
    });

    let runningBal = parseFloat(selectedAccount.openingBalance) || 0;

    const transactionsWithBalances = sortedTransactions.map((t) => {
      const amt = parseFloat(t.amount) || 0;
      if (t.balanceAfter !== undefined && t.balanceAfter !== null) {
        runningBal = parseFloat(t.balanceAfter);
      } else {
        if (t.transactionType === "credit") {
          runningBal += amt;
        } else {
          runningBal -= amt;
        }
      }
      return {
        ...t,
        balanceAfter: runningBal,
        formattedBalanceAfter: formatBalanceWithDrCr(runningBal),
      };
    });

    return transactionsWithBalances.filter((t) => {
      const tDate = new Date((t.date || t.createdAt || "").split("T")[0]);
      if (startDate && new Date(startDate) > tDate) return false;
      if (endDate && new Date(endDate) < tDate) return false;
      return true;
    });
  };

  const groupTransactionsByDay = () => {
    const grouped = {};
    const filteredTxns = getFilteredTransactionsWithBalances();

    filteredTxns.forEach((transaction) => {
      const date = (transaction.date || transaction.createdAt || "").split(
        "T",
      )[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
      .map(([date, transactions]) => ({
        date,
        transactions,
      }));
  };

  const handleDownloadExcel = () => {
    if (!selectedAccount) return;
    const filteredTxns = getFilteredTransactionsWithBalances();

    const openingRowDate = startDate
      ? formatDate(startDate)
      : formatDate(selectedAccount.openingDate || new Date());

    const exportData = [
      {
        Date: openingRowDate,
        Particulars: "Opening Balance",
        "Voucher Type": "-",
        "Voucher ID": "-",
        "Withdrawal(Dr)": "",
        "Deposit(Cr)": "",
        "Balance(INR)": formatBalanceWithDrCr(
          getPeriodOpeningBalance(),
        ).replace(/₹/g, "Rs. "),
      },
      ...filteredTxns.map((t) => ({
        Date: formatDate(t.date || t.createdAt),
        Particulars: t.ledgerName || t.description || "-",
        "Voucher Type":
          t.source === "manual" ? "Manual" : t.voucherType || "Voucher",
        "Voucher ID": t.voucherId || t.referenceNumber || "-",
        "Withdrawal(Dr)": t.transactionType === "debit" ? t.amount : "",
        "Deposit(Cr)": t.transactionType === "credit" ? t.amount : "",
        "Balance(INR)": formatBalanceWithDrCr(t.balanceAfter).replace(
          /₹/g,
          "Rs. ",
        ),
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Statement");
    XLSX.writeFile(workbook, `${selectedAccount.accountName}_Statement.xlsx`);
  };

  const handleDownloadPDF = () => {
    if (!selectedAccount) return;
    const doc = new jsPDF();
    const filteredTxns = getFilteredTransactionsWithBalances();

    doc.setFontSize(16);
    doc.text(`Bank Statement: ${selectedAccount.accountName}`, 14, 15);
    doc.setFontSize(10);
    doc.text(
      `Bank: ${selectedAccount.bankName} | Acc: ${selectedAccount.accountNumber}`,
      14,
      22,
    );

    const openingRowDate = startDate
      ? formatDate(startDate)
      : formatDate(selectedAccount.openingDate || new Date());

    const tableData = [
      [
        openingRowDate,
        "Opening Balance",
        "-",
        "-",
        "",
        "",
        formatBalanceWithDrCr(getPeriodOpeningBalance()).replace(/₹/g, "Rs. "),
      ],
      ...filteredTxns.map((t) => [
        formatDate(t.date || t.createdAt),
        t.ledgerName || t.description || "-",
        t.source === "manual" ? "Manual" : t.voucherType || "Voucher",
        t.voucherId || t.referenceNumber || "-",
        t.transactionType === "debit" ? formatCurrency(t.amount).replace("₹", "").trim() : "",
        t.transactionType === "credit" ? formatCurrency(t.amount).replace("₹", "").trim() : "",
        formatBalanceWithDrCr(t.balanceAfter).replace(/₹/g, "Rs. "),
      ]),
    ];

    autoTable(doc, {
      startY: 30,
      head: [
        [
          "Date",
          "Particulars",
          "Voucher Type",
          "Voucher ID",
          "Withdrawal(Dr)",
          "Deposit(Cr)",
          "Balance(INR)",
        ],
      ],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`${selectedAccount.accountName}_Statement.pdf`);
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

  const calculateDailySummary = (transactions) => {
    const credits = transactions
      .filter((t) => t.transactionType === "credit")
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const debits = transactions
      .filter((t) => t.transactionType === "debit")
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    return {
      credits: formatCurrency(credits),
      debits: formatCurrency(debits),
      net: formatBalanceWithDrCr(credits - debits),
    };
  };

  const totalNetBalance = filteredBankAccounts.reduce(
    (sum, acc) => sum + (parseFloat(acc.currentBalance) || 0),
    0,
  );

  return (
    <div className="erp-root app-shell p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="app-title flex items-center gap-2.5">
              <Banknote className="size-7 text-(--brand)" />
              Bank Activities
            </h1>
            <p className="app-subtitle mt-1">
              Manage company bank accounts, monitor daily transactions, and
              export financial statements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAddAccount}
              className="app-btn-primary flex items-center gap-2 cursor-pointer"
            >
              <Plus className="size-4" />
              Add Bank Account
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="app-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-(--text-soft)">
                  Total Bank Accounts
                </p>
                <div className="mt-2 text-[26px] font-extrabold leading-none text-(--text-strong)">
                  {filteredBankAccounts.length}
                </div>
                <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
                  Active company accounts
                </p>
              </div>
              <div className="size-10 rounded-2xl bg-(--brand-soft) border border-(--border-soft) flex items-center justify-center shrink-0">
                <Building2 className="size-5 text-(--brand)" />
              </div>
            </div>
          </div>

          <div className="app-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-(--text-soft)">
                  Aggregated Net Balance
                </p>
                <div className="mt-2 text-[24px] font-extrabold leading-none text-(--text-strong)">
                  {formatBalanceWithDrCr(totalNetBalance)}
                </div>
                <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
                  Across all filtered bank accounts
                </p>
              </div>
              <div className="size-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <Wallet className="size-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="app-panel p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-(--text-soft)">
                  Selected Account
                </p>
                <div className="mt-2 text-[20px] font-extrabold leading-tight text-(--text-strong) truncate">
                  {selectedAccount
                    ? selectedAccount.accountName
                    : "None Selected"}
                </div>
                <p className="mt-1 text-[13px] font-bold text-(--brand)">
                  {selectedAccount
                    ? formatBalanceWithDrCr(selectedAccount.currentBalance)
                    : "Select an account below"}
                </p>
              </div>
              <div className="size-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                <Banknote className="size-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="app-panel overflow-hidden flex flex-col h-full">
              <div className="app-section-bar px-4 py-3 flex items-center justify-between">
                <h3 className="app-heading flex items-center gap-2">
                  <CreditCard className="size-4 text-(--brand)" />
                  Accounts
                </h3>
              </div>

              <div className="p-3 border-b border-(--border-soft) bg-white">
                <div className="relative">
                  <input
                    type="text"
                    value={accountSearchTerm}
                    onChange={(e) => setAccountSearchTerm(e.target.value)}
                    placeholder="Search account, bank or number..."
                    className="app-input w-full pl-9 pr-8 text-[13px]"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-(--text-faint)" />
                  {accountSearchTerm && (
                    <button
                      onClick={() => setAccountSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-faint) hover:text-(--text-strong)"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-(--border-soft) overflow-y-auto max-h-155">
                {filteredBankAccounts.length === 0 ? (
                  <div className="p-8 text-center">
                    <CreditCard className="size-10 text-(--text-faint) mx-auto mb-3" />
                    <p className="text-[14px] font-bold text-(--text-strong)">
                      No bank accounts found
                    </p>
                    <p className="text-[12px] text-(--text-soft) mt-1">
                      {accountSearchTerm
                        ? "Try adjusting your search query."
                        : "Add your first bank account to get started."}
                    </p>
                    {!accountSearchTerm && (
                      <button
                        onClick={handleAddAccount}
                        className="mt-4 app-btn-primary text-[13px] py-1.5 px-4"
                      >
                        Add Bank Account
                      </button>
                    )}
                  </div>
                ) : (
                  filteredBankAccounts.map((account) => {
                    const isSelected = selectedAccount?.id === account.id;

                    return (
                      <div
                        key={account.id}
                        onClick={() => handleAccountSelect(account)}
                        className={`p-4 transition-all duration-180 cursor-pointer hover:bg-(--bg-subtle)/60 ${
                          isSelected ? "bg-(--brand-soft)/80" : "bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div
                                className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "bg-(--brand) text-white"
                                    : "bg-(--brand-soft) text-(--brand)"
                                }`}
                              >
                                <Banknote className="size-4" />
                              </div>
                              <h4 className="text-[14px] font-bold text-(--text-strong) truncate">
                                {account.accountName}
                              </h4>
                            </div>

                            <p className="text-[12px] font-semibold text-(--text-soft) mt-1.5 pl-1 truncate">
                              {account.bankName}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-(--text-faint) pl-1">
                              <span className="inline-flex items-center gap-1">
                                Acc:{" "}
                                <strong className="text-(--text-body)">
                                  {account.accountNumber}
                                </strong>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(
                                      account.accountNumber,
                                    );
                                  }}
                                  className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                  title="Copy Account Number"
                                >
                                  <Copy className="size-3" />
                                </button>
                              </span>
                              <span className="inline-flex items-center gap-1">
                                IFSC:{" "}
                                <strong className="text-(--text-body)">
                                  {account.ifscCode}
                                </strong>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(
                                      account.ifscCode,
                                    );
                                  }}
                                  className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                  title="Copy IFSC Code"
                                >
                                  <Copy className="size-3" />
                                </button>
                              </span>
                            </div>

                            <div className="mt-1 text-[11px] font-medium text-(--text-faint) pl-1">
                              Opening:{" "}
                              {formatBalanceWithDrCr(account.openingBalance)}
                            </div>

                            <div className="flex items-center justify-between mt-3 pl-1 pt-2 border-t border-(--border-soft)/60">
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                {account.accountType
                                  ? account.accountType
                                      .charAt(0)
                                      .toUpperCase() +
                                    account.accountType.slice(1)
                                  : "N/A"}
                              </span>
                              <span className="text-[14px] font-extrabold text-(--text-strong)">
                                {account.formattedBalance ||
                                  formatBalanceWithDrCr(account.currentBalance)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAccount(account);
                              }}
                              className="app-icon-button p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit Account"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAccount(account.id);
                              }}
                              className="app-icon-button p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Delete Account"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
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
                      onClick={() => setShowStatementModal(true)}
                      className="app-btn-secondary flex items-center gap-2 text-[13px] bg-white cursor-pointer shadow-xs"
                    >
                      <FileText className="size-4 text-(--brand)" />
                      Statement
                    </button>
                    <button
                      onClick={handleAddTransaction}
                      className="app-btn-primary flex items-center gap-2 text-[13px] cursor-pointer"
                    >
                      <Plus className="size-4" />
                      Add Transaction
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="app-panel p-10 flex flex-col justify-center items-center gap-3">
                    <div className="animate-spin rounded-full size-8 border-3 border-(--brand) border-t-transparent" />
                    <span className="text-[13px] font-semibold text-(--text-soft)">
                      Fetching transactions...
                    </span>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="app-panel p-10 text-center">
                    <FileText className="size-12 text-(--text-faint) mx-auto mb-3" />
                    <h4 className="text-[16px] font-bold text-(--text-strong) mb-1">
                      No Transactions Recorded
                    </h4>
                    <p className="text-[13px] text-(--text-soft) mb-6">
                      Start recording credits and debits for this account.
                    </p>
                    <button
                      onClick={handleAddTransaction}
                      className="app-btn-primary text-[13px] py-2 px-5 inline-flex items-center gap-2"
                    >
                      <Plus className="size-4" />
                      Add First Transaction
                    </button>
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
                              Withdrawal (Dr)
                            </th>
                            <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                              Deposit (Cr)
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
                              const isCredit =
                                transaction.transactionType === "credit";
                              return (
                                <tr
                                  key={`${transaction.source}-${transaction.id}`}
                                  className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-200 group"
                                >
                                  <td className="py-3 px-4 border-r border-[#e2f2e9] text-[13px] font-medium text-slate-600 whitespace-nowrap">
                                    {formatDate(
                                      transaction.date || transaction.createdAt,
                                    )}
                                  </td>
                                  <td
                                    className="py-3 px-4 border-r border-[#e2f2e9] font-semibold text-[#042f2e] text-[13px] max-w-xs truncate"
                                    title={
                                      transaction.ledgerName ||
                                      transaction.description ||
                                      "-"
                                    }
                                  >
                                    {transaction.ledgerName ||
                                      transaction.description ||
                                      "-"}
                                  </td>
                                  <td className="py-3 px-4 border-r border-[#e2f2e9] text-[13px] font-medium text-slate-600 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                      {transaction.source === "manual"
                                        ? "Manual"
                                        : transaction.voucherType || "Voucher"}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 border-r border-[#e2f2e9] text-[13px] font-semibold text-slate-700 whitespace-nowrap">
                                    {transaction.voucherId ||
                                      transaction.referenceNumber ||
                                      "—"}
                                  </td>
                                  <td className="py-3 px-4 border-r border-[#e2f2e9] text-right text-[13px] font-bold text-rose-600 whitespace-nowrap">
                                    {!isCredit
                                      ? formatCurrency(transaction.amount)
                                          .replace("₹", "")
                                          .trim()
                                      : "—"}
                                  </td>
                                  <td className="py-3 px-4 border-r border-[#e2f2e9] text-right text-[13px] font-bold text-emerald-600 whitespace-nowrap">
                                    {isCredit
                                      ? formatCurrency(transaction.amount)
                                          .replace("₹", "")
                                          .trim()
                                      : "—"}
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
                  No Account Selected
                </h4>
                <p className="text-[13px] text-(--text-soft) max-w-sm mx-auto">
                  Select a bank account from the left panel to inspect its
                  transactions, credits, debits, and download statements.
                </p>
                {bankAccounts.length === 0 && (
                  <button
                    onClick={handleAddAccount}
                    className="mt-6 app-btn-primary text-[13px] py-2 px-5 inline-flex items-center gap-2"
                  >
                    <Plus className="size-4" />
                    Add Your First Bank Account
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddAccount && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 app-modal-backdrop">
          <div className="app-modal bg-(--bg-elevated) w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-(--border-soft) px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-(--brand-soft) border border-(--border-soft) flex items-center justify-center shrink-0">
                  <Building2 className="size-5 text-(--brand)" />
                </div>
                <div>
                  <h3 className="modal-title">
                    {isEditingAccount
                      ? "Edit Bank Account"
                      : "Add New Bank Account"}
                  </h3>
                  <p className="modal-subtitle">
                    Enter bank account details and initial balance
                    specifications.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddAccount(false)}
                className="app-icon-button p-2 text-(--text-soft) hover:text-(--text-strong) hover:bg-slate-100 rounded-xl"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAccountSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="modal-label block mb-1.5">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    value={newAccount.accountName}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        accountName: e.target.value,
                      })
                    }
                    className="app-input w-full"
                    placeholder="e.g. Main Operations Account"
                    required
                  />
                </div>

                <div>
                  <label className="modal-label block mb-1.5">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={newAccount.bankName}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, bankName: e.target.value })
                    }
                    className="app-input w-full"
                    placeholder="e.g. HDFC Bank"
                    required
                  />
                </div>

                <div>
                  <label className="modal-label block mb-1.5">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={newAccount.accountNumber}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        accountNumber: e.target.value,
                      })
                    }
                    className="app-input w-full"
                    placeholder="Enter account number"
                    required
                  />
                </div>

                <div>
                  <label className="modal-label block mb-1.5">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    value={newAccount.ifscCode}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, ifscCode: e.target.value })
                    }
                    className="app-input w-full"
                    placeholder="e.g. HDFC0001234"
                    required
                  />
                </div>

                <div>
                  <label className="modal-label block mb-1.5">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={newAccount.branchName}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        branchName: e.target.value,
                      })
                    }
                    className="app-input w-full"
                    placeholder="Enter branch location"
                  />
                </div>

                <div>
                  <label className="modal-label block mb-1.5">
                    Account Type
                  </label>
                  <select
                    value={newAccount.accountType}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        accountType: e.target.value,
                      })
                    }
                    className="app-input w-full"
                  >
                    <option value="">Select Group Type</option>
                    <option value="savings">Savings Account</option>
                    <option value="current">Current Account</option>
                    <option value="salary">Salary Account</option>
                    <option value="fixed">Fixed Deposit</option>
                    {groups.map((group) => (
                      <option
                        key={group.id}
                        value={group.groupName || group.name}
                      >
                        {group.groupName || group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="modal-label block mb-1.5">
                    Opening Date
                  </label>
                  <input
                    type="date"
                    value={newAccount.openingDate}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        openingDate: e.target.value,
                      })
                    }
                    className="app-input w-full"
                  />
                </div>

                <div>
                  <label className="modal-label block mb-1.5">
                    Opening Balance
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newAccount.openingBalance}
                      onChange={(e) =>
                        setNewAccount({
                          ...newAccount,
                          openingBalance: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="app-input flex-1"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    <select
                      value={newAccount.openingBalanceType}
                      onChange={(e) =>
                        setNewAccount({
                          ...newAccount,
                          openingBalanceType: e.target.value,
                        })
                      }
                      className="app-input w-20 font-bold"
                    >
                      <option value="Dr">Dr</option>
                      <option value="Cr">Cr</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-(--border-soft)">
                <button
                  type="button"
                  onClick={() => setShowAddAccount(false)}
                  className="app-btn-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn-primary flex items-center gap-2 cursor-pointer"
                >
                  <Check className="size-4" />
                  {isEditingAccount ? "Update Account" : "Add Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddTransaction && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 app-modal-backdrop">
          <div className="app-modal bg-(--bg-elevated) w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-(--border-soft) px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <TrendingUp className="size-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="modal-title">
                    {isEditingTransaction
                      ? "Edit Transaction"
                      : "Add New Transaction"}
                  </h3>
                  <p className="modal-subtitle">
                    Record a credit or debit entry for{" "}
                    <strong className="text-(--text-strong)">
                      {selectedAccount?.accountName}
                    </strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddTransaction(false)}
                className="app-icon-button p-2 text-(--text-soft) hover:text-(--text-strong) hover:bg-slate-100 rounded-xl"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleTransactionSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="modal-label block mb-1.5">Date *</label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        date: e.target.value,
                      })
                    }
                    className="app-input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="modal-label block mb-1.5">
                    Transaction Type *
                  </label>
                  <select
                    value={newTransaction.transactionType}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        transactionType: e.target.value,
                      })
                    }
                    className="app-input w-full"
                  >
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                </div>

                <div>
                  <label className="modal-label block mb-1.5">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="app-input w-full font-bold"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="modal-label block mb-1.5">Category</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        category: e.target.value,
                      })
                    }
                    className="app-input w-full"
                  >
                    <option value="">Select Category</option>
                    <option value="salary">Salary</option>
                    <option value="business-income">Business Income</option>
                    <option value="client-payment">Client Payment</option>
                    <option value="office-rent">Office Rent</option>
                    <option value="utilities">Utilities</option>
                    <option value="supplies">Supplies</option>
                    <option value="tax-payment">Tax Payment</option>
                    <option value="loan-payment">Loan Payment</option>
                    <option value="investment">Investment</option>
                    <option value="transfer">Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="modal-label block mb-1.5">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        description: e.target.value,
                      })
                    }
                    className="app-input w-full"
                    placeholder="Enter transaction purpose or narration"
                    required
                  />
                </div>

                <div>
                  <label className="modal-label block mb-1.5">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={newTransaction.referenceNumber}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        referenceNumber: e.target.value,
                      })
                    }
                    className="app-input w-full"
                    placeholder="e.g. UTR-20260725-001"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-(--border-soft)">
                <button
                  type="button"
                  onClick={() => setShowAddTransaction(false)}
                  className="app-btn-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn-primary flex items-center gap-2 cursor-pointer"
                >
                  <Check className="size-4" />
                  {isEditingTransaction
                    ? "Update Transaction"
                    : "Add Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStatementModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 app-modal-backdrop">
          <div className="app-modal bg-(--bg-elevated) w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-(--border-soft) px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                  <FileText className="size-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="modal-title">
                    Bank Statement: {selectedAccount?.accountName}
                  </h3>
                  <p className="modal-subtitle">
                    Bank: <strong>{selectedAccount?.bankName}</strong> | Acc:{" "}
                    <strong>{selectedAccount?.accountNumber}</strong>
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
                          Withdrawal(Dr)
                        </th>
                        <th className="px-4 py-2.5 text-right text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                          Deposit(Cr)
                        </th>
                        <th className="px-4 py-2.5 text-right text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                          Balance(INR)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-(--border-soft)">
                      <tr className="bg-slate-50 font-bold border-b border-(--border-strong)">
                        <td className="px-4 py-3 whitespace-nowrap text-[13px] text-(--text-strong)">
                          {startDate
                            ? formatDate(startDate)
                            : selectedAccount?.openingDate
                              ? formatDate(
                                  selectedAccount.openingDate.split("T")[0],
                                )
                              : "-"}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-(--text-strong)">
                          Opening Balance
                        </td>
                        <td className="px-4 py-3 text-center">-</td>
                        <td className="px-4 py-3 text-center">-</td>
                        <td className="px-4 py-3 text-right"></td>
                        <td className="px-4 py-3 text-right"></td>
                        <td className="px-4 py-3 whitespace-nowrap text-[14px] font-extrabold text-(--text-strong) text-right">
                          {formatBalanceWithDrCr(getPeriodOpeningBalance())
                            .replace("₹", "")
                            .trim()}
                        </td>
                      </tr>

                      {getFilteredTransactionsWithBalances().map(
                        (transaction) => (
                          <tr
                            key={`${transaction.source}-${transaction.id}`}
                            className="hover:bg-(--bg-subtle)/70 transition-colors"
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-[13px] font-medium text-(--text-body)">
                              {formatDate(
                                transaction.date || transaction.createdAt,
                              )}
                            </td>
                            <td
                              className="px-4 py-3 text-[13px] font-semibold text-(--text-strong) max-w-70 truncate"
                              title={
                                transaction.ledgerName ||
                                transaction.description ||
                                "-"
                              }
                            >
                              {transaction.ledgerName ||
                                transaction.description ||
                                "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-[13px] font-medium text-(--text-body)">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                {transaction.source === "manual"
                                  ? "Manual"
                                  : transaction.voucherType || "Voucher"}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-[13px] font-semibold text-(--text-strong)">
                              {transaction.voucherId ||
                                transaction.referenceNumber ||
                                "—"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-[13px] font-bold text-rose-600 text-right">
                              {transaction.transactionType === "debit"
                                ? formatCurrency(transaction.amount)
                                    .replace("₹", "")
                                    .trim()
                                : ""}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-[13px] font-bold text-emerald-600 text-right">
                              {transaction.transactionType === "credit"
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

export default BankActivities;
