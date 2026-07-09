// import React, { useState } from "react";

// const JournalVoucher = () => {
//   const [rows, setRows] = useState([
//     { particulars: "", debit: "", credit: "" },
//   ]);

//   const addRow = () => {
//     setRows([...rows, { particulars: "", debit: "", credit: "" }]);
//   };

//   const updateRow = (index, field, value) => {
//     const updated = [...rows];
//     updated[index][field] = value;
//     setRows(updated);
//   };

//   return (
//     <div className="min-h-screen bg-white p-4 font-[monospace]">

//       {/* Title */}
//       <h1 className="text-center text-xl text-blue-700 font-bold mb-4">
//         Journal Voucher
//       </h1>

//       <div className="max-w-4xl mx-auto border border-black rounded-md">

//         {/* Header */}
//         <div className="flex justify-between border-b border-black p-2 text-sm">
//           <div>Voucher Type: <span className="font-semibold">Journal</span></div>
//           <div>Date: <span className="font-semibold">{new Date().toLocaleDateString()}</span></div>
//         </div>

//         {/* Voucher Table */}
//         <div className="p-2 overflow-auto max-h-[60vh]">

//           {/* Column Titles */}
//           <div className="grid grid-cols-12 border-b border-black text-sm font-semibold">
//             <div className="col-span-6 p-1 border-r border-black">Particulars</div>
//             <div className="col-span-3 p-1 border-r border-black text-right">Debit</div>
//             <div className="col-span-3 p-1 text-right">Credit</div>
//           </div>

//           {/* Voucher Rows */}
//           {rows.map((row, index) => (
//             <div key={index} className="grid grid-cols-12 border-b border-gray-400 text-sm">

//               {/* Particulars */}
//               <input
//                 type="text"
//                 className="col-span-6 p-1 border-r border-gray-400 focus:outline-none"
//                 placeholder="Enter ledger..."
//                 value={row.particulars}
//                 onChange={(e) => updateRow(index, "particulars", e.target.value)}
//               />

//               {/* Debit */}
//               <input
//                 type="number"
//                 className="col-span-3 p-1 border-r border-gray-400 text-right focus:outline-none"
//                 placeholder="0.00"
//                 value={row.debit}
//                 onChange={(e) => updateRow(index, "debit", e.target.value)}
//               />

//               {/* Credit */}
//               <input
//                 type="number"
//                 className="col-span-3 p-1 text-right focus:outline-none"
//                 placeholder="0.00"
//                 value={row.credit}
//                 onChange={(e) => updateRow(index, "credit", e.target.value)}
//               />
//             </div>
//           ))}

//           {/* Add Row Button */}
//           <button
//             className="w-full text-left p-2 text-blue-700 hover:bg-blue-100"
//             onClick={addRow}
//           >
//             + Add Entry
//           </button>
//         </div>

//         {/* Totals */}
//         <div className="grid grid-cols-12 border-t border-black text-sm font-semibold">
//           <div className="col-span-6 p-2 border-r border-black">Total</div>
//           <div className="col-span-3 p-2 border-r border-black text-right">
//             {rows.reduce((sum, r) => sum + Number(r.debit || 0), 0).toFixed(2)}
//           </div>
//           <div className="col-span-3 p-2 text-right">
//             {rows.reduce((sum, r) => sum + Number(r.credit || 0), 0).toFixed(2)}
//           </div>
//         </div>

//       </div>

//       {/* Buttons */}
//       <div className="flex justify-center gap-6 mt-6">
//         <button className="bg-green-600 text-white px-6 py-2 rounded-sm hover:bg-green-700">
//           Yes (Save)
//         </button>
//         <button className="bg-red-600 text-white px-6 py-2 rounded-sm hover:bg-red-700">
//           No (Cancel)
//         </button>
//       </div>
//     </div>
//   );
// };

// export default JournalVoucher;


// import React, { useState } from "react";
// import axios from "axios";
// import { useCompany } from "../context/CompanyContext";

// const JournalVoucher = () => {
//   const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
//   const [narration, setNarration] = useState("");
//   const [rows, setRows] = useState([{ particulars: "", debit: "", credit: "" }]);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   const {companyId} = useCompany();

