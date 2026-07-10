import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useCompany } from "../context/CompanyContext";
import { useParams, useNavigate } from "react-router-dom";
import { HiPlus } from "react-icons/hi";
import useAuth from "../../../hooks/useAuth";

const FieldRow = ({ label, children }) => (
  <div className="grid grid-cols-[140px_1fr] items-start py-2 border-b border-gray-50 last:border-0">
    <span className="text-[12px] font-medium text-[#5c6070] pt-2.25">{label}</span>
    <div className="flex flex-col gap-1.5">{children}</div>
  </div>
);

const DebitNote = () => {
  const { companyId } = useCompany();
  const { user, role: userRole } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("party");
  const [voucherNo, setVoucherNo] = useState("");
  const [date, setDate] = useState("");
  const [partyLedger, setPartyLedger] = useState("");
  const [purchaseLedger, setPurchaseLedger] = useState("");
  const [ledgers, setLedgers] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [narration, setNarration] = useState("");

  const [gstType, setGstType] = useState("");
  const [gstRate, setGstRate] = useState(0);
  const [igstRate, setIgstRate] = useState(0);
  const [cgstRate, setCgstRate] = useState(0);
  const [sgstRate, setSgstRate] = useState(0);
  const [statesList, setStatesList] = useState([]);

  const [partyDetails, setPartyDetails] = useState({
    mailingName: "", address: "", state: "Not Applicable", country: "India",
    pincode: "", gstRegistrationType: "Unregistered/Consumer", gstin: "", placeOfSupply: "Not Applicable",
  });
  useEffect(() => {

  axios
    .post(
      "https://countriesnow.space/api/v0.1/countries/states",
      {
        country: "India",
      }
    )
    .then((res) => {

      setStatesList(
        res.data.data.states.map(
          (s) => s.name
        )
      );

    })
    .catch((err) => {

      console.error(
        "Error fetching states:",
        err
      );

    });

}, []);

  const [dispatchDetails, setDispatchDetails] = useState({
    originalInvoiceNo: "", originalInvoiceDate: "", dispatchDocNo: "", dispatchedThrough: "",
    destination: "", carrierName: "", billOfLading: "", billOfLadingDate: "",
    motorVehicleNo: "", dispatchDate: "", deliveryNoteNo: "", otherReferences: "",
    referenceNo: "", referenceDate: "", buyerOrderNo: "", buyerOrderDate: "",
    termsOfDelivery: "", consigneeSameAsBilling: true,
    consigneeName: "", consigneeGSTIN: "", consigneeAddress: "", consigneeState: "Not Applicable",
  });

  const [items, setItems] = useState([
    { itemId: "", itemName: "", hsn_code: "", qty: 1, per: "pcs", rate: 0, discount: 0, amount: 0 },
  ]);

  

  useEffect(() => {
    if (!companyId) return;
    (async () => {
      try {
        const itemRes = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/manufacturing/getItems/${companyId}`);
        setAvailableItems(itemRes.data.data || itemRes.data || []);
        const ledgerRes = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`);
        setLedgers(ledgerRes.data || []);

    

        const savedState = sessionStorage.getItem("debitNoteState");
        if (savedState) {
          const state = JSON.parse(savedState);
          setVoucherNo(state.voucherNo || "");
          setDate(state.date || "");
          setPartyLedger(state.partyLedger || "");
         setPurchaseLedger(state.purchaseLedger || "");
          setNarration(state.narration || "");
          setGstType(state.gstType || "");
          setGstRate(state.gstRate || 0);
          setIgstRate(state.igstRate || 0);
          setCgstRate(state.cgstRate || 0);
          setSgstRate(state.sgstRate || 0);
          setPartyDetails(state.partyDetails || {});
          setDispatchDetails(state.dispatchDetails || {});
          setItems(state.items || []);
          sessionStorage.removeItem("debitNoteState");
          Swal.fire({
            title: "Welcome back!",
            text: "Your debit note progress has been restored.",
            icon: "info",
            timer: 2000,
            showConfirmButton: false
          });
        } else if (id) {
          setIsEditMode(true);
          const res = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/notes/single/${id}`);
          if (res.data.success) {
            const n = res.data.note;
            setVoucherNo(n.voucherNo || "");
            setDate(n.date ? new Date(n.date).toISOString().split('T')[0] : "");
            setPartyLedger(n.PartyLedger || "");
            setPurchaseLedger(n.PurchaseLedger || "");
            setNarration(n.narration || "");
            
            setIgstRate(n.igst_rate || 0);
            setCgstRate(n.cgst_rate || 0);
            setSgstRate(n.sgst_rate || 0);
            setGstType(n.igst_rate > 0 || n.cgst_rate > 0 ? "Manual" : "");

            setPartyDetails({
              mailingName: n.mailingName || "", address: n.address || "", state: n.state || "Not Applicable",
              country: n.country || "India", pincode: n.pincode || "", gstRegistrationType: n.gstRegistrationType || "Unregistered/Consumer",
              gstin: n.gstin || "", placeOfSupply: n.placeOfSupply || "Not Applicable"
            });

            setDispatchDetails({
              originalInvoiceNo: n.paymentTerms || "",
              originalInvoiceDate: n.deliveryNoteDate ? new Date(n.deliveryNoteDate).toISOString().split('T')[0] : "",
              dispatchDocNo: n.dispatchDocNo || "", dispatchedThrough: n.dispatchedThrough || "",
              destination: n.destination || "", carrierName: n.carrierName || "",
              billOfLading: n.billOfLading || "", billOfLadingDate: n.billOfLadingDate || "",
              motorVehicleNo: n.motorVehicleNo || "", dispatchDate: n.dispatchDate || "",
              termsOfDelivery: n.termsOfDelivery || "", consigneeSameAsBilling: n.consigneeSameAsBilling || false,
              consigneeName: n.consigneeName || "", consigneeGSTIN: n.consigneeGSTIN || "",
              consigneeAddress: n.consigneeAddress || "", consigneeState: n.consigneeState || "",
              otherReferences: n.otherReferences || "", referenceNo: n.referenceNo || "",
              referenceDate: n.referenceDate ? new Date(n.referenceDate).toISOString().split('T')[0] : "",
              buyerOrderNo: n.buyerOrderNo || "", buyerOrderDate: n.buyerOrderDate ? new Date(n.buyerOrderDate).toISOString().split('T')[0] : "",
            });

            setItems(res.data.items.map(it => ({
              itemId: it.itemId || "",
              itemName: it.itemName,
              hsn_code: it.hsn_code || "",
              qty: it.qty || 0,
              per: it.per || "pcs",
              rate: it.rate || 0,
              discount: it.discount || 0,
              amount: it.amount || 0
            })));
          }
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    })();

    if (companyId && !id) {
      axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher-util/next/${companyId}/debit_note`)
        .then(res => setVoucherNo(res.data.nextNumber))
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
          `${it.productName}${it.godown ? ` - ${it.godown}` : ""}` === value
      );
      if (selected) {
        const qty = parseFloat(selected.finishedQty) || 1;
        const rate = parseFloat(selected.effectiveRatePerFinished) || parseFloat(selected.rate) || 0;
        const amount = parseFloat(selected.grandTotal) || (qty * rate);

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

  const openStockModal = (itemName) => {

  const stateToSave = {

    voucherNo,

    date,

    partyLedger,

    purchaseLedger,

    narration,

    gstType,

    gstRate,

    igstRate,

    cgstRate,

    sgstRate,

    partyDetails,

    dispatchDetails,

    items
  };

  sessionStorage.setItem(
    "debitNoteState",
    JSON.stringify(stateToSave)
  );

  navigate(
    `/accounting/client/stockItemCreation?redirect=/accounting/client/debitNote&name=${encodeURIComponent(itemName || "")}`
  );
};

  const addRow = () => setItems([...items, { itemId: "", itemName: "", hsn_code: "", qty: 1, per: "pcs", rate: 0, discount: 0, amount: 0 }]);
  const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
  const gstAmount = (subtotal * (Number(igstRate) + Number(cgstRate) + Number(sgstRate))) / 100;
  const grandTotal = subtotal + gstAmount;

  const handleAutoGST = () => {
    setGstType("Auto"); setGstRate(18); setIgstRate(0); setCgstRate(9); setSgstRate(9);
    Swal.fire({ icon: "success", title: "GST Applied", text: "Automatically applied 18% GST (CGST: 9%, SGST: 9%)", timer: 2000, showConfirmButton: false });
  };

  const handleManualGST = async () => {
    const { value: gstInput } = await Swal.fire({ title: "Enter GST Percentage", input: "number", inputPlaceholder: "e.g., 5, 12, 18, 28", showCancelButton: true, confirmButtonText: "Next" });
    if (gstInput) {
      const rate = parseFloat(gstInput);
      const { value: gstChoice } = await Swal.fire({ title: "Select GST Type", input: "select", inputOptions: { intra: "Intra-state (CGST + SGST)", inter: "Inter-state (IGST)" }, inputPlaceholder: "Select tax type", showCancelButton: true, confirmButtonText: "Apply" });
      if (gstChoice) {
        setGstType("Manual"); setGstRate(rate);
        if (gstChoice === "intra") { setCgstRate(rate / 2); setSgstRate(rate / 2); setIgstRate(0); Swal.fire({ icon: "success", title: "GST Added", text: `${gstInput}% Intra-state tax applied`, timer: 2000, showConfirmButton: false }); }
        else { setCgstRate(0); setSgstRate(0); setIgstRate(rate); Swal.fire({ icon: "success", title: "IGST Added", text: `${gstInput}% Integrated tax applied`, timer: 2000, showConfirmButton: false }); }
      }
    }
  };

  const handleCreateDebitNote = async () => {
    const employee_id = user?.employee_id || null;
    const role = userRole || "admin";

    const payload = {
      voucherNo, date, partyLedger, purchaseLedger, partyDetails, dispatchDetails, narration,
      items: items.map(it => ({ ...it, qty: parseFloat(it.qty) || 0, rate: parseFloat(it.rate) || 0, discount: parseFloat(it.discount) || 0 })),
      subtotal, gst_amount: gstAmount, igst_rate: igstRate, cgst_rate: cgstRate, sgst_rate: sgstRate,
      igst_amount: (subtotal * igstRate) / 100, cgst_amount: (subtotal * cgstRate) / 100, sgst_amount: (subtotal * sgstRate) / 100,
      totalAmount: grandTotal, grand_total: grandTotal,
      employee_id, role
    };
    try {
      if (isEditMode) {
        await axios.put(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/notes/updateDebit/${id}`, payload);
        Swal.fire("Success", "Debit Note Updated Successfully", "success");
        navigate("/accounting/client/debitNotesList");
      } else {
        const res = await axios.post(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/notes/createDebitNote/${companyId}`, payload);
        Swal.fire({
          icon: "success",
          title: "Saved Successfully",
          text: "Debit Note saved!",
          showCancelButton: true,
          confirmButtonText: "Download PDF",
          cancelButtonText: "Close"
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              const pdfRes = await axios.get(
                `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/notes/generate-pdf/${res.data.noteId}`
              );
              if (pdfRes.data.success) {
                const pdfUrl = `${import.meta.env.VITE_ACCOUNTING_URL}${pdfRes.data.pdfPath}`;
                

                window.open(pdfUrl, "_blank");
                

                fetch(pdfUrl)
                  .then(response => response.blob())
                  .then(blob => {
                    const blobUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = blobUrl;
                    link.download = pdfUrl.split("/").pop() || "DebitNote.pdf";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(blobUrl);
                  })
                  .catch(err => console.error("Error downloading PDF:", err));
              } else {
                Swal.fire("Error", "PDF not generated", "error");
              }
            } catch (error) {
              console.error(error);
              Swal.fire("Error", "Failed to fetch PDF", "error");
            }
          }
        });
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        Swal.fire("Warning", "Voucher Number Already Exists!", "warning");
      } else {
        Swal.fire("Error", "Failed to save debit note", "error");
      }
    }
  };

  return (
    <div className="bg-[#f7f7f5] min-h-screen p-6 md:p-10 pb-20">
      

      <div className="flex items-end justify-between mb-7 pb-5 border-b-[1.5px] border-[#e2e2dc]">
        <h1 className="font-serif text-[30px] text-[#0f1117] m-0 leading-[1.15]">Debit Note</h1>
      </div>


      <div className="bg-white border border-[#e2e2dc] rounded-[10px] shadow-sm p-6 mb-5">
        <p className="text-[12px] font-semibold tracking-widest uppercase text-[#5c6070] mb-4.5 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-[#e2e2dc]">
          Voucher Details
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#5c6070]">Voucher No</label>
            <input className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" value={voucherNo} onChange={e => setVoucherNo(e.target.value)} placeholder="DN-001" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#5c6070]">Date</label>
            <input type="date" className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" value={date} onChange={e => setDate(e.target.value)} />
          </div>
                    <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#5c6070]">Party Ledger</label>
            <select className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" value={partyLedger} onChange={e => {
              const sel = ledgers.find(l => String(l.id) === String(e.target.value));
              setPartyLedger(e.target.value);
              if (sel) setPartyDetails({ ...partyDetails, mailingName: sel.mailingName || sel.name, address: sel.address || "", state: sel.state || "Not Applicable", country: sel.country || "India", pincode: sel.pincode || "", gstin: sel.gstin || "" });
            }}>
              <option value="">Select Supplier</option>
              {ledgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">


        </div>
      </div>


      <div className="bg-white border border-[#e2e2dc] rounded-[10px] shadow-sm p-6 mb-5">
        <div className="flex gap-1 mb-5">
          <button className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium cursor-pointer border-[1.5px] transition-all ${activeTab === "party" ? "bg-[#1a56db] text-white border-[#1a56db]" : "bg-transparent text-[#5c6070] border-[#e2e2dc]"}`} onClick={() => setActiveTab("party")}>Party Details</button>
          <button className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium cursor-pointer border-[1.5px] transition-all ${activeTab === "dispatch" ? "bg-[#1a56db] text-white border-[#1a56db]" : "bg-transparent text-[#5c6070] border-[#e2e2dc]"}`} onClick={() => setActiveTab("dispatch")}>Receipt & Reference</button>
        </div>

        {activeTab === "party" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <FieldRow label="Mailing Name">
                <input className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" value={partyDetails.mailingName} onChange={e => setPartyDetails({ ...partyDetails, mailingName: e.target.value })} />
              </FieldRow>
              <FieldRow label="Address">
                <textarea className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" rows="3" value={partyDetails.address} onChange={e => setPartyDetails({ ...partyDetails, address: e.target.value })} />
              </FieldRow>
            </div>
            <div>
         <FieldRow label="State">

  <select
    className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all bg-white"
    value={partyDetails.state}
    onChange={(e) =>
      setPartyDetails({
        ...partyDetails,
        state: e.target.value,
      })
    }
  >

    <option value="">
      Select State
    </option>

    {statesList.map((state) => (
      <option
        key={state}
        value={state}
      >
        {state}
      </option>
    ))}

  </select>

</FieldRow>
              <FieldRow label="Country">
                <input className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" value={partyDetails.country} onChange={e => setPartyDetails({ ...partyDetails, country: e.target.value })} />
              </FieldRow>
              <FieldRow label="Pincode">
                <input className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" value={partyDetails.pincode} onChange={e => setPartyDetails({ ...partyDetails, pincode: e.target.value })} />
              </FieldRow>
              <FieldRow label="GSTIN/UIN">
                <input className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all uppercase" value={partyDetails.gstin} onChange={e => setPartyDetails({ ...partyDetails, gstin: e.target.value })} />
              </FieldRow>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FieldRow label="Original Invoice No.">
                  <input className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" value={dispatchDetails.originalInvoiceNo} onChange={e => setDispatchDetails({ ...dispatchDetails, originalInvoiceNo: e.target.value })} />
                </FieldRow>
                <FieldRow label="Original Invoice Date">
                  <input type="date" className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" value={dispatchDetails.originalInvoiceDate} onChange={e => setDispatchDetails({ ...dispatchDetails, originalInvoiceDate: e.target.value })} />
                </FieldRow>
                <FieldRow label="Dispatch Doc No.">
                  <input className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" value={dispatchDetails.dispatchDocNo} onChange={e => setDispatchDetails({ ...dispatchDetails, dispatchDocNo: e.target.value })} />
                </FieldRow>
                <FieldRow label="Dispatched Through">
                  <input className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" value={dispatchDetails.dispatchedThrough} onChange={e => setDispatchDetails({ ...dispatchDetails, dispatchedThrough: e.target.value })} />
                </FieldRow>
                <FieldRow label="Destination">
                  <input className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" value={dispatchDetails.destination} onChange={e => setDispatchDetails({ ...dispatchDetails, destination: e.target.value })} />
                </FieldRow>
              </div>
              <div>
                <FieldRow label="Reference No.">
                  <input className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" value={dispatchDetails.referenceNo} onChange={e => setDispatchDetails({ ...dispatchDetails, referenceNo: e.target.value })} />
                </FieldRow>
                <FieldRow label="Reference Date">
                  <input type="date" className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" value={dispatchDetails.referenceDate} onChange={e => setDispatchDetails({ ...dispatchDetails, referenceDate: e.target.value })} />
                </FieldRow>
                <FieldRow label="Buyer Order No.">
                  <input className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" value={dispatchDetails.buyerOrderNo} onChange={e => setDispatchDetails({ ...dispatchDetails, buyerOrderNo: e.target.value })} />
                </FieldRow>
                <FieldRow label="Order Date">
                  <input type="date" className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" value={dispatchDetails.buyerOrderDate} onChange={e => setDispatchDetails({ ...dispatchDetails, buyerOrderDate: e.target.value })} />
                </FieldRow>
                <FieldRow label="Other Reference">
                  <input className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" value={dispatchDetails.otherReferences} onChange={e => setDispatchDetails({ ...dispatchDetails, otherReferences: e.target.value })} />
                </FieldRow>
                <FieldRow label="Terms of Delivery">
                  <textarea className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" rows="2" value={dispatchDetails.termsOfDelivery} onChange={e => setDispatchDetails({ ...dispatchDetails, termsOfDelivery: e.target.value })} />
                </FieldRow>
              </div>
            </div>


            <div className="mt-6 pt-6 border-t border-dashed border-[#e2e2dc]">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#5c6070] m-0">Consignee (Ship To)</h4>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#5c6070]">Same as Billing?</span>
                  <input type="checkbox" checked={dispatchDetails.consigneeSameAsBilling} onChange={e => setDispatchDetails({ ...dispatchDetails, consigneeSameAsBilling: e.target.checked })} className="w-3.5 h-3.5 m-0 cursor-pointer accent-[#1a56db]" />
                </label>
              </div>

              {!dispatchDetails.consigneeSameAsBilling && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <FieldRow label="Name">
                      <input className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" value={dispatchDetails.consigneeName} onChange={e => setDispatchDetails({ ...dispatchDetails, consigneeName: e.target.value })} />
                    </FieldRow>
                    <FieldRow label="GSTIN">
                      <input className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all uppercase" value={dispatchDetails.consigneeGSTIN} onChange={e => setDispatchDetails({ ...dispatchDetails, consigneeGSTIN: e.target.value })} />
                    </FieldRow>
                  </div>
                  <div>
                    <FieldRow label="State">
                      <input className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" value={dispatchDetails.consigneeState} onChange={e => setDispatchDetails({ ...dispatchDetails, consigneeState: e.target.value })} />
                    </FieldRow>
                    <FieldRow label="Address">
                      <textarea className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" rows={2} value={dispatchDetails.consigneeAddress} onChange={e => setDispatchDetails({ ...dispatchDetails, consigneeAddress: e.target.value })} style={{ resize: "none" }} />
                    </FieldRow>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>


      <div className="bg-white border border-[#e2e2dc] rounded-[10px] shadow-sm p-6 mb-5">
        <p className="text-[12px] font-semibold tracking-widest uppercase text-[#5c6070] mb-4.5 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-[#e2e2dc]">
          Item Details
        </p>
        <div className="overflow-x-auto border border-[#e2e2dc] rounded-md">
          <table className="w-full border-collapse text-[13.5px]">
            <thead className="bg-[#f7f7f5]">
              <tr>
                <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#5c6070] border-b-[1.5px] border-[#e2e2dc]">Item Name</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#5c6070] border-b-[1.5px] border-[#e2e2dc]">HSN/SAC</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#5c6070] border-b-[1.5px] border-[#e2e2dc]">Qty</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#5c6070] border-b-[1.5px] border-[#e2e2dc]">Per</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#5c6070] border-b-[1.5px] border-[#e2e2dc]">Rate</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#5c6070] border-b-[1.5px] border-[#e2e2dc]">Disc %</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-[#5c6070] border-b-[1.5px] border-[#e2e2dc]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} className="border-b border-[#e2e2dc] last:border-0">
                  <td className="px-3 py-2 relative">
                     <div className="relative group">
                    <input
                      list={`items-${idx}`}
                      className="w-full px-2 py-1.5 border-[1.5px] border-transparent rounded-[5px] text-[13.5px] text-[#0f1117] bg-transparent outline-none focus:border-[#1a56db] focus:bg-white transition-all"
                      placeholder="Select or enter item"
                      value={it.itemName}
                      onChange={(e) => handleItemChange(idx, "item", e.target.value)}
                    />
                    <datalist id={`items-${idx}`}>
                      {availableItems.map((ai) => (
                        <option key={ai.id} value={`${ai.productName}${ai.godown ? ` - ${ai.godown}` : ""}`} />
                      ))}
                    </datalist>
                       <button
                        onClick={() => openStockModal(it.itemName)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-50 rounded"
                        title="Create New Stock Item"
                      >
                        <HiPlus className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2"><input className="w-full px-2 py-1.5 border-[1.5px] border-transparent rounded-[5px] text-[13.5px] text-[#0f1117] bg-transparent outline-none focus:border-[#1a56db] focus:bg-white transition-all" value={it.hsn_code} onChange={e => handleItemChange(idx, "hsn_code", e.target.value)} /></td>
                  <td className="px-3 py-2"><input type="number" className="w-full px-2 py-1.5 border-[1.5px] border-transparent rounded-[5px] text-[13.5px] text-[#0f1117] bg-transparent outline-none focus:border-[#1a56db] focus:bg-white transition-all" value={it.qty} onChange={e => handleItemChange(idx, "qty", e.target.value)} /></td>
                  <td className="px-3 py-2"><input className="w-full px-2 py-1.5 border-[1.5px] border-transparent rounded-[5px] text-[13.5px] text-[#0f1117] bg-transparent outline-none focus:border-[#1a56db] focus:bg-white transition-all" value={it.per} onChange={e => handleItemChange(idx, "per", e.target.value)} /></td>
                  <td className="px-3 py-2"><input type="number" className="w-full px-2 py-1.5 border-[1.5px] border-transparent rounded-[5px] text-[13.5px] text-[#0f1117] bg-transparent outline-none focus:border-[#1a56db] focus:bg-white transition-all" value={it.rate} onChange={e => handleItemChange(idx, "rate", e.target.value)} /></td>
                  <td className="px-3 py-2"><input type="number" className="w-full px-2 py-1.5 border-[1.5px] border-transparent rounded-[5px] text-[13.5px] text-[#0f1117] bg-transparent outline-none focus:border-[#1a56db] focus:bg-white transition-all" value={it.discount} onChange={e => handleItemChange(idx, "discount", e.target.value)} /></td>
                  <td className="px-3 py-2 text-right font-bold text-[#0f1117]">₹ {Number(it.amount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="bg-[#1a56db] text-white px-5 py-2 text-[13.5px] font-semibold rounded-md mt-4 hover:opacity-88 transition-opacity" onClick={addRow}>+ Add Item</button>
      </div>


      <div className="bg-white border border-[#e2e2dc] rounded-[10px] shadow-sm p-6 mb-5">
        <p className="text-[12px] font-semibold tracking-widest uppercase text-[#5c6070] mb-4.5 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-[#e2e2dc]">
          Tax & Totals
        </p>
        <div className="flex justify-between items-start gap-6 flex-wrap">
          <div className="flex-1 min-w-80">
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#5c6070] mb-3">Apply GST</p>
            <div className="flex gap-2.5 mb-5">
              <button className="bg-[#0d7448] text-white px-5 py-2 text-[13.5px] font-semibold rounded-md hover:opacity-88 transition-opacity" onClick={handleAutoGST}>Auto GST</button>
              <button className="bg-[#b45309] text-white px-5 py-2 text-[13.5px] font-semibold rounded-md hover:opacity-88 transition-opacity" onClick={handleManualGST}>Manual GST</button>
            </div>
            {gstRate > 0 && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2.5 mb-4 rounded text-[14px] font-medium bg-[#ecfdf5] border border-[#a7f3d0] text-[#0d7448]">
                {gstRate}% GST applied — ₹{gstAmount.toFixed(2)}
              </div>
            )}
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#5c6070] mb-2.5">Component Breakdown</p>
            <div className="flex gap-3 flex-wrap">
              {[["IGST", "igstRate", igstRate, setIgstRate], ["CGST", "cgstRate", cgstRate, setCgstRate], ["SGST", "sgstRate", sgstRate, setSgstRate]].map(([label, key, val, setter]) => (
                <div key={key} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-[#5c6070]">{label} (%)</span>
                    <span className="text-[11px] font-bold ml-2 text-[#1a56db]">₹ {((subtotal * Number(val || 0)) / 100).toFixed(2)}</span>
                  </div>
                  <input
                    type="number"
                    className="w-22.5 px-2.5 py-1.75 border-[1.5px] border-[#e2e2dc] rounded-md text-[13px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all"
                    value={val}
                    onChange={e => setter(parseFloat(e.target.value) || 0)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#f7f7f5] border border-[#e2e2dc] rounded-md p-4 md:p-5 shrink-0 w-full md:w-70">
            <div className="flex justify-between items-center py-1.5 text-[13.5px] text-[#5c6070] border-b border-[#e2e2dc]"><span>Subtotal</span><span>₹ {subtotal.toFixed(2)}</span></div>
            {gstAmount > 0 && <div className="flex justify-between items-center py-1.5 text-[13.5px] text-[#5c6070] border-b border-[#e2e2dc]"><span>Total Tax (GST)</span><span>₹ {gstAmount.toFixed(2)}</span></div>}
            <div className="flex justify-between items-center py-2 text-[15.5px] font-bold text-[#0f1117] mt-1"><span>Grand Total</span><span>₹ {grandTotal.toFixed(2)}</span></div>
          </div>
        </div>
      </div>


      <div className="bg-white border border-[#e2e2dc] rounded-[10px] shadow-sm p-6 mb-5">
        <p className="text-[12px] font-semibold tracking-widest uppercase text-[#5c6070] mb-4.5 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-[#e2e2dc]">
          Narration
        </p>
        <textarea className="w-full px-3 py-2 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] outline-none focus:border-[#1a56db] transition-all" rows="3" value={narration} onChange={e => setNarration(e.target.value)} placeholder="Enter narration..." />
        <button className="bg-[#0d7448] text-white px-7 py-2.5 text-[14.5px] font-semibold rounded-md mt-6 hover:opacity-88 transition-opacity" onClick={handleCreateDebitNote}>Save Debit Note</button>
      </div>

    </div>
  );
};

export default DebitNote;
