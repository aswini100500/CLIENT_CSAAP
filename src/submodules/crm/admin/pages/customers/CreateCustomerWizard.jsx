import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Building,
  Check,
  CheckCircle,
  CreditCard,
  Heart,
  IndianRupee,
  Layers,
  Loader2,
  MapPin,
  Percent,
  Search,
  Trash2,
  Upload,
  User,
  UserPlus,
  X,
  ChevronDown
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import operationApi from "../../../../../api/operation";
import useAuth from "../../../../../hooks/useAuth";
import api from "../../../api";
import {
  isFinishedUnit,
  normalizeUnits,
} from "../telemarketing/leads/leadUtils";

const inputClass =
  "app-input w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold text-(--text-body) focus:ring-(--brand-ring) border border-(--border-soft) bg-white";

const PROJECT_TYPE_LABELS = {
  apartment: "Apartment",
  commercial: "Commercial",
  plotting: "Plotting",
  duplex: "Duplex",
  triplex: "Triplex",
  custom_project: "Custom",
};

const normalizeProjectTypeKey = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  return normalized === "custom" ? "custom_project" : normalized;
};

const buildCompositeProjectId = (project) => {
  if (!project?.id || !project?.type) return "";
  return `${normalizeProjectTypeKey(project.type)}:${project.id}`;
};

const getArrayData = (res) => {
  if (!res || !res.data) return [];
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data.data)) return res.data.data;
  return [];
};

// Fetch project stages from the Work Diary API
const fetchProjectStages = async (
  projectId,
  projectType = "apartment",
  token,
) => {
  let pId = projectId;
  let pType = projectType;

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
    console.warn("Failed fetching project stages from API:", err.message);
  }

  // Fallback to a single stage if fetch fails
  return [
    {
      id: "stage_1",
      name: "Milestone Stage 1",
      description: "",
      start: "",
      end: "",
      status: "planned",
    },
  ];
};

