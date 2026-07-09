// import React, { useState } from "react";

// const GroupCreation = () => {
//   const [formData, setFormData] = useState({
//     groupName: "",
//     alias: "",
//     under: "",
//     nature: "",
//     subLedger: "No",
//   });

//   const handleChange = (field, value) => {
//     setFormData({ ...formData, [field]: value });
//   };

//   const handleSubmit = () => {
//     alert("✅ Group created successfully!\n" + JSON.stringify(formData, null, 2));
//   };

//   const tallyGroups = [
//     "Primary", "Bank Accounts", "Bank OCC A/c", "Bank OD A/c", "Bank of Baroda",
//     "Branch / Divisions", "Capital Account", "Cash-in-Hand", "Current Assets",
//     "Current Liabilities", "Deposits (Asset)", "Direct Expenses", "Direct Incomes",
//     "Duties & Taxes", "Expenses (Direct)", "Expenses (Indirect)", "Fixed Assets",
//     "Income (Direct)", "Income (Indirect)", "Indirect Expenses", "Indirect Incomes",
//     "Investments", "Loans & Advances (Asset)", "Loans (Liability)",
//     "Misc. Expenses (ASSET)", "Provisions", "Purchase Accounts", "Reserves & Surplus",
//     "Retained Earnings", "Sales Accounts", "Secured Loans", "Stock-in-Hand",
//     "Sundry Creditors", "Sundry Debtors",
//   ];

//   return (
//     <div className="min-h-screen w-full bg-white font-[monospace] flex justify-center px-3 py-6">
      
//       <div className="w-full max-w-3xl bg-white shadow-lg rounded-md p-6 border border-gray-300">

//         <h2 className="text-center text-lg md:text-xl text-blue-800 font-semibold mb-6">
//           Group Creation
//         </h2>

//         {/* ✅ Responsive Form Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-y-4 gap-x-4 items-center">

//           {/* Group Name */}
//           <label className="md:text-right text-gray-700">Name :</label>
//           <input
//             type="text"
//             value={formData.groupName}
//             onChange={(e) => handleChange("groupName", e.target.value)}
//             className="border border-gray-400 p-2 w-full rounded-sm text-sm focus:ring-1 focus:ring-blue-400"
//             placeholder="Enter Group Name"
//           />

//           {/* Alias */}
//           <label className="md:text-right text-gray-700">Alias :</label>
//           <input
//             type="text"
//             value={formData.alias}
//             onChange={(e) => handleChange("alias", e.target.value)}
//             className="border border-gray-400 p-2 w-full rounded-sm text-sm"
//             placeholder="Optional"
//           />

//           {/* Under */}
//           <label className="md:text-right text-gray-700">Under :</label>
//           <select
//             value={formData.under}
//             onChange={(e) => handleChange("under", e.target.value)}
//             className="border border-gray-400 p-2 w-full rounded-sm text-sm"
//           >
//             <option value="">-- Select Group --</option>
//             {tallyGroups.map((group, idx) => (
//               <option key={idx} value={group}>
//                 {group}
//               </option>
//             ))}
//           </select>

//           {/* Nature */}
//           <label className="md:text-right text-gray-700">Nature of Group :</label>
//           <select
//             value={formData.nature}
//             onChange={(e) => handleChange("nature", e.target.value)}
//             className="border border-gray-400 p-2 w-full rounded-sm text-sm"
//           >
//             <option value="">-- Select Nature --</option>
//             <option value="Assets">Assets</option>
//             <option value="Liabilities">Liabilities</option>
//             <option value="Income">Income</option>
//             <option value="Expenses">Expenses</option>
//           </select>

//           {/* Sub Ledger */}
//           <label className="md:text-right text-gray-700">
//             Behaves like a Sub-Ledger :
//           </label>
//           <select
//             value={formData.subLedger}
//             onChange={(e) => handleChange("subLedger", e.target.value)}
//             className="border border-gray-400 p-2 w-full rounded-sm text-sm"
//           >
//             <option value="No">No</option>
//             <option value="Yes">Yes</option>
//           </select>
//         </div>

//         {/* Divider */}
//         <div className="border-t border-gray-400 my-6"></div>

//         {/* Buttons */}
//         <div className="flex justify-center gap-6">
//           <button
//             onClick={handleSubmit}
//             className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-sm text-sm"
//           >
//             Yes
//           </button>

//           <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-sm text-sm">
//             No
//           </button>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default GroupCreation;


//without company Id
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useCompany } from "../context/CompanyContext";

// const GroupCreation = () => {
//   const API = "http://localhost:3000/api/v1/group";

//   const [formData, setFormData] = useState({
//     groupName: "",
//     alias: "",
//     under: "",
//     nature: "",
//     subLedger: "No",
//   });

