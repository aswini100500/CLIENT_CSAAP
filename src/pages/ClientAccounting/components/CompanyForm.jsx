// import { useState, useEffect } from "react";

// function CompanyForm() {
//   const [form, setForm] = useState({
//     name: "",
//     mailingName: "",
//     address: "",
//     country: "India",
//     state: "",
//     pinCode: "",
//     telephone: "",
//     mobile: "",
//     fax: "",
//     email: "",
//     website: "",
//     gstRegistered: "No",
//     gstin: "",
//     registrationType: "",
//     financialYearFrom: "",
//     booksBeginFrom: "",
//     currencySymbol: "₹",
//     currencyFormat: "1,23,456.78",
//   });

//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [companies, setCompanies] = useState([
//     { id: 1, name: "ABC Pvt Ltd", email: "info@abc.com", country: "India", state: "Maharashtra" },
//     { id: 2, name: "XYZ Enterprises", email: "contact@xyz.com", country: "India", state: "Gujarat" },
//   ]);
//   const [selectedCompanyId, setSelectedCompanyId] = useState("");
//   const [editMode, setEditMode] = useState(false);

//   // Load company data if user selects one
//   useEffect(() => {
//     if (selectedCompanyId) {
//       const company = companies.find((c) => c.id === parseInt(selectedCompanyId));
//       if (company) {
//         setForm({
//           ...form,
//           ...company,
//         });
//         setEditMode(true);
//       }
//     } else {
//       setEditMode(false);
//       resetForm();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedCompanyId]);

//   const resetForm = () => {
//     setForm({
//       name: "",
//       mailingName: "",
//       address: "",
//       country: "India",
//       state: "",
//       pinCode: "",
//       telephone: "",
//       mobile: "",
//       fax: "",
//       email: "",
//       website: "",
//       gstRegistered: "No",
//       gstin: "",
//       registrationType: "",
//       financialYearFrom: "",
//       booksBeginFrom: "",
//       currencySymbol: "₹",
//       currencyFormat: "1,23,456.78",
//     });
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm({ ...form, [name]: value });
//     if (errors[name]) {
//       setErrors({ ...errors, [name]: "" });
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!form.name.trim()) newErrors.name = "Company name is required";
//     if (!form.email.trim()) newErrors.email = "Email is required";
//     if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
//       newErrors.email = "Please enter a valid email address";
//     }
//     return newErrors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const formErrors = validateForm();
//     if (Object.keys(formErrors).length > 0) {
//       setErrors(formErrors);
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       if (editMode) {
//         alert(`Company "${form.name}" updated successfully!`);
//       } else {
//         alert(`Company "${form.name}" created successfully!`);
//         setCompanies([...companies, { id: companies.length + 1, ...form }]);
//       }
//       resetForm();
//       setSelectedCompanyId("");
//       setEditMode(false);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleGstRegisteredChange = (e) => {
//     const { value } = e.target;
//     setForm({
//       ...form,
//       gstRegistered: value,
//       ...(value === "No" && { gstin: "", registrationType: "" }),
//     });
//   };

//   const prefillFinancialDates = () => {
//     const currentYear = new Date().getFullYear();
//     setForm({
//       ...form,
//       financialYearFrom: `01-Apr-${currentYear}`,
//       booksBeginFrom: `01-Apr-${currentYear}`,
//     });
//   };

//   return (
//     <div className="min-h-screen bg-white font-[monospace]">
//       {/* Top Navigation Bar */}
//       <div className="bg-[#004c99] text-white flex items-center justify-between px-6 py-3 shadow">
//         <div className="flex items-center gap-4">
//           <span className="font-bold text-lg tracking-wide">To Edit select the Company</span>
//           <select
//             value={selectedCompanyId}
//             onChange={(e) => setSelectedCompanyId(e.target.value)}
//             className="bg-white text-black px-3 py-1 rounded text-sm border border-gray-300 focus:ring-2 focus:ring-blue-400"
//           >
//             <option value="">-- Select Company --</option>
//             {companies.map((company) => (
//               <option key={company.id} value={company.id}>
//                 {company.name}
//               </option>
//             ))}
//           </select>
//           {editMode && (
//             <span className="bg-yellow-300 text-black px-2 py-1 rounded text-xs font-semibold">
//               Edit Mode
//             </span>
//           )}
//         </div>
//         <div className="text-sm text-gray-200">
//           {editMode ? "Editing Existing Company" : "Creating New Company"}
//         </div>
//       </div>

//       {/* Main Form */}
//       <div className="max-w-5xl mx-auto bg-white mt-6 p-6 rounded-lg shadow border border-gray-300">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-semibold text-blue-800">
//             {editMode ? "Edit Company" : "Create Company"}
//           </h2>
//           <button
//             type="button"
//             onClick={resetForm}
//             className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
//           >
//             Reset Form
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Basic Info */}
//           <section className=" p-4 rounded border ">
//             <h3 className="text-md font-semibold mb-3 text-gray-800">
//               Basic Information
//             </h3>
//             <div className="space-y-3">
//               <div>
//                 <label className="block mb-1">Company Name *</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={form.name}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 p-2 rounded focus:ring-1 focus:ring-blue-500"
//                 />
//                 {errors.name && (
//                   <p className="text-red-500 text-xs mt-1">{errors.name}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block mb-1">Email *</label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={form.email}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 p-2 rounded focus:ring-1 focus:ring-blue-500"
//                 />
//                 {errors.email && (
//                   <p className="text-red-500 text-xs mt-1">{errors.email}</p>
//                 )}
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block mb-1">Country</label>
//                   <input
//                     type="text"
//                     name="country"
//                     value={form.country}
//                     onChange={handleChange}
//                     className="w-full border border-gray-300 p-2 rounded"
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-1">State</label>
//                   <input
//                     type="text"
//                     name="state"
//                     value={form.state}
//                     onChange={handleChange}
//                     className="w-full border border-gray-300 p-2 rounded"
//                   />
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* GST & Financial Info */}
//           <section className="bg-[#f0f8ff] p-4 rounded border border-blue-200">
//             <h3 className="text-md font-semibold mb-3 text-gray-800">
//               GST & Accounting Details
//             </h3>
//             <div className="space-y-3">
//               <label>Is GST Registered?</label>
//               <select
//                 name="gstRegistered"
//                 value={form.gstRegistered}
//                 onChange={handleGstRegisteredChange}
//                 className="border border-gray-300 p-2 rounded"
//               >
//                 <option value="Yes">Yes</option>
//                 <option value="No">No</option>
//               </select>

