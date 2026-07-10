import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useCompany } from "../context/CompanyContext";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

import {
  HiTruck,
  HiCheck,
  HiX,
  HiPlus,
  HiTrash,
} from "react-icons/hi";
import { Search, UserPlus } from "lucide-react";
import BulkImportButton from "./BulkImportButton";

const SearchableLedgerSelect = ({
  ledgers,
  value,
  onSelect,
  onCreateNew,
  placeholder = "Search or add ledger...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedLedger = ledgers.find((l) => String(l.id) === String(value));

  useEffect(() => {
    if (selectedLedger) {
      setSearchTerm(selectedLedger.name || selectedLedger.ledgerName);
    }
  }, [selectedLedger]);

  const filtered = ledgers.filter((l) =>
    (l.name || l.ledgerName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (selectedLedger)
          setSearchTerm(selectedLedger.name || selectedLedger.ledgerName);
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
          className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none pr-10"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={18} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-100 mt-1 w-full bg-white border border-[#e2e2dc] rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((l) => (
              <div
                key={l.id}
                className="px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer text-gray-700 border-b border-gray-50 last:border-b-0"
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
            <div className="px-4 py-2.5 text-sm text-gray-500 italic">
              No matches found
            </div>
          )}

          <div
            className="px-4 py-2.5 text-sm bg-gray-50 hover:bg-blue-100 cursor-pointer text-blue-600 font-medium flex items-center gap-2 border-t border-[#e2e2dc]"
            onClick={() => {
              onCreateNew(searchTerm);
              setIsOpen(false);
            }}
          >
            <UserPlus size={18} /> Add "{searchTerm || "New Ledger"}"
          </div>
        </div>
      )}
    </div>
  );
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  :root {
    --ink: #0f1117;
    --ink-muted: #5c6070;
    --ink-faint: #9ca3af;
    --surface: #f7f7f5;
    --surface-card: #ffffff;
    --surface-hover: #f0f0ee;
    --border: #e2e2dc;
    --border-strong: #c8c8c0;
    --accent: #1a56db;
    --accent-light: #eff4ff;
    --accent-hover: #1648c0;
    --green: #0d7448;
    --green-light: #ecfdf5;
    --amber: #b45309;
    --amber-light: #fffbeb;
    --red: #c0392b;
    --red-light: #fef2f2;
    --shadow-sm: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    --shadow-md: 0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04);
    --radius: 10px;
    --radius-sm: 6px;
  }

  .pv-wrap * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

  .pv-wrap {
    background: var(--surface);
    min-height: 100vh;
    padding: 32px 24px 80px;
  }

  /* ── Cards ── */
  .pv-card {
    background: var(--surface-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    padding: 24px;
    margin-bottom: 20px;
  }
  .pv-card-title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pv-card-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .pv-gst-input {
    width: 100px;
    padding: 9px 12px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 14px;
    color: var(--ink);
    background: var(--surface-card);
    transition: border-color .15s, box-shadow .15s;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    text-align: right;
  }
  .pv-gst-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(26,86,219,.1);
  }
  .pv-gst-input:read-only {
    background: var(--surface);
    color: var(--ink-muted);
    cursor: default;
  }

  /* ── GST Buttons ── */
  .pv-gst-buttons { display: flex; gap: 10px; flex-wrap: wrap; }

  .pv-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px;
    border: none; border-radius: var(--radius-sm);
    font-size: 13.5px; font-weight: 500; cursor: pointer;
    transition: opacity .15s, transform .1s;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: .01em;
  }
  .pv-btn:active { transform: scale(.97); }
  .pv-btn-green { background: var(--green); color: #fff; }
  .pv-btn-green:hover { opacity: .88; }
  .pv-btn-amber { background: var(--amber); color: #fff; }
  .pv-btn-amber:hover { opacity: .88; }

  /* ── Totals panel ── */
  .pv-totals {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 18px 20px;
    min-width: 260px;
  }
  .pv-totals-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 13.5px; padding: 4px 0; color: var(--ink-muted);
  }
  .pv-totals-row.grand {
    font-size: 17px; font-weight: 700;
    color: var(--ink); border-top: 1.5px solid var(--border-strong);
    margin-top: 8px; padding-top: 12px;
  }
  .pv-totals-row .val { font-variant-numeric: tabular-nums; font-weight: 500; color: var(--ink); }
  .pv-totals-row.grand .val { color: var(--accent); }
  .pv-totals-row.gst-line .val { color: var(--green); }

  .pv-textarea {
    width: 100%;
    padding: 9px 12px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 14px;
    color: var(--ink);
    background: var(--surface-card);
    transition: border-color .15s, box-shadow .15s;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    resize: vertical;
    min-height: 80px;
    line-height: 1.5;
  }
  .pv-textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(26,86,219,.1);
  }
