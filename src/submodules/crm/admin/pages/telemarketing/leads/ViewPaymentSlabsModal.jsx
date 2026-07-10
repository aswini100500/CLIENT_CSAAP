import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Layers,
  IndianRupee,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Pencil,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Sparkles,
} from "lucide-react";
import {
  formatStatus,
  getStatusColor,
  normalizeUnits,
  isFinishedUnit,
} from "./leadUtils";
import operationApi from "../../../../../../api/operation";
import api from "../../../../api";
import accountingApi from "../../../../accountingApi";
import axios from "axios";
import useAuth from "../../../../../../hooks/useAuth";

const getArrayData = (res) => {
  if (!res || !res.data) return [];
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data.data)) return res.data.data;
  if (Array.isArray(res.data.contractors)) return res.data.contractors;
  return [];
};

const ViewPaymentSlabsModal = ({
  lead,
  projectName = "Default Project",
  onClose,
  onEdit,
}) => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState([]);
  const [totalDealValue, setTotalDealValue] = useState(0);
  const [bookingSlab, setBookingSlab] = useState(null);
  const [hasProject, setHasProject] = useState(!!lead?.project_id);
  const [hasSetup, setHasSetup] = useState(false);
  const [error, setError] = useState("");
  const [paymentPlan, setPaymentPlan] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const loadPaymentPlan = async (isMounted = { current: true }) => {
    if (!lead?.project_id) {
      if (isMounted.current) {
        setHasProject(false);
        setLoading(false);
      }
      return;
    }

    try {
      if (isMounted.current) {
        setLoading(true);
        setHasProject(true);
      }

      let pId = lead.project_id;
      let projectType = "apartment";
      let projectId = lead.project_id;
      if (typeof pId === "string" && pId.includes(":")) {
        const parts = pId.split(":");
        projectType = parts[0];
        projectId = parts[1];
        pId = parts[1];
      }

      let units = [];
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_CSAAP_URL}/api/tenant/type/${projectType}/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const projectDetails = response.data?.data || [];
        units = normalizeUnits(projectDetails, projectType);
      } catch (err) {
        console.warn("Failed fetching project details for units:", err);
      }

      const currentUnitId = lead?.unit_id;
      const matchedUnit = currentUnitId
        ? units.find((u) => u.unit_id === currentUnitId)
        : null;
      const unitIsFinished = matchedUnit ? isFinishedUnit(matchedUnit) : false;

      if (isMounted.current) {
        setIsFinished(unitIsFinished);
      }

      let data = [];
      let stagePassings = [];
      if (unitIsFinished) {
        if (isMounted.current) setHasSetup(true);

        data = [
          {
            id: "balance_payment",
            name: "Balance / Possession Payment",
            description: "Remaining balance on possession",
            status: "planned",
          },
        ];
      } else {
        const setupsRes = await operationApi.getProjectSetups();
        const setups = getArrayData(setupsRes);
        const matchedSetup = setups.find(
          (s) =>
            String(s.project_id) === String(pId) &&
            String(s.project_type).toLowerCase() ===
              String(projectType).toLowerCase(),
        );

        if (!matchedSetup) {
          if (isMounted.current) {
            setHasSetup(false);
            setLoading(false);
          }
          return;
        }

        if (isMounted.current) {
          setHasSetup(true);
        }

        data = await fetchProjectStages(
          lead.project_id,
          lead.project_type || "apartment",
          token,
        );

        try {
          const passingsRes = await operationApi.getStagePassings();
          const passings = getArrayData(passingsRes);
          stagePassings = passings.filter(
            (p) => Number(p.project_setup_id) === Number(matchedSetup.id),
          );
        } catch (err) {
          console.warn("Failed fetching stage passings:", err);
        }
      }

      let existingPlan = null;
      try {
        const planRes = await accountingApi.get(`/api/v1/project-payment`, {
          params: {
            lead_id: lead.id,
            company_id: user?.company_id || lead?.company_id,
          },
        });
        if (planRes.data && planRes.data.success && planRes.data.data) {
          existingPlan = planRes.data.data;
        }
      } catch (err) {}

      if (isMounted.current) {
        if (existingPlan) {
          setPaymentPlan(existingPlan);
          setTotalDealValue(existingPlan.total_deal_value);

          const slabMap = new Map();
          existingPlan.slabs.forEach((slab) => {
            slabMap.set(slab.stage_id, slab);
          });

          const matchedBooking = slabMap.get("booking_amount");
          if (matchedBooking) {
            setBookingSlab({
              id: "booking_amount",
              name: "Booking Amount",
              db_slab_id: matchedBooking.id,
              allocated_amount: Number(matchedBooking.allocated_amount) || 0,
              ratio_percentage: Number(matchedBooking.ratio_percentage) || 0,
              paid_amount: Number(matchedBooking.paid_amount) || 0,
              status: matchedBooking.status,
              due_date: matchedBooking.due_date,
            });
          } else {
            setBookingSlab(null);
          }

          const mergedStages = data.map((s, idx) => {
            const matchedSlab = slabMap.get(s.id);

            const matchedPassing = stagePassings.find(
              (p) =>
                String(p.stage_name || "")
                  .toLowerCase()
                  .trim() ===
                String(s.name || "")
                  .toLowerCase()
                  .trim(),
            );
            const constructionStatus = matchedPassing
              ? matchedPassing.status || "planned"
              : s.status || "planned";

            if (matchedSlab) {
              return {
                ...s,
                construction_status: constructionStatus,
                db_slab_id: matchedSlab.id,
                allocated_amount: Number(matchedSlab.allocated_amount) || 0,
                ratio_percentage: Number(matchedSlab.ratio_percentage) || 0,
                paid_amount: Number(matchedSlab.paid_amount) || 0,
                status: matchedSlab.status,
                due_date: matchedSlab.due_date,
              };
            }
            return {
              ...s,
              construction_status: constructionStatus,
              allocated_amount: 0,
              ratio_percentage: 0,
              paid_amount: 0,
              status: "pending",
            };
          });

          if (!unitIsFinished && mergedStages.length > 0) {
            const isCompleted = (s) => {
              const cs = (s.construction_status || "").toLowerCase().trim();
              return cs === "completed" || cs === "done";
            };

            const isOngoing = (s) => {
              const cs = (s.construction_status || "").toLowerCase().trim();
              return (
                cs === "ongoing" || cs === "in_progress" || cs === "in progress"
              );
            };

            const isPaidOrPartial = (s) => {
              return s.status === "paid" || s.status === "partial";
            };

            const firstNonCompletedIdx = mergedStages.findIndex(
              (s) => !isCompleted(s),
            );

            mergedStages.forEach((s, i) => {
              const comp = isCompleted(s);
              const ong = isOngoing(s);
              const paid = isPaidOrPartial(s);

              if (paid) {
                s.isDue = false;
              } else if (comp) {
                s.isDue = true;
              } else if (ong) {
                s.isDue = true;
              } else if (i === firstNonCompletedIdx && !ong) {
                s.isDue = true;
              } else {
                s.isDue = false;
              }
            });
          }

          setStages(mergedStages);
          setError("");
        } else {
          setPaymentPlan(null);
          setBookingSlab(null);
          setError("No active payment slab found for this lead.");
          if (onEdit) {
            onEdit();
          }
        }
      }
    } catch (err) {
      console.error("Error loading payment slabs:", err);
      if (isMounted.current) {
        setError("Failed to load payment slab details.");
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    const isMounted = { current: true };
    loadPaymentPlan(isMounted);

    return () => {
      isMounted.current = false;
    };
  }, [
    lead?.project_id,
    lead?.project_type,
    lead?.id,
    lead?.company_id,
    user?.company_id,
  ]);

  const formatINR = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const totalPaid =
    stages.reduce((sum, s) => sum + (s.paid_amount || 0), 0) +
    (bookingSlab ? bookingSlab.paid_amount : 0);
  const outstandingBalance = totalDealValue - totalPaid;
  const paidPct = totalDealValue > 0 ? (totalPaid / totalDealValue) * 100 : 0;

  const modalContent = (
    <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999 backdrop-blur-xs">
      <div className="app-modal w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-(--border-soft) flex justify-between items-start bg-white">
          <div className="flex items-start gap-3 min-w-0">
            <div className="size-11 rounded-2xl flex items-center justify-center bg-emerald-50 border border-emerald-100 shrink-0">
              <Layers className="size-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <h3 className="modal-title">View Payment Slabs</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-[12px] font-bold text-(--text-soft)">
                  Lead: {lead.name}
                </span>
                <span className="text-slate-300">&middot;</span>
                <span className="text-[12px] font-medium text-(--text-faint) truncate max-w-48">
                  Project: {projectName}
                </span>
                <span className="text-slate-300">&middot;</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${getStatusColor(lead.status)}`}
                >
                  {formatStatus(lead.status)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="app-icon-button mt-0.5 p-2 text-(--text-faint) hover:text-(--text-body) hover:bg-(--bg-subtle) active:scale-95"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5 bg-[#fcfdfd]">
          {loading ? (
            <div className="p-16 text-center">
              <Loader2 className="size-10 text-emerald-600 animate-spin mx-auto mb-4" />
              <p className="text-[13.5px] font-semibold text-(--text-soft)">
                Loading payment plans...
              </p>
            </div>
          ) : !hasProject ? (
            <div className="p-16 text-center max-w-md mx-auto space-y-4">
              <div className="size-14 rounded-2xl flex items-center justify-center bg-amber-50 border border-amber-100 mx-auto">
                <AlertCircle className="size-7 text-amber-500" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-[15px] font-extrabold text-(--text-strong)">
                  No Project Selected
                </h4>
                <p className="text-[12.5px] text-(--text-soft)">
                  No project assigned to this lead. Please select a project
                  first.
                </p>
              </div>
            </div>
          ) : !hasSetup ? (
            <div className="p-16 text-center max-w-md mx-auto space-y-4">
              <div className="size-14 rounded-2xl flex items-center justify-center bg-amber-50 border border-amber-100 mx-auto">
                <AlertCircle className="size-7 text-amber-500" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-[15px] font-extrabold text-(--text-strong)">
                  No Project Setup Found
                </h4>
                <p className="text-[12.5px] text-(--text-soft)">
                  No project setup has been defined for this project. Setup a
                  template first.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-16 text-center max-w-md mx-auto space-y-4">
              <div className="size-14 rounded-2xl flex items-center justify-center bg-red-50 border border-red-100 mx-auto">
                <AlertCircle className="size-7 text-red-500" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-[15px] font-extrabold text-(--text-strong)">
                  Plan Not Found
                </h4>
                <p className="text-[12.5px] text-(--text-soft)">{error}</p>
              </div>
            </div>
          ) : (
            <>
              {paymentPlan?.status === "cancelled" && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle className="size-5 text-red-600 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h4 className="text-[13px] font-bold text-red-800">
                      Booking Cancelled & Settled
                    </h4>
                    <p className="text-[12px] text-red-650 mt-0.5">
                      This customer's booking has been officially cancelled. All
                      payment collections are terminated and the unit is
                      released.
                    </p>
                  </div>
                </div>
              )}

              {paymentPlan?.status === "pending_cancellation" && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h4 className="text-[13px] font-bold text-amber-800">
                      Cancellation Request Pending
                    </h4>
                    <p className="text-[12px] text-amber-650 mt-0.5">
                      A request to cancel this booking has been initiated and is
                      currently in the verification queue.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-(--border-soft) shadow-2xs flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Receipt className="size-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-(--text-faint) uppercase tracking-wider block">
                      Contract Value
                    </span>
                    <span className="text-xl font-extrabold text-(--text-strong) block mt-0.5">
                      {formatINR(totalDealValue)}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-(--border-soft) shadow-2xs flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-(--text-faint) uppercase tracking-wider block">
                      Total Collected
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-extrabold text-emerald-600">
                        {formatINR(totalPaid)}
                      </span>
                      <span className="text-[11.5px] font-bold text-emerald-500">
                        ({paidPct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-(--border-soft) shadow-2xs flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                    <TrendingUp className="size-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-(--text-faint) uppercase tracking-wider block">
                      Outstanding Balance
                    </span>
                    <span className="text-xl font-extrabold text-amber-600 block mt-0.5">
                      {formatINR(outstandingBalance)}
                    </span>
                  </div>
                </div>
              </div>

              {totalDealValue > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-(--border-soft) shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-[12px] font-bold text-(--text-soft)">
                    <span>Collection Progress</span>
                    <span className="text-emerald-600 font-extrabold">
                      {paidPct.toFixed(1)}% Collected
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/40">
                    <div
                      className="h-full rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all duration-500"
                      style={{ width: `${Math.min(paidPct, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {bookingSlab && (
                <div className="app-panel p-4 bg-sky-50/40 border border-sky-100/70 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-xl bg-sky-100/70 flex items-center justify-center text-sky-600 shrink-0">
                      <Sparkles className="size-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[13.5px] font-bold text-sky-900">
                        {bookingSlab.name}
                      </h4>
                      <p className="text-[11px] text-sky-700/70 font-semibold mt-0.5">
                        Initial advance confirmation payment
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 shrink-0 text-right sm:text-right">
                    <div>
                      <span className="text-[10px] font-bold text-(--text-faint) uppercase block tracking-wider">
                        Booking Value
                      </span>
                      <span className="text-[13px] font-bold text-(--text-strong)">
                        {formatINR(bookingSlab.allocated_amount)}{" "}
                        <span className="text-slate-400 font-semibold text-[11px]">
                          ({bookingSlab.ratio_percentage.toFixed(1)}%)
                        </span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-(--text-faint) uppercase block tracking-wider">
                        Paid Amount
                      </span>
                      <span
                        className={`text-[13px] font-bold ${bookingSlab.paid_amount > 0 ? "text-emerald-600" : "text-(--text-faint)"}`}
                      >
                        {formatINR(bookingSlab.paid_amount)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-(--text-faint) uppercase block tracking-wider">
                        Remaining
                      </span>
                      <span
                        className={`text-[13px] font-bold ${bookingSlab.allocated_amount - bookingSlab.paid_amount > 0 ? "text-slate-700" : "text-slate-400"}`}
                      >
                        {formatINR(
                          bookingSlab.allocated_amount -
                            bookingSlab.paid_amount,
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-(--text-faint) uppercase block tracking-wider">
                        Status
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          bookingSlab.status === "paid"
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                            : bookingSlab.status === "partial"
                              ? "text-amber-700 bg-amber-50 border-amber-200"
                              : "text-slate-500 bg-slate-50 border-slate-200/60"
                        } inline-block mt-0.5`}
                      >
                        {bookingSlab.status === "paid"
                          ? "Fully Paid"
                          : bookingSlab.status === "partial"
                            ? "Partially Paid"
                            : "Unpaid"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="app-panel overflow-hidden border border-(--border-soft) bg-white">
                <div className="app-section-bar px-4 py-2.5 flex items-center justify-between border-b border-(--border-soft)">
                  <h4 className="app-heading flex items-center gap-1.5 text-slate-700">
                    <Layers className="size-3.5 text-slate-500" />
                    <span>Milestone Splits & Collection Status</span>
                  </h4>
                  <span className="text-[11px] font-bold text-(--text-faint) uppercase">
                    {stages.length} Milestones
                  </span>
                </div>

                <div className="divide-y divide-(--bg-subtle)">
                  {stages.map((stage, idx) => {
                    const amtNum = stage.allocated_amount || 0;
                    const pctVal = stage.ratio_percentage || 0;
                    const slabStatus = stage.status || "pending";
                    let statusLabel = "Unpaid";
                    let badgeStyle =
                      "text-slate-500 bg-slate-50 border-slate-200/60";

                    if (slabStatus === "paid") {
                      statusLabel = "Fully Paid";
                      badgeStyle =
                        "text-emerald-700 bg-emerald-50 border-emerald-200";
                    } else if (slabStatus === "partial") {
                      statusLabel = "Partially Paid";
                      badgeStyle =
                        "text-amber-700 bg-amber-50 border-amber-200";
                    } else if (stage.isDue) {
                      statusLabel = "Payment Due";
                      badgeStyle = "text-rose-700 bg-rose-50 border-rose-200";
                    }

                    return (
                      <div
                        key={stage.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-(--bg-subtle)/30"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-slate-400">
                              #{idx + 1}
                            </span>
                            <span className="text-[14px] font-bold text-(--text-strong)">
                              {stage.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 shrink-0 text-right sm:text-right">
                          <div>
                            <span className="text-[10px] font-bold text-(--text-faint) uppercase block tracking-wider">
                              Milestone Value
                            </span>
                            <span className="text-[13px] font-bold text-(--text-strong)">
                              {formatINR(amtNum)}{" "}
                              <span className="text-slate-400 font-semibold text-[11px]">
                                ({pctVal.toFixed(1)}%)
                              </span>
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-(--text-faint) uppercase block tracking-wider">
                              Paid Amount
                            </span>
                            <span
                              className={`text-[13px] font-bold ${stage.paid_amount > 0 ? "text-emerald-600" : "text-(--text-faint)"}`}
                            >
                              {formatINR(stage.paid_amount)}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-(--text-faint) uppercase block tracking-wider">
                              Remaining
                            </span>
                            <span
                              className={`text-[13px] font-bold ${amtNum - stage.paid_amount > 0 ? "text-slate-700" : "text-slate-400"}`}
                            >
                              {formatINR(amtNum - stage.paid_amount)}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-(--text-faint) uppercase block tracking-wider">
                              Status
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeStyle} inline-block mt-0.5`}
                            >
                              {statusLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-3 border-t border-(--border-soft) flex justify-between items-center bg-white">
          <div className="text-[12px] font-bold text-(--text-soft) flex items-center gap-1.5"></div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="app-btn-secondary text-[13px] active:scale-[0.98] cursor-pointer"
            >
              Close
            </button>
            {!loading &&
              hasProject &&
              hasSetup &&
              (!error ||
                error === "No active payment slab found for this lead.") &&
              paymentPlan?.status !== "cancelled" &&
              paymentPlan?.status !== "pending_cancellation" && (
                <button
                  onClick={onEdit}
                  className="app-btn-primary text-[13px] active:scale-[0.98] flex items-center gap-1.5 cursor-pointer bg-amber-500 hover:bg-amber-600 border-amber-600 shadow-xs"
                >
                  <Pencil className="size-4" />
                  <span>{error ? "Create Slabs" : "Edit Slabs"}</span>
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const mockProjectSetupResponse = {
  2: {
    success: true,
    message: "Project setup retrieved successfully.",
    data: {
      id: 1,
      project_id: 2,
      project_type: "apartment",
      contractor_id: 1,
      start_date: "2026-06-01T00:00:00.000Z",
      end_date: "2026-06-13T00:00:00.000Z",
      stages: JSON.stringify([
        {
          id: 1,
          name: "Stage 1",
          description: "Excavation & Shoring",
          start: "2026-06-01",
          end: "2026-06-02",
          status: "planned",
          sub_stages: [],
        },
        {
          id: 2,
          name: "Stage 2",
          description: "Plinth Foundation",
          start: "",
          end: "",
          status: "planned",
          sub_stages: [],
        },
        {
          id: 3,
          name: "Stage 3",
          description: "RCC Slab Castings",
          start: "",
          end: "",
          status: "planned",
          sub_stages: [],
        },
        {
          id: 4,
          name: "Stage 4",
          description: "Brickwork & Finishing",
          start: "",
          end: "",
          status: "planned",
          sub_stages: [],
        },
      ]),
      units_data: "[]",
      status: "draft",
      created_at: "2026-06-01T06:39:36.000Z",
      updated_at: "2026-06-01T06:55:59.000Z",
    },
  },
  default: {
    success: true,
    message: "Project setup retrieved successfully.",
    data: {
      id: 99,
      project_id: 0,
      project_type: "apartment",
      contractor_id: 1,
      start_date: "2026-06-01T00:00:00.000Z",
      end_date: "2026-06-13T00:00:00.000Z",
      stages: JSON.stringify([
        {
          id: 1,
          name: "Booking / Token Confirmation",
          description: "Token Advance confirmation",
          start: "2026-06-01",
          end: "2026-06-02",
          status: "planned",
        },
        {
          id: 2,
          name: "Agreement Execution",
          description: "Legal contract registry",
          start: "",
          end: "",
          status: "planned",
        },
        {
          id: 3,
          name: "Foundation Plinth Complete",
          description: "Excavation and foundation work",
          start: "",
          end: "",
          status: "planned",
        },
        {
          id: 4,
          name: "RCC Superstructure Casting",
          description: "RCC framing slabs",
          start: "",
          end: "",
          status: "planned",
        },
        {
          id: 5,
          name: "Brickwork & Plastering Work",
          description: "Internal and external blockworks",
          start: "",
          end: "",
          status: "planned",
        },
        {
          id: 6,
          name: "Final Handover & Key Registry",
          description: "Key hovers to customers",
          start: "",
          end: "",
          status: "planned",
        },
      ]),
      units_data: "[]",
      status: "draft",
      created_at: "2026-06-01T06:39:36.000Z",
      updated_at: "2026-06-01T06:55:59.000Z",
    },
  },
};

const fetchProjectStages = async (
  projectId,
  projectType = "apartment",
  token,
) => {
  let pId = projectId || 2;
  let pType = projectType || "apartment";

  if (typeof projectId === "string" && projectId.includes(":")) {
    const parts = projectId.split(":");
    pType = parts[0];
    pId = parts[1];
  }

  try {
    const response = await axios.get(
      `https://csaapnodeapi.csaap.com/api/tenant/work-diary/project-setup/project/${pId}?projectType=${pType}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.data?.success && response.data?.data) {
      const setupData = response.data.data;
      const parsedStages =
        typeof setupData.stages === "string"
          ? JSON.parse(setupData.stages)
          : setupData.stages || [];

      return parsedStages.map((stage, idx) => {
        const id =
          stage.id ||
          stage.name?.replace(/\s+/g, "_").toLowerCase() ||
          `stage_${idx}`;
        return {
          id,
          name: stage.name || `Stage ${idx + 1}`,
          description: stage.description || "",
          start: stage.start || "",
          end: stage.end || "",
          status: stage.status || "planned",
        };
      });
    }
  } catch (err) {
    console.warn(
      "Failed fetching project stages from API, resolving using structural mock setup:",
      err.message,
    );
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const key = mockProjectSetupResponse[pId] ? String(pId) : "default";
      const setupResponse = mockProjectSetupResponse[key];
      const setupData = setupResponse.data;
      const parsedStages =
        typeof setupData.stages === "string"
          ? JSON.parse(setupData.stages)
          : setupData.stages || [];

      resolve(
        parsedStages.map((stage, idx) => {
          const id =
            stage.id ||
            stage.name?.replace(/\s+/g, "_").toLowerCase() ||
            `stage_${idx}`;
          return {
            id,
            name: stage.name || `Stage ${idx + 1}`,
            description: stage.description || "",
            start: stage.start || "",
            end: stage.end || "",
            status: stage.status || "planned",
          };
        }),
      );
    }, 450);
  });
};

export default ViewPaymentSlabsModal;
