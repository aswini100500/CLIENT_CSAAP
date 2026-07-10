import React, { useState } from "react";
import { Search, Eye, Plus, Menu } from "lucide-react";

export default function OTBonusList() {
  const [employee, setEmployee] = useState("");
  const [status, setStatus] = useState("Pending In Salary");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
    <div className="w-full bg-[#f3f3f3] min-h-screen p-3">
      <div className="bg-linear-to-r from-[#ff7c00] to-[#ff5000] text-white px-4 py-2 rounded-t-md flex justify-between items-center shadow">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Menu size={14} /> Bonus List
        </div>
        <div className="bg-[#ff6d00] text-xs px-3 py-1 rounded-full font-medium">
          Total Records: 0
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-b-md shadow p-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center border rounded-sm bg-white w-50">
          <input
            type="text"
            placeholder="Search Employee"
            className="w-full px-2 py-1.5 text-sm outline-none"
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
          />
          <Search size={14} className="mx-2 text-gray-500" />
        </div>

        <select
          className="border rounded-sm px-2 py-1.5 text-sm bg-white w-40"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>Pending In Salary</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>

        <div className="flex items-center text-sm">
          <span className="mr-1">From:</span>
          <input
            type="date"
            className="border rounded-sm px-2 py-1.5 text-sm"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="flex items-center text-sm">
          <span className="mr-1">To:</span>
          <input
            type="date"
            className="border rounded-sm px-2 py-1.5 text-sm"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <button className="flex items-center gap-2 bg-[#34a853] hover:bg-[#2f944b] text-white text-xs px-4 py-1.75 rounded-sm font-semibold">
          <Eye size={13} /> VIEW
        </button>

        <span className="text-red-600 text-xs font-semibold">
          No Record Found.
        </span>

        <button className="ml-auto flex items-center gap-2 bg-[#34a853] hover:bg-[#2f944b] text-white text-xs px-4 py-1.75 rounded-sm font-semibold">
          <Plus size={13} /> ADD NEW BONUS
        </button>
      </div>
    </div>
  );
}
