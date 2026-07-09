
export const getInitialsColor = (initials) => {
  const colors = [
    "bg-green-600",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
  ];
  const index = initials.charCodeAt(0) % colors.length;
  return colors[index];
};

// ---------------------------------------------------------------------------
// Human-readable labels
// ---------------------------------------------------------------------------
const statusLabels = {
  NEW: "New",
  PENDING: "Pending",
  NO_RESPONSE: "No response",
  CALL_BACK: "Call back",
  REJECTED: "Rejected",
  ACCEPTED: "Accepted",
  PROFILE_UPDATED: "Profile Updated",
  PROJECT_ADDED: "Project Added",
  PROJECT_SETUP: "Project Setup",
  PAYMENT_SLAB: "Payment Slab",
};

export const formatStatus = (status) =>
  statusLabels[status?.toUpperCase()] || status || "-";



// ---------------------------------------------------------------------------
// Status chip colors
// ---------------------------------------------------------------------------

export const getStatusColor = (status) => {
  const s = status?.toUpperCase();
  switch (s) {
    case "NEW":
      return "bg-cyan-50 text-cyan-700 border border-cyan-200";
    case "PENDING":
      return "bg-violet-50 text-violet-700 border border-violet-200";
    case "NO_RESPONSE":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "CALL_BACK":
      return "bg-teal-50 text-teal-700 border border-teal-200";
    case "REJECTED":
      return "bg-red-50 text-red-700 border border-red-200";
    case "ACCEPTED":
      return "bg-green-50 text-green-700 border border-green-200";
    case "PROFILE_UPDATED":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "PROJECT_ADDED":
      return "bg-sky-50 text-sky-700 border border-sky-200";
    case "PROJECT_SETUP":
      return "bg-purple-50 text-purple-700 border border-purple-200";
    case "PAYMENT_SLAB":
      return "bg-rose-50 text-rose-700 border border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
  }
};

// ---------------------------------------------------------------------------
// All outcomes with labels (used for dropdowns)
// ---------------------------------------------------------------------------

const allOutcomes = [
  { value: "NO_RESPONSE", label: "No response" },
  { value: "CALL_BACK", label: "Call back" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
];

// ---------------------------------------------------------------------------
// Smart outcome suggestions - forward-only based on current stage
// ---------------------------------------------------------------------------

const stageOutcomeMap = {
  NEW: [],
  ASSIGNED: ["NO_RESPONSE", "CALL_BACK", "ACCEPTED", "REJECTED"],
  FOLLOW_UP: ["NO_RESPONSE", "CALL_BACK", "ACCEPTED", "REJECTED"],
  REJECTED: [],
};

// ---------------------------------------------------------------------------
// Lead Sources
// ---------------------------------------------------------------------------

export const LEAD_SOURCES = [
  { value: "WEBSITE", label: "Website" },
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "REFERRAL", label: "Referral" },
  { value: "ADVERTISEMENT", label: "Advertisement" },
  { value: "COLD_CALL", label: "Cold Call" },
  { value: "EMAIL_CAMPAIGN", label: "Email Campaign" },
  { value: "BROKER", label: "Broker" },
  { value: "OTHER", label: "Other" },
];

const sourceLabels = Object.fromEntries(
  LEAD_SOURCES.map((s) => [s.value, s.label]),
);

export const formatSource = (source) =>
  sourceLabels[source?.toUpperCase()] || source || "";

/**
 * Returns the list of allowed outcomes for a given stage.
 * Forward-moving only - no going backwards in the lifecycle.
 */
export const getOutcomesForStage = (stage) => {
  const s = stage?.toUpperCase();
  const allowed = stageOutcomeMap[s] || [];
  return allOutcomes.filter((o) => allowed.includes(o.value));
};

const outcomesMap = new Map(allOutcomes.map((o) => [o.value, o.label]));

/**
 * Returns the list of allowed outcomes based on the current active tab / view.
 * Decouples outcomes from stages.
 */
export const getOutcomesForTab = (activeTab) => {
  const tab = activeTab?.toLowerCase();

  if (tab === "assigned" || tab === "followup") {
    const order = ["NO_RESPONSE", "CALL_BACK", "ACCEPTED", "REJECTED"];
    return order.map((val) => ({ value: val, label: outcomesMap.get(val) }));
  }
  return [];
};

/**
 * Extracts the possession/property status from a raw unit/plot object.
 * Uses the same fallback chain as the project shared utils.
 * @param {Object} item - Raw unit or plot object from the Tenant API.
 * @returns {string} Possession status string (e.g. "Pending", "In Progress", "Ready to Move", "Completed").
 */
export const getPossessionStatus = (item) => {
  if (!item) return "Pending";
  let s = item.possessionStatus || item.possession_status;
  if (!s && item.propertyFeatures) {
    let features = item.propertyFeatures;
    if (typeof features === "string") {
      try { features = JSON.parse(features); } catch (e) { /* ignore */ }
    }
    s = features?.possessionStatus;
  }
  if (!s && item.transactionType) {
    s = item.transactionType.possessionStatus || item.transactionType.possession_status;
  }
  return s || "Pending";
};

