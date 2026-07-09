import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  FolderOpen,
  IndianRupee,
  RefreshCcw,
  Search,
  UserRound,
  BookOpen,
  Eye,
  X
} from "lucide-react";
import axios from "axios";
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

const SuperAdminAccountingLedgers = ({ hideHeader }) => {
  const { companyId, companyName } = useCompany();
  const [filters, setFilters] = useState({
    companyId: "",
    employeeId: "",
    type: "ledgers", // Fetch only ledgers
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
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [ledgerDetails, setLedgerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (companyId && !filters.companyId) {
      setFilters((current) => ({ ...current, companyId: String(companyId) }));
    }
  }, [companyId, filters.companyId]);

  const loadLedgers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetchSuperAdminAccountingActivity(filters);
      setData(response);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load employee-created ledgers.");
      setData({ activity: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedgers();
  }, []);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  // Local filtering based on real-time search term
  const ledgers = useMemo(() => {
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

  // Statistics calculation for ledgers
  const stats = useMemo(() => {
    const totalCount = ledgers.length;
    let totalBalances = 0;
    ledgers.forEach((l) => {
      totalBalances += Number(l.amount || 0);
    });

    const activeCreators = new Set(ledgers.map((l) => l.created_by_employee_id || l.created_by_user_id).filter(Boolean));

    return {
      totalCount,
      totalBalances,
      creatorCount: activeCreators.size,
    };
  }, [ledgers]);

  const handleView = async (item) => {
    setSelectedLedger(item);
    setViewModalOpen(true);
    setLoadingDetails(true);
    setLedgerDetails(null);
    try {
      const res = await axios.get(`${import.meta.env.ACCOUNTING_API_URL}/api/v1/ledger/${item.company_id}/${item.record_id}`);
      setLedgerDetails(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className={hideHeader ? "w-full space-y-4 p-2 bg-white relative" : "min-h-screen bg-slate-50 p-3 sm:p-5 relative"}>
      <div className={hideHeader ? "space-y-4" : "mx-auto max-w-7xl space-y-5"}>
        
        {/* Header Block */}
        {!hideHeader && (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-green-700">SuperAdmin Accounting</p>
                <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
                  Employee Created Ledgers
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {companyName ? `Viewing ledgers for ${companyName}` : "Review account ledgers created by employees across companies."}
                </p>
              </div>

              <button
                type="button"
                onClick={loadLedgers}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Filtering Section */}
        <div className="p-5 rounded-lg border border-slate-200/80 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wide">Filters</h3>
            {hideHeader && (
              <button
                type="button"
                onClick={loadLedgers}
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
              onClick={loadLedgers}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 xl:mt-6"
            >
              <Search className="h-4 w-4" />
              Apply
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard icon={BookOpen} label="Total Ledgers Created" value={stats.totalCount} tone="blue" />
          <StatCard icon={IndianRupee} label="Cumulative Balances" value={formatAmount(stats.totalBalances)} tone="green" />
          <StatCard icon={UserRound} label="Ledger Creators" value={stats.creatorCount} tone="amber" />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Content Panel */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">Ledger Records</h2>
            
            {/* Real-time search */}
            <div className="relative w-full max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search ledger name, alias, creator..."
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
                  <th className="px-4 py-3">Ledger Details</th>
                  <th className="px-4 py-3">Alias / Secondary Name</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Created By</th>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3 text-right">Opening Balance</th>
                  <th className="px-4 py-3 text-right">Closing Balance</th>
                  <th className="px-4 py-3">Created Date</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-10 text-center text-slate-500">
                      Loading accounting ledgers...
                    </td>
                  </tr>
                ) : ledgers.length ? (
                  ledgers.map((item) => (
                    <tr key={`${item.resource_key}-${item.record_id}`} className="hover:bg-green-50/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-green-50 p-2 text-green-700">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{item.title || "Unnamed Ledger"}</p>
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
                        {formatAmount(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-600">
                        <button onClick={() => handleView(item)} className="text-blue-600 hover:underline text-xs">
                          View
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-slate-400" />
                          {formatDate(item.activity_date)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => handleView(item)}
                          className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-green-100 hover:text-green-700 transition"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-10 text-center text-slate-500">
                      No ledgers found matching the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewModalOpen && selectedLedger && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Ledger Details</h3>
                <p className="text-sm text-slate-500">ID: #{selectedLedger.record_id}</p>
              </div>
              <button 
                onClick={() => setViewModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              
              <div className="mb-6 rounded-lg bg-green-50 p-4 border border-green-100">
                <p className="text-xs font-bold uppercase text-green-700 mb-1">Company</p>
                <p className="text-lg font-bold text-slate-900">{selectedLedger.company_name || `ID: ${selectedLedger.company_id}`}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">Ledger Name</p>
                  <p className="font-medium text-slate-800">{selectedLedger.title || "Unnamed"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">Alias / Secondary</p>
                  <p className="font-medium text-slate-800">{selectedLedger.document_no || "--"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">Created By</p>
                  <p className="font-medium text-slate-800">{selectedLedger.creator_name || selectedLedger.creator_email || "System"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">Employee ID</p>
                  <p className="font-medium text-slate-800">{selectedLedger.created_by_employee_id || "--"}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-sm font-bold uppercase text-slate-800 mb-4">Balances</h4>
                {loadingDetails ? (
                  <div className="flex justify-center p-4">
                    <RefreshCcw className="h-6 w-6 animate-spin text-green-600" />
                  </div>
                ) : ledgerDetails ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
                      <p className="text-xs font-bold uppercase text-slate-500 mb-2">Opening Balance</p>
                      <p className="text-xl font-extrabold text-slate-900">{formatAmount(ledgerDetails.openingBalance)}</p>
                    </div>
                    <div className="rounded-lg border border-green-200 p-4 bg-green-50">
                      <p className="text-xs font-bold uppercase text-green-700 mb-2">Closing Balance</p>
                      <p className="text-xl font-extrabold text-green-900">{formatAmount(ledgerDetails.closingBalance)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
                      <p className="text-xs font-bold uppercase text-slate-500 mb-2">Total Debit</p>
                      <p className="font-bold text-slate-700">{formatAmount(ledgerDetails.debit)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
                      <p className="text-xs font-bold uppercase text-slate-500 mb-2">Total Credit</p>
                      <p className="font-bold text-slate-700">{formatAmount(ledgerDetails.credit)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-red-50 p-4 text-red-700 text-sm font-medium">
                    Failed to load dynamic ledger balances.
                  </div>
                )}
              </div>

              {ledgerDetails && (
                <>
                  <div className="border-t border-slate-100 pt-6 mt-6">
                    <h4 className="text-sm font-bold uppercase text-slate-800 mb-4">Mailing & Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400 mb-1">Mailing Name</p>
                        <p className="font-medium text-slate-800">{ledgerDetails.mailingName || "--"}</p>
                      </div>
                      <div className="row-span-2">
                        <p className="text-xs font-bold uppercase text-slate-400 mb-1">Address</p>
                        <p className="font-medium text-slate-800 whitespace-pre-line">{ledgerDetails.address || "--"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400 mb-1">Location</p>
                        <p className="font-medium text-slate-800">
                          {[ledgerDetails.state, ledgerDetails.country, ledgerDetails.pincode].filter(Boolean).join(", ") || "--"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6 mt-6">
                    <h4 className="text-sm font-bold uppercase text-slate-800 mb-4">Tax Registration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400 mb-1">PAN</p>
                        <p className="font-medium text-slate-800">{ledgerDetails.pan || "--"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400 mb-1">GSTIN</p>
                        <p className="font-medium text-slate-800">{ledgerDetails.gstin || "--"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400 mb-1">Registration Type</p>
                        <p className="font-medium text-slate-800">{ledgerDetails.registrationType || "--"}</p>
                      </div>
                    </div>
                  </div>

                  {(ledgerDetails.bankName || ledgerDetails.accountNumber) && (
                    <div className="border-t border-slate-100 pt-6 mt-6">
                      <h4 className="text-sm font-bold uppercase text-slate-800 mb-4">Bank Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400 mb-1">Bank Name</p>
                          <p className="font-medium text-slate-800">{ledgerDetails.bankName || "--"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400 mb-1">Branch</p>
                          <p className="font-medium text-slate-800">{ledgerDetails.branch || "--"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400 mb-1">Account No.</p>
                          <p className="font-medium text-slate-800">{ledgerDetails.accountNumber || "--"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400 mb-1">IFSC</p>
                          <p className="font-medium text-slate-800">{ledgerDetails.ifsc || "--"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminAccountingLedgers;
