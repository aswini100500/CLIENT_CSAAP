










    








    





    




    
































































































































































































import React,{ useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const CompanySettings = () => {
  const [company, setCompany] = useState({
    companyName: "",
    legalName: "",
    companyUrl: "",
    contactEmail: "",
    phoneNumber: "",
    foundedDate: "",
    headquarters: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    taxId: "",
    registrationNumber: "",
    legalStructure: "",
    industry: "",
    currency: "USD",
    fiscalYearStart: "January",
    timezone: "UTC",
    socialMedia: {
      linkedin: "",
      twitter: "",
      facebook: "",
    },
  });


  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_HRMS_BASE_URL}/api/company`);
        if (res.data && res.data.length > 0) {
          setCompany({
            ...res.data[0],
            headquarters: JSON.parse(res.data[0].headquarters || "{}"),
            socialMedia: JSON.parse(res.data[0].socialMedia || "{}"),
          });
        }
      } catch (error) {
        console.error("Error fetching company:", error);
      }
    };
    fetchCompany();
  }, []);

  const handleChange = (path, value) => {
    if (path.includes(".")) {
      const [parent, child] = path.split(".");
      setCompany((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setCompany((prev) => ({ ...prev, [path]: value }));
    }
  };


  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_HRMS_BASE_URL}/api/company`, company);

      if (res.data.success) {
        Swal.fire("Success", res.data.message, "success");
      } else {
        Swal.fire("Notice", res.data.message, "info");
      }
    } catch (error) {
      console.error("Error saving company:", error);
      Swal.fire("Error", "Something went wrong while saving company settings.", "error");
    }
  };

  return (
    <div className="space-y-6">

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name *</label>
            <input
              type="text"
              value={company.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Legal Name</label>
            <input
              type="text"
              value={company.legalName}
              onChange={(e) => handleChange("legalName", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Website URL</label>
            <input
              type="url"
              value={company.companyUrl}
              onChange={(e) => handleChange("companyUrl", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Email *</label>
            <input
              type="email"
              value={company.contactEmail}
              onChange={(e) => handleChange("contactEmail", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">phoneNumber *</label>
            <input
              type="tel"
              value={company.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>


      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Headquarters Address</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Street Address</label>
            <input
              type="text"
              value={company.headquarters.street}
              onChange={(e) => handleChange("headquarters.street", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              value={company.headquarters.city}
              onChange={(e) => handleChange("headquarters.city", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State/Province</label>
            <input
              type="text"
              value={company.headquarters.state}
              onChange={(e) => handleChange("headquarters.state", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <select
              value={company.headquarters.country}
              onChange={(e) => handleChange("headquarters.country", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Country</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="IN">India</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ZIP/Postal Code</label>
            <input
              type="text"
              value={company.headquarters.zipCode}
              onChange={(e) => handleChange("headquarters.zipCode", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>


      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Legal & Compliance</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tax ID / EIN</label>
            <input
              type="text"
              value={company.taxId}
              onChange={(e) => handleChange("taxId", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Registration #</label>
            <input
              type="text"
              value={company.registrationNumber}
              onChange={(e) => handleChange("registrationNumber", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Legal Structure</label>
            <select
              value={company.legalStructure}
              onChange={(e) => handleChange("legalStructure", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Structure</option>
              <option value="llc">LLC</option>
              <option value="corporation">Corporation</option>
              <option value="sole-proprietorship">Sole Proprietorship</option>
              <option value="partnership">Partnership</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Industry</label>
            <select
              value={company.industry}
              onChange={(e) => handleChange("industry", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Industry</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="education">Education</option>
              <option value="manufacturing">Manufacturing</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;

