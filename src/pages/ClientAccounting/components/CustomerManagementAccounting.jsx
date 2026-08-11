import React from "react";
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import accountingApi from "../../../submodules/crm/accountingApi";
import RecordPaymentModal from "./RecordPaymentModal";
import CustomerLedger from "../../../submodules/crm/admin/pages/customers/CustomerLedger";
import ActionIconButton from "../../../submodules/crm/admin/pages/telemarketing/leads/ActionIconButton";
import ApprovePaymentSlabModal from "./ApprovePaymentSlabModal";
import {
  Building2,
  Search,
  AlertCircle,
  Users,
  Info,
  RefreshCw,
  Loader2,
  IndianRupee,
  CreditCard,
  Clock,
  FileCheck,
  X,
} from "lucide-react";

const checkIfBooked = (responseData, targetItemId) => {
  if (!responseData) return false;

  if (typeof responseData === "boolean") return responseData;

  const data =
    responseData.data !== undefined ? responseData.data : responseData;
  if (!data) return false;

  if (Array.isArray(data)) {
    return data.some((item) => {
      if (item === null || item === undefined) return false;
      if (String(item) === String(targetItemId)) return true;

      const itemId =
        item.itemId ?? item.item_id ?? item.id ?? item.unitId ?? item.unit_id;
      if (itemId !== undefined && String(itemId) === String(targetItemId)) {
        const isBooked = item.isBooked ?? item.is_booked ?? item.booked;
        if (isBooked !== undefined) {
          return typeof isBooked === "boolean"
            ? isBooked
            : String(isBooked).toLowerCase() === "booked";
        }
        const status = String(
          item.booking_status ?? item.status ?? "",
        ).toLowerCase();
        return status === "booked" || status === "sold";
      }
      return false;
    });
  }

  if (typeof data === "object") {
    if (data.items && Array.isArray(data.items)) {
      return checkIfBooked(data.items, targetItemId);
    }

    if (data[targetItemId] !== undefined) {
      const val = data[targetItemId];
      if (typeof val === "boolean") return val;
      if (typeof val === "string")
        return val.toLowerCase() === "booked" || val.toLowerCase() === "sold";
      if (typeof val === "object" && val !== null) {
        return !!(
          val.isBooked ??
          val.is_booked ??
          val.booked ??
          String(val.booking_status ?? val.status ?? "").toLowerCase() ===
            "booked"
        );
      }
    }

    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key])) {
        const found = checkIfBooked(data[key], targetItemId);
        if (found) return true;
      }
    }
  }

  return false;
};