export default function CreateCustomerWizard({ onClose, onSaveSuccess }) {
  const queryClient = useQueryClient();
  const { user, companyId, token } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Step 1: Personal & Profile Form State
  const [personalForm, setPersonalForm] = useState({
    name: "",
    phone: "",
    email: "",
    full_address: "",
    city: "",
    state: "",
    pincode: "",
    pan_number: "",
    aadhaar_number: "",
    date_of_birth: "",
    occupation: "",
    company_name: "",
    nominee_name: "",
    nominee_relation: "",
    nominee_phone: "",
    notes: "",
    broker_id: "",
    commission: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Broker states and refs
  const [brokerSearch, setBrokerSearch] = useState("");
  const [showBrokerDropdown, setShowBrokerDropdown] = useState(false);
  const brokerDropdownRef = useRef(null);
  const brokerAnchorRef = useRef(null);
  const brokerPortalDropdownRef = useRef(null);
  const [brokerDropdownStyle, setBrokerDropdownStyle] = useState(null);

  const { data: brokerOptions = [], isLoading: isLoadingBrokers } = useQuery({
    queryKey: ["broker-options", token],
    queryFn: async () => {
      const response = await axios.get("https://csaapnodeapi.csaap.com/api/tenant/broker", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data?.brokers || response.data?.data || [];
    },
    enabled: !!token,
  });

  const selectedBroker = React.useMemo(() => {
    return (
      brokerOptions.find((broker) => String(broker.id) === String(personalForm.broker_id)) ||
      null
    );
  }, [brokerOptions, personalForm.broker_id]);

  const filteredBrokers = React.useMemo(() => {
    const term = brokerSearch.trim().toLowerCase();
    const selectedDisplay = selectedBroker ? selectedBroker.name.trim().toLowerCase() : "";
    if (!term || term === selectedDisplay) return brokerOptions;
    return brokerOptions.filter((broker) =>
      (broker.name || "").toLowerCase().includes(term) ||
      (broker.phone || "").toLowerCase().includes(term)
    );
  }, [brokerOptions, brokerSearch, selectedBroker]);

  const handleBrokerInputFocus = () => {
    setBrokerSearch(selectedBroker ? selectedBroker.name : "");
    setShowBrokerDropdown(true);
  };

  const handleBrokerSelect = (broker) => {
    setPersonalForm((prev) => ({
      ...prev,
      broker_id: broker.id,
      commission: broker.commission || "",
    }));
    setBrokerSearch(broker.name);
    setShowBrokerDropdown(false);
  };

  const clearBrokerSelection = () => {
    setPersonalForm((prev) => ({
      ...prev,
      broker_id: "",
      commission: "",
    }));
    setBrokerSearch("");
    setShowBrokerDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideBrokerAnchor =
        brokerDropdownRef.current &&
        brokerDropdownRef.current.contains(event.target);
      const clickedInsideBrokerPortal =
        brokerPortalDropdownRef.current &&
        brokerPortalDropdownRef.current.contains(event.target);

      if (!clickedInsideBrokerAnchor && !clickedInsideBrokerPortal) {
        setShowBrokerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showBrokerDropdown) return undefined;

    const updateDropdownPosition = () => {
      if (!brokerAnchorRef.current) return;
      const rect = brokerAnchorRef.current.getBoundingClientRect();
      const viewportPadding = 12;
      const availableWidth = window.innerWidth - viewportPadding * 2;
      const width = Math.min(rect.width, availableWidth);
      const left = Math.min(
        Math.max(rect.left, viewportPadding),
        window.innerWidth - viewportPadding - width,
      );

      setBrokerDropdownStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left,
        width,
        maxHeight: Math.max(180, window.innerHeight - rect.bottom - 24),
        zIndex: 10050,
      });
    };

    updateDropdownPosition();
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [showBrokerDropdown]);

  // Step 2: Project & Unit Selection State
  const [projectsList, setProjectsList] = useState([]);
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [availableUnits, setAvailableUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitSearchTerm, setUnitSearchTerm] = useState("");
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  const [hasSetup, setHasSetup] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  // Step 3: Payment Slab Allocation State
  const [stages, setStages] = useState([]);
  const [totalDealValue, setTotalDealValue] = useState("");
  const [amounts, setAmounts] = useState({});
  const [percentages, setPercentages] = useState({});
  const [bookingAmount, setBookingAmount] = useState("");
  const [bookingPercentage, setBookingPercentage] = useState("");

  // Load Projects on mount
  useEffect(() => {
    let active = true;
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const [
          apartments,
          commercials,
          plottings,
          duplexes,
          triplexes,
          custom,
        ] = await Promise.all([
          operationApi.getApartments(),
          operationApi.getCommercials(),
          operationApi.getPlottings(),
          operationApi.getDuplexes(),
          operationApi.getTriplexes(),
          operationApi.getCustomProjects(),
        ]);

        if (!active) return;

        const allProjects = [
          ...getArrayData(apartments).map((p) => ({
            ...p,
            type: "Apartment",
            uid: `Apartment-${p.id}`,
          })),
          ...getArrayData(commercials).map((p) => ({
            ...p,
            type: "Commercial",
            uid: `Commercial-${p.id}`,
          })),
          ...getArrayData(plottings).map((p) => ({
            ...p,
            type: "Plotting",
            uid: `Plotting-${p.id}`,
          })),
          ...getArrayData(duplexes).map((p) => ({
            ...p,
            type: "Duplex",
            uid: `Duplex-${p.id}`,
          })),
          ...getArrayData(triplexes).map((p) => ({
            ...p,
            type: "Triplex",
            uid: `Triplex-${p.id}`,
          })),
          ...getArrayData(custom).map((p) => ({
            ...p,
            type: "Custom",
            uid: `Custom-${p.id}`,
          })),
        ];

        setProjectsList(allProjects);
      } catch (err) {
        console.error("Error fetching projects list:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProjects();
    return () => {
      active = false;
    };
  }, []);

  // Handle Project Selection
  const handleProjectSelect = async (project) => {
    setSelectedProject(project);
    setProjectSearchTerm(project.name || project.project_name || "");
    setShowProjectDropdown(false);
    setSelectedUnit(null);
    setUnitSearchTerm("");
    setValidationError("");

    // Fetch units for the selected project
    let units = [];
    const pType = normalizeProjectTypeKey(project.type);
    const pId = project.id;
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_CSAAP_URL}/api/tenant/type/${pType}/${pId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const projectDetails = response.data?.data || [];
      units = normalizeUnits(projectDetails, pType);
      setAvailableUnits(units);
    } catch (err) {
      console.warn("Failed fetching units:", err);
      setAvailableUnits([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Unit Selection and Verification Gate
  const handleUnitSelect = async (unit) => {
    setSelectedUnit(unit);
    setUnitSearchTerm(unit.unit_name || "");
    setShowUnitDropdown(false);
    setValidationError("");

    const unitIsFinished = isFinishedUnit(unit);
    setIsFinished(unitIsFinished);

    if (unitIsFinished) {
      // Finished units bypass setup check and have a single balance slab
      setHasSetup(true);
      setStages([
        {
          id: "balance_payment",
          name: "Balance / Possession Payment",
          description: "Remaining balance on possession",
          status: "planned",
        },
      ]);
      setBookingAmount("");
      setBookingPercentage("");
      setAmounts({ balance_payment: "" });
      setPercentages({ balance_payment: "" });
    } else {
      // Ongoing units need a project setup check
      try {
        setLoading(true);
        const setupsRes = await operationApi.getProjectSetups();
        const setups = getArrayData(setupsRes);
        const projectHasSetup = setups.some(
          (s) => String(s.project_id) === String(selectedProject.id) &&
                 String(s.project_type).toLowerCase() === normalizeProjectTypeKey(selectedProject.type).toLowerCase()
        );

        if (!projectHasSetup) {
          setHasSetup(false);
          setValidationError(
            "This project does not have a construction setup configured. Please set up project milestones in Operations first.",
          );
          return;
        }

        setHasSetup(true);
        const compositeId = buildCompositeProjectId(selectedProject);
        const stagesList = await fetchProjectStages(
          compositeId,
          normalizeProjectTypeKey(selectedProject.type),
          token,
        );
        setStages(stagesList);

        // Reset slabs states
        setBookingAmount("");
        setBookingPercentage("");
        const initialSlabs = {};
        stagesList.forEach((s) => {
          initialSlabs[s.id] = "";
        });
        setAmounts(initialSlabs);
        setPercentages(initialSlabs);
      } catch (err) {
        console.error("Error verifying project setup:", err);
        setValidationError("Failed to verify project construction milestones.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Slabs Calculation Helpers
  const dealValueNum = parseFloat(totalDealValue) || 0;

  const totalAllocated =
    Object.values(amounts).reduce((sum, val) => {
      return sum + (parseFloat(val) || 0);
    }, 0) + (parseFloat(bookingAmount) || 0);

  const totalPercentage =
    Object.values(percentages).reduce((sum, val) => {
      return sum + (parseFloat(val) || 0);
    }, 0) + (parseFloat(bookingPercentage) || 0);

  const remainingBalance = dealValueNum - totalAllocated;
  const isPerfectAllocation =
    dealValueNum > 0 &&
    Math.abs(remainingBalance) < 1.5 &&
    Math.abs(totalPercentage - 100) < 0.15;
  const isExceeded = remainingBalance < -0.5;

  const handleBookingAmountChange = (val) => {
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setBookingAmount(val);
      const amt = parseFloat(val) || 0;
      if (dealValueNum > 0) {
        setBookingPercentage(((amt / dealValueNum) * 100).toFixed(2));
      } else {
        setBookingPercentage("");
      }
      setValidationError("");
    }
  };

  const handleBookingPercentageChange = (val) => {
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setBookingPercentage(val);
      const pct = parseFloat(val) || 0;
      if (dealValueNum > 0) {
        setBookingAmount(Math.round((dealValueNum * pct) / 100).toString());
      } else {
        setBookingAmount("");
      }
      setValidationError("");
    }
  };

  const handleAmountChange = (stageId, val) => {
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setAmounts((prev) => ({ ...prev, [stageId]: val }));
      const amt = parseFloat(val) || 0;
      if (dealValueNum > 0) {
        setPercentages((prev) => ({
          ...prev,
          [stageId]: ((amt / dealValueNum) * 100).toFixed(2),
        }));
      } else {
        setPercentages((prev) => ({ ...prev, [stageId]: "" }));
      }
      setValidationError("");
    }
  };

  const handlePercentageChange = (stageId, val) => {
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setPercentages((prev) => ({ ...prev, [stageId]: val }));
      const pct = parseFloat(val) || 0;
      if (dealValueNum > 0) {
        setAmounts((prev) => ({
          ...prev,
          [stageId]: Math.round((dealValueNum * pct) / 100).toString(),
        }));
      } else {
        setAmounts((prev) => ({ ...prev, [stageId]: "" }));
      }
      setValidationError("");
    }
  };

  const handleTotalDealValueChange = (newVal) => {
    setTotalDealValue(newVal);
    setValidationError("");
    const newDealValueNum = parseFloat(newVal) || 0;

    if (newDealValueNum > 0) {
      if (bookingPercentage !== "") {
        const pct = parseFloat(bookingPercentage) || 0;
        setBookingAmount(Math.round((newDealValueNum * pct) / 100).toString());
      }
      const updated = {};
      stages.forEach((stage) => {
        const pctVal = percentages[stage.id] || "";
        if (pctVal !== "") {
          const pct = parseFloat(pctVal) || 0;
          updated[stage.id] = Math.round(
            (newDealValueNum * pct) / 100,
          ).toString();
        } else {
          updated[stage.id] = "";
        }
      });
      setAmounts(updated);
    } else {
      setBookingAmount("");
      setBookingPercentage("");
      const cleared = {};
      stages.forEach((s) => {
        cleared[s.id] = "";
      });
      setAmounts(cleared);
    }
  };

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
      const bookingAmtNum = parseFloat(bookingAmount) || 0;
      const remainingToDistribute = dealValueNum - bookingAmtNum;

      if (remainingToDistribute < 0) {
        setValidationError("Booking amount cannot exceed Total Deal Value.");
        return;
      }

      const equalAmt = Math.round((remainingToDistribute / count) * 100) / 100;
      const equalPct = ((equalAmt / dealValueNum) * 100).toFixed(2);

      stages.forEach((stage, idx) => {
        if (idx === count - 1) {
          let sumPcts = 0;
          let sumAmts = 0;
          stages.slice(0, -1).forEach(() => {
            sumPcts += parseFloat(equalPct);
            sumAmts += equalAmt;
          });
          const bookingPctVal = parseFloat(bookingPercentage) || 0;
          const targetPctForStages = 100 - bookingPctVal;
          newPercentages[stage.id] = (targetPctForStages - sumPcts).toFixed(2);
          newAmounts[stage.id] =
            Math.round((remainingToDistribute - sumAmts) * 100) / 100;
        } else {
          newPercentages[stage.id] = equalPct;
          newAmounts[stage.id] = equalAmt.toString();
        }
      });
      setPercentages(newPercentages);
      setAmounts(newAmounts);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Next Step Validation
  const handleNextStep = () => {
    setValidationError("");
    if (step === 1) {
      if (!personalForm.name.trim() || !personalForm.phone.trim()) {
        setValidationError("Name and Phone fields are required.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedProject) {
        setValidationError("Please select a project.");
        return;
      }
      if (!selectedUnit) {
        setValidationError("Please select a unit.");
        return;
      }
      if (!hasSetup) {
        setValidationError(
          "Cannot proceed. This project has no active construction setup.",
        );
        return;
      }
      setStep(3);
    }
  };

  // Mutation to Submit Direct Customer
  const mutation = useMutation({
    mutationFn: async (formData) => {
      return api.post("/api/customers/create-direct", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
      alert("Customer created successfully in staging area!");
      onSaveSuccess?.();
      onClose();
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to create customer.";
      setValidationError(msg);
    },
  });

  const handleSubmit = () => {
    if (!selectedUnit) {
      setValidationError("Please select a unit before saving.");
      return;
    }
    if (dealValueNum <= 0) {
      setValidationError("Please specify a valid Total Deal Value.");
      return;
    }
    if (!isPerfectAllocation) {
      setValidationError(
        `Allocation mismatch. Remaining balance must be ₹0 and percentage must sum to 100%.`,
      );
      return;
    }

    const bookingSlab = {
      stage_id: "booking_amount",
      stage_name: "Booking Amount",
      ratio_percentage: parseFloat(bookingPercentage) || 0,
      allocated_amount: parseFloat(bookingAmount) || 0,
    };

    const slabs = [
      bookingSlab,
      ...stages.map((stage) => ({
        stage_id: stage.id,
        stage_name: stage.name,
        ratio_percentage: parseFloat(percentages[stage.id]) || 0,
        allocated_amount: parseFloat(amounts[stage.id]) || 0,
      })),
    ];

    const formData = new FormData();
    formData.append("company_id", companyId);
    formData.append("project_id", buildCompositeProjectId(selectedProject));
    formData.append("unit_id", selectedUnit.unit_id);
    formData.append("unit_name", selectedUnit.unit_name);
    formData.append("total_deal_value", dealValueNum);
    formData.append("slabs", JSON.stringify(slabs));

    // Append profile parameters
    Object.keys(personalForm).forEach((key) => {
      formData.append(key, personalForm[key]);
    });

    // Append documents
    uploadedFiles.forEach((file) => {
      formData.append("files", file);
    });

    mutation.mutate(formData);
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredProjects = projectsList.filter(
    (p) =>
      (p.name || p.project_name || "")
        .toLowerCase()
        .includes(projectSearchTerm.toLowerCase()) ||
      (p.type || "").toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
      (p.location || p.site_location || "")
        .toLowerCase()
        .includes(projectSearchTerm.toLowerCase()),
  );

  const filteredUnits = availableUnits.filter((u) =>
    (u.unit_name || "").toLowerCase().includes(unitSearchTerm.toLowerCase()),
  );

  const getUnitStatusStyle = (status) => {
    const s = (status || "Pending").toLowerCase().trim();
    if (s === "ready to move" || s === "completed") {
      return "text-emerald-700 bg-emerald-50 border border-emerald-200";
    }
    if (s === "in progress") {
      return "text-sky-700 bg-sky-50 border border-sky-200";
    }
    return "text-slate-500 bg-slate-50 border border-slate-200";
  };

  return createPortal(
    <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999 backdrop-blur-xs bg-slate-900/40">
      <div
        className={`app-modal w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-(--border-soft) ${step === 2 ? "overflow-visible" : "overflow-hidden"}`}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-(--border-soft) flex justify-between items-center bg-white rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl flex items-center justify-center bg-emerald-50 border border-emerald-100 shrink-0">
              <UserPlus className="size-5 text-(--brand)" />
            </div>
            <div>
              <h3 className="modal-title text-[16px] font-extrabold text-(--text-strong)">
                Create Customer
              </h3>
              <p className="modal-subtitle text-[12px] text-(--text-soft) mt-0.5">
                Setup direct profile, project unit and payment milestones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="app-icon-button p-2 text-(--text-faint) hover:text-(--text-soft) hover:bg-(--bg-subtle) rounded-full transition-all"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Steps Progress bar */}
        <div className="px-5 py-3 border-b border-(--border-soft) bg-slate-50/50 flex items-center shrink-0">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`flex items-center ${num < 3 ? "flex-1" : ""}`}
            >
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`size-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step === num
                      ? "bg-(--brand) text-white"
                      : step > num
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {step > num ? <Check className="size-3.5 stroke-3" /> : num}
                </div>
                <span
                  className={`text-[12px] font-semibold whitespace-nowrap ${step === num ? "text-(--text-strong) font-bold" : "text-(--text-soft)"}`}
                >
                  {num === 1
                    ? "Profile Setup"
                    : num === 2
                      ? "Project & Unit"
                      : "Payment Slabs"}
                </span>
              </div>
              {num < 3 && <div className="flex-1 h-0.5 bg-slate-200 mx-4" />}
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div
          className={`flex-1 p-5 space-y-5 custom-scrollbar ${step === 2 ? "overflow-visible" : "overflow-y-auto"}`}
        >
          {validationError && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="size-8 animate-spin text-(--brand)" />
              <p className="text-xs font-semibold text-(--text-soft)">
                Processing details...
              </p>
            </div>
          ) : (
            <>
              {/* STEP 1: PERSONAL & PROFILE */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div className="border-b border-(--border-soft) pb-1.5 flex items-center gap-2">
                      <User className="size-4 text-(--brand)" />
                      <h4 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest">
                        Basic Profile Info
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="modal-label block mb-1">
                          Customer Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={personalForm.name}
                          onChange={(e) =>
                            setPersonalForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="e.g. Rajesh Kumar"
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className="modal-label block mb-1">
                          Phone Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={personalForm.phone}
                          onChange={(e) =>
                            setPersonalForm((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="e.g. 9876543210"
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="modal-label block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={personalForm.email}
                        onChange={(e) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="e.g. rajesh@example.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-4">
                    <div className="border-b border-(--border-soft) pb-1.5 flex items-center gap-2">
                      <MapPin className="size-4 text-blue-600" />
                      <h4 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest">
                        Address Details
                      </h4>
                    </div>
                    <div>
                      <label className="modal-label block mb-1">
                        Full Address
                      </label>
                      <textarea
                        value={personalForm.full_address}
                        onChange={(e) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            full_address: e.target.value,
                          }))
                        }
                        placeholder="House no, street, locality..."
                        rows={2}
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="modal-label block mb-1">City</label>
                        <input
                          type="text"
                          value={personalForm.city}
                          onChange={(e) =>
                            setPersonalForm((prev) => ({
                              ...prev,
                              city: e.target.value,
                            }))
                          }
                          placeholder="e.g. Hyderabad"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="modal-label block mb-1">State</label>
                        <input
                          type="text"
                          value={personalForm.state}
                          onChange={(e) =>
                            setPersonalForm((prev) => ({
                              ...prev,
                              state: e.target.value,
                            }))
                          }
                          placeholder="e.g. Telangana"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="modal-label block mb-1">
                          Pincode
                        </label>
                        <input
                          type="text"
                          value={personalForm.pincode}
                          onChange={(e) =>
                            setPersonalForm((prev) => ({
                              ...prev,
                              pincode: e.target.value,
                            }))
                          }
                          placeholder="e.g. 500001"
                          maxLength={6}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Identity & Personal */}
                  <div className="space-y-4">
                    <div className="border-b border-(--border-soft) pb-1.5 flex items-center gap-2">
                      <CreditCard className="size-4 text-emerald-600" />
                      <h4 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest">
                        Identity & Personal
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="modal-label block mb-1">
                          PAN Number
                        </label>
                        <input
                          type="text"
                          value={personalForm.pan_number}
                          onChange={(e) =>
                            setPersonalForm((prev) => ({
                              ...prev,
                              pan_number: e.target.value.toUpperCase(),
                            }))
                          }
                          placeholder="e.g. ABCDE1234F"
                          maxLength={10}
                          className={`${inputClass} uppercase`}
                        />
                      </div>
                      <div>
                        <label className="modal-label block mb-1">
                          Aadhaar Number
                        </label>
                        <input
                          type="text"
                          value={personalForm.aadhaar_number}
                          onChange={(e) =>
                            setPersonalForm((prev) => ({
                              ...prev,
                              aadhaar_number: e.target.value,
                            }))
                          }
                          placeholder="e.g. 1234 5678 9012"
                          maxLength={14}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="modal-label block mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={personalForm.date_of_birth}
                          onChange={(e) =>
                            setPersonalForm((prev) => ({
                              ...prev,
                              date_of_birth: e.target.value,
                            }))
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="modal-label block mb-1">
                          Occupation
                        </label>
                        <input
                          type="text"
                          value={personalForm.occupation}
                          onChange={(e) =>
                            setPersonalForm((prev) => ({
                              ...prev,
                              occupation: e.target.value,
                            }))
                          }
                          placeholder="e.g. Architect"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="modal-label block mb-1 items-center gap-1.5">
                        <Briefcase className="size-3.5 text-slate-400" />
                        Company / Organization Name
                      </label>
                      <input
                        type="text"
                        value={personalForm.company_name}
                        onChange={(e) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            company_name: e.target.value,
                          }))
                        }
                        placeholder="e.g. Tech Solutions Pvt Ltd"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Broker Information */}
                  <div className="space-y-4">
                    <div className="border-b border-(--border-soft) pb-1.5 flex items-center gap-2">
                      <Briefcase className="size-4 text-amber-600" />
                      <h4 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest">
                        Broker Partnership (Optional)
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="modal-label block mb-1">
                          Select Broker
                        </label>
                        <div className="relative" ref={brokerDropdownRef}>
                          <div className="relative" ref={brokerAnchorRef}>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-(--text-faint)" />
                            <input
                              type="text"
                              value={showBrokerDropdown ? brokerSearch : (selectedBroker ? selectedBroker.name : "")}
                              onChange={(event) => {
                                setBrokerSearch(event.target.value);
                                setShowBrokerDropdown(true);
                                if (personalForm.broker_id) {
                                  setPersonalForm((prev) => ({ ...prev, broker_id: "", commission: "" }));
                                }
                              }}
                              onFocus={handleBrokerInputFocus}
                              className={`${inputClass} pl-10 pr-10`}
                              placeholder="Search broker by name or phone"
                            />
                            {isLoadingBrokers ? (
                              <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 size-4 text-(--text-faint) animate-spin" />
                            ) : null}
                            {(showBrokerDropdown ? brokerSearch : (selectedBroker ? selectedBroker.name : "")) ? (
                              <button
                                type="button"
                                onClick={clearBrokerSelection}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-(--text-faint) hover:text-(--text-body)"
                                aria-label="Clear broker selection"
                              >
                                <X className="size-4" />
                              </button>
                            ) : (
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-(--text-faint) pointer-events-none" />
                            )}
                          </div>

                          {showBrokerDropdown && brokerDropdownStyle
                            ? createPortal(
                                <div
                                  ref={brokerPortalDropdownRef}
                                  style={brokerDropdownStyle}
                                  className="app-floating bg-white rounded-2xl max-h-64 overflow-y-auto custom-scrollbar py-1 shadow-lg border border-(--border-soft)"
                                >
                                  {filteredBrokers.length > 0 ? (
                                    filteredBrokers.map((broker) => (
                                      <button
                                        key={broker.id}
                                        type="button"
                                        onClick={() => handleBrokerSelect(broker)}
                                        className="w-full px-4 py-2.5 flex items-start gap-3 hover:bg-(--bg-subtle) transition-colors text-left"
                                      >
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <div className="text-[13px] font-medium text-(--text-strong) truncate">
                                              {broker.name}
                                            </div>
                                            {broker.commission && (
                                              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-(--brand) bg-(--brand-soft) px-2 py-0.5 rounded-lg">
                                                {broker.commission}%
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-[11px] text-(--text-faint) truncate mt-0.5">
                                            {broker.phone || broker.email || "No contact info"}
                                          </div>
                                        </div>
                                        {String(personalForm.broker_id) === String(broker.id) ? (
                                          <Check className="size-4 text-(--brand) shrink-0 mt-0.5" />
                                        ) : null}
                                      </button>
                                    ))
                                  ) : (
                                    <div className="px-4 py-6 text-center text-[12px] text-(--text-faint)">
                                      No brokers found
                                    </div>
                                  )}
                                </div>,
                                document.body,
                              )
                            : null}
                        </div>
                      </div>

                      <div>
                        <label className="modal-label block mb-1">
                          Commission Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={personalForm.commission}
                          onChange={(event) =>
                            setPersonalForm((prev) => ({ ...prev, commission: event.target.value }))
                          }
                          className={inputClass}
                          placeholder="Commission percentage (e.g. 2.50)"
                          disabled={!personalForm.broker_id}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nominee */}
                  <div className="space-y-4">
                    <div className="border-b border-(--border-soft) pb-1.5 flex items-center gap-2">
                      <Heart className="size-4 text-rose-500" />
                      <h4 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest">
                        Nominee Details
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="modal-label block mb-1">
                          Nominee Name
                        </label>
                        <input
                          type="text"
                          value={personalForm.nominee_name}
                          onChange={(e) =>
                            setPersonalForm((prev) => ({
                              ...prev,
                              nominee_name: e.target.value,
                            }))
                          }
                          placeholder="Nominee full name"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="modal-label block mb-1">
                          Relation
                        </label>
                        <select
                          value={personalForm.nominee_relation}
                          onChange={(e) =>
                            setPersonalForm((prev) => ({
                              ...prev,
                              nominee_relation: e.target.value,
                            }))
                          }
                          className={inputClass}
                        >
                          <option value="">Select relation</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Son">Son</option>
                          <option value="Daughter">Daughter</option>
                          <option value="Brother">Brother</option>
                          <option value="Sister">Sister</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="modal-label block mb-1">
                          Nominee Phone
                        </label>
                        <input
                          type="text"
                          value={personalForm.nominee_phone}
                          onChange={(e) =>
                            setPersonalForm((prev) => ({
                              ...prev,
                              nominee_phone: e.target.value,
                            }))
                          }
                          placeholder="Nominee contact no."
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Files & Documents */}
                  <div className="space-y-4">
                    <div className="border-b border-(--border-soft) pb-1.5 flex items-center gap-2">
                      <Upload className="size-4 text-sky-600" />
                      <h4 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest">
                        KYC Documents Upload
                      </h4>
                    </div>
                    <div className="border-2 border-dashed border-(--border-soft) rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="size-8 mx-auto text-(--text-faint) mb-2" />
                      <p className="text-[13px] font-semibold text-(--text-strong)">
                        Click or drag files here to upload
                      </p>
                      <p className="text-[11px] text-(--text-faint) mt-1">
                        Accepts images, PDF files (Max 10MB per file)
                      </p>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="app-panel p-3.5 space-y-2 bg-slate-50/50 rounded-2xl border border-(--border-soft)">
                        <h5 className="text-[11px] font-bold text-(--text-soft) uppercase tracking-wider">
                          Uploaded Documents ({uploadedFiles.length})
                        </h5>
                        <div className="divide-y divide-slate-100">
                          {uploadedFiles.map((file, idx) => (
                            <div
                              key={idx}
                              className="py-2.5 flex items-center justify-between gap-3 text-xs"
                            >
                              <span className="font-semibold text-(--text-body) truncate max-w-md">
                                {file.name}
                              </span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] text-(--text-faint)">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeFile(idx)}
                                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-all"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: PROJECT & UNIT */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Project Selector */}
                  <div className="space-y-4">
                    <div className="border-b border-(--border-soft) pb-1.5 flex items-center gap-2">
                      <Building className="size-4 text-(--brand)" />
                      <h4 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest">
                        Project Assignment
                      </h4>
                    </div>

                    <div className="relative">
                      <label className="modal-label block mb-1">
                        Select Project <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={projectSearchTerm}
                          onChange={(e) => {
                            setProjectSearchTerm(e.target.value);
                            setShowProjectDropdown(true);
                          }}
                          onFocus={() => setShowProjectDropdown(true)}
                          placeholder="Search projects..."
                          className={`${inputClass} pl-9! pr-4!`}
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-(--text-faint)" />
                        {selectedProject && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-(--brand-soft) text-(--brand-strong) border border-(--border-strong)">
                              {selectedProject.type}
                            </span>
                          </div>
                        )}

                        {showProjectDropdown && (
                          <div className="absolute z-50 w-full top-full mt-1 bg-white border border-(--border-strong) rounded-2xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                            {filteredProjects.length === 0 ? (
                              <div className="p-4 text-center text-xs font-semibold text-(--text-faint)">
                                No projects found
                              </div>
                            ) : (
                              filteredProjects.map((proj) => (
                                <button
                                  key={proj.uid}
                                  type="button"
                                  onClick={() => handleProjectSelect(proj)}
                                  className="w-full text-left px-4 py-3 hover:bg-(--bg-subtle) border-b border-slate-50 last:border-0 flex items-center justify-between text-[13px] duration-150 transition-colors"
                                >
                                  <div>
                                    <p className="font-bold text-(--text-strong)">
                                      {proj.name || proj.project_name}
                                    </p>
                                    <p className="text-[11px] text-(--text-faint) mt-0.5">
                                      {proj.location ||
                                        proj.site_location ||
                                        "No location"}
                                    </p>
                                  </div>
                                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                    {proj.type}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Unit Selector */}
                  {selectedProject && (
                    <div className="space-y-4 animate-sub-menu">
                      <div className="border-b border-(--border-soft) pb-1.5 flex items-center gap-2">
                        <Layers className="size-4 text-sky-600" />
                        <h4 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest">
                          Unit Selection
                        </h4>
                      </div>

                      <div className="relative">
                        <label className="modal-label block mb-1">
                          Select Unit <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={unitSearchTerm}
                            onChange={(e) => {
                              setUnitSearchTerm(e.target.value);
                              setShowUnitDropdown(true);
                            }}
                            onFocus={() => setShowUnitDropdown(true)}
                            placeholder="Search units..."
                            className={`${inputClass} pl-9! pr-4!`}
                          />
                          <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-(--text-faint)" />
                          {selectedUnit && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                              <span
                                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${getUnitStatusStyle(selectedUnit.possession_status)}`}
                              >
                                {selectedUnit.possession_status || "Pending"}
                              </span>
                            </div>
                          )}

                          {showUnitDropdown && (
                            <div className="absolute z-50 w-full top-full mt-1 bg-white border border-(--border-strong) rounded-2xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                              {filteredUnits.length === 0 ? (
                                <div className="p-4 text-center text-xs font-semibold text-(--text-faint)">
                                  No units found for this project
                                </div>
                              ) : (
                                filteredUnits.map((unit) => (
                                  <button
                                    key={unit.unit_id}
                                    type="button"
                                    onClick={() => handleUnitSelect(unit)}
                                    className="w-full text-left px-4 py-3 hover:bg-(--bg-subtle) border-b border-slate-50 last:border-0 flex items-center justify-between text-[13px] duration-150 transition-colors"
                                  >
                                    <div>
                                      <p className="font-bold text-(--text-strong)">
                                        {unit.unit_name}
                                      </p>
                                      <p className="text-[11px] text-(--text-faint) mt-0.5">
                                        Floor: {unit.floor_no || "N/A"} • Size:{" "}
                                        {unit.area_sqft ||
                                          unit.super_builtup_area ||
                                          "N/A"}{" "}
                                        SqFt
                                      </p>
                                    </div>
                                    <span
                                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${getUnitStatusStyle(unit.possession_status)}`}
                                    >
                                      {unit.possession_status || "Pending"}
                                    </span>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Info Alert showing selection status */}
                      {selectedUnit && (
                        <div className="p-3.5 bg-slate-50 border border-(--border-soft) rounded-2xl flex items-start justify-between gap-3 text-xs animate-sub-menu">
                          <div>
                            <p className="font-bold text-(--text-strong)">
                              Selected: {selectedUnit.unit_name}
                            </p>
                            <p className="text-(--text-soft) mt-0.5">
                              Project:{" "}
                              {selectedProject.name ||
                                selectedProject.project_name}
                            </p>
                          </div>
                          {isFinished ? (
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Finished/Possession Ready Unit
                            </span>
                          ) : (
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                              Ongoing Construction Unit
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: PAYMENT SLABS */}
              {step === 3 && (
                <div className="space-y-6 animate-sub-menu">
                  {/* Deal Value Section */}
                  <div className="space-y-4">
                    <div className="border-b border-(--border-soft) pb-1.5 flex items-center gap-2">
                      <IndianRupee className="size-4 text-(--brand)" />
                      <h4 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest">
                        Financial Deal Structure
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                      <div>
                        <label className="modal-label block mb-1">
                          Total Deal Value (₹){" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={totalDealValue}
                            onChange={(e) =>
                              handleTotalDealValueChange(e.target.value)
                            }
                            placeholder="e.g. 5500000"
                            className={`${inputClass} pl-9!`}
                          />
                          <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-(--text-faint)" />
                        </div>
                      </div>

                      {!isFinished && dealValueNum > 0 && (
                        <div>
                          <button
                            type="button"
                            onClick={handleDistributeEvenly}
                            className="app-btn-secondary w-full flex items-center justify-center gap-2 text-xs py-2.5 min-h-10 hover:bg-slate-50 transition-all font-bold"
                          >
                            <Layers className="size-4 text-sky-600" />
                            Distribute Slabs Evenly
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Slab Allocation Status/Progress */}
                  {dealValueNum > 0 && (
                    <div className="app-panel p-4 space-y-3.5 bg-slate-50/50 rounded-2xl border border-(--border-soft) animate-sub-menu">
                      <div className="flex items-center justify-between text-xs font-bold text-(--text-strong)">
                        <span>
                          Allocated: {formatINR(totalAllocated)} (
                          {totalPercentage.toFixed(1)}%)
                        </span>
                        <span>Remaining: {formatINR(remainingBalance)}</span>
                      </div>

                      {/* Custom Progress Bar */}
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isPerfectAllocation
                              ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                              : isExceeded
                                ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse"
                                : "bg-sky-500"
                          }`}
                          style={{
                            width: `${Math.min((totalAllocated / dealValueNum) * 100, 100)}%`,
                          }}
                        />
                      </div>

                      {isPerfectAllocation ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                          <CheckCircle className="size-4 shrink-0 text-emerald-600" />
                          <span>
                            Perfect 100% distribution matching the deal value!
                          </span>
                        </div>
                      ) : isExceeded ? (
                        <div className="flex items-center gap-1.5 text-xs text-rose-700 font-bold">
                          <AlertTriangle className="size-4 shrink-0 text-rose-600" />
                          <span>
                            Allocation has exceeded Total Deal Value by{" "}
                            {formatINR(Math.abs(remainingBalance))}!
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-sky-700 font-bold">
                          <AlertCircle className="size-4 shrink-0 text-sky-600" />
                          <span>
                            Please allocate remaining{" "}
                            {formatINR(remainingBalance)} (
                            {(100 - totalPercentage).toFixed(1)}%) across
                            milestones.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Slabs Allocation Row Inputs */}
                  {dealValueNum > 0 && (
                    <div className="space-y-4">
                      <div className="border-b border-(--border-soft) pb-1.5 flex items-center gap-2">
                        <Layers className="size-4 text-sky-600" />
                        <h4 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest">
                          Milestone Slab Splits
                        </h4>
                      </div>

                      <div className="space-y-3.5">
                        {/* Booking Amount Slab */}
                        <div className="app-panel p-4 bg-white rounded-2xl border border-(--border-soft) hover:border-(--border-strong) transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="min-w-0">
                            <span className="text-[13px] font-extrabold text-(--text-strong)">
                              Booking Amount
                            </span>
                            <span className="block text-[11px] text-(--text-faint) mt-0.5">
                              Initial deposit to hold the unit booking
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* Percentage input */}
                            <div className="relative w-28">
                              <input
                                type="text"
                                value={bookingPercentage}
                                onChange={(e) =>
                                  handleBookingPercentageChange(e.target.value)
                                }
                                placeholder="0.00"
                                className={`${inputClass} pr-7! text-right`}
                              />
                              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 size-3 text-(--text-faint)" />
                            </div>

                            <ArrowRight className="size-3.5 text-slate-300" />

                            {/* Amount input */}
                            <div className="relative w-36">
                              <input
                                type="text"
                                value={bookingAmount}
                                onChange={(e) =>
                                  handleBookingAmountChange(e.target.value)
                                }
                                placeholder="0"
                                className={`${inputClass} pl-7!`}
                              />
                              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-(--text-faint)" />
                            </div>
                          </div>
                        </div>

                        {/* Milestone Stages */}
                        {stages.map((stage) => (
                          <div
                            key={stage.id}
                            className="app-panel p-4 bg-white rounded-2xl border border-(--border-soft) hover:border-(--border-strong) transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="min-w-0">
                              <span className="text-[13px] font-extrabold text-(--text-strong)">
                                {stage.name}
                              </span>
                              {stage.description && (
                                <span className="block text-[11px] text-(--text-faint) mt-0.5 truncate max-w-xs">
                                  {stage.description}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {/* Percentage input */}
                              <div className="relative w-28">
                                <input
                                  type="text"
                                  value={percentages[stage.id] || ""}
                                  onChange={(e) =>
                                    handlePercentageChange(
                                      stage.id,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0.00"
                                  className={`${inputClass} pr-7! text-right`}
                                />
                                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 size-3 text-(--text-faint)" />
                              </div>

                              <ArrowRight className="size-3.5 text-slate-300" />

                              {/* Amount input */}
                              <div className="relative w-36">
                                <input
                                  type="text"
                                  value={amounts[stage.id] || ""}
                                  onChange={(e) =>
                                    handleAmountChange(stage.id, e.target.value)
                                  }
                                  placeholder="0"
                                  className={`${inputClass} pl-7!`}
                                />
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-(--text-faint)" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-(--border-soft) flex items-center justify-between bg-white rounded-b-2xl shrink-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => {
                  setValidationError("");
                  setStep((prev) => prev - 1);
                }}
                className="app-btn-secondary text-xs hover:bg-slate-50 transition-all font-bold px-4 py-2 min-h-10 cursor-pointer"
              >
                Previous Step
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="app-btn-secondary text-xs hover:bg-slate-50 transition-all font-bold px-4 py-2 min-h-10 cursor-pointer"
            >
              Cancel
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={loading}
                className="app-btn-primary text-xs transition-all font-bold px-5 py-2 min-h-10 cursor-pointer"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={mutation.isPending || !isPerfectAllocation}
                className="app-btn-primary text-xs transition-all font-bold px-5 py-2 min-h-10 cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating Customer...
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4" />
                    Create Customer
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
