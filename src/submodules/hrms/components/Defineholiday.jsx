import React from "react";

const HolidayList = ({ holidays = [], setActiveMenu, onDeleteHoliday }) => {
  // Safe array access with default empty array
  const safeHolidays = holidays || [];

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          LIST OF HOLIDAY
        </h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveMenu("Add Holiday")}
            className="bg-[#ff5200] text-white px-4 py-2 rounded-md hover:bg-[#e04800] transition-colors"
          >
            Add
          </button>
          <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">
            Delete
          </button>
          <button className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors">
            Close
          </button>
        </div>

        {/* Holiday List Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 border-b text-left">Holiday Name</th>
                <th className="px-4 py-2 border-b text-left">Date</th>
                <th className="px-4 py-2 border-b text-left">Company</th>
                <th className="px-4 py-2 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeHolidays.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No holidays added yet
                  </td>
                </tr>
              ) : (
                safeHolidays.map((holiday) => (
                  <tr key={holiday.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">
                      {holiday.holidayName}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {holiday.holidayDate}
                    </td>
                    <td className="px-4 py-2 border-b">{holiday.company}</td>
                    <td className="px-4 py-2 border-b">
                      <button
                        onClick={() => onDeleteHoliday(holiday.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HolidayList;
