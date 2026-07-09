import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCompany } from '../context/CompanyContext';
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
  Wallet
} from 'lucide-react';

const CashActivities = () => {
  const [cashAccounts, setCashAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [isEditingTransaction, setIsEditingTransaction] = useState(false);
  const { companyId } = useCompany();

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    transactionType: 'credit', // credit = incoming cash (Receipt), debit = outgoing cash (Payment)
    amount: 0,
    category: '',
    referenceNumber: '',
    balanceAfter: 0
  });

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Fetch Cash Ledgers (under Cash-in-hand group)
  const fetchCashAccounts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`
      );
      
      // Filter ledgers that are under "Cash-in-hand" group
      const cashLedgers = (data || []).filter(ledger => 
        (ledger.underGroup || "").toLowerCase().includes("cash-in-hand") ||
        (ledger.under || "").toLowerCase().includes("cash-in-hand") ||
        (ledger.name || "").toLowerCase() === "cash"
      );

      let formattedAccounts = cashLedgers.map(account => ({
        ...account,
        id: account.id,
        accountName: account.name,
        currentBalance: parseFloat(account.closingBalance || account.openingBalance) || 0,
        formattedBalance: formatCurrency(parseFloat(account.closingBalance || account.openingBalance) || 0)
      }));

      // Check if there are any transactions with literal 'cash' ID
      // If so, and we don't have a ledger named 'Cash', we should show it or merge it.
      // For now, let's just ensure if no accounts are found, we provide a default one
      if (formattedAccounts.length === 0) {
        formattedAccounts.push({
          id: 'cash',
          accountName: 'Default Cash',
          underGroup: 'Cash-in-hand',
          currentBalance: 0, // We could fetch this from backend
          formattedBalance: formatCurrency(0)
        });
      }

      setCashAccounts(formattedAccounts);
      
      // Select first account by default if none selected
      if (formattedAccounts.length > 0 && !selectedAccount) {
        setSelectedAccount(formattedAccounts[0]);
      }
    } catch (err) {
      console.error('Error fetching cash accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions for selected cash ledger
  const fetchTransactions = async (ledgerId) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/transaction/ledger/${companyId}/${ledgerId}`
      );
      
      if (data.success) {
        const formattedTransactions = data.transactions.map(transaction => {
            // In voucher_transactions: 
            // debit > 0 means money came in (Receipt/Contra) -> Incoming
            // credit > 0 means money went out (Payment/Contra) -> Outgoing
            // NOTE: For Cash ledger, Debit is Increase, Credit is Decrease.
            const isIncoming = (parseFloat(transaction.debit) || 0) > 0;
            const amount = isIncoming ? parseFloat(transaction.debit) : parseFloat(transaction.credit);

            return {
                ...transaction,
                transactionType: isIncoming ? 'credit' : 'debit', // Using 'credit' as label for incoming to match BankActivities CSS
                amount: amount,
                formattedAmount: formatCurrency(amount),
                description: transaction.narration || `${transaction.voucherType} Voucher`
            };
        });
        setTransactions(formattedTransactions);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchCashAccounts();
    }
  }, [companyId]);

  useEffect(() => {
    if (selectedAccount) {
      fetchTransactions(selectedAccount.id);
    }
  }, [selectedAccount]);

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
  };

  const handleAddTransaction = () => {
    if (!selectedAccount) {
      alert('Please select a cash account first');
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
      balanceAfter: 0
    });
    setShowAddTransaction(true);
  };

  // Simplified submit - in a real app, this would create a Payment or Receipt Voucher
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    alert("In this demo, manual cash entries should be done via Payment or Receipt Vouchers for full accounting integrity.");
    setShowAddTransaction(false);
  };

  // Helper functions for UI
  const groupTransactionsByDay = () => {
    const groups = {};
    transactions.forEach(t => {
      const date = new Date(t.date).toISOString().split('T')[0];
      if (!groups[date]) groups[date] = { date, transactions: [] };
      groups[date].transactions.push(t);
    });
    return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const calculateDailySummary = (dayTransactions) => {
    let credits = 0;
    let debits = 0;
    dayTransactions.forEach(t => {
      if (t.transactionType === 'credit') credits += t.amount;
      else debits += t.amount;
    });
    return {
      credits: formatCurrency(credits),
      debits: formatCurrency(debits),
      net: formatCurrency(credits - debits)
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTransactionIcon = (type) => {
    return type === 'credit' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />;
  };

  const getTransactionColor = (type) => {
    return type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cash Activities</h1>
            <p className="text-gray-500">Manage your cash-in-hand and petty cash</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Total Cash</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatCurrency(cashAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0))}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Across {cashAccounts.length} accounts</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Incoming (MTD)</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatCurrency(transactions.filter(t => t.transactionType === 'credit').reduce((sum, t) => sum + t.amount, 0))}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Cash received this month</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <TrendingDown className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">Outgoing (MTD)</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatCurrency(transactions.filter(t => t.transactionType === 'debit').reduce((sum, t) => sum + t.amount, 0))}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Cash paid this month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Cash Ledgers */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-800">Cash Ledgers</h3>
              <span className="text-sm text-gray-500">{cashAccounts.length}</span>
            </div>
            
            <div className="divide-y divide-gray-100">
              {cashAccounts.length === 0 ? (
                <div className="p-8 text-center">
                  <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No cash ledgers found</p>
                  <p className="text-xs text-gray-400 mt-2">Create a ledger under 'Cash-in-hand' group to see it here.</p>
                </div>
              ) : (
                cashAccounts.map((account) => (
                  <div 
                    key={account.id}
                    className={`p-5 hover:bg-gray-50 cursor-pointer transition-all ${
                      selectedAccount?.id === account.id ? 'bg-blue-50/50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'
                    }`}
                    onClick={() => handleAccountSelect(account)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${selectedAccount?.id === account.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{account.accountName}</h4>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">{account.underGroup || account.under}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{account.formattedBalance}</p>
                        <p className="text-xs text-gray-400">Current Balance</p>
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
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Wallet className="w-32 h-32" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedAccount.accountName}</h3>
                    <div className="flex items-center mt-2 space-x-6 text-gray-600">
                      <span className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1.5 text-green-500" />
                        Balance: {selectedAccount.formattedBalance}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => alert("Please use Payment or Receipt Vouchers to add transactions.")}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center font-medium"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    New Activity
                  </button>
                </div>
              </div>

              {/* Transactions List */}
              {loading ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                  <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-gray-800 mb-2">No Activities Found</h4>
                  <p className="text-gray-500 max-w-xs mx-auto">There are no cash transactions recorded for this ledger yet.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {groupTransactionsByDay().map((dayGroup) => {
                    const dailySummary = calculateDailySummary(dayGroup.transactions);
                    
                    return (
                      <div key={dayGroup.date} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        {/* Day Header */}
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center">
                              <Calendar className="w-5 h-5 text-blue-500 mr-2.5" />
                              <h4 className="font-bold text-gray-900">{formatDate(dayGroup.date)}</h4>
                            </div>
                            <div className="flex items-center space-x-6 text-sm">
                              <div className="text-green-600">
                                <span className="text-gray-400 mr-1">In:</span>
                                <span className="font-bold">{dailySummary.credits}</span>
                              </div>
                              <div className="text-red-600">
                                <span className="text-gray-400 mr-1">Out:</span>
                                <span className="font-bold">{dailySummary.debits}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Transactions List */}
                        <div className="divide-y divide-gray-50">
                          {dayGroup.transactions.map((transaction) => (
                            <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className={`p-3 rounded-xl ${getTransactionColor(transaction.transactionType)} shadow-sm`}>
                                    {getTransactionIcon(transaction.transactionType)}
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-gray-900">{transaction.description}</h5>
                                    <div className="flex items-center mt-1 space-x-3">
                                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                        {transaction.voucherType}
                                      </span>
                                      <span className="text-xs text-gray-400 font-medium">#{transaction.voucherId}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <div className={`text-lg font-black ${
                                    transaction.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {transaction.transactionType === 'credit' ? '+' : '-'}
                                    {transaction.formattedAmount}
                                  </div>
                                  <p className="text-xs text-gray-400 font-medium mt-1">Transaction Total</p>
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
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
              <Wallet className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-800 mb-2">Select a Cash Ledger</h4>
              <p className="text-gray-500 max-w-xs mx-auto">Choose a cash ledger from the left panel to view its transaction history.</p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Form Modal (Simplified) */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">New Cash Activity</h2>
                <button 
                  onClick={() => setShowAddTransaction(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 bg-blue-50 rounded-2xl mb-8">
                <p className="text-blue-700 text-sm font-medium leading-relaxed">
                  To maintain proper accounting standards, please record cash transactions using 
                  <span className="font-bold underline ml-1 cursor-pointer">Payment Vouchers</span> (for outgoing cash) or 
                  <span className="font-bold underline ml-1 cursor-pointer">Receipt Vouchers</span> (for incoming cash).
                </p>
              </div>

              <div className="flex space-x-4">
                 <button 
                  onClick={() => setShowAddTransaction(false)}
                  className="flex-1 py-3 px-6 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashActivities;
