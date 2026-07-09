import React from "react";
const PayrollSkeleton = () => {
  const skeletonRows = Array.from({ length: 5 });

  return (
    <>
      {skeletonRows.map((_, index) => (
        <tr key={index} className="animate-pulse bg-white">
          {/* Employee Info */}
          <td className="px-4 py-3 align-top">
            <div className="flex items-center gap-3">
              <div className="shrink-0 h-10 w-10 bg-gray-200 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </td>

          {/* Attendance */}
          <td className="px-4 py-3 align-top">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </td>

          {/* Earnings */}
          <td className="px-4 py-3 align-top text-right">
            <div className="space-y-2 flex flex-col items-end">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-28 mt-2"></div>
            </div>
          </td>

          {/* Deductions */}
          <td className="px-4 py-3 align-top text-right">
            <div className="space-y-2 flex flex-col items-end">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-28 mt-2"></div>
            </div>
          </td>

          {/* Net Pay */}
          <td className="px-4 py-3 align-top text-right">
            <div className="space-y-2 flex flex-col items-end">
              <div className="h-5 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-32 mt-1"></div>
            </div>
          </td>

          {/* Status */}
          <td className="px-4 py-3 align-top text-center">
            <div className="h-6 bg-gray-200 rounded-full w-24 mx-auto"></div>
          </td>

          {/* Actions */}
          <td className="px-4 py-3 align-top text-right">
            <div className="flex items-center justify-end gap-2 text-left">
              <div className="h-7 bg-gray-200 rounded w-16"></div>
              <div className="h-7 bg-gray-200 rounded w-8"></div>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default PayrollSkeleton;
