import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../api";
import axios from "axios";
import accountingApi from "../../../accountingApi";
import { usePermission } from "../../../../../hooks/usePermission";
import useAuth from "../../../../../hooks/useAuth";
import CustomerDetailsModal from "./CustomerDetailsModal";
import CreateCustomerWizard from "./CreateCustomerWizard";
import {
  Users,
  Search,
  FileSpreadsheet,
  TrendingUp,
  Eye,
  CreditCard,
  X,
  SlidersHorizontal,
  IndianRupee,
  PieChart,
  User,
  UserPlus,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { formatSource } from "../telemarketing/leads/leadUtils";

const formatINR = (val) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export default function CustomerList() {
  const { has } = usePermission();
  const canExport = has("crm.customers.export");
  const canViewProfile = has("crm.customers.profile.view");
  const canViewLedger = has("crm.customers.ledger.view");
  const canCreate = has("crm.customers.create") || has("crm.leads.create");

  const navigate = useNavigate();
  const { user, companyId, token } = useAuth();
  const queryClient = useQueryClient();

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState("active");

  // Create wizard visibility state
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  // Customer Details Modal States
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState(null);

  // Cancellation Request Modal States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingCustomer, setCancellingCustomer] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const handleRequestCancel = (cust) => {
    setCancellingCustomer(cust);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const submitCancellation = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      alert("Please enter a reason for cancellation.");
      return;
    }

    const planId = cancellingCustomer.ledger_id;
    if (!planId) {
      alert("This customer does not have a payment plan setup.");
      return;
    }

    try {
      setSubmittingCancel(true);
      const res = await accountingApi.post("/api/v1/bookings/cancellations/request", {
        company_id: companyId,
        company_slug: user?.company_slug || user?.slug || "default-slug",
        customer_id: cancellingCustomer.id,
        ledger_id: planId,
        reason: cancelReason
      });

      if (res.data && res.data.success) {
        alert("Booking cancellation request successfully submitted to Accounting.");
        setShowCancelModal(false);
        setCancellingCustomer(null);
        queryClient.invalidateQueries(["customers"]);
      } else {
        alert(res.data.message || "Failed to submit request.");
      }
    } catch (err) {
      console.error("Error submitting cancellation request:", err);
      alert(err.response?.data?.message || "Failed to submit cancellation request.");
    } finally {
      setSubmittingCancel(false);
    }
  };

  // Entrance transition state
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  // Fetch customers from real API
  const {
    data: customers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customers", companyId],
    queryFn: async () => {
      const response = await api.get("/api/customers", {
        params: { company_id: companyId, limit: 500 },
      });
      return response.data.data || [];
    },
    enabled: !!companyId,
  });

  // Fetch project options to map project IDs to friendly names
  const { data: projectOptions = [] } = useQuery({
    queryKey: ["project-options", token, companyId],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_CSAAP_URL}/api/tenant/clprojects`, {
        params: { company_id: companyId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const projects = response.data?.data || [];
      return projects.map((p) => ({
        project_id: p.id,
        composite_key: p.id,
        name: p.project_name,
        display_type: p.project_code || p.status || "",
        location: p.client_company_name ? `Client: ${p.client_company_name}` : "",
      }));
    },
    enabled: !!token && !!companyId,
  });

  const projectOptionsMap = useMemo(() => {
    const map = new Map();
    projectOptions.forEach((p) => {
      if (p.project_id) {
        map.set(p.project_id, p.name);
      }
    });
    return map;
  }, [projectOptions]);

  // --- TABS SPLIT COUNTS ---
  const activeCount = useMemo(() => customers.filter(c => c.status !== "pending" && c.status !== "cancelled").length, [customers]);
  const pendingCount = useMemo(() => customers.filter(c => c.status === "pending").length, [customers]);
  const cancelledCount = useMemo(() => customers.filter(c => c.status === "cancelled").length, [customers]);

  // --- DYNAMIC CALCULATED METRICS ---
  const metrics = useMemo(() => {
    const tabCustomers = customers.filter(c => {
      if (activeTab === "active") return c.status !== "pending" && c.status !== "cancelled";
      if (activeTab === "pending") return c.status === "pending";
      if (activeTab === "cancelled") return c.status === "cancelled";
      return false;
    });
    const total = tabCustomers.length;
    const totalDealValue = tabCustomers.reduce(
      (sum, c) => sum + (Number(c.total_deal_value) || 0),
      0
    );
    const totalCollected = tabCustomers.reduce(
      (sum, c) => sum + (Number(c.total_paid) || 0),
      0
    );
    const collectionRate =
      totalDealValue > 0
        ? Math.round((totalCollected / totalDealValue) * 100)
        : 0;
    return { total, totalDealValue, totalCollected, collectionRate };
  }, [customers, activeTab]);

  // Unique filter options
  const uniqueSources = useMemo(() => {
    const sources = [
      ...new Set(customers.map((c) => c.source).filter(Boolean)),
    ];
    return sources.map((s) => ({ value: s, label: formatSource(s) || s }));
  }, [customers]);

  // --- DYNAMIC FILTER LOGIC ---
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Tab filter
      if (activeTab === "active" && (c.status === "pending" || c.status === "cancelled")) return false;
      if (activeTab === "pending" && c.status !== "pending") return false;
      if (activeTab === "cancelled" && c.status !== "cancelled") return false;

      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(query);
        const matchesPhone = c.phone?.includes(query);
        const matchesEmail = c.email?.toLowerCase().includes(query);
        const matchesCity = c.city?.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesEmail && !matchesCity)
          return false;
      }

      if (selectedSource && c.source !== selectedSource) return false;
      if (selectedStatus && c.status !== selectedStatus) return false;

      return true;
    });
  }, [customers, activeTab, searchTerm, selectedSource, selectedStatus]);

  // --- EXPORTS ---
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      alert("No customer data to export!");
      return;
    }
    const headers = [
      "Name",
      "Phone",
      "Email",
      "Project",
      "Total Deal Value",
      "Total Paid",
      "Status",
      "Source",
    ];
    const rows = filteredCustomers.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email || ""}"`,
      `"${projectOptionsMap.get(c.project_id) || ""}"`,
      c.total_deal_value,
      c.total_paid,
      `"${c.status}"`,
      `"${c.source || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `customers_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="crm-module-root size-full min-h-screen">
      <div
        className={`app-shell p-4 space-y-6 transition-all duration-300 ease-out ${
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2"
        }`}
      >
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="app-title">Customers</h1>
            <p className="app-subtitle mt-1">
              {activeTab === "active" 
                ? "Clients who have made their first payment. Auto-created from accepted leads."
                : activeTab === "pending"
                  ? "Directly created customers. Active page shows them after first payment."
                  : "Customers whose bookings have been cancelled and processed."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canCreate && (
              <button
                onClick={() => setShowCreateWizard(true)}
                className="app-btn-primary flex items-center gap-2 text-xs shadow-sm cursor-pointer"
                title="Create a new customer directly"
              >
                <UserPlus className="size-4" />
                <span>Create Customer</span>
              </button>
            )}
            
            {canExport && (
              <button
                onClick={handleExportCSV}
                className="app-btn-secondary flex items-center gap-2 text-xs shadow-sm cursor-pointer"
                title="Export filtered records to CSV"
              >
                <FileSpreadsheet className="size-4 text-emerald-600" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Sticky tabs dock */}
        <div className="sticky top-0 z-20 -mx-4 px-4 py-3 border-b border-(--border-soft) flex justify-between items-center bg-slate-50/50 backdrop-blur-md">
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Active Customers Tab */}
            <button
              onClick={() => setActiveTab("active")}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-bold tracking-[-0.02em] whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "active"
                  ? "border-transparent text-white shadow-[0_14px_28px_rgba(0,166,81,0.18)]"
                  : "bg-white border-(--border-soft) text-(--text-body) hover:bg-white hover:border-(--border-strong)"
              }`}
              style={
                activeTab === "active"
                  ? {
                      background: "linear-gradient(135deg, var(--brand), #00c853)",
                    }
                  : undefined
              }
            >
              <span>Active Customers</span>
              <span className={`min-w-6 h-6 px-1.5 inline-flex items-center justify-center rounded-lg text-[11px] font-bold ${
                activeTab === "active" ? "bg-white/16 text-white" : "bg-(--bg-subtle) text-(--text-soft)"
              }`}>
                {activeCount}
              </span>
            </button>

            {/* Pending Customers Tab */}
            <button
              onClick={() => setActiveTab("pending")}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-bold tracking-[-0.02em] whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "pending"
                  ? "border-transparent text-white shadow-[0_14px_28px_rgba(0,166,81,0.18)]"
                  : "bg-white border-(--border-soft) text-(--text-body) hover:bg-white hover:border-(--border-strong)"
              }`}
              style={
                activeTab === "pending"
                  ? {
                      background: "linear-gradient(135deg, var(--brand), #00c853)",
                    }
                  : undefined
              }
            >
              <span>Pending Activation</span>
              <span className={`min-w-6 h-6 px-1.5 inline-flex items-center justify-center rounded-lg text-[11px] font-bold ${
                activeTab === "pending" ? "bg-white/16 text-white" : "bg-(--bg-subtle) text-(--text-soft)"
              }`}>
                {pendingCount}
              </span>
            </button>

            {/* Cancelled Bookings Tab */}
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-bold tracking-[-0.02em] whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "cancelled"
                  ? "border-transparent text-white shadow-[0_14px_28px_rgba(0,166,81,0.18)]"
                  : "bg-white border-(--border-soft) text-(--text-body) hover:bg-white hover:border-(--border-strong)"
              }`}
              style={
                activeTab === "cancelled"
                  ? {
                      background: "linear-gradient(135deg, var(--brand), #00c853)",
                    }
                  : undefined
              }
            >
              <span>Cancelled Bookings</span>
              <span className={`min-w-6 h-6 px-1.5 inline-flex items-center justify-center rounded-lg text-[11px] font-bold ${
                activeTab === "cancelled" ? "bg-white/16 text-white" : "bg-(--bg-subtle) text-(--text-soft)"
              }`}>
                {cancelledCount}
              </span>
            </button>
          </div>
        </div>

        {/* --- KPI STAT CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="app-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-(--text-soft)">
                  {activeTab === "active" ? "Active Bookings" : activeTab === "pending" ? "Pending Activation" : "Cancelled Bookings"}
                </p>
                <div className="mt-2 text-[28px] font-extrabold leading-none text-(--text-strong)">
                  {metrics.total}
                </div>
                <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
                  {activeTab === "active" ? "Active paying clients" : activeTab === "pending" ? "Awaiting first payment" : "Cancelled clients"}
                </p>
              </div>
              <div className="size-10 rounded-2xl bg-(--brand-soft) border border-(--border-soft) flex items-center justify-center shrink-0">
                {activeTab === "active" ? (
                  <Users className="size-5 text-(--brand)" />
                ) : (
                  <Clock className="size-5 text-(--brand)" />
                )}
              </div>
            </div>
          </div>

          <div className="app-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-(--text-soft)">
                  {activeTab === "active" ? "Total Deal Value" : "Pending Deal Value"}
                </p>
                <div className="mt-2 text-[28px] font-extrabold leading-none text-(--text-strong)">
                  {formatINR(metrics.totalDealValue)}
                </div>
                <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
                  {activeTab === "active" ? "Aggregate booked value" : "Unrealized booked value"}
                </p>
              </div>
              <div className="size-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                <IndianRupee className="size-5 text-sky-600" />
              </div>
            </div>
          </div>

          <div className="app-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-(--text-soft)">
                  {activeTab === "active" ? "Total Collected" : "Collected (Awaiting)"}
                </p>
                <div className="mt-2 text-[28px] font-extrabold leading-none text-(--text-strong)">
                  {activeTab === "active" ? formatINR(metrics.totalCollected) : "₹0"}
                </div>
                <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
                  {activeTab === "active" ? "Payments received" : "No payments logged"}
                </p>
              </div>
              <div className="size-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <TrendingUp className="size-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="app-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-(--text-soft)">
                  {activeTab === "active" ? "Collection Rate" : "Activation Progress"}
                </p>
                <div className="mt-2 text-[28px] font-extrabold leading-none text-(--text-strong)">
                  {activeTab === "active" ? `${metrics.collectionRate}%` : "0%"}
                </div>
                <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
                  {activeTab === "active" ? "Paid vs deal value" : "Pending first deposit"}
                </p>
              </div>
              <div className="size-10 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                <PieChart className="size-5 text-violet-600" />
              </div>
            </div>
          </div>
        </div>

        {/* --- SEARCH & FILTERS --- */}
        <div className="app-panel overflow-hidden shadow-sm">
          <div className="app-section-bar px-4 py-3 flex flex-wrap items-center justify-between gap-4">
            <h3 className="app-heading">
              Customers ({filteredCustomers.length})
            </h3>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search name, phone, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="app-input pl-8 pr-3 py-1.5 text-xs w-48 md:w-64"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-faint) size-3.5" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`app-icon-button p-2 border ${
                  showFilters
                    ? "bg-(--brand-soft) border-(--border-strong) text-(--brand-strong)"
                    : "bg-white border-(--border-soft) text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--brand)"
                }`}
                title="Toggle Filters"
              >
                <SlidersHorizontal className="size-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          {showFilters && (
            <div className="bg-white/50 p-4 border-b border-(--border-soft) grid grid-cols-1 sm:grid-cols-3 gap-4 animate-sub-menu">
              <div>
                <label className="app-label block mb-1">Source</label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="app-input w-full"
                >
                  <option value="">All Sources</option>
                  {uniqueSources.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="app-label block mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="app-input w-full"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-end">
                {(selectedSource || selectedStatus) && (
                  <button
                    onClick={() => {
                      setSelectedSource("");
                      setSelectedStatus("");
                    }}
                    className="text-[12px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl border border-rose-200 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer bg-white"
                  >
                    <X className="size-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* --- MAIN TABLE --- */}
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="animate-spin rounded-full size-8 border-b-2 border-emerald-600 mx-auto mb-3" />
              <p className="text-xs font-semibold">Loading customers...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">
              <p className="text-xs font-semibold">
                Failed to load customers: {error.message}
              </p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-16 text-center">
              {activeTab === "active" ? (
                <>
                  <Users className="size-10 mx-auto text-(--text-faint) mb-3" />
                  <p className="text-[14px] font-extrabold text-(--text-strong)">
                    No active customers yet
                  </p>
                  <p className="text-[12px] mt-1 text-(--text-soft) max-w-sm mx-auto">
                    Customers are automatically created when the first payment is recorded against an accepted lead's payment slab.
                  </p>
                </>
              ) : activeTab === "pending" ? (
                <>
                  <Clock className="size-10 mx-auto text-(--text-faint) mb-3" />
                  <p className="text-[14px] font-extrabold text-(--text-strong)">
                    No pending activation customers
                  </p>
                  <p className="text-[12px] mt-1 text-(--text-soft) max-w-sm mx-auto">
                    Directly created customers will stay here until their first payment is recorded to move them to the active list.
                  </p>
                </>
              ) : (
                <>
                  <AlertTriangle className="size-10 mx-auto text-(--text-faint) mb-3" />
                  <p className="text-[14px] font-extrabold text-(--text-strong)">
                    No cancelled bookings
                  </p>
                  <p className="text-[12px] mt-1 text-(--text-soft) max-w-sm mx-auto">
                    This view displays clients whose bookings have been cancelled and settled.
                  </p>
                </>
              )}
              {(searchTerm || selectedSource || selectedStatus) ? (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSource("");
                    setSelectedStatus("");
                  }}
                  className="app-btn-secondary mt-4 text-xs py-1.5 min-h-8.5 hover:scale-98 cursor-pointer"
                >
                  Clear Filters
                </button>
              ) : (
                canCreate && activeTab === "pending" && (
                  <button
                    onClick={() => setShowCreateWizard(true)}
                    className="app-btn-primary mt-4 text-xs py-1.5 min-h-8.5 hover:scale-98 cursor-pointer flex items-center gap-1.5 mx-auto"
                  >
                    <UserPlus className="size-3.5" />
                    Create Direct Customer
                  </button>
                )
              )}
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-(--border-soft) text-left border-collapse">
                <thead className="bg-(--bg-subtle)/30">
                  <tr>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Customer
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Project
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Source
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-right">
                      Deal Value
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-right">
                      Paid
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-center">
                      Progress
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-center">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-(--border-soft)">
                  {filteredCustomers.map((customer) => {
                    const letter =
                      customer.name?.charAt(0).toUpperCase() || "C";
                    const dealVal = Number(customer.total_deal_value) || 0;
                    const paidVal = Number(customer.total_paid) || 0;
                    const progressPct =
                      dealVal > 0
                        ? Math.min(
                            Math.round((paidVal / dealVal) * 100),
                            100
                          )
                        : 0;

                    return (
                      <tr
                        key={customer.id}
                        className="hover:bg-(--bg-subtle)/70 duration-200 transition-colors cursor-pointer group"
                        onClick={() => {
                          setViewingCustomer(customer);
                          setShowDetailsModal(true);
                        }}
                      >
                        {/* Customer Identity */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-xl bg-(--brand-soft) border border-(--border-soft) flex items-center justify-center shrink-0">
                              <span className="font-extrabold text-[13px] text-(--brand-strong) tracking-tight">
                                {letter}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <span className="text-[14px] font-bold text-(--text-strong) truncate block hover:text-(--brand) transition-colors">
                                {customer.name}
                              </span>
                              <div className="text-[12px] font-medium text-(--text-faint) flex items-center gap-1 truncate mt-0.5">
                                <span>{customer.phone}</span>
                                {customer.email && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate">
                                      {customer.email}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Project */}
                        <td className="px-4 py-3.5">
                          {customer.project_id ? (
                            <span className="text-[13px] font-semibold text-(--text-body)">
                              {projectOptionsMap.get(customer.project_id) ||
                                customer.project_id}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400 italic">
                              —
                            </span>
                          )}
                        </td>

                        {/* Source */}
                        <td className="px-4 py-3.5">
                          {customer.source ? (
                            <span className="inline-block text-[11px] font-bold text-(--text-soft) bg-(--bg-subtle) px-2 py-0.5 rounded-md border border-(--border-soft)">
                              {formatSource(customer.source)}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>

                        {/* Deal Value */}
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-[13px] font-semibold text-(--text-body)">
                            {formatINR(dealVal)}
                          </span>
                        </td>

                        {/* Paid */}
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-[13px] font-bold text-emerald-700">
                            {formatINR(paidVal)}
                          </span>
                        </td>

                        {/* Progress */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${progressPct}%`,
                                  background:
                                    progressPct === 100
                                      ? "var(--brand)"
                                      : progressPct > 50
                                        ? "#3b82f6"
                                        : "#f59e0b",
                                }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-(--text-soft) min-w-8">
                              {progressPct}%
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded border capitalize ${
                              customer.status === "active"
                                ? "bg-(--brand-soft) text-emerald-800 border-(--border-soft)"
                                : customer.status === "completed"
                                  ? "bg-blue-50 text-blue-800 border-blue-100"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {customer.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td
                          className="px-4 py-3.5 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            {canViewProfile && (
                              <button
                                onClick={() => {
                                  setViewingCustomer(customer);
                                  setShowDetailsModal(true);
                                }}
                                className="app-icon-button p-2 text-(--text-soft) hover:text-(--brand) hover:bg-(--brand-soft)"
                                title="Quick View"
                              >
                                <Eye className="size-4" />
                              </button>
                            )}
                            {canViewProfile && (
                              <button
                                onClick={() =>
                                  navigate(
                                    `/crm/customers/${customer.id}`
                                  )
                                }
                                className="app-icon-button p-2 text-(--text-soft) hover:text-blue-700 hover:bg-blue-50"
                                title="View Profile"
                              >
                                <User className="size-4" />
                              </button>
                            )}
                            {canViewLedger && (
                              <button
                                onClick={() =>
                                  navigate(
                                    `/crm/customers/${customer.id}/ledger`
                                  )
                                }
                                className="app-icon-button p-2 text-(--text-soft) hover:text-violet-700 hover:bg-violet-50"
                                title="Payment Ledger"
                              >
                                <CreditCard className="size-4" />
                              </button>
                            )}
                            {customer.status !== "cancelled" && customer.payment_status !== "pending_cancellation" && customer.payment_status !== "cancelled" && (
                              <button
                                onClick={() => handleRequestCancel(customer)}
                                className="app-icon-button p-2 text-(--text-soft) hover:text-rose-600 hover:bg-rose-50"
                                title="Request Booking Cancellation"
                              >
                                <AlertTriangle className="size-4" />
                              </button>
                            )}

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customer Details Modal */}
        {showDetailsModal && viewingCustomer && (
          <CustomerDetailsModal
            customer={viewingCustomer}
            projectName={projectOptionsMap.get(viewingCustomer.project_id) || viewingCustomer.project_id || "—"}
            onClose={() => {
              setShowDetailsModal(false);
              setViewingCustomer(null);
            }}
            onViewProfile={canViewProfile ? () =>
              navigate(`/crm/customers/${viewingCustomer.id}`) : undefined
            }
            onViewLedger={canViewLedger ? () =>
              navigate(`/crm/customers/${viewingCustomer.id}/ledger`) : undefined
            }
          />
        )}

        {/* Cancellation Request Modal */}
        {showCancelModal && cancellingCustomer && createPortal(
          <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999 backdrop-blur-md">
            <div className="app-modal w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
              
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-(--border-soft) flex justify-between items-start bg-white">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="size-11 rounded-2xl flex items-center justify-center bg-rose-50 border border-rose-100 shrink-0">
                    <AlertTriangle className="size-5 text-red-600 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="modal-title">Request Booking Cancellation</h3>
                    <p className="modal-subtitle mt-0.5">
                      Submit request to Accounting for approval
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancellingCustomer(null);
                  }}
                  className="app-icon-button p-1.5 text-(--text-soft) hover:text-(--text-strong) hover:bg-(--bg-subtle) active:scale-95 transition-all cursor-pointer"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={submitCancellation} className="flex flex-col min-h-0 overflow-hidden">
                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#f8faf8]/40">
                  <div className="app-panel-muted p-4 space-y-2.5 text-xs text-(--text-body)">
                    <div className="flex justify-between">
                      <span className="font-semibold text-(--text-soft)">Customer:</span>
                      <span className="font-bold text-(--text-strong)">{cancellingCustomer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-(--text-soft)">Unit / Project:</span>
                      <span className="font-bold text-(--text-strong)">
                        {cancellingCustomer.unit_name || `Unit ${cancellingCustomer.unit_id}`} ({projectOptionsMap.get(cancellingCustomer.project_id) || cancellingCustomer.project_id})
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="modal-label block uppercase tracking-wider">
                      Reason for Cancellation
                    </label>
                    <textarea
                      required
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Please explain the cancellation reasons in detail..."
                      className="app-input w-full min-h-24 resize-none"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-5 py-4 border-t border-(--border-soft) bg-white flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancellingCustomer(null);
                    }}
                    className="app-btn-secondary text-xs min-h-9.5 py-2 px-4 shadow-xs"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCancel}
                    className="app-btn-primary bg-red-600 hover:bg-red-700 text-white text-xs min-h-9.5 py-2 px-4 shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submittingCancel && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Create Customer Wizard */}
        {showCreateWizard && (
          <CreateCustomerWizard
            onClose={() => setShowCreateWizard(false)}
            onSaveSuccess={() => {
              // Refetch is handled by query client invalidation in mutation
            }}
          />
        )}


      </div>
    </div>
  );
}
