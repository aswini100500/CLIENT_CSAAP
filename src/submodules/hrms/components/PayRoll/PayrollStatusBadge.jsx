import React from "react";

const PayrollStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      bg: "bg-amber-50/80",
      text: "text-amber-800",
      border: "border-amber-200/60",
      label: "Pending",
    },
    configured: {
      bg: "bg-sky-50/80",
      text: "text-sky-800",
      border: "border-sky-200/60",
      label: "Configured",
    },
    processed: {
      bg: "bg-violet-50/80",
      text: "text-violet-800",
      border: "border-violet-200/60",
      label: "Processed",
    },
    paid: {
      bg: "bg-emerald-50/80",
      text: "text-emerald-800",
      border: "border-emerald-200/60",
      label: "Paid",
    },
    failed: {
      bg: "bg-rose-50/80",
      text: "text-rose-800",
      border: "border-rose-200/60",
      label: "Failed",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
};

export default PayrollStatusBadge;
