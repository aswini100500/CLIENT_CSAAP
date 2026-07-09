import html2canvas from "html2canvas";
import React, { useRef, useState } from "react";

export default function IDCardMaker() {
  const [name, setName] = useState("Alfredo Torres");
  const [staffId, setStaffId] = useState("1234567890");
  const [email, setEmail] = useState("hello@reallygreatsite.com");
  const [phone, setPhone] = useState("+123-456-7890");
  const [role, setRole] = useState("Staff");
  const [photoUrl, setPhotoUrl] = useState("");
  const [joinDate, setJoinDate] = useState("01-01-2024");
  const [expiryDate, setExpiryDate] = useState("31-12-2024");
  const [terms, setTerms] = useState("Enter terms & conditions here...");

  const cardRef = useRef();

  const handleDownload = () => {
    if (!cardRef.current) return;

    html2canvas(cardRef.current, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
    })
      .then((canvas) => {
        const link = document.createElement("a");
        link.download = "id-card.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      })
      .catch((err) => console.error("html2canvas error:", err));
  };

  const templateImg = "/id.png"; // Left side
  const termsImg = "/id2.png"; // Right side
  const placeholderImg = "/placeholder.png";

  return (
    <div className="p-8 flex flex-row gap-8 max-w-6xl mx-auto min-h-screen">
      {/* Left Side: ID Card Preview (Top and Bottom) */}

      {/* Right Side: Input Form (One Field per Row) */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-8 rounded-2xl shadow-xl">
        {/* Full Name */}
        <div className="flex flex-col">
          <label
            htmlFor="name"
            className="mb-1 text-sm font-semibold text-gray-900"
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Enter full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all duration-300 bg-white hover:bg-gray-50 placeholder-gray-400"
          />
        </div>

        {/* Staff ID */}
        <div className="flex flex-col">
          <label
            htmlFor="staffId"
            className="mb-1 text-sm font-semibold text-gray-900"
          >
            Staff ID
          </label>
          <input
            id="staffId"
            type="text"
            placeholder="Enter staff ID"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all duration-300 bg-white hover:bg-gray-50 placeholder-gray-400"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="mb-1 text-sm font-semibold text-gray-900"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all duration-300 bg-white hover:bg-gray-50 placeholder-gray-400"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col">
          <label
            htmlFor="phone"
            className="mb-1 text-sm font-semibold text-gray-900"
          >
            Phone
          </label>
          <input
            id="phone"
            type="text"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all duration-300 bg-white hover:bg-gray-50 placeholder-gray-400"
          />
        </div>

        {/* Role */}
        <div className="flex flex-col">
          <label
            htmlFor="role"
            className="mb-1 text-sm font-semibold text-gray-900"
          >
            Role
          </label>
          <input
            id="role"
            type="text"
            placeholder="Enter role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all duration-300 bg-white hover:bg-gray-50 placeholder-gray-400"
          />
        </div>

        {/* Profile Photo */}
        <div className="flex flex-col">
          <label
            htmlFor="photo"
            className="mb-1 text-sm font-semibold text-gray-900"
          >
            Profile Photo
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => setPhotoUrl(event.target.result);
                reader.readAsDataURL(file);
              }
            }}
            className="border border-gray-300 p-3 rounded-xl shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-100 file:text-blue-700 file:font-semibold hover:file:bg-indigo-200 transition-all duration-300 bg-white hover:bg-gray-50"
          />
        </div>

        {/* Join Date */}
        <div className="flex flex-col">
          <label
            htmlFor="joinDate"
            className="mb-1 text-sm font-semibold text-gray-900"
          >
            Join Date
          </label>
          <input
            id="joinDate"
            type="date"
            value={joinDate}
            onChange={(e) => setJoinDate(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all duration-300 bg-white hover:bg-gray-50 placeholder-gray-400"
          />
        </div>

        {/* Expiry Date */}
        <div className="flex flex-col">
          <label
            htmlFor="expiryDate"
            className="mb-1 text-sm font-semibold text-gray-900"
          >
            Expiry Date
          </label>
          <input
            id="expiryDate"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all duration-300 bg-white hover:bg-gray-50 placeholder-gray-400"
          />
        </div>

        {/* Terms & Conditions */}
        <div className="flex flex-col col-span-2">
          <label
            htmlFor="terms"
            className="mb-1 text-sm font-semibold text-gray-900"
          >
            Terms & Conditions
          </label>
          <textarea
            id="terms"
            placeholder="Enter terms & conditions"
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all duration-300 bg-white hover:bg-gray-50 placeholder-gray-400 h-32 resize-none"
          />
        </div>

        {/* Download Button */}
        <div className="col-span-2 flex justify-end">
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
          >
            Download ID Card
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8 w-1/2">
        {/* Top Image: Left Section of ID Card */}
        <div
          ref={cardRef}
          className="relative w-120 h-100 border shadow-xl flex font-sans rounded-2xl overflow-hidden gap-4 bg-white"
        >
          <div className="relative w-1/2 h-full">
            <img
              src={templateImg}
              alt="ID Template"
              className="absolute w-full h-full object-cover"
            />
            <div className="absolute top-20 left-1/2 -translate-x-1/2">
              <img
                src={photoUrl || placeholderImg}
                alt="Profile"
                className="w-20 h-20 rounded-full border-4 border-white object-cover"
              />
            </div>
            <div className="absolute top-40 w-full text-center">
              <h2 className="text-lg font-bold">{name}</h2>
              <span className="inline-block mt-1 text-black text-sm px-3 py-1 rounded">
                {role}
              </span>
            </div>
            <div className="absolute bottom-25 left-4 text-sm space-y-1">
              <p>ID No: {staffId}</p>
              <p>Email: {email}</p>
              <p>Phone: {phone}</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="relative w-1/2 h-full">
            <img
              src={termsImg}
              alt="Terms Background"
              className="absolute w-full h-full object-cover"
            />
            <div className="absolute top-65 left-6 text-sm text-black space-y-2">
              <p>
                <strong>Join Date:</strong> {joinDate}
              </p>
            </div>
            <div className="absolute top-32 left-6 right-6 text-xs text-black overflow-auto">
              <strong>Terms & Conditions:</strong>
              <p className="mt-1">{terms}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
