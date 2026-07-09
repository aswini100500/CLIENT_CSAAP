import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  FileText,
  IndianRupee,
  RefreshCcw,
  Search,
  UserRound,
  Filter,
  Eye,
  Download,
} from "lucide-react";
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

const VOUCHER_TYPES = [
  { key: "sales", label: "Sales Voucher", tone: "blue" },
  { key: "purchases", label: "Purchase Voucher", tone: "rose" },
  { key: "contra", label: "Contra Voucher", tone: "amber" },
  { key: "payments", label: "Payment Voucher", tone: "purple" },
  { key: "receipts", label: "Receipt Voucher", tone: "green" },
  { key: "journals", label: "Journal Voucher", tone: "slate" },
  { key: "manufacturing", label: "Manufacturing Journal", tone: "orange" },
];

const SuperAdminAccountingVouchers = ({ defaultType, hideHeader }) => {
  const { companyId, companyName } = useCompany();
  const [filters, setFilters] = useState({
    companyId: "",
    employeeId: "",
    type: defaultType || "all_vouchers", // custom value to fetch all and filter vouchers
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

  const loadVouchers = async () => {
    setLoading(true);
    setError("");

    try {
      // If filtering all vouchers, we pass "all" to the backend to get everything,
      // and we filter out ledgers and stocks in the memo.
      const apiType = filters.type === "all_vouchers" ? "all" : filters.type;
      const response = await fetchSuperAdminAccountingActivity({
        ...filters,
        type: apiType,
      });
      setData(response);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load employee-created vouchers.");
      setData({ activity: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  // Filter vouchers from response activity list (exclude ledgers and stocks if all_vouchers selected)
  const vouchers = useMemo(() => {
    const rawList = data.activity || [];
    const isVoucher = (item) => item.resource_key !== "ledgers" && item.resource_key !== "stocks";
    
    let list = rawList.filter(isVoucher);

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

  // Statistics calculation for vouchers
  const stats = useMemo(() => {
    const totalCount = vouchers.length;
    let totalAmount = 0;
    const typeCounts = {};

    vouchers.forEach((v) => {
      totalAmount += Number(v.amount || 0);
      typeCounts[v.resource_key] = (typeCounts[v.resource_key] || 0) + 1;
    });

    const activeCreators = new Set(vouchers.map((v) => v.created_by_employee_id || v.created_by_user_id).filter(Boolean));

    return {
      totalCount,
      totalAmount,
      avgAmount: totalCount > 0 ? totalAmount / totalCount : 0,
      creatorCount: activeCreators.size,
      typeCounts,
    };
  }, [vouchers]);

  const getVoucherBadgeStyles = (key) => {
    const tones = {
      sales: "bg-blue-50 text-blue-700 border-blue-100",
      purchases: "bg-rose-50 text-rose-700 border-rose-100",
      contra: "bg-amber-50 text-amber-700 border-amber-100",
      payments: "bg-purple-50 text-purple-700 border-purple-100",
      receipts: "bg-green-50 text-green-700 border-green-100",
      journals: "bg-slate-50 text-slate-700 border-slate-100",
      manufacturing: "bg-orange-50 text-orange-700 border-orange-100",
    };
    return tones[key] || "bg-slate-50 text-slate-700 border-slate-100";
  };

  const handleDownloadVoucher = async (item) => {
  try {

    let endpoint = "";

    switch (item.resource_key) {

      case "sales":
        endpoint = `/api/v1/sales-voucher/download/${item.record_id}`;
        break;

      case "purchases":
        endpoint = `/api/v1/purchase-voucher/download/${item.record_id}`;
        break;

      case "contra":
        endpoint = `/api/v1/contra-voucher/download/${item.record_id}`;
        break;

      case "payments":
        endpoint = `/api/v1/payment-voucher/download/${item.record_id}`;
        break;

      case "receipts":
        endpoint = `/api/v1/receipt-voucher/download/${item.record_id}`;
        break;

      case "journals":
        endpoint = `/api/v1/journal-voucher/download/${item.record_id}`;
        break;

      default:
        alert("Download not available for this voucher");
        return;
    }

    const response = await axios({
      url: `${import.meta.env.ACCOUNTING_API_URL}${endpoint}`,
      method: "GET",
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));

    const link = document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      `${item.resource_key}-${item.record_id}.pdf`
    );

    document.body.appendChild(link);

    link.click();

    link.remove();

  } catch (error) {
    console.error(error);
    alert("Failed to download voucher PDF");
  }
};


const handleViewVoucher = (item) => {

  const path = window.location.pathname;

  const isHr = path.includes("/hr/");
  const isEmployee = path.includes("/employee/");

  const routes = {
    sales: "salesvoucher",
    purchases: "purchasevoucher",
    contra: "contravoucher",
    payments: "paymentvoucher",
    receipts: "receiptvoucher",
    journals: "journalvoucher",
  };

  const routeName = routes[item.resource_key];

  if (!routeName) return;

  if (isEmployee) {
    window.open(
      `/employee/hr/accounting/${routeName}/${item.record_id}`,
      "_blank"
    );
  }
  else if (isHr) {
    window.open(
      `/superadmin/hr/accounting/${routeName}/${item.record_id}`,
      "_blank"
    );
  }
  else {
    window.open(
      `/superadmin/accounting/client/${routeName}/${item.record_id}`,
      "_blank"
    );
  }
};

  return (
    <div className={hideHeader ? "w-full space-y-4 p-2 bg-white" : "min-h-screen bg-slate-50 p-3 sm:p-5"}>
      <div className={hideHeader ? "space-y-4" : "mx-auto max-w-7xl space-y-5"}>
        
        {/* Header Block */}
        {!hideHeader && (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-green-700">SuperAdmin Accounting</p>
                <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
                  Employee Created Vouchers
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {companyName ? `Viewing vouchers for ${companyName}` : "Review sales, purchases, contra, payments, receipts, and journals created by employees."}
                </p>
              </div>

              <button
                type="button"
                onClick={loadVouchers}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Filtering Section - inside its own card if hidden header */}
        <div className={`p-5 rounded-lg border border-slate-200/80 bg-white ${hideHeader ? "shadow-sm" : "shadow-sm"}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wide">Filters</h3>
            {hideHeader && (
              <button
                type="button"
                onClick={loadVouchers}
                disabled={loading}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 transition"
              >
                <RefreshCcw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            )}
          </div>
          
          <div className={`grid grid-cols-1 gap-3 md:grid-cols-2 ${defaultType ? 'xl:grid-cols-5' : 'xl:grid-cols-6'}`}>
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase text-slate-400">Company ID</span>
              <input
                value={filters.companyId}
                onChange={(event) => updateFilter("companyId", event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-500"
                placeholder="All Companies"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase text-slate-400">Employee ID</span>
              <input
                value={filters.employeeId}
                onChange={(event) => updateFilter("employeeId", event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-500"
                placeholder="All Employees"
              />
            </label>

            {!defaultType && (
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase text-slate-400">Voucher Type</span>
                <select
                  value={filters.type}
                  onChange={(event) => updateFilter("type", event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-500"
                >
                  <option value="all_vouchers">All Vouchers</option>
                  {VOUCHER_TYPES.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase text-slate-400">From</span>
              <input
                type="date"
                value={filters.from}
                onChange={(event) => updateFilter("from", event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-500"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase text-slate-400">To</span>
              <input
                type="date"
                value={filters.to}
                onChange={(event) => updateFilter("to", event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-500"
              />
            </label>

            <button
              type="button"
              onClick={loadVouchers}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 xl:mt-6"
            >
              <Search className="h-4 w-4" />
              Apply
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={FileText} label="Total Vouchers" value={stats.totalCount} tone="blue" />
          <StatCard icon={IndianRupee} label="Total Amount" value={formatAmount(stats.totalAmount)} tone="green" />
          <StatCard icon={IndianRupee} label="Average Value" value={formatAmount(stats.avgAmount)} tone="purple" />
          <StatCard icon={UserRound} label="Active Creators" value={stats.creatorCount} tone="amber" />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Content Panel */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">Voucher Activities</h2>
            
            {/* Real-time search */}
            <div className="relative w-full max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search description, no, creator..."
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
                  <th className="px-4 py-3">Voucher Type</th>
                  <th className="px-4 py-3">Narration</th>
                  {/* <th className="px-4 py-3">Company</th> */}
                  <th className="px-4 py-3">Created By</th>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Creation Date</th>
                  <th className="px-4 py-3 text-center">
  Actions
</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-10 text-center text-slate-500">
                      Loading accounting vouchers...
                    </td>
                  </tr>
                ) : vouchers.length ? (
                  vouchers.map((item) => (
                    <tr key={`${item.resource_key}-${item.record_id}`} className="hover:bg-green-50/40">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${getVoucherBadgeStyles(item.resource_key)}`}>
                          <FileText className="h-3.5 w-3.5" />
                          {item.resource_label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800">{item.title || "No narration"}</p>
                        <p className="text-xs text-slate-500">
                          ID: #{item.record_id} {item.document_no ? `| Ref: ${item.document_no}` : ""}
                        </p>
                      </td>
                      {/* <td className="px-4 py-3 text-slate-600">
                        {item.company_name || `ID: ${item.company_id}`}
                      </td> */}
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
                        {formatAmount(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-slate-400" />
                          {formatDate(item.activity_date)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
  <div className="flex items-center justify-center gap-2">

    {/* View */}
    <button
      onClick={() => handleViewVoucher(item)}
      className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition flex items-center justify-center"
      title="View Voucher"
    >
      <Eye className="w-4 h-4" />
    </button>

    {/* Download */}
    <button
      onClick={() => handleDownloadVoucher(item)}
      className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition flex items-center justify-center"
      title="Download PDF"
    >
      <Download className="w-4 h-4" />
    </button>

  </div>
</td>
                    </tr>
                    
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-10 text-center text-slate-500">
                      No vouchers found matching the filters.
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

export default SuperAdminAccountingVouchers;
