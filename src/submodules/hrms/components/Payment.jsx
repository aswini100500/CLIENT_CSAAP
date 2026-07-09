import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faDownload } from "@fortawesome/free-solid-svg-icons";

const Payment = () => {
  // Dummy data for payments
  const payments = [
    {
      id: 1,
      stage: "Advance",
      paid: true,
      approval: "Approved",
      downloadable: true,
    },
    {
      id: 2,
      stage: "Stage 1",
      paid: false,
      approval: "Pending",
      downloadable: false,
    },
    {
      id: 3,
      stage: "Final",
      paid: true,
      approval: "Rejected",
      downloadable: true,
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Payment Status</h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Stage</th>
              <th className="p-2 border">Paid/Unpaid</th>
              <th className="p-2 border">Approval Status</th>
              <th className="p-2 border">Download</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="text-center">
                <td className="p-2 border">{payment.id}</td>
                <td className="p-2 border">{payment.stage}</td>
                <td className="p-2 border">
                  {payment.paid ? (
                    <span className="text-green-600 font-semibold flex items-center justify-center gap-1">
                      <FontAwesomeIcon icon={faCheckCircle} /> Paid
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold flex items-center justify-center gap-1">
                      <FontAwesomeIcon icon={faTimesCircle} /> Unpaid
                    </span>
                  )}
                </td>
                <td className="p-2 border">{payment.approval}</td>
                <td className="p-2 border">
                  {payment.downloadable ? (
                    <button className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1">
                      <FontAwesomeIcon icon={faDownload} /> Download
                    </button>
                  ) : (
                    <span className="text-gray-400">Not Available</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payment;
