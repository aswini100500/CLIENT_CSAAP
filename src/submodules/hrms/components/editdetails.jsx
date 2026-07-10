import React, { useState } from "react";

const UserManager = () => {
  const [formData, setFormData] = useState({
    userType: "User",
    enrollNumber: "128000",
    name: "",
    backupNumber: "",
    finger: "0",
    enrollFace: false,
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleAction = (action) => {
    alert(`${action} executed!`);
  };

  const actionButtons = [
    "Set Time",
    "Open Door",
    "Clear Log",
    "Delete All User",
    "Upload Name",
    "Set Admin",
    "Remove Admin",
    "Delete User",
    "Download All Users",
    "Upload Selected Users",
    "Load DB",
    "Delete From DB",
    "Disable User",
    "Enable User",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="bg-linear-to-r from-blue-500 to-blue-600 text-white text-base font-semibold px-4 py-2 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">User Manager</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="bg-green-500 text-white px-2 py-0.5 rounded">
            Add
          </span>
          <span className="text-white">
            For Unique Record download and upload
          </span>
        </div>
      </div>

      <div className="bg-white rounded-b-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b border-gray-200">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Devices List:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAction("Get User List")}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  Get User List
                </button>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded border-gray-400"
                  />
                  <span className="ml-1.5 text-gray-700">
                    For Unique Record download and upload
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleAction("Export CSV")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors ml-auto"
              >
                Export User List in CSV
              </button>
            </div>

            <div className="bg-linear-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold rounded-t-md overflow-hidden">
              <div className="flex items-center px-2 py-1.5 gap-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white"
                  />
                  <span className="ml-1 whitespace-nowrap">Select All</span>
                </label>
                <input
                  type="text"
                  placeholder="Search here..."
                  className="flex-1 px-2 py-1 text-sm bg-white text-gray-800 rounded border border-gray-300 focus:outline-none"
                />
                <span className="whitespace-nowrap text-sm">
                  Result Message: 0 Record Found{" "}
                  <span className="text-green-200">RESULT : OK!</span>
                </span>
              </div>
            </div>

            <div className="bg-linear-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold">
              <div className="grid grid-cols-[80px_80px_100px_80px_100px] gap-0 px-2 py-1.5 border-b border-blue-500">
                <div>Biometric ID</div>
                <div>UserType</div>
                <div>EmpName</div>
                <div>Department</div>
                <div>Designation</div>
              </div>
            </div>

            <div className="border border-gray-300 min-h-30 bg-white flex items-center justify-center">
              <p className="text-gray-400 text-sm">No data available</p>
            </div>

            <div className="flex items-center justify-end gap-2 text-sm">
              <span className="text-gray-700 whitespace-nowrap">
                Upload Users in Multiple Devices
              </span>
              <select className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none">
                <option>Select Devices</option>
              </select>
            </div>
          </div>

          <div className="p-4 space-y-3 text-sm">
            <div className="border-b border-gray-200 pb-1">
              <h3 className="font-semibold text-gray-800 text-base">
                Remote Enroll Command
              </h3>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-gray-700 font-medium mb-0.5">
                  User Type
                </label>
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none"
                >
                  <option>User</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 font-medium mb-0.5">
                    Enroll Number
                  </label>
                  <input
                    type="text"
                    name="enrollNumber"
                    value={formData.enrollNumber}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-0.5">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 font-medium mb-0.5">
                    Backup Number
                  </label>
                  <select
                    name="finger"
                    value={formData.finger}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none"
                  >
                    <option>Finger-0</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="enrollFace"
                    checked={formData.enrollFace}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded border-gray-400 mr-1"
                  />
                  <span className="text-gray-700">Enroll Face</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleAction("Send Remote Enroll")}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-3 rounded text-sm transition-colors"
            >
              Send Remote Enroll Command to Device
            </button>

            <div className="border-t border-gray-200 pt-3">
              <p className="text-gray-600 mb-2 text-sm">
                Select Photo (Note : Photo size Less then 32 Kb, Less Then
                1280x800)
              </p>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo"
                  accept="image/*"
                />
                <label
                  htmlFor="photo"
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm cursor-pointer"
                >
                  Choose File
                </label>
                <span className="text-gray-500 text-sm">
                  {selectedFile ? selectedFile.name : "No file chosen"}
                </span>
              </div>
              <div className="flex gap-2">
                <button className="bg-green-600 text-white px-3 py-1 rounded text-sm flex-1">
                  Upload Photo
                </button>
                <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                  Upload Photos (ZIP)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1 pt-2">
              {actionButtons.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleAction(action)}
                  className="bg-green-600 hover:bg-green-700 text-white py-1 px-1 rounded text-sm text-center transition-colors whitespace-nowrap overflow-hidden"
                  title={action}
                >
                  {action}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-3 pt-3">
              <button
                onClick={() => handleAction("Clear All Admin")}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-1.5 rounded text-sm font-medium transition-colors"
              >
                Clear All Admin
              </button>
              <button
                onClick={() => handleAction("Back")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManager;
