import React from "react";

const AttendanceSubmissionSkeleton = () => {
  return (
    <div className="animate-pulse space-y-5 px-4 py-4 md:px-6 md:py-6">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="h-20 rounded-2xl bg-slate-100" />
        <div className="h-20 rounded-2xl bg-slate-100" />
        <div className="h-20 rounded-2xl bg-slate-100" />
      </div>

      <div className="space-y-4">
        <div className="h-11 rounded-2xl bg-slate-100" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-11 rounded-2xl bg-slate-100" />
          <div className="h-11 rounded-2xl bg-slate-100" />
          <div className="md:col-span-2 h-11 rounded-2xl bg-slate-100" />
          <div className="h-11 rounded-2xl bg-slate-100" />
          <div className="h-11 rounded-2xl bg-slate-100" />
          <div className="h-11 rounded-2xl bg-slate-100" />
          <div className="h-11 rounded-2xl bg-slate-100" />
        </div>
        <div className="h-24 rounded-2xl bg-slate-100" />
        <div className="h-16 rounded-2xl bg-slate-100" />
        <div className="h-12 rounded-2xl bg-slate-300" />
      </div>
    </div>
  );
};

export default AttendanceSubmissionSkeleton;