const CustomerManagementAccounting = () => {
  const { user, companyId } = useAuth();

  const [globalLoading, setGlobalLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState("active_bookings");
  const [visible, setVisible] = useState(false);
  const [cancellationRequests, setCancellationRequests] = useState([]);
  const [loadingCancellations, setLoadingCancellations] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedRequestForVerify, setSelectedRequestForVerify] =
    useState(null);
  const [verifiedAmount, setVerifiedAmount] = useState("");
  const [verifyNotes, setVerifyNotes] = useState("");
  const [verifyingRequest, setVerifyingRequest] = useState(false);

  const [pendingProposals, setPendingProposals] = useState([]);
  const [loadingPendingProposals, setLoadingPendingProposals] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedProposalForApproval, setSelectedProposalForApproval] =
    useState(null);

  const [globalSearch, setGlobalSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] =
    useState(null);
  const [activePaymentPlan, setActivePaymentPlan] = useState(null);
  const [loadingPaymentPlan, setLoadingPaymentPlan] = useState(false);

  const [selectedCustomerIdForLedger, setSelectedCustomerIdForLedger] =
    useState(null);

  const [stats, setStats] = useState({
    activeCount: 0,
    newBookingCount: 0,
    totalValue: 0,
    totalCollected: 0,
  });

  const attachPaymentPlan = async (record, type) => {
    const params = { company_id: companyId };

    const tryFetch = async (request) => {
      try {
        const res = await request();
        return res?.data?.data || null;
      } catch (err) {
        if (err.response?.status === 404) return null;
        console.warn("Failed loading accounting payment plan", record, err);
        return null;
      }
    };

    let plan = null;

    if (record.ledger_id) {
      plan = await tryFetch(() =>
        accountingApi.get(`/api/v1/project-payment/${record.ledger_id}`, {
          params,
        }),
      );
    }

    if (!plan && type === "customer" && record.lead_id) {
      plan = await tryFetch(() =>
        accountingApi.get("/api/v1/project-payment", {
          params: { ...params, lead_id: record.lead_id },
        }),
      );
    }

    if (!plan && record.id) {
      const idParam =
        type === "lead" ? { lead_id: record.id } : { customer_id: record.id };
      plan = await tryFetch(() =>
        accountingApi.get("/api/v1/project-payment", {
          params: { ...params, ...idParam },
        }),
      );
    }

    if (!plan) return { ...record, total_deal_value: 0, total_paid: 0 };

    const totalPaid = (plan.slabs || []).reduce(
      (sum, slab) => sum + (Number(slab.paid_amount) || 0),
      0,
    );

    return {
      ...record,
      ledger_id: plan.ledger_id || null,
      total_deal_value: Number(plan.total_deal_value || 0),
      total_paid: totalPaid,
      payment_status: plan.status,
      payment_plan: plan,
    };
  };

  const fetchGlobalData = async () => {
    if (!companyId) return;
    setGlobalLoading(true);
    setGlobalError(null);
    try {
      const token = user?.token;
      const res = await axios.get(
        `${import.meta.env.VITE_CRM_BASE_URL}/api/accounting/leads-customers?company_id=${companyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.data && res.data.success) {
        const crmLeads = res.data.data.leads || [];
        const crmCustomers = res.data.data.customers || [];
        const fetchedCustomers = await Promise.all(
          crmCustomers.map((customer) =>
            attachPaymentPlan(customer, "customer"),
          ),
        );
        const enrichedLeads = await Promise.all(
          crmLeads.map((lead) => attachPaymentPlan(lead, "lead")),
        );
        const approvedLeads = enrichedLeads.filter(
          (lead) => !!lead.payment_plan && lead.payment_status === "active",
        );
        setLeads(approvedLeads);
        setCustomers(fetchedCustomers);

        const activeCusts = fetchedCustomers.filter(
          (c) =>
            (c.status === "active" || c.status === "completed") &&
            Number(c.total_paid || 0) > 0,
        );
        const pendingCustomerBookings = fetchedCustomers.filter(
          (c) =>
            c.status === "pending" &&
            c.payment_status === "active" &&
            Number(c.total_paid || 0) === 0,
        );
        const pendingLeadBookings = approvedLeads.filter(
          (lead) => Number(lead.total_paid || 0) === 0,
        );

        const totalVal = activeCusts.reduce(
          (acc, c) => acc + Number(c.total_deal_value || 0),
          0,
        );
        const totalColl = activeCusts.reduce(
          (acc, c) => acc + Number(c.total_paid || 0),
          0,
        );

        setStats({
          activeCount: activeCusts.length,
          newBookingCount:
            pendingCustomerBookings.length + pendingLeadBookings.length,
          totalValue: totalVal,
          totalCollected: totalColl,
        });
      } else {
        throw new Error(res.data.message || "Failed to load data.");
      }
    } catch (err) {
      console.error("Error fetching accounting global data:", err);
      setGlobalError(err.message || "Failed to load CRM data.");
    } finally {
      setGlobalLoading(false);
    }
  };

  const fetchProjects = async () => {
    if (!companyId) return;
    try {
      const token = user?.token;
      const res = await axios.get(
        `${import.meta.env.VITE_CRM_BASE_URL}/api/projects/options`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.data && res.data.success) {
        setProjects(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching projects options:", err);
    }
  };

  const fetchCancellationRequests = async () => {
    if (!companyId) return;
    try {
      setLoadingCancellations(true);
      const res = await accountingApi.get("/api/v1/bookings/cancellations", {
        params: { company_id: companyId },
      });
      if (res.data && res.data.success) {
        setCancellationRequests(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching cancellations:", err);
    } finally {
      setLoadingCancellations(false);
    }
  };

  const handleOpenVerify = (request) => {
    setSelectedRequestForVerify(request);
    setVerifiedAmount(String(request.verified_paid_amount || ""));
    setVerifyNotes("");
    setShowVerifyModal(true);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifiedAmount || isNaN(Number(verifiedAmount))) {
      alert("Please enter a valid verified amount.");
      return;
    }

    try {
      setVerifyingRequest(true);
      const res = await accountingApi.post(
        `/api/v1/bookings/cancellations/${selectedRequestForVerify.id}/verify`,
        {
          company_id: companyId,
          verified_paid_amount: Number(verifiedAmount),
          notes: verifyNotes,
        },
      );

      if (res.data && res.data.success) {
        alert("Cancellation request successfully verified and sent to Admin.");
        setShowVerifyModal(false);
        setSelectedRequestForVerify(null);
        fetchCancellationRequests();
        fetchGlobalData();
      } else {
        alert(res.data.message || "Failed to verify request.");
      }
    } catch (err) {
      console.error("Error verifying request:", err);
      alert(err.response?.data?.message || "Failed to verify request.");
    } finally {
      setVerifyingRequest(false);
    }
  };

  const fetchPendingProposals = async () => {
    if (!companyId) return;
    try {
      setLoadingPendingProposals(true);
      const res = await accountingApi.get("/api/v1/project-payment/pending", {
        params: { company_id: companyId },
      });
      if (res.data && res.data.success) {
        setPendingProposals(res.data.data || []);
      }
    } catch (err) {
      console.warn("Failed fetching pending proposals:", err);
    } finally {
      setLoadingPendingProposals(false);
    }
  };

  const handleRefresh = () => {
    fetchGlobalData();
    fetchProjects();
    fetchCancellationRequests();
    fetchPendingProposals();
  };

  useEffect(() => {
    if (companyId) {
      fetchGlobalData();
      fetchProjects();
      fetchCancellationRequests();
      fetchPendingProposals();
    }
  }, [companyId]);

  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    setUnitFilter("");
  }, [projectFilter]);

  const handleOpenPayment = async (record) => {
    const planId = record.ledger_id;
    try {
      setLoadingPaymentPlan(true);
      setSelectedCustomerForPayment(record);

      const response = await accountingApi.get(
        `/api/v1/project-payment/${planId}`,
        {
          params: { company_id: companyId },
        },
      );

      if (response.data && response.data.success) {
        setActivePaymentPlan(response.data.data);
        setShowPaymentModal(true);
      } else {
        alert("Failed to load payment plan details.");
      }
    } catch (err) {
      console.error("Error loading payment plan:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to load payment plan.",
      );
    } finally {
      setLoadingPaymentPlan(false);
    }
  };

  const handlePaymentSuccess = async () => {
    fetchGlobalData();

    if (selectedCustomerForPayment) {
      const record = selectedCustomerForPayment;
      const isFirstPayment =
        !record.status ||
        record.status === "pending" ||
        Number(record.total_paid || 0) === 0;

      if (isFirstPayment) {
        let projectType = "apartment";
        let projectId = record.project_id;
        if (
          typeof record.project_id === "string" &&
          record.project_id.includes(":")
        ) {
          const parts = record.project_id.split(":");
          projectType = parts[0];
          projectId = parts[1];
        }
        const itemId = record.unit_id;

        if (projectId && itemId) {
          try {
            const token = user?.token;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const bookingRes = await axios.get(
              `${import.meta.env.VITE_CSAAP_URL}/api/tenant/type/${projectType}/${projectId}/booking-status`,
              { headers },
            );

            const isAlreadyBooked = checkIfBooked(bookingRes.data, itemId);

            if (!isAlreadyBooked) {
              console.log(
                `Unit/Item ${itemId} is not booked. Toggling booking status...`,
              );
              await axios.put(
                `${import.meta.env.VITE_CSAAP_URL}/api/tenant/type/${projectType}/${projectId}/items/${itemId}/toggle-booking-status`,
                {},
                { headers },
              );
              console.log(
                `Booking status successfully toggled for item ${itemId}.`,
              );
            } else {
              console.log(`Unit/Item ${itemId} is already booked.`);
            }
          } catch (err) {
            console.error(
              "Error checking or toggling unit booking status:",
              err,
            );
          }
        }
      }
    }

    setShowPaymentModal(false);
    setSelectedCustomerForPayment(null);
    setActivePaymentPlan(null);
  };

  const preparedSlabs = useMemo(() => {
    if (!activePaymentPlan || !activePaymentPlan.slabs) return [];
    return activePaymentPlan.slabs.map((s) => ({
      db_slab_id: s.id,
      name: s.stage_name || s.name,
      allocated_amount: Number(s.allocated_amount),
      paid_amount: Number(s.paid_amount),
      status: s.status,
      ratio_percentage: Number(s.ratio_percentage),
    }));
  }, [activePaymentPlan]);

  const availableUnitsForSelectedProject = useMemo(() => {
    if (!projectFilter) return [];

    const unitsMap = new Map();

    customers.forEach((c) => {
      if (c.project_id === projectFilter && c.unit_id) {
        unitsMap.set(String(c.unit_id), c.unit_name || `Unit ${c.unit_id}`);
      }
    });

    leads.forEach((l) => {
      if (l.project_id === projectFilter && l.unit_id) {
        unitsMap.set(String(l.unit_id), l.unit_name || `Unit ${l.unit_id}`);
      }
    });

    return Array.from(unitsMap.entries())
      .map(([id, name]) => ({
        unit_id: id,
        unit_name: name,
      }))
      .sort((a, b) =>
        a.unit_name.localeCompare(b.unit_name, undefined, {
          numeric: true,
          sensitivity: "base",
        }),
      );
  }, [projectFilter, customers, leads]);

  const getFilteredCustomers = () => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        c.phone.includes(globalSearch) ||
        (c.email && c.email.toLowerCase().includes(globalSearch.toLowerCase()));
      const matchesProject = projectFilter
        ? c.project_id === projectFilter
        : true;
      const matchesUnit =
        projectFilter && unitFilter
          ? String(c.unit_id) === String(unitFilter)
          : true;
      return matchesSearch && matchesProject && matchesUnit;
    });
  };

  const getFilteredLeads = () => {
    return leads.filter((l) => {
      const matchesSearch =
        l.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        l.phone.includes(globalSearch) ||
        (l.email && l.email.toLowerCase().includes(globalSearch.toLowerCase()));
      const matchesProject = projectFilter
        ? l.project_id === projectFilter
        : true;
      const matchesUnit =
        projectFilter && unitFilter
          ? String(l.unit_id) === String(unitFilter)
          : true;
      return matchesSearch && matchesProject && matchesUnit;
    });
  };

  const filteredCustomersList = getFilteredCustomers();
  const filteredLeadsList = getFilteredLeads();
  const activeBookings = filteredCustomersList.filter(
    (customer) =>
      (customer.status === "active" || customer.status === "completed") &&
      Number(customer.total_paid || 0) > 0,
  );
  const newBookings = [
    ...filteredCustomersList
      .filter(
        (customer) =>
          customer.status === "pending" &&
          customer.payment_status === "active" &&
          Number(customer.total_paid || 0) === 0,
      )
      .map((customer) => ({
        ...customer,
        bookingSource: "Direct booking",
        isCustomer: true,
      })),
    ...filteredLeadsList
      .filter((lead) => Number(lead.total_paid || 0) === 0)
      .map((lead) => ({
        ...lead,
        bookingSource: "Lead booking",
        isCustomer: false,
      })),
  ];
  const filteredPendingProposals = pendingProposals.filter((proposal) => {
    const searchTerm = globalSearch.toLowerCase();
    const client = proposal.client_info || {};
    const matchesSearch =
      !searchTerm ||
      client.name?.toLowerCase().includes(searchTerm) ||
      client.phone?.includes(globalSearch) ||
      client.email?.toLowerCase().includes(searchTerm);
    const matchesProject = projectFilter
      ? proposal.project_id === projectFilter
      : true;
    const matchesUnit = unitFilter
      ? String(proposal.unit_id) === String(unitFilter)
      : true;
    return matchesSearch && matchesProject && matchesUnit;
  });
  const filteredCancellationRequests = cancellationRequests.filter(
    (request) => {
      const searchTerm = globalSearch.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        request.customer_name?.toLowerCase().includes(searchTerm) ||
        request.customer_phone?.includes(globalSearch);
      const matchesProject = projectFilter
        ? request.project_id === projectFilter
        : true;
      const matchesUnit = unitFilter
        ? String(request.unit_id) === String(unitFilter)
        : true;
      return matchesSearch && matchesProject && matchesUnit;
    },
  );

  if (selectedCustomerIdForLedger) {
    return (
      <CustomerLedger
        customerId={selectedCustomerIdForLedger}
        onBack={() => setSelectedCustomerIdForLedger(null)}
      />
    );
  }

  return (
    <div className="erp-root size-full min-h-screen">
      <div
        className={`app-shell p-4 space-y-6 transition-all duration-300 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="app-title flex items-center gap-2">
                <Building2 className="text-(--brand) size-6" />
                Booking Payments
              </h1>
              <p className="app-subtitle mt-1">
                Approve plans, collect first payments, and manage active or
                cancelled bookings.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRefresh}
                disabled={globalLoading}
                className="app-btn-secondary flex items-center gap-2 text-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`size-4 ${globalLoading ? "animate-spin" : ""}`}
                />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>

          {globalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
              <AlertCircle size={20} className="shrink-0" />
              <p>{globalError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
            <div className="app-panel p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-bold text-(--text-soft)">
                    Active Bookings
                  </p>
                  <div className="mt-2 text-[28px] font-extrabold leading-none text-(--text-strong)">
                    {stats.activeCount}
                  </div>
                </div>
                <div className="size-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Users className="size-5 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="app-panel p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-bold text-(--text-soft)">
                    New Bookings
                  </p>
                  <div className="mt-2 text-[28px] font-extrabold leading-none text-(--text-strong)">
                    {stats.newBookingCount}
                  </div>
                </div>
                <div className="size-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <Clock className="size-5 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="app-panel p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-bold text-(--text-soft)">
                    Plan Approval
                  </p>
                  <div className="mt-2 text-[28px] font-extrabold leading-none text-(--text-strong)">
                    {pendingProposals.length}
                  </div>
                </div>
                <div className="size-10 rounded-2xl bg-(--brand-soft) border border-(--border-soft) flex items-center justify-center shrink-0">
                  <Info className="size-5 text-(--brand)" />
                </div>
              </div>
            </div>

            <div className="app-panel p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-bold text-(--text-soft)">
                    Cancelled Bookings
                  </p>
                  <div className="mt-2 text-[28px] font-extrabold leading-none text-(--text-strong)">
                    {cancellationRequests.length}
                  </div>
                </div>
                <div className="size-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                  <X className="size-5 text-rose-600" />
                </div>
              </div>
            </div>

            <div className="app-panel p-4 col-span-1 sm:col-span-2 xl:col-span-2 bg-linear-to-br from-white to-(--bg-subtle)/30">
              <div className="w-full">
                <p className="text-[12px] font-bold text-(--text-soft)">
                  Total Financial Value
                </p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-(--text-faint)">
                      Deal Value
                    </p>
                    <p className="text-lg font-extrabold text-(--text-strong) mt-0.5">
                      ₹{stats.totalValue.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-(--text-faint)">
                      Total Collected
                    </p>
                    <p className="text-lg font-extrabold text-emerald-600 mt-0.5">
                      ₹{stats.totalCollected.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-emerald-500"
                    style={{
                      width: `${stats.totalValue > 0 ? Math.min(Math.round((stats.totalCollected / stats.totalValue) * 100), 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="sticky top-0 z-20 -mx-4 px-4 py-3 border-b border-(--border-soft) flex justify-between items-center bg-[#f8faf8]/80 backdrop-blur-md">
            <div className="flex items-center gap-2 overflow-x-auto custom-none">
              <button
                onClick={() => setActiveSubTab("active_bookings")}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-bold tracking-[-0.02em] whitespace-nowrap transition-all cursor-pointer ${
                  activeSubTab === "active_bookings"
                    ? "border-transparent text-white shadow-[0_14px_28px_rgba(0,166,81,0.18)]"
                    : "bg-white border-(--border-soft) text-(--text-body) hover:bg-white hover:border-(--border-strong)"
                }`}
                style={
                  activeSubTab === "active_bookings"
                    ? {
                        background:
                          "linear-gradient(135deg, var(--brand), #00c853)",
                      }
                    : undefined
                }
              >
                <span>Active Bookings</span>
                <span
                  className={`min-w-6 h-6 px-1.5 inline-flex items-center justify-center rounded-lg text-[11px] font-bold ${
                    activeSubTab === "active_bookings"
                      ? "bg-white/16 text-white"
                      : "bg-(--bg-subtle) text-(--text-soft)"
                  }`}
                >
                  {activeBookings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSubTab("new_bookings")}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-bold tracking-[-0.02em] whitespace-nowrap transition-all cursor-pointer ${
                  activeSubTab === "new_bookings"
                    ? "border-transparent text-white shadow-[0_14px_28px_rgba(0,166,81,0.18)]"
                    : "bg-white border-(--border-soft) text-(--text-body) hover:bg-white hover:border-(--border-strong)"
                }`}
                style={
                  activeSubTab === "new_bookings"
                    ? {
                        background:
                          "linear-gradient(135deg, var(--brand), #00c853)",
                      }
                    : undefined
                }
              >
                <span>New Bookings</span>
                <span
                  className={`min-w-6 h-6 px-1.5 inline-flex items-center justify-center rounded-lg text-[11px] font-bold ${
                    activeSubTab === "new_bookings"
                      ? "bg-white/16 text-white"
                      : "bg-(--bg-subtle) text-(--text-soft)"
                  }`}
                >
                  {newBookings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSubTab("plan_approval")}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-bold tracking-[-0.02em] whitespace-nowrap transition-all cursor-pointer ${
                  activeSubTab === "plan_approval"
                    ? "border-transparent text-white shadow-[0_14px_28px_rgba(0,166,81,0.18)]"
                    : "bg-white border-(--border-soft) text-(--text-body) hover:bg-white hover:border-(--border-strong)"
                }`}
                style={
                  activeSubTab === "plan_approval"
                    ? {
                        background:
                          "linear-gradient(135deg, var(--brand), #00c853)",
                      }
                    : undefined
                }
              >
                <span>Plan Approval</span>
                <span
                  className={`min-w-6 h-6 px-1.5 inline-flex items-center justify-center rounded-lg text-[11px] font-bold ${
                    activeSubTab === "plan_approval"
                      ? "bg-white/16 text-white"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}
                >
                  {filteredPendingProposals.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSubTab("cancelled_bookings")}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-bold tracking-[-0.02em] whitespace-nowrap transition-all cursor-pointer ${
                  activeSubTab === "cancelled_bookings"
                    ? "border-transparent text-white shadow-[0_14px_28px_rgba(0,166,81,0.18)]"
                    : "bg-white border-(--border-soft) text-(--text-body) hover:bg-white hover:border-(--border-strong)"
                }`}
                style={
                  activeSubTab === "cancelled_bookings"
                    ? {
                        background:
                          "linear-gradient(135deg, var(--brand), #00c853)",
                      }
                    : undefined
                }
              >
                <span>Cancelled Bookings</span>
                <span
                  className={`min-w-6 h-6 px-1.5 inline-flex items-center justify-center rounded-lg text-[11px] font-bold ${
                    activeSubTab === "cancelled_bookings"
                      ? "bg-white/16 text-white"
                      : "bg-(--bg-subtle) text-(--text-soft)"
                  }`}
                >
                  {filteredCancellationRequests.length}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-(--text-faint)" />
                <input
                  value={globalSearch}
                  onChange={(event) => setGlobalSearch(event.target.value)}
                  placeholder="Search bookings"
                  className="app-input w-44 py-1.5 pl-8 pr-3 text-xs font-medium bg-white"
                />
              </label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="app-input text-xs font-semibold py-1.5 px-3 min-h-9.5 bg-white cursor-pointer"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.project_id} value={p.project_id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {projectFilter && (
                <select
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  className="app-input text-xs font-semibold py-1.5 px-3 min-h-9.5 bg-white cursor-pointer"
                >
                  <option value="">All Units</option>
                  {availableUnitsForSelectedProject.map((u) => (
                    <option key={u.unit_id} value={u.unit_id}>
                      {u.unit_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {globalLoading ? (
            <div className="flex items-center justify-center py-16 gap-2.5 text-(--text-soft)">
              <Loader2 className="size-6 animate-spin text-(--brand)" />
              <span className="text-sm font-semibold">Loading records...</span>
            </div>
          ) : activeSubTab === "plan_approval" ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-(--border-soft) text-left border-collapse">
                <thead className="bg-(--bg-subtle)/30">
                  <tr>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Booking Contact
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Unit / Project
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-right">
                      Deal Value
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-center">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-(--border-soft)">
                  {filteredPendingProposals.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-10 text-(--text-faint)"
                      >
                        <Search className="size-8 mx-auto mb-3 text-(--text-faint)" />
                        <p className="text-[14px] font-medium text-(--text-strong)">
                          No plans awaiting approval
                        </p>
                        <p className="text-[13px] mt-1 text-(--text-soft)">
                          Lead and direct-customer plans appear here until
                          Accounting approves them.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredPendingProposals.map((prop) => {
                      const letter = (
                        prop.client_info?.name ||
                        prop.unit_name ||
                        "L"
                      )
                        .charAt(0)
                        .toUpperCase();
                      return (
                        <tr
                          key={prop.id}
                          className="hover:bg-(--bg-subtle)/70 duration-200 transition-colors"
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                                <span className="font-extrabold text-[13px] text-amber-700 tracking-tight">
                                  {letter}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <span className="text-[14px] font-bold text-(--text-strong) block">
                                  {prop.client_info?.name ||
                                    "Booking #" +
                                      (prop.lead_id ||
                                        prop.customer_id ||
                                        prop.id)}
                                </span>
                                <span className="text-[12px] font-medium text-(--text-faint) mt-0.5 block">
                                  {prop.client_info?.phone || "No phone"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-[13px] font-semibold text-(--text-body) block">
                              {prop.unit_name}
                            </span>
                            <span className="text-[12px] font-medium text-(--text-faint) mt-0.5 block">
                              {prop.project_id}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right text-[13px] font-bold text-(--text-strong)">
                            ₹
                            {Number(prop.total_deal_value || 0).toLocaleString(
                              "en-IN",
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              Pending Accounting Approval
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedProposalForApproval(prop);
                                setShowApprovalModal(true);
                              }}
                              className="px-2.5 py-1 text-[11.5px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all active:scale-95 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              title="Review & Approve Proposal"
                            >
                              <FileCheck className="size-3.5 text-emerald-600" />
                              <span>Review &amp; Approve</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : activeSubTab === "cancelled_bookings" ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-(--border-soft) text-left border-collapse">
                <thead className="bg-(--bg-subtle)/30">
                  <tr>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Customer Detail
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Unit / Project
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Reason
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-right">
                      Paid Verified
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-center">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-(--border-soft)">
                  {filteredCancellationRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-10 text-(--text-faint)"
                      >
                        <Search className="size-8 mx-auto mb-3 text-(--text-faint)" />
                        <p className="text-[14px] font-medium text-(--text-strong)">
                          No cancelled bookings found
                        </p>
                        <p className="text-[13px] mt-1 text-(--text-soft)">
                          Cancelled bookings and in-progress cancellation
                          requests appear here.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCancellationRequests.map((r) => {
                      const letter =
                        r.customer_name?.charAt(0).toUpperCase() || "C";
                      return (
                        <tr
                          key={r.id}
                          className="hover:bg-(--bg-subtle)/70 duration-200 transition-colors"
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-xl bg-(--brand-soft) border border-(--border-soft) flex items-center justify-center shrink-0">
                                <span className="font-extrabold text-[13px] text-(--brand-strong) tracking-tight">
                                  {letter}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <span className="text-[14px] font-bold text-(--text-strong) block">
                                  {r.customer_name}
                                </span>
                                <span className="text-[12px] font-medium text-(--text-faint) mt-0.5 block">
                                  {r.customer_phone}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-[13px] font-semibold text-(--text-body) block">
                              {r.unit_name}
                            </span>
                            <span className="text-[12px] font-medium text-(--text-faint) mt-0.5 block">
                              {r.project_id}
                            </span>
                          </td>
                          <td
                            className="px-4 py-3.5 text-[13px] text-(--text-soft) max-w-xs truncate"
                            title={r.reason}
                          >
                            {r.reason}
                          </td>
                          <td className="px-4 py-3.5 text-right text-[13px] font-bold text-(--text-strong)">
                            {r.overall_status !== "pending_accounting"
                              ? `₹${Number(r.verified_paid_amount).toLocaleString("en-IN")}`
                              : "—"}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                                r.overall_status === "pending_accounting"
                                  ? "bg-sky-50 text-sky-700 border border-sky-200"
                                  : r.overall_status === "pending_admin"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : r.overall_status === "approved"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {r.overall_status === "pending_accounting"
                                ? "Pending Accounting"
                                : r.overall_status === "pending_admin"
                                  ? "Pending Admin"
                                  : r.overall_status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {r.overall_status === "pending_accounting" ? (
                              <ActionIconButton
                                icon={FileCheck}
                                label="Verify Ledger"
                                onClick={() => handleOpenVerify(r)}
                                className="app-icon-button p-1.5 text-violet-600 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"
                              />
                            ) : (
                              <span className="text-[12px] font-semibold text-(--text-faint)">
                                Processed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : activeSubTab === "active_bookings" ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-(--border-soft) text-left border-collapse">
                <thead className="bg-(--bg-subtle)/30">
                  <tr>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Contact Info
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Project Unit
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-right">
                      Deal Value
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Total Paid
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
                  {activeBookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-10 text-(--text-faint)"
                      >
                        <Search className="size-8 mx-auto mb-3 text-(--text-faint)" />
                        <p className="text-[14px] font-medium text-(--text-strong)">
                          No active bookings found
                        </p>
                        <p className="text-[13px] mt-1 text-(--text-soft)">
                          Try adjusting your search or filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    activeBookings.map((c) => {
                      const percentPaid =
                        c.total_deal_value > 0
                          ? Math.round(
                              (c.total_paid / c.total_deal_value) * 100,
                            )
                          : 0;
                      const isActive =
                        c.status === "active" || c.status === "completed";
                      const hasPlan = !!c.ledger_id;
                      const letter = c.name?.charAt(0).toUpperCase() || "C";

                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-(--bg-subtle)/70 duration-200 transition-colors"
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-xl bg-(--brand-soft) border border-(--border-soft) flex items-center justify-center shrink-0">
                                <span className="font-extrabold text-[13px] text-(--brand-strong) tracking-tight">
                                  {letter}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <span className="text-[14px] font-bold text-(--text-strong) block">
                                  {c.name}
                                </span>
                                <div className="text-[12px] font-medium text-(--text-faint) flex items-center gap-1.5 mt-0.5 truncate">
                                  <span>{c.phone}</span>
                                  {c.email && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate">
                                        {c.email}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-[13px] font-semibold text-(--text-body) block">
                              {c.unit_name || `Unit ${c.unit_id}`}
                            </span>
                            <span className="text-[12px] font-medium text-(--text-faint) mt-0.5 block">
                              {c.project_id}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right text-[13px] font-semibold text-(--text-body)">
                            ₹{c.total_deal_value.toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-[13px] font-bold text-emerald-700 block">
                              ₹{c.total_paid.toLocaleString("en-IN")}
                            </span>
                            <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-amber-500"}`}
                                style={{
                                  width: `${Math.min(percentPaid, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-[10px] text-(--text-faint) mt-0.5 block">
                              {percentPaid}% Paid
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                                c.status === "active"
                                  ? "bg-green-50 text-green-600 border border-green-200"
                                  : c.status === "pending"
                                    ? "bg-amber-50 text-amber-650 border border-amber-200"
                                    : "bg-slate-50 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenPayment(c)}
                                disabled={
                                  !hasPlan ||
                                  loadingPaymentPlan ||
                                  c.payment_status === "pending_cancellation" ||
                                  c.payment_status === "cancelled" ||
                                  c.status === "cancelled"
                                }
                                className="app-icon-button p-2 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-250 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
                                title={
                                  c.payment_status === "pending_cancellation"
                                    ? "Payment Locked (Cancellation Pending)"
                                    : c.payment_status === "cancelled" ||
                                        c.status === "cancelled"
                                      ? "Payment Locked (Cancelled)"
                                      : "Record Payment"
                                }
                              >
                                {loadingPaymentPlan &&
                                selectedCustomerForPayment?.id === c.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <IndianRupee className="w-4 h-4" />
                                )}
                              </button>

                              <button
                                onClick={() =>
                                  setSelectedCustomerIdForLedger(c.id)
                                }
                                className="app-icon-button p-2 text-violet-600 hover:bg-violet-50 hover:border-violet-250 border border-transparent active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
                                title="View Ledger"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-(--border-soft) text-left border-collapse">
                <thead className="bg-(--bg-subtle)/30">
                  <tr>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Booking Contact
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Project Unit
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Booking Source
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-right">
                      Deal Value
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-center">
                      Plan Status
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-(--border-soft)">
                  {newBookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-10 text-(--text-faint)"
                      >
                        <Search className="size-8 mx-auto mb-3 text-(--text-faint)" />
                        <p className="text-[14px] font-medium text-(--text-strong)">
                          No new bookings found
                        </p>
                        <p className="text-[13px] mt-1 text-(--text-soft)">
                          Approved bookings will appear here until their first
                          payment is recorded.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    newBookings.map((booking) => {
                      const hasPlan = !!booking.ledger_id;
                      const l = booking;
                      const letter =
                        booking.name?.charAt(0).toUpperCase() || "B";
                      return (
                        <tr
                          key={`${booking.isCustomer ? "customer" : "lead"}-${booking.id}`}
                          className="hover:bg-(--bg-subtle)/70 duration-200 transition-colors"
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-xl bg-(--brand-soft) border border-(--border-soft) flex items-center justify-center shrink-0">
                                <span className="font-extrabold text-[13px] text-(--brand-strong) tracking-tight">
                                  {letter}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <span className="text-[14px] font-bold text-(--text-strong) block">
                                  {booking.name}
                                </span>
                                <div className="text-[12px] font-medium text-(--text-faint) flex items-center gap-1.5 mt-0.5 truncate">
                                  <span>{booking.phone}</span>
                                  {booking.email && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate">
                                        {booking.email}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-[13px] font-semibold text-(--text-body) block">
                              {booking.unit_id
                                ? booking.unit_name || `Unit ${booking.unit_id}`
                                : "No Unit Selected"}
                            </span>
                            <span className="text-[12px] font-medium text-(--text-faint) mt-0.5 block">
                              {booking.project_id || "Unlinked Project"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {booking.bookingSource}
                            </span>
                            <span className="text-[12px] font-medium text-(--text-faint) mt-0.5 block">
                              Approved plan · no payment received
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right text-[13px] font-semibold text-(--text-body)">
                            {l.total_deal_value > 0
                              ? `₹${l.total_deal_value.toLocaleString("en-IN")}`
                              : "—"}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Awaiting first payment
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => handleOpenPayment(booking)}
                              disabled={
                                !hasPlan ||
                                loadingPaymentPlan ||
                                booking.payment_status ===
                                  "pending_cancellation" ||
                                booking.payment_status === "cancelled"
                              }
                              className="app-icon-button p-2 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-250 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
                              title={
                                booking.payment_status ===
                                "pending_cancellation"
                                  ? "Payment Locked (Cancellation Pending)"
                                  : booking.payment_status === "cancelled"
                                    ? "Payment Locked (Cancelled)"
                                    : "Record First Payment"
                              }
                            >
                              {loadingPaymentPlan &&
                              selectedCustomerForPayment?.id === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <IndianRupee className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {false &&
        showPaymentModal &&
        selectedCustomerForPayment &&
        activePaymentPlan && (
          <RecordPaymentModal
            lead={selectedCustomerForPayment}
            paymentPlan={activePaymentPlan}
            stages={preparedSlabs}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedCustomerForPayment(null);
              setActivePaymentPlan(null);
            }}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

      {false &&
        showVerifyModal &&
        selectedRequestForVerify &&
        createPortal(
          <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999 backdrop-blur-md">
            <div className="app-modal w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-(--border-soft) flex justify-between items-start bg-white">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="size-11 rounded-2xl flex items-center justify-center bg-(--brand-soft) border border-(--border-soft) shrink-0">
                    <AlertCircle className="size-5 text-(--brand)" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="modal-title">Verify Booking Payments</h3>
                    <p className="modal-subtitle mt-0.5">
                      Customer: {selectedRequestForVerify.customer_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedRequestForVerify(null);
                  }}
                  className="app-icon-button p-1.5 text-(--text-soft) hover:text-(--text-strong) hover:bg-(--bg-subtle) active:scale-95 transition-all cursor-pointer"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleVerifySubmit}
                className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#f8faf8]/40"
              >
                <div className="app-panel-muted p-4 space-y-2.5 text-xs text-(--text-body)">
                  <div className="flex justify-between">
                    <span className="font-semibold text-(--text-soft)">
                      Unit Name:
                    </span>
                    <span className="font-bold text-(--text-strong)">
                      {selectedRequestForVerify.unit_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-(--text-soft)">
                      Project / Type:
                    </span>
                    <span className="font-bold text-(--text-strong)">
                      {selectedRequestForVerify.project_id}
                    </span>
                  </div>
                  <div className="flex flex-col pt-2 border-t border-(--border-soft)">
                    <span className="font-semibold text-(--text-soft) mb-1">
                      Reason for Cancellation:
                    </span>
                    <span className="font-medium text-(--text-strong) italic bg-white p-2.5 rounded-lg border border-(--border-soft) block w-full">
                      {selectedRequestForVerify.reason}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="modal-label block uppercase tracking-wider">
                    Verified Paid Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={verifiedAmount}
                    onChange={(e) => setVerifiedAmount(e.target.value)}
                    placeholder="Enter total verified amount received"
                    className="app-input w-full"
                  />
                  <p className="modal-helper mt-1">
                    Cross-reference with customer bank transfer slips and
                    payment ledger.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="modal-label block uppercase tracking-wider">
                    Verification Notes
                  </label>
                  <textarea
                    value={verifyNotes}
                    onChange={(e) => setVerifyNotes(e.target.value)}
                    placeholder="Write reference transaction IDs, clearance status notes..."
                    className="app-input w-full min-h-20 resize-none"
                  />
                </div>

                <div className="px-5 py-4 border-t border-(--border-soft) bg-white flex items-center justify-end gap-3 -mx-5 -mb-5 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVerifyModal(false);
                      setSelectedRequestForVerify(null);
                    }}
                    className="app-btn-secondary text-xs min-h-9.5 py-2 px-4 shadow-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifyingRequest}
                    className="app-btn-primary text-xs min-h-9.5 py-2 px-4 shadow-xs flex items-center gap-1.5"
                  >
                    {verifyingRequest && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    Verify & Forward
                  </button>
                </div>
              </form>
            </div>
          </div>,
        )}

      {showPaymentModal && selectedCustomerForPayment && activePaymentPlan && (
        <RecordPaymentModal
          lead={selectedCustomerForPayment}
          paymentPlan={activePaymentPlan}
          stages={preparedSlabs}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedCustomerForPayment(null);
            setActivePaymentPlan(null);
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {showVerifyModal &&
        selectedRequestForVerify &&
        createPortal(
          <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999 backdrop-blur-md">
            <div className="app-modal w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-(--border-soft) flex justify-between items-start bg-white">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="size-11 rounded-2xl flex items-center justify-center bg-(--brand-soft) border border-(--border-soft) shrink-0">
                    <AlertCircle className="size-5 text-(--brand)" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="modal-title">Verify Booking Payments</h3>
                    <p className="modal-subtitle mt-0.5">
                      Customer: {selectedRequestForVerify.customer_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedRequestForVerify(null);
                  }}
                  className="app-icon-button p-1.5 text-(--text-soft) hover:text-(--text-strong) hover:bg-(--bg-subtle) active:scale-95 transition-all cursor-pointer"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleVerifySubmit}
                className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#f8faf8]/40"
              >
                <div className="app-panel-muted p-4 space-y-2.5 text-xs text-(--text-body)">
                  <div className="flex justify-between">
                    <span className="font-semibold text-(--text-soft)">
                      Unit Name:
                    </span>
                    <span className="font-bold text-(--text-strong)">
                      {selectedRequestForVerify.unit_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-(--text-soft)">
                      Project / Type:
                    </span>
                    <span className="font-bold text-(--text-strong)">
                      {selectedRequestForVerify.project_id}
                    </span>
                  </div>
                  <div className="flex flex-col pt-2 border-t border-(--border-soft)">
                    <span className="font-semibold text-(--text-soft) mb-1">
                      Reason for Cancellation:
                    </span>
                    <span className="font-medium text-(--text-strong) italic bg-white p-2.5 rounded-lg border border-(--border-soft) block w-full">
                      {selectedRequestForVerify.reason}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="modal-label block uppercase tracking-wider">
                    Verified Paid Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={verifiedAmount}
                    onChange={(e) => setVerifiedAmount(e.target.value)}
                    placeholder="Enter total verified amount received"
                    className="app-input w-full"
                  />
                  <p className="modal-helper mt-1">
                    Cross-reference with customer bank transfer slips and
                    payment ledger.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="modal-label block uppercase tracking-wider">
                    Verification Notes
                  </label>
                  <textarea
                    value={verifyNotes}
                    onChange={(e) => setVerifyNotes(e.target.value)}
                    placeholder="Write reference transaction IDs, clearance status notes..."
                    className="app-input w-full min-h-20 resize-none"
                  />
                </div>

                <div className="px-5 py-4 border-t border-(--border-soft) bg-white flex items-center justify-end gap-3 -mx-5 -mb-5 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVerifyModal(false);
                      setSelectedRequestForVerify(null);
                    }}
                    className="app-btn-secondary text-xs min-h-9.5 py-2 px-4 shadow-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifyingRequest}
                    className="app-btn-primary text-xs min-h-9.5 py-2 px-4 shadow-xs flex items-center gap-1.5"
                  >
                    {verifyingRequest && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    Verify & Forward
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
      {showApprovalModal && selectedProposalForApproval && (
        <ApprovePaymentSlabModal
          proposal={selectedProposalForApproval}
          projectName={selectedProposalForApproval.project_id}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedProposalForApproval(null);
          }}
          onSaveSuccess={() => {
            fetchPendingProposals();
            fetchGlobalData();
          }}
        />
      )}
    </div>
  );
};

export default CustomerManagementAccounting;
