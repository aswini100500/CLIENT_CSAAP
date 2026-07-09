export const formatCurrency = (amount) => {
  if (!amount) return "-";
  return `₹${parseInt(amount).toLocaleString("en-IN")}`;
};

export const getStatusBadge = (status) => {
  const badges = {
    Approved: { bg: "bg-green-100 text-green-800" },
    Pending: { bg: "bg-yellow-100 text-yellow-800" },
    Rejected: { bg: "bg-red-100 text-red-800" },
    Applied: { bg: "bg-blue-100 text-blue-800" },
  };
  return badges[status] || { bg: "bg-gray-100 text-gray-800" };
};

export const hasData = (item) => {
  return !!(
    item.priceDetails?.expectedPrice ||
    item.areaDetails?.plotArea ||
    item.propertyFeatures?.landArea ||
    item.purchaser ||
    item.broker ||
    item.constructor
  );
};

export const getProjectOverallStatus = (project) => {
  if (!project) return "Pending";
  
  let statuses = [];

  // For custom projects, data might be nested inside 'configuration'
  let effectiveProject = project;
  if ((project.type === "custom" || project.type === "Custom") && project.configuration) {
    try {
      const config = typeof project.configuration === "string"
        ? JSON.parse(project.configuration)
        : project.configuration;
      if (config && typeof config === "object") {
        effectiveProject = { ...project, ...config };
      }
    } catch (e) {}
  }

  const getStatus = (item) => {
    if (!item) return "Pending";
    let s = item.possessionStatus || item.possession_status;
    if (!s && item.propertyFeatures) {
      let features = item.propertyFeatures;
      if (typeof features === 'string') {
        try { features = JSON.parse(features); } catch(e) {}
      }
      s = features?.possessionStatus;
    }
    if (!s && item.transactionType) {
      s = item.transactionType.possessionStatus || item.transactionType.possession_status;
    }
    return s || "Pending";
  };

  if (effectiveProject.type === "apartment" || effectiveProject.customType === "apartment" || effectiveProject.blocks || effectiveProject.blocks_data) {
    let blocks = effectiveProject.blocks || effectiveProject.blocks_data || [];
    if (typeof blocks === "string") {
      try { blocks = JSON.parse(blocks); } catch (e) { blocks = []; }
    }
    if (Array.isArray(blocks)) {
      blocks.forEach(block => {
        const floors = block.floors || [];
        floors.forEach(floor => {
          const units = floor.units || [];
          units.forEach(unit => {
            statuses.push(getStatus(unit));
          });
        });
      });
    }
  } else if (effectiveProject.type === "plotting" || effectiveProject.customType === "plotting" || effectiveProject.plots || effectiveProject.plots_data) {
    let plots = effectiveProject.plots || effectiveProject.plots_data || [];
    if (typeof plots === "string") {
      try { plots = JSON.parse(plots); } catch (e) { plots = []; }
    }
    if (Array.isArray(plots)) {
      plots.forEach(plot => {
        statuses.push(getStatus(plot));
      });
    }
  } else if (effectiveProject.type === "commercial" || effectiveProject.type === "duplex" || effectiveProject.type === "triplex" || effectiveProject.units || effectiveProject.units_data) {
    let units = effectiveProject.units || effectiveProject.units_data || [];
    if (typeof units === "string") {
      try { units = JSON.parse(units); } catch (e) { units = []; }
    }
    if (Array.isArray(units)) {
      units.forEach(unit => {
        statuses.push(getStatus(unit));
      });
    }
  }

  if (statuses.length === 0) return project.overall_status || project.status || "Pending";

  const total = statuses.length;
  let pendingCount = 0;
  let inProgressCount = 0;
  let readyToMoveCount = 0;
  let completedCount = 0;

  for (const s of statuses) {
    if (s === "Pending") pendingCount++;
    else if (s === "In Progress") inProgressCount++;
    else if (s === "Ready to Move") readyToMoveCount++;
    else if (s === "Completed") completedCount++;
    else pendingCount++;
  }

  if (pendingCount === total) return "Pending";
  if (inProgressCount === total) return "In Progress";
  if (readyToMoveCount === total) return "Ready to Move";
  if (completedCount === total) return "Completed";

  return "In Progress";
};