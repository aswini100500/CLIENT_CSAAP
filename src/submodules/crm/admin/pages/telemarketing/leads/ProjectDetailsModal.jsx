import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  MapPin,
  Building2,
  Layers,
  Compass,
  FileCheck2,
  Boxes,
  Home,
  Check,
  Building,
  Info,
  BadgeAlert,
  UserCheck,
  Percent,
} from "lucide-react";


const safeJsonParse = (val, fallback = null) => {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
};


const formatPrice = (val) => {
  if (val === undefined || val === null) return "NA";
  const num = Number(val);
  if (Number.isNaN(num)) return val;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};


const getStatusBadge = (status) => {
  const normalized = String(status || "").toLowerCase().trim();
  if (normalized === "available" || normalized === "approved") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
  }
  if (normalized === "sold" || normalized === "completed") {
    return "bg-slate-100 text-slate-600 border border-slate-200/60";
  }
  if (normalized === "pending" || normalized === "booked") {
    return "bg-amber-50 text-amber-700 border border-amber-200/60";
  }
  return "bg-slate-50 text-slate-500 border border-slate-100";
};


const CompactDetailRow = ({ label, value, icon: IconComponent }) => (
  <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-2">
      {IconComponent && <IconComponent className="size-4 text-(--text-faint) shrink-0" />}
      <span className="text-[12px] text-(--text-soft) font-medium">{label}</span>
    </div>
    <span className="text-[13px] font-bold text-(--text-strong) text-right truncate max-w-50">
      {value || "NA"}
    </span>
  </div>
);

