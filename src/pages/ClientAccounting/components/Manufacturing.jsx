import React from "react";
import axios from "axios";
import {
  ArrowLeft,
  Factory,
  FileText,
  Package,
  Plus,
  RotateCcw,
  Save,
  Trash,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";

export default function ManufacturingJournal() {
  const { user, companyId } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.includes("/employee/hr")
    ? "/employee/hr/accounting/client"
    : "/accounting/client";
  const isEditMode = !!id;

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
  const [additionalCosts, setAdditionalCosts] = useState([
    { type: "", percentage: 0, amount: 0 },
  ]);
  const [narration, setNarration] = useState("");

  useEffect(() => {
    if (isEditMode) {
      const fetchJournal = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/manufacturing/get/${id}`,
          );
          if (res.data.success) {
            const data = res.data.data;
            setVoucherNo(data.voucherNo);
            setDate(new Date(data.date).toISOString().slice(0, 10));
            setProductName(data.productName);
            setBatchName(data.batchName || "");
            setMfgDate(
              data.mfgDate
                ? new Date(data.mfgDate).toISOString().slice(0, 10)
                : "",
            );
            setExpDate(
              data.expDate
                ? new Date(data.expDate).toISOString().slice(0, 10)
                : "",
            );
            setGodown(data.godown);
            setNarration(data.narration || "");
            setComponents(data.components || []);
            setByProducts(data.byProducts || []);
            if (data.additionalCosts) {
              setAdditionalCosts(data.additionalCosts);
            } else if (data.addlCost) {
              setAdditionalCosts([
                {
                  type: data.addlCostType || "Additional Cost",
                  percentage: data.addlCostPct || 0,
                  amount: data.addlCost || 0,
                },
              ]);
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

  const updateComponent = (index, field, value) => {
    const copy = [...components];
    if (field === "itemName") {
      copy[index][field] = value;
      const found = stockItems.find(
        (s) => (s.name || s.itemName || s.stockName) === value,
      );
      if (found) {
        const rateVal =
          found.rate ?? found.price ?? found.purchaseRate ?? found.ratePerUnit;
        if (rateVal !== undefined) copy[index].rate = Number(rateVal) || 0;
      }
    } else if (field === "qty" || field === "rate") {
      copy[index][field] = value === "" ? "" : Number(value);
      const qty = Number(copy[index].qty) || 0;
      const rate = Number(copy[index].rate) || 0;
      const fQty = Number(finishedQty) || 0;
      copy[index].amount = +(fQty * qty * rate).toFixed(2);
    } else {
      copy[index][field] = value;
    }
    setComponents(copy);
  };

  const addComponentRow = () => {
    setComponents([
      ...components,
      { itemName: "", godown: godown, qty: 0, rate: 0, amount: 0 },
    ]);
  };

  const removeComponentRow = (i) => {
    setComponents(components.filter((_, idx) => idx !== i));
  };

  const updateByProduct = (index, field, value) => {
    const copy = [...byProducts];
    if (field === "itemName") {
      copy[index][field] = value;
      const found = stockItems.find(
        (s) => (s.name || s.itemName || s.stockName) === value,
      );
      if (found) {
        const rateVal =
          found.rate ?? found.price ?? found.purchaseRate ?? found.ratePerUnit;
        if (rateVal !== undefined) copy[index].rate = Number(rateVal) || 0;
      }
    } else if (field === "qty" || field === "rate" || field === "pctOfCost") {
      copy[index][field] = value === "" ? "" : Number(value);
      const qty = Number(copy[index].qty) || 0;
      const rate = Number(copy[index].rate) || 0;
      const fQty = Number(finishedQty) || 0;
      copy[index].amount = +(fQty * qty * rate).toFixed(2);
    } else {
      copy[index][field] = value;
    }
    setByProducts(copy);
  };

  const addByProductRow = () => {
    setByProducts([
      ...byProducts,
      {
        itemName: "",
        godown: godown,
        qty: 0,
        rate: 0,
        amount: 0,
        pctOfCost: 0,
      },
    ]);
  };

  const removeByProductRow = (i) => {
    setByProducts(byProducts.filter((_, idx) => idx !== i));
  };

  const addAdditionalCostRow = () => {
    setAdditionalCosts([
      ...additionalCosts,
      { type: "", percentage: 0, amount: 0 },
    ]);
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

  useEffect(() => {
    if (!companyId) return;
    const fetchStock = async () => {
      try {
        const API_BASE_URL =
          import.meta.env.VITE_ACCOUNTING_URL ||
          import.meta.env.VITE_API_CLIENT_URL ||
          "http://localhost:5000";
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/stock/getStockData/${companyId}`,
        );
        setStockItems(res?.data?.data || []);
      } catch (err) {
        console.error("Error fetching stock items", err);
      }
    };
    fetchStock();
  }, [companyId]);

  useEffect(() => {
    const fQty = Number(finishedQty) || 0;
    setComponents((prev) =>
      prev.map((c) => ({
        ...c,
        amount: +(fQty * (Number(c.qty) || 0) * (Number(c.rate) || 0)).toFixed(
          2,
        ),
      })),
    );
    setByProducts((prev) =>
      prev.map((b) => ({
        ...b,
        amount: +(fQty * (Number(b.qty) || 0) * (Number(b.rate) || 0)).toFixed(
          2,
        ),
      })),
    );
  }, [finishedQty]);

  const totalComponents = components.reduce(
    (s, c) => s + (Number(c.amount) || 0),
    0,
  );
  const totalByProducts = byProducts.reduce(
    (s, b) => s + (Number(b.amount) || 0),
    0,
  );
  const totalCostOfComponents = totalComponents - totalByProducts;
  const totalAddlCost = additionalCosts.reduce(
    (s, a) => s + (Number(a.amount) || 0),
    0,
  );
  const grandTotal = +(totalCostOfComponents + totalAddlCost).toFixed(2);
  const effectiveRatePerFinished = finishedQty
    ? +(grandTotal / finishedQty).toFixed(2)
    : 0;

  const resetForm = () => {
    setProductName("");
    setBatchName("");
    setMfgDate("");
    setExpDate("");
    setFinishedQty("");
    setCostAllocation("");
    setCostTracking("");
    setComponents([]);
    setByProducts([]);
    setAdditionalCosts([{ type: "", percentage: 0, amount: 0 }]);
    setNarration("");
  };

  const saveManufacturing = async () => {
    try {
      const role = user?.role || "admin";
      const userId = user?.id || null;
      const employeeId = user?.employee_id || null;

      const payload = {
        voucherNo,
        date,
        productName,
        godown,
        finishedQty,
        costAllocation,
        costTracking,
        components,
        byProducts,
        additionalCosts,
        grandTotal,
        effectiveRatePerFinished,
        narration,
        batchName,
        mfgDate,
        expDate,
        role,
        userId,
        employee_id: employeeId,
      };

      const API_BASE_URL =
        import.meta.env.VITE_ACCOUNTING_URL ||
        import.meta.env.VITE_API_CLIENT_URL ||
        "http://localhost:5000";

      if (isEditMode) {
        await axios.put(
          `${API_BASE_URL}/api/v1/manufacturing/update/${id}`,
          payload,
        );
        Swal.fire({
          icon: "success",
          title: "Manufacturing Journal Updated Successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(listPath);
        return;
      }

      const res = await axios.post(
        `${API_BASE_URL}/api/v1/manufacturing/create/${companyId}`,
        payload,
      );

      const journalId = res.data?.journalId || res.data?.id;

      const result = await Swal.fire({
        icon: "success",
        title: "Manufacturing Journal Created Successfully",
        text: "The manufacturing journal has been saved. What would you like to do next?",
        showCancelButton: true,
        showDenyButton: !!journalId,
        confirmButtonColor: "#00a651",
        cancelButtonColor: "#6b7280",
        denyButtonColor: "#2563eb",
        confirmButtonText: "Create Another",
        cancelButtonText: "Go to Manufacturing List",
        denyButtonText: "Download PDF",
      });

      if (result.isDenied && journalId) {
        window.open(
          `${API_BASE_URL}/api/v1/manufacturing/download-pdf/${journalId}`,
          "_blank",
        );
        const followUp = await Swal.fire({
          icon: "info",
          title: "What's Next?",
          text: "Would you like to create another manufacturing journal or go to the list?",
          showCancelButton: true,
          confirmButtonColor: "#00a651",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Create Another",
          cancelButtonText: "Go to Manufacturing List",
        });
        if (!followUp.isConfirmed) {
          navigate(listPath);
          return;
        }
      } else if (!result.isConfirmed) {
        navigate(listPath);
        return;
      }

      resetForm();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.error || "Error saving manufacturing voucher.";
      Swal.fire("Error", errorMsg, "error");
    }
  };

  const inputClass =
    "app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium";

  const tableInputClass =
    "w-full border border-[#c8ddcd] bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] rounded-xl font-semibold py-2.25 px-3 text-xs outline-none transition-all";

  const listPath = basePath + "/manfacturinglist";

  return (
    <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans">
      <div className="max-w-6xl mx-auto bg-white app-panel border border-[#e2f2e9]/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex justify-between items-center border-b border-[#e2f2e9] pb-5 mb-8">
          <div className="flex items-center gap-3">
            <h2 className="app-title text-xl font-extrabold text-[#042f2e]">
              {isEditMode
                ? "Manufacturing Journal Alteration"
                : "Manufacture of Materials"}
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f0fdf4] text-[#00a651] border border-[#c6f1d6]">
              MFG
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate(listPath)}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors text-sm font-medium cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Manufacturing List
          </button>
        </div>

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider mb-4 border-b border-[#cbe0d2] pb-1.5 flex items-center gap-2">
            <Factory size={16} className="text-[#00a651]" /> Production &
            Voucher Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Voucher No :
              </label>
              <input
                className={inputClass}
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
              />
            </div>
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Date :
              </label>
              <input
                className={inputClass}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Name of Product :
              </label>
              <input
                className={inputClass}
                placeholder="Target manufactured item"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Batch Name :
              </label>
              <input
                className={inputClass}
                placeholder="Batch ID"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
            </div>
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                MFG Date :
              </label>
              <input
                className={inputClass}
                type="date"
                value={mfgDate}
                onChange={(e) => setMfgDate(e.target.value)}
              />
            </div>
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                EXP Date :
              </label>
              <input
                className={inputClass}
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
              />
            </div>
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Godown Location :
              </label>
              <input
                className={inputClass}
                value={godown}
                onChange={(e) => setGodown(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Finished Quantity :
              </label>
              <input
                className={inputClass}
                type="number"
                placeholder="Qty"
                value={finishedQty}
                onChange={(e) => setFinishedQty(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                % of Cost Allocation :
              </label>
              <input
                className={inputClass}
                placeholder="100"
                value={costAllocation}
                onChange={(e) => setCostAllocation(e.target.value)}
              />
            </div>
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Cost Tracking :
              </label>
              <input
                className={inputClass}
                placeholder="Cost track code"
                value={costTracking}
                onChange={(e) => setCostTracking(e.target.value)}
              />
            </div>
          </div>
        </div>

        <datalist id="stock-items">
          {stockItems.map((s, idx) => (
            <option key={idx} value={s.name || s.itemName || s.stockName} />
          ))}
        </datalist>

        <div className="space-y-6 mb-6">
          <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)]">
            <div className="flex justify-between items-center mb-4 border-b border-[#cbe0d2] pb-1.5">
              <h3 className="text-xs font-bold text-[#042f2e] uppercase tracking-wider flex items-center gap-2">
                <Package size={14} className="text-[#00a651]" /> Components
                (Consumption)
              </h3>
              <button
                type="button"
                className="flex items-center gap-1 text-xs font-bold text-[#00a651] bg-white border border-[#cbe0d2] px-3 py-1.5 rounded-lg hover:bg-[#f0fdf4] transition-colors cursor-pointer"
                onClick={addComponentRow}
              >
                <Plus size={14} /> Add Component
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#cbe0d2] bg-white mb-3">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f0fdf4] border-b border-[#cbe0d2]">
                    <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase text-[#042f2e]">
                      Item Description
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase text-[#042f2e] w-48">
                      Godown
                    </th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-extrabold uppercase text-[#042f2e] w-28">
                      Qty
                    </th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-extrabold uppercase text-[#042f2e] w-32">
                      Rate (₹)
                    </th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-extrabold uppercase text-[#042f2e] w-36">
                      Amount (₹)
                    </th>
                    <th className="px-2 py-2.5 text-center text-[11px] font-extrabold uppercase text-[#042f2e] w-14">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2f2e9]">
                  {components.map((c, i) => (
                    <tr
                      key={i}
                      className="hover:bg-[#f8faf8] transition-colors"
                    >
                      <td className="p-2">
                        <input
                          list="stock-items"
                          className={tableInputClass}
                          placeholder="Select / type item..."
                          value={c.itemName}
                          onChange={(e) =>
                            updateComponent(i, "itemName", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className={tableInputClass}
                          placeholder="Godown"
                          value={c.godown}
                          onChange={(e) =>
                            updateComponent(i, "godown", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className={`${tableInputClass} text-right`}
                          value={c.qty}
                          onChange={(e) =>
                            updateComponent(i, "qty", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className={`${tableInputClass} text-right`}
                          value={c.rate}
                          onChange={(e) =>
                            updateComponent(i, "rate", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2 text-right font-bold text-slate-800">
                        ₹ {Number(c.amount || 0).toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeComponentRow(i)}
                          className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Remove row"
                        >
                          <Trash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs font-bold text-slate-800">
              <span>Total Components:</span>
              <span className="text-[#00a651] text-sm">
                ₹ {Number(totalComponents).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)]">
            <div className="flex justify-between items-center mb-4 border-b border-[#cbe0d2] pb-1.5">
              <h3 className="text-xs font-bold text-[#042f2e] uppercase tracking-wider flex items-center gap-2">
                <Package size={14} className="text-[#00a651]" /> Co-Product /
                By-Product / Scrap
              </h3>
              <button
                type="button"
                className="flex items-center gap-1 text-xs font-bold text-[#00a651] bg-white border border-[#cbe0d2] px-3 py-1.5 rounded-lg hover:bg-[#f0fdf4] transition-colors cursor-pointer"
                onClick={addByProductRow}
              >
                <Plus size={14} /> Add By-Product
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#cbe0d2] bg-white mb-3">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f0fdf4] border-b border-[#cbe0d2]">
                    <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase text-[#042f2e]">
                      Item Description
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase text-[#042f2e] w-44">
                      Godown
                    </th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-extrabold uppercase text-[#042f2e] w-24">
                      Qty
                    </th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-extrabold uppercase text-[#042f2e] w-28">
                      Rate (₹)
                    </th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-extrabold uppercase text-[#042f2e] w-32">
                      Amount (₹)
                    </th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-extrabold uppercase text-[#042f2e] w-24">
                      % Cost
                    </th>
                    <th className="px-2 py-2.5 text-center text-[11px] font-extrabold uppercase text-[#042f2e] w-14">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2f2e9]">
                  {byProducts.map((b, i) => (
                    <tr
                      key={i}
                      className="hover:bg-[#f8faf8] transition-colors"
                    >
                      <td className="p-2">
                        <input
                          list="stock-items"
                          className={tableInputClass}
                          placeholder="Select / type item..."
                          value={b.itemName}
                          onChange={(e) =>
                            updateByProduct(i, "itemName", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className={tableInputClass}
                          placeholder="Godown"
                          value={b.godown}
                          onChange={(e) =>
                            updateByProduct(i, "godown", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className={`${tableInputClass} text-right`}
                          value={b.qty}
                          onChange={(e) =>
                            updateByProduct(i, "qty", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className={`${tableInputClass} text-right`}
                          value={b.rate}
                          onChange={(e) =>
                            updateByProduct(i, "rate", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2 text-right font-bold text-slate-800">
                        ₹ {Number(b.amount || 0).toFixed(2)}
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className={`${tableInputClass} text-right`}
                          value={b.pctOfCost}
                          onChange={(e) =>
                            updateByProduct(i, "pctOfCost", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeByProductRow(i)}
                          className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Remove row"
                        >
                          <Trash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs font-bold text-slate-800">
              <span>Total By-Products:</span>
              <span className="text-[#00a651] text-sm">
                ₹ {Number(totalByProducts).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider mb-4 border-b border-[#cbe0d2] pb-1.5 flex items-center gap-2">
            <FileText size={16} className="text-[#00a651]" /> Additional Costs &
            Production Valuation
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-700">
                  Type of Additional Cost
                </span>
                <button
                  type="button"
                  onClick={addAdditionalCostRow}
                  className="flex items-center gap-1 text-xs font-bold text-[#00a651] bg-white border border-[#cbe0d2] px-3 py-1 rounded-lg hover:bg-[#f0fdf4] transition-colors cursor-pointer"
                >
                  <Plus size={12} /> Add Cost Item
                </button>
              </div>

              <div className="space-y-3 mb-4">
                {additionalCosts.map((a, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-3 items-center bg-white p-2.5 rounded-xl border border-[#cbe0d2]"
                  >
                    <div className="col-span-6">
                      <input
                        type="text"
                        className={tableInputClass}
                        placeholder="e.g. Labour, Freight, Electricity"
                        value={a.type}
                        onChange={(e) =>
                          updateAdditionalCost(i, "type", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-3 flex items-center gap-1">
                      <input
                        type="number"
                        className={`${tableInputClass} text-right`}
                        value={a.percentage}
                        onChange={(e) =>
                          updateAdditionalCost(i, "percentage", e.target.value)
                        }
                      />
                      <span className="text-xs font-bold text-slate-500">
                        %
                      </span>
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <input
                        type="number"
                        className={`${tableInputClass} text-right font-bold text-slate-800`}
                        value={a.amount}
                        onChange={(e) =>
                          updateAdditionalCost(i, "amount", e.target.value)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalCostRow(i)}
                        className="text-rose-500 hover:bg-rose-50 p-1 rounded cursor-pointer"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#cbe0d2] rounded-xl p-5 shadow-xs text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-[#e2f2e9]">
                <span className="text-slate-600">Cost of Components :</span>
                <span className="font-bold text-slate-800">
                  ₹ {Number(totalCostOfComponents).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#e2f2e9]">
                <span className="text-slate-600">Total Additional Cost :</span>
                <span className="font-bold text-emerald-700">
                  ₹ {Number(totalAddlCost).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 text-sm font-extrabold text-[#042f2e]">
                <span>Effective Cost :</span>
                <span className="text-[#00a651]">
                  ₹ {Number(grandTotal).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#e2f2e9]">
                <span className="text-slate-600">
                  Allocation to Primary Item :
                </span>
                <span className="font-bold text-slate-800">
                  {costAllocation || 100}%
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-dashed border-[#cbe0d2] text-xs">
                <span className="text-slate-500 font-bold">
                  Effective Rate / Primary Unit :
                </span>
                <span className="font-extrabold text-[#042f2e]">
                  ₹ {Number(effectiveRatePerFinished).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <label className="app-label block text-xs font-bold text-slate-800 mb-1">
            Narration / Remarks :
          </label>
          <textarea
            className="app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium resize-none h-20"
            placeholder="Enter narration for this manufacturing journal..."
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
          />
        </div>

        <div className="mt-8 flex justify-end gap-4 border-t border-[#e2f2e9] pt-6">
          <button
            type="button"
            onClick={saveManufacturing}
            className="app-btn-primary flex items-center justify-center gap-2 cursor-pointer shadow-md min-w-36 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Save size={16} /> {isEditMode ? "Update Journal" : "Save Journal"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="app-btn-secondary flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 hover:text-slate-800 min-w-30 transition-all"
          >
            <RotateCcw size={16} /> Reset Form
          </button>
          <button
            type="button"
            onClick={() => navigate(listPath)}
            className="app-btn-secondary flex items-center justify-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl cursor-pointer hover:bg-rose-100 hover:text-rose-800 hover:border-rose-300 min-w-30 transition-all"
          >
            <X size={16} /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
