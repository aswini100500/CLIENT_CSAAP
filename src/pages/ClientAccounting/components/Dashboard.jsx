import React from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Calculator,
  Calendar,
  ChevronDown,
  ChevronUp,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Layers,
  LineChart,
  Loader2,
  Printer,
  RefreshCw,
  Shield,
  Target,
  TrendingDown as TrendingDownIcon,
  TrendingUp,
  TrendingUp as TrendingUpIcon,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FaBalanceScale } from "react-icons/fa";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useAuth from "../../../hooks/useAuth";

const Dashboard = () => {
  const [profitLossData, setProfitLossData] = useState(null);
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("last-30-days");
  const [showIncomeDetails, setShowIncomeDetails] = useState(false);
  const [showExpenseDetails, setShowExpenseDetails] = useState(false);
  const [showAssetsDetails, setShowAssetsDetails] = useState(false);
  const [showLiabilitiesDetails, setShowLiabilitiesDetails] = useState(false);

  const { companyId } = useAuth();

  const dateRanges = [
    { id: "last-30-days", label: "Last 30 Days" },
    { id: "last-90-days", label: "Last 90 Days" },
    { id: "last-6-months", label: "Last 6 Months" },
    { id: "last-year", label: "Last Year" },
    { id: "this-year", label: "This Year" },
    { id: "custom", label: "Custom Range" },
  ];

  const getDateParams = () => {
    const today = new Date();
    const toStr = today.toISOString().slice(0, 10);
    let fromDate = new Date(today);

    switch (dateRange) {
      case "last-30-days":
        fromDate.setDate(today.getDate() - 30);
        break;
      case "last-90-days":
        fromDate.setDate(today.getDate() - 90);
        break;
      case "last-6-months":
        fromDate.setMonth(today.getMonth() - 6);
        break;
      case "last-year":
        fromDate.setFullYear(today.getFullYear() - 1);
        break;
      case "this-year":
        fromDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        fromDate.setDate(today.getDate() - 30);
    }

    return {
      from: fromDate.toISOString().slice(0, 10),
      to: toStr,
    };
  };

  const fetchDashboardData = async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);
    try {
      const { from, to } = getDateParams();

      const profitLossResponse = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/profit-loss/${companyId}`,
        { params: { from, to }, withCredentials: true },
      );
      setProfitLossData(profitLossResponse.data);

      const balanceSheetResponse = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/balanceSheet/${companyId}`,
        { withCredentials: true },
      );
      setBalanceSheetData(balanceSheetResponse.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load financial data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [companyId, dateRange]);

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
        color: "text-amber-700 bg-amber-50 border border-amber-200",
      };

    const profitMargin = (netProfit / totalIncome) * 100;

    if (profitMargin > 20)
      return {
        status: "Excellent",
        color: "text-emerald-700 bg-emerald-50 border border-emerald-200",
      };
    if (profitMargin > 10)
      return {
        status: "Good",
        color: "text-emerald-700 bg-emerald-50 border border-emerald-200",
      };
    if (profitMargin > 0)
      return {
        status: "Fair",
        color: "text-sky-700 bg-sky-50 border border-sky-200",
      };
    if (profitMargin === 0)
      return {
        status: "Breakeven",
        color: "text-amber-700 bg-amber-50 border border-amber-200",
      };
    return {
      status: "Loss",
      color: "text-rose-700 bg-rose-50 border border-rose-200",
    };
  };

  const getLiquidityStatus = (assets, liabilities) => {
    if (liabilities === 0)
      return {
        status: "Excellent",
        color: "text-emerald-700 bg-emerald-50 border border-emerald-200",
      };

    const ratio = assets / liabilities;

    if (ratio >= 2)
      return {
        status: "Excellent",
        color: "text-emerald-700 bg-emerald-50 border border-emerald-200",
      };
    if (ratio >= 1.5)
      return {
        status: "Good",
        color: "text-emerald-700 bg-emerald-50 border border-emerald-200",
      };
    if (ratio >= 1)
      return {
        status: "Adequate",
        color: "text-sky-700 bg-sky-50 border border-sky-200",
      };
    if (ratio >= 0.5)
      return {
        status: "Poor",
        color: "text-amber-700 bg-amber-50 border border-amber-200",
      };
    return {
      status: "Critical",
      color: "text-rose-700 bg-rose-50 border border-rose-200",
    };
  };

  const getQuickMetrics = () => {
    if (!profitLossData || !balanceSheetData) return [];

    const totalIncome = profitLossData.totals?.totalIncome || 0;
    const totalExpenses = profitLossData.totals?.totalExpenses || 0;
    const netProfit =
      profitLossData.totals?.netProfit ?? profitLossData.totals?.net ?? 0;
    const totalAssets = balanceSheetData.totals?.totalAssets || 0;
    const totalLiabilities = balanceSheetData.totals?.totalLiabilities || 0;
    const netWorth = totalAssets - totalLiabilities;

    return [
      {
        title: "Total Income",
        subtitle: "Money coming in",
        value: formatCurrency(totalIncome),
        icon: <TrendingUpIcon className="size-5 text-emerald-600" />,
        tileBg: "bg-emerald-50 border-emerald-100",
        trend: "up",
      },
      {
        title: "Total Expenses",
        subtitle: "Money going out",
        value: formatCurrency(totalExpenses),
        icon: <TrendingDownIcon className="size-5 text-amber-600" />,
        tileBg: "bg-amber-50 border-amber-100",
        trend: totalExpenses > 0 ? "down" : "up",
      },
      {
        title: "Net Profit",
        subtitle: "Income − Expenses",
        value: formatCurrency(netProfit),
        icon: <DollarSign className="size-5 text-emerald-600" />,
        tileBg:
          netProfit >= 0
            ? "bg-emerald-50 border-emerald-100"
            : "bg-rose-50 border-rose-100",
        trend: netProfit >= 0 ? "up" : "down",
      },
      {
        title: "Net Worth",
        subtitle: "Assets − Liabilities",
        value: formatCurrency(netWorth),
        icon: <Wallet className="size-5 text-violet-600" />,
        tileBg:
          netWorth >= 0
            ? "bg-violet-50 border-violet-100"
            : "bg-rose-50 border-rose-100",
        trend: netWorth >= 0 ? "up" : "down",
      },
    ];
  };

  const getCashflowChartData = () => {
    const totalIncome = profitLossData?.totals?.totalIncome || 0;
    const totalExpenses = profitLossData?.totals?.totalExpenses || 0;
    const netProfit =
      profitLossData?.totals?.netProfit ?? profitLossData?.totals?.net ?? 0;

    return [
      { name: "Total Income", amount: totalIncome, fill: "#00a651" },
      { name: "Total Expenses", amount: totalExpenses, fill: "#d97706" },
      {
        name: "Net Profit",
        amount: Math.max(0, netProfit),
        fill: netProfit >= 0 ? "#10b981" : "#e11d48",
      },
    ];
  };

  const getTopExpenseLedgersData = () => {
    if (!profitLossData?.expenses || profitLossData.expenses.length === 0)
      return [];
    return [...profitLossData.expenses]
      .map((item) => ({
        name: item.ledgerName,
        amount: Number(item.amount || 0),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const CustomGraphTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-2.5 border border-(--border-soft) shadow-md rounded-xl text-[12px] space-y-0.5">
          <p className="font-bold text-(--text-strong)">
            {data.payload?.name || data.name}
          </p>
          <p className="font-extrabold text-(--brand)">
            {formatCurrency(data.value)}
          </p>
        </div>
      );
    }
    return null;
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
      <div className="erp-root app-shell min-h-screen p-4 md:p-6 flex items-center justify-center">
        <div className="app-panel p-8 text-center max-w-md mx-auto shadow-sm">
          <div className="size-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="size-7 text-amber-600" />
          </div>
          <h2 className="app-title text-[20px] mb-2">No Company Selected</h2>
          <p className="app-subtitle mx-auto mb-6 text-[13px]">
            Please select an existing company or create a new one to view the
            dashboard and access financial data.
          </p>
          <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-xl text-left">
            <p className="text-[12px] text-sky-800 leading-relaxed">
              <strong className="font-bold text-sky-900">Tip:</strong> Use the
              company selector in the navigation bar to choose a company or
              create a new one.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="erp-root app-shell min-h-screen p-4 md:p-6 flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-(--text-soft)">
          <Loader2 className="size-6 animate-spin text-(--brand)" />
          <span className="text-[14px] font-semibold">
            Loading financial data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="erp-root app-shell min-h-screen p-4 md:p-6">
      <div id="dashboard-content" className="max-w-7xl mx-auto space-y-6">
        <div className="app-panel p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="app-title">Financial Dashboard</h1>
            <p className="app-subtitle mt-1">
              Real-time operational summary of income, expenses, assets, and
              liabilities.
            </p>
            {profitLossData?.from && profitLossData?.to && (
              <div className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-1 rounded-md bg-(--bg-subtle) border border-(--border-soft) text-[12px] font-medium text-(--text-soft)">
                <Calendar className="size-3.5 text-(--brand)" />
                <span>
                  Period: {new Date(profitLossData.from).toLocaleDateString()} −{" "}
                  {new Date(profitLossData.to).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="app-input min-w-37.5 text-[13px] py-2"
            >
              {dateRanges.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleRefresh}
              className="app-btn-secondary flex items-center gap-2 min-h-9.5 px-3 text-[13px]"
              title="Refresh Data"
            >
              <RefreshCw className="size-4 text-(--text-soft)" />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => handleExport("print")}
              className="app-btn-secondary flex items-center gap-2 min-h-9.5 px-3 text-[13px]"
            >
              <Printer className="size-4 text-(--text-soft)" />
              <span>Print</span>
            </button>

            <button
              onClick={() => handleExport("pdf")}
              className="app-btn-secondary flex items-center gap-2 min-h-9.5 px-3 text-[13px]"
            >
              <FileText className="size-4 text-rose-600" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={() => handleExport("excel")}
              className="app-btn-primary flex items-center gap-2 min-h-9.5 px-3 text-[13px]"
            >
              <Download className="size-4 text-white" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {getQuickMetrics().map((metric, index) => (
            <div
              key={index}
              className="app-panel p-4 flex items-start justify-between gap-3 hover:border-(--border-strong) transition-all duration-200"
            >
              <div>
                <p className="text-[12px] font-bold text-(--text-soft)">
                  {metric.title}
                </p>
                <div className="mt-1.5 text-[26px] font-extrabold leading-none text-(--text-strong) tracking-tight">
                  {metric.value}
                </div>
                <div className="flex items-center gap-1 mt-2.5">
                  {metric.trend === "up" ? (
                    <ArrowUpRight className="size-4 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="size-4 text-rose-600" />
                  )}
                  <span
                    className={`text-[12px] font-semibold ${
                      metric.trend === "up"
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }`}
                  >
                    {metric.trend === "up" ? "Positive flow" : "Negative flow"}
                  </span>
                </div>
              </div>
              <div
                className={`size-11 rounded-2xl ${metric.tileBg} border flex items-center justify-center shrink-0 shadow-xs`}
              >
                {metric.icon}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="app-panel p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="size-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <TrendingUp className="size-4" />
              </div>
              <div>
                <h2 className="app-heading">
                  Operational Cash Flow & Profitability
                </h2>
                <p className="text-[11px] text-(--text-faint)">
                  Direct comparison of Total Income vs Total Expenses & Net
                  Margin
                </p>
              </div>
            </div>

            <div className="h-60 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getCashflowChartData()}
                  margin={{ top: 10, right: 15, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2f2e9"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#475569" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomGraphTooltip />} />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} maxBarSize={52}>
                    {getCashflowChartData().map((entry, idx) => (
                      <Cell key={`cashflow-cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="app-panel p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="size-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <CreditCard className="size-4" />
              </div>
              <div>
                <h2 className="app-heading">Cost Structure Analysis</h2>
                <p className="text-[11px] text-(--text-faint)">
                  Top expense ledgers consuming business capital
                </p>
              </div>
            </div>

            <div className="h-60 w-full pt-1 flex items-center justify-center">
              {getTopExpenseLedgersData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={getTopExpenseLedgersData()}
                    margin={{ top: 5, right: 20, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#e2f2e9"
                    />
                    <XAxis
                      type="number"
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#1e293b", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip content={<CustomGraphTooltip />} />
                    <Bar
                      dataKey="amount"
                      fill="#d97706"
                      radius={[0, 6, 6, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="size-8 text-(--text-faint) mx-auto mb-2 opacity-50" />
                  <p className="text-[12px] font-medium text-(--text-soft)">
                    No expense ledger entries recorded yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="app-panel overflow-hidden flex flex-col">
            <div className="app-section-bar px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="size-4" />
                </div>
                <h2 className="app-heading">Profit & Loss</h2>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
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

            <div className="flex-1 flex flex-col">
              <div className="divide-y divide-(--border-soft)">
                <div className="flex items-center justify-between px-5 py-3.5 hover:bg-(--bg-subtle)/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Banknote className="size-4.5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[13px] font-bold text-(--text-strong) block leading-tight">
                        Total Income
                      </span>
                      <span className="text-[11px] text-(--text-faint)">
                        Money coming in
                      </span>
                    </div>
                  </div>
                  <span className="text-[15px] font-bold text-emerald-700">
                    {formatCurrency(profitLossData?.totals?.totalIncome || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between px-5 py-3.5 hover:bg-(--bg-subtle)/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <CreditCard className="size-4.5 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-[13px] font-bold text-(--text-strong) block leading-tight">
                        Total Expenses
                      </span>
                      <span className="text-[11px] text-(--text-faint)">
                        Money going out
                      </span>
                    </div>
                  </div>
                  <span className="text-[15px] font-bold text-amber-700">
                    {formatCurrency(profitLossData?.totals?.totalExpenses || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between px-5 py-3.5 bg-(--bg-subtle)/70">
                  <div className="flex items-center gap-3">
                    <Calculator className="size-4.5 text-(--brand) shrink-0" />
                    <div>
                      <span className="text-[13px] font-extrabold text-(--text-strong) block leading-tight">
                        Net Profit / Loss
                      </span>
                      <span className="text-[11px] text-(--text-faint)">
                        Income − Expenses
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[16px] font-black ${
                      (profitLossData?.totals?.netProfit ??
                        profitLossData?.totals?.net ??
                        0) >= 0
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }`}
                  >
                    {formatCurrency(
                      profitLossData?.totals?.netProfit ??
                        profitLossData?.totals?.net ??
                        0,
                    )}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2.5 mt-auto border-t border-(--border-soft) bg-white">
                <div className="border border-(--border-soft) rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowIncomeDetails(!showIncomeDetails)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-(--bg-subtle)/40 hover:bg-(--bg-subtle) transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Banknote className="size-3.5 text-emerald-600" />
                      <span className="text-[12px] font-bold text-(--text-strong)">
                        Income Breakdown
                      </span>
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                        {profitLossData?.income?.length || 0} items
                      </span>
                    </div>
                    {showIncomeDetails ? (
                      <ChevronUp className="size-4 text-(--text-soft)" />
                    ) : (
                      <ChevronDown className="size-4 text-(--text-soft)" />
                    )}
                  </button>

                  {showIncomeDetails &&
                    profitLossData?.income &&
                    profitLossData.income.length > 0 && (
                      <div className="divide-y divide-(--border-soft) bg-white px-3.5 py-1">
                        {profitLossData.income.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 text-[12px]"
                          >
                            <span className="font-medium text-(--text-strong)">
                              {item.ledgerName}
                            </span>
                            <span className="font-bold text-emerald-700">
                              {formatCurrency(item.amount || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                <div className="border border-(--border-soft) rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowExpenseDetails(!showExpenseDetails)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-(--bg-subtle)/40 hover:bg-(--bg-subtle) transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="size-3.5 text-amber-600" />
                      <span className="text-[12px] font-bold text-(--text-strong)">
                        Expense Breakdown
                      </span>
                      <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded-full">
                        {profitLossData?.expenses?.length || 0} items
                      </span>
                    </div>
                    {showExpenseDetails ? (
                      <ChevronUp className="size-4 text-(--text-soft)" />
                    ) : (
                      <ChevronDown className="size-4 text-(--text-soft)" />
                    )}
                  </button>

                  {showExpenseDetails &&
                    profitLossData?.expenses &&
                    profitLossData.expenses.length > 0 && (
                      <div className="divide-y divide-(--border-soft) bg-white px-3.5 py-1">
                        {profitLossData.expenses.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 text-[12px]"
                          >
                            <span className="font-medium text-(--text-strong)">
                              {item.ledgerName}
                            </span>
                            <span className="font-bold text-amber-700">
                              {formatCurrency(item.amount || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>

          <div className="app-panel overflow-hidden flex flex-col">
            <div className="app-section-bar px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                  <FaBalanceScale className="size-4" />
                </div>
                <h2 className="app-heading">Balance Sheet</h2>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
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

            <div className="flex-1 flex flex-col">
              <div className="divide-y divide-(--border-soft)">
                <div className="flex items-center justify-between px-5 py-3.5 hover:bg-(--bg-subtle)/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Shield className="size-4.5 text-sky-600 shrink-0" />
                    <div>
                      <span className="text-[13px] font-bold text-(--text-strong) block leading-tight">
                        Total Assets
                      </span>
                      <span className="text-[11px] text-(--text-faint)">
                        Resource value owned
                      </span>
                    </div>
                  </div>
                  <span className="text-[15px] font-bold text-sky-700">
                    {formatCurrency(balanceSheetData?.totals?.totalAssets || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between px-5 py-3.5 hover:bg-(--bg-subtle)/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Layers className="size-4.5 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-[13px] font-bold text-(--text-strong) block leading-tight">
                        Total Liabilities
                      </span>
                      <span className="text-[11px] text-(--text-faint)">
                        Total obligations owed
                      </span>
                    </div>
                  </div>
                  <span className="text-[15px] font-bold text-amber-700">
                    {formatCurrency(
                      balanceSheetData?.totals?.totalLiabilities || 0,
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between px-5 py-3.5 bg-(--bg-subtle)/70">
                  <div className="flex items-center gap-3">
                    <Target className="size-4.5 text-violet-600 shrink-0" />
                    <div>
                      <span className="text-[13px] font-extrabold text-(--text-strong) block leading-tight">
                        Net Worth
                      </span>
                      <span className="text-[11px] text-(--text-faint)">
                        Assets − Liabilities
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[16px] font-black ${
                      (balanceSheetData?.totals?.totalAssets || 0) -
                        (balanceSheetData?.totals?.totalLiabilities || 0) >=
                      0
                        ? "text-violet-700"
                        : "text-rose-700"
                    }`}
                  >
                    {formatCurrency(
                      (balanceSheetData?.totals?.totalAssets || 0) -
                        (balanceSheetData?.totals?.totalLiabilities || 0),
                    )}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2.5 mt-auto border-t border-(--border-soft) bg-white">
                <div className="border border-(--border-soft) rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowAssetsDetails(!showAssetsDetails)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-(--bg-subtle)/40 hover:bg-(--bg-subtle) transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="size-3.5 text-sky-600" />
                      <span className="text-[12px] font-bold text-(--text-strong)">
                        Assets Breakdown
                      </span>
                      <span className="text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.2 rounded-full">
                        {balanceSheetData?.assets?.length || 0} items
                      </span>
                    </div>
                    {showAssetsDetails ? (
                      <ChevronUp className="size-4 text-(--text-soft)" />
                    ) : (
                      <ChevronDown className="size-4 text-(--text-soft)" />
                    )}
                  </button>

                  {showAssetsDetails &&
                    balanceSheetData?.assets &&
                    balanceSheetData.assets.length > 0 && (
                      <div className="divide-y divide-(--border-soft) bg-white px-3.5 py-1">
                        {balanceSheetData.assets.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 text-[12px]"
                          >
                            <span className="font-medium text-(--text-strong)">
                              {item.ledgerName}
                            </span>
                            <div className="text-right">
                              <span className="font-bold text-sky-700 block">
                                {formatCurrency(
                                  item.closingDebit - item.closingCredit,
                                )}
                              </span>
                              <span className="text-[10px] text-(--text-faint)">
                                Opening:{" "}
                                {formatCurrency(
                                  item.openingDebit - item.openingCredit,
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                <div className="border border-(--border-soft) rounded-lg overflow-hidden">
                  <button
                    onClick={() =>
                      setShowLiabilitiesDetails(!showLiabilitiesDetails)
                    }
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-(--bg-subtle)/40 hover:bg-(--bg-subtle) transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="size-3.5 text-amber-600" />
                      <span className="text-[12px] font-bold text-(--text-strong)">
                        Liabilities & Capital
                      </span>
                      <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded-full">
                        {(balanceSheetData?.liabilities?.length || 0) +
                          (balanceSheetData?.capital?.length || 0)}{" "}
                        items
                      </span>
                    </div>
                    {showLiabilitiesDetails ? (
                      <ChevronUp className="size-4 text-(--text-soft)" />
                    ) : (
                      <ChevronDown className="size-4 text-(--text-soft)" />
                    )}
                  </button>

                  {showLiabilitiesDetails && (
                    <div className="bg-white px-3.5 py-2 space-y-3">
                      {balanceSheetData?.liabilities &&
                      balanceSheetData.liabilities.length > 0 ? (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-(--text-soft) uppercase tracking-wider block">
                            Liabilities
                          </span>
                          <div className="divide-y divide-(--border-soft)">
                            {balanceSheetData.liabilities.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between py-1.5 text-[12px]"
                              >
                                <span className="font-medium text-(--text-strong)">
                                  {item.ledgerName}
                                </span>
                                <span className="font-bold text-amber-700">
                                  {formatCurrency(
                                    item.closingCredit - item.closingDebit,
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-(--text-faint)">
                          No liabilities found
                        </p>
                      )}

                      {balanceSheetData?.capital &&
                        balanceSheetData.capital.length > 0 && (
                          <div className="space-y-1 pt-1.5 border-t border-(--border-soft)">
                            <span className="text-[10px] font-bold text-(--text-soft) uppercase tracking-wider block">
                              Capital
                            </span>
                            <div className="divide-y divide-(--border-soft)">
                              {balanceSheetData.capital.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between py-1.5 text-[12px]"
                                >
                                  <span className="font-medium text-(--text-strong)">
                                    {item.ledgerName}
                                  </span>
                                  <span className="font-bold text-violet-700">
                                    {formatCurrency(
                                      item.closingCredit - item.closingDebit,
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="app-panel p-5 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Activity className="size-5" />
            </div>
            <h2 className="app-heading">Financial Health Insights</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-(--border-soft) bg-white space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-600" />
                <h3 className="text-[14px] font-extrabold text-(--text-strong)">
                  Profitability
                </h3>
              </div>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="text-(--text-soft)">Profit Margin</span>
                  <span
                    className={`font-bold ${
                      (profitLossData?.totals?.netProfit ??
                        profitLossData?.totals?.net ??
                        0) >= 0
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }`}
                  >
                    {profitLossData?.totals?.totalIncome
                      ? `${(((profitLossData.totals.netProfit ?? profitLossData.totals.net ?? 0) / profitLossData.totals.totalIncome) * 100).toFixed(1)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-(--text-soft)">Return on Assets</span>
                  <span className="font-bold text-sky-700">
                    {balanceSheetData?.totals?.totalAssets
                      ? `${(((profitLossData?.totals?.netProfit ?? profitLossData?.totals?.net ?? 0) / balanceSheetData.totals.totalAssets) * 100).toFixed(1)}%`
                      : "0%"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-(--border-soft) bg-white space-y-3">
              <div className="flex items-center gap-2">
                <Banknote className="size-4 text-sky-600" />
                <h3 className="text-[14px] font-extrabold text-(--text-strong)">
                  Liquidity
                </h3>
              </div>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="text-(--text-soft)">Current Ratio</span>
                  <span className="font-bold text-sky-700">
                    {balanceSheetData?.totals?.totalLiabilities
                      ? (
                          balanceSheetData.totals.totalAssets /
                          balanceSheetData.totals.totalLiabilities
                        ).toFixed(2)
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-(--text-soft)">Debt to Equity</span>
                  <span className="font-bold text-amber-700">
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

            <div className="p-4 rounded-xl border border-(--border-soft) bg-white space-y-3">
              <div className="flex items-center gap-2">
                <LineChart className="size-4 text-violet-600" />
                <h3 className="text-[14px] font-extrabold text-(--text-strong)">
                  Efficiency
                </h3>
              </div>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="text-(--text-soft)">Income Growth</span>
                  <span className="font-bold text-emerald-700">
                    {calculatePercentageChange(
                      profitLossData?.totals?.totalIncome || 0,
                      0,
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-(--text-soft)">Expense Growth</span>
                  <span className="font-bold text-rose-700">
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

          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-100 text-sky-950 flex items-start gap-3">
            <AlertCircle className="size-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[13px] font-bold text-sky-900 mb-1">
                Recommendations
              </h4>
              <p className="text-[13px] text-sky-800 leading-relaxed">
                {(() => {
                  const netProfit =
                    profitLossData?.totals?.netProfit ??
                    profitLossData?.totals?.net ??
                    0;
                  const totalIncome = profitLossData?.totals?.totalIncome || 0;
                  const totalAssets =
                    balanceSheetData?.totals?.totalAssets || 0;
                  const totalLiabilities =
                    balanceSheetData?.totals?.totalLiabilities || 0;

                  if (netProfit < 0) {
                    return "Consider reducing operational costs and exploring new revenue streams to achieve profitability.";
                  } else if (totalLiabilities > totalAssets * 0.6) {
                    return "Your debt levels are high. Focus on debt reduction and improving cash flow management.";
                  } else if (totalIncome > 0 && netProfit / totalIncome < 0.1) {
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
    </div>
  );
};

export default Dashboard;
