import React, { useRef, useState } from "react";
import domtoimage from "dom-to-image";

export default function VisitingCardMaker() {
  const [name, setName] = useState("Alfredo Torres");
  const [role, setRole] = useState("Software Engineer");
  const [company, setCompany] = useState("Acme Corp");
  const [phone, setPhone] = useState("+123-456-7890");
  const [email, setEmail] = useState("hello@reallygreatsite.com");
  const [address, setAddress] = useState("123 Main Street, New York, USA");

  const cardRef = useRef();

  const handleDownload = () => {
    if (!cardRef.current) return;

    domtoimage
      .toPng(cardRef.current, { quality: 1, bgcolor: "#ffffff" })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "visiting-card.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error("Download failed:", err));
  };

  return (
    <div className="p-8 flex flex-col md:flex-row gap-8 max-w-6xl mx-auto min-h-screen">
      {/* Card Preview */}
     

      {/* Input Form */}
      <div className="w-full md:w-1/2 grid grid-cols-1 gap-3 bg-gray-50 p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-600"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-600"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Company</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-600"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-600"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-600"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-600 h-24 resize-none"
          />
        </div>
      </div>
       <div className="flex flex-col items-center w-full md:w-1/2">
        <div
          ref={cardRef}
          className="relative w-100 h-55 rounded-2xl shadow-2xl overflow-hidden font-sans"
        >
          {/* Background image from public folder */}
          <img
            src="/visitingcard.png"
            alt="Visiting Card Background"
            className="absolute w-full h-full object-cover"
          />

          {/* Overlay for text */}
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-white p-4">
            <h2 className="text-2xl font-bold">{name}</h2>
            {/* <p className="text-sm">{role}</p> */}
            <p className="mt-2 text-sm font-semibold">{company}</p>

            {/* Divider */}

            {/* Contact Info */}
            <div className="text-xs space-y-1 text-center">
              <p>{phone}</p>
              <p>{email}</p>
              <p>{address}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
        >
          Download Visiting Card
        </button>
      </div>
    </div>
  );
}

