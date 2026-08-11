import React from "react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";

import {
  ArrowLeft,
  FileText,
  Layers,
  Plus,
  Save,
  Search,
  Trash2,
  Truck,
  User,
  UserPlus,
  Wand2,
  X,
} from "lucide-react";
import { HiPlus, HiX } from "react-icons/hi";
import BulkImportButton from "./BulkImportButton";

const SearchableLedgerSelect = ({
  ledgers = [],
  value,
  onSelect,
  onCreateNew,
  placeholder = "Search or add ledger...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const ledgerList = Array.isArray(ledgers) ? ledgers : [];
  const selectedLedger = ledgerList.find((l) => String(l.id) === String(value));

  useEffect(() => {
    if (selectedLedger) {
      setSearchTerm(selectedLedger.name || selectedLedger.ledgerName);
    }
  }, [selectedLedger]);

  const filtered = ledgerList.filter((l) =>
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
          className="app-input w-full border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium pr-8 py-1.5 text-xs"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#00a651]">
          <Search size={14} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-9999 mt-1.5 w-full bg-white border border-[#cbe0d2] rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((l) => (
              <div
                key={l.id}
                className="px-3.5 py-2 text-xs font-semibold hover:bg-[#f0fdf4] hover:text-[#00a651] cursor-pointer text-slate-700 border-b border-[#e2f2e9] last:border-b-0 text-left transition-colors"
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
            <div className="px-3.5 py-2 text-xs text-slate-400 italic text-left">
              No matches found
            </div>
          )}

          <div
            className="px-3.5 py-2 text-xs bg-[#f0fdf4] hover:bg-[#e1f9eb] cursor-pointer text-[#00a651] font-bold flex items-center gap-1.5 border-t border-[#cbe0d2] text-left transition-colors"
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
  const { user, companyId } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [ledgers, setLedgers] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
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
        const ledgersData = Array.isArray(ledgerRes.data) ? ledgerRes.data : ledgerRes.data?.data || [];
        setLedgers(ledgersData);

        const itemRes = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/manufacturing/getItems/${companyId}`,
        );
        const itemsData = Array.isArray(itemRes.data) ? itemRes.data : itemRes.data?.data || [];
        setAvailableItems(itemsData);

        const savedState = sessionStorage.getItem("saleVoucherState");
        if (savedState) {
          const state = JSON.parse(savedState);

          const loadedItems = itemsData;
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

  const handleFillPartyDetails = () => {
    if (!voucher.ledger) {
      Swal.fire({
        icon: "warning",
        title: "No Ledger Selected",
        text: "Please select a Sales Ledger first.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    const selected = ledgers.find(
      (l) => String(l.id) === String(voucher.ledger),
    );
    if (!selected) return;

    setVoucher((prev) => ({
      ...prev,
      customer: prev.customer || selected.name || selected.ledgerName || "",
      mailingName:
        selected.mailingName || selected.name || selected.ledgerName || "",
      address: selected.address || "",
      state: selected.state || "",
      country: selected.country || "India",
      gstRegistrationType:
        selected.registrationType ||
        selected.gstRegistrationType ||
        "Regular",
      gstin: selected.gstin || "",
      placeOfSupply: selected.state || "",
      pincode: selected.pincode || "",
    }));

    Swal.fire({
      icon: "success",
      title: "Party Details Autofilled",
      text: "Party and billing information updated from selected ledger.",
      timer: 1500,
      showConfirmButton: false,
    });
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
        const result = await Swal.fire({
          icon: "success",
          title: "Sales Voucher Created Successfully",
          text: "The sales voucher has been saved. What would you like to do next?",
          showCancelButton: true,
          showDenyButton: !!res.data?.pdf_path,
          confirmButtonColor: "#00a651",
          cancelButtonColor: "#6b7280",
          denyButtonColor: "#2563eb",
          confirmButtonText: "Create Another",
          cancelButtonText: "Go to Sales Voucher List",
          denyButtonText: "Download PDF",
        });

        if (result.isDenied && res.data?.pdf_path) {
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

          const followUp = await Swal.fire({
            icon: "info",
            title: "What's Next?",
            text: "Would you like to create another sales voucher or go to the list?",
            showCancelButton: true,
            confirmButtonColor: "#00a651",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Create Another",
            cancelButtonText: "Go to Sales Voucher List",
          });
          if (!followUp.isConfirmed) {
            const role = user?.role || "admin";
            const basePath =
              role === "employee"
                ? "/employee/hr/accounting/client"
                : "/accounting/client";
            navigate(`${basePath}/listOfSaleVoucher`);
            return;
          }
        } else if (!result.isConfirmed) {
          const role = user?.role || "admin";
          const basePath =
            role === "employee"
              ? "/employee/hr/accounting/client"
              : "/accounting/client";
          navigate(`${basePath}/listOfSaleVoucher`);
          return;
        }
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
      Swal.fire("Error", "Bulk import failed", "error");
    }
  };

  const inputClass =
    "app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium";

  const tableInputClass =
    "w-full border border-[#c8ddcd] bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] rounded-xl font-semibold py-2.25 px-3 text-xs outline-none transition-all";

  const role = user?.role || "admin";
  const listPath =
    role === "employee"
      ? "/employee/hr/accounting/client/listOfSaleVoucher"
      : "/accounting/client/listOfSaleVoucher";

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans">
        <div className="max-w-6xl mx-auto bg-white app-panel border border-[#e2f2e9]/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex justify-between items-center border-b border-[#e2f2e9] pb-5 mb-8">
            <div className="flex items-center gap-3">
              <h2 className="app-title text-xl font-extrabold text-[#042f2e]">
                {isEditMode
                  ? "Sales Voucher Alteration"
                  : "Sales Voucher Creation"}
              </h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f0fdf4] text-[#00a651] border border-[#c6f1d6]">
                SV
              </span>
            </div>

            <div className="flex items-center gap-3">
              <BulkImportButton onImport={handleBulkImport} />
              <button
                type="button"
                onClick={() => navigate(listPath)}
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors text-sm font-medium cursor-pointer"
              >
                <ArrowLeft size={16} /> Back to Sales Vouchers
              </button>
            </div>
          </div>

          <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
            <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider mb-4 border-b border-[#cbe0d2] pb-1.5 flex items-center gap-2">
              <FileText size={16} className="text-[#00a651]" /> Voucher Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                  Invoice No :
                </label>
                <input
                  className={inputClass}
                  placeholder="e.g. SINV-2025-001"
                  value={voucher.invoiceNo}
                  onChange={(e) =>
                    setVoucher({ ...voucher, invoiceNo: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                  Date * :
                </label>
                <input
                  type="date"
                  className={inputClass}
                  value={voucher.date}
                  onChange={(e) =>
                    setVoucher({ ...voucher, date: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                  Party Name * :
                </label>
                <input
                  className={inputClass}
                  placeholder="Enter customer / party name"
                  value={voucher.customer}
                  onChange={(e) => {
                    const val = e.target.value;
                    setVoucher((prev) => ({
                      ...prev,
                      customer: val,
                      mailingName:
                        prev.mailingName === prev.customer || !prev.mailingName
                          ? val
                          : prev.mailingName,
                    }));
                  }}
                />
              </div>
              <div>
                <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                  Sales Ledger * :
                </label>
                <SearchableLedgerSelect
                  ledgers={ledgers}
                  value={voucher.ledger}
                  onSelect={(lid) => setVoucher({ ...voucher, ledger: lid })}
                  onCreateNew={(name) => handleQuickCreateLedger(name)}
                  placeholder="Search or select Sales Ledger..."
                />
                <button
                  type="button"
                  onClick={handleFillPartyDetails}
                  className="mt-2 text-xs font-bold text-[#00a651] hover:text-white bg-[#f0fdf4] hover:bg-[#00a651] border border-[#cbe0d2] px-3 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95 shadow-xs"
                >
                  <Wand2 size={13} />
                  Autofill Party Info
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
            <div className="flex gap-2 border-b border-[#cbe0d2] pb-3 mb-5">
              <button
                type="button"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeDetailTab === "party" ? "bg-[#00a651] text-white shadow-sm" : "bg-white text-slate-700 border border-[#cbe0d2] hover:bg-[#f0fdf4]"}`}
                onClick={() => setActiveDetailTab("party")}
              >
                <User size={14} /> Party Details
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeDetailTab === "shipping" ? "bg-[#00a651] text-white shadow-sm" : "bg-white text-slate-700 border border-[#cbe0d2] hover:bg-[#f0fdf4]"}`}
                onClick={() => setActiveDetailTab("shipping")}
              >
                <Truck size={14} /> Logistics & E-Way Bill
              </button>
            </div>

            {activeDetailTab === "party" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                    Mailing Name :
                  </label>
                  <input
                    className={inputClass}
                    value={voucher.mailingName}
                    onChange={(e) =>
                      setVoucher({ ...voucher, mailingName: e.target.value })
                    }
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    Address :
                  </label>
                  <textarea
                    className={`${inputClass} h-20 resize-none`}
                    value={voucher.address}
                    onChange={(e) =>
                      setVoucher({ ...voucher, address: e.target.value })
                    }
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    State :
                  </label>
                  <select
                    className={inputClass}
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
                </div>

                <div>
                  <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                    Country :
                  </label>
                  <input
                    className={inputClass}
                    value={voucher.country}
                    onChange={(e) =>
                      setVoucher({ ...voucher, country: e.target.value })
                    }
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    GST Registration Type :
                  </label>
                  <select
                    className={inputClass}
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

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    GSTIN/UIN :
                  </label>
                  <input
                    className={`${inputClass} uppercase`}
                    placeholder="22AAAAA0000A1Z5"
                    value={voucher.gstin}
                    onChange={(e) =>
                      setVoucher({ ...voucher, gstin: e.target.value })
                    }
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    Place of Supply :
                  </label>
                  <input
                    className={inputClass}
                    value={voucher.placeOfSupply}
                    onChange={(e) =>
                      setVoucher({ ...voucher, placeOfSupply: e.target.value })
                    }
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    Pincode :
                  </label>
                  <input
                    className={inputClass}
                    placeholder="6-digit PIN"
                    value={voucher.pincode}
                    onChange={(e) =>
                      setVoucher({ ...voucher, pincode: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {activeDetailTab === "shipping" && (
              <div className="space-y-6">
                <div className="bg-white border border-[#cbe0d2] p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4 border-b border-[#e2f2e9] pb-3">
                    <h4 className="text-xs font-bold text-[#042f2e] uppercase tracking-wider flex items-center gap-2">
                      <Truck size={16} className="text-[#00a651]" /> E-Way Bill
                      Compliance
                    </h4>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      Enable E-Way Bill
                      <input
                        type="checkbox"
                        checked={ewayBillRequired}
                        onChange={(e) => setEwayBillRequired(e.target.checked)}
                        className="w-4 h-4 accent-[#00a651] cursor-pointer"
                      />
                    </label>
                  </div>

                  {ewayBillRequired && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                          E-Way Bill No :
                        </label>
                        <input
                          className={inputClass}
                          value={ewayBillData.ewayBillNo}
                          onChange={(e) =>
                            setEwayBillData({
                              ...ewayBillData,
                              ewayBillNo: e.target.value,
                            })
                          }
                        />

                        <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                          Transporter ID :
                        </label>
                        <input
                          className={inputClass}
                          value={ewayBillData.transporterID}
                          onChange={(e) =>
                            setEwayBillData({
                              ...ewayBillData,
                              transporterID: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                          Distance (KM) :
                        </label>
                        <input
                          type="number"
                          className={inputClass}
                          value={ewayBillData.distanceKM}
                          onChange={(e) =>
                            setEwayBillData({
                              ...ewayBillData,
                              distanceKM: e.target.value,
                            })
                          }
                        />

                        <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                          Vehicle Number :
                        </label>
                        <input
                          className={`${inputClass} uppercase`}
                          value={ewayBillData.vehicleNumber}
                          onChange={(e) =>
                            setEwayBillData({
                              ...ewayBillData,
                              vehicleNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                      Buyer Order No :
                    </label>
                    <input
                      className={inputClass}
                      value={voucher.buyerOrderNo}
                      onChange={(e) =>
                        setVoucher({ ...voucher, buyerOrderNo: e.target.value })
                      }
                    />

                    <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                      Dispatch Doc No :
                    </label>
                    <input
                      className={inputClass}
                      value={voucher.dispatchDocNo}
                      onChange={(e) =>
                        setVoucher({
                          ...voucher,
                          dispatchDocNo: e.target.value,
                        })
                      }
                    />

                    <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                      Dispatched Through :
                    </label>
                    <input
                      className={inputClass}
                      value={voucher.dispatchedThrough}
                      onChange={(e) =>
                        setVoucher({
                          ...voucher,
                          dispatchedThrough: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                      Destination :
                    </label>
                    <input
                      className={inputClass}
                      value={voucher.destination}
                      onChange={(e) =>
                        setVoucher({ ...voucher, destination: e.target.value })
                      }
                    />

                    <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                      Vehicle No :
                    </label>
                    <input
                      className={`${inputClass} uppercase`}
                      value={voucher.motorVehicleNo}
                      onChange={(e) =>
                        setVoucher({
                          ...voucher,
                          motorVehicleNo: e.target.value,
                        })
                      }
                    />

                    <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                      Terms of Delivery :
                    </label>
                    <textarea
                      className={`${inputClass} h-16 resize-none`}
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
            )}
          </div>

          <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
            <div className="flex justify-between items-center mb-4 border-b border-[#cbe0d2] pb-1.5">
              <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-[#00a651]" /> Inventory Items
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
                      HSN Code
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e] w-24">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e] w-20">
                      Per
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e] w-28">
                      Rate (₹)
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e] w-32">
                      Amount (₹)
                    </th>
                    <th className="px-4 py-3 text-center text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e] w-16">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2f2e9]">
                  {voucher.items.map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-[#f8faf8] transition-colors"
                    >
                      <td className="p-2">
                        <div className="relative group">
                          <input
                            list={`items-${index}`}
                            className={tableInputClass}
                            placeholder="Select or enter item"
                            value={row.item}
                            onChange={(e) =>
                              handleItemChange(index, "item", e.target.value)
                            }
                          />
                          <datalist id={`items-${index}`}>
                            {availableItems.map((ai) => (
                              <option
                                key={ai.id}
                                value={`${ai.productName}${ai.godown ? ` - ${ai.godown}` : ""}`}
                              />
                            ))}
                          </datalist>
                          <button
                            type="button"
                            onClick={() => openStockModal(row.item)}
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
                          value={row.hsn_code}
                          onChange={(e) =>
                            handleItemChange(index, "hsn_code", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className={tableInputClass}
                          value={row.qty}
                          onChange={(e) =>
                            handleItemChange(index, "qty", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className={tableInputClass}
                          value={row.per}
                          onChange={(e) =>
                            handleItemChange(index, "per", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className={tableInputClass}
                          value={row.rate}
                          onChange={(e) =>
                            handleItemChange(index, "rate", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2 text-right font-bold text-slate-800">
                        ₹ {Number(row.amount || 0).toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          onClick={() => removeRow(index)}
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
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
                {voucher.gstRate > 0 && (
                  <div className="inline-flex items-center gap-2 px-3 py-2 mb-4 rounded-xl text-xs font-bold bg-[#f0fdf4] border border-[#c6f1d6] text-[#00a651]">
                    {voucher.gstRate}% GST applied — ₹ {gstAmount.toFixed(2)}
                  </div>
                )}
                <label className="app-label block text-xs font-bold text-slate-800 mb-2">
                  Component Breakdown :
                </label>
                <div className="flex gap-3 flex-wrap">
                  {[
                    ["IGST", "igst"],
                    ["CGST", "cgst"],
                    ["SGST", "sgst"],
                  ].map(([label, key]) => (
                    <div key={key} className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-slate-700">
                        {label} (₹)
                      </span>
                      <input
                        type="number"
                        className="app-input w-28 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] font-medium py-1 px-2 text-xs"
                        placeholder="Amount"
                        value={voucher[key]}
                        readOnly={voucher.gstType !== "Manual"}
                        onChange={(e) =>
                          setVoucher({ ...voucher, [key]: e.target.value })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#cbe0d2] rounded-xl p-5 shrink-0 w-full md:w-72 shadow-xs">
                <div className="flex justify-between items-center py-1.5 text-xs text-slate-600 border-b border-[#e2f2e9]">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">
                    ₹ {totalAmount.toFixed(2)}
                  </span>
                </div>
                {voucher.gstRate > 0 && (
                  <div className="flex justify-between items-center py-1.5 text-xs text-emerald-700 border-b border-[#e2f2e9]">
                    <span>GST ({voucher.gstRate}%)</span>
                    <span>₹ {gstAmount.toFixed(2)}</span>
                  </div>
                )}
                {Number(voucher.igst) > 0 && (
                  <div className="flex justify-between items-center py-1.5 text-xs text-slate-600 border-b border-[#e2f2e9]">
                    <span>IGST ({voucher.igst}%)</span>
                    <span>
                      ₹{" "}
                      {((totalAmount * Number(voucher.igst)) / 100).toFixed(2)}
                    </span>
                  </div>
                )}
                {Number(voucher.cgst) > 0 && (
                  <div className="flex justify-between items-center py-1.5 text-xs text-slate-600 border-b border-[#e2f2e9]">
                    <span>CGST ({voucher.cgst}%)</span>
                    <span>
                      ₹{" "}
                      {((totalAmount * Number(voucher.cgst)) / 100).toFixed(2)}
                    </span>
                  </div>
                )}
                {Number(voucher.sgst) > 0 && (
                  <div className="flex justify-between items-center py-1.5 text-xs text-slate-600 border-b border-[#e2f2e9]">
                    <span>SGST ({voucher.sgst}%)</span>
                    <span>
                      ₹{" "}
                      {((totalAmount * Number(voucher.sgst)) / 100).toFixed(2)}
                    </span>
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
              placeholder="Add internal notes or narration for this sales voucher..."
              value={voucher.narration}
              onChange={(e) =>
                setVoucher({ ...voucher, narration: e.target.value })
              }
            />
          </div>

          <div className="mt-8 flex justify-end gap-4 border-t border-[#e2f2e9] pt-6">
            <button
              type="button"
              onClick={saveVoucher}
              className="app-btn-primary flex items-center justify-center gap-2 cursor-pointer shadow-md min-w-36 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Save size={16} />{" "}
              {isEditMode ? "Update Sales Voucher" : "Save Sales Voucher"}
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