//               {form.gstRegistered === "Yes" && (
//                 <div className="flex">
//                   <label>GSTIN : </label>
//                   <input
//                     type="text"
//                     name="gstin"
//                     value={form.gstin}
//                     onChange={handleChange}
//                     className="border ml-2 border-gray-300 p-1 rounded w-40vw"
//                     maxLength="15"
//                   />
//                 </div>
//               )}
//             </div>
//           </section>

//           {/* Submit Buttons */}
//           <div className="flex justify-end gap-4 border-t pt-4">
//             <button
//               type="button"
//               className="px-5 py-2 bg-gray-200 rounded hover:bg-gray-300"
//               onClick={resetForm}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className={`px-6 py-2 rounded text-white ${
//                 isSubmitting
//                   ? "bg-blue-400 cursor-not-allowed"
//                   : "bg-blue-600 hover:bg-blue-700"
//               }`}
//             >
//               {isSubmitting
//                 ? "Saving..."
//                 : editMode
//                 ? "Update Company"
//                 : "Create Company"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default CompanyForm;


import { useState, useEffect } from "react";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

function CompanyForm() {
  const { userId, user } = useUser();
  const navigate = useNavigate();
  const { companyId } = useCompany();

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

  //  Load Selected Company Data
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

  //  Reset Form (Restores to current company data if available, else clears)
  const resetForm = () => {
    if (companyId) {
      // Reload the data from server to reset
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

  //  Handle Inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  //  GST Registered toggle
  const handleGstRegisteredChange = (e) => {
    const value = e.target.value;
    setForm({
      ...form,
      gstRegistered: value,
      ...(value === "No" ? { gstin: "", registrationType: "" } : {}),
    });
  };

  //  Validation
  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Company name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email format";

    return newErrors;
  };

  //  Submit (Update Only)
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
      //  Update
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
        <h2 className="text-xl font-bold text-red-600 mb-4">No Company Selected</h2>
        <p>Please select a company from the dashboard or login again.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-[monospace]">

      {/*  Top Navigation / Header */}
      <div className="bg-[#004c99] text-white px-6 py-3 shadow">
        <span className="font-bold text-lg tracking-wide">
          Company Profile
        </span>
      </div>

      {/*  Main Form Container */}
      <div className="max-w-5xl mx-auto bg-white mt-6 p-4 sm:p-6 rounded-lg shadow border">

        <h2 className="text-xl font-bold mb-4 text-blue-800">
          Edit Company
        </h2>

        <form onSubmit={handleSubmit}>

          {/*  Company Name */}
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

          {/*  Email */}
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

          {/* Address */}
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


          {/*  GST Registered */}
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

          {/*  GSTIN */}
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

          {/*  Submit Buttons */}
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


// import { useState, useEffect } from "react";

// function CompanyForm() {
//   const [form, setForm] = useState({
//     name: "",
//     mailingName: "",
//     address: "",
//     country: "India",
//     state: "",
//     pinCode: "",
//     telephone: "",
//     mobile: "",
//     fax: "",
//     email: "",
//     website: "",
//     gstRegistered: "No",
//     gstin: "",
//     registrationType: "",
//     financialYearFrom: "",
//     booksBeginFrom: "",
//     currencySymbol: "₹",
//     currencyFormat: "1,23,456.78",
//   });

//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [companies, setCompanies] = useState([
//     { id: 1, name: "ABC Pvt Ltd", email: "info@abc.com", country: "India", state: "Maharashtra" },
//     { id: 2, name: "XYZ Enterprises", email: "contact@xyz.com", country: "India", state: "Gujarat" },
//   ]);

//   const [selectedCompanyId, setSelectedCompanyId] = useState("");
//   const [editMode, setEditMode] = useState(false);

//   // Load data on selection
//   useEffect(() => {
//     if (selectedCompanyId) {
//       const company = companies.find((c) => c.id === parseInt(selectedCompanyId));
//       if (company) {
//         setForm({ ...form, ...company });
//         setEditMode(true);
//       }
//     } else {
//       setEditMode(false);
//       resetForm();
//     }
//   }, [selectedCompanyId]);

//   const resetForm = () => {
//     setForm({
//       name: "",
//       mailingName: "",
//       address: "",
//       country: "India",
//       state: "",
//       pinCode: "",
//       telephone: "",
//       mobile: "",
//       fax: "",
//       email: "",
//       website: "",
//       gstRegistered: "No",
//       gstin: "",
//       registrationType: "",
//       financialYearFrom: "",
//       booksBeginFrom: "",
//       currencySymbol: "₹",
//       currencyFormat: "1,23,456.78",
//     });
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm({ ...form, [name]: value });
//     if (errors[name]) setErrors({ ...errors, [name]: "" });
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!form.name.trim()) newErrors.name = "Company name is required";
//     if (!form.email.trim()) newErrors.email = "Email is required";
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
//       newErrors.email = "Enter a valid email";
//     return newErrors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formErrors = validateForm();
//     if (Object.keys(formErrors).length > 0) {
//       setErrors(formErrors);
//       return;
//     }
//     setIsSubmitting(true);

//     setTimeout(() => {
//       if (editMode) {
//         alert(`Company "${form.name}" updated successfully!`);
//       } else {
//         alert(`Company "${form.name}" created successfully!`);
//         setCompanies([...companies, { id: companies.length + 1, ...form }]);
//       }
//       resetForm();
//       setSelectedCompanyId("");
//       setEditMode(false);
//       setIsSubmitting(false);
//     }, 1000);
//   };

//   const handleGstRegisteredChange = (e) => {
//     const value = e.target.value;

//     setForm({
//       ...form,
//       gstRegistered: value,
//       ...(value === "No" ? { gstin: "", registrationType: "" } : {}),
//     });
//   };

//   return (
//     <div className="min-h-screen bg-white font-[monospace]">

//       {/*  Top Navigation Bar */}
//       <div className="bg-[#004c99] text-white flex flex-col md:flex-row md:items-center
//                       justify-between px-4 md:px-6 py-3 gap-3 shadow">

//         {/* Left side */}
//         <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
//           <span className="font-bold text-base md:text-lg tracking-wide">
//             To Edit Select the Company
//           </span>

//           <select
//             value={selectedCompanyId}
//             onChange={(e) => setSelectedCompanyId(e.target.value)}
//             className="bg-white text-black px-3 py-1 rounded text-sm border border-gray-300
//                        focus:ring-2 focus:ring-blue-400 w-full md:w-auto"
//           >
//             <option value="">-- Select Company --</option>
//             {companies.map((company) => (
//               <option key={company.id} value={company.id}>{company.name}</option>
//             ))}
//           </select>

//           {editMode && (
//             <span className="bg-yellow-300 text-black px-2 py-1 rounded text-xs font-semibold">
//               Edit Mode
//             </span>
//           )}
//         </div>

//         {/* Right side */}
//         <div className="text-xs md:text-sm text-gray-200 text-center md:text-right">
//           {editMode ? "Editing Existing Company" : "Creating New Company"}
//         </div>
//       </div>

//       {/*  Main Form Container */}
//       <div className="max-w-5xl mx-auto bg-white mt-6 p-4 sm:p-6 rounded-lg shadow border border-gray-300">

//         <div className="flex flex-col sm:flex-row items-start sm:items-center
//                         justify-between gap-3 mb-4">
//           <h2 className="text-lg sm:text-xl font-semibold text-blue-800">
//             {editMode ? "Edit Company" : "Create Company"}
//           </h2>

//           <button
//             onClick={resetForm}
//             type="button"
//             className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded
//                        hover:bg-gray-200"
//           >
//             Reset Form
//           </button>
//         </div>

//         {/*  FORM */}
//         <form onSubmit={handleSubmit} className="space-y-6">

//           {/*  Basic Information */}
//           <section className="p-4 rounded border">
//             <h3 className="text-md font-semibold mb-3">Basic Information</h3>

//             <div className="space-y-3">

//               {/* Name */}
//               <div>
//                 <label>Company Name *</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={form.name}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 p-2 rounded"
//                 />
//                 {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
//               </div>

//               {/* Email */}
//               <div>
//                 <label>Email *</label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={form.email}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 p-2 rounded"
//                 />
//                 {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
//               </div>

//               {/* Country + State */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <div>
//                   <label>Country</label>
//                   <input
//                     type="text"
//                     name="country"
//                     value={form.country}
//                     onChange={handleChange}
//                     className="w-full border border-gray-300 p-2 rounded"
//                   />
//                 </div>

//                 <div>
//                   <label>State</label>
//                   <input
//                     type="text"
//                     name="state"
//                     value={form.state}
//                     onChange={handleChange}
//                     className="w-full border border-gray-300 p-2 rounded"
//                   />
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/*  GST Section */}
//           <section className="bg-[#f0f8ff] p-4 rounded border border-blue-200">
//             <h3 className="text-md font-semibold mb-3">GST & Accounting Details</h3>