//   const [groups, setGroups] = useState([]);
//   const [selectedId, setSelectedId] = useState("");
//   const [editMode, setEditMode] = useState(false);
//   const {companyId} = useCompany();
//   // ✅ Load all groups on mount
//   useEffect(() => {
//     fetchGroups();
//   }, []);

//   const fetchGroups = async () => {
//     const res = await axios.get(API);
//     setGroups(res.data);
//   };

//   // ✅ Load group when selected from dropdown
//   useEffect(() => {
//     if (selectedId) {
//       loadSingleGroup(selectedId);
//     } else {
//       resetForm();
//     }
//   }, [selectedId]);

//   const loadSingleGroup = async (id) => {
//     const res = await axios.get(`${API}/${id}`);
//     setFormData(res.data);
//     setEditMode(true);
//   };

//   const resetForm = () => {
//     setFormData({
//       groupName: "",
//       alias: "",
//       under: "",
//       nature: "",
//       subLedger: "No",
//     });
//     setEditMode(false);
//   };

//   const handleChange = (field, value) => {
//     setFormData({ ...formData, [field]: value });
//   };

//   // ✅ Submit → Create or Update
//   const handleSubmit = async () => {
//     try {
//       if (editMode) {
//         await axios.put(`${API}/${selectedId}`, formData);
//         alert("✅ Group updated successfully!");
//       } else {
//         await axios.post(API, formData);
//         alert("✅ Group created successfully!");
//       }

//       fetchGroups();
//       resetForm();
//       setSelectedId("");
//     } catch (err) {
//       console.log(err);
//       alert("❌ Error saving group");
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-white font-[monospace] flex justify-center px-3 py-6">

//       <div className="w-full max-w-3xl bg-white shadow-lg rounded-md p-6 border border-gray-300">

//         <h2 className="text-center text-lg md:text-xl text-blue-800 font-semibold mb-6">
//           Group Creation {editMode && "(Editing)"}
//         </h2>

//         {/* ✅ Select Existing Group to Edit */}
//         <div className="mb-6">
//           <label className="text-gray-700 font-semibold">Select Group to Edit:</label>

//           <select
//             value={selectedId}
//             onChange={(e) => setSelectedId(e.target.value)}
//             className="border border-gray-400 p-2 w-full rounded-sm text-sm mt-2"
//           >
//             <option value="">-- Create New Group --</option>
//             {groups.map((g) => (
//               <option key={g.id} value={g.id}>
//                 {g.groupName}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* ✅ Form Starts */}
//         <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-y-4 gap-x-4 items-center">

//           {/* Group Name */}
//           <label className="md:text-right text-gray-700">Name :</label>
//           <input
//             type="text"
//             value={formData.groupName}
//             onChange={(e) => handleChange("groupName", e.target.value)}
//             className="border border-gray-400 p-2 w-full rounded-sm text-sm focus:ring-1 focus:ring-blue-400"
//           />

//           {/* Alias */}
//           <label className="md:text-right text-gray-700">Alias :</label>
//           <input
//             type="text"
//             value={formData.alias}
//             onChange={(e) => handleChange("alias", e.target.value)}
//             className="border border-gray-400 p-2 w-full rounded-sm text-sm"
//           />

//           {/* Under */}
//           <label className="md:text-right text-gray-700">Under :</label>
//           <select
//             value={formData.under}
//             onChange={(e) => handleChange("under", e.target.value)}
//             className="border border-gray-400 p-2 w-full rounded-sm text-sm"
//           >
//             <option value="">-- Select Group --</option>
//             {groups.map((g) => (
//               <option key={g.id} value={g.groupName}>
//                 {g.groupName}
//               </option>
//             ))}
//           </select>

//           {/* Nature */}
//           <label className="md:text-right text-gray-700">Nature of Group :</label>
//           <select
//             value={formData.nature}
//             onChange={(e) => handleChange("nature", e.target.value)}
//             className="border border-gray-400 p-2 w-full rounded-sm text-sm"
//           >
//             <option value="">-- Select Nature --</option>
//             <option value="Assets">Assets</option>
//             <option value="Liabilities">Liabilities</option>
//             <option value="Income">Income</option>
//             <option value="Expenses">Expenses</option>
//           </select>

//           {/* Sub-Ledger */}
//           <label className="md:text-right text-gray-700">Behaves like a Sub-Ledger :</label>
//           <select
//             value={formData.subLedger}
//             onChange={(e) => handleChange("subLedger", e.target.value)}
//             className="border border-gray-400 p-2 w-full rounded-sm text-sm"
//           >
//             <option value="No">No</option>
//             <option value="Yes">Yes</option>
//           </select>
//         </div>

//         {/* Divider */}
//         <div className="border-t border-gray-400 my-6"></div>

//         {/* Buttons */}
//         <div className="flex justify-center gap-6">
//           <button
//             onClick={handleSubmit}
//             className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-sm text-sm"
//           >
//             Yes
//           </button>

