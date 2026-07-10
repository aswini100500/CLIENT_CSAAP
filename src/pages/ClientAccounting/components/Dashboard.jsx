import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Banknote,
  BarChart3,
  Calculator,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  PieChart,
  LineChart,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Shield,
  Target,
  Activity,
  Layers,
  FileText,
  AlertCircle,
  Printer,
} from "lucide-react";
import { useCompany } from "../context/CompanyContext";
import { FaBalanceScale } from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Dashboard = () => {
  const [profitLossData, setProfitLossData] = useState(null);
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("last-30-days");
  const [showIncomeDetails, setShowIncomeDetails] = useState(false);
  const [showExpenseDetails, setShowExpenseDetails] = useState(false);
  const [showAssetsDetails, setShowAssetsDetails] = useState(false);
  const [showLiabilitiesDetails, setShowLiabilitiesDetails] = useState(false);

  const { companyId } = useCompany();

  const dateRanges = [
    { id: "last-30-days", label: "Last 30 Days" },
    { id: "last-90-days", label: "Last 90 Days" },
    { id: "last-6-months", label: "Last 6 Months" },
    { id: "last-year", label: "Last Year" },
    { id: "this-year", label: "This Year" },
    { id: "custom", label: "Custom Range" },
  ];

  const fetchDashboardData = async () => {
    if (!companyId) return;

    setLoading(true);
    try {
      const profitLossResponse = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/profit-loss/${companyId}`,
        { withCredentials: true },
      );
      setProfitLossData(profitLossResponse.data);

      const balanceSheetResponse = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/balanceSheet/${companyId}`,
        { withCredentials: true },
      );
      setBalanceSheetData(balanceSheetResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [companyId]);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getFinancialHealth = (netProfit, totalIncome) => {
    if (totalIncome === 0)
      return {
        status: "Neutral",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };

    const profitMargin = (netProfit / totalIncome) * 100;

    if (profitMargin > 20)
      return {
        status: "Excellent",
        color: "text-green-600",
        bg: "bg-green-100",
      };
    if (profitMargin > 10)
      return {
        status: "Good",
        color: "text-emerald-600",
        bg: "bg-emerald-100",
      };
    if (profitMargin > 0)
      return { status: "Fair", color: "text-blue-600", bg: "bg-blue-100" };
    if (profitMargin === 0)
      return {
        status: "Breakeven",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    return { status: "Loss", color: "text-red-600", bg: "bg-red-100" };
  };

  const getLiquidityStatus = (assets, liabilities) => {
    if (liabilities === 0)
      return {
        status: "Excellent",
        color: "text-green-600",
        bg: "bg-green-100",
      };

    const ratio = assets / liabilities;

    if (ratio >= 2)
      return {
        status: "Excellent",
        color: "text-green-600",
        bg: "bg-green-100",
      };
    if (ratio >= 1.5)
      return {
        status: "Good",
        color: "text-emerald-600",
        bg: "bg-emerald-100",
      };
    if (ratio >= 1)
      return { status: "Adequate", color: "text-blue-600", bg: "bg-blue-100" };
    if (ratio >= 0.5)
      return { status: "Poor", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { status: "Critical", color: "text-red-600", bg: "bg-red-100" };
  };

  const getQuickMetrics = () => {
    if (!profitLossData || !balanceSheetData) return [];

    const totalIncome = profitLossData.totals?.totalIncome || 0;
    const totalExpenses = profitLossData.totals?.totalExpenses || 0;
    const netProfit = profitLossData.totals?.net || 0;
    const totalAssets = balanceSheetData.totals?.totalAssets || 0;
    const totalLiabilities = balanceSheetData.totals?.totalLiabilities || 0;

    return [
      {
        title: "Net Profit",
        value: formatCurrency(netProfit),
        change: calculatePercentageChange(netProfit, 0),
        icon: <DollarSign className="w-5 h-5" />,
        color: "bg-gradient-to-r from-green-500 to-emerald-600",
        trend: netProfit >= 0 ? "up" : "down",
      },
      {
        title: "Total Income",
        value: formatCurrency(totalIncome),
        change: calculatePercentageChange(totalIncome, 0),
        icon: <TrendingUpIcon className="w-5 h-5" />,
        color: "bg-gradient-to-r from-blue-500 to-cyan-600",
        trend: "up",
      },
      {
        title: "Total Expenses",
        value: formatCurrency(totalExpenses),
        change: calculatePercentageChange(totalExpenses, 0),
        icon: <TrendingDownIcon className="w-5 h-5" />,
        color: "bg-gradient-to-r from-amber-500 to-orange-600",
        trend: "down",
      },
      {
        title: "Net Worth",
        value: formatCurrency(totalAssets - totalLiabilities),
        change: calculatePercentageChange(totalAssets - totalLiabilities, 0),
        icon: <Wallet className="w-5 h-5" />,
        color: "bg-gradient-to-r from-purple-500 to-violet-600",
        trend: totalAssets - totalLiabilities >= 0 ? "up" : "down",
      },
    ];
  };

  const getIncomeBreakdown = () => {
    if (!profitLossData?.income) return [];
    return profitLossData.income.map((item) => ({
      name: item.ledgerName,
      value: item.credit,
      group: item.groupName,
    }));
  };

  const getExpenseBreakdown = () => {
    if (!profitLossData?.expenses) return [];
    return profitLossData.expenses.map((item) => ({
      name: item.ledgerName,
      value: item.debit,
      group: item.groupName,
    }));
  };

  const handleExport = async (format) => {
    if (format === "pdf") {
      try {
        const dashboardElement = document.getElementById("dashboard-content");
        if (!dashboardElement) return;

        const canvas = await html2canvas(dashboardElement, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("Dashboard_Report.pdf");
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF.");
      }
    } else if (format === "print") {
      window.print();
    } else {
      alert(`Exporting dashboard data as ${format.toUpperCase()}...`);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (!companyId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Company Selected
            </h2>
            <p className="text-gray-600 mb-6">
              Please select an existing company or create a new one to view the
              dashboard and access financial data.
            </p>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Tip:</strong> Use the company selector in the navigation
                bar to choose a company or create a new one.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard-content" className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Financial Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Overview of your company's financial health
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {dateRanges.map((range) => (
              <option key={range.id} value={range.id}>
                {range.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleRefresh}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getQuickMetrics().map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  {metric.value}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  {metric.change !== 0 && (
                    <>
                      {metric.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          metric.trend === "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {Math.abs(metric.change).toFixed(1)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${metric.color} text-white`}>
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-linear-to-r from-green-500 to-emerald-600 rounded-lg text-white">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Profit & Loss</h2>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                getFinancialHealth(
                  profitLossData?.totals?.net || 0,
                  profitLossData?.totals?.totalIncome || 0,
                ).bg
              } ${
                getFinancialHealth(
                  profitLossData?.totals?.net || 0,
                  profitLossData?.totals?.totalIncome || 0,
                ).color
              }`}
            >
              {
                getFinancialHealth(
                  profitLossData?.totals?.net || 0,
                  profitLossData?.totals?.totalIncome || 0,
                ).status
              }
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Banknote className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-700">Total Income</span>
              </div>
              <span className="text-lg font-bold text-green-700">
                {formatCurrency(profitLossData?.totals?.totalIncome || 0)}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-700">
                  Total Expenses
                </span>
              </div>
              <span className="text-lg font-bold text-red-700">
                {formatCurrency(profitLossData?.totals?.totalExpenses || 0)}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-linear-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <Calculator className="w-5 h-5 text-green-700" />
                <span className="font-bold text-gray-800">Net Profit/Loss</span>
              </div>
              <span
                className={`text-xl font-bold ${
                  (profitLossData?.totals?.net || 0) >= 0
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {formatCurrency(profitLossData?.totals?.net || 0)}
              </span>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowIncomeDetails(!showIncomeDetails)}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <Banknote className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-700">
                    Income Breakdown
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {profitLossData?.income?.length || 0} items
                  </span>
                </div>
                {showIncomeDetails ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {showIncomeDetails &&
                profitLossData?.income &&
                profitLossData.income.length > 0 && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="space-y-3">
                      {profitLossData.income.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-green-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.ledgerName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.groupName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-700">
                              {formatCurrency(item.credit)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Opening: {formatCurrency(item.openingBalance)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowExpenseDetails(!showExpenseDetails)}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-gray-700">
                    Expense Breakdown
                  </span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    {profitLossData?.expenses?.length || 0} items
                  </span>
                </div>
                {showExpenseDetails ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {showExpenseDetails &&
                profitLossData?.expenses &&
                profitLossData.expenses.length > 0 && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="space-y-3">
                      {profitLossData.expenses.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-red-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.ledgerName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.groupName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-700">
                              {formatCurrency(item.debit)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Opening: {formatCurrency(item.openingBalance)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-linear-to-r from-blue-500 to-cyan-600 rounded-lg text-white">
                <FaBalanceScale className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Balance Sheet</h2>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                getLiquidityStatus(
                  balanceSheetData?.totals?.totalAssets || 0,
                  balanceSheetData?.totals?.totalLiabilities || 0,
                ).bg
              } ${
                getLiquidityStatus(
                  balanceSheetData?.totals?.totalAssets || 0,
                  balanceSheetData?.totals?.totalLiabilities || 0,
                ).color
              }`}
            >
              {
                getLiquidityStatus(
                  balanceSheetData?.totals?.totalAssets || 0,
                  balanceSheetData?.totals?.totalLiabilities || 0,
                ).status
              }
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-700">
                    Total Assets
                  </span>
                </div>
                <p className="text-xl font-bold text-blue-700">
                  {formatCurrency(balanceSheetData?.totals?.totalAssets || 0)}
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Layers className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-gray-700">
                    Total Liabilities
                  </span>
                </div>
                <p className="text-xl font-bold text-amber-700">
                  {formatCurrency(
                    balanceSheetData?.totals?.totalLiabilities || 0,
                  )}
                </p>
              </div>
            </div>

            <div className="p-4 bg-linear-to-r from-blue-100 to-cyan-100 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-blue-700" />
                  <span className="font-bold text-gray-800">Net Equity</span>
                </div>
                <span className="text-xl font-bold text-blue-700">
                  {formatCurrency(
                    (balanceSheetData?.totals?.totalAssets || 0) -
                      (balanceSheetData?.totals?.totalLiabilities || 0),
                  )}
                </span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowAssetsDetails(!showAssetsDetails)}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-700">
                    Assets Breakdown
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {balanceSheetData?.assets?.length || 0} items
                  </span>
                </div>
                {showAssetsDetails ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {showAssetsDetails &&
                balanceSheetData?.assets &&
                balanceSheetData.assets.length > 0 && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="space-y-3">
                      {balanceSheetData.assets.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-blue-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.ledgerName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-700">
                              {formatCurrency(
                                item.closingDebit - item.closingCredit,
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              Opening:{" "}
                              {formatCurrency(
                                item.openingDebit - item.openingCredit,
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() =>
                  setShowLiabilitiesDetails(!showLiabilitiesDetails)
                }
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-gray-700">
                    Liabilities & Capital
                  </span>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                    {(balanceSheetData?.liabilities?.length || 0) +
                      (balanceSheetData?.capital?.length || 0)}{" "}
                    items
                  </span>
                </div>
                {showLiabilitiesDetails ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {showLiabilitiesDetails && (
                <div className="p-4 border-t border-gray-200">
                  {balanceSheetData?.liabilities &&
                  balanceSheetData.liabilities.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Liabilities
                      </h4>
                      {balanceSheetData.liabilities.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-amber-50 rounded-lg"
                        >
                          <p className="font-medium text-gray-800">
                            {item.ledgerName}
                          </p>
                          <p className="font-bold text-amber-700">
                            {formatCurrency(
                              item.closingCredit - item.closingDebit,
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No liabilities found
                    </p>
                  )}

                  {balanceSheetData?.capital &&
                    balanceSheetData.capital.length > 0 && (
                      <div className="space-y-3 mt-4">
                        <h4 className="font-medium text-gray-700 mb-2">
                          Capital
                        </h4>
                        {balanceSheetData.capital.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-purple-50 rounded-lg"
                          >
                            <p className="font-medium text-gray-800">
                              {item.ledgerName}
                            </p>
                            <p className="font-bold text-purple-700">
                              {formatCurrency(
                                item.closingCredit - item.closingDebit,
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-linear-to-r from-purple-500 to-violet-600 rounded-lg text-white">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Financial Health Insights
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-gray-800">Profitability</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Profit Margin</span>
                <span
                  className={`font-medium ${
                    (profitLossData?.totals?.net || 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {profitLossData?.totals?.totalIncome
                    ? `${((profitLossData.totals.net / profitLossData.totals.totalIncome) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Return on Assets</span>
                <span className="font-medium text-blue-600">
                  {balanceSheetData?.totals?.totalAssets
                    ? `${(((profitLossData?.totals?.net || 0) / balanceSheetData.totals.totalAssets) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Banknote className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-800">Liquidity</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Ratio</span>
                <span className="font-medium text-blue-600">
                  {balanceSheetData?.totals?.totalLiabilities
                    ? (
                        balanceSheetData.totals.totalAssets /
                        balanceSheetData.totals.totalLiabilities
                      ).toFixed(2)
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Debt to Equity</span>
                <span className="font-medium text-amber-600">
                  {balanceSheetData?.totals?.totalLiabilities
                    ? (
                        balanceSheetData.totals.totalLiabilities /
                          (balanceSheetData.totals.totalAssets -
                            balanceSheetData.totals.totalLiabilities) || 0
                      ).toFixed(2)
                    : "0"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <LineChart className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-800">Efficiency</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Income Growth</span>
                <span className="font-medium text-green-600">
                  {calculatePercentageChange(
                    profitLossData?.totals?.totalIncome || 0,
                    0,
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Expense Growth</span>
                <span className="font-medium text-red-600">
                  {calculatePercentageChange(
                    profitLossData?.totals?.totalExpenses || 0,
                    0,
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-linear-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-bold text-gray-800 mb-1">Recommendations</h4>
              <p className="text-sm text-gray-600">
                {(() => {
                  const netProfit = profitLossData?.totals?.net || 0;
                  const totalIncome = profitLossData?.totals?.totalIncome || 0;
                  const totalAssets =
                    balanceSheetData?.totals?.totalAssets || 0;
                  const totalLiabilities =
                    balanceSheetData?.totals?.totalLiabilities || 0;

                  if (netProfit < 0) {
                    return "Consider reducing operational costs and exploring new revenue streams to achieve profitability.";
                  } else if (totalLiabilities > totalAssets * 0.6) {
                    return "Your debt levels are high. Focus on debt reduction and improving cash flow management.";
                  } else if (netProfit / totalIncome < 0.1) {
                    return "Profit margins are low. Consider optimizing pricing strategies and reducing overhead costs.";
                  } else {
                    return "Your financial health looks good. Consider reinvesting profits for growth and expansion.";
                  }
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {profitLossData?.from && profitLossData?.to
                ? `Period: ${new Date(profitLossData.from).toLocaleDateString()} - ${new Date(profitLossData.to).toLocaleDateString()}`
                : "Loading period..."}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleExport("print")}
              className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              <Printer className="w-4 h-4 text-gray-600" />
              <span>Print</span>
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              <FileText className="w-4 h-4 text-red-600" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => handleExport("excel")}
              className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 text-green-600" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
