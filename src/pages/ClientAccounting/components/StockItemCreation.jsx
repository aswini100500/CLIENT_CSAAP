import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  PackagePlus,
  Save,
  ArrowLeft,
  Barcode,
  Scale,
  CalendarClock,
  X,
  Boxes,
} from "lucide-react";

const StockItemCreation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    customUnit: "",
    name: "",
    alias: "",
    under: "",
    units: "",
    maintainInBatches: false,
    trackDateOfManufacture: false,
    expiryDateOfBatches: false,
    rateOfDuty: "",
    gstApplicable: "",
    hsn: "",
    openingBalanceQty: "",
    openingBalanceRate: "",
    openingBalanceValue: "",
  });

  const [groups, setGroups] = useState([]);
  const [stockId, setStockId] = useState(null);
  const { companyId } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  useEffect(() => {
    if (companyId) {
      const fetchGroups = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group/all/${companyId}`
          );
          setGroups(res.data || []);
        } catch (err) {
          console.error("Error fetching groups:", err);
        }
      };

      fetchGroups();
    }
  }, [companyId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (id && companyId) {
      setStockId(id);
      if (location.state) {
        const data = location.state;
        setForm({
          customUnit: "",
          name: data.name || "",
          alias: data.alias || "",
          under: data.under || "",
          units: data.units || "",
          maintainInBatches:
            data.maintainInBatches === 1 || data.maintainInBatches === true,
          trackDateOfManufacture:
            data.trackDateOfManufacture === 1 ||
            data.trackDateOfManufacture === true,
          expiryDateOfBatches:
            data.expiryDateOfBatches === 1 || data.expiryDateOfBatches === true,
          rateOfDuty: data.rateOfDuty || "",
          gstApplicable: data.gstApplicable || "",
          hsn: data.hsn || "",
          openingBalanceQty: data.openingBalanceQty || "",
          openingBalanceRate: data.openingBalanceRate || "",
          openingBalanceValue: data.openingBalanceValue || "",
        });
      } else {
        axios
          .get(
            `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/stock/getStockById/${companyId}/${id}`
          )
          .then((res) => {
            if (res.data.success) {
              const data = res.data.data;
              setForm({
                customUnit: "",
                name: data.name || "",
                alias: data.alias || "",
                under: data.under || "",
                units: data.units || "",
                maintainInBatches:
                  data.maintainInBatches === 1 ||
                  data.maintainInBatches === true,
                trackDateOfManufacture:
                  data.trackDateOfManufacture === 1 ||
                  data.trackDateOfManufacture === true,
                expiryDateOfBatches:
                  data.expiryDateOfBatches === 1 ||
                  data.expiryDateOfBatches === true,
                rateOfDuty: data.rateOfDuty || "",
                gstApplicable: data.gstApplicable || "",
                hsn: data.hsn || "",
                openingBalanceQty: data.openingBalanceQty || "",
                openingBalanceRate: data.openingBalanceRate || "",
                openingBalanceValue: data.openingBalanceValue || "",
              });
            }
          })
          .catch((err) => console.error("Error fetching stock data:", err));
      }
    }

    const name = params.get("name");
    if (name && !id) {
      setForm((prev) => ({
        ...prev,
        name,
      }));
    }
  }, [companyId]);

  const handleAccept = async () => {
    if (!form.name.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Stock Name Required",
        text: "Please enter stock item name.",
      });
    }

    if (!form.under) {
      return Swal.fire({
        icon: "warning",
        title: "Group Required",
        text: "Please select stock group.",
      });
    }

    if (!form.units) {
      return Swal.fire({
        icon: "warning",
        title: "Unit Required",
        text: "Please select stock unit.",
      });
    }

    const payload = {
      ...form,
      units: form.units === "Other" ? form.customUnit : form.units,
    };

    try {
      if (stockId) {
        await axios.put(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/stock/updateStock/${companyId}/${stockId}`,
          payload
        );
        Swal.fire({
          icon: "success",
          title: "Stock Item Updated",
          text: "Stock item updated successfully.",
        }).then(() => {
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get("redirect");
          if (redirect) {
            navigate(redirect);
          } else {
            navigate(-1);
          }
        });
      } else {
        await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/stock/createStock/${companyId}`,
          payload
        );
        Swal.fire({
          icon: "success",
          title: "Stock Item Saved",
          text: "Stock item created successfully.",
        }).then(() => {
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get("redirect");
          if (redirect) {
            navigate(redirect);
          } else {
            navigate(-1);
          }
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to Save",
        text: err?.response?.data?.message || "Failed to save stock item",
      });
    }
  };

  const handleReject = () => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");

    if (redirect) {
      navigate(redirect);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="erp-root app-shell min-h-screen p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="bg-white app-panel border border-[#e2f2e9] rounded-2xl p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-2xl bg-[#ecfdf5] border border-[#c6f1d6] flex items-center justify-center shrink-0">
              <PackagePlus className="size-6 text-[#00a651]" />
            </div>
            <div>
              <h1 className="app-title text-xl font-extrabold text-[#042f2e]">
                {stockId ? "Edit Stock Item" : "Create Stock Item"}
              </h1>
              <p className="app-subtitle text-xs md:text-sm text-[#475569] font-medium mt-0.5">
                Configure item classification, batch tracking, tax rate, and opening inventory.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReject}
              className="h-10 px-4 app-btn-secondary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="size-4" /> Back to Stock Summary
            </button>
          </div>
        </div>

        {/* Form Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-8 space-y-6">
            {/* Basic Info Panel */}
            <div className="app-panel overflow-hidden border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
              <div className="app-section-bar px-6 py-4 bg-[#f0fdf4]/60 border-b border-[#e2f2e9] flex items-center gap-2">
                <Boxes className="size-4 text-[#00a651]" />
                <h3 className="app-heading text-sm font-bold text-[#042f2e]">
                  Basic Information
                </h3>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
                    Stock Item Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Steel Rods 12mm / Cement Bag 50kg"
                    className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white placeholder-[#94a3b8] focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] outline-none"
                    type="text"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
                      Alias / Item Code
                    </label>
                    <input
                      name="alias"
                      value={form.alias}
                      onChange={handleChange}
                      placeholder="e.g. STR-12MM"
                      className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white placeholder-[#94a3b8] focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] outline-none"
                      type="text"
                    />
                  </div>

                  <div>
                    <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
                      Under Group <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="under"
                      value={form.under}
                      onChange={handleChange}
                      className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] outline-none cursor-pointer"
                    >
                      <option value="">Select Stock Group</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.groupName}>
                          {g.groupName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
                    Unit of Measurement <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="units"
                    value={form.units}
                    onChange={(e) => {
                      if (e.target.value === "Other") {
                        setForm({
                          ...form,
                          units: "Other",
                          customUnit: "",
                        });
                        return;
                      }
                      setForm({
                        ...form,
                        units: e.target.value,
                        customUnit: "",
                      });
                    }}
                    className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] outline-none cursor-pointer"
                  >
                    <option value="">Select Predefined Unit</option>
                    <optgroup label="Count / Items">
                      <option value="Nos">Nos</option>
                      <option value="Piece">Piece</option>
                      <option value="Pair">Pair</option>
                      <option value="Set">Set</option>
                      <option value="Dozen">Dozen</option>
                    </optgroup>
                    <optgroup label="Weight / Mass">
                      <option value="Kg">Kg</option>
                      <option value="Gram">Gram</option>
                      <option value="Quintal">Quintal</option>
                      <option value="Ton">Ton</option>
                    </optgroup>
                    <optgroup label="Volume / Liquid">
                      <option value="Litre">Litre</option>
                      <option value="ML">ML</option>
                    </optgroup>
                    <optgroup label="Length / Area">
                      <option value="Meter">Meter</option>
                      <option value="Feet">Feet</option>
                      <option value="Inch">Inch</option>
                      <option value="CM">CM</option>
                    </optgroup>
                    <optgroup label="Packaging">
                      <option value="Box">Box</option>
                      <option value="Bag">Bag</option>
                      <option value="Packet">Packet</option>
                      <option value="Bottle">Bottle</option>
                      <option value="Carton">Carton</option>
                      <option value="Bundle">Bundle</option>
                      <option value="Roll">Roll</option>
                      <option value="Tray">Tray</option>
                      <option value="Can">Can</option>
                      <option value="Drum">Drum</option>
                      <option value="Sheet">Sheet</option>
                      <option value="Rod">Rod</option>
                      <option value="Pipe">Pipe</option>
                      <option value="Block">Block</option>
                    </optgroup>
                    <option value="Other">Other (Add Manually)</option>
                  </select>

                  {form.units === "Other" && (
                    <input
                      type="text"
                      placeholder="Type custom unit (e.g. Barrel, SqFt)"
                      value={form.customUnit || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          customUnit: e.target.value,
                        })
                      }
                      className="app-input w-full mt-2 px-3.5 py-2.5 border border-[#c6f1d6] bg-[#f0fdf4] rounded-xl text-sm font-semibold text-[#042f2e] focus:border-[#00a651] outline-none"
                    />
                  )}
                  <p className="text-xs text-[#475569] font-medium mt-1">
                    Standard measurement unit for stock accounting, purchase vouchers, and sales bills.
                  </p>
                </div>
              </div>
            </div>

            {/* Opening Balance Panel */}
            <div className="app-panel overflow-hidden border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
              <div className="app-section-bar px-6 py-4 bg-[#f0fdf4]/60 border-b border-[#e2f2e9] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="size-4 text-[#00a651]" />
                  <h3 className="app-heading text-sm font-bold text-[#042f2e]">
                    Opening Balance
                  </h3>
                </div>
                <span className="text-xs font-medium text-[#475569]">
                  Inventory stock on hand at setup
                </span>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
                      Opening Quantity
                    </label>
                    <input
                      name="openingBalanceQty"
                      value={form.openingBalanceQty}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white focus:border-[#00a651] outline-none"
                      type="text"
                    />
                  </div>

                  <div>
                    <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
                      Rate per Unit (₹)
                    </label>
                    <input
                      name="openingBalanceRate"
                      value={form.openingBalanceRate}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white focus:border-[#00a651] outline-none"
                      type="text"
                    />
                  </div>

                  <div>
                    <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
                      Total Value (₹)
                    </label>
                    <input
                      name="openingBalanceValue"
                      value={form.openingBalanceValue}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-semibold text-[#042f2e] bg-[#f0fdf4]/60 focus:border-[#00a651] outline-none"
                      type="text"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Controls */}
          <div className="lg:col-span-4 space-y-6">
            {/* Batch & Tracking */}
            <div className="app-panel overflow-hidden border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
              <div className="app-section-bar px-6 py-4 bg-[#f0fdf4]/60 border-b border-[#e2f2e9] flex items-center gap-2">
                <CalendarClock className="size-4 text-[#00a651]" />
                <h3 className="app-heading text-sm font-bold text-[#042f2e]">
                  Batch & Date Tracking
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#e2f2e9] hover:border-[#c6f1d6] hover:bg-[#f0fdf4]/40 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    name="maintainInBatches"
                    checked={form.maintainInBatches}
                    onChange={handleChange}
                    className="mt-0.5 rounded text-[#00a651] focus:ring-[#00a651] size-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-bold text-[#042f2e] block leading-snug">
                      Maintain in Batches
                    </span>
                    <span className="text-xs font-medium text-[#475569] block mt-0.5 leading-normal">
                      Lot-wise batch numbers for granular inventory auditing.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#e2f2e9] hover:border-[#c6f1d6] hover:bg-[#f0fdf4]/40 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    name="trackDateOfManufacture"
                    checked={form.trackDateOfManufacture}
                    onChange={handleChange}
                    className="mt-0.5 rounded text-[#00a651] focus:ring-[#00a651] size-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-bold text-[#042f2e] block leading-snug">
                      Track Date of Mfg
                    </span>
                    <span className="text-xs font-medium text-[#475569] block mt-0.5 leading-normal">
                      Record production & manufacturing dates.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#e2f2e9] hover:border-[#c6f1d6] hover:bg-[#f0fdf4]/40 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    name="expiryDateOfBatches"
                    checked={form.expiryDateOfBatches}
                    onChange={handleChange}
                    className="mt-0.5 rounded text-[#00a651] focus:ring-[#00a651] size-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-bold text-[#042f2e] block leading-snug">
                      Expiry Date of Batches
                    </span>
                    <span className="text-xs font-medium text-[#475569] block mt-0.5 leading-normal">
                      Track shelf-life & batch expiration limits.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* GST Config */}
            <div className="app-panel overflow-hidden border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
              <div className="app-section-bar px-6 py-4 bg-[#f0fdf4]/60 border-b border-[#e2f2e9] flex items-center gap-2">
                <Barcode className="size-4 text-[#00a651]" />
                <h3 className="app-heading text-sm font-bold text-[#042f2e]">
                  GST Configuration
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
                    GST Applicability
                  </label>
                  <select
                    name="gstApplicable"
                    value={form.gstApplicable}
                    onChange={handleChange}
                    className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white focus:border-[#00a651] outline-none cursor-pointer"
                  >
                    <option value="">Select Status</option>
                    <option value="Applicable">Applicable</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </div>

                <div>
                  <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
                    HSN / SAC Code
                  </label>
                  <input
                    name="hsn"
                    value={form.hsn}
                    onChange={handleChange}
                    placeholder="e.g. 72142090"
                    className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white focus:border-[#00a651] outline-none"
                    type="text"
                  />
                  <p className="text-xs text-[#475569] font-medium mt-1">
                    Harmonized System tariff code used in GST returns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Toolbar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReject}
            className="h-10 px-5 app-btn-secondary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <X className="size-4" /> Cancel
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="h-10 px-5 app-btn-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="size-4" /> {stockId ? "Update Stock Item" : "Create Stock Item"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockItemCreation;
