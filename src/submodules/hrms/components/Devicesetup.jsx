import React, { useState } from "react";

export default function Devicesetup({ setActiveMenu }) {
  const [selectedDevice, setSelectedDevice] = useState("");

  const devices = {
    "ZKTeco K20": "/ZKTeco K20.jpg",
    "EClock X5": "/EClock X5.jpg",
    "Realtime T60": "/Realtime T60.jpg",
    "Biometric F18": "/Biometric F18.jpg",
  };
  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="bg-blue-600 flex items-center justify-between px-4 py-2 shadow-sm">
        <div className="flex items-center gap-2 text-white font-medium">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span>Device Selection</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveMenu("Add details")}
            className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1 rounded transition"
          >
            Go
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1 rounded transition">
            Close
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mt-20 space-y-4">
        <label className="text-lg font-medium text-gray-800">
          Select your Device
        </label>

        <div className="relative w-64">
          <select
            className="block w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-10 text-base text-gray-700 
                       focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                       shadow-sm cursor-pointer"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
          >
            <option value="">--Select Device--</option>
            {Object.keys(devices).map((device) => (
              <option key={device} value={device}>
                {device}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
