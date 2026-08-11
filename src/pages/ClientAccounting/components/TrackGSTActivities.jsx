import React from "react";
import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Eye,
  RefreshCw,
  BarChart3,
} from "lucide-react";

const TrackGSTActivities = () => {
  const [timePeriod, setTimePeriod] = useState("currentQuarter");

  const activities = [
    {
      id: 1,
      returnType: "GSTR-3B",
      period: "Dec 2023",
      dueDate: "20 Jan 2024",
      status: "filed",
      filedDate: "18 Jan 2024",
      arn: "ARN1234567890",
    },
    {
      id: 2,
      returnType: "GSTR-1",
      period: "Dec 2023",
      dueDate: "11 Jan 2024",
      status: "filed",
      filedDate: "10 Jan 2024",
      arn: "ARN1234567891",
    },
    {
      id: 3,
      returnType: "GSTR-2B",
      period: "Dec 2023",
      dueDate: "15 Jan 2024",
      status: "pending",
      filedDate: "-",
      arn: "-",
    },
    {
      id: 4,
      returnType: "GSTR-3B",
      period: "Jan 2024",
      dueDate: "20 Feb 2024",
      status: "upcoming",
      filedDate: "-",
      arn: "-",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "filed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ecfdf5] text-[#00a651] border border-[#c6f1d6]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00a651]" />
            Filed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            Pending
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="w-3.5 h-3.5 text-sky-500" />
            Upcoming
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#e2f2e9] rounded-2xl py-3 px-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl border bg-[#f0fdf4] border-[#c6f1d6] text-[#00a651]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="app-title text-base font-extrabold text-[#042f2e] tracking-tight">
              Track GST Activities
            </h2>
            <p className="app-subtitle text-[11px] text-[#475569] font-medium">
              Monitor all GST return filing statuses and compliance activities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="h-9 border border-[#e2f2e9] text-[#042f2e] bg-white focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] rounded-xl px-3 py-1 text-xs font-semibold cursor-pointer shadow-2xs"
          >
            <option value="currentQuarter">
              Current Quarter (Oct-Dec 2023)
            </option>
            <option value="previousQuarter">
              Previous Quarter (Jul-Sep 2023)
            </option>
            <option value="financialYear">Financial Year 2023-24</option>
          </select>

          <button className="h-9 flex items-center gap-1.5 bg-linear-to-r from-[#00a651] to-[#00c853] hover:from-[#008c44] hover:to-[#00a651] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:shadow-md active:scale-[0.98] transition-all cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-[#e2f2e9] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold text-[#475569] uppercase tracking-widest">
              Filed Returns
            </p>
            <p className="text-xl font-extrabold text-[#042f2e] mt-1">2</p>
            <p className="text-xs text-[#00a651] font-semibold mt-0.5">
              Compliant this quarter
            </p>
          </div>
          <div className="size-10 rounded-xl bg-[#ecfdf5] border border-[#c6f1d6] flex items-center justify-center text-[#00a651]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#ffffff] border border-[#e2f2e9] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold text-[#475569] uppercase tracking-widest">
              Pending Filings
            </p>
            <p className="text-xl font-extrabold text-rose-600 mt-1">1</p>
            <p className="text-xs text-rose-500 font-semibold mt-0.5">
              Action required
            </p>
          </div>
          <div className="size-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2f2e9] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold text-[#475569] uppercase tracking-widest">
              Upcoming Due
            </p>
            <p className="text-xl font-extrabold text-[#042f2e] mt-1">1</p>
            <p className="text-xs text-sky-600 font-semibold mt-0.5">
              Next period filing
            </p>
          </div>
          <div className="size-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="app-panel overflow-hidden border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
        <div className="app-section-bar px-4 py-3 bg-white border-b border-[#e2f2e9] flex items-center justify-between">
          <h3 className="app-heading text-xs font-extrabold text-[#042f2e] uppercase tracking-wider">
            GST Return Activity Log
          </h3>
          <span className="text-xs text-[#475569] font-medium">
            {activities.length} Records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse bg-white">
            <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9]">
              <tr className="text-left text-[#475569]">
                <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                  Return Type
                </th>
                <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                  Period
                </th>
                <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                  Due Date
                </th>
                <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                  Status
                </th>
                <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                  Filed Date
                </th>
                <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                  ARN
                </th>
                <th className="py-2.5 px-3.5 text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2f2e9] bg-white">
              {activities.map((activity) => (
                <tr
                  key={activity.id}
                  className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-200"
                >
                  <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] whitespace-nowrap">
                    <span className="font-bold text-[#042f2e] bg-[#f8faf8] px-2 py-0.5 rounded text-xs border border-[#e2f2e9]">
                      {activity.returnType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] whitespace-nowrap font-medium text-slate-700 text-[13px]">
                    {activity.period}
                  </td>
                  <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] whitespace-nowrap text-slate-600 font-medium text-[13px]">
                    {activity.dueDate}
                  </td>
                  <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] whitespace-nowrap">
                    {getStatusBadge(activity.status)}
                  </td>
                  <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] whitespace-nowrap text-slate-600 font-medium text-[13px]">
                    {activity.filedDate}
                  </td>
                  <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] whitespace-nowrap font-mono text-[#475569] text-[12px]">
                    {activity.arn}
                  </td>
                  <td className="py-2.5 px-3.5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="View Details"
                        className="p-1 text-slate-400 hover:text-[#00a651] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {activity.status === "filed" && (
                        <button
                          title="Download Return"
                          className="p-1 text-slate-400 hover:text-[#00a651] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrackGSTActivities;
