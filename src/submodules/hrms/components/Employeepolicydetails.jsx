import React, { useState } from "react";
React
export default function EmployeePolicyDetails() {
  const [policyName, setPolicyName] = useState("");
  const [permittedLateArrival, setPermittedLateArrival] = useState("00:00");
  const [permittedEarlyDeparture, setPermittedEarlyDeparture] =
    useState("00:00");
  const [halfDayLessThan, setHalfDayLessThan] = useState("00:00");
  const [absentLessThan, setAbsentLessThan] = useState("00:00");

  const [lateArrivalRules, setLateArrivalRules] = useState([
    { arrival: "", deduct: "", deductType: "None" },
    { arrival: "", deduct: "", deductType: "None" },
    { arrival: "", deduct: "", deductType: "None" },
    { arrival: "", deduct: "", deductType: "None" },
  ]);

  const [earlyDepartureRules, setEarlyDepartureRules] = useState([
    { departure: "", deduct: "", deductType: "None" },
    { departure: "", deduct: "", deductType: "None" },
    { departure: "", deduct: "", deductType: "None" },
    { departure: "", deduct: "", deductType: "None" },
  ]);

  const [requiredPunches, setRequiredPunches] = useState("Multipunch");
  const [singlePunchOnly, setSinglePunchOnly] = useState("Overwrite");
  const [removeOvertime, setRemoveOvertime] = useState(false);
  const [inOutMode, setInOutMode] = useState(false);
  const [enableLateComing, setEnableLateComing] = useState(false);
  const [allowIgnoreOvertime, setAllowIgnoreOvertime] = useState(false);
  const [deductFrom, setDeductFrom] = useState("Deduct From Attendance");
  const [noOfLateInMonth, setNoOfLateInMonth] = useState("0");
  const [cutDays, setCutDays] = useState("");
  const [ignoreOvertimeLessThan, setIgnoreOvertimeLessThan] = useState("");

  const handleLateRuleChange = (index, field, value) => {
    const updated = [...lateArrivalRules];
    updated[index][field] = value;
    setLateArrivalRules(updated);
  };

  const handleEarlyRuleChange = (index, field, value) => {
    const updated = [...earlyDepartureRules];
    updated[index][field] = value;
    setEarlyDepartureRules(updated);
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert("Policy saved successfully!");
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? All changes will be lost.",
      )
    ) {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow border border-gray-200">

        <div className="bg-blue-500 text-white py-3 px-6 flex items-center rounded-t-lg">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <h1 className="text-lg font-semibold">Employee's Policy Details</h1>
        </div>

        <div className="p-6 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Policy Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permitted Late Arrival
              </label>
              <input
                type="text"
                value={permittedLateArrival}
                onChange={(e) => setPermittedLateArrival(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permitted Early Departure
              </label>
              <input
                type="text"
                value={permittedEarlyDeparture}
                onChange={(e) => setPermittedEarlyDeparture(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mark as Half Day if working hour Less Than
              </label>
              <input
                type="text"
                value={halfDayLessThan}
                onChange={(e) => setHalfDayLessThan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mark as Absent if working hour Less Than
              </label>
              <input
                type="text"
                value={absentLessThan}
                onChange={(e) => setAbsentLessThan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Late Coming Rule</h3>
                <label className="flex items-center text-sm">
                  <input type="checkbox" className="mr-2" />
                  Active For Week Off also
                </label>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-700 mb-1">
                <span>Late 1:</span>
                <span>Late 2:</span>
                <span>Late 3:</span>
                <span>Late 4:</span>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-2">
                {lateArrivalRules.map((rule, i) => (
                  <input
                    key={i}
                    type="text"
                    value={rule.arrival}
                    onChange={(e) =>
                      handleLateRuleChange(i, "arrival", e.target.value)
                    }
                    placeholder="00:00"
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2 mb-1">
                {lateArrivalRules.map((rule, i) => (
                  <input
                    key={i}
                    type="text"
                    value={rule.deduct}
                    onChange={(e) =>
                      handleLateRuleChange(i, "deduct", e.target.value)
                    }
                    placeholder="Deduct Day(%)"
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {lateArrivalRules.map((rule, i) => (
                  <select
                    key={i}
                    value={rule.deductType}
                    onChange={(e) =>
                      handleLateRuleChange(i, "deductType", e.target.value)
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option>None</option>
                    <option>Day</option>
                    <option>Half Day</option>
                  </select>
                ))}
              </div>
            </div>


            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Early Going Rule</h3>
                <label className="flex items-center text-sm">
                  <input type="checkbox" className="mr-2" />
                  Active For Week Off also
                </label>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-700 mb-1">
                <span>Early 1:</span>
                <span>Early 2:</span>
                <span>Early 3:</span>
                <span>Early 4:</span>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-2">
                {earlyDepartureRules.map((rule, i) => (
                  <input
                    key={i}
                    type="text"
                    value={rule.departure}
                    onChange={(e) =>
                      handleEarlyRuleChange(i, "departure", e.target.value)
                    }
                    placeholder="00:00"
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2 mb-1">
                {earlyDepartureRules.map((rule, i) => (
                  <input
                    key={i}
                    type="text"
                    value={rule.deduct}
                    onChange={(e) =>
                      handleEarlyRuleChange(i, "deduct", e.target.value)
                    }
                    placeholder="Deduct Day(%)"
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {earlyDepartureRules.map((rule, i) => (
                  <select
                    key={i}
                    value={rule.deductType}
                    onChange={(e) =>
                      handleEarlyRuleChange(i, "deductType", e.target.value)
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option>None</option>
                    <option>Day</option>
                    <option>Half Day</option>
                  </select>
                ))}
              </div>
            </div>
          </div>


          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h3 className="font-medium text-blue-900">
                Other Employee Policy Details
              </h3>
              <div className="flex gap-6">
                <label className="flex items-center text-sm text-red-600">
                  <input
                    type="checkbox"
                    checked={removeOvertime}
                    onChange={(e) => setRemoveOvertime(e.target.checked)}
                    className="mr-2"
                  />
                  Remove Overtime From Working Hours
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={inOutMode}
                    onChange={(e) => setInOutMode(e.target.checked)}
                    className="mr-2"
                  />
                  The device is operating as In/Out mode
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Required Punches In Day
                </label>
                <select
                  value={requiredPunches}
                  onChange={(e) => setRequiredPunches(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option>Multipunch</option>
                  <option>Single Punch</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Single Punch Only <span className="text-red-500">*</span>
                </label>
                <select
                  value={singlePunchOnly}
                  onChange={(e) => setSinglePunchOnly(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option>Overwrite</option>
                  <option>Ignore</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center text-blue-700 font-medium">
                  <input
                    type="checkbox"
                    checked={enableLateComing}
                    onChange={(e) => setEnableLateComing(e.target.checked)}
                    className="mr-2"
                  />
                  Enable Late Coming Setting
                </label>
              </div>

              <div className="flex items-end">
                <label className="flex items-center text-blue-700 font-medium">
                  <input
                    type="checkbox"
                    checked={allowIgnoreOvertime}
                    onChange={(e) => setAllowIgnoreOvertime(e.target.checked)}
                    className="mr-2"
                  />
                  Allow & Ignore Overtime
                </label>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="md:col-span-2 flex flex-wrap items-center gap-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deduct"
                    checked={deductFrom === "Deduct From Attendance"}
                    onChange={() => setDeductFrom("Deduct From Attendance")}
                    className="mr-2"
                  />
                  Deduct From Attendance
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deduct"
                    checked={deductFrom === "Deduct Leave Balance (CL)"}
                    onChange={() => setDeductFrom("Deduct Leave Balance (CL)")}
                    className="mr-2"
                  />
                  Deduct Leave Balance (CL)
                </label>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  No Of Late In a Month
                </label>
                <input
                  type="text"
                  value={noOfLateInMonth}
                  onChange={(e) => setNoOfLateInMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Cut Days
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option></option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <label className="block font-medium text-gray-700 w-48">
                Ignore Overtime Less then
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={ignoreOvertimeLessThan}
                  onChange={(e) => setIgnoreOvertimeLessThan(e.target.value)}
                  placeholder="--:--"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-l-md text-center"
                />
                <button className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>


          <div className="flex justify-center gap-4 pt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