//   const addRow = () => {
//     setRows([...rows, { particulars: "", debit: "", credit: "" }]);
//   };

//   const updateRow = (index, field, value) => {
//     const updated = [...rows];
//     updated[index][field] = value;
//     setRows(updated);
//   };

//   const totalDebit = rows.reduce((sum, r) => sum + Number(r.debit || 0), 0);
//   const totalCredit = rows.reduce((sum, r) => sum + Number(r.credit || 0), 0);

//   const saveVoucher = async () => {
//     if (totalDebit !== totalCredit) {
//       setMessage("❌ Debit and Credit must be equal");
//       return;
//     }

//     if (rows.some(r => !r.particulars)) {
//       setMessage("❌ Please fill all particulars");
//       return;
//     }

//     const payload = {
//       date,
//       narration,
//       transactions: rows,
//     };

//     try {
//       setLoading(true);
//       setMessage("");

//       const res = await axios.post(
//         `http://localhost:3000/api/v1/journal-voucher/create/${companyId}`,
//         payload
//       );

//       setMessage(" Voucher Saved Successfully!");

//       // Reset fields
//       setNarration("");
//       setRows([{ particulars: "", debit: "", credit: "" }]);

//     } catch (error) {
//       console.error(error);
//       setMessage("❌ Error saving voucher");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white p-4 font-[monospace]">
//       {/* Title */}
//       <h1 className="text-center text-xl text-blue-700 font-bold mb-4">
//         Journal Voucher
//       </h1>

//       {/* Status Message */}
//       {message && (
//         <div className="text-center text-red-600 font-semibold mb-2">
//           {message}
//         </div>
//       )}

//       <div className="max-w-4xl mx-auto border border-black rounded-md">
//         {/* Header */}
//         <div className="flex justify-between border-b border-black p-2 text-sm">
//           <div>
//             Voucher Type: <span className="font-semibold">Journal</span>
//           </div>

//           {/* Editable Date */}
//           <div className="flex items-center gap-2">
//             Date:
//             <input
//               type="date"
//               className="border px-2 py-1"
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* Narration */}
//         <div className="border-b border-black p-2">
//           <input
//             type="text"
//             className="w-full p-2 border border-gray-400"
//             placeholder="Enter narration..."
//             value={narration}
//             onChange={(e) => setNarration(e.target.value)}
//           />
//         </div>

//         {/* Voucher Table */}
//         <div className="p-2 overflow-auto max-h-[60vh]">
//           {/* Column Titles */}
//           <div className="grid grid-cols-12 border-b border-black text-sm font-semibold">
//             <div className="col-span-6 p-1 border-r border-black">Particulars</div>
//             <div className="col-span-3 p-1 border-r border-black text-right">Debit</div>
//             <div className="col-span-3 p-1 text-right">Credit</div>
//           </div>

//           {/* Rows */}
//           {rows.map((row, index) => (
//             <div key={index} className="grid grid-cols-12 border-b border-gray-400 text-sm">
//               <input
//                 type="text"
//                 className="col-span-6 p-1 border-r border-gray-400 focus:outline-none"
//                 placeholder="Enter ledger..."
//                 value={row.particulars}
//                 onChange={(e) => updateRow(index, "particulars", e.target.value)}
//               />

//               <input
//                 type="number"
//                 className="col-span-3 p-1 border-r border-gray-400 text-right focus:outline-none"
//                 placeholder="0.00"
//                 value={row.debit}
//                 onChange={(e) => updateRow(index, "debit", e.target.value)}
//               />

//               <input
//                 type="number"
//                 className="col-span-3 p-1 text-right focus:outline-none"
//                 placeholder="0.00"
//                 value={row.credit}
//                 onChange={(e) => updateRow(index, "credit", e.target.value)}
//               />
//             </div>
//           ))}

//           {/* Add Row */}
//           <button
//             className="w-full text-left p-2 text-blue-700 hover:bg-blue-100"
//             onClick={addRow}
//           >
//             + Add Entry
//           </button>
//         </div>

