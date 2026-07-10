import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  RefreshCcw,
  Search,
  UserRound,
  Warehouse,
  Boxes,
} from "lucide-react";
import { fetchSuperAdminAccountingActivity } from "./superAdminAccountingApi";
import { useCompany } from "../../ClientAccounting/context/CompanyContext";

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
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
  };

  return (
    <div className={`rounded-lg border p-4 ${tones[tone] || tones.slate}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</p>
          <p className="mt-2 text-xl font-extrabold">{value}</p>
        </div>
        <div className="rounded-lg bg-white/80 p-2 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const SuperAdminAccountingStocks = ({ hideHeader }) => {
  const { companyId, companyName } = useCompany();
  const [filters, setFilters] = useState({
    companyId: "",
    employeeId: "",
    type: "stocks",
    from: "",
    to: "",
    limit: 500,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState({
    activity: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (companyId && !filters.companyId) {
      setFilters((current) => ({ ...current, companyId: String(companyId) }));
    }
  }, [companyId, filters.companyId]);

  const loadStocks = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetchSuperAdminAccountingActivity(filters);
      setData(response);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load employee-created stock items.");
      setData({ activity: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, []);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };


  const stocks = useMemo(() => {
    let list = data.activity || [];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (item) =>
          (item.title && item.title.toLowerCase().includes(term)) ||
          (item.document_no && item.document_no.toLowerCase().includes(term)) ||
          (item.creator_name && item.creator_name.toLowerCase().includes(term)) ||
          (item.creator_email && item.creator_email.toLowerCase().includes(term))
      );
    }
    return list;
  }, [data.activity, searchTerm]);


  const stats = useMemo(() => {
    const totalCount = stocks.length;
    let totalOpeningBalance = 0;
    stocks.forEach((s) => {
      totalOpeningBalance += Number(s.amount || 0);
    });

    const activeCreators = new Set(stocks.map((s) => s.created_by_employee_id || s.created_by_user_id).filter(Boolean));

    return {
      totalCount,
      totalOpeningBalance,
      creatorCount: activeCreators.size,
    };
  }, [stocks]);

  return (
    <div className={hideHeader ? "w-full space-y-4 p-2 bg-white" : "min-h-screen bg-slate-50 p-3 sm:p-5"}>
      <div className={hideHeader ? "space-y-4" : "mx-auto max-w-7xl space-y-5"}>
        

        {!hideHeader && (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-green-700">SuperAdmin Accounting</p>
                <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
                  Employee Created Stock Items
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {companyName ? `Viewing stock items for ${companyName}` : "Review stock items and inventory records created by employees."}
                </p>
              </div>

              <button
                type="button"
                onClick={loadStocks}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        )}


        <div className="p-5 rounded-lg border border-slate-200/80 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wide">Filters</h3>
            {hideHeader && (
              <button
                type="button"
                onClick={loadStocks}
                disabled={loading}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 transition"
              >
                <RefreshCcw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
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
              onClick={loadStocks}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 xl:mt-6"
            >
              <Search className="h-4 w-4" />
              Apply Filters
            </button>
          </div>
        </div>


        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard icon={Warehouse} label="Total Stock Items" value={stats.totalCount} tone="blue" />
          <StatCard icon={Boxes} label="Cumulative Opening Balance Value" value={stats.totalOpeningBalance.toLocaleString("en-IN")} tone="green" />
          <StatCard icon={UserRound} label="Stock Creators" value={stats.creatorCount} tone="amber" />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}


        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">Stock Inventory Records</h2>
            

            <div className="relative w-full max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search stock name, HSN, creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-3 text-xs outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-245 text-left text-sm font-normal">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Stock Item Name</th>
                  <th className="px-4 py-3">HSN Code / Alias</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Created By</th>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3 text-right">Opening Balance Qty/Val</th>
                  <th className="px-4 py-3">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-10 text-center text-slate-500">
                      Loading accounting stocks...
                    </td>
                  </tr>
                ) : stocks.length ? (
                  stocks.map((item) => (
                    <tr key={`${item.resource_key}-${item.record_id}`} className="hover:bg-green-50/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-green-50 p-2 text-green-700">
                            <Warehouse className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{item.title || "Unnamed Stock"}</p>
                            <p className="text-xs text-slate-500">ID: #{item.record_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {item.document_no || "--"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.company_name || `ID: ${item.company_id}`}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">
                          {item.creator_name || item.creator_email || "System"}
                        </p>
                        <p className="text-xs text-slate-400 capitalize">{item.creator_role || "User"}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {item.created_by_employee_id || "--"}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-slate-800">
                        {item.amount?.toLocaleString("en-IN") || "0"}
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
                    <td colSpan="7" className="px-4 py-10 text-center text-slate-500">
                      No stock items found matching the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAccountingStocks;
