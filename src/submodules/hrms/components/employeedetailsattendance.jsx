import React, { useState } from "react";

const Employeedetailsattendance = () => {
  const [formData, setFormData] = useState({
    mobileAttendanceMode: "",
    name: "",
    fatherHusbandName: "",
    enrollNo: "",
    employeeCode: "",
    proximityCardNo: "",
    dateOfBirth: "",
    mobileNo: "",
    email: "",
    govtUID: "",
    gender: "",
    nationality: "",
    bankName: "",
    bankAccountNo: "",
    bankIFSCCode: "",
    telegramToken: "",
    chatID: "",
    address: "",

    companyName: "Cloudstat Pvt Ltd",
    branchName: "",
    department: "",
    designation: "",
    officeTimePolicy: "GEN",
    dateOfJoining: "2025-01-01",
    shiftStartDate: "2025-01-01",
    resignationDate: "",

    geoFencing: "",

    shiftType: "Fixed",
    firstWeeklyOff: "Sunday",
    shiftName: "GEN",
    extraAllowances: "00:00",
    secondWeeklyOffDays: "None",
    secondWDType: "None",
    secondWeeklyOff: "None",
    halfDayShift: "None",

    isAutoShift: "GEN",

    weekTimeZone1: "",
    weekTimeZone2: "0",
    weekTimeZone3: "0",
    weekTimeZone4: "0",
    validityStart: "",
    validityEnd: "",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e, type) => {};

  const handleVerifyToken = () => {
    setFormData({ ...formData, chatID: "123456789" });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          Add/Edit Employee Details
        </h1>
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            id="allowNotifications"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="allowNotifications"
            className="ml-2 text-sm font-medium text-gray-700"
          >
            Allow Notifications
          </label>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-sm text-gray-600">Auto Approved Gps Punch</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white shadow-sm border rounded-lg p-4 space-y-4">
            <div
              className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl w-32 h-32 mx-auto flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => document.getElementById("profileUpload").click()}
            >
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-16 h-16 mx-auto flex items-center justify-center text-2xl font-bold mb-2">
                  User
                </div>
                <span className="text-xs text-blue-600 font-medium">
                  Upload Photo
                </span>
              </div>
              <input
                id="profileUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, "profile")}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              Photo Size 400 X 400 | less than 40KB
            </p>
          </div>

          <div className="bg-white shadow-sm border rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Attendance Mode
            </label>
            <select
              name="mobileAttendanceMode"
              value={formData.mobileAttendanceMode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select Mode</option>
              <option>GPS Attendance</option>
              <option>WiFi Attendance</option>
              <option>Bluetooth Attendance</option>
            </select>
          </div>
        </div>

        <div className="lg:col-span-9 bg-white shadow-sm border rounded-lg p-6">
          <h3 className="text-md font-semibold text-gray-800 mb-4 border-b pb-2">
            Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Name *", name: "name" },
              { label: "Father/Husband Name", name: "fatherHusbandName" },
              { label: "Enroll No. * (Biometric ID)", name: "enrollNo" },
              { label: "Employee Code *", name: "employeeCode" },
              { label: "Proximity Card No.", name: "proximityCardNo" },
              { label: "Date of Birth", name: "dateOfBirth", type: "date" },
              { label: "Mobile No.", name: "mobileNo" },
              { label: "Email Address", name: "email", type: "email" },
              { label: "Govt. UID", name: "govtUID" },
              {
                label: "Gender",
                name: "gender",
                type: "select",
                options: ["Select Gender", "Male", "Female", "Other"],
              },
              { label: "Nationality", name: "nationality" },
              { label: "Bank Name", name: "bankName" },
              { label: "Bank A/C No.", name: "bankAccountNo" },
              { label: "Bank IFSC Code", name: "bankIFSCCode" },
              { label: "Telegram Token", name: "telegramToken" },
              { label: "ChatID", name: "chatID", readOnly: true },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {f.label}
                </label>
                {f.type === "select" ? (
                  <select
                    name={f.name}
                    value={formData[f.name]}
                    onChange={handleInputChange}
                    className="w-full px-2 py-2 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {f.options.map((op) => (
                      <option key={op}>{op}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type || "text"}
                    name={f.name}
                    value={formData[f.name]}
                    onChange={handleInputChange}
                    readOnly={f.readOnly}
                    className={`w-full px-2 py-2 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      f.readOnly ? "bg-gray-100" : ""
                    }`}
                  />
                )}
              </div>
            ))}

            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-2 py-2 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Attachment 1 (max 100KB)
              </label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 1)}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Attachment 2 (max 100KB)
              </label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 2)}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleVerifyToken}
                disabled={!formData.telegramToken}
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700  text-sm"
              >
                Verify Token & Get Chat ID
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-1">
            Company Details
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Company Name *
              </label>
              <input
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 box-border"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Branch Name *
              </label>
              <input
                name="branchName"
                value={formData.branchName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 box-border"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-1">
            Employee Details
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Dept. Name *
                </label>
                <input
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 box-border"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Designation *
                </label>
                <input
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 box-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Date Of Joining *
                </label>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 box-border"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Shift Start Date *
                </label>
                <input
                  type="date"
                  name="shiftStartDate"
                  value={formData.shiftStartDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 box-border"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Office Time Policy *
              </label>
              <input
                name="officeTimePolicy"
                value={formData.officeTimePolicy}
                onChange={handleInputChange}
                className="w-full border border-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 box-border"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Resignation Date
              </label>
              <input
                type="date"
                name="resignationDate"
                value={formData.resignationDate}
                onChange={handleInputChange}
                className="w-full border border-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 box-border"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-1">
            Branch Access for GEO Fencing
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="geoFencing"
                name="geoFencing"
                checked={formData.geoFencing === ""}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    geoFencing: e.target.checked ? "" : "",
                  });
                }}
                className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded box-border"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-1">
            Shift & Policy Details
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Shift Type *
                </label>
                <input
                  name="shiftType"
                  value={formData.shiftType}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 box-border"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  First Weekly Off
                </label>
                <input
                  name="firstWeeklyOff"
                  value={formData.firstWeeklyOff}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 box-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Shift Name *
                </label>
                <input
                  name="shiftName"
                  value={formData.shiftName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 box-border"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Extra Allowances for Tour
                </label>
                <input
                  name="extraAllowances"
                  value={formData.extraAllowances}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 box-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Second Weekly Off Days
                </label>
                <input
                  name="secondWeeklyOffDays"
                  value={formData.secondWeeklyOffDays}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 box-border"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Second WD Type
                </label>
                <input
                  name="secondWDType"
                  value={formData.secondWDType}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 box-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Second Weekly Off
                </label>
                <input
                  name="secondWeeklyOff"
                  value={formData.secondWeeklyOff}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 box-border"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Half Day Shift
                </label>
                <input
                  name="halfDayShift"
                  value={formData.halfDayShift}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 box-border"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-1">
            Is Auto Shift
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAutoShift"
                name="isAutoShift"
                checked={formData.isAutoShift === "GEN"}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    isAutoShift: e.target.checked ? "GEN" : "",
                  });
                }}
                className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded box-border"
              />
              <label
                htmlFor="isAutoShift"
                className="ml-2 text-xs text-gray-600"
              >
                GEN
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm p-4">
        <h3 className="text-md font-semibold text-gray-800 mb-2">
          Access Control Setting
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          (Note: WeekTime Zone 2, 3, 4 Only For access controller 2 Door And 4
          Door)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Week Time Zone 1", name: "weekTimeZone1" },
            { label: "Week Time Zone 2", name: "weekTimeZone2" },
            { label: "Week Time Zone 3", name: "weekTimeZone3" },
            { label: "Week Time Zone 4", name: "weekTimeZone4" },
            { label: "Validity Start*", name: "validityStart", type: "date" },
            { label: "Validity End*", name: "validityEnd", type: "date" },
          ].map((field) => (
            <div key={field.name}>
              <label className="text-xs text-gray-600">{field.label}</label>
              <input
                type={field.type || "text"}
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                className="w-full border text-sm rounded-md px-2 py-1"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default Employeedetailsattendance;
