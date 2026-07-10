import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  Layers, 
  IndianRupee, 
  Percent, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  Sparkles,
  Calculator,
  Calendar,
  Save,
  Loader2,
  Pencil,
  Plus,
  Trash2
} from "lucide-react";
import { formatStatus, getStatusColor } from "./leadUtils";
import api from "../../../../api";
import axios from "axios";

const inputClass = "app-input w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold text-(--text-body) focus:ring-(--brand-ring)";

const getArrayData = (res) => {
  if (!res || !res.data) return [];
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data.data)) return res.data.data;
  if (Array.isArray(res.data.contractors)) return res.data.contractors;
  return [];
};

const CreatePaymentSlabModal = ({
  lead,
  projectName = "Default Project",
  onClose,
  onSaveSuccess
}) => {
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState([]);
  const [totalDealValue, setTotalDealValue] = useState("");
  const [amounts, setAmounts] = useState({});
  const [percentages, setPercentages] = useState({});
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [hasProject, setHasProject] = useState(!!lead?.project_id);
  const [hasSetup, setHasSetup] = useState(false);
  const [existingPlanId, setExistingPlanId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [originalData, setOriginalData] = useState(null);

  const resetToOriginal = () => {
    if (!originalData) return;
    setValidationError("");
    setTotalDealValue(originalData.total_deal_value.toString());
    
    const initialAmounts = {};
    const initialPercentages = {};
    
    const slabMap = new Map();
    originalData.slabs.forEach(slab => {
      slabMap.set(slab.stage_id, slab);
    });

    stages.forEach(s => {
      const matchedSlab = slabMap.get(s.id);
      if (matchedSlab) {
        initialAmounts[s.id] = matchedSlab.allocated_amount.toString();
        initialPercentages[s.id] = matchedSlab.ratio_percentage.toString();
      } else {
        initialAmounts[s.id] = "";
        initialPercentages[s.id] = "";
      }
    });

    setAmounts(initialAmounts);
    setPercentages(initialPercentages);
  };


  useEffect(() => {
    let active = true;
    const checkProjectAndLoadStages = async () => {
      if (!lead?.project_id) {
        if (active) {
          setHasProject(false);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setHasProject(true);
        setHasSetup(true);


        let existingPlan = null;
        try {
          const planRes = await api.get(`/api/payments`, {
            params: { lead_id: lead.id, company_id: lead.company_id }
          });
          if (planRes.data && planRes.data.success && planRes.data.data) {
            existingPlan = planRes.data.data;
          }
        } catch (err) {

          console.log("No existing payment plan found for lead", lead.id, err);
        }

        if (active) {
          const initialAmounts = {};
          const initialPercentages = {};

          if (existingPlan) {
            setTotalDealValue(existingPlan.total_deal_value.toString());
            setOriginalData(existingPlan);
            setExistingPlanId(existingPlan.id);
            

            const planStages = existingPlan.slabs.map((matchedSlab, idx) => {
              const matchedId = matchedSlab.stage_id || `milestone_${idx}`;
              initialAmounts[matchedId] = matchedSlab.allocated_amount.toString();
              initialPercentages[matchedId] = matchedSlab.ratio_percentage.toString();
              return {
                id: matchedId,
                name: matchedSlab.stage_name,
                db_slab_id: matchedSlab.id,
                paid_amount: Number(matchedSlab.paid_amount) || 0,
                status: matchedSlab.status,
                due_date: matchedSlab.due_date
              };
            });
            setStages(planStages);
          } else {

            const defaultId = "milestone_1";
            setStages([
              {
                id: defaultId,
                name: "Project Cost",
                paid_amount: 0,
                status: "pending",
                due_date: null
              }
            ]);
            initialAmounts[defaultId] = "";
            initialPercentages[defaultId] = "";
          }

          setAmounts(initialAmounts);
          setPercentages(initialPercentages);
        }
      } catch (err) {
        console.error("Error loading payment slabs:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    checkProjectAndLoadStages();

    return () => {
      active = false;
    };
  }, [lead?.project_id, lead?.project_type, lead?.id, lead?.company_id]);


  const dealValueNum = parseFloat(totalDealValue) || 0;

  const totalAllocated = Object.values(amounts).reduce((sum, val) => {
    const num = parseFloat(val) || 0;
    return sum + num;
  }, 0);

  const totalPercentage = Object.values(percentages).reduce((sum, val) => {
    const num = parseFloat(val) || 0;
    return sum + num;
  }, 0);

  const remainingBalance = dealValueNum - totalAllocated;
  const totalPaid = stages.reduce((sum, s) => sum + (s.paid_amount || 0), 0);
  const outstandingBalance = dealValueNum - totalPaid;
  const paidPct = dealValueNum > 0 ? (totalPaid / dealValueNum) * 100 : 0;
  const isPerfectAllocation = dealValueNum > 0 && Math.abs(remainingBalance) < 1.5 && Math.abs(totalPercentage - 100) < 0.15;
  const isExceeded = remainingBalance < -0.5;

  const allocatedPercentage = dealValueNum > 0 
    ? (totalAllocated / dealValueNum) * 100 
    : 0;


  const handleDistributeEvenly = () => {
    if (dealValueNum <= 0) {
      setValidationError("Please enter a valid Total Deal Value first.");
      return;
    }
    setValidationError("");
    const newPercentages = {};
    const newAmounts = {};
    const count = stages.length;
    
    if (count > 0) {
      const equalPct = (100 / count).toFixed(2);
      const equalAmt = Math.round((dealValueNum / count) * 100) / 100;
      
      stages.forEach((stage, idx) => {
        if (idx === count - 1) {

          let sumPcts = 0;
          let sumAmts = 0;
          stages.slice(0, -1).forEach(() => {
            sumPcts += parseFloat(equalPct);
            sumAmts += equalAmt;
          });
          newPercentages[stage.id] = (100 - sumPcts).toFixed(2);
          newAmounts[stage.id] = Math.round((dealValueNum - sumAmts) * 100) / 100;
        } else {
          newPercentages[stage.id] = equalPct;
          newAmounts[stage.id] = equalAmt.toString();
        }
      });
      setPercentages(newPercentages);
      setAmounts(newAmounts);
    }
  };

  const handleAmountChange = (stageId, value) => {

    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmounts(prev => ({
        ...prev,
        [stageId]: value
      }));
      
      const amt = parseFloat(value) || 0;
      if (dealValueNum > 0) {
        const computedPct = value === "" ? "" : ((amt / dealValueNum) * 100).toFixed(2);
        setPercentages(prev => ({
          ...prev,
          [stageId]: computedPct
        }));
      } else {
        setPercentages(prev => ({
          ...prev,
          [stageId]: ""
        }));
      }
      setValidationError("");
    }
  };

  const handlePercentageChange = (stageId, value) => {

    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setPercentages(prev => ({
        ...prev,
        [stageId]: value
      }));
      
      const pct = parseFloat(value) || 0;
      if (dealValueNum > 0) {
        const computedAmt = value === "" ? "" : Math.round((dealValueNum * pct) / 100).toString();
        setAmounts(prev => ({
          ...prev,
          [stageId]: computedAmt
        }));
      } else {
        setAmounts(prev => ({
          ...prev,
          [stageId]: ""
        }));
      }
      setValidationError("");
    }
  };

  const handleTotalDealValueChange = (newVal) => {
    setTotalDealValue(newVal);
    setValidationError("");
    const newDealValueNum = parseFloat(newVal) || 0;
    
    if (newDealValueNum > 0) {
      const updatedAmts = {};
      const updatedPcts = {};
      

      if (stages.length === 1 && !percentages[stages[0].id] && !amounts[stages[0].id]) {
        updatedAmts[stages[0].id] = newVal;
        updatedPcts[stages[0].id] = "100";
        setPercentages(updatedPcts);
        setAmounts(updatedAmts);
      } else {
        stages.forEach(stage => {
          const pctVal = percentages[stage.id] || "";
          if (pctVal !== "") {
            const pct = parseFloat(pctVal) || 0;
            updatedAmts[stage.id] = Math.round((newDealValueNum * pct) / 100).toString();
          } else {
            updatedAmts[stage.id] = "";
          }
        });
        setAmounts(updatedAmts);
      }
    } else {
      const cleared = {};
      stages.forEach(s => {
        cleared[s.id] = "";
      });
      setAmounts(cleared);
    }
  };

  const handleAddMilestone = () => {
    const newId = `milestone_${Date.now()}`;
    setStages(prev => [
      ...prev,
      {
        id: newId,
        name: `Milestone ${prev.length + 1}`,
        paid_amount: 0,
        status: "pending",
        due_date: null
      }
    ]);
    setAmounts(prev => ({ ...prev, [newId]: "" }));
    setPercentages(prev => ({ ...prev, [newId]: "" }));
  };

  const handleDeleteMilestone = (stageId) => {
    const targetStage = stages.find(s => s.id === stageId);
    if (targetStage && (targetStage.paid_amount > 0 || targetStage.status === "paid" || targetStage.status === "partial")) {
      setValidationError("Cannot delete a milestone that has payments recorded.");
      return;
    }
    setStages(prev => prev.filter(s => s.id !== stageId));
    setAmounts(prev => {
      const copy = { ...prev };
      delete copy[stageId];
      return copy;
    });
    setPercentages(prev => {
      const copy = { ...prev };
      delete copy[stageId];
      return copy;
    });
  };

  const handleRenameMilestone = (stageId, newName) => {
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, name: newName } : s));
  };

  const handleDueDateChange = (stageId, dateVal) => {
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, due_date: dateVal || null } : s));
  };

  const handleClearAll = () => {
    const cleared = {};
    stages.forEach(s => {
      cleared[s.id] = "";
    });
    setAmounts(cleared);
    setPercentages(cleared);
    setValidationError("");
  };

  const handleSave = async () => {
    if (dealValueNum <= 0) {
      setValidationError("Please specify a valid Total Deal Value.");
      return;
    }

    if (Math.abs(remainingBalance) > 10 || Math.abs(totalPercentage - 100) > 0.5) {
      setValidationError(`Allocation mismatch. Remaining balance must be ₹0 (currently ₹${remainingBalance.toLocaleString()}) and percentage must sum to 100% (currently ${totalPercentage.toFixed(1)}%).`);
      return;
    }

    try {
      setSaving(true);
      setValidationError("");
      
      const payload = {
        company_id: lead.company_id,
        total_deal_value: dealValueNum,
        slabs: stages.map(stage => {
          const slabData = {
            stage_id: stage.id,
            stage_name: stage.name,
            ratio_percentage: parseFloat(percentages[stage.id]) || 0,
            allocated_amount: parseFloat(amounts[stage.id]) || 0
          };
          if (stage.db_slab_id) {
            slabData.id = stage.db_slab_id;
          }
          return slabData;
        })
      };

      let response;
      if (existingPlanId) {
        response = await api.put(`/api/payments/${existingPlanId}`, payload);
      } else {
        response = await api.post(`/api/payments`, {
          ...payload,
          lead_id: lead.id,
          project_id: lead.project_id
        });
      }

      const result = response.data?.data;
      alert("Payment slab distribution saved successfully!");
      if (onSaveSuccess) {
        onSaveSuccess(result);
      }
      onClose();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to save payment slab.";
      setValidationError(errMsg);
    } finally {
      setSaving(false);
    }
  };


  const formatINR = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val || 0);
  };


  const getProgressBarColor = () => {
    if (dealValueNum === 0) return "bg-slate-200";
    if (isPerfectAllocation) return "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse";
    if (isExceeded) return "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]";
    return "bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.2)]";
  };

  const modalContent = (
    <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999 backdrop-blur-xs">
      <div className="app-modal w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        

        <div className="px-5 py-4 border-b border-(--border-soft) flex justify-between items-start bg-white">
          <div className="flex items-start gap-3 min-w-0">
            <div className="size-11 rounded-2xl flex items-center justify-center bg-sky-50 border border-sky-100 shrink-0">
              <Layers className="size-5 text-sky-600" />
            </div>
            <div className="min-w-0">
              <h3 className="modal-title">
                {isEditMode ? (existingPlanId ? "Edit Payment Slab" : "Create Payment Slab") : "View Payment Slabs"}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-[12px] font-bold text-(--text-soft)">
                  Lead: {lead.name}
                </span>
                <span className="text-slate-300">&middot;</span>
                <span className="text-[12px] font-medium text-(--text-faint) truncate max-w-48">
                  Project: {projectName}
                </span>
                <span className="text-slate-300">&middot;</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${getStatusColor(lead.status)}`}>
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
              <Loader2 className="size-10 text-sky-600 animate-spin mx-auto mb-4" />
              <p className="text-[13.5px] font-semibold text-(--text-soft)">Checking project configuration...</p>
            </div>
          ) : !hasProject ? (
            <div className="p-16 text-center max-w-md mx-auto space-y-4">
              <div className="size-14 rounded-2xl flex items-center justify-center bg-amber-50 border border-amber-100 mx-auto">
                <AlertCircle className="size-7 text-amber-500" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-[15px] font-extrabold text-(--text-strong)">No Project Selected</h4>
                <p className="text-[12.5px] text-(--text-soft)">
                  No project selected. Create a project first.
                </p>
              </div>
            </div>
          ) : !hasSetup ? (
            <div className="p-16 text-center max-w-md mx-auto space-y-4">
              <div className="size-14 rounded-2xl flex items-center justify-center bg-amber-50 border border-amber-100 mx-auto">
                <AlertCircle className="size-7 text-amber-500" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-[15px] font-extrabold text-(--text-strong)">No Project Setup Found</h4>
                <p className="text-[12.5px] text-(--text-soft)">
                  No project setup found. Create a project setup first.
                </p>
              </div>
            </div>
          ) : (
            isEditMode ? (
              <>

                <div className="app-panel p-4 bg-white grid grid-cols-1 md:grid-cols-3 gap-4 border border-(--border-soft) relative overflow-hidden">
                  <div className="md:col-span-1">
                    <label className="modal-label mb-2 block font-extrabold text-[12px] text-(--text-soft)">
                      Total Deal Value *
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-(--text-faint)" />
                      <input
                        type="text"
                        placeholder="e.g. 5000000"
                        disabled={!isEditMode}
                        value={totalDealValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^\d*$/.test(val)) {
                            handleTotalDealValueChange(val);
                          }
                        }}
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                    <span className="text-[10px] text-(--text-faint) mt-1 block">
                      Enter overall locked contract value
                    </span>
                  </div>

                  <div className="md:col-span-2 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-(--text-faint) uppercase tracking-wider block">Allocation Ledger</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-xl font-extrabold text-(--text-strong)">
                            {formatINR(totalAllocated)}
                          </span>
                          <span className="text-xs text-(--text-soft)">
                            of {dealValueNum > 0 ? formatINR(dealValueNum) : "₹0"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-bold text-(--text-faint) uppercase tracking-wider block">Remaining Balance</span>
                        <span className={`text-[15px] font-extrabold block mt-1 ${isPerfectAllocation ? "text-emerald-600" : isExceeded ? "text-red-500" : "text-amber-500"}`}>
                          {formatINR(remainingBalance)}
                        </span>
                      </div>
                    </div>


                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-(--text-soft)">
                        <span className="flex items-center gap-1">
                          Progress: <span className="text-(--text-strong)">{allocatedPercentage.toFixed(1)}%</span>
                        </span>
                        {isPerfectAllocation ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle className="size-3.5" /> 100% Balanced
                          </span>
                        ) : (
                          <span>{isExceeded ? "Limit Exceeded" : "Pending split"}</span>
                        )}
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/40">
                        <div 
                          className={`h-full rounded-full transition-all ${getProgressBarColor()}`} 
                          style={{ width: `${Math.min(allocatedPercentage, 100)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {dealValueNum > 0 && isEditMode && (
                  <div className="flex flex-wrap items-center justify-end gap-3 px-1 py-1">
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="px-3 py-1.5 text-[11.5px] font-bold text-red-600 hover:bg-red-50 rounded-xl border border-red-100 transition-all cursor-pointer bg-white"
                    >
                      Clear Splits
                    </button>
                    <button
                      type="button"
                      onClick={handleDistributeEvenly}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11.5px] font-bold text-white bg-(--brand) hover:bg-(--brand-strong) rounded-xl border border-(--brand-strong) transition-all active:scale-[0.97] cursor-pointer shadow-xs"
                    >
                      <Calculator className="size-3.5" />
                      Distribute Evenly
                    </button>
                  </div>
                )}


                {validationError && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-start gap-2.5 shake">
                    <AlertCircle className="size-4.5 text-red-500 mt-0.5 shrink-0" />
                    <div className="text-[12.5px] font-medium text-red-800">
                      {validationError}
                    </div>
                  </div>
                )}


                <div className="app-panel overflow-hidden border border-(--border-soft) bg-white">
                  <div className="app-section-bar px-4 py-2.5 flex items-center justify-between border-b border-(--border-soft)">
                    <h4 className="app-heading flex items-center gap-1.5 text-slate-700">
                      <Layers className="size-3.5 text-slate-500" />
                      <span>Milestone Split Configuration</span>
                    </h4>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={handleAddMilestone}
                        className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-all cursor-pointer shadow-2xs"
                      >
                        <Plus className="size-3.5" />
                        Add Milestone
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div className="p-12 text-center">
                      <Loader2 className="size-8 text-(--brand) animate-spin mx-auto mb-3" />
                      <p className="text-[13px] font-semibold text-(--text-soft)">Fetching payment plan details...</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-(--bg-subtle)">
                      {stages.map((stage, idx) => {
                        const amtVal = amounts[stage.id] || "";
                        const amtNum = parseFloat(amtVal) || 0;
                        const isNonZero = amtNum > 0;
                        const isPaid = stage.status === "paid";
                        const isPartial = stage.status === "partial";

                        return (
                          <div 
                            key={stage.id} 
                            className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-(--bg-subtle)/30 ${ isNonZero ? "bg-(--bg-subtle)/10" : "" }`}
                          >
                            <div className="flex-1 min-w-0 flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-400 shrink-0">
                                #{idx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <input
                                  type="text"
                                  placeholder="Milestone Name"
                                  value={stage.name}
                                  disabled={isPaid || isPartial || !isEditMode}
                                  onChange={(e) => handleRenameMilestone(stage.id, e.target.value)}
                                  className="w-full font-bold text-(--text-strong) bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-0 text-[13.5px] py-0.5 transition-all"
                                  required
                                />
                                <div className="flex items-center gap-2 mt-1.5">
                                  {(() => {
                                    const slabStatus = stage.status || "pending";
                                    let statusLabel = "Unpaid";
                                    let badgeStyle = "text-slate-500 bg-slate-50 border-slate-200/60";

                                    if (slabStatus === "paid") {
                                      statusLabel = `Fully Paid: ${formatINR(stage.paid_amount)}`;
                                      badgeStyle = "text-emerald-700 bg-emerald-50 border-emerald-200";
                                    } else if (slabStatus === "partial") {
                                      statusLabel = `Partially Paid: ${formatINR(stage.paid_amount)}`;
                                      badgeStyle = "text-amber-700 bg-amber-50 border-amber-200";
                                    }

                                    return (
                                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeStyle}`}>
                                        {statusLabel}
                                      </span>
                                    );
                                  })()}
                                  

                                  <div className="flex items-center gap-1 text-[11px] font-semibold text-(--text-soft)">
                                    <span className="text-slate-400">Due:</span>
                                    <input
                                      type="date"
                                      disabled={isPaid || !isEditMode}
                                      value={stage.due_date ? stage.due_date.split("T")[0] : ""}
                                      onChange={(e) => handleDueDateChange(stage.id, e.target.value)}
                                      className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none text-[11px] font-semibold py-0 text-slate-700 cursor-pointer"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>


                            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                              

                              <div className="w-24 relative">
                                <input
                                  type="text"
                                  placeholder="0.00"
                                  disabled={dealValueNum <= 0 || isPaid || !isEditMode}
                                  value={percentages[stage.id] || ""}
                                  onChange={(e) => handlePercentageChange(stage.id, e.target.value)}
                                  className="app-input w-full pr-7 pl-3 py-1.5 text-xs text-right font-bold text-emerald-800 rounded-xl disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed border border-slate-200"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">%</span>
                              </div>


                              <div className="w-36 relative">
                                <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-(--text-faint)" />
                                <input
                                  type="text"
                                  placeholder="0.00"
                                  disabled={dealValueNum <= 0 || isPaid || !isEditMode}
                                  value={amtVal}
                                  onChange={(e) => handleAmountChange(stage.id, e.target.value)}
                                  className="app-input w-full pl-7 pr-3 py-1.5 text-xs text-right font-bold text-slate-800 rounded-xl disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed border border-slate-200"
                                />
                              </div>


                              {isEditMode && stages.length > 1 && !isPaid && !isPartial && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMilestone(stage.id)}
                                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                                  title="Delete Milestone"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div className="bg-white p-4 rounded-2xl border border-(--border-soft) shadow-2xs">
                    <span className="text-[11px] font-bold text-(--text-faint) uppercase tracking-wider block">Total Contract Value</span>
                    <span className="text-2xl font-extrabold text-(--text-strong) block mt-1">
                      {formatINR(dealValueNum)}
                    </span>
                  </div>


                  <div className="bg-white p-4 rounded-2xl border border-(--border-soft) shadow-2xs">
                    <span className="text-[11px] font-bold text-(--text-faint) uppercase tracking-wider block">Total Paid</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-2xl font-extrabold text-emerald-600">
                        {formatINR(totalPaid)}
                      </span>
                      <span className="text-[11.5px] font-bold text-(--text-soft)">
                        ({paidPct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>


                  <div className="bg-white p-4 rounded-2xl border border-(--border-soft) shadow-2xs">
                    <span className="text-[11px] font-bold text-(--text-faint) uppercase tracking-wider block">Outstanding Balance</span>
                    <span className="text-2xl font-extrabold text-amber-600 block mt-1">
                      {formatINR(outstandingBalance)}
                    </span>
                  </div>
                </div>


                {dealValueNum > 0 && (
                  <div className="bg-white p-4 rounded-2xl border border-(--border-soft) shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-[12px] font-bold text-(--text-soft)">
                      <span>Payment Progress</span>
                      <span className="text-emerald-600">{paidPct.toFixed(1)}% Collected</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/40">
                      <div 
                        className="h-full rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all duration-500" 
                        style={{ width: `${Math.min(paidPct, 100)}%` }} 
                      />
                    </div>
                  </div>
                )}


                <div className="app-panel overflow-hidden border border-(--border-soft) bg-white">
                  <div className="app-section-bar px-4 py-2.5 flex items-center justify-between border-b border-(--border-soft)">
                    <h4 className="app-heading flex items-center gap-1.5">
                      <Layers className="size-3.5 text-(--brand)" />
                      <span>Milestone Allocation & Payments</span>
                    </h4>
                    <span className="text-[11px] font-bold text-(--text-faint) uppercase">
                      {stages.length} Milestones
                    </span>
                  </div>

                  <div className="divide-y divide-(--bg-subtle)">
                    {stages.map((stage, idx) => {
                      const amtVal = amounts[stage.id] || "";
                      const amtNum = parseFloat(amtVal) || 0;
                      const pctVal = percentages[stage.id] || "0";
                      const slabStatus = stage.status || "pending";
                      
                      let statusLabel = "Pending";
                      let badgeStyle = "text-slate-500 bg-slate-50 border-slate-200/60";

                      if (slabStatus === "paid") {
                        statusLabel = "Fully Paid";
                        badgeStyle = "text-emerald-700 bg-emerald-50 border-emerald-200";
                      } else if (slabStatus === "partial") {
                        statusLabel = "Partially Paid";
                        badgeStyle = "text-amber-700 bg-amber-50 border-amber-200";
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
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeStyle}`}>
                                {statusLabel}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-6 shrink-0 text-right sm:text-right">
                            <div>
                              <span className="text-[10px] font-bold text-(--text-faint) uppercase block tracking-wider">Milestone Value</span>
                              <span className="text-[13px] font-bold text-(--text-strong)">
                                {formatINR(amtNum)} <span className="text-slate-400 font-semibold text-[11px]">({parseFloat(pctVal).toFixed(1)}%)</span>
                              </span>
                            </div>
                            
                            <div>
                              <span className="text-[10px] font-bold text-(--text-faint) uppercase block tracking-wider">Paid Amount</span>
                              <span className={`text-[13px] font-bold ${Number(stage.paid_amount) > 0 ? "text-emerald-600" : "text-(--text-faint)"}`}>
                                {formatINR(stage.paid_amount)}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-(--text-faint) uppercase block tracking-wider">Balance</span>
                              <span className={`text-[13px] font-bold ${amtNum - (stage.paid_amount || 0) > 0 ? "text-slate-700" : "text-slate-400"}`}>
                                {formatINR(amtNum - (stage.paid_amount || 0))}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )
          )}
        </div>


        <div className="px-5 py-3 border-t border-(--border-soft) flex justify-between items-center bg-white">
          <div className="text-[12px] font-bold text-(--text-soft) flex items-center gap-1.5" />
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="app-btn-secondary text-[13px] active:scale-[0.98] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading || dealValueNum === 0 || !isPerfectAllocation || !hasProject}
              className="app-btn-primary text-[13px] active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer shadow-xs"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Payment Slab
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreatePaymentSlabModal;
