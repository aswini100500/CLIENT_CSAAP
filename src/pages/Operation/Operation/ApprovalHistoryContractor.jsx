import React from "react";

const ApprovalHistoryContractor = () => {
  const approvals = [
    {
      id: 1,
      approvedBy: "John Doe",
      profile: "Manager",
      action: "Approved",
      status: "Completed",
      dateTime: "2025-02-15 10:30 AM",
      remarks: "Verified successfully",
      createdBy: "System Admin",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Approval History
      </h2>

      <table className="min-w-full border border-gray-200 text-sm text-left">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2 border">Approved By</th>
            <th className="px-4 py-2 border">Profile</th>
            <th className="px-4 py-2 border">Action</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Date/Time</th>
            <th className="px-4 py-2 border">Remarks</th>
            <th className="px-4 py-2 border">Created By</th>
          </tr>
        </thead>
        <tbody>
          {approvals.map((a) => (
            <tr key={a.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{a.approvedBy}</td>
              <td className="px-4 py-2 border">{a.profile}</td>
              <td className="px-4 py-2 border text-green-700">{a.action}</td>
              <td className="px-4 py-2 border">{a.status}</td>
              <td className="px-4 py-2 border">{a.dateTime}</td>
              <td className="px-4 py-2 border">{a.remarks}</td>
              <td className="px-4 py-2 border">{a.createdBy}</td>
            </tr>
          ))}
          {approvals.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center text-gray-500 py-4">
                No approval history available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ApprovalHistoryContractor;
