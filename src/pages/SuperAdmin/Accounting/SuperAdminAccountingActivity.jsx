import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  FileText,
  IndianRupee,
  RefreshCcw,
  Search,
  UserRound,
  Warehouse,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Printer,
  Download,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { fetchSuperAdminAccountingActivity } from "./superAdminAccountingApi";
import { useCompany } from "../../ClientAccounting/context/CompanyContext";

const formatAmount = (value) => {
  const amount = Number(value || 0);
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};

const formatDate = (value) => {
  if (!value) return "--";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StatCard = ({ icon: Icon, label, value, tone = "green" }) => {
  const tones = {
    green: "bg-green-50 text-green-700 border-green-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
  };

  return (
    <div className={`rounded-lg border p-4 ${tones[tone] || tones.slate}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</p>
          <p className="mt-2 text-2xl font-extrabold">{value}</p>
        </div>
        <div className="rounded-lg bg-white/80 p-2 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const SuperAdminAccountingActivity = () => {
  const { companyId, companyName } = useCompany();
  const [filters, setFilters] = useState({
    companyId: "",
    employeeId: "",
    type: "all",
    from: "",
    to: "",
    limit: 100, // smaller limit for fast overview dashboard load
  });
  const [data, setData] = useState({
    resources: [],
    summary: { totalRecords: 0, totalAmount: 0, resourceCounts: {}, creators: [] },
    activity: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (companyId && !filters.companyId) {
      setFilters((current) => ({ ...current, companyId: String(companyId) }));
    }
  }, [companyId, filters.companyId]);

  const loadActivity = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetchSuperAdminAccountingActivity(filters);
      setData(response);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load accounting activities.");
      setData({
        resources: [],
        summary: { totalRecords: 0, totalAmount: 0, resourceCounts: {}, creators: [] },
        activity: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, []);

  const activeCreatorCount = useMemo(
    () => data.summary?.creators?.filter((creator) => creator.employee_id).length || 0,
    [data.summary]
  );

  const topResource = useMemo(() => {
    const counts = data.summary?.resourceCounts || {};
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const [key, count] = sorted[0] || [];
    const label = data.resources?.find((resource) => resource.key === key)?.label;
    return label ? `${label} (${count})` : "--";
  }, [data.resources, data.summary]);

  const categoryCounts = useMemo(() => {
    const counts = data.summary?.resourceCounts || {};
    let vouchersCount = 0;
    let ledgersCount = 0;
    let stocksCount = 0;

    Object.entries(counts).forEach(([key, count]) => {
      if (key === "ledgers") {
        ledgersCount += count;
      } else if (key === "stocks") {
        stocksCount += count;
      } else {
        vouchersCount += count;
      }
    });

    return { vouchersCount, ledgersCount, stocksCount };
  }, [data.summary]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const handleExport = async (format) => {
    if (format === 'pdf') {
      try {
        const dashboardElement = document.getElementById('activity-dashboard-content');
        if (!dashboardElement) return;
        
        const canvas = await html2canvas(dashboardElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('Employee_Activity_Dashboard.pdf');
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF.");
      }
    } else if (format === 'print') {
      window.print();
    }
  };

  return (
    <div id="activity-dashboard-content" className="min-h-screen bg-slate-50 p-3 sm:p-5">
      <div className="mx-auto max-w-7xl space-y-5">
        
        {/* Executive Header Block */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-green-700">SuperAdmin Accounting</p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
                Employee Accounting Activity Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {companyName ? `Viewing activity for ${companyName}` : "Executive overview of vouchers, ledgers, and stock items created by employees."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleExport('print')}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 shadow-sm hover:bg-red-100"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </button>
              <button
                type="button"
                onClick={loadActivity}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh Activity
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase text-slate-500">Company ID</span>
              <input
                value={filters.companyId}
                onChange={(event) => updateFilter("companyId", event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-500"
                placeholder="All Companies"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase text-slate-500">Employee ID</span>
              <input
                value={filters.employeeId}
                onChange={(event) => updateFilter("employeeId", event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-500"
                placeholder="All Employees"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase text-slate-500">From</span>
              <input
                type="date"
                value={filters.from}
                onChange={(event) => updateFilter("from", event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-500"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase text-slate-500">To</span>
              <input
                type="date"
                value={filters.to}
                onChange={(event) => updateFilter("to", event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-500"
              />
            </label>

            <button
              type="button"
              onClick={loadActivity}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 xl:mt-6"
            >
              <Search className="h-4 w-4" />
              Fetch Data
            </button>
          </div>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Activity} label="Total Records Created" value={data.summary?.totalRecords || 0} tone="green" />
          <StatCard icon={IndianRupee} label="Tracked Vouchers Value" value={formatAmount(data.summary?.totalAmount)} tone="blue" />
          <StatCard icon={UserRound} label="Active Employees" value={activeCreatorCount} tone="amber" />
          <StatCard icon={TrendingUp} label="Most Active Type" value={topResource} tone="slate" />
        </div>

        {/* Dedicated Quick Navigation Modules */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          
          {/* Vouchers Link */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700">
                <FileText className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-100">
                {categoryCounts.vouchersCount} items
              </span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-800">Created Vouchers</h3>
            <p className="mt-1 text-sm text-slate-500">
              Detailed breakdown of Sales, Purchases, Contra, Payments, Receipts, and Journals.
            </p>
            <Link
              to="/superadmin/accounting/superadmin/vouchers"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              Open Vouchers View
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Ledgers Link */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-green-50 p-2.5 text-green-700">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700 border border-green-100">
                {categoryCounts.ledgersCount} items
              </span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-800">Created Ledgers</h3>
            <p className="mt-1 text-sm text-slate-500">
              Monitor customer ledgers, bank ledgers, and expense accounts created by employees.
            </p>
            <Link
              to="/superadmin/accounting/superadmin/ledgers"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-green-600 hover:text-green-700"
            >
              Open Ledgers View
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Stocks Link */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-amber-50 p-2.5 text-amber-700">
                <Warehouse className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-100">
                {categoryCounts.stocksCount} items
              </span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-800">Created Stocks</h3>
            <p className="mt-1 text-sm text-slate-500">
              Track stock items, HSN numbers, opening quantities, and stock values.
            </p>
            <Link
              to="/superadmin/accounting/superadmin/stocks"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 hover:text-amber-700"
            >
              Open Stocks View
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
          
          {/* Recent activities overview */}
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-extrabold text-slate-900">Recent Employee Activities</h2>
              <span className="text-xs font-bold uppercase text-slate-400">
                {loading ? "Loading" : "Latest 100 entries"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-200 text-left text-sm font-normal">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3">Created By</th>
                    <th className="px-4 py-3 text-right">Amount/Balance</th>
                    <th className="px-4 py-3">Creation Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-10 text-center text-slate-500">
                        Loading recent employee-created records...
                      </td>
                    </tr>
                  ) : data.activity?.length ? (
                    data.activity.slice(0, 15).map((item) => (
                      <tr key={`${item.resource_key}-${item.record_id}`} className="hover:bg-green-50/40">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                            {item.resource_label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-800">{item.title || "--"}</p>
                          <p className="text-xs text-slate-500">
                            #{item.record_id} {item.document_no ? `| Ref: ${item.document_no}` : ""}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">
                            {item.creator_name || item.creator_email || "System"}
                          </p>
                          <p className="text-xs text-slate-400">Employee ID: {item.created_by_employee_id || "--"}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-extrabold text-slate-800">
                          {item.resource_key === "stocks" ? item.amount?.toLocaleString("en-IN") : formatAmount(item.amount)}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-slate-400" />
                            {formatDate(item.activity_date)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-10 text-center text-slate-500">
                        No recent employee activities found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Employee Contributors Sidebar */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">Top Employee Contributors</h2>
            <p className="text-xs text-slate-500 mt-0.5">Ranked by count of accounting records created.</p>
            
            <div className="mt-4 space-y-3">
              {data.summary?.creators?.length ? (
                data.summary.creators.map((creator) => (
                  <div key={creator.key} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-800">{creator.name}</p>
                        <p className="text-xs text-slate-500">
                          {creator.employee_id ? `Employee #${creator.employee_id}` : creator.email || "System"}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-green-700 border border-green-100 shadow-sm">
                        {creator.count} records
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Voucher Value</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-700">{formatAmount(creator.amount)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No active creators recorded.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SuperAdminAccountingActivity;