//             <div className="space-y-3">

//               <label>Is GST Registered?</label>
//               <select
//                 name="gstRegistered"
//                 value={form.gstRegistered}
//                 onChange={handleGstRegisteredChange}
//                 className="border border-gray-300 p-2 rounded w-full sm:w-48"
//               >
//                 <option value="Yes">Yes</option>
//                 <option value="No">No</option>
//               </select>

//               {/* GSTIN */}
//               {form.gstRegistered === "Yes" && (
//                 <div className="flex flex-col sm:flex-row sm:items-center gap-2">
//                   <label>GSTIN:</label>
//                   <input
//                     type="text"
//                     name="gstin"
//                     value={form.gstin}
//                     maxLength="15"
//                     onChange={handleChange}
//                     className="border border-gray-300 p-2 rounded sm:w-80 w-full"
//                   />
//                 </div>
//               )}
//             </div>
//           </section>

//           {/*  Buttons */}
//           <div className="flex flex-col sm:flex-row justify-end gap-3 border-t pt-4">

//             <button
//               type="button"
//               onClick={resetForm}
//               className="px-5 py-2 bg-gray-200 rounded hover:bg-gray-300"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className={`px-6 py-2 rounded text-white
//                 ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
//             >
//               {isSubmitting ? "Saving..." : editMode ? "Update Company" : "Create Company"}
//             </button>

//           </div>

//         </form>
//       </div>
//     </div>
//   );
// }

// export default CompanyForm;