const ProjectDetailsModal = ({ project, onClose }) => {
  if (!project) return null;


  const rawType = project.type || "";
  const normalizedType = rawType.toLowerCase().trim();
  const isPlotting = normalizedType.includes("plot");
  const isApartment = normalizedType.includes("apartment") || normalizedType.includes("residential");
  const isDuplex = normalizedType.includes("duplex") || normalizedType.includes("villa") || normalizedType.includes("home");
  const isCommercial = normalizedType.includes("commercial") || normalizedType.includes("office") || normalizedType.includes("park");


  let tabs = [];
  if (isPlotting) {
    tabs = [
      { id: "plots", label: "Plots Inventory" },
      { id: "revenue", label: "Revenue Plots" },
    ];
  } else if (isApartment) {
    tabs = [
      { id: "blocks", label: "Blocks Specs" },
      { id: "approvals", label: "Approvals Status" },
      { id: "revenue_plots", label: "Revenue Plots" },
    ];
  } else if (isDuplex) {
    tabs = [
      { id: "units", label: "Duplex Units" },
      { id: "facilities", label: "Facilities & Specs" },
    ];
  } else if (isCommercial) {
    tabs = [
      { id: "units", label: "Commercial Units" },
      { id: "plots", label: "Plots Inventory" },
    ];
  } else {

    tabs = [
      { id: "details", label: "Specifications" }
    ];
  }

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "details");


  const plotsData = safeJsonParse(project.plots_data) || [];
  const revenuePlotsData = safeJsonParse(project.revenue_plots_data) || [];
  const blocksData = safeJsonParse(project.blocks_data) || [];
  const approvalStatusJson = safeJsonParse(project.approval_status_json) || [];
  const unitsData = safeJsonParse(project.units_data) || [];
  const facilities = safeJsonParse(project.facilities) || {};
  const customFacilities = safeJsonParse(project.custom_facilities) || [];


  const renderTabContent = () => {
    switch (activeTab) {

      case "plots": {
        const data = plotsData;
        return (
          <div className="overflow-x-auto rounded-2xl border border-(--border-soft) bg-white">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-left px-4 py-3">Plot No</th>
                  <th className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-left px-4 py-3">Area (Sqft)</th>
                  <th className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-left px-4 py-3">Price</th>
                  <th className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px] text-(--text-body)">
                {data.length > 0 ? (
                  data.map((plot, index) => (
                    <tr key={index} className="hover:bg-(--bg-subtle)/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-(--text-strong)">{plot.plot_no}</td>
                      <td className="px-4 py-3 font-medium">{plot.area}</td>
                      <td className="px-4 py-3 font-semibold text-(--text-strong)">{formatPrice(plot.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold inline-block capitalize ${getStatusBadge(plot.status)}`}>
                          {plot.status || "available"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-(--text-faint) font-medium">
                      No plot inventory recorded for this project.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      }


      case "revenue":
      case "revenue_plots": {
        const data = revenuePlotsData;
        return (
          <div className="overflow-x-auto rounded-2xl border border-(--border-soft) bg-white">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-left px-4 py-3">Plot No</th>
                  <th className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-left px-4 py-3">Area (Sqft)</th>
                  <th className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-left px-4 py-3">Price</th>
                  <th className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px] text-(--text-body)">
                {data.length > 0 ? (
                  data.map((plot, index) => (
                    <tr key={index} className="hover:bg-(--bg-subtle)/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-(--text-strong)">{plot.plot_no}</td>
                      <td className="px-4 py-3 font-medium">{plot.area}</td>
                      <td className="px-4 py-3 font-semibold text-(--text-strong)">{formatPrice(plot.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold inline-block capitalize ${getStatusBadge(plot.status)}`}>
                          {plot.status || "available"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-(--text-faint) font-medium">
                      No revenue plot data recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      }


      case "blocks": {
        const data = blocksData;
        return (
          <div className="overflow-x-auto rounded-2xl border border-(--border-soft) bg-white">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-left px-4 py-3">Block</th>
                  <th className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-left px-4 py-3">Floors</th>
                  <th className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-left px-4 py-3">Units per Floor</th>
                  <th className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-left px-4 py-3">Total Units</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px] text-(--text-body)">
                {data.length > 0 ? (
                  data.map((block, index) => (
                    <tr key={index} className="hover:bg-(--bg-subtle)/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-(--text-strong)">Block {block.block_name}</td>
                      <td className="px-4 py-3 font-medium">{block.floors}</td>
                      <td className="px-4 py-3 font-medium">{block.units_per_floor}</td>
                      <td className="px-4 py-3 font-bold text-(--text-strong)">{block.total_units}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-(--text-faint) font-medium">
                      No blocks data registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      }


      case "approvals": {
        const data = approvalStatusJson;
        return (
          <div className="space-y-3.5">
            {data.length > 0 ? (
              data.map((app, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3.5 bg-white border border-(--border-soft) rounded-2xl hover:border-(--border-strong) transition-colors"
                >
                  <div className="min-w-0 pr-4">
                    <h5 className="text-[13.5px] font-bold text-(--text-strong) truncate">{app.authority}</h5>
                    <p className="text-[11px] text-(--text-faint) mt-0.5 font-medium">
                      {app.date ? `Verified on ${new Date(app.date).toLocaleDateString()}` : "Verification pending review"}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold inline-block uppercase tracking-wider shrink-0 ${getStatusBadge( app.status, )}`}
                  >
                    {app.status || "Pending"}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-(--text-faint) font-medium">
                No official municipal approvals tracked currently.
              </div>
            )}
          </div>
        );
      }


      case "units": {
        const data = unitsData;
        return (
          <div className="overflow-x-auto rounded-2xl border border-(--border-soft) bg-white">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-left px-4 py-3">Unit No</th>
                  {isCommercial && <th className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-left px-4 py-3">Floor</th>}
                  {isDuplex && <th className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-left px-4 py-3">Structure</th>}
                  <th className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-left px-4 py-3">Area (Sqft)</th>
                  <th className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-left px-4 py-3">Price</th>
                  <th className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px] text-(--text-body)">
                {data.length > 0 ? (
                  data.map((unit, index) => (
                    <tr key={index} className="hover:bg-(--bg-subtle)/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-(--text-strong)">{unit.unit_no}</td>
                      {isCommercial && <td className="px-4 py-3 font-medium">Floor {unit.floor}</td>}
                      {isDuplex && <td className="px-4 py-3 font-medium">{unit.floor || "G + 1"}</td>}
                      <td className="px-4 py-3 font-medium">{unit.area}</td>
                      <td className="px-4 py-3 font-semibold text-(--text-strong)">{formatPrice(unit.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold inline-block capitalize ${getStatusBadge(unit.status)}`}>
                          {unit.status || "available"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isCommercial || isDuplex ? 5 : 4} className="px-4 py-8 text-center text-(--text-faint) font-medium">
                      No duplex units entered in inventory.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      }


      case "facilities": {
        const facilityKeys = Object.keys(facilities);
        return (
          <div className="space-y-4">

            <div className="app-panel p-4 bg-white border border-(--border-soft)">
              <h5 className="text-[12px] font-bold text-(--text-soft) uppercase tracking-wider mb-3">Project Conveniences</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {facilityKeys.length > 0 ? (
                  facilityKeys.map((key) => {
                    const available = !!facilities[key];
                    return (
                      <div key={key} className="flex items-center gap-2 py-1">
                        <div
                          className={`size-5 rounded-full flex items-center justify-center shrink-0 border ${ available ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-200 text-slate-300" }`}
                        >
                          <Check className={`size-3 ${available ? "opacity-100" : "opacity-30"}`} />
                        </div>
                        <span className={`text-[12.5px] font-medium capitalize ${available ? "text-(--text-body)" : "text-(--text-faint) line-through"}`}>
                          {key.replace(/_/g, " ")}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-4 text-center text-(--text-faint) text-[13px]">
                    No convenience options specified.
                  </div>
                )}
              </div>
            </div>


            <div className="app-panel p-4 bg-white border border-(--border-soft)">
              <h5 className="text-[12px] font-bold text-(--text-soft) uppercase tracking-wider mb-2.5">Premium Additions</h5>
              {customFacilities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {customFacilities.map((feat, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-(--brand-soft) border border-(--border-soft) text-(--text-strong) text-[12px] font-semibold rounded-xl flex items-center gap-1.5"
                    >
                      <span className="size-1.5 rounded-full bg-(--brand) shrink-0" />
                      {feat}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[12.5px] text-(--text-faint) italic">No auxiliary premium options configured.</p>
              )}
            </div>
          </div>
        );
      }


      default: {
        return (
          <div className="p-5 border border-(--border-soft) bg-white rounded-2xl">
            <div className="flex gap-2.5 items-start">
              <Info className="size-4.5 text-(--brand) shrink-0 mt-0.5" />
              <div>
                <h5 className="text-[13.5px] font-bold text-(--text-strong)">General Specifications</h5>
                <p className="text-[12.5px] text-(--text-soft) mt-1 leading-relaxed">
                  This project contains customized setups. Please check standard reports or contact administrative desks for custom design layout sheets.
                </p>
              </div>
            </div>
          </div>
        );
      }
    }
  };

  const modalContent = (
    <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999">
      <div className="app-modal w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        <div className="px-5 py-4 border-b border-(--border-soft) flex justify-between items-start bg-white">
          <div className="flex items-start gap-3.5 min-w-0 pr-4">
            <div className="size-11 rounded-2xl flex items-center justify-center bg-(--brand-soft) border border-(--border-soft) shrink-0">
              {isPlotting && <Compass className="size-5 text-(--brand)" />}
              {isApartment && <Building className="size-5 text-(--brand)" />}
              {isDuplex && <Home className="size-5 text-(--brand)" />}
              {isCommercial && <Building2 className="size-5 text-(--brand)" />}
              {!isPlotting && !isApartment && !isDuplex && !isCommercial && <Layers className="size-5 text-(--brand)" />}
            </div>
            <div className="min-w-0">
              <h3 className="modal-title truncate" title={project.name}>
                {project.name}
              </h3>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1">
                <span className="flex items-center gap-1 text-[12px] text-(--text-soft) font-medium">
                  <MapPin className="size-3.5 text-rose-500 shrink-0" />
                  {[project.locality, project.city].filter(Boolean).join(", ") || "No Location Specified"}
                </span>
                <span className="text-slate-300 select-none">•</span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-(--bg-subtle) text-(--brand) border border-(--border-soft)">
                  {project.type || "Real Estate Project"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="app-icon-button p-2 text-(--text-faint) hover:text-(--text-body) hover:bg-(--bg-subtle) active:scale-95 shrink-0"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>


        <div className="p-5 overflow-y-auto custom-scrollbar space-y-5 bg-(--bg-app)">

          <div className="app-panel p-4 bg-white">
            <h4 className="app-heading mb-3 flex items-center gap-1.5">
              <Boxes className="size-4.5 text-(--brand) shrink-0" />
              General Specs Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              <div>
                {project.land_zone && (
                  <CompactDetailRow label="Land Zone" value={project.land_zone} icon={Compass} />
                )}
                {project.land_area && (
                  <CompactDetailRow label="Land Area" value={`${project.land_area} Acres`} icon={Layers} />
                )}
                {isApartment && project.total_units && (
                  <CompactDetailRow label="Total Units" value={project.total_units} icon={Building} />
                )}
                {isDuplex && project.num_units && (
                  <CompactDetailRow label="Total Units" value={project.num_units} icon={Home} />
                )}
                {isCommercial && project.total_units && (
                  <CompactDetailRow label="Total Units" value={project.total_units} icon={Building2} />
                )}
              </div>
              <div>
                {isCommercial && project.commercial_sub_type && (
                  <CompactDetailRow label="Category" value={project.commercial_sub_type} icon={Info} />
                )}
                {isCommercial && project.num_floors && (
                  <CompactDetailRow label="Total Floors" value={project.num_floors} icon={Layers} />
                )}
                {isDuplex && project.unit_prefix && (
                  <CompactDetailRow label="Unit Prefix" value={project.unit_prefix} icon={Info} />
                )}
                {project.revenue_plots !== undefined && (
                  <CompactDetailRow label="Revenue Plots" value={project.revenue_plots} icon={Percent} />
                )}
                {isApartment && project.constructor && (
                  <CompactDetailRow label="Constructor" value={project.constructor} icon={UserCheck} />
                )}
                {isApartment && project.broker && (
                  <CompactDetailRow label="Broker Partnership" value={project.broker} icon={UserCheck} />
                )}
              </div>
            </div>
          </div>


          {tabs.length > 0 && (
            <div className="space-y-4">

              <div className="flex gap-2 border-b border-(--border-soft) pb-1 scrollbar-none overflow-x-auto">
                {tabs.map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-[12.5px] font-bold rounded-t-xl border-t border-x transition-colors relative whitespace-nowrap ${ active ? "bg-white text-(--brand) border-(--border-soft) font-extrabold" : "text-(--text-soft) hover:text-(--text-strong) bg-transparent border-transparent" }`}
                    >
                      {tab.label}
                      {active && (
                        <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-white z-10" />
                      )}
                    </button>
                  );
                })}
              </div>


              <div className="">
                {renderTabContent()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProjectDetailsModal;