//         {/* Totals */}
//         <div className="grid grid-cols-12 border-t border-black text-sm font-semibold">
//           <div className="col-span-6 p-2 border-r border-black">Total</div>
//           <div className="col-span-3 p-2 border-r border-black text-right">
//             {totalDebit.toFixed(2)}
//           </div>
//           <div className="col-span-3 p-2 text-right">
//             {totalCredit.toFixed(2)}
//           </div>
//         </div>
//       </div>

//       {/* Buttons */}
//       <div className="flex justify-center gap-6 mt-6">
//         <button
//           onClick={saveVoucher}
//           disabled={loading}
//           className="bg-green-600 text-white px-6 py-2 rounded-sm hover:bg-green-700 disabled:bg-gray-400"
//         >
//           {loading ? "Saving..." : "Yes (Save)"}
//         </button>

//         <button
//           className="bg-red-600 text-white px-6 py-2 rounded-sm hover:bg-red-700"
//           onClick={() => window.history.back()}
//         >
//           No (Cancel)
//         </button>
//       </div>
//     </div>
//   );
// };

// export default JournalVoucher;




import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import BulkImportButton from "./BulkImportButton";
import Swal from "sweetalert2";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import { Search, UserPlus } from "lucide-react";

// --- Internal Searchable Select Component ---
const SearchableLedgerSelect = ({ ledgers, value, onSelect, onCreateNew, disabled = false, }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedLedger = ledgers.find((l) => String(l.id) === String(value));

  useEffect(() => {
    if (selectedLedger) {
      setSearchTerm(selectedLedger.name || selectedLedger.ledgerName);
    } else {
      setSearchTerm("");
    }
  }, [selectedLedger]);

  const filtered = ledgers.filter((l) =>
    (l.name || l.ledgerName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (selectedLedger) setSearchTerm(selectedLedger.name || selectedLedger.ledgerName);
        else setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedLedger]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          disabled={disabled}
          className={`w-full rounded border border-slate-200 px-2 py-1 text-sm outline-none transition pr-8 ${disabled ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "text-slate-800 focus:border-blue-400 focus:bg-white"}`}
          placeholder="Search or add ledger..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={14} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[9999] mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((l) => (
              <div
                key={l.id}
                className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer text-slate-700 border-b border-slate-50 last:border-b-0 text-left"
                onClick={() => {
                  onSelect(l.id);
                  setSearchTerm(l.name || l.ledgerName);
                  setIsOpen(false);
                }}
              >
                {l.name || l.ledgerName}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-500 italic text-left">No matches found</div>
          )}

          <div
            className="px-3 py-2 text-sm bg-slate-50 hover:bg-blue-100 cursor-pointer text-blue-600 font-medium flex items-center gap-2 border-t border-slate-200 text-left"
            onClick={() => {
              onCreateNew(searchTerm);
              setIsOpen(false);
            }}
          >
            <UserPlus size={14} /> Add "{searchTerm || "New Ledger"}"
          </div>
        </div>
      )}
    </div>
  );
};