//           <button
//             onClick={resetForm}
//             className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-sm text-sm"
//           >
//             No
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default GroupCreation;


import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";

const GroupCreation = () => {
  const { companyId } = useCompany();

  const API = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group`;

  const [formData, setFormData] = useState({
    groupName: "",
    alias: "",
    under: "",
    nature: "",
    subLedger: "No",
  });

  const [groups, setGroups] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [editMode, setEditMode] = useState(false);

  // ✅ Load all groups for selected company
  useEffect(() => {
    if (companyId) fetchGroups();
  }, [companyId]);

  const fetchGroups = async () => {
    const res = await axios.get(`${API}/all/${companyId}`);
    setGroups(res.data);
  };
console.log(groups);

  // ✅ Load group when selected from dropdown
  useEffect(() => {
    if (selectedId) {
      loadSingleGroup(selectedId);
    } else {
      resetForm();
    }
  }, [selectedId]);

  const loadSingleGroup = async (id) => {
    const res = await axios.get(`${API}/${companyId}/${id}`);
    setFormData(res.data);
    setEditMode(true);
  };

  const resetForm = () => {
    setFormData({
      groupName: "",
      alias: "",
      under: "",
      nature: "",
      subLedger: "No",
    });
    setEditMode(false);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // ✅ Submit → Create or Update (with companyId)
  const handleSubmit = async () => {
    try {
      if (!companyId) {
        alert("❌ No company selected!");
        return;
      }

      if (editMode) {
        await axios.put(`${API}/${companyId}/${selectedId}`, formData);
        alert("✅ Group updated successfully!");
      } else {
        await axios.post(`${API}/${companyId}`, formData);
        alert("✅ Group created successfully!");
      }

      fetchGroups();
      resetForm();
      setSelectedId("");
    } catch (err) {
      console.log(err);
      alert("❌ Error saving group");
    }
  };

  return (
    <div className="min-h-screen w-full bg-white font-[monospace] flex justify-center px-3 py-6">

      <div className="w-full max-w-3xl bg-white shadow-lg rounded-md p-6 border border-gray-300">

        <h2 className="text-center text-lg md:text-xl text-blue-800 font-semibold mb-6">
          Group Creation {editMode && "(Editing)"}
        </h2>

        {/* ✅ Select Existing Group to Edit */}
        {/* <div className="mb-6">
          <label className="text-gray-700 font-semibold">Select Group to Edit:</label>

          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="border border-gray-400 p-2 w-full rounded-sm text-sm mt-2"
          >
            <option value="">-- Create New Group --</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.groupName}
              </option>
            ))}
          </select>
        </div> */}

        {/* ✅ Form Starts */}
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-y-4 gap-x-4 items-center">

          {/* Group Name */}
          <label className="md:text-right text-gray-700">Name :</label>
          <input
            type="text"
            value={formData.groupName}
            onChange={(e) => handleChange("groupName", e.target.value)}
            className="border border-gray-400 p-2 w-full rounded-sm text-sm focus:ring-1 focus:ring-blue-400"
          />

          {/* Alias */}
          <label className="md:text-right text-gray-700">Alias :</label>
          <input
            type="text"
            value={formData.alias}
            onChange={(e) => handleChange("alias", e.target.value)}
            className="border border-gray-400 p-2 w-full rounded-sm text-sm"
          />

          {/* Under */}
          {/* <label className="md:text-right text-gray-700">Under :</label>
          <select
            value={formData.under}
            onChange={(e) => handleChange("under", e.target.value)}
            className="border border-gray-400 p-2 w-full rounded-sm text-sm"
          >
            <option value="">-- Select Group --</option>
            {groups.map((g) => (
              <option key={g.id} value={g.groupName}>
                {g.groupName}
              </option>
            ))}
          </select> */}

          {/* Nature */}
          <label className="md:text-right text-gray-700">Nature of Group :</label>
          <select
            value={formData.nature}
            onChange={(e) => handleChange("nature", e.target.value)}
            className="border border-gray-400 p-2 w-full rounded-sm text-sm"
          >
            <option value="">-- Select Nature --</option>
            <option value="Assets">Assets</option>
            <option value="Liabilities">Liabilities</option>
            <option value="Income">Income</option>
            <option value="Expenses">Expenses</option>
          </select>

          {/* Sub-Ledger */}
          <label className="md:text-right text-gray-700">Behaves like a Sub-Ledger :</label>
          <select
            value={formData.subLedger}
            onChange={(e) => handleChange("subLedger", e.target.value)}
            className="border border-gray-400 p-2 w-full rounded-sm text-sm"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        <div className="border-t border-gray-400 my-6"></div>

        <div className="flex justify-center gap-6">
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-sm text-sm"
          >
            Yes
          </button>

          <button
            onClick={resetForm}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-sm text-sm"
          >
            No
          </button>
        </div>

      </div>
    </div>
  );
};

export default GroupCreation;
