import React from "react";

import { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

function CompanyForm() {
  const { userId, user } = useUser();
  const navigate = useNavigate();
  const { companyId } = useAuth();

  useEffect(() => {
    if (!userId || !user) {
      navigate("/login");
    }
  }, [userId, user, navigate]);

  const API = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/company`;

  const [form, setForm] = useState({
    name: "",
    mailingName: "",
    address: "",
    country: "India",
    state: "",
    pinCode: "",
    telephone: "",
    mobile: "",
    fax: "",
    email: "",
    website: "",
    gstRegistered: "No",
    gstin: "",
    registrationType: "",
    financialYearFrom: "",
    booksBeginFrom: "",
    currencySymbol: "₹",
    currencyFormat: "1,23,456.78",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (companyId) {
      setIsLoading(true);
      axios
        .get(`${API}/${companyId}`)
        .then((res) => {
          setForm((prev) => ({ ...prev, ...res.data }));
        })
        .catch((err) => {
          console.error("Error fetching company details:", err);
          alert("Failed to load company details.");
        })
        .finally(() => setIsLoading(false));
    }
  }, [companyId, API]);

  const resetForm = () => {
    if (companyId) {
      axios.get(`${API}/${companyId}`).then((res) => {
        setForm((prev) => ({ ...prev, ...res.data }));
      });
    } else {
      setForm({
        name: "",
        mailingName: "",
        address: "",
        country: "India",
        state: "",
        pinCode: "",
        telephone: "",
        mobile: "",
        fax: "",
        email: "",
        website: "",
        gstRegistered: "No",
        gstin: "",
        registrationType: "",
        financialYearFrom: "",
        booksBeginFrom: "",
        currencySymbol: "₹",
        currencyFormat: "1,23,456.78",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleGstRegisteredChange = (e) => {
    const value = e.target.value;
    setForm({
      ...form,
      gstRegistered: value,
      ...(value === "No" ? { gstin: "", registrationType: "" } : {}),
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Company name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email format";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyId) {
      alert("No company selected for update.");
      return;
    }

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.put(`${API}/${companyId}`, form);
      alert(res.data.message || "Company updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Something went wrong while updating the company.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center">Loading company details...</div>;
  }

  if (!companyId) {
    return (
      <div className="min-h-screen bg-white font-[monospace] p-10 flex flex-col items-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          No Company Selected
        </h2>
        <p>Please select a company from the dashboard or login again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-[monospace]">
      <div className="bg-[#004c99] text-white px-6 py-3 shadow">
        <span className="font-bold text-lg tracking-wide">Company Profile</span>
      </div>

      <div className="max-w-5xl mx-auto bg-white mt-6 p-4 sm:p-6 rounded-lg shadow border">
        <h2 className="text-xl font-bold mb-4 text-blue-800">Edit Company</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="font-semibold block mb-1">Company Name*</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="mb-3">
            <label className="font-semibold block mb-1">Email*</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-3">
            <label className="font-semibold block mb-1">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="font-semibold block mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">State</label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="font-semibold block mb-1">GST Registered</label>
            <select
              name="gstRegistered"
              value={form.gstRegistered}
              onChange={handleGstRegisteredChange}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {form.gstRegistered === "Yes" && (
            <div className="mb-3">
              <label className="font-semibold block mb-1">GSTIN</label>
              <input
                type="text"
                name="gstin"
                value={form.gstin}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Reset Changes
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isSubmitting ? "Updating..." : "Update Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompanyForm;
