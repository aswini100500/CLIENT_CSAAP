import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";
import { HiPlus } from "react-icons/hi";
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  FileText,
  Layers,
  Truck,
  User,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";

const FieldRow = ({ label, children }) => (
  <div className="grid grid-cols-[140px_1fr] items-start py-2 border-b border-gray-50 last:border-0">
    <span className="text-[12px] font-medium text-[#5c6070] pt-2.25">
      {label}
    </span>
    <div className="flex flex-col gap-1.5">{children}</div>
  </div>
);

const CreditNote = () => {
  const { user, role: userRole, companyId } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("party");
  const [voucherNo, setVoucherNo] = useState("");
  const [date, setDate] = useState("");
  const [partyLedger, setPartyLedger] = useState("");
  const [salesLedger, setSalesLedger] = useState("");
  const [ledgers, setLedgers] = useState([]);
  const [narration, setNarration] = useState("");

  const [gstType, setGstType] = useState("");
  const [gstRate, setGstRate] = useState(0);
  const [igstRate, setIgstRate] = useState(0);
  const [cgstRate, setCgstRate] = useState(0);
  const [sgstRate, setSgstRate] = useState(0);

  const [partyDetails, setPartyDetails] = useState({
    mailingName: "",
    address: "",
    state: "Not Applicable",
    country: "India",
    pincode: "",
    gstRegistrationType: "Unregistered/Consumer",
    gstin: "",
    placeOfSupply: "Not Applicable",
  });

  const [statesList, setStatesList] = useState([]);

  useEffect(() => {
    axios
      .post("https://countriesnow.space/api/v0.1/countries/states", {
        country: "India",
      })
      .then((res) => {
        setStatesList(res.data.data.states.map((s) => s.name));
      })
      .catch((err) => {
        console.error("Error fetching states:", err);
      });
  }, []);

  const [dispatchDetails, setDispatchDetails] = useState({
    originalInvoiceNo: "",
    originalInvoiceDate: "",
    dispatchDocNo: "",
    dispatchedThrough: "",
    destination: "",
    carrierName: "",
    billOfLading: "",
    billOfLadingDate: "",
    motorVehicleNo: "",
    dispatchDate: "",
    deliveryNoteNo: "",
    otherReferences: "",
    referenceNo: "",
    referenceDate: "",
    buyerOrderNo: "",
    buyerOrderDate: "",
    termsOfDelivery: "",
    consigneeSameAsBilling: true,
    consigneeName: "",
    consigneeGSTIN: "",
    consigneeAddress: "",
    consigneeState: "Not Applicable",
  });

  const [availableItems, setAvailableItems] = useState([]);
  const [items, setItems] = useState([
    {
      itemId: "",
      itemName: "",
      hsn_code: "",
      qty: 1,
      per: "pcs",
      rate: 0,
      discount: 0,
      amount: 0,
    },
  ]);

  const openStockModal = (itemName) => {
    const stateToSave = {
      voucherNo,
      date,
      partyLedger,
      salesLedger,
      narration,
      gstType,
      gstRate,
      igstRate,
      cgstRate,
      sgstRate,
      partyDetails,
      dispatchDetails,
      items,
    };
    sessionStorage.setItem("creditNoteState", JSON.stringify(stateToSave));
    navigate(
      `/accounting/client/stockItemCreation?redirect=/accounting/client/creditnote&name=${encodeURIComponent(itemName || "")}`,
    );
  };

  useEffect(() => {
    if (!companyId) return;
    (async () => {
      try {
        const itemRes = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/manufacturing/getItems/${companyId}`,
        );
        const itemsData = Array.isArray(itemRes.data) ? itemRes.data : itemRes.data?.data || [];
        setAvailableItems(itemsData);

        const ledgerRes = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`,
        );
        const ledgersData = Array.isArray(ledgerRes.data) ? ledgerRes.data : ledgerRes.data?.data || [];
        setLedgers(ledgersData);

        const savedState = sessionStorage.getItem("creditNoteState");
        if (savedState) {
          const state = JSON.parse(savedState);
          setVoucherNo(state.voucherNo || "");
          setDate(state.date || "");
          setPartyLedger(state.partyLedger || "");
          setSalesLedger(state.salesLedger || "");
          setNarration(state.narration || "");
          setGstType(state.gstType || "");
          setGstRate(state.gstRate || 0);
          setIgstRate(state.igstRate || 0);
          setCgstRate(state.cgstRate || 0);
          setSgstRate(state.sgstRate || 0);
          setPartyDetails(state.partyDetails || {});
          setDispatchDetails(state.dispatchDetails || {});
          setItems(state.items || []);
          sessionStorage.removeItem("creditNoteState");
          Swal.fire({
            title: "Welcome back!",
            text: "Your credit note progress has been restored.",
            icon: "info",
            timer: 2000,
            showConfirmButton: false,
          });
        } else if (id) {
          setIsEditMode(true);
          const res = await axios.get(
            `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/notes/single/${id}`,
          );
          if (res.data.success) {
            const n = res.data.note;
            setVoucherNo(n.voucherNo || "");
            setDate(n.date ? new Date(n.date).toISOString().split("T")[0] : "");
            setPartyLedger(n.PartyLedger || "");
            setSalesLedger(
              n.SalesLedger || n.salesLedger || n.PurchaseLedger || "",
            );
            setNarration(n.narration || "");

            setIgstRate(n.igst_rate || 0);
            setCgstRate(n.cgst_rate || 0);
            setSgstRate(n.sgst_rate || 0);
            setGstType(n.igst_rate > 0 || n.cgst_rate > 0 ? "Manual" : "");

            setPartyDetails({
              mailingName: n.mailingName || "",
              address: n.address || "",
              state: n.state || "Not Applicable",
              country: n.country || "India",
              pincode: n.pincode || "",
              gstRegistrationType:
                n.gstRegistrationType || "Unregistered/Consumer",
              gstin: n.gstin || "",
              placeOfSupply: n.placeOfSupply || "Not Applicable",
            });

            setDispatchDetails({
              originalInvoiceNo: n.paymentTerms || "",
              originalInvoiceDate: n.deliveryNoteDate
                ? new Date(n.deliveryNoteDate).toISOString().split("T")[0]
                : "",
              dispatchDocNo: n.dispatchDocNo || "",
              dispatchedThrough: n.dispatchedThrough || "",
              destination: n.destination || "",
              carrierName: n.carrierName || "",
              billOfLading: n.billOfLading || "",
              billOfLadingDate: n.billOfLadingDate || "",
              motorVehicleNo: n.motorVehicleNo || "",
              dispatchDate: n.dispatchDate || "",
              termsOfDelivery: n.termsOfDelivery || "",
              consigneeSameAsBilling: n.consigneeSameAsBilling || false,
              consigneeName: n.consigneeName || "",
              consigneeGSTIN: n.consigneeGSTIN || "",
              consigneeAddress: n.consigneeAddress || "",
              consigneeState: n.consigneeState || "",
              otherReferences: n.otherReferences || "",
              referenceNo: n.referenceNo || "",
              referenceDate: n.referenceDate
                ? new Date(n.referenceDate).toISOString().split("T")[0]
                : "",
              buyerOrderNo: n.buyerOrderNo || "",
              buyerOrderDate: n.buyerOrderDate
                ? new Date(n.buyerOrderDate).toISOString().split("T")[0]
                : "",
            });

            setItems(
              res.data.items.map((it) => ({
                itemId: it.itemId || "",
                itemName: it.itemName,
                hsn_code: it.hsn_code || "",
                qty: it.qty || 0,
                per: it.per || "pcs",
                rate: it.rate || 0,
                discount: it.discount || 0,
                amount: it.amount || 0,
              })),
            );
          }
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    })();

    if (companyId && !id) {
      axios
        .get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher-util/next/${companyId}/credit_note`,
        )
        .then((res) => setVoucherNo(res.data.nextNumber))
        .catch(console.error);
    }
  }, [companyId, id]);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    if (field === "item") {
      const selected = availableItems.find(
        (it) =>
          String(it.id) === String(value) ||
          it.productName === value ||
          `${it.productName}${it.godown ? ` - ${it.godown}` : ""}` === value,
      );
      if (selected) {
        const qty = parseFloat(selected.finishedQty) || 1;
        const rate =
          parseFloat(selected.effectiveRatePerFinished) ||
          parseFloat(selected.rate) ||
          0;
        const amount = parseFloat(selected.grandTotal) || qty * rate;

        updated[index].itemId = selected.id;
        updated[index].itemName = selected.productName || "";
        updated[index].hsn_code = selected.hsn_code || selected.hsn || "";
        updated[index].qty = qty;
        updated[index].rate = rate;
        updated[index].per = selected.units || "pcs";
        updated[index].amount = amount;
      } else {
        updated[index].itemName = value;
      }
    } else {
      updated[index][field] = value;
      if (["qty", "rate", "discount"].includes(field)) {
        const qty = parseFloat(updated[index].qty) || 0;
        const rate = parseFloat(updated[index].rate) || 0;
        const disc = parseFloat(updated[index].discount) || 0;
        const subtotalVal = qty * rate;
        updated[index].amount = subtotalVal - (subtotalVal * disc) / 100;
      }
    }
    setItems(updated);
  };

  const addRow = () =>
    setItems([
      ...items,
      {
        itemId: "",
        itemName: "",
        hsn_code: "",
        qty: 1,
        per: "pcs",
        rate: 0,
        discount: 0,
        amount: 0,
      },
    ]);
  const subtotal = items.reduce(
    (acc, item) => acc + (parseFloat(item.amount) || 0),
    0,
  );
  const gstAmount =
    (subtotal * (Number(igstRate) + Number(cgstRate) + Number(sgstRate))) / 100;
  const grandTotal = subtotal + gstAmount;

  const handleAutoGST = () => {
    setGstType("Auto");
    setGstRate(18);
    setIgstRate(0);
    setCgstRate(9);
    setSgstRate(9);
    Swal.fire({
      icon: "success",
      title: "GST Applied",
      text: "Automatically applied 18% GST (CGST: 9%, SGST: 9%)",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleManualGST = async () => {
    const { value: gstInput } = await Swal.fire({
      title: "Enter GST Percentage",
      input: "number",
      inputPlaceholder: "e.g., 5, 12, 18, 28",
      showCancelButton: true,
      confirmButtonText: "Next",
    });
    if (gstInput) {
      const rate = parseFloat(gstInput);
      const { value: gstChoice } = await Swal.fire({
        title: "Select GST Type",
        input: "select",
        inputOptions: {
          intra: "Intra-state (CGST + SGST)",
          inter: "Inter-state (IGST)",
        },
        inputPlaceholder: "Select tax type",
        showCancelButton: true,
        confirmButtonText: "Apply",
      });
      if (gstChoice) {
        setGstType("Manual");
        setGstRate(rate);
        if (gstChoice === "intra") {
          setCgstRate(rate / 2);
          setSgstRate(rate / 2);
          setIgstRate(0);
          Swal.fire({
            icon: "success",
            title: "GST Added",
            text: `${gstInput}% Intra-state tax applied`,
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          setCgstRate(0);
          setSgstRate(0);
          setIgstRate(rate);
          Swal.fire({
            icon: "success",
            title: "IGST Added",
            text: `${gstInput}% Integrated tax applied`,
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }
    }
  };

  const handleCreateCreditNote = async () => {
    const employee_id = user?.employee_id || null;
    const role = userRole || "admin";

    const payload = {
      voucherNo,
      date,
      partyLedger,
      purchaseLedger: salesLedger,
      partyDetails,
      dispatchDetails,
      narration,
      items: items.map((it) => ({
        ...it,
        qty: parseFloat(it.qty) || 0,
        rate: parseFloat(it.rate) || 0,
        discount: parseFloat(it.discount) || 0,
      })),
      subtotal,
      gst_amount: gstAmount,
      igst_rate: igstRate,
      cgst_rate: cgstRate,
      sgst_rate: sgstRate,
      igst_amount: (subtotal * igstRate) / 100,
      cgst_amount: (subtotal * cgstRate) / 100,
      sgst_amount: (subtotal * sgstRate) / 100,
      totalAmount: grandTotal,
      grand_total: grandTotal,
      employee_id,
      role,
    };
    try {
      if (isEditMode) {
        await axios.put(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/notes/updateCredit/${id}`,
          payload,
        );
        Swal.fire({
          icon: "success",
          title: "Credit Note Updated Successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(listPath);
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/notes/createCreditNote/${companyId}`,
        payload,
      );

      const result = await Swal.fire({
        icon: "success",
        title: "Credit Note Created Successfully",
        text: "The credit note has been saved. What would you like to do next?",
        showCancelButton: true,
        confirmButtonColor: "#00a651",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Create Another",
        cancelButtonText: "Go to List",
      });

      if (result.isConfirmed) {
        setVoucherNo("");
        setDate(new Date().toISOString().split("T")[0]);
        setPartyLedger("");
        setPurchaseLedger("");
        setNarration("");
        setItems([
          {
            itemId: "",
            itemName: "",
            hsn_code: "",
            qty: 1,
            per: "pcs",
            rate: 0,
            discount: 0,
            amount: 0,
          },
        ]);
        setPartyDetails({
          mailingName: "",
          address: "",
          state: "Not Applicable",
          country: "India",
          pincode: "",
          gstRegistrationType: "Unregistered/Consumer",
          gstin: "",
          placeOfSupply: "Not Applicable",
        });
        setDispatchDetails({
          originalInvoiceNo: "",
          originalInvoiceDate: "",
          dispatchDocNo: "",
          dispatchedThrough: "",
          destination: "",
          carrierName: "",
          billOfLading: "",
          billOfLadingDate: "",
          motorVehicleNo: "",
          dispatchDate: "",
          deliveryNoteNo: "",
          otherReferences: "",
          referenceNo: "",
          referenceDate: "",
          buyerOrderNo: "",
          buyerOrderDate: "",
          termsOfDelivery: "",
          consigneeSameAsBilling: true,
          consigneeName: "",
          consigneeGSTIN: "",
          consigneeAddress: "",
          consigneeState: "Not Applicable",
        });
      } else {
        navigate(listPath);
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        Swal.fire("Warning", "Voucher Number Already Exists!", "warning");
      } else {
        Swal.fire("Error", "Failed to save credit note", "error");
      }
    }
  };

  const inputClass =
    "app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium";

  const tableInputClass =
    "w-full border border-[#c8ddcd] bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] rounded-xl font-semibold py-2.25 px-3 text-xs outline-none transition-all";

  const role = userRole || "admin";
  const listPath =
    role === "employee"
      ? "/employee/hr/accounting/client/creditNotesList"
      : "/accounting/client/creditNotesList";

  return (
    <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans">
      <div className="max-w-6xl mx-auto bg-white app-panel border border-[#e2f2e9]/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex justify-between items-center border-b border-[#e2f2e9] pb-5 mb-8">
          <div className="flex items-center gap-3">
            <h2 className="app-title text-xl font-extrabold text-[#042f2e]">
              {isEditMode ? "Credit Note Alteration" : "Credit Note Creation"}
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f0fdf4] text-[#00a651] border border-[#c6f1d6]">
              CN
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate(listPath)}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors text-sm font-medium cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Credit Note List
          </button>
        </div>

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider mb-4 border-b border-[#cbe0d2] pb-1.5 flex items-center gap-2">
            <FileText size={16} className="text-[#00a651]" /> Voucher & Ledger
            Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Voucher Number :
              </label>
              <input
                className={inputClass}
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                placeholder="CN-001"
              />
            </div>
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Date :
              </label>
              <input
                type="date"
                className={inputClass}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Party (Customer) Ledger :
              </label>
              <select
                className={inputClass}
                value={partyLedger}
                onChange={(e) => {
                  const sel = ledgers.find(
                    (l) => String(l.id) === String(e.target.value),
                  );
                  setPartyLedger(e.target.value);
                  if (sel)
                    setPartyDetails({
                      ...partyDetails,
                      mailingName: sel.mailingName || sel.name,
                      address: sel.address || "",
                      state: sel.state || "Not Applicable",
                      country: sel.country || "India",
                      pincode: sel.pincode || "",
                      gstin: sel.gstin || "",
                    });
                }}
              >
                <option value="">Select Customer</option>
                {ledgers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Sales Ledger :
              </label>
              <select
                className={inputClass}
                value={salesLedger}
                onChange={(e) => setSalesLedger(e.target.value)}
              >
                <option value="">Select Sales Ledger</option>
                {ledgers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <div className="flex gap-2 border-b border-[#cbe0d2] pb-3 mb-5">
            <button
              type="button"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === "party" ? "bg-[#00a651] text-white shadow-sm" : "bg-white text-slate-700 border border-[#cbe0d2] hover:bg-[#f0fdf4]"}`}
              onClick={() => setActiveTab("party")}
            >
              <User size={14} /> Party Details
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === "dispatch" ? "bg-[#00a651] text-white shadow-sm" : "bg-white text-slate-700 border border-[#cbe0d2] hover:bg-[#f0fdf4]"}`}
              onClick={() => setActiveTab("dispatch")}
            >
              <Truck size={14} /> Dispatch Details
            </button>
          </div>

          {activeTab === "party" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                  Mailing Name :
                </label>
                <input
                  className={inputClass}
                  value={partyDetails.mailingName}
                  onChange={(e) =>
                    setPartyDetails({
                      ...partyDetails,
                      mailingName: e.target.value,
                    })
                  }
                />

                <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                  Address :
                </label>
                <textarea
                  className={`${inputClass} h-20 resize-none`}
                  value={partyDetails.address}
                  onChange={(e) =>
                    setPartyDetails({
                      ...partyDetails,
                      address: e.target.value,
                    })
                  }
                />

                <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                  State :
                </label>
                <select
                  className={inputClass}
                  value={partyDetails.state}
                  onChange={(e) =>
                    setPartyDetails({ ...partyDetails, state: e.target.value })
                  }
                >
                  <option>Not Applicable</option>
                  {statesList.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                  Country :
                </label>
                <input
                  className={inputClass}
                  value={partyDetails.country}
                  onChange={(e) =>
                    setPartyDetails({
                      ...partyDetails,
                      country: e.target.value,
                    })
                  }
                />

                <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                  Pincode :
                </label>
                <input
                  className={inputClass}
                  value={partyDetails.pincode}
                  onChange={(e) =>
                    setPartyDetails({
                      ...partyDetails,
                      pincode: e.target.value,
                    })
                  }
                />

                <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                  GST Registration Type :
                </label>
                <select
                  className={inputClass}
                  value={partyDetails.gstRegistrationType}
                  onChange={(e) =>
                    setPartyDetails({
                      ...partyDetails,
                      gstRegistrationType: e.target.value,
                    })
                  }
                >
                  <option>Unregistered/Consumer</option>
                  <option>Regular</option>
                  <option>Composition</option>
                </select>

                <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                  GSTIN/UIN :
                </label>
                <input
                  className={`${inputClass} uppercase`}
                  value={partyDetails.gstin}
                  onChange={(e) =>
                    setPartyDetails({ ...partyDetails, gstin: e.target.value })
                  }
                />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                    Original Invoice No :
                  </label>
                  <input
                    className={inputClass}
                    value={dispatchDetails.originalInvoiceNo}
                    onChange={(e) =>
                      setDispatchDetails({
                        ...dispatchDetails,
                        originalInvoiceNo: e.target.value,
                      })
                    }
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    Original Invoice Date :
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={dispatchDetails.originalInvoiceDate}
                    onChange={(e) =>
                      setDispatchDetails({
                        ...dispatchDetails,
                        originalInvoiceDate: e.target.value,
                      })
                    }
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    Dispatch Doc No :
                  </label>
                  <input
                    className={inputClass}
                    value={dispatchDetails.dispatchDocNo}
                    onChange={(e) =>
                      setDispatchDetails({
                        ...dispatchDetails,
                        dispatchDocNo: e.target.value,
                      })
                    }
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    Dispatched Through :
                  </label>
                  <input
                    className={inputClass}
                    value={dispatchDetails.dispatchedThrough}
                    onChange={(e) =>
                      setDispatchDetails({
                        ...dispatchDetails,
                        dispatchedThrough: e.target.value,
                      })
                    }
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    Destination :
                  </label>
                  <input
                    className={inputClass}
                    value={dispatchDetails.destination}
                    onChange={(e) =>
                      setDispatchDetails({
                        ...dispatchDetails,
                        destination: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                    Reference No :
                  </label>
                  <input
                    className={inputClass}
                    value={dispatchDetails.referenceNo}
                    onChange={(e) =>
                      setDispatchDetails({
                        ...dispatchDetails,
                        referenceNo: e.target.value,
                      })
                    }
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    Reference Date :
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={dispatchDetails.referenceDate}
                    onChange={(e) =>
                      setDispatchDetails({
                        ...dispatchDetails,
                        referenceDate: e.target.value,
                      })
                    }
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    Buyer Order No :
                  </label>
                  <input
                    className={inputClass}
                    value={dispatchDetails.buyerOrderNo}
                    onChange={(e) =>
                      setDispatchDetails({
                        ...dispatchDetails,
                        buyerOrderNo: e.target.value,
                      })
                    }
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    Order Date :
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={dispatchDetails.buyerOrderDate}
                    onChange={(e) =>
                      setDispatchDetails({
                        ...dispatchDetails,
                        buyerOrderDate: e.target.value,
                      })
                    }
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    Terms of Delivery :
                  </label>
                  <textarea
                    className={`${inputClass} h-16 resize-none`}
                    value={dispatchDetails.termsOfDelivery}
                    onChange={(e) =>
                      setDispatchDetails({
                        ...dispatchDetails,
                        termsOfDelivery: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#cbe0d2]">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#042f2e]">
                    Consignee (Ship To)
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    Same as Billing?
                    <input
                      type="checkbox"
                      checked={dispatchDetails.consigneeSameAsBilling}
                      onChange={(e) =>
                        setDispatchDetails({
                          ...dispatchDetails,
                          consigneeSameAsBilling: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-[#00a651] cursor-pointer"
                    />
                  </label>
                </div>

                {!dispatchDetails.consigneeSameAsBilling && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                        Name :
                      </label>
                      <input
                        className={inputClass}
                        value={dispatchDetails.consigneeName}
                        onChange={(e) =>
                          setDispatchDetails({
                            ...dispatchDetails,
                            consigneeName: e.target.value,
                          })
                        }
                      />

                      <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                        GSTIN :
                      </label>
                      <input
                        className={`${inputClass} uppercase`}
                        value={dispatchDetails.consigneeGSTIN}
                        onChange={(e) =>
                          setDispatchDetails({
                            ...dispatchDetails,
                            consigneeGSTIN: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                        State :
                      </label>
                      <input
                        className={inputClass}
                        value={dispatchDetails.consigneeState}
                        onChange={(e) =>
                          setDispatchDetails({
                            ...dispatchDetails,
                            consigneeState: e.target.value,
                          })
                        }
                      />

                      <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                        Address :
                      </label>
                      <textarea
                        className={`${inputClass} h-20 resize-none`}
                        value={dispatchDetails.consigneeAddress}
                        onChange={(e) =>
                          setDispatchDetails({
                            ...dispatchDetails,
                            consigneeAddress: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <div className="flex justify-between items-center mb-4 border-b border-[#cbe0d2] pb-1.5">
            <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} className="text-[#00a651]" /> Item Details
            </h3>
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-bold text-[#00a651] bg-white border border-[#cbe0d2] px-3 py-1.5 rounded-lg hover:bg-[#f0fdf4] transition-colors cursor-pointer"
              onClick={addRow}
            >
              <Plus size={14} /> Add Item
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#cbe0d2] bg-white mb-4">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#f0fdf4] border-b border-[#cbe0d2]">
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e]">
                    Item Name
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e] w-28">
                    HSN/SAC
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e] w-20">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e] w-20">
                    Per
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e] w-28">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e] w-24">
                    Disc %
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e] w-32">
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2f2e9]">
                {items.map((it, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[#f8faf8] transition-colors"
                  >
                    <td className="p-2">
                      <div className="relative group">
                        <input
                          list={`items-${idx}`}
                          className={tableInputClass}
                          placeholder="Select or enter item"
                          value={it.itemName}
                          onChange={(e) =>
                            handleItemChange(idx, "item", e.target.value)
                          }
                        />
                        <datalist id={`items-${idx}`}>
                          {availableItems.map((ai) => (
                            <option
                              key={ai.id}
                              value={`${ai.productName}${ai.godown ? ` - ${ai.godown}` : ""}`}
                            />
                          ))}
                        </datalist>
                        <button
                          type="button"
                          onClick={() => openStockModal(it.itemName)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00a651] opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#f0fdf4] rounded cursor-pointer"
                          title="Create New Stock Item"
                        >
                          <HiPlus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-2">
                      <input
                        className={tableInputClass}
                        value={it.hsn_code}
                        onChange={(e) =>
                          handleItemChange(idx, "hsn_code", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        className={tableInputClass}
                        value={it.qty}
                        onChange={(e) =>
                          handleItemChange(idx, "qty", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className={tableInputClass}
                        value={it.per}
                        onChange={(e) =>
                          handleItemChange(idx, "per", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        className={tableInputClass}
                        value={it.rate}
                        onChange={(e) =>
                          handleItemChange(idx, "rate", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        className={tableInputClass}
                        value={it.discount}
                        onChange={(e) =>
                          handleItemChange(idx, "discount", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2 text-right font-bold text-slate-800">
                      ₹ {Number(it.amount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider mb-4 border-b border-[#cbe0d2] pb-1.5 flex items-center gap-2">
            <FileText size={16} className="text-[#00a651]" /> Tax & Totals
          </h3>
          <div className="flex justify-between items-start gap-6 flex-wrap">
            <div className="flex-1 min-w-80">
              <label className="app-label block text-xs font-bold text-slate-800 mb-2">
                Apply GST :
              </label>
              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  className="bg-[#00a651] text-white px-4 py-2 text-xs font-bold rounded-xl hover:bg-[#008c44] transition-colors cursor-pointer shadow-xs"
                  onClick={handleAutoGST}
                >
                  Auto GST
                </button>
                <button
                  type="button"
                  className="bg-amber-600 text-white px-4 py-2 text-xs font-bold rounded-xl hover:bg-amber-700 transition-colors cursor-pointer shadow-xs"
                  onClick={handleManualGST}
                >
                  Manual GST
                </button>
              </div>
              {gstRate > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-2 mb-4 rounded-xl text-xs font-bold bg-[#f0fdf4] border border-[#c6f1d6] text-[#00a651]">
                  {gstRate}% GST applied — ₹ {gstAmount.toFixed(2)}
                </div>
              )}
              <label className="app-label block text-xs font-bold text-slate-800 mb-2">
                Component Breakdown :
              </label>
              <div className="flex gap-3 flex-wrap">
                {[
                  ["IGST", "igstRate", igstRate, setIgstRate],
                  ["CGST", "cgstRate", cgstRate, setCgstRate],
                  ["SGST", "sgstRate", sgstRate, setSgstRate],
                ].map(([label, key, val, setter]) => (
                  <div key={key} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-700">
                        {label} (%)
                      </span>
                      <span className="text-[11px] font-bold text-[#00a651]">
                        ₹ {((subtotal * Number(val || 0)) / 100).toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="number"
                      className="app-input w-24 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] font-medium py-1 px-2 text-xs"
                      value={val}
                      onChange={(e) => setter(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#cbe0d2] rounded-xl p-5 shrink-0 w-full md:w-72 shadow-xs">
              <div className="flex justify-between items-center py-1.5 text-xs text-slate-600 border-b border-[#e2f2e9]">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">
                  ₹ {subtotal.toFixed(2)}
                </span>
              </div>
              {gstAmount > 0 && (
                <div className="flex justify-between items-center py-1.5 text-xs text-emerald-700 border-b border-[#e2f2e9]">
                  <span>Total Tax (GST)</span>
                  <span>₹ {gstAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 text-sm font-extrabold text-[#042f2e] mt-1">
                <span>Grand Total</span>
                <span className="text-[#00a651]">
                  ₹ {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <label className="app-label block text-xs font-bold text-slate-800 mb-1">
            Narration / Note :
          </label>
          <textarea
            className="app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium resize-none h-20"
            placeholder="Enter narration for this credit note..."
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
          />
        </div>

        <div className="mt-8 flex justify-end gap-4 border-t border-[#e2f2e9] pt-6">
          <button
            type="button"
            onClick={handleCreateCreditNote}
            className="app-btn-primary flex items-center justify-center gap-2 cursor-pointer shadow-md min-w-36 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Save size={16} />{" "}
            {isEditMode ? "Update Credit Note" : "Save Credit Note"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="app-btn-secondary flex items-center justify-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl cursor-pointer hover:bg-rose-100 hover:text-rose-800 hover:border-rose-300 min-w-30 transition-all"
          >
            <X size={16} /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditNote;