const JournalVoucher = () => {
  const { companyId } = useCompany();
  const { user, role: userRole } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get("mode") === "view";
  const isEditMode = !!id;

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [narration, setNarration] = useState("");
  const [rows, setRows] = useState([{ ledgerId: "", debit: "", credit: "" }]);
  const [ledgers, setLedgers] = useState([]);
  const [voucherno, setVoucherNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ⚡ Fetch Ledgers on Load
  useEffect(() => {
    if (!companyId) return;
    (async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`
        );
        console.log("Ledgers response:", res.data);
        setLedgers(res.data.data || res.data || []);

        // --- RESTORE STATE IF RETURNING FROM LEDGER CREATION ---
        const savedState = sessionStorage.getItem("journalVoucherState");
        if (savedState) {
          const state = JSON.parse(savedState);
          setVoucherNo(state.voucherno);
          setDate(state.date);
          setNarration(state.narration);
          setRows(state.rows);
          sessionStorage.removeItem("journalVoucherState");
          Swal.fire({
            title: "Welcome back!",
            text: "Your voucher progress has been restored.",
            icon: "info",
            timer: 2000,
            showConfirmButton: false
          });
        }
      } catch (error) {
        console.error(error);
        alert("Error loading ledgers");
      }
    })();
  }, [companyId]);

  // Fetch Voucher for Edit/View
  useEffect(() => {
    if (id) {
      const fetchVoucher = async () => {
        try {
          const { data } = await axios.get(
            `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/journal-voucher/${id}`
          );
          if (data && data.voucher) {
            setDate(new Date(data.voucher.date).toISOString().split("T")[0]);
            setNarration(data.voucher.narration || "");
            setVoucherNo(data.voucher.voucherNo || "");
            
            if (data.transactions && data.transactions.length > 0) {
              setRows(
                data.transactions.map((t) => ({
                  ledgerId: t.ledgerId || "",
                  debit: t.debit || "",
                  credit: t.credit || "",
                }))
              );
            }
          }
        } catch (error) {
          console.error("Error fetching voucher:", error);
          Swal.fire("Error", "Could not load the voucher", "error");
        }
      };
      fetchVoucher();
    } else if (companyId) {
      // Auto-fetch next voucher number for new voucher
      axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher-util/next/${companyId}/journal`)
        .then(res => setVoucherNo(res.data.nextNumber))
        .catch(err => console.error(err));
    }
  }, [id, companyId]);

  const addRow = () => {
    setRows([...rows, { ledgerId: "", debit: "", credit: "" }]);
  };

  const updateRow = (index, field, value) => {
    const updated = [...rows];

    // Prevent both debit & credit entry at same time
    if (field === "debit" && value) updated[index].credit = "";
    if (field === "credit" && value) updated[index].debit = "";

    updated[index][field] = value;
    setRows(updated);
  };

  const handleQuickCreateLedger = async (index, initialName) => {
    const stateToSave = {
      voucherno,
      date,
      narration,
      rows,
      editingIndex: index
    };
    sessionStorage.setItem("journalVoucherState", JSON.stringify(stateToSave));

    const userStr = sessionStorage.getItem("user");
    let role = "admin";
    if (userStr) {
      const userObj = JSON.parse(userStr);
      role = userObj.role || "admin";
    }
    const basePath = role === "employee" ? "/employee/hr/accounting/client" : "/accounting/client";
    const redirectPath = id ? `${basePath}/journalvoucher/${id}` : `${basePath}/journalvoucher`;

    navigate(`${basePath}/ledger?redirect=${redirectPath}&name=${encodeURIComponent(initialName)}`);
  };

  const totalDebit = rows.reduce((sum, r) => sum + Number(r.debit || 0), 0);
  const totalCredit = rows.reduce((sum, r) => sum + Number(r.credit || 0), 0);

  const saveVoucher = async () => {
    // if (totalDebit !== totalCredit) {
    //   setMessage("❌ Debit and Credit must be equal");
    //   return;
    // }

    if (rows.some((r) => !r.ledgerId)) {
      setMessage("❌ Please select all ledgers");
      return;
    }

    const employeeId = user?.employee_id || null;
    const role = userRole || "admin";

    const payload = {
      voucherno,
      companyId,
      voucherType: "journal",
      date,
      narration,
      transactions: rows.map((r) => ({
        ledgerId: Number(r.ledgerId) || null,
        debit: parseFloat(r.debit) || 0,
        credit: parseFloat(r.credit) || 0,
      })),
      ...(employeeId && { employee_id: employeeId }),
      role,
    };


    try {
      setLoading(true);
      setMessage("");

      if (isEditMode) {
        await axios.put(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/journal-voucher/update/${id}`,
          payload
        );
        setMessage("✔ Voucher Updated Successfully!");
      } else {
        await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/journal-voucher/create/${companyId}`,
          payload
        );
        setMessage("✔ Voucher Saved Successfully!");

        try {
          await axios.post(
            `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher/createVoucher`,
            payload
          );
        } catch (error) {
          console.log("Voucher table error:", error);
        }
      }

      if (!isEditMode) {
        setNarration("");
        setRows([{ ledgerId: "", debit: "", credit: "" }]);
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 409) {
        Swal.fire("Warning", "Voucher Number Already Exists!", "warning");
      } else {
        setMessage(isEditMode ? "❌ Error updating voucher" : "❌ Error saving voucher");
      }
    } finally {
      setLoading(false);
    }
  };


  // Bulk Import Handler
  const handleBulkImport = async (data) => {
    try {
      const grouped = {};

      data.forEach(row => {
        // Excel: VoucherNo, Date, Narration, Particulars (Ledger), Debit, Credit
        const voucherNo = row.VoucherNo || "Unknown";
        if (!grouped[voucherNo]) {
          grouped[voucherNo] = {
            voucherNo,
            date: row.Date ? new Date(row.Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            narration: row.Narration || "",
            items: []
          };
        }
        grouped[voucherNo].items.push({
          ledgerName: row.Particulars || row.LedgerName,
          debit: parseFloat(row.Debit || 0),
          credit: parseFloat(row.Credit || 0)
        });
      });

      const vouchers = Object.values(grouped).map(v => {
        const items = v.items.map(i => {
          const ledgerObj = ledgers.find(l => (l.ledgerName || l.name || "").toLowerCase() === (i.ledgerName || "").toLowerCase());
          return {
            ledgerId: ledgerObj ? ledgerObj.id : null,
            debit: i.debit,
            credit: i.credit,
            ledgerName: i.ledgerName
          };
        });

        return {
          voucherNo: v.voucherNo, // Although backend might generate auto? Backend bulk uses items.
          // Wait, Journal usually needs balanced items.
          date: v.date,
          narration: v.narration,
          items
        };
      });

      // Validations
      const missingLedgers = vouchers.flatMap(v => v.items.filter(i => !i.ledgerId).map(i => i.ledgerName));
      const uniqueMissing = [...new Set(missingLedgers)];

      if (uniqueMissing.length > 0) {
        const result = await Swal.fire({
          icon: "warning",
          title: "Ledgers Not Found",
          text: `The following Ledger Names were not found: ${uniqueMissing.join(", ")}.`,
          showCancelButton: true,
          confirmButtonText: "Create Missing Ledgers (Sundry Creditors)",
          cancelButtonText: "Cancel Import",
        });

        if (result.isConfirmed) {
          try {
            const groupRes = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group/all/${companyId}`);
            const groups = groupRes.data;
            const creditorGroup = groups.find(g => g.groupName === "Sundry Creditors");

            if (!creditorGroup) {
              Swal.fire("Error", "Sundry Creditors group not found in system.", "error");
              return;
            }

            let createdCount = 0;
            for (const name of uniqueMissing) {
              await axios.post(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/create`, {
                name: name,
                under: JSON.stringify({ name: "Sundry Creditors", id: creditorGroup.id }),
                mailingName: name,
                openingBalance: 0,
                state: "Not Applicable",
                country: "India",
                registrationType: "Regular",
                companyId
              });
              createdCount++;
            }

            Swal.fire("Success", `${createdCount} Ledgers created. Retrying import...`, "success");

            const ledgerRes = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`);
            const newLedgers = ledgerRes.data || [];
            setLedgers(newLedgers);

            vouchers.forEach(v => {
              v.items.forEach(i => {
                if (!i.ledgerId) {
                  const l = newLedgers.find(led => (led.ledgerName || led.name).toLowerCase() === (i.ledgerName || "").toLowerCase());
                  if (l) i.ledgerId = l.id;
                }
              });
            });

          } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to create ledgers automatically.", "error");
            return;
          }
        } else {
          return;
        }
      }

      // Check again
      const invalidItems = vouchers.flatMap(v => v.items.filter(i => !i.ledgerId).map(i => i.ledgerName));
      if (invalidItems.length > 0) {
        Swal.fire("Error", `Ledgers not found: ${[...new Set(invalidItems)].join(", ")}`, "error");
        return;
      }

      // Balance Check? Journal must be balanced.
      const unbalanced = vouchers.filter(v => {
        const totalDr = v.items.reduce((s, i) => s + i.debit, 0);
        const totalCr = v.items.reduce((s, i) => s + i.credit, 0);
        return Math.abs(totalDr - totalCr) > 0.01;
      });

      if (unbalanced.length > 0) {
        Swal.fire("Error", `${unbalanced.length} vouchers are not balanced (Debit != Credit).`, "error");
        return;
      }

      if (vouchers.length === 0) return;

      const res = await axios.post(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/journal-voucher/bulk-create`, {
        companyId,
        vouchers: vouchers.map(v => ({
          ...v,
          items: v.items.map(i => ({ ledgerId: i.ledgerId, debit: i.debit, credit: i.credit }))
        }))
      });

      Swal.fire("Success", res.data.message || "Bulk Import Successful", "success");
      window.location.reload();

    } catch (error) {
      console.error("Bulk Import Error", error);
      Swal.fire("Error", "Bulk Import Failed", "error");
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 font-[monospace]">
      <h1 className="text-center text-xl text-blue-700 font-bold mb-4">
        Journal Voucher
      </h1>

      {message && (
        <div className="text-center text-red-600 font-semibold mb-2">
          {message}
        </div>
      )}

      <div className="max-w-4xl mx-auto border border-black rounded-md">
        {/* Header */}
        <div className="flex justify-between border-b border-black p-2 text-sm">
          <div>
            Voucher Type: <span className="font-semibold">Journal</span>
          </div>
          <BulkImportButton onDataParsed={handleBulkImport} />
          <div className="flex items-center gap-4">
            <div>
              Voucher No:
              <input
                type="text"
                className="border px-2 py-1 ml-2 w-28 bg-transparent"
                value={voucherno}
                onChange={(e) => setVoucherNo(e.target.value)}
                placeholder="Auto"
                disabled={isViewMode}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            Date:
            <input
              type="date"
              className="border px-2 py-1 bg-transparent"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isViewMode}
            />
          </div>
        </div>

        {/* Narration */}
        <div className="border-b border-black p-2">
          <input
            type="text"
            className="w-full p-2 border border-gray-400 bg-transparent"
            placeholder="Enter narration..."
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            disabled={isViewMode}
          />
        </div>

        {/* Table */}
        <div className="p-2 overflow-visible">
          <div className="grid grid-cols-12 border-b border-black text-sm font-semibold">
            <div className="col-span-6 p-1 border-r border-black">
              Particulars
            </div>
            <div className="col-span-3 p-1 border-r border-black text-right">
              Debit
            </div>
            <div className="col-span-3 p-1 text-right">Credit</div>
          </div>

          {rows.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-12 border-b border-gray-400 text-sm relative hover:z-50 focus-within:z-50 bg-white"
            >
              {/* Ledger Select */}
              <div className="col-span-6 p-1 border-r border-gray-400">
                <SearchableLedgerSelect
                  ledgers={ledgers}
                  value={row.ledgerId}
                  onSelect={(val) => updateRow(index, "ledgerId", val)}
                  onCreateNew={(name) => handleQuickCreateLedger(index, name)}
                  disabled={isViewMode}
                />
              </div>

              {/* Debit */}
              <input
                type="number"
                className="col-span-3 p-1 border-r border-gray-400 text-right focus:outline-none bg-transparent"
                placeholder="0.00"
                value={row.debit}
                onChange={(e) => updateRow(index, "debit", e.target.value)}
                disabled={isViewMode}
              />

              {/* Credit */}
              <input
                type="number"
                className="col-span-3 p-1 text-right focus:outline-none bg-transparent"
                placeholder="0.00"
                value={row.credit}
                onChange={(e) => updateRow(index, "credit", e.target.value)}
                disabled={isViewMode}
              />
            </div>
          ))}

          {!isViewMode && (
            <button
              className="w-full text-left p-2 text-blue-700 hover:bg-blue-100"
              onClick={addRow}
            >
              + Add Entry
            </button>
          )}
        </div>

        {/* Totals */}
        <div className="grid grid-cols-12 border-t border-black text-sm font-semibold">
          <div className="col-span-6 p-2 border-r border-black">Total</div>
          <div className="col-span-3 p-2 border-r border-black text-right">
            {totalDebit.toFixed(2)}
          </div>
          <div className="col-span-3 p-2 text-right">
            {totalCredit.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-6 mt-6">
        {!isViewMode && (
          <button
            onClick={saveVoucher}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-sm hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? "Saving..." : isEditMode ? "Update" : "Yes (Save)"}
          </button>
        )}

        <button
          className="bg-red-600 text-white px-6 py-2 rounded-sm hover:bg-red-700"
          onClick={() => window.history.back()}
        >
          No (Cancel)
        </button>
      </div>
    </div>
  );
};

export default JournalVoucher;

