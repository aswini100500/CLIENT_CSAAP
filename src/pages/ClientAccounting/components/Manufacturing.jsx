import { Trash, Plus } from "lucide-react";
import React, { useState, useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useCompany } from "../context/CompanyContext";
import Swal from "sweetalert2";

export default function ManufacturingJournal() {
  const { user } = useAuth();
  const { companyId } = useCompany();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.includes('/employee/hr') ? '/employee/hr/accounting/client' : '/accounting/client';
  const isEditMode = !!id;

  // Header / Product details
  const [voucherNo, setVoucherNo] = useState("1");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [productName, setProductName] = useState("");
  const [batchName, setBatchName] = useState("");
  const [mfgDate, setMfgDate] = useState("");
  const [expDate, setExpDate] = useState("");
  const [godown, setGodown] = useState("JobWork (In) Location");
  const [finishedQty, setFinishedQty] = useState();
  const [costAllocation, setCostAllocation] = useState();
  const [costTracking, setCostTracking] = useState("");
  const [components, setComponents] = useState([]);
  const [byProducts, setByProducts] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [additionalCosts, setAdditionalCosts] = useState([{ type: "", percentage: 0, amount: 0 }]);
  const [narration, setNarration] = useState("");

  // Fetch data for Edit Mode
  useEffect(() => {
    if (isEditMode) {
      const fetchJournal = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/manufacturing/get/${id}`);
          if (res.data.success) {
            const data = res.data.data;
            setVoucherNo(data.voucherNo);
            setDate(new Date(data.date).toISOString().slice(0, 10));
            setProductName(data.productName);
            setBatchName(data.batchName || "");
            setMfgDate(data.mfgDate ? new Date(data.mfgDate).toISOString().slice(0, 10) : "");
            setExpDate(data.expDate ? new Date(data.expDate).toISOString().slice(0, 10) : "");
            setGodown(data.godown);
            setNarration(data.narration || "");
            setComponents(data.components || []);
            setByProducts(data.byProducts || []);
            if (data.additionalCosts) {
              setAdditionalCosts(data.additionalCosts);
            } else if (data.addlCost) {
              setAdditionalCosts([{ type: data.addlCostType || "Additional Cost", percentage: data.addlCostPct || 0, amount: data.addlCost || 0 }]);
            }
          }
        } catch (err) {
          console.error("Error fetching journal:", err);
          Swal.fire("Error", "Failed to load journal data", "error");
        }
      };
      fetchJournal();
    }
  }, [id, isEditMode]);

  // Handlers for components
  const updateComponent = (index, field, value) => {
    const copy = [...components];
    if (field === "itemName") {
      copy[index][field] = value;
      const found = stockItems.find(s => (s.name || s.itemName || s.stockName) === value);
      if (found) {
        const rateVal = found.rate ?? found.price ?? found.purchaseRate ?? found.ratePerUnit;
        if (rateVal !== undefined) copy[index].rate = Number(rateVal) || 0;
      }
    } else if (field === "qty" || field === "rate") {
      copy[index][field] = value === "" ? "" : Number(value);
      const qty = Number(copy[index].qty) || 0;
      const rate = Number(copy[index].rate) || 0;
      const fQty = Number(finishedQty) || 0;
      copy[index].amount = +((fQty * qty) * rate).toFixed(2);
    } else {
      copy[index][field] = value;
    }
    setComponents(copy);
  };

  const addComponentRow = () => {
    setComponents([...components, { itemName: "", godown: godown, qty: 0, rate: 0, amount: 0 }]);
  };

  const removeComponentRow = (i) => {
    setComponents(components.filter((_, idx) => idx !== i));
  };

  // Handlers for byProducts
  const updateByProduct = (index, field, value) => {
    const copy = [...byProducts];
    if (field === "itemName") {
      copy[index][field] = value;
      const found = stockItems.find(s => (s.name || s.itemName || s.stockName) === value);
      if (found) {
        const rateVal = found.rate ?? found.price ?? found.purchaseRate ?? found.ratePerUnit;
        if (rateVal !== undefined) copy[index].rate = Number(rateVal) || 0;
      }
    } else if (field === "qty" || field === "rate" || field === "pctOfCost") {
      copy[index][field] = value === "" ? "" : Number(value);
      const qty = Number(copy[index].qty) || 0;
      const rate = Number(copy[index].rate) || 0;
      const fQty = Number(finishedQty) || 0;
      copy[index].amount = +((fQty * qty) * rate).toFixed(2);
    } else {
      copy[index][field] = value;
    }
    setByProducts(copy);
  };

  const addByProductRow = () => {
    setByProducts([...byProducts, { itemName: "", godown: godown, qty: 0, rate: 0, amount: 0, pctOfCost: 0 }]);
  };

  const removeByProductRow = (i) => {
    setByProducts(byProducts.filter((_, idx) => idx !== i));
  };

  // Handlers for additional costs
  const addAdditionalCostRow = () => {
    setAdditionalCosts([...additionalCosts, { type: "", percentage: 0, amount: 0 }]);
  };

  const removeAdditionalCostRow = (i) => {
    setAdditionalCosts(additionalCosts.filter((_, idx) => idx !== i));
  };

  const updateAdditionalCost = (index, field, value) => {
    const copy = [...additionalCosts];
    if (field === "percentage") {
      const pct = Number(value) || 0;
      copy[index].percentage = pct;
      copy[index].amount = +((totalCostOfComponents * pct) / 100).toFixed(2);
    } else if (field === "amount") {
      copy[index].amount = Number(value) || 0;
    } else {
      copy[index][field] = value;
    }
    setAdditionalCosts(copy);
  };

  // Fetch stock items for selection
  useEffect(() => {
    if (!companyId) return;
    const fetchStock = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_ACCOUNTING_URL || import.meta.env.VITE_API_CLIENT_URL || "http://localhost:5000";
        const res = await axios.get(`${API_BASE_URL}/api/v1/stock/getStockData/${companyId}`);
        setStockItems(res?.data?.data || []);
      } catch (err) {
        console.error('Error fetching stock items', err);
      }
    };
    fetchStock();
  }, [companyId]);

  // When finishedQty changes, update all component/byproduct amounts
  useEffect(() => {
    const fQty = Number(finishedQty) || 0;
    setComponents(prev => prev.map(c => ({
      ...c,
      amount: +((fQty * (Number(c.qty) || 0)) * (Number(c.rate) || 0)).toFixed(2)
    })));
    setByProducts(prev => prev.map(b => ({
      ...b,
      amount: +((fQty * (Number(b.qty) || 0)) * (Number(b.rate) || 0)).toFixed(2)
    })));
  }, [finishedQty]);

  // Calculations
  const totalComponents = components.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const totalByProducts = byProducts.reduce((s, b) => s + (Number(b.amount) || 0), 0);
  const totalCostOfComponents = totalComponents - totalByProducts;
  const totalAddlCost = additionalCosts.reduce((s, a) => s + (Number(a.amount) || 0), 0);
  const grandTotal = +(totalCostOfComponents + totalAddlCost).toFixed(2);
  const effectiveRatePerFinished = finishedQty ? +(grandTotal / finishedQty).toFixed(2) : 0;

  const saveManufacturing = async () => {
    try {
      const role = user?.role || "admin";
      const userId = user?.id || null;
      const employeeId = user?.employee_id || null;

      const payload = {
        voucherNo, date, productName, godown, finishedQty, costAllocation, costTracking,
        components, byProducts, additionalCosts, grandTotal, effectiveRatePerFinished, narration,
        batchName, mfgDate, expDate, role, userId, employee_id: employeeId
      };

      if (isEditMode) {
        const API_BASE_URL = import.meta.env.VITE_ACCOUNTING_URL || import.meta.env.VITE_API_CLIENT_URL || "http://localhost:5000";
        await axios.put(`${API_BASE_URL}/api/v1/manufacturing/update/${id}`, payload);
        Swal.fire("Success", "Manufacturing Journal updated successfully", "success");
        navigate(basePath + "/manfacturinglist");
      } else {
        const API_BASE_URL = import.meta.env.VITE_ACCOUNTING_URL || import.meta.env.VITE_API_CLIENT_URL || "http://localhost:5000";
        const res = await axios.post(`${API_BASE_URL}/api/v1/manufacturing/create/${companyId}`, payload);
        Swal.fire({
          icon: "success", title: "Saved Successfully", text: "Manufacturing journal saved!",
          showCancelButton: true, confirmButtonText: "Download PDF", cancelButtonText: "Close"
        }).then((result) => {
          if (result.isConfirmed) {
            window.open(`${API_BASE_URL}/api/v1/manufacturing/download-pdf/${res.data.journalId}`, "_blank");
          }
          navigate(basePath + "/manfacturinglist");
        });
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Error saving manufacturing voucher.";
      Swal.fire("Error", errorMsg, "error");
    }
  };

  return (
    <div className=" bg-slate-50 min-h-screen mt-5 p-5 font-sans text-sm">
      <div className="bg-amber-50 border rounded shadow overflow-hidden">
        <div className="bg-amber-100 px-4 py-2 text-center font-semibold">Manufacture of Materials</div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 mb-3 text-xs">
            <div>
              <div className="text-gray-600">Voucher No / Date:</div>
              <div className="flex gap-2">
                <input className="w-1/3 border px-2 py-1 rounded" value={voucherNo} onChange={(e) => setVoucherNo(e.target.value)} />
                <input className="w-2/3 border px-2 py-1 rounded" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <div>
              <div className="text-gray-600">Name of Product:</div>
              <input className="w-full border px-2 py-1 rounded" value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>
            <div>
              <div className="text-gray-600">Batch / MFG / EXP:</div>
              <div className="flex gap-1">
                <input className="w-1/3 border px-1 py-1 rounded text-[10px]" placeholder="Batch" value={batchName} onChange={(e) => setBatchName(e.target.value)} />
                <input className="w-1/3 border px-1 py-1 rounded text-[10px]" type="date" value={mfgDate} onChange={(e) => setMfgDate(e.target.value)} />
                <input className="w-1/3 border px-1 py-1 rounded text-[10px]" type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} />
              </div>
            </div>
            <div>
              <div className="text-gray-600">Godown / Qty:</div>
              <div className="flex gap-2">
                <input className="w-2/3 border px-2 py-1 rounded" value={godown} onChange={(e) => setGodown(e.target.value)} />
                <input className="w-1/3 border px-2 py-1 rounded" type="number" value={finishedQty} onChange={(e) => setFinishedQty(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
             <div>
              <div className="text-gray-600">% of Cost allocation:</div>
              <input className="w-24 border px-2 py-1 rounded" value={costAllocation} onChange={(e) => setCostAllocation(e.target.value)} />
            </div>
            <div>
              <label className="text-gray-600 mr-2">Cost Tracking:</label>
              <input className="border px-2 py-1 rounded w-48" value={costTracking} onChange={(e) => setCostTracking(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <datalist id="stock-items">
              {stockItems.map((s, idx) => <option key={idx} value={s.name || s.itemName || s.stockName} />)}
            </datalist>

            <div>
              <div className="text-sm font-semibold mb-2">Components (Consumption)</div>
              <div className="border bg-white rounded">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Item</th>
                      <th className="p-2 border">Godown</th>
                      <th className="p-2 border">Qty</th>
                      <th className="p-2 border">Rate</th>
                      <th className="p-2 border">Amount</th>
                      <th className="p-2 border"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {components.map((c, i) => (
                      <tr key={i} className="odd:bg-white even:bg-slate-50">
                        <td className="p-1 border"><input list="stock-items" className="w-full" value={c.itemName} onChange={(e) => updateComponent(i, "itemName", e.target.value)} /></td>
                        <td className="p-1 border"><input className="w-full" value={c.godown} onChange={(e) => updateComponent(i, "godown", e.target.value)} /></td>
                        <td className="p-1 border"><input className="w-20 text-right" type="number" value={c.qty} onChange={(e) => updateComponent(i, "qty", e.target.value)} /></td>
                        <td className="p-1 border"><input className="w-24 text-right" type="number" value={c.rate} onChange={(e) => updateComponent(i, "rate", e.target.value)} /></td>
                        <td className="p-1 border text-right">{Number(c.amount || 0).toFixed(2)}</td>
                        <td className="p-1 border text-center"><button onClick={() => removeComponentRow(i)}><Trash size={16} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-2 flex justify-between">
                  <div>Total Components: ₹ {Number(totalComponents).toFixed(2)}</div>
                  <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded" onClick={addComponentRow}>+ Add</button>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Co-Product / By-Product / Scrap</div>
              <div className="border bg-white rounded">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Item</th>
                      <th className="p-2 border">Godown</th>
                      <th className="p-2 border">Qty</th>
                      <th className="p-2 border">Rate</th>
                      <th className="p-2 border">Amount</th>
                      <th className="p-2 border">% Cost</th>
                      <th className="p-2 border"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {byProducts.map((b, i) => (
                      <tr key={i} className="odd:bg-white even:bg-slate-50">
                        <td className="p-1 border"><input list="stock-items" className="w-full" value={b.itemName} onChange={(e) => updateByProduct(i, "itemName", e.target.value)} /></td>
                        <td className="p-1 border"><input className="w-full" value={b.godown} onChange={(e) => updateByProduct(i, "godown", e.target.value)} /></td>
                        <td className="p-1 border"><input className="w-20 text-right" type="number" value={b.qty} onChange={(e) => updateByProduct(i, "qty", e.target.value)} /></td>
                        <td className="p-1 border"><input className="w-24 text-right" type="number" value={b.rate} onChange={(e) => updateByProduct(i, "rate", e.target.value)} /></td>
                        <td className="p-1 border text-right">{Number(b.amount || 0).toFixed(2)}</td>
                        <td className="p-1 border"><input className="w-16 text-right" type="number" value={b.pctOfCost} onChange={(e) => updateByProduct(i, "pctOfCost", e.target.value)} /></td>
                        <td className="p-1 border text-center"><button onClick={() => removeByProductRow(i)}><Trash size={16} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-2 flex justify-between">
                  <div>Total By-Products: ₹ {Number(totalByProducts).toFixed(2)}</div>
                  <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded" onClick={addByProductRow}>+ Add</button>
                </div>
              </div>
              <div className="mt-3 border rounded bg-slate-50 p-3 text-xs">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800">Cost of components:</span>
                  <span className="font-semibold text-gray-700">₹ {Number(totalCostOfComponents).toFixed(2)}</span>
                </div>
                
                <div className="grid grid-cols-12 gap-2 italic text-gray-600 mb-1 px-1">
                  <span className="col-span-7">Type of Additional Cost</span>
                  <span className="col-span-2 text-right">Percentage</span>
                  <span className="col-span-3 text-right">Amount</span>
                </div>
                
                <div className="space-y-2">
                  {additionalCosts.map((a, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-7">
                        <input 
                          type="text" 
                          className="w-full border px-2 py-1 rounded bg-white shadow-sm" 
                          placeholder="e.g. Wages, Freight"
                          value={a.type} 
                          onChange={(e) => updateAdditionalCost(i, "type", e.target.value)} 
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <input 
                          type="number" 
                          className="w-full text-right border px-1 py-1 rounded bg-white shadow-sm" 
                          value={a.percentage} 
                          onChange={(e) => updateAdditionalCost(i, "percentage", e.target.value)} 
                        />
                        <span className="text-gray-400">%</span>
                      </div>
                      <div className="col-span-3 flex items-center gap-1">
                        <input 
                          type="number" 
                          className="w-full text-right border px-1 py-1 rounded bg-white shadow-sm" 
                          value={a.amount} 
                          onChange={(e) => updateAdditionalCost(i, "amount", e.target.value)} 
                        />
                        <button onClick={() => removeAdditionalCostRow(i)} className="text-red-500 hover:text-red-700">
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-end">
                  <button 
                    onClick={addAdditionalCostRow}
                    className="flex items-center gap-1 text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition"
                  >
                    <Plus size={12} /> Add Cost
                  </button>
                </div>

                <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">Total Addl. Cost :</span>
                  <span className="font-semibold text-blue-700">₹ {Number(totalAddlCost).toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <span className="font-bold text-gray-900">Effective Cost :</span>
                  <span className="font-bold text-lg text-green-700">₹ {Number(grandTotal).toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-600">Allocation to Primary Item :</span>
                  <span className="text-gray-700 font-medium">{costAllocation || 100}%</span>
                </div>

                <div className="flex justify-between items-center mt-1 pt-1 border-t border-dashed border-gray-300">
                  <span className="text-gray-500 italic">Effective rate of Primary Item :</span>
                  <span className="text-gray-700 font-medium">₹ {Number(effectiveRatePerFinished).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-gray-600 text-xs mb-1">Narration:</div>
            <textarea className="w-full border px-2 py-1 rounded text-xs min-h-15" value={narration} onChange={(e) => setNarration(e.target.value)} />
          </div>
          <div className="mt-5 flex justify-end">
            <button className="px-4 py-2 bg-blue-600 text-white rounded font-semibold" onClick={saveManufacturing}>{isEditMode ? "Update" : "Save"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
