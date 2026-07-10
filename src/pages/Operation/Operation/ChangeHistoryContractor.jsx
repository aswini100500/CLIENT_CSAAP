import React from "react";

const ChangeHistoryContractor = () => {
  const changes = [
    {
      id: 1,
      changedBy: "Amit Kumar",
      field: "Work Order Amount",
      oldValue: "₹2,00,000",
      newValue: "₹2,50,000",
      dateTime: "2025-04-10 09:45 AM",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Change History
      </h2>

      <table className="min-w-full border border-gray-200 text-sm text-left">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2 border">Changed By</th>
            <th className="px-4 py-2 border">Field</th>
            <th className="px-4 py-2 border">Old Value</th>
            <th className="px-4 py-2 border">New Value</th>
            <th className="px-4 py-2 border">Date/Time</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{c.changedBy}</td>
              <td className="px-4 py-2 border">{c.field}</td>
              <td className="px-4 py-2 border text-gray-500">{c.oldValue}</td>
              <td className="px-4 py-2 border text-blue-600">{c.newValue}</td>
              <td className="px-4 py-2 border">{c.dateTime}</td>
            </tr>
          ))}
          {changes.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center text-gray-500 py-4">
                No change history recorded
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ChangeHistoryContractor;
