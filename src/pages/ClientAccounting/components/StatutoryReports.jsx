import React from "react";
import { useState } from "react";
import {
  BarChart3,
  FileText,
  ShoppingCart,
  ShoppingBag,
  ListOrdered,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

import GSTActivities from "./TrackGSTActivities";
import GSTR1 from "./GSTR1";
import GSTR3B from "./GSTR3B";
import E_wayBill from "./E_wayBill";
import Gstr2B from "./Gstr2B";
import HSNSummaryReport from "./HSNSummaryReport";

const StatutoryReports = () => {
  const [activeModule, setActiveModule] = useState("dashboard");

  const handleBack = () => setActiveModule("dashboard");

  const modules = [
    {
      id: "track-gst",
      title: "Track GST Activities",
      description:
        "Monitor all GST return filing statuses and compliance activities",
      icon: <BarChart3 className="w-5 h-5 text-[#00a651]" />,
      iconBg: "bg-[#f0fdf4] border-[#c6f1d6]",
      component: <GSTActivities onBack={handleBack} />,
    },
    {
      id: "hsn-summary",
      title: "HSN/SAC Summary Report",
      description:
        "Summary of outward supplies grouped by HSN/SAC code & tax rate from Sales Vouchers",
      icon: <FileText className="w-5 h-5 text-[#00a651]" />,
      iconBg: "bg-[#f0fdf4] border-[#c6f1d6]",
      component: <HSNSummaryReport onBack={handleBack} />,
    },
    {
      id: "gstr-1",
      title: "GSTR-1 (Sales)",
      description: "File outward supplies and sales return details",
      icon: <ShoppingCart className="w-5 h-5 text-blue-600" />,
      iconBg: "bg-blue-50 border-blue-200",
      component: <GSTR1 onBack={handleBack} />,
    },
    {
      id: "gstr-2b",
      title: "GSTR-2B",
      description: "View auto-populated purchase returns & ITC reconciliation",
      icon: <ShoppingBag className="w-5 h-5 text-indigo-600" />,
      iconBg: "bg-indigo-50 border-indigo-200",
      component: <Gstr2B onBack={handleBack} />,
    },
    {
      id: "gstr-3b",
      title: "GSTR-3B",
      description: "Monthly summary return of outward supplies & eligible ITC",
      icon: <ShoppingBag className="w-5 h-5 text-purple-600" />,
      iconBg: "bg-purple-50 border-purple-200",
      component: <GSTR3B onBack={handleBack} />,
    },
    {
      id: "e-way-bill",
      title: "e-Way Bill",
      description: "Generate and manage e-way bill transport documentation",
      icon: <ListOrdered className="w-5 h-5 text-teal-600" />,
      iconBg: "bg-teal-50 border-teal-200",
      component: <E_wayBill onBack={handleBack} />,
    },
    {
      id: "gst-portal",
      title: "Open GST Portal",
      description:
        "Access the official GST government portal for direct filings",
      icon: <FileText className="w-5 h-5 text-amber-600" />,
      iconBg: "bg-amber-50 border-amber-200",
      external: true,
      url: "https://services.gst.gov.in/services/login/",
    },
  ];

  const renderModuleContent = () => {
    if (activeModule === "dashboard") {
      return (
        <div className="space-y-5">
          <div className="bg-white app-panel border border-[#e2f2e9] rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="app-title text-lg md:text-xl font-extrabold text-[#042f2e] tracking-tight">
                Statutory Reports Dashboard
              </h1>
              <p className="app-subtitle text-xs text-[#475569] font-medium mt-0.5">
                Central hub for GST filings, reconciliation reports, and
                compliance tracking
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#00a651] bg-[#f0fdf4] px-3 py-1 rounded-full border border-[#c6f1d6] w-fit">
              <span className="size-2 rounded-full bg-[#00a651] animate-pulse" />
              GST Compliance Active
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => {
                  if (module.external && module.url) {
                    window.open(module.url, "_blank", "noopener,noreferrer");
                  } else {
                    setActiveModule(module.id);
                  }
                }}
                className="bg-white border border-[#e2f2e9] hover:border-[#c6f1d6] hover:bg-[#f0fdf4]/30 rounded-2xl p-5 text-left hover:shadow-md transition-all duration-200 group flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-2.5 rounded-xl border ${module.iconBg} group-hover:scale-105 transition-transform`}
                    >
                      {module.icon}
                    </div>
                    {module.external ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        External <ExternalLink className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="size-7 rounded-full bg-[#f8faf8] border border-[#e2f2e9] flex items-center justify-center text-slate-400 group-hover:text-[#00a651] group-hover:bg-[#f0fdf4] group-hover:border-[#c6f1d6] transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-[#042f2e] group-hover:text-[#00a651] transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-xs/relaxed text-[#475569] mt-1 ">
                    {module.description}
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-[#e2f2e9] flex items-center justify-between text-xs font-bold text-[#00a651] group-hover:text-[#008c44]">
                  <span>
                    {module.external ? "Open GST Portal" : "View Report"}
                  </span>
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    const module = modules.find((m) => m.id === activeModule);
    if (!module) return null;

    return (
      <div className="space-y-4">
        <div>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-[#042f2e] px-3.5 py-1.5 rounded-xl border border-[#e2f2e9] hover:border-[#c6f1d6] transition-all text-xs font-bold shadow-2xs hover:shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4 text-[#00a651]" />
            Back to Statutory Dashboard
          </button>
        </div>
        {module.component}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans">
      <div className="max-w-7xl mx-auto">{renderModuleContent()}</div>
    </div>
  );
};

export default StatutoryReports;
