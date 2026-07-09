import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCompany } from '../context/CompanyContext';
import useAuth from '../../../hooks/useAuth';
import {
  Banknote,
  Plus,
  Check,
  CreditCard,
  Pencil,
  Trash2,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  UserRound,
  Download
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BankActivities = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isEditingTransaction, setIsEditingTransaction] = useState(false);
  const [showEmployeeActivity, setShowEmployeeActivity] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showStatementModal, setShowStatementModal] = useState(false);
  const { companyId } = useCompany();
  const { user } = useUser();
  const location = useLocation();
  const [groups, setGroups] = useState([]);

  const { user: authUser, role } = useAuth();
  const isEmployee = location.pathname.includes("/employee");
  const currentEmployeeId = authUser?.employee_id || authUser?.id || null;
  const loggedInRole = role?.toLowerCase() || "admin";
  const loggedInEmployeeId = authUser?.employee_id || null;

  // Form states
  const [newAccount, setNewAccount] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    currentBalance: 0,
    balanceType: 'Dr',
    openingDate: '',
    accountType: 'savings'
  });

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    transactionType: 'credit',
    amount: 0,
    category: '',
    referenceNumber: '',
    balanceAfter: 0,
    balanceAfterType: 'Dr'
  });

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatBalanceWithDrCr = (amount) => {
    const numericAmount = parseFloat(amount) || 0;
    const absVal = Math.abs(numericAmount);
    const suffix = numericAmount >= 0 ? ' Dr' : ' Cr';
    return formatCurrency(absVal) + suffix;
  };

  // Fetch bank accounts
  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/all`
      );

      if (data.success) {
        const formattedAccounts = data.accounts.map(account => ({
          ...account,
          formattedBalance: formatBalanceWithDrCr(account.currentBalance)
        })).sort((a, b) => b.id - a.id);
        setBankAccounts(formattedAccounts);
      }
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
      alert('Failed to fetch bank accounts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions for selected account (supports optional single-date voucher filter)
  const fetchTransactions = async (accountId, voucherDate = '') => {
    try {
      setLoading(true);
      const dateParam = voucherDate ? `?date=${voucherDate}` : '';
      const { data } = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank-transaction/${accountId}/all${dateParam}`
      );

      if (data.success) {
        const formattedTransactions = data.transactions.map(transaction => ({
          ...transaction,
          formattedAmount: formatCurrency(transaction.amount),
          formattedBalanceAfter: formatBalanceWithDrCr(transaction.balanceAfter)
        }));
        setTransactions(formattedTransactions);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      alert('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all groups for the Account Type dropdown
  const fetchGroups = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group/all/${companyId}`
      );
      // Normalise: API may return array, { groups: [] }, or { data: [] }
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.groups)
          ? data.groups
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setGroups(list);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setGroups([]);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchBankAccounts();
      fetchGroups();
    }
  }, [companyId]);

  const [voucherDateFilter, setVoucherDateFilter] = useState('');

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
      accountName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',
      currentBalance: 0,
      balanceType: 'Dr',
      openingDate: '',
      accountType: 'savings'
    });
    fetchGroups();
    setShowAddAccount(true);
  };

  const handleEditAccount = (account) => {
    setIsEditingAccount(true);
    const signedBalance = parseFloat(account.currentBalance) || 0;
    const absBalance = Math.abs(signedBalance);
    const balanceType = signedBalance >= 0 ? 'Dr' : 'Cr';

    const signedOpeningBalance = parseFloat(account.openingBalance) || 0;
    const absOpeningBalance = Math.abs(signedOpeningBalance);
    const openingBalanceType = signedOpeningBalance >= 0 ? 'Dr' : 'Cr';

    setNewAccount({
      ...account,
      currentBalance: absBalance,
      balanceType: balanceType,
      openingBalance: absOpeningBalance,
      openingBalanceType: openingBalanceType,
      openingDate: account.openingDate ? new Date(account.openingDate).toISOString().split('T')[0] : ''
    });
    fetchGroups();
    setShowAddAccount(true);
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bank account?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${id}/delete`
      );

      setBankAccounts(bankAccounts.filter((a) => a.id !== id));
      if (selectedAccount?.id === id) {
        setSelectedAccount(null);
        setTransactions([]);
      }
      alert('Bank account deleted successfully');
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Failed to delete bank account');
    }
  };

  const handleAddTransaction = () => {
    if (!selectedAccount) {
      alert('Please select a bank account first');
      return;
    }

    setIsEditingTransaction(false);
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      description: '',
      transactionType: 'credit',
      amount: 0,
      category: '',
      referenceNumber: '',
      balanceAfter: 0,
      balanceAfterType: 'Dr'
    });
    setShowAddTransaction(true);
  };

  const handleEditTransaction = (transaction) => {
    setIsEditingTransaction(true);
    const signedBalanceAfter = parseFloat(transaction.balanceAfter) || 0;
    const absBalanceAfter = Math.abs(signedBalanceAfter);
    const balanceAfterType = signedBalanceAfter >= 0 ? 'Dr' : 'Cr';
    setNewTransaction({
      ...transaction,
      date: transaction.date.split('T')[0],
      amount: parseFloat(transaction.amount) || 0,
      balanceAfter: absBalanceAfter,
      balanceAfterType: balanceAfterType
    });
    setShowAddTransaction(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank-transaction/${id}/delete`
      );

      setTransactions(transactions.filter((t) => t.id !== id));
      alert('Transaction deleted successfully');
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Failed to delete transaction');
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();

    if (!newAccount.accountName || !newAccount.bankName || !newAccount.accountNumber || !newAccount.ifscCode) {
      alert("Please fill all required fields");
      return;
    }

    const signedBalance = newAccount.balanceType === 'Dr'
      ? (parseFloat(newAccount.currentBalance) || 0)
      : -(parseFloat(newAccount.currentBalance) || 0);

    try {
      if (isEditingAccount) {
        const signedOpeningBalance = newAccount.openingBalanceType === 'Dr'
          ? (parseFloat(newAccount.openingBalance) || 0)
          : -(parseFloat(newAccount.openingBalance) || 0);

        const updateData = {
          ...newAccount,
          currentBalance: signedBalance,
          openingBalance: signedOpeningBalance
        };

        await axios.put(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${newAccount.id}/update`,
          updateData
        );

        const updatedAccounts = bankAccounts.map((acc) =>
          acc.id === newAccount.id ? {
            ...newAccount,
            currentBalance: signedBalance,
            openingBalance: signedOpeningBalance,
            formattedBalance: formatBalanceWithDrCr(signedBalance)
          } : acc
        );
        setBankAccounts(updatedAccounts);

        if (selectedAccount?.id === newAccount.id) {
          setSelectedAccount({
            ...newAccount,
            currentBalance: signedBalance,
            openingBalance: signedOpeningBalance,
            formattedBalance: formatBalanceWithDrCr(signedBalance)
          });
        }
      } else {
        const createData = {
          ...newAccount,
          openingBalance: signedBalance,
          currentBalance: signedBalance
        };

        const response = await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/create`,
          createData
        );

        if (response.data.success) {
          const newAccountWithId = {
            ...newAccount,
            id: response.data.id,
            openingBalance: signedBalance,
            currentBalance: signedBalance,
            formattedBalance: formatBalanceWithDrCr(signedBalance)
          };
          setBankAccounts([...bankAccounts, newAccountWithId]);
        }
      }

      setShowAddAccount(false);
      alert(isEditingAccount ? 'Account updated successfully' : 'Account created successfully');
    } catch (err) {
      console.error('Error saving account:', err);
      alert('Failed to save bank account');
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAccount) {
      alert('Please select a bank account first');
      return;
    }

    if (!newTransaction.date || !newTransaction.description || !newTransaction.amount) {
      alert('Please fill all required fields');
      return;
    }

    const signedBalanceAfter = newTransaction.balanceAfterType === 'Dr'
      ? (parseFloat(newTransaction.balanceAfter) || 0)
      : -(parseFloat(newTransaction.balanceAfter) || 0);

    const transactionData = {
      ...newTransaction,
      accountId: selectedAccount.id,
      amount: parseFloat(newTransaction.amount) || 0,
      balanceAfter: signedBalanceAfter
    };

    try {
      if (isEditingTransaction) {
        await axios.put(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank-transaction/${newTransaction.id}/update`,
          transactionData
        );

        const updatedTransactions = transactions.map((t) =>
          t.id === newTransaction.id ? {
            ...transactionData,
            formattedAmount: formatCurrency(transactionData.amount),
            formattedBalanceAfter: formatBalanceWithDrCr(signedBalanceAfter)
          } : t
        );
        setTransactions(updatedTransactions);
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank-transaction/${companyId}/create`,
          transactionData
        );

        if (response.data.success) {
          const newTransactionWithId = {
            ...transactionData,
            id: response.data.id,
            formattedAmount: formatCurrency(transactionData.amount),
            formattedBalanceAfter: formatBalanceWithDrCr(signedBalanceAfter)
          };
          setTransactions([...transactions, newTransactionWithId]);

          fetchBankAccounts();
          if (selectedAccount) {
            const updatedBalance = transactionData.transactionType === 'credit'
              ? parseFloat(selectedAccount.currentBalance) + parseFloat(transactionData.amount)
              : parseFloat(selectedAccount.currentBalance) - parseFloat(transactionData.amount);

            setSelectedAccount({
              ...selectedAccount,
              currentBalance: updatedBalance,
              formattedBalance: formatBalanceWithDrCr(updatedBalance)
            });
          }
        }
      }

      setShowAddTransaction(false);
      alert(isEditingTransaction ? 'Transaction updated successfully' : 'Transaction created successfully');
    } catch (err) {
      console.error('Error saving transaction:', err);
      alert('Failed to save transaction');
    }
  };

  const getPeriodOpeningBalance = () => {
    if (!selectedAccount) return 0;
    const filteredTxns = getFilteredTransactionsWithBalances();
    if (filteredTxns.length === 0) {
      return parseFloat(selectedAccount.openingBalance) || 0;
    }
    const oldestTxn = filteredTxns[filteredTxns.length - 1];
    let balBefore = oldestTxn.balanceAfter;
    if (oldestTxn.transactionType === 'credit') {
      balBefore -= parseFloat(oldestTxn.amount || 0);
    } else {
      balBefore += parseFloat(oldestTxn.amount || 0);
    }
    return balBefore;
  };

  const getOpeningBalanceDate = () => {
    if (startDate) return startDate;
    if (!selectedAccount) return '';
    
    let earliestDate = new Date(selectedAccount.openingDate || new Date());
    
    if (transactions && transactions.length > 0) {
      const sortedTxns = [...transactions].sort((a, b) => {
        const dateDiff = new Date(a.date) - new Date(b.date);
        if (dateDiff !== 0) return dateDiff;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      const oldestTxnDate = new Date(sortedTxns[0].date.split('T')[0]);
      if (oldestTxnDate < earliestDate) {
        earliestDate = oldestTxnDate;
      }
    }
    
    return earliestDate.toISOString().split('T')[0];
  };

  const getFilteredTransactionsWithBalances = () => {
    let currentBal = selectedAccount ? parseFloat(selectedAccount.currentBalance) || 0 : 0;
    const sortedTransactions = [...transactions].sort((a, b) => {
      const dateDiff = new Date(b.date) - new Date(a.date);
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const transactionsWithBalances = sortedTransactions.map(t => {
      const balanceAfter = currentBal;
      if (t.transactionType === 'credit') {
        currentBal -= parseFloat(t.amount || 0);
      } else {
        currentBal += parseFloat(t.amount || 0);
      }
      return {
        ...t,
        formattedBalanceAfter: formatBalanceWithDrCr(balanceAfter),
        balanceAfter
      };
    });

    return transactionsWithBalances.filter(t => {
      // Use voucher date field (not createdAt) for date-based filtering
      const tDate = new Date((t.date || t.createdAt || '').split('T')[0]);
      if (startDate && new Date(startDate) > tDate) return false;
      if (endDate && new Date(endDate) < tDate) return false;
      return true;
    });
  };

  const groupTransactionsByDay = () => {
    const grouped = {};
    const filteredTxns = getFilteredTransactionsWithBalances();

    filteredTxns.forEach(transaction => {
      // Group by voucher date (transaction.date), not by system createdAt
      const date = (transaction.date || transaction.createdAt || '').split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
      .map(([date, transactions]) => ({
        date,
        transactions
      }));
  };

  const handleDownloadExcel = () => {
    if (!selectedAccount) return;
    const filteredTxns = getFilteredTransactionsWithBalances();

    // Reverse so older is at top, like standard bank statement
    const chronologicalTxns = [...filteredTxns].reverse();

    const openingRowDate = startDate
      ? new Date(startDate).toLocaleDateString('en-IN')
      : new Date(selectedAccount.openingDate || new Date()).toLocaleDateString('en-IN');

    const exportData = [
      {
        Date: openingRowDate,
        Particulars: 'Opening Balance',
        'Vch Type': '-',
        'Vch No.': '-',
        Debit: '',
        Credit: '',
        Balance: formatBalanceWithDrCr(getPeriodOpeningBalance()).replace(/₹/g, 'Rs. ')
      },
      ...chronologicalTxns.map(t => ({
        Date: new Date(t.createdAt || t.date).toLocaleDateString('en-IN'),
        Particulars: t.description,
        'Vch Type': t.category || (t.source === 'voucher' ? 'Voucher' : 'Manual'),
        'Vch No.': t.referenceNumber || '',
        Debit: t.transactionType === 'debit' ? t.amount : '',
        Credit: t.transactionType === 'credit' ? t.amount : '',
        Balance: formatBalanceWithDrCr(t.balanceAfter).replace(/₹/g, 'Rs. ')
      }))
    ];

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Statement');
    XLSX.writeFile(workbook, `${selectedAccount.accountName}_Statement.xlsx`);
  };

  const handleDownloadPDF = () => {
    if (!selectedAccount) return;
    const doc = new jsPDF();
    const filteredTxns = getFilteredTransactionsWithBalances();
    const chronologicalTxns = [...filteredTxns].reverse();

    doc.setFontSize(16);
    doc.text(`Bank Statement: ${selectedAccount.accountName}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Bank: ${selectedAccount.bankName} | Acc: ${selectedAccount.accountNumber}`, 14, 22);

    const openingRowDate = startDate
      ? new Date(startDate).toLocaleDateString('en-IN')
      : new Date(selectedAccount.openingDate || new Date()).toLocaleDateString('en-IN');

    const tableData = [
      [
        openingRowDate,
        'Opening Balance',
        '-',
        '-',
        '',
        '',
        formatBalanceWithDrCr(getPeriodOpeningBalance()).replace(/₹/g, 'Rs. ')
      ],
      ...chronologicalTxns.map(t => [
        new Date(t.createdAt || t.date).toLocaleDateString('en-IN'),
        t.description,
        t.category || (t.source === 'voucher' ? 'Voucher' : 'Manual'),
        t.referenceNumber || '-',
        t.transactionType === 'debit' ? t.amount : '',
        t.transactionType === 'credit' ? t.amount : '',
        formatBalanceWithDrCr(t.balanceAfter).replace(/₹/g, 'Rs. ')
      ])
    ];

    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Particulars', 'Vch Type', 'Vch No.', 'Debit', 'Credit', 'Balance']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save(`${selectedAccount.accountName}_Statement.pdf`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTransactionIcon = (type) => {
    if (type === 'credit') {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    }
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  const getTransactionColor = (type) => {
    if (type === 'credit') {
      return 'text-green-700 bg-green-50 border-green-200';
    }
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const calculateDailySummary = (transactions) => {
    const credits = transactions
      .filter(t => t.transactionType === 'credit')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const debits = transactions
      .filter(t => t.transactionType === 'debit')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    return {
      credits: formatCurrency(credits),
      debits: formatCurrency(debits),
      net: formatBalanceWithDrCr(credits - debits)
    };
  };

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
      const isCreatedByEmployee =
        account.creator_employee_id ||
        account.created_by_employee_id ||
        (account.employee_id && account.role?.toLowerCase() === 'employee');
      if (showEmployeeActivity) {
        if (!isCreatedByEmployee) return false;
      } else {
        if (isCreatedByEmployee) return false;
      }
    }
    return true;
  });

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-800 flex items-center">
                <Banknote className="w-8 h-8 mr-3" />
                Bank Activities
              </h1>
              <p className="text-blue-600 mt-1">Manage bank accounts and daily transactions</p>
            </div>

            <div className="flex items-center space-x-4">
              {!isEmployee && (
                <button
                  onClick={() => setShowEmployeeActivity(prev => !prev)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center text-sm font-semibold border ${showEmployeeActivity
                    ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    }`}
                >
                  <UserRound className="w-4 h-4 mr-2" />
                  {showEmployeeActivity ? "Back to My Accounts" : "Employee Activity"}
                </button>
              )}
              <button
                onClick={handleAddAccount}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Bank Account
              </button>
              {selectedAccount && (
                <button
                  onClick={handleAddTransaction}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Transaction
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Add/Edit Bank Account Modal */}
        {showAddAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  {isEditingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
                </h3>
                <button
                  onClick={() => setShowAddAccount(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAccountSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Name *</label>
                    <input
                      type="text"
                      value={newAccount.accountName}
                      onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Main Business Account"
                      required
                    />
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
                    <input
                      type="text"
                      value={newAccount.bankName}
                      onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., HDFC Bank"
                      required
                    />
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
                    <input
                      type="text"
                      value={newAccount.accountNumber}
                      onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter account number"
                      required
                    />
                  </div>

                  {/* IFSC Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code *</label>
                    <input
                      type="text"
                      value={newAccount.ifscCode}
                      onChange={(e) => setNewAccount({ ...newAccount, ifscCode: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., HDFC0001234"
                      required
                    />
                  </div>

                  {/* Branch Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                    <input
                      type="text"
                      value={newAccount.branchName}
                      onChange={(e) => setNewAccount({ ...newAccount, branchName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter branch name"
                    />
                  </div>

                  {/* Account Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                    <select
                      value={newAccount.accountType}
                      onChange={(e) => setNewAccount({ ...newAccount, accountType: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Group Type</option>
                      <option value="savings">Savings Account</option>
                      <option value="current">Current Account</option>
                      <option value="salary">Salary Account</option>
                      <option value="fixed">Fixed Deposit</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.groupName || group.name}>
                          {group.groupName || group.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Opening Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Opening Date</label>
                    <input
                      type="date"
                      value={newAccount.openingDate}
                      onChange={(e) => setNewAccount({ ...newAccount, openingDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {isEditingAccount ? (
                    <>
                      {/* Opening Balance (Editable) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Opening Balance</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={newAccount.openingBalance}
                            onChange={(e) => setNewAccount({ ...newAccount, openingBalance: parseFloat(e.target.value) || 0 })}
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter opening balance"
                            min="0"
                            step="0.01"
                          />
                          <select
                            value={newAccount.openingBalanceType}
                            onChange={(e) => setNewAccount({ ...newAccount, openingBalanceType: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-semibold text-gray-700"
                          >
                            <option value="Dr">Dr</option>
                            <option value="Cr">Cr</option>
                          </select>
                        </div>
                      </div>

                      {/* Current Balance (Editable) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Balance</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={newAccount.currentBalance}
                            onChange={(e) => setNewAccount({ ...newAccount, currentBalance: parseFloat(e.target.value) || 0 })}
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter current balance"
                            min="0"
                            step="0.01"
                          />
                          <select
                            value={newAccount.balanceType}
                            onChange={(e) => setNewAccount({ ...newAccount, balanceType: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-semibold text-gray-700"
                          >
                            <option value="Dr">Dr</option>
                            <option value="Cr">Cr</option>
                          </select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      {/* Opening Balance (Creation) */}
                      <label className="block text-sm font-medium text-gray-700 mb-2">Opening Balance</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={newAccount.currentBalance}
                          onChange={(e) => setNewAccount({ ...newAccount, currentBalance: parseFloat(e.target.value) || 0 })}
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter opening balance"
                          min="0"
                          step="0.01"
                        />
                        <select
                          value={newAccount.balanceType}
                          onChange={(e) => setNewAccount({ ...newAccount, balanceType: e.target.value })}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-semibold text-gray-700"
                        >
                          <option value="Dr">Dr</option>
                          <option value="Cr">Cr</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddAccount(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    {isEditingAccount ? 'Update Account' : 'Add Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add/Edit Transaction Modal */}
        {showAddTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  {isEditingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                </h3>
                <button
                  onClick={() => setShowAddTransaction(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleTransactionSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Transaction Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type *</label>
                    <select
                      value={newTransaction.transactionType}
                      onChange={(e) => setNewTransaction({ ...newTransaction, transactionType: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="credit">Credit (Deposit)</option>
                      <option value="debit">Debit (Withdrawal)</option>
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹) *</label>
                    <input
                      type="number"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newTransaction.category}
                      onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <input
                      type="text"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter transaction description"
                      required
                    />
                  </div>

                  {/* Reference Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                    <input
                      type="text"
                      value={newTransaction.referenceNumber}
                      onChange={(e) => setNewTransaction({ ...newTransaction, referenceNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., REF-20231201-001"
                    />
                  </div>

                  {/* Balance After */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Balance After Transaction</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={newTransaction.balanceAfter}
                        onChange={(e) => setNewTransaction({ ...newTransaction, balanceAfter: parseFloat(e.target.value) || 0 })}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter balance after transaction"
                        min="0"
                        step="0.01"
                      />
                      <select
                        value={newTransaction.balanceAfterType}
                        onChange={(e) => setNewTransaction({ ...newTransaction, balanceAfterType: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-semibold text-gray-700"
                      >
                        <option value="Dr">Dr</option>
                        <option value="Cr">Cr</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddTransaction(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    {isEditingTransaction ? 'Update Transaction' : 'Add Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Bank Accounts */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Bank Accounts</h3>
                <span className="text-sm text-gray-500">{filteredBankAccounts.length} accounts</span>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredBankAccounts.length === 0 ? (
                  <div className="p-8 text-center">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No bank accounts found</p>
                    <button
                      onClick={handleAddAccount}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Bank Account
                    </button>
                  </div>
                ) : (
                  filteredBankAccounts.map((account) => (
                    <div
                      key={account.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedAccount?.id === account.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                        }`}
                      onClick={() => handleAccountSelect(account)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <Banknote className="w-5 h-5 text-blue-600 mr-2" />
                            <h4 className="font-semibold text-gray-800">{account.accountName}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{account.bankName}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <span className="mr-4">Acc: {account.accountNumber}</span>
                            <span>IFSC: {account.ifscCode}</span>
                          </div>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <span className="text-xs text-gray-500 font-medium">Opening Balance: {formatBalanceWithDrCr(account.openingBalance)}</span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-sm font-medium px-2 py-1 rounded bg-blue-100 text-blue-800">
                              {account.accountType
                                ? account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)
                                : 'N/A'}
                            </span>
                            <div className="flex flex-col text-right">

                              <span className="font-bold text-gray-900 mt-1">
                                {account.formattedBalance || formatBalanceWithDrCr(account.currentBalance)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditAccount(account); }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteAccount(account.id); }}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Transactions */}
          <div className="lg:col-span-2">
            {selectedAccount ? (
              <div className="space-y-6">
                {/* Selected Account Header */}
                <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-green-800">{selectedAccount.accountName}</h3>
                      <div className="flex items-center mt-2 space-x-4 text-green-700">
                        <span className="flex items-center">
                          <Banknote className="w-4 h-4 mr-1" />
                          {selectedAccount.bankName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          Opening Balance:&nbsp;
                          <strong>{formatBalanceWithDrCr(selectedAccount.openingBalance)}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          Current Balance:&nbsp;
                          <strong>{selectedAccount.formattedBalance || formatBalanceWithDrCr(selectedAccount.currentBalance)}</strong>
                        </span>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => setShowStatementModal(true)}
                        className="bg-white border border-green-300 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center shadow-sm"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Download Statement
                      </button>
                    </div>
                  </div>
                </div>

                {/* Transactions by Day */}
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="ml-3 text-gray-600">Loading transactions...</span>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">No Transactions Yet</h4>
                    <p className="text-gray-500 mb-6">Start by adding your first transaction</p>
                    <button
                      onClick={handleAddTransaction}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add First Transaction
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {groupTransactionsByDay().map((dayGroup) => {
                      const dailySummary = calculateDailySummary(dayGroup.transactions);

                      return (
                        <div key={dayGroup.date} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                          {/* Day Header */}
                          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                                <h4 className="font-semibold text-gray-800">{formatDate(dayGroup.date)}</h4>
                              </div>
                              <div className="flex items-center space-x-6 text-sm">
                                <div className="text-green-600">
                                  <span className="font-medium">Credits: </span>
                                  {dailySummary.credits}
                                </div>
                                <div className="text-red-600">
                                  <span className="font-medium">Debits: </span>
                                  {dailySummary.debits}
                                </div>
                                <div className="font-bold text-gray-700">
                                  Net: {dailySummary.net}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Transactions List */}
                          <div className="divide-y divide-gray-200">
                            {dayGroup.transactions.map((transaction) => (
                              <div key={`${transaction.source}-${transaction.id}`} className="p-4 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-4">
                                    <div className={`p-2 rounded-lg ${getTransactionColor(transaction.transactionType)}`}>
                                      {getTransactionIcon(transaction.transactionType)}
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="font-medium text-gray-900">{transaction.description}</h5>
                                      <div className="flex items-center mt-1 text-sm text-gray-500 flex-wrap gap-2">
                                        {transaction.category && (
                                          <span className="px-2 py-1 rounded bg-gray-100">
                                            {transaction.category}
                                          </span>
                                        )}
                                        {transaction.referenceNumber && (
                                          <span>Ref: {transaction.referenceNumber}</span>
                                        )}
                                        {transaction.source === 'voucher' && (
                                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                            Voucher
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end ml-4">
                                    <div className="flex items-center space-x-3">
                                      <span className={`text-lg font-bold ${transaction.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {transaction.transactionType === 'credit' ? '+' : '-'}
                                        {transaction.formattedAmount || formatCurrency(transaction.amount)}
                                      </span>
                                      {transaction.source !== 'voucher' && (
                                        <div className="flex space-x-1">
                                          <button
                                            onClick={() => handleEditTransaction(transaction)}
                                            className="text-blue-600 hover:text-blue-800 p-1"
                                            title="Edit"
                                          >
                                            <Pencil className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteTransaction(transaction.id)}
                                            className="text-red-600 hover:text-red-800 p-1"
                                            title="Delete"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                    {transaction.balanceAfter !== undefined && transaction.balanceAfter !== null && (
                                      <span className="text-sm text-gray-500 mt-1">
                                        Balance: {transaction.formattedBalanceAfter || formatBalanceWithDrCr(transaction.balanceAfter)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Select a Bank Account</h4>
                <p className="text-gray-500">Select a bank account from the left panel to view transactions</p>
                {bankAccounts.length === 0 && (
                  <button
                    onClick={handleAddAccount}
                    className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your First Bank Account
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statement Download Modal */}
      {showStatementModal && (
        <div className="fixed inset-0 bg-black/50 back bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-xl font-semibold text-gray-800">
                Bank Statement: {selectedAccount?.accountName}
              </h3>
              <button
                onClick={() => setShowStatementModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="p-6 flex-1 flex flex-col space-y-6">
              {/* Filters & Export Options */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div className="mt-5">
                    <button
                      onClick={() => { setStartDate(''); setEndDate(''); }}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    className="bg-red-100 text-red-700 px-4 py-1.5 rounded-lg hover:bg-red-200 transition-colors flex items-center text-sm font-semibold"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                  <button
                    onClick={handleDownloadExcel}
                    className="bg-green-100 text-green-700 px-4 py-1.5 rounded-lg hover:bg-green-200 transition-colors flex items-center text-sm font-semibold"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                  </button>
                </div>
              </div>

              {/* Transactions Table Preview */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Particulars</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vch Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vch No.</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredTransactionsWithBalances().map((transaction) => (
                      <tr key={`${transaction.source}-${transaction.id}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate((transaction.createdAt || transaction.date).split('T')[0])}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium max-w-75 truncate" title={transaction.description}>
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.category || (transaction.source === 'voucher' ? 'Voucher' : 'Manual')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.referenceNumber || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium text-right">
                          {transaction.transactionType === 'debit' ? transaction.formattedAmount || formatCurrency(transaction.amount) : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium text-right">
                          {transaction.transactionType === 'credit' ? transaction.formattedAmount || formatCurrency(transaction.amount) : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-right">
                          {transaction.formattedBalanceAfter || formatBalanceWithDrCr(transaction.balanceAfter)}
                        </td>
                      </tr>
                    ))}
                    {getFilteredTransactionsWithBalances().length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                          No transactions found for the selected dates.
                        </td>
                      </tr>
                    )}
                    <tr className="bg-gray-100 font-semibold">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {startDate
                          ? formatDate(startDate)
                          : (selectedAccount?.openingDate ? formatDate(selectedAccount.openingDate.split('T')[0]) : '-')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        Opening Balance
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-right">
                        {formatBalanceWithDrCr(getPeriodOpeningBalance())}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BankActivities;