/**
 * Returns true if a normalized unit object represents a finished/ready-to-move unit.
 * @param {{ possession_status?: string }} unit - A normalized unit from normalizeUnits().
 * @returns {boolean}
 */
export const isFinishedUnit = (unit) => {
  if (!unit?.possession_status) return false;
  const s = unit.possession_status.toLowerCase().trim();
  return s === "ready to move" || s === "completed";
};

/**
 * Normalizes the raw unit dump returned from the Tenant/Operations API
 * based on the project type and the actual SQL storage shapes.
 * Can accept either the raw configuration dump or the full project details object.
 * 
 * @param {Array|Object|string} rawDump - The raw JSON data or project details object.
 * @param {string} projectType - The project type (apartment, plotting, commercial, duplex, triplex, custom).
 * @returns {Array} Standardized units array: [{ unit_id, unit_name, possession_status }]
 */
export const normalizeUnits = (rawDump, projectType) => {
  if (!rawDump) return [];

  // Parse if string
  let data = rawDump;
  if (typeof rawDump === "string") {
    try {
      data = JSON.parse(rawDump);
    } catch (e) {
      console.error("Failed to parse units raw dump:", e);
      return [];
    }
  }

  // If data is a project details object, extract the appropriate inventory field
  if (data && typeof data === "object" && !Array.isArray(data)) {
    if (data.blocks_data !== undefined) {
      data = data.blocks_data;
    } else if (data.plots_data !== undefined) {
      data = data.plots_data;
    } else if (data.units_data !== undefined) {
      data = data.units_data;
    } else if (data.configuration !== undefined) {
      data = data.configuration;
    }

    // Parse again if the extracted field is a string
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error("Failed to parse nested units raw dump from project object:", e);
        return [];
      }
    }
  }

  const normalized = [];
  const type = String(projectType || "").toLowerCase();

  switch (type) {
    case "apartment": {
      // Dump is blocks_data array. Structure: Blocks -> Floors -> Units
      if (Array.isArray(data)) {
        data.forEach((block) => {
          (block.floors || []).forEach((floor) => {
            (floor.units || []).forEach((unit) => {
              const uId = String(unit.id || unit.unitNumber || unit.unit_no || "");
              const uNum = unit.unitNumber || unit.unit_no || "";
              normalized.push({
                unit_id: uId,
                unit_name: unit.name || uNum || (block.prefix ? `${block.prefix}-${uNum}` : `Unit ${uNum}` || `Unit ${uId}`),
                possession_status: getPossessionStatus(unit),
              });
            });
          });
        });
      }
      break;
    }

    case "duplex": {
      // Dump is units_data array. Structure: Flat list of duplex units
      if (Array.isArray(data)) {
        data.forEach((unit) => {
          const uId = String(unit.id || unit.unit_no || "");
          const uName = unit.name || unit.unit_no || `Duplex ${uId}`;
          normalized.push({
            unit_id: uId,
            unit_name: uName,
            possession_status: getPossessionStatus(unit),
          });
        });
      }
      break;
    }

    case "triplex":
    case "commercial": {
      // Dump is units_data array. Structure: Flat list of units
      if (Array.isArray(data)) {
        data.forEach((unit) => {
          const uId = String(unit.id || unit.unit_no || "");
          const uName = unit.name || unit.unit_no || `Unit ${uId}`;
          normalized.push({
            unit_id: uId,
            unit_name: uName,
            possession_status: getPossessionStatus(unit),
          });
        });
      }
      break;
    }

    case "plotting": {
      // Dump is plots_data array. Structure: Flat list of plots
      if (Array.isArray(data)) {
        data.forEach((plot) => {
          const pId = String(plot.id || plot.plot_no || "");
          const pName = plot.name || plot.plot_no || `Plot ${pId}`;
          normalized.push({
            unit_id: pId,
            unit_name: pName,
            possession_status: getPossessionStatus(plot),
          });
        });
      }
      break;
    }

    case "custom":
    case "custom_project": {
      // Dump is configuration JSON object. Structure: { plots: [...] }
      if (data && Array.isArray(data.plots)) {
        data.plots.forEach((plot) => {
          const pId = String(plot.id || plot.plot_no || "");
          const pName = plot.name || plot.plot_no || `Plot ${pId}`;
          normalized.push({
            unit_id: pId,
            unit_name: pName,
            possession_status: getPossessionStatus(plot),
          });
        });
      }
      break;
    }

    default:
      console.warn("Unknown project type for unit normalization:", projectType);
      break;
  }

  // Filter out any entries with empty/undefined unit_id
  return normalized.filter((item) => item.unit_id && item.unit_id.trim() !== "");
};