`;

const FieldRow = ({ label, children, required }) => (
  <div className="grid grid-cols-[140px_1fr] gap-3 mb-3 items-center">
    <label className="text-[12px] font-medium text-[#5c6070] tracking-[0.01em]">
      {label} {required && <span className="text-[#c0392b] ml-0.5">*</span>}
    </label>
    <div>{children}</div>
  </div>
);

const StockCreationModal = ({
  stockForm,
  setShowStockModal,
  handleStockFormChange,
  handleStockSubmit,
}) => (
  <div className="fixed inset-0 backdrop-blur-md bg-opacity-100 flex items-center justify-center p-4 z-60">
    <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl border border-gray-200">
      <div className="bg-blue-600 px-6 py-4 flex justify-between items-center rounded-t-xl shadow-md">
        <h3 className="text-xl font-semibold text-white">
          Create New Stock Item
        </h3>
        <button
          onClick={() => setShowStockModal(false)}
          className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-blue-700 transition-colors"
        >
          <HiX className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Name *</label>
          <input
            name="name"
            value={stockForm.name || ""}
            onChange={handleStockFormChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Item name"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Alias</label>
          <input
            name="alias"
            value={stockForm.alias || ""}
            onChange={handleStockFormChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Alias"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Under (Group)
          </label>
          <select
            name="under"
            value={stockForm.under || "Primary"}
            onChange={handleStockFormChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
            <option value="Primary">Primary</option>
            <option value="Raw Materials">Raw Materials</option>
            <option value="Finished Goods">Finished Goods</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Units</label>
          <select
            name="units"
            value={stockForm.units || "Nos"}
            onChange={handleStockFormChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
            <option value="Nos">Nos</option>
            <option value="Kg">Kg</option>
            <option value="Litres">Litres</option>
            <option value="Pcs">Pcs</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-medium mb-1">
            HSN Code
          </label>
          <input
            name="hsn"
            value={stockForm.hsn || ""}
            onChange={handleStockFormChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="HSN"
          />
        </div>
        <div className="md:col-span-2 flex justify-end gap-2 mt-4">
          <button
            onClick={() => setShowStockModal(false)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStockSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg font-medium transition-colors"
          >
            Create Item
          </button>
        </div>
      </div>
    </div>
  </div>
);

const SaleVoucher = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [ledgers, setLedgers] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const { companyId } = useCompany();
  const [activeDetailTab, setActiveDetailTab] = useState("party");
  const [ewayBillRequired, setEwayBillRequired] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockForm, setStockForm] = useState({
    name: "",
    alias: "",
    under: "Primary",
    units: "Nos",
    hsn: "",
    gstApplicable: "Applicable",
    taxability: "Taxable",
    igst: "",
    cgst: "",
    sgst: "",
    cess: "",
    typeOfSupply: "Goods",
    rateOfDuty: "",
    godown: "Main Location",
    batchNo: "",
    mfgDate: "",
    expDate: "",
    openingBalance: "",
    ratePerUnit: "",
    value: "",
    partNo: "",
    description: "",
    salesRate: "",
    purchaseRate: "",
    mrp: "",
    minStockLevel: "",
    maxStockLevel: "",
    reorderLevel: "",
  });

  const handleStockFormChange = (e) => {
    setStockForm({ ...stockForm, [e.target.name]: e.target.value });
  };

  const openStockModal = (itemName) => {
    const stateToSave = {
      voucher,
      ewayBillRequired,
      ewayBillData,
    };
    sessionStorage.setItem("saleVoucherState", JSON.stringify(stateToSave));

    const role = user?.role || "admin";
    const basePath =
      role === "employee"
        ? "/employee/hr/accounting/client"
        : "/accounting/client";
    navigate(
      `${basePath}/stockItemCreation?redirect=${basePath}/salevoucher&name=${encodeURIComponent(itemName || "")}`,
    );
  };

  const handleStockSave = async () => {
    try {
      if (!stockForm.name) {
        Swal.fire("Error", "Item name is required", "error");
        return;
      }

      const payload = {
        companyId,
        productName: stockForm.name,
        alias: stockForm.alias,
        under: stockForm.under,
        units: stockForm.units,
        hsn: stockForm.hsn,
        gstApplicable: stockForm.gstApplicable,
        taxability: stockForm.taxability,
        igst: stockForm.igst || 0,
        cgst: stockForm.cgst || 0,
        sgst: stockForm.sgst || 0,
        cess: stockForm.cess || 0,
        typeOfSupply: stockForm.typeOfSupply,
        rateOfDuty: stockForm.rateOfDuty || 0,
        godown: stockForm.godown,
        batchNo: stockForm.batchNo,
        mfgDate: stockForm.mfgDate || null,
        expDate: stockForm.expDate || null,
        openingBalance: stockForm.openingBalance || 0,
        ratePerUnit: stockForm.ratePerUnit || 0,
        value: stockForm.value || 0,
        partNo: stockForm.partNo,
        description: stockForm.description,
        salesRate: stockForm.salesRate || 0,
        purchaseRate: stockForm.purchaseRate || 0,
        mrp: stockForm.mrp || 0,
        minStockLevel: stockForm.minStockLevel || 0,
        maxStockLevel: stockForm.maxStockLevel || 0,
        reorderLevel: stockForm.reorderLevel || 0,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/manufacturing/createItem`,
        payload,
      );

      const newItem = res.data.item || res.data;
      setAvailableItems((prev) => [...prev, newItem]);
      setShowStockModal(false);
      Swal.fire("Success", "Item created successfully", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to create item", "error");
    }
  };

  const [voucher, setVoucher] = useState({
    date: "",
    customer: "",
    ledger: "",
    narration: "",
    gstType: "",
    gstRate: 0,
    igst: 0,
    cgst: 0,
    sgst: 0,
    invoiceNo: "",
    items: [
      {
        itemId: "",
        item: "",
        hsn_code: "",
        qty: 1,
        rate: 0,
        per: "Nos",
        amount: 0,
      },
    ],

    mailingName: "",
    address: "",
    state: "",
    country: "India",
    gstRegistrationType: "Regular",
    gstin: "",
    placeOfSupply: "",
    pincode: "",

    paymentTerms: "",
    otherReferences: "",
    buyerOrderNo: "",
    buyerOrderDate: "",
    deliveryNoteNo: "",
    deliveryNoteDate: "",
    dispatchDocNo: "",
    dispatchedThrough: "",
    destination: "",
    carrierName: "",
    billOfLading: "",
    motorVehicleNo: "",
    dispatchDate: "",
    referenceNo: "",
    referenceDate: "",
    termsOfDelivery: "",
    consigneeSameAsBilling: true,
    consigneeName: "",
    consigneeGSTIN: "",
    consigneeAddress: "",
    consigneeState: "",
    consigneePincode: "",
  });

  const [ewayBillData, setEwayBillData] = useState({
    ewayBillNo: "",
    ewayBillDate: "",
    consolidatedEwayBillNo: "",
    subType: "Not Applicable",
    consignorName: "",
    consignorGSTIN: "",
    consignorState: "",
    consignorPincode: "",
    consignorAddress: "",
    consigneeName: "",
    consigneeGSTIN: "",
    consigneeState: "",
    consigneePincode: "",
    consigneeAddress: "",
    transporterName: "",
    transporterID: "",
    distanceKM: "",
    documentNo: "",
    transportMode: "Road",
    vehicleNumber: "",
    vehicleType: "Regular",
    transportDate: "",
  });

  const [statesList, setStatesList] = useState([]);

  useEffect(() => {
    axios
      .post("https://countriesnow.space/api/v0.1/countries/states", {
        country: "India",
      })
      .then((res) => setStatesList(res.data.data.states.map((s) => s.name)))
      .catch((err) => console.error("Error fetching states:", err));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) return;
      try {
        const ledgerRes = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`,
        );
        setLedgers(ledgerRes.data.data || ledgerRes.data || []);

        const itemRes = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/manufacturing/getItems/${companyId}`,
        );
        setAvailableItems(itemRes.data.data || itemRes.data || []);

        const savedState = sessionStorage.getItem("saleVoucherState");
        if (savedState) {
          const state = JSON.parse(savedState);

          const loadedItems = itemRes.data.data || itemRes.data || [];
          const updatedItems = state.voucher.items.map((itemRow) => {
            if (!itemRow.itemId && itemRow.item) {
              const selected = loadedItems.find(
                (it) =>
                  String(it.id) === String(itemRow.item) ||
                  it.productName === itemRow.item ||
                  `${it.productName}${it.godown ? ` - ${it.godown}` : ""}` ===
                    itemRow.item,
              );
              if (selected) {
                const qty = parseFloat(selected.finishedQty) || 1;
                const rate =
                  parseFloat(selected.effectiveRatePerFinished) ||
                  parseFloat(selected.rate) ||
                  0;
                const amount = parseFloat(selected.grandTotal) || qty * rate;
                return {
                  ...itemRow,
                  itemId: selected.id,
                  item: selected.productName || "",
                  hsn_code: selected.hsn_code || selected.hsn || "",
                  qty: qty,
                  rate: rate,
                  per: selected.units || "Nos",
                  amount: amount,
                };
              }
            }
            return itemRow;
          });

          setVoucher({
            ...state.voucher,
            items: updatedItems,
          });
          setEwayBillRequired(state.ewayBillRequired);
          setEwayBillData(state.ewayBillData);
          sessionStorage.removeItem("saleVoucherState");
          Swal.fire({
            title: "Welcome back!",
            text: "Your voucher progress has been restored.",
            icon: "info",
            timer: 2000,
            showConfirmButton: false,
          });
        }

        if (id) {
          setIsEditMode(true);
          const voucherRes = await axios.get(
            `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/sale-voucher/single/${id}`,
          );
          const v = voucherRes.data;
          if (v) {
            setVoucher({
              date: v.date ? new Date(v.date).toISOString().split("T")[0] : "",
              customer: v.customer || v.partyName || "",
              ledger: String(v.ledgerId || v.ledger || ""),
              narration: v.narration || "",
              gstType:
                (v.gst_percentage || v.gstPercentage || 0) > 0 ? "Auto" : "",
              gstRate: v.gst_percentage || v.gstPercentage || 0,
              igst: v.subtotal
                ? (((v.igst || 0) / v.subtotal) * 100).toFixed(2)
                : 0,
              cgst: v.subtotal
                ? (((v.cgst || 0) / v.subtotal) * 100).toFixed(2)
                : 0,
              sgst: v.subtotal
                ? (((v.sgst || 0) / v.subtotal) * 100).toFixed(2)
                : 0,
              invoiceNo: v.invoiceNo || v.voucherNo || "",
              items:
                v.items && v.items.length > 0
                  ? v.items.map((i) => ({
                      itemId: String(i.itemId || ""),
                      item: i.item || i.itemName || "",
                      hsn_code: i.hsn_code || "",
                      qty: Number(i.qty || i.itemQuantity || 1),
                      rate: Number(i.rate) || 0,
                      amount: Number(i.amount) || 0,
                    }))
                  : [
                      {
                        itemId: "",
                        item: "",
                        hsn_code: "",
                        qty: 1,
                        rate: 0,
                        amount: 0,
                      },
                    ],

              mailingName: v.mailingName || "",
              address: v.address || "",
              state: v.state || "",
              country: v.country || "India",
              gstRegistrationType: v.gstRegistrationType || "Regular",
              gstin: v.gstin || "",
              placeOfSupply: v.placeOfSupply || "",

              paymentTerms: v.paymentTerms || "",
              otherReferences: v.otherReferences || "",
              buyerOrderNo: v.buyerOrderNo || "",
              buyerOrderDate: v.buyerOrderDate
                ? new Date(v.buyerOrderDate).toISOString().split("T")[0]
                : "",
              deliveryNoteNo: v.deliveryNoteNo || "",
              deliveryNoteDate: v.deliveryNoteDate
                ? new Date(v.deliveryNoteDate).toISOString().split("T")[0]
                : "",
              dispatchDocNo: v.dispatchDocNo || "",
              dispatchedThrough: v.dispatchedThrough || "",
              destination: v.destination || "",
              carrierName: v.carrierName || "",
              billOfLading: v.billOfLading || "",
              motorVehicleNo: v.motorVehicleNo || "",
              dispatchDate: v.dispatchDate
                ? new Date(v.dispatchDate).toISOString().split("T")[0]
                : "",
              referenceNo: v.referenceNo || "",
              referenceDate: v.referenceDate
                ? new Date(v.referenceDate).toISOString().split("T")[0]
                : "",
              termsOfDelivery: v.termsOfDelivery || "",
              consigneeSameAsBilling:
                v.consigneeSameAsBilling !== undefined
                  ? v.consigneeSameAsBilling
                  : true,
              consigneeName: v.consigneeName || "",
              consigneeGSTIN: v.consigneeGSTIN || "",
              consigneeAddress: v.consigneeAddress || "",
              consigneeState: v.consigneeState || "",
              consigneePincode: v.consigneePincode || "",
            });

            if (v.ewayBillDetails) {
              setEwayBillRequired(true);
              setEwayBillData(v.ewayBillDetails);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();

    if (companyId && !id) {
      axios
        .get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher-util/next/${companyId}/sales`,
        )
        .then((res) =>
          setVoucher((prev) => ({ ...prev, invoiceNo: res.data.nextNumber })),
        )
        .catch(console.error);
    }
  }, [companyId, id]);

  const handleItemChange = (index, field, value) => {
    const updated = [...voucher.items];
    if (field === "item") {
      const selected = availableItems.find(
        (it) =>
          String(it.id) === String(value) ||
          it.productName === value ||
          `${it.productName}${it.godown ? ` - ${it.godown}` : ""}` === value,
      );

      if (selected) {
        const itemName = selected.productName || selected.name || "";
        let availableStock = 0;
        availableItems.forEach((it) => {
          if ((it.productName || it.name || "") === itemName) {
            let qtyStr = it.finishedQty;
            if (qtyStr === undefined || qtyStr === null) {
              qtyStr = it.openingBalanceQty;
            }
            const q = parseFloat(qtyStr);
            if (!isNaN(q)) {
              availableStock += q;
            }
          }
        });

        const qty = availableStock;
        const rate =
          parseFloat(selected.effectiveRatePerFinished) ||
          parseFloat(selected.rate) ||
          0;
        const amount = qty * rate;

        updated[index] = {
          ...updated[index],
          itemId: selected.id,
          item: selected.productName || selected.name || "",
          hsn_code: selected.hsn_code || selected.hsn || "",
          qty: qty,
          rate: rate,
          per: selected.units || "Nos",
          amount: amount,
          availableStock: availableStock,
        };
      } else {
        updated[index].item = value;
        updated[index].itemId = "";
      }
    } else {
      updated[index][field] = value;
      if (field === "qty" || field === "rate") {
        const qty = parseFloat(updated[index].qty) || 0;
        const rate = parseFloat(updated[index].rate) || 0;
        updated[index].amount = qty * rate;
      }
    }
    setVoucher({ ...voucher, items: updated });
  };

  const addRow = () => {
    setVoucher({
      ...voucher,
      items: [
        ...voucher.items,
        {
          itemId: "",
          item: "",
          hsn_code: "",
          qty: 1,
          rate: 0,
          per: "Nos",
          amount: 0,
        },
      ],
    });
  };

  const removeRow = (index) => {
    const updatedItems = [...voucher.items];
    updatedItems.splice(index, 1);
    setVoucher({ ...voucher, items: updatedItems });
  };

  const totalAmount = voucher.items.reduce(
    (sum, r) => sum + Number(r.amount || 0),
    0,
  );

  const handleAutoGST = () => {
    const rate = 18;
    const amount = (totalAmount * rate) / 100;

    setVoucher({
      ...voucher,
      gstType: "Auto",
      gstRate: rate,
      cgst: 9,
      sgst: 9,
      igst: 0,
    });
    Swal.fire({
      icon: "success",
      title: "GST Applied",
      text: `Automatically applied 18% GST (CGST: 9%, SGST: 9%)`,
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
        if (gstChoice === "intra") {
          setVoucher({
            ...voucher,
            gstType: "Manual",
            gstRate: rate,
            cgst: rate / 2,
            sgst: rate / 2,
            igst: 0,
          });
          Swal.fire({
            icon: "success",
            title: "GST Added",
            text: `${gstInput}% Intra-state tax applied`,
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          setVoucher({
            ...voucher,
            gstType: "Manual",
            gstRate: rate,
            cgst: 0,
            sgst: 0,
            igst: rate,
          });
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

  const effectiveGstRate =
    Number(voucher.igst || 0) +
    Number(voucher.cgst || 0) +
    Number(voucher.sgst || 0);
  const gstAmount = (totalAmount * effectiveGstRate) / 100;
  const grandTotal = totalAmount + gstAmount;

  const handleEwayBillCheckbox = () => {
    if (!ewayBillRequired) setShowEwayBillModal(true);
    else {
      Swal.fire({
        title: "Remove E-way Bill?",
        text: "Are you sure you want to remove e-way bill details?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, remove",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          setEwayBillRequired(false);
          setEwayBillData({
            ewayBillNo: "",
            ewayBillDate: "",
            consolidatedEwayBillNo: "",
            subType: "Not Applicable",
            consignorName: "",
            consignorGSTIN: "",
            consignorState: "",
            consignorPincode: "",
            consignorAddress: "",
            consigneeName: "",
            consigneeGSTIN: "",
            consigneeState: "",
            consigneePincode: "",
            consigneeAddress: "",
            transporterName: "",
            transporterID: "",
            distanceKM: "",
            documentNo: "",
            transportMode: "Road",
            vehicleNumber: "",
            vehicleType: "Regular",
            transportDate: "",
          });
        }
      });
    }
  };

  const handleEwayBillChange = (field, value) =>
    setEwayBillData((prev) => ({ ...prev, [field]: value }));
  const handleEwayBillSave = () => {
    if (!ewayBillData.ewayBillNo || !ewayBillData.ewayBillDate) {
      Swal.fire("Error", "Please fill required e-way bill fields", "warning");
      return;
    }
    setEwayBillRequired(true);
    setShowEwayBillModal(false);
    Swal.fire({
      icon: "success",
      title: "E-way Bill Added",
      text: "E-way bill details saved successfully",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleQuickCreateLedger = async (initialName) => {
    const stateToSave = {
      voucher,
      ewayBillRequired,
      ewayBillData,
    };
    sessionStorage.setItem("saleVoucherState", JSON.stringify(stateToSave));

    const role = user?.role || "admin";
    const basePath =
      role === "employee"
        ? "/employee/hr/accounting/client"
        : "/accounting/client";
    const redirectPath = id
      ? `${basePath}/salevoucher/${id}`
      : `${basePath}/salevoucher`;
    navigate(
      `${basePath}/ledger?redirect=${redirectPath}&name=${encodeURIComponent(initialName)}`,
    );
  };

  const saveVoucher = async () => {
    if (!voucher.date || !voucher.customer || !voucher.ledger)
      return Swal.fire(
        "Missing Fields",
        "Please fill all required fields",
        "warning",
      );
    if (ewayBillRequired && !ewayBillData.ewayBillNo)
      return Swal.fire(
        "E-way Bill Required",
        "Please fill e-way bill details or uncheck the e-way bill option",
        "warning",
      );

    const validItems = voucher.items.filter(
      (i) => i.item && i.item.trim() !== "",
    );

    const hasInsufficientStock = validItems.some(
      (i) =>
        i.itemId &&
        ((Number(i.qty) || 0) > (Number(i.availableStock) || 0) ||
          (Number(i.availableStock) || 0) <= 0),
    );
    if (hasInsufficientStock) {
      const result = await Swal.fire({
        title: "No Quantity",
        text: "Some items have no sufficient stock quantity. Still create voucher?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, create it",
        cancelButtonText: "No, cancel",
      });
      if (!result.isConfirmed) {
        return;
      }
    }

    const employeeId = user?.employee_id || null;
    const role = user?.role || "admin";

    try {
      const voucherData = {
        companyId: companyId,
        date: voucher.date,
        customer: voucher.customer,
        ledgerId: voucher.ledger,
        subtotal: totalAmount,
        gst_percentage: voucher.gstRate || effectiveGstRate,
        gst_amount: gstAmount,
        igst: (totalAmount * Number(voucher.igst || 0)) / 100,
        cgst: (totalAmount * Number(voucher.cgst || 0)) / 100,
        sgst: (totalAmount * Number(voucher.sgst || 0)) / 100,
        igst_rate: Number(voucher.igst || 0),
        cgst_rate: Number(voucher.cgst || 0),
        sgst_rate: Number(voucher.sgst || 0),
        grand_total: grandTotal,
        narration: voucher.narration,
        invoiceNo: voucher.invoiceNo,
        items: validItems.map((i) => ({
          item: i.item,
          qty: i.qty,
          rate: i.rate,
          per: i.per || "",
          amount: i.amount,
          hsn_code: i.hsn_code,
        })),

        mailingName: voucher.mailingName,
        address: voucher.address,
        state: voucher.state,
        country: voucher.country,
        gstRegistrationType: voucher.gstRegistrationType,
        gstin: voucher.gstin,
        placeOfSupply: voucher.placeOfSupply,

        paymentTerms: voucher.paymentTerms,
        otherReferences: voucher.otherReferences,
        buyerOrderNo: voucher.buyerOrderNo,
        buyerOrderDate: voucher.buyerOrderDate,
        deliveryNoteNo: voucher.deliveryNoteNo,
        deliveryNoteDate: voucher.deliveryNoteDate,
        dispatchDocNo: voucher.dispatchDocNo,
        dispatchedThrough: voucher.dispatchedThrough,
        destination: voucher.destination,
        carrierName: voucher.carrierName,
        billOfLading: voucher.billOfLading,
        motorVehicleNo: voucher.motorVehicleNo,
        dispatchDate: voucher.dispatchDate,
        referenceNo: voucher.referenceNo,
        referenceDate: voucher.referenceDate,
        termsOfDelivery: voucher.termsOfDelivery,

        consigneeSameAsBilling: voucher.consigneeSameAsBilling,
        consigneeName: voucher.consigneeSameAsBilling
          ? ""
          : voucher.consigneeName,
        consigneeGSTIN: voucher.consigneeSameAsBilling
          ? ""
          : voucher.consigneeGSTIN,
        consigneeAddress: voucher.consigneeSameAsBilling
          ? ""
          : voucher.consigneeAddress,
        consigneeState: voucher.consigneeSameAsBilling
          ? ""
          : voucher.consigneeState,
        consigneePincode: voucher.consigneeSameAsBilling
          ? voucher.pincode
          : voucher.consigneePincode,
        pincode: voucher.pincode,

        ...(ewayBillRequired && { ewayBillDetails: ewayBillData }),
        ...(employeeId && { employee_id: employeeId }),
        role,
      };

      if (isEditMode) {
        await axios.put(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/sale-voucher/${id}`,
          voucherData,
        );
        const role = user?.role || "admin";
        const basePath =
          role === "employee"
            ? "/employee/hr/accounting/client"
            : "/accounting/client";
        navigate(`${basePath}/listOfSaleVoucher`);
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/sale-voucher`,
          voucherData,
        );
        Swal.fire({
          icon: "success",
          title: "Saved Successfully",
          text: "Sales voucher saved successfully!",
          showCancelButton: true,
          confirmButtonText: "Download PDF",
          cancelButtonText: "Close",
        }).then((result) => {
          if (result.isConfirmed && res.data?.pdf_path) {
            const pdfUrl = `${import.meta.env.VITE_ACCOUNTING_URL}/${res.data.pdf_path}`;
            window.open(pdfUrl, "_blank");
            fetch(pdfUrl)
              .then((response) => response.blob())
              .then((blob) => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download =
                  res.data.pdf_path.split("/").pop() || "SaleVoucher.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
              })
              .catch((err) => console.error("Error downloading PDF:", err));
          }
        });
        setVoucher({
          date: "",
          customer: "",
          ledger: "",
          narration: "",
          gstType: "",
          gstRate: 0,
          igst: 0,
          cgst: 0,
          sgst: 0,
          invoiceNo: "",
          items: [
            { itemId: "", item: "", hsn_code: "", qty: 1, rate: 0, amount: 0 },
          ],
        });
        setEwayBillRequired(false);
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        Swal.fire("Warning", "Invoice Number Already Exists!", "warning");
      } else {
        Swal.fire(
          "Error",
          error.response?.data?.message || "Failed to save voucher",
          "error",
        );
      }
    }
  };

  const handleBulkImport = async (data) => {
    try {
      if (!data || data.length === 0) {
        Swal.fire("Error", "Excel/CSV contains no data", "error");
        return;
      }

      const grouped = {};

      data.forEach((row) => {
        const invoiceNo =
          row.InvoiceNo ||
          row.invoiceNo ||
          row.VoucherNo ||
          `SAL-${Date.now()}`;

        if (!grouped[invoiceNo]) {
          grouped[invoiceNo] = {
            date: row.Date
              ? new Date(row.Date).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],

            invoiceNo,

            customer:
              row.Customer ||
              row.CustomerName ||
              row.PartyName ||
              "Walk-in Customer",

            narration: row.Narration || "",

            mailingName: row.MailingName || row.Customer || row.PartyName || "",

            address: row.Address || "",

            state: row.State || "",

            country: row.Country || "India",

            pincode: row.Pincode || "",

            gstin: row.GSTIN || "",

            placeOfSupply: row.PlaceOfSupply || "",

            paymentTerms: row.PaymentTerms || "",

            otherReferences: row.OtherReferences || "",

            buyerOrderNo: row.BuyerOrderNo || "",

            buyerOrderDate: row.BuyerOrderDate || "",

            deliveryNoteNo: row.DeliveryNoteNo || "",

            deliveryNoteDate: row.DeliveryNoteDate || "",

            dispatchDocNo: row.DispatchDocNo || "",

            dispatchedThrough: row.DispatchedThrough || "",

            destination: row.Destination || "",

            carrierName: row.CarrierName || "",

            billOfLading: row.BillOfLading || "",

            motorVehicleNo: row.VehicleNumber || "",

            dispatchDate: row.DispatchDate || "",

            referenceNo: row.ReferenceNo || "",

            referenceDate: row.ReferenceDate || "",

            termsOfDelivery: row.TermsOfDelivery || "",

            consigneeName: row.ConsigneeName || "",

            consigneeGSTIN: row.ConsigneeGSTIN || "",

            consigneeAddress: row.ConsigneeAddress || "",

            consigneeState: row.ConsigneeState || "",

            consigneePincode: row.ConsigneePincode || "",

            ewayBillNo: row.EwayBillNo || "",

            ewayBillDate: row.EwayBillDate || "",

            distanceKM: row.DistanceKM || "",

            vehicleNumber: row.VehicleNumber || "",

            gst_percentage: parseFloat(row.GST || 0),

            igst: parseFloat(row.IGST || 0),

            cgst: parseFloat(row.CGST || 0),

            sgst: parseFloat(row.SGST || 0),

            items: [],
          };
        }

        grouped[invoiceNo].items.push({
          item: row.ItemName || row.Item || "",

          qty: parseFloat(row.Qty || 1),

          rate: parseFloat(row.Rate || 0),

          per: row.Unit || "Nos",

          amount:
            parseFloat(row.Amount || 0) ||
            parseFloat(row.Qty || 1) * parseFloat(row.Rate || 0),

          hsn_code: row.HSN || "",
        });
      });

      const vouchers = Object.values(grouped).map((v) => {
        const ledgerObj = ledgers.find(
          (l) =>
            (l.name || "").toLowerCase().trim() ===
            v.customer.toLowerCase().trim(),
        );

        const ledgerId = ledgerObj ? ledgerObj.id : null;

        const enrichedItems = v.items.map((item) => {
          const itemObj = availableItems.find(
            (i) =>
              (i.productName || "").toLowerCase().trim() ===
              item.item.toLowerCase().trim(),
          );

          if (itemObj) {
            return {
              itemId: itemObj.id,
              item: itemObj.productName,
              qty: item.qty,
              rate: item.rate,
              per: item.per,
              amount: item.amount,
              hsn_code: item.hsn_code,
            };
          }

          return {
            itemId: null,
            item: item.item,
            qty: item.qty,
            rate: item.rate,
            per: item.per,
            amount: item.amount,
            hsn_code: item.hsn_code,
          };
        });

        const subtotal = enrichedItems.reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0,
        );

        const effectiveRate = v.gst_percentage || v.igst + v.cgst + v.sgst;

        const gstAmount = (subtotal * effectiveRate) / 100;

        const grandTotal = subtotal + gstAmount;

        return {
          companyId,

          date: v.date,

          customer: v.customer,

          ledgerId,

          subtotal,

          gst_percentage: effectiveRate,

          gst_amount: gstAmount,

          grand_total: grandTotal,

          narration: v.narration,

          invoiceNo: v.invoiceNo,

          igst: (subtotal * v.igst) / 100,

          cgst: (subtotal * v.cgst) / 100,

          sgst: (subtotal * v.sgst) / 100,

          igst_rate: v.igst,

          cgst_rate: v.cgst,

          sgst_rate: v.sgst,

          items: enrichedItems,

          mailingName: v.mailingName,

          address: v.address,

          state: v.state,

          country: v.country,

          pincode: v.pincode,

          gstin: v.gstin,

          placeOfSupply: v.placeOfSupply,

          paymentTerms: v.paymentTerms,

          otherReferences: v.otherReferences,

          buyerOrderNo: v.buyerOrderNo,

          buyerOrderDate: v.buyerOrderDate,

          deliveryNoteNo: v.deliveryNoteNo,

          deliveryNoteDate: v.deliveryNoteDate,

          dispatchDocNo: v.dispatchDocNo,

          dispatchedThrough: v.dispatchedThrough,

          destination: v.destination,

          carrierName: v.carrierName,

          billOfLading: v.billOfLading,

          motorVehicleNo: v.motorVehicleNo,

          dispatchDate: v.dispatchDate,

          referenceNo: v.referenceNo,

          referenceDate: v.referenceDate,

          termsOfDelivery: v.termsOfDelivery,

          consigneeSameAsBilling: false,

          consigneeName: v.consigneeName,

          consigneeGSTIN: v.consigneeGSTIN,

          consigneeAddress: v.consigneeAddress,

          consigneeState: v.consigneeState,

          consigneePincode: v.consigneePincode,

          ewayBillDetails: {
            ewayBillNo: v.ewayBillNo,
            ewayBillDate: v.ewayBillDate,
            distanceKM: v.distanceKM,
            vehicleNumber: v.vehicleNumber,
          },
        };
      });

      await axios.post(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/sale-voucher/bulk-create`,
        {
          companyId,
          vouchers,
        },
      );

      Swal.fire(
        "Success",
        `${vouchers.length} vouchers imported successfully`,
        "success",
      );
    } catch (err) {
      console.error(err);

      Swal.fire(
        "Import Failed",
        err.response?.data?.message || "Bulk import failed",
        "error",
      );
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-[#f7f7f5] px-6 pt-8 pb-20 font-['DM_Sans',sans-serif] text-[#0f1117]">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-7 pb-5 border-b-[1.5px] border-[#e2e2dc]">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#1a56db] mb-1">
              Accounts Receivable
            </p>

            <h1 className="font-['DM_Serif_Display',serif] text-[30px] text-[#0f1117] leading-[1.15]">
              Sales Voucher
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`
        inline-flex items-center gap-1.5
        px-3 py-1
        rounded-full
        text-[11.5px]
        font-semibold
        tracking-[0.04em]
        whitespace-nowrap
        ${
          isEditMode
            ? "bg-[#fffbeb] text-[#b45309]"
            : "bg-[#ecfdf5] text-[#0d7448]"
        }
      `}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "currentColor",
                  display: "inline-block",
                }}
              />

              {isEditMode ? "Edit Mode" : "New Voucher"}
            </span>

            <BulkImportButton
              onImport={handleBulkImport}
              buttonText="Import Excel / CSV"
              className="
        inline-flex items-center gap-2
        px-4 py-2.5
        bg-emerald-600 hover:bg-emerald-700
        text-white text-sm font-medium
        rounded-lg
        shadow-md hover:shadow-lg
        transition-all duration-200
      "
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"></div>

        <div className="bg-white border border-[#e2e2dc] rounded-[10px] shadow-sm p-6 mb-5">
          <p className="text-[12px] font-semibold tracking-widest uppercase text-[#5c6070] mb-4.5 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-[#e2e2dc]">
            Voucher Details
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.25">
              <label className="text-[12px] font-medium text-[#5c6070] tracking-[0.01em]">
                Invoice No
              </label>
              <input
                className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                placeholder="e.g. SINV-2025-001"
                value={voucher.invoiceNo}
                onChange={(e) =>
                  setVoucher({ ...voucher, invoiceNo: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-1.25">
              <label className="text-[12px] font-medium text-[#5c6070] tracking-[0.01em]">
                Date <span className="text-[#c0392b] ml-0.5">*</span>
              </label>
              <input
                type="date"
                className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                value={voucher.date}
                onChange={(e) =>
                  setVoucher({ ...voucher, date: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-1.25">
              <label className="text-[12px] font-medium text-[#5c6070] tracking-[0.01em]">
                Party Name <span className="text-[#c0392b] ml-0.5">*</span>
              </label>
              <input
                className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                placeholder="Enter customer / party"
                value={voucher.customer}
                onChange={(e) =>
                  setVoucher({ ...voucher, customer: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-1.25">
              <label className="text-[12px] font-medium text-[#5c6070] tracking-[0.01em]">
                Sales Ledger <span className="text-[#c0392b] ml-0.5">*</span>
              </label>

              <SearchableLedgerSelect
                ledgers={ledgers}
                value={voucher.ledger}
                onSelect={(ledgerId) => {
                  const selectedLedger = ledgers.find(
                    (l) => String(l.id) === String(ledgerId),
                  );
                  setVoucher({
                    ...voucher,
                    ledger: ledgerId,
                    customer: selectedLedger?.name || "",
                    mailingName: selectedLedger?.mailingName || "",
                    address: selectedLedger?.address || "",
                    state: selectedLedger?.state || "",
                    country: selectedLedger?.country || "India",
                    pincode: selectedLedger?.pincode || "",
                    gstRegistrationType:
                      selectedLedger?.registrationType || "Regular",
                    gstin: selectedLedger?.gstin || "",
                    placeOfSupply: selectedLedger?.state || "",
                    consigneeName: selectedLedger?.mailingName || "",
                    consigneeAddress: selectedLedger?.address || "",
                    consigneeState: selectedLedger?.state || "",
                    consigneePincode: selectedLedger?.pincode || "",
                    consigneeGSTIN: selectedLedger?.gstin || "",
                  });
                }}
                onCreateNew={(name) => handleQuickCreateLedger(name)}
                placeholder="— Select ledger —"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e2e2dc] rounded-[10px] shadow-sm p-6 mb-5">
          <div className="flex gap-6 border-b border-[#e2e2dc] mb-5 -mt-2">
            <button
              className={`bg-none border-none py-2.5 text-[13px] font-semibold cursor-pointer relative transition-colors duration-200 uppercase tracking-wider ${activeDetailTab === "party" ? "text-[#1a56db] after:content-[''] after:absolute after:-bottom-px after:left-0 after:right-0 after:h-0.5 after:bg-[#1a56db]" : "text-[#9ca3af]"}`}
              onClick={() => setActiveDetailTab("party")}
            >
              Party Details
            </button>
            <button
              className={`bg-none border-none py-2.5 text-[13px] font-semibold cursor-pointer relative transition-colors duration-200 uppercase tracking-wider ${activeDetailTab === "shipping" ? "text-[#1a56db] after:content-[''] after:absolute after:-bottom-px after:left-0 after:right-0 after:h-0.5 after:bg-[#1a56db]" : "text-[#9ca3af]"}`}
              onClick={() => setActiveDetailTab("shipping")}
            >
              Shipping & E-Way Bill
            </button>
          </div>

          {activeDetailTab === "party" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <FieldRow label="Buyer (Bill to)">
                  <input
                    className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#5c6070] bg-[#f7f7f5] cursor-default transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                    readOnly
                    value={
                      ledgers.find(
                        (l) => String(l.id) === String(voucher.ledger),
                      )?.name || ""
                    }
                    placeholder="Auto-filled from ledger"
                  />
                </FieldRow>
                <FieldRow label="Mailing Name">
                  <input
                    className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                    value={voucher.mailingName}
                    onChange={(e) =>
                      setVoucher({ ...voucher, mailingName: e.target.value })
                    }
                  />
                </FieldRow>
                <FieldRow label="State">
                  <select
                    className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                    value={voucher.state}
                    onChange={(e) =>
                      setVoucher({ ...voucher, state: e.target.value })
                    }
                  >
                    <option value="">Select State</option>
                    <option value="Not Applicable">Not Applicable</option>
                    {statesList.map((st, idx) => (
                      <option key={idx} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </FieldRow>
                <FieldRow label="Country">
                  <input
                    className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                    value={voucher.country}
                    onChange={(e) =>
                      setVoucher({ ...voucher, country: e.target.value })
                    }
                  />
                </FieldRow>
              </div>
              <div className="space-y-4">
                <FieldRow label="Address">
                  <textarea
                    className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                    rows={2}
                    value={voucher.address}
                    onChange={(e) =>
                      setVoucher({ ...voucher, address: e.target.value })
                    }
                  />
                </FieldRow>
                <FieldRow label="GST Reg. Type">
                  <select
                    className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                    value={voucher.gstRegistrationType}
                    onChange={(e) =>
                      setVoucher({
                        ...voucher,
                        gstRegistrationType: e.target.value,
                      })
                    }
                  >
                    <option>Unregistered/Consumer</option>
                    <option>Regular</option>
                    <option>Composition</option>
                  </select>
                </FieldRow>
                <FieldRow label="GSTIN/UIN">
                  <input
                    className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none uppercase"
                    placeholder="22AAAAA0000A1Z5"
                    value={voucher.gstin}
                    onChange={(e) =>
                      setVoucher({ ...voucher, gstin: e.target.value })
                    }
                  />
                </FieldRow>
                <FieldRow label="Place of Supply">
                  <input
                    className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                    value={voucher.placeOfSupply}
                    onChange={(e) =>
                      setVoucher({ ...voucher, placeOfSupply: e.target.value })
                    }
                  />
                </FieldRow>
                <FieldRow label="Pincode">
                  <input
                    className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                    placeholder="6-digit PIN"
                    value={voucher.pincode}
                    onChange={(e) =>
                      setVoucher({ ...voucher, pincode: e.target.value })
                    }
                  />
                </FieldRow>
              </div>
            </div>
          )}

          {activeDetailTab === "shipping" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <HiTruck className="text-blue-600" />
                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest">
                      E-Way Bill Compliance
                    </h4>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-blue-600 transition-colors uppercase tracking-wider">
                      Enable E-Way Bill
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={ewayBillRequired}
                        onChange={(e) => setEwayBillRequired(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`block w-10 h-6 rounded-full transition-colors ${ewayBillRequired ? "bg-blue-600" : "bg-gray-300"}`}
                      ></div>
                      <div
                        className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 ${ewayBillRequired ? "translate-x-4" : ""}`}
                      ></div>
                    </div>
                  </label>
                </div>

                {ewayBillRequired && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col gap-1.25">
                      <label className="text-[12px] font-medium text-[#5c6070] tracking-[0.01em]">
                        E-Way Bill Number
                      </label>
                      <input
                        className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                        placeholder="12-digit number"
                        value={ewayBillData.ewayBillNo}
                        onChange={(e) =>
                          setEwayBillData({
                            ...ewayBillData,
                            ewayBillNo: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.25">
                      <label className="text-[12px] font-medium text-[#5c6070] tracking-[0.01em]">
                        Bill Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                        value={ewayBillData.ewayBillDate}
                        onChange={(e) =>
                          setEwayBillData({
                            ...ewayBillData,
                            ewayBillDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.25">
                      <label className="text-[12px] font-medium text-[#5c6070] tracking-[0.01em]">
                        Distance (KM)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                        value={ewayBillData.distanceKM}
                        onChange={(e) =>
                          setEwayBillData({
                            ...ewayBillData,
                            distanceKM: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                      Consignee (Ship To)
                    </h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Same as Billing?
                      </span>
                      <input
                        type="checkbox"
                        checked={voucher.consigneeSameAsBilling}
                        onChange={(e) =>
                          setVoucher({
                            ...voucher,
                            consigneeSameAsBilling: e.target.checked,
                          })
                        }
                        className="w-3.5 h-3.5"
                      />
                    </label>
                  </div>
                  {!voucher.consigneeSameAsBilling && (
                    <div className="space-y-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <FieldRow label="Name">
                        <input
                          className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                          value={voucher.consigneeName}
                          onChange={(e) =>
                            setVoucher({
                              ...voucher,
                              consigneeName: e.target.value,
                            })
                          }
                        />
                      </FieldRow>
                      <FieldRow label="GSTIN">
                        <input
                          className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none uppercase"
                          value={voucher.consigneeGSTIN}
                          onChange={(e) =>
                            setVoucher({
                              ...voucher,
                              consigneeGSTIN: e.target.value,
                            })
                          }
                        />
                      </FieldRow>
                      <FieldRow label="State">
                        <select
                          className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                          value={voucher.consigneeState}
                          onChange={(e) =>
                            setVoucher({
                              ...voucher,
                              consigneeState: e.target.value,
                            })
                          }
                        >
                          <option value="">Select State</option>
                          <option value="Not Applicable">Not Applicable</option>
                          {statesList.map((st, idx) => (
                            <option key={idx} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </FieldRow>
                      <FieldRow label="Address">
                        <textarea
                          className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                          rows={2}
                          value={voucher.consigneeAddress}
                          onChange={(e) =>
                            setVoucher({
                              ...voucher,
                              consigneeAddress: e.target.value,
                            })
                          }
                        />
                      </FieldRow>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-end">
                  <div className="flex flex-col gap-1.25">
                    <label className="text-[12px] font-medium text-[#5c6070] tracking-[0.01em]">
                      Terms of Delivery
                    </label>
                    <textarea
                      className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                      rows={4}
                      placeholder="Standard terms..."
                      value={voucher.termsOfDelivery}
                      onChange={(e) =>
                        setVoucher({
                          ...voucher,
                          termsOfDelivery: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4 border-b border-blue-50 pb-1">
                    Logistics
                  </p>
                  <FieldRow label="Delivery Note">
                    <input
                      className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                      value={voucher.deliveryNoteNo}
                      onChange={(e) =>
                        setVoucher({
                          ...voucher,
                          deliveryNoteNo: e.target.value,
                        })
                      }
                    />
                  </FieldRow>
                  <FieldRow label="Note Date">
                    <input
                      type="date"
                      className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                      value={voucher.deliveryNoteDate}
                      onChange={(e) =>
                        setVoucher({
                          ...voucher,
                          deliveryNoteDate: e.target.value,
                        })
                      }
                    />
                  </FieldRow>

                  <FieldRow label="Payment Terms">
                    <input
                      className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                      value={voucher.paymentTerms}
                      onChange={(e) =>
                        setVoucher({ ...voucher, paymentTerms: e.target.value })
                      }
                    />
                  </FieldRow>
                  <FieldRow label="Dispatch Doc No.">
                    <input
                      className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                      value={voucher.dispatchDocNo}
                      onChange={(e) =>
                        setVoucher({
                          ...voucher,
                          dispatchDocNo: e.target.value,
                        })
                      }
                    />
                  </FieldRow>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-4 border-b border-purple-50 pb-1">
                    References
                  </p>
                  <FieldRow label="Ref No.">
                    <input
                      className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                      value={voucher.referenceNo}
                      onChange={(e) =>
                        setVoucher({ ...voucher, referenceNo: e.target.value })
                      }
                    />
                  </FieldRow>
                  <FieldRow label="Ref Date">
                    <input
                      type="date"
                      className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                      value={voucher.referenceDate}
                      onChange={(e) =>
                        setVoucher({
                          ...voucher,
                          referenceDate: e.target.value,
                        })
                      }
                    />
                  </FieldRow>
                  <FieldRow label="Buyer Order No.">
                    <input
                      className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                      value={voucher.buyerOrderNo}
                      onChange={(e) =>
                        setVoucher({ ...voucher, buyerOrderNo: e.target.value })
                      }
                    />
                  </FieldRow>
                  <FieldRow label="Order Date">
                    <input
                      type="date"
                      className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                      value={voucher.buyerOrderDate}
                      onChange={(e) =>
                        setVoucher({
                          ...voucher,
                          buyerOrderDate: e.target.value,
                        })
                      }
                    />
                  </FieldRow>
                  <FieldRow label="Other Reference">
                    <input
                      className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                      value={voucher.otherReferences}
                      onChange={(e) =>
                        setVoucher({
                          ...voucher,
                          otherReferences: e.target.value,
                        })
                      }
                    />
                  </FieldRow>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-4 border-b border-orange-50 pb-1">
                    Transportation
                  </p>
                  <FieldRow label="Dispatched Through">
                    <input
                      className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                      value={voucher.dispatchedThrough}
                      onChange={(e) =>
                        setVoucher({
                          ...voucher,
                          dispatchedThrough: e.target.value,
                        })
                      }
                    />
                  </FieldRow>
                  <FieldRow label="Destination">
                    <input
                      className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                      value={voucher.destination}
                      onChange={(e) =>
                        setVoucher({ ...voucher, destination: e.target.value })
                      }
                    />
                  </FieldRow>
                  <FieldRow label="Vehicle No.">
                    <input
                      className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none uppercase"
                      value={voucher.motorVehicleNo}
                      onChange={(e) =>
                        setVoucher({
                          ...voucher,
                          motorVehicleNo: e.target.value,
                        })
                      }
                    />
                  </FieldRow>
                  <FieldRow label="Bill of Lading">
                    <input
                      className="w-full px-3 py-2.25 border-[1.5px] border-[#e2e2dc] rounded-md text-[14px] text-[#0f1117] bg-white transition-all focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db1a] outline-none"
                      value={voucher.billOfLading}
                      onChange={(e) =>
                        setVoucher({ ...voucher, billOfLading: e.target.value })
                      }
                    />
                  </FieldRow>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-[#e2e2dc] rounded-[10px] shadow-sm p-6 mb-5">
          <div className="flex justify-between items-center mb-5">
            <p className="text-[12px] font-semibold tracking-widest uppercase text-[#5c6070] mb-0 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-[#e2e2dc] m-0">
              Inventory Items
            </p>
            <div className="flex gap-3">
              <button
                className="inline-flex items-center gap-1.75 px-4.5 py-2.25 border-none rounded-md text-[13.5px] font-medium cursor-pointer transition-all duration-150 active:scale-[0.97] bg-transparent border-[1.5px] border-[#c8c8c0] text-[#5c6070] hover:border-[#1a56db] hover:text-[#1a56db]"
                onClick={addRow}
              >
                <HiPlus className="w-4 h-4" /> Add Item
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#e2e2dc] rounded-md">
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr>
                  <th
                    className="px-3 py-2.5 bg-[#f7f7f5] border-b-[1.5px] border-[#e2e2dc] text-[11px] font-semibold tracking-[0.08em] uppercase text-[#5c6070] whitespace-nowrap text-left"
                    style={{ width: "30%" }}
                  >
                    Item Name
                  </th>
                  <th className="px-3 py-2.5 bg-[#f7f7f5] border-b-[1.5px] border-[#e2e2dc] text-[11px] font-semibold tracking-[0.08em] uppercase text-[#5c6070] whitespace-nowrap text-left">
                    HSN Code
                  </th>
                  <th className="px-3 py-2.5 bg-[#f7f7f5] border-b-[1.5px] border-[#e2e2dc] text-[11px] font-semibold tracking-[0.08em] uppercase text-[#5c6070] whitespace-nowrap text-right">
                    Quantity
                  </th>
                  <th
                    className="px-3 py-2.5 bg-[#f7f7f5] border-b-[1.5px] border-[#e2e2dc] text-[11px] font-semibold tracking-[0.08em] uppercase text-[#5c6070] whitespace-nowrap text-center"
                    style={{ width: "80px" }}
                  >
                    per
                  </th>
                  <th className="px-3 py-2.5 bg-[#f7f7f5] border-b-[1.5px] border-[#e2e2dc] text-[11px] font-semibold tracking-[0.08em] uppercase text-[#5c6070] whitespace-nowrap text-right">
                    Rate (₹)
                  </th>
                  <th className="px-3 py-2.5 bg-[#f7f7f5] border-b-[1.5px] border-[#e2e2dc] text-[11px] font-semibold tracking-[0.08em] uppercase text-[#5c6070] whitespace-nowrap text-right">
                    Amount (₹)
                  </th>
                  <th className="px-3 py-2.5 bg-[#f7f7f5] border-b-[1.5px] border-[#e2e2dc] text-[11px] font-semibold tracking-[0.08em] uppercase text-[#5c6070] whitespace-nowrap text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {voucher.items.map((row, index) => (
                  <tr key={index}>
                    <td className="px-2.5 py-2 border-b border-[#e2e2dc] align-middle">
                      <div className="relative group">
                        <input
                          list={`items-${index}`}
                          className="w-full px-2.5 py-1.5 border-[1.5px] border-transparent rounded-[5px] text-[13.5px] text-[#0f1117] bg-transparent outline-none transition-all focus:border-[#1a56db] focus:bg-white"
                          placeholder="Select or enter item"
                          value={row.item}
                          onChange={(e) =>
                            handleItemChange(index, "item", e.target.value)
                          }
                        />
                        <datalist id={`items-${index}`}>
                          {availableItems.map((it) => (
                            <option
                              key={it.id}
                              value={`${it.productName}${it.godown ? ` - ${it.godown}` : ""}`}
                            />
                          ))}
                        </datalist>
                        <button
                          onClick={() => openStockModal(row.item)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-50 rounded"
                          title="Create New Stock Item"
                        >
                          <HiPlus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-2.5 py-2 border-b border-[#e2e2dc] align-middle">
                      <input
                        className="w-full px-2.5 py-1.5 border-[1.5px] border-transparent rounded-[5px] text-[13.5px] text-[#0f1117] bg-transparent outline-none transition-all focus:border-[#1a56db] focus:bg-white"
                        value={row.hsn_code}
                        onChange={(e) =>
                          handleItemChange(index, "hsn_code", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-2.5 py-2 border-b border-[#e2e2dc] align-middle">
                      <input
                        type="number"
                        className="w-full px-2.5 py-1.5 border-[1.5px] border-transparent rounded-[5px] text-[13.5px] text-[#0f1117] bg-transparent outline-none transition-all focus:border-[#1a56db] focus:bg-white text-right"
                        value={row.qty}
                        onChange={(e) =>
                          handleItemChange(index, "qty", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-2.5 py-2 border-b border-[#e2e2dc] align-middle">
                      <input
                        className="w-full px-2.5 py-1.5 border-[1.5px] border-transparent rounded-[5px] text-[13.5px] text-[#0f1117] bg-transparent outline-none transition-all focus:border-[#1a56db] focus:bg-white text-center"
                        value={row.per}
                        onChange={(e) =>
                          handleItemChange(index, "per", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-2.5 py-2 border-b border-[#e2e2dc] align-middle">
                      <input
                        type="number"
                        className="w-full px-2.5 py-1.5 border-[1.5px] border-transparent rounded-[5px] text-[13.5px] text-[#0f1117] bg-transparent outline-none transition-all focus:border-[#1a56db] focus:bg-white text-right"
                        value={row.rate}
                        onChange={(e) =>
                          handleItemChange(index, "rate", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-2.5 py-2 border-b border-[#e2e2dc] align-middle text-right font-bold text-gray-900">
                      ₹{Number(row.amount).toFixed(2)}
                    </td>
                    <td className="px-2.5 py-2 border-b border-[#e2e2dc] align-middle text-center">
                      <button
                        onClick={() => removeRow(index)}
                        className="text-red-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pv-card">
          <p className="pv-card-title">Tax & Totals</p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 320px" }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink-muted)",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Apply GST
              </p>
              <div className="pv-gst-buttons" style={{ marginBottom: 20 }}>
                <button className="pv-btn pv-btn-green" onClick={handleAutoGST}>
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  Auto GST
                </button>
                <button
                  className="pv-btn pv-btn-amber"
                  onClick={handleManualGST}
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Manual GST
                </button>
              </div>

              {voucher.gstRate > 0 && (
                <div
                  style={{
                    background: "var(--green-light)",
                    border: "1px solid #a7f3d0",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 14px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: "var(--green)",
                    fontWeight: 500,
                    marginBottom: 16,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {voucher.gstRate}% GST applied — ₹{gstAmount.toFixed(2)}
                </div>
              )}

              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink-muted)",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Component Breakdown
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[
                  ["IGST", "igst"],
                  ["CGST", "cgst"],
                  ["SGST", "sgst"],
                ].map(([label, key]) => (
                  <div
                    key={key}
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--ink-muted)",
                          letterSpacing: ".06em",
                        }}
                      >
                        {label} (%)
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "var(--accent)",
                        }}
                      >
                        ₹{" "}
                        {(
                          (totalAmount * Number(voucher[key] || 0)) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="number"
                      className="pv-gst-input"
                      placeholder="Rate %"
                      value={voucher[key]}
                      onChange={(e) =>
                        setVoucher({ ...voucher, [key]: e.target.value })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pv-totals" style={{ flex: "0 0 auto" }}>
              <div className="pv-totals-row">
                <span>Subtotal</span>
                <span className="val">₹ {totalAmount.toFixed(2)}</span>
              </div>
              {voucher.gstRate > 0 && (
                <div className="pv-totals-row gst-line">
                  <span>GST ({voucher.gstRate}%)</span>
                  <span className="val">₹ {gstAmount.toFixed(2)}</span>
                </div>
              )}
              {Number(voucher.igst) > 0 && (
                <div className="pv-totals-row">
                  <span>IGST ({voucher.igst}%)</span>
                  <span className="val">
                    ₹ {((totalAmount * Number(voucher.igst)) / 100).toFixed(2)}
                  </span>
                </div>
              )}
              {Number(voucher.cgst) > 0 && (
                <div className="pv-totals-row">
                  <span>CGST ({voucher.cgst}%)</span>
                  <span className="val">
                    ₹ {((totalAmount * Number(voucher.cgst)) / 100).toFixed(2)}
                  </span>
                </div>
              )}
              {Number(voucher.sgst) > 0 && (
                <div className="pv-totals-row">
                  <span>SGST ({voucher.sgst}%)</span>
                  <span className="val">
                    ₹ {((totalAmount * Number(voucher.sgst)) / 100).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="pv-totals-row grand">
                <span>Grand Total</span>
                <span className="val">₹ {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pv-card">
          <p className="pv-card-title">Narration</p>
          <textarea
            className="pv-textarea"
            rows={3}
            placeholder="Add internal notes or narration for this voucher…"
            value={voucher.narration}
            onChange={(e) =>
              setVoucher({ ...voucher, narration: e.target.value })
            }
          />
        </div>

        <div className="bg-white border border-[#e2e2dc] rounded-[10px] shadow-sm p-6 mt-8">
          <div className="flex justify-between items-center">
            <button
              className="inline-flex items-center gap-1.75 px-4.5 py-2.25 border-none rounded-md text-[13.5px] font-medium cursor-pointer transition-all duration-150 active:scale-[0.97] bg-transparent border-[1.5px] border-[#c8c8c0] text-[#5c6070] hover:border-[#1a56db] hover:text-[#1a56db]"
              onClick={() => {
                const role = user?.role || "admin";
                const basePath =
                  role === "employee"
                    ? "/employee/hr/accounting/client"
                    : "/accounting/client";
                navigate(`${basePath}/listOfSaleVoucher`);
              }}
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center gap-1.75 px-4.5 py-2.25 border-none rounded-md text-[13.5px] font-medium cursor-pointer transition-all duration-150 active:scale-[0.97] bg-[#1a56db] text-white hover:bg-[#1648c0]"
              onClick={saveVoucher}
            >
              <HiCheck className="w-5 h-5 mr-1" />
              {isEditMode ? "Update Sales Voucher" : "Save Sales Voucher"}
            </button>
          </div>
        </div>
      </div>

      {showStockModal && (
        <StockCreationModal
          stockForm={stockForm}
          setShowStockModal={setShowStockModal}
          handleStockFormChange={handleStockFormChange}
          handleStockSubmit={handleStockSave}
        />
      )}
    </>
  );
};

export default SaleVoucher;
