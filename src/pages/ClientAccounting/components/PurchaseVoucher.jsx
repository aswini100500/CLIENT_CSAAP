import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowLeft,
  Building,
  FileText,
  Layers,
  Plus,
  Save,
  Search,
  Trash2,
  Truck,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";
import { normalizeUnits } from "../../../submodules/crm/admin/pages/telemarketing/leads/leadUtils";
import api from "../../../submodules/crm/api";
import BulkImportButton from "./BulkImportButton";

const API = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/purchase-voucher`;

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
      setSearchTerm(selectedLedger.name || selectedLedger.ledgerName || "");
    } else if (!value) {
      setSearchTerm("");
    }
  }, [selectedLedger, value]);

  const filtered = ledgerList.filter((l) =>
    (l.name || l.ledgerName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (!searchTerm.trim()) {
          onSelect("");
          setSearchTerm("");
        } else if (selectedLedger) {
          setSearchTerm(selectedLedger.name || selectedLedger.ledgerName || "");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedLedger, searchTerm, onSelect]);

  const handleClear = (e) => {
    e.stopPropagation();
    setSearchTerm("");
    onSelect("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          className="app-input w-full border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium pr-8 py-1.5 text-xs"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            const val = e.target.value;
            setSearchTerm(val);
            if (val === "") {
              onSelect("");
            }
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#00a651]">
          {searchTerm ? (
            <button
              type="button"
              className="p-0.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
              onClick={handleClear}
              title="Clear selection"
            >
              <X size={14} />
            </button>
          ) : (
            <Search size={14} />
          )}
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

const PurchaseVoucher = () => {
  const { user, companyId } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeDetailTab, setActiveDetailTab] = useState("party");
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);

  const [voucher, setVoucher] = useState({
    date: "",
    invoiceNo: "",
    customer: "",
    ledger: "",
    narration: "",
    project_unit_ref: "",
    mailingName: "",
    address: "",
    state: "Not Applicable",
    country: "India",
    gstRegistrationType: "Unregistered/Consumer",
    gstin: "",
    placeOfSupply: "Not Applicable",
    deliveryNoteNo: "",
    deliveryNoteDate: "",
    paymentTerms: "",
    otherReferences: "",
    referenceNo: "",
    referenceDate: "",
    buyerOrderNo: "",
    buyerOrderDate: "",
    dispatchDocNo: "",
    dispatchedThrough: "",
    destination: "",
    carrierName: "",
    billOfLading: "",
    billOfLadingDate: "",
    dispatchDate: "",
    receiptNoteNo: "",
    receiptDate: "",
    receiptDocNo: "",
    supplierInvoiceNo: "",
    supplierInvoiceDate: "",
    termsOfDelivery: "",
    consigneeSameAsBilling: true,
    consigneeName: "",
    consigneeGSTIN: "",
    consigneeAddress: "",
    consigneeState: "Not Applicable",
    consigneePincode: "",
    items: [{ itemName: "", hsn_code: "", qty: 1, rate: 0, amount: 0 }],
  });

  const [gst, setGst] = useState({
    applied: false,
    percentage: 0,
    amount: 0,
    igst: 0,
    cgst: 0,
    sgst: 0,
  });
  const [ledgers, setLedgers] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const token = localStorage.getItem("token") || user?.token;

  const set = (field, value) => {
    setVoucher((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuickCreateLedger = (initialName) => {
    const stateToSave = {
      voucher,
      gst,
    };
    sessionStorage.setItem("purchaseVoucherState", JSON.stringify(stateToSave));

    const role = user?.role || "admin";
    const basePath =
      role === "employee"
        ? "/employee/hr/accounting/client"
        : "/accounting/client";
    const redirectPath = id
      ? `${basePath}/purchasevoucher/${id}`
      : `${basePath}/purchasevoucher`;
    navigate(
      `${basePath}/ledger?redirect=${encodeURIComponent(redirectPath)}&name=${encodeURIComponent(initialName || "")}`,
    );
  };

  const { data: projectOptions = [] } = useQuery({
    queryKey: ["project-options", token],
    queryFn: async () => {
      if (!token) return [];
      try {
        const response = await api.get("/api/projects/options", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data?.data || [];
      } catch (err) {
        console.warn("Failed to fetch project options:", err);
        return [];
      }
    },
    enabled: !!token,
  });

  const parsedProjectAndUnit = useMemo(() => {
    if (!voucher.project_unit_ref)
      return { projectCompositeKey: "", unitId: "" };
    let str = String(voucher.project_unit_ref).trim();
    if (str.startsWith("unit:")) str = str.substring(5);
    else if (str.startsWith("project:")) str = str.substring(8);

    const parts = str.split(":");
    if (parts.length >= 3) {
      const compositeKey = `${parts[0]}:${parts[1]}`;
      const uId = parts.slice(2).join(":");
      return { projectCompositeKey: compositeKey, unitId: uId };
    } else if (parts.length === 2) {
      return { projectCompositeKey: str, unitId: "" };
    } else if (parts.length === 1 && parts[0]) {
      const found = projectOptions.find(
        (p) =>
          p.id === parts[0] ||
          p.project_id === parts[0] ||
          (p.project_id && p.project_id.endsWith(`:${parts[0]}`)),
      );
      return {
        projectCompositeKey: found ? found.project_id : parts[0],
        unitId: "",
      };
    }
    return { projectCompositeKey: "", unitId: "" };
  }, [voucher.project_unit_ref, projectOptions]);

  const selectedProjectObj = useMemo(
    () =>
      projectOptions.find(
        (p) => p.project_id === parsedProjectAndUnit.projectCompositeKey,
      ) || null,
    [projectOptions, parsedProjectAndUnit.projectCompositeKey],
  );

  const { data: projectDetails } = useQuery({
    queryKey: [
      "project-details",
      parsedProjectAndUnit.projectCompositeKey,
      token,
    ],
    queryFn: async () => {
      if (!parsedProjectAndUnit.projectCompositeKey || !token) return [];
      let projectType = "apartment";
      let projectId = parsedProjectAndUnit.projectCompositeKey;
      if (typeof projectId === "string" && projectId.includes(":")) {
        const parts = projectId.split(":");
        projectType = parts[0];
        projectId = parts[1];
      }
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_CSAAP_URL}/api/tenant/type/${projectType}/${projectId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        return response.data?.data || [];
      } catch (err) {
        console.warn("Failed to fetch project details:", err);
        return [];
      }
    },
    enabled: !!parsedProjectAndUnit.projectCompositeKey && !!token,
  });

  const availableUnits = useMemo(() => {
    if (!projectDetails || !selectedProjectObj) return [];
    try {
      return normalizeUnits(
        projectDetails,
        selectedProjectObj.property_type || "apartment",
      );
    } catch (e) {
      return [];
    }
  }, [projectDetails, selectedProjectObj]);

  const handleProjectSelect = (compositeKey) => {
    if (!compositeKey) {
      setVoucher((prev) => ({ ...prev, project_unit_ref: "" }));
    } else {
      setVoucher((prev) => ({
        ...prev,
        project_unit_ref: compositeKey,
      }));
    }
  };

  const handleUnitSelect = (uId) => {
    const key = parsedProjectAndUnit.projectCompositeKey;
    if (!uId) {
      setVoucher((prev) => ({
        ...prev,
        project_unit_ref: key || "",
      }));
    } else {
      setVoucher((prev) => ({
        ...prev,
        project_unit_ref: key ? `${key}:${uId}` : String(uId),
      }));
    }
  };

  const DEFAULT_INDIAN_STATES = [
    { name: "Andhra Pradesh" },
    { name: "Arunachal Pradesh" },
    { name: "Assam" },
    { name: "Bihar" },
    { name: "Chhattisgarh" },
    { name: "Goa" },
    { name: "Gujarat" },
    { name: "Haryana" },
    { name: "Himachal Pradesh" },
    { name: "Jharkhand" },
    { name: "Karnataka" },
    { name: "Kerala" },
    { name: "Madhya Pradesh" },
    { name: "Maharashtra" },
    { name: "Manipur" },
    { name: "Meghalaya" },
    { name: "Mizoram" },
    { name: "Nagaland" },
    { name: "Odisha" },
    { name: "Punjab" },
    { name: "Rajasthan" },
    { name: "Sikkim" },
    { name: "Tamil Nadu" },
    { name: "Telangana" },
    { name: "Tripura" },
    { name: "Uttar Pradesh" },
    { name: "Uttarakhand" },
    { name: "West Bengal" },
    { name: "Andaman and Nicobar Islands" },
    { name: "Chandigarh" },
    { name: "Dadra and Nagar Haveli and Daman and Diu" },
    { name: "Delhi" },
    { name: "Jammu and Kashmir" },
    { name: "Ladakh" },
    { name: "Lakshadweep" },
    { name: "Puducherry" },
  ];

  const fetchStates = async () => {
    try {
      const res = await fetch(
        "https://countriesnow.space/api/v0.1/countries/states",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            country: "India",
          }),
        },
      );

      const data = await res.json();
      if (data?.data?.states?.length > 0) {
        setStates(data.data.states);
      } else {
        setStates(DEFAULT_INDIAN_STATES);
      }
    } catch (err) {
      console.warn("Failed to fetch states, using fallback:", err);
      setStates(DEFAULT_INDIAN_STATES);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,cca2,flags",
      );

      const data = await res.json();

      const formatted = data
        .map((c) => ({
          name: c.name.common,
          code: c.cca2,
          flag: c.flags?.png,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setCountries(formatted);
    } catch (err) {
      console.warn("Failed to fetch countries:", err);
    }
  };

  useEffect(() => {
    fetchStates();
    fetchCountries();
    const fetchData = async () => {
      try {
        const res2 = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`,
        );
        const data = Array.isArray(res2.data) ? res2.data : res2.data?.data || [];
        setLedgers(data);

        const savedState = sessionStorage.getItem("purchaseVoucherState");
        if (savedState) {
          const state = JSON.parse(savedState);
          setVoucher(state.voucher);
          setGst(state.gst);
          sessionStorage.removeItem("purchaseVoucherState");
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
          const voucherRes = await axios.get(`${API}/single/${id}`);
          const v = voucherRes.data;
          if (v) {
            setVoucher({
              date: v.date ? new Date(v.date).toISOString().split("T")[0] : "",
              invoiceNo: v.invoiceNo || v.voucherNo || "",
              customer: v.customer || v.partyName || "",
              ledger: String(v.ledgerId || v.ledger || ""),
              narration: v.narration || "",
              mailingName: v.mailingName || "",
              address: v.address || "",
              state: v.state || "Not Applicable",
              country: v.country || "India",
              gstRegistrationType:
                v.gstRegistrationType || "Unregistered/Consumer",
              gstin: v.gstin || "",
              placeOfSupply: v.placeOfSupply || "Not Applicable",
              deliveryNoteNo: v.deliveryNoteNo || "",
              deliveryNoteDate: v.deliveryNoteDate
                ? new Date(v.deliveryNoteDate).toISOString().split("T")[0]
                : "",
              paymentTerms: v.paymentTerms || "",
              otherReferences: v.otherReferences || "",
              referenceNo: v.referenceNo || "",
              referenceDate: v.referenceDate
                ? new Date(v.referenceDate).toISOString().split("T")[0]
                : "",
              buyerOrderNo: v.buyerOrderNo || "",
              buyerOrderDate: v.buyerOrderDate
                ? new Date(v.buyerOrderDate).toISOString().split("T")[0]
                : "",
              dispatchDocNo: v.dispatchDocNo || "",
              dispatchedThrough: v.dispatchedThrough || "",
              destination: v.destination || "",
              carrierName: v.carrierName || "",
              billOfLading: v.billOfLading || "",
              billOfLadingDate: v.billOfLadingDate
                ? new Date(v.billOfLadingDate).toISOString().split("T")[0]
                : "",
              motorVehicleNo: v.motorVehicleNo || "",
              dispatchDate: v.dispatchDate
                ? new Date(v.dispatchDate).toISOString().split("T")[0]
                : "",
              receiptNoteNo: v.receiptNoteNo || "",
              receiptDate: v.receiptDate
                ? new Date(v.receiptDate).toISOString().split("T")[0]
                : "",
              receiptDocNo: v.receiptDocNo || "",
              supplierInvoiceNo: v.supplierInvoiceNo || "",
              supplierInvoiceDate: v.supplierInvoiceDate
                ? new Date(v.supplierInvoiceDate).toISOString().split("T")[0]
                : "",
              project_unit_ref:
                v.project_unit_ref ||
                (v.unitId && v.projectId
                  ? `${v.projectId}:${v.unitId}`
                  : v.projectId
                    ? `${v.projectId}`
                    : ""),
              termsOfDelivery: v.termsOfDelivery || v.delivery_terms || "",
              consigneeSameAsBilling:
                v.consigneeSameAsBilling !== undefined
                  ? Boolean(v.consigneeSameAsBilling)
                  : true,
              consigneeName: v.consigneeName || "",
              consigneeGSTIN: v.consigneeGSTIN || "",
              consigneeAddress: v.consigneeAddress || "",
              consigneeState: v.consigneeState || "Not Applicable",
              consigneePincode: v.consigneePincode || "",
              items:
                v.items?.length > 0
                  ? v.items.map((i) => ({
                      itemName: i.item_name || i.item || i.itemName || "",
                      hsn_code: i.hsn_code || "",
                      qty: Number(i.qty) || 1,
                      per: i.per || i.unit || "",
                      rate: Number(i.rate) || 0,
                      amount: Number(i.amount) || 0,
                    }))
                  : [
                      {
                        itemName: "",
                        hsn_code: "",
                        qty: 1,
                        per: "Nos",
                        rate: 0,
                        amount: 0,
                      },
                    ],
            });
            setGst({
              applied: Number(v.gst_percentage || v.gstPercentage || 0) > 0,

              percentage: Number(v.gst_percentage || v.gstPercentage || 0),

              amount: Number(v.gst_amount || v.gstAmount || 0),

              igst: Number(v.igst_rate || 0),

              cgst: Number(v.cgst_rate || 0),

              sgst: Number(v.sgst_rate || 0),
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (companyId) fetchData();

    if (companyId && !id) {
      axios
        .get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher-util/next/${companyId}/purchase`,
        )
        .then((res) =>
          setVoucher((prev) => ({ ...prev, invoiceNo: res.data.nextNumber })),
        )
        .catch(console.error);
    }
  }, [companyId, id]);

  const handleItemChange = (index, field, value) => {
    const updated = [...voucher.items];
    updated[index][field] = value;
    if (field === "qty" || field === "rate") {
      const qty = parseFloat(updated[index].qty) || 0;
      const rate = parseFloat(updated[index].rate) || 0;
      updated[index].amount = qty * rate;
    }
    setVoucher({ ...voucher, items: updated });
  };

  const addRow = () =>
    setVoucher({
      ...voucher,
      items: [
        ...voucher.items,
        { itemName: "", hsn_code: "", qty: 1, per: "Nos", rate: 0, amount: 0 },
      ],
    });
  const removeRow = (i) => {
    setVoucher({
      ...voucher,
      items: voucher.items.filter((_, idx) => idx !== i),
    });
  };

  const totalAmount = voucher.items.reduce(
    (sum, r) => sum + Number(r.amount || 0),
    0,
  );
  const effectiveGstRate =
    Number(gst.igst || 0) + Number(gst.cgst || 0) + Number(gst.sgst || 0);
  const gstAmount =
    (totalAmount * (gst.percentage || effectiveGstRate || 0)) / 100;
  const grandTotal = totalAmount + gstAmount;

  const handleAutoGST = () => {
    setGst({
      applied: true,
      percentage: 18,
      igst: 0,
      cgst: 9,
      sgst: 9,
      amount: 0,
    });

    Swal.fire({
      icon: "success",
      title: "GST Applied",
      text: "Applied 18% GST (CGST 9% + SGST 9%)",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleManualGST = async () => {
    const { value } = await Swal.fire({
      title: "Enter GST Percentage",
      input: "number",
      inputAttributes: { min: 0, max: 100, step: 0.1 },
      confirmButtonText: "Apply",
      showCancelButton: true,
    });
    if (value) {
      const rate = parseFloat(value);
      const { value: type } = await Swal.fire({
        title: "Tax Type",
        input: "select",
        inputOptions: {
          intra: "Intra-state (CGST+SGST)",
          inter: "Inter-state (IGST)",
        },
        confirmButtonText: "Select",
      });

      if (type === "inter") {
        setGst({
          ...gst,
          applied: true,
          percentage: rate,
          igst: rate,
          cgst: 0,
          sgst: 0,
        });
      } else {
        setGst({
          ...gst,
          applied: true,
          percentage: rate,
          igst: 0,
          cgst: rate / 2,
          sgst: rate / 2,
        });
      }
      Swal.fire({
        icon: "success",
        title: "GST Added",
        text: `${value}% GST applied`,
        timer: 1600,
        showConfirmButton: false,
      });
    }
  };

  const handleBulkImport = async (data) => {
    try {
      if (!data || data.length === 0) {
        Swal.fire("Error", "No data found in file", "error");
        return;
      }

      const grouped = {};

      data.forEach((row) => {
        const invoiceNo = row.InvoiceNo || row.VoucherNo || `PUR-${Date.now()}`;

        if (!grouped[invoiceNo]) {
          grouped[invoiceNo] = {
            date: row.Date
              ? new Date(row.Date).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],

            invoiceNo,

            customer: row.Customer || row.PartyName || "",

            narration: row.Narration || "",

            supplierInvoiceNo: row.SupplierInvoiceNo || "",

            supplierInvoiceDate: row.SupplierInvoiceDate || "",

            mailingName: row.MailingName || row.Customer || "",

            address: row.Address || "",

            state: row.State || "Not Applicable",

            country: row.Country || "India",

            gstin: row.GSTIN || "",

            placeOfSupply: row.PlaceOfSupply || "Not Applicable",

            paymentTerms: row.PaymentTerms || "",

            deliveryNoteNo: row.DeliveryNoteNo || "",

            deliveryNoteDate: row.DeliveryNoteDate || "",

            dispatchDocNo: row.DispatchDocNo || "",

            destination: row.Destination || "",

            carrierName: row.CarrierName || "",

            gst_percentage: parseFloat(row.GST || 0),

            igst: parseFloat(row.IGST || 0),

            cgst: parseFloat(row.CGST || 0),

            sgst: parseFloat(row.SGST || 0),

            items: [],
          };
        }

        grouped[invoiceNo].items.push({
          itemName: row.ItemName || "",

          hsn_code: row.HSN || "",

          qty: parseFloat(row.Qty || 1),

          rate: parseFloat(row.Rate || 0),

          amount:
            parseFloat(row.Amount || 0) ||
            parseFloat(row.Qty || 1) * parseFloat(row.Rate || 0),
        });
      });

      const firstVoucher = Object.values(grouped)[0];

      if (!firstVoucher) {
        Swal.fire("Error", "Voucher parsing failed", "error");
        return;
      }

      let ledgerId = "";
      let finalLedgerList = ledgers;
      let ledgerObj = ledgers.find(
        (l) =>
          (l.name || "").toLowerCase().trim() ===
          (firstVoucher.customer || "").toLowerCase().trim(),
      );

      if (ledgerObj) {
        ledgerId = ledgerObj.id;
      } else if (firstVoucher.customer) {
        const confirmCreate = await Swal.fire({
          title: "Ledger Not Found",
          text: `Party/Supplier "${firstVoucher.customer}" does not exist. Do you want to create a new ledger under Sundry Creditors?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, Create",
          cancelButtonText: "No, Skip Selecting Ledger",
        });

        if (confirmCreate.isConfirmed) {
          try {
            const groupRes = await axios.get(
              `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group/all/${companyId}`,
            );
            const creditorsGroup = groupRes.data.find(
              (g) => g.groupName === "Sundry Creditors",
            );

            if (!creditorsGroup) {
              Swal.fire(
                "Error",
                "Sundry Creditors group not found in system.",
                "error",
              );
            } else {
              await axios.post(
                `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/create`,
                {
                  name: firstVoucher.customer,
                  under: JSON.stringify({
                    name: "Sundry Creditors",
                    id: creditorsGroup.id,
                  }),
                  mailingName: firstVoucher.customer,
                  openingBalance: 0,
                  state: firstVoucher.state || "Not Applicable",
                  country: firstVoucher.country || "India",
                  registrationType: firstVoucher.gstin
                    ? "Regular"
                    : "Unregistered/Consumer",
                  gstin: firstVoucher.gstin || "",
                  companyId,
                },
              );

              const ledgerRes = await axios.get(
                `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`,
              );
              const ledgersData = Array.isArray(ledgerRes.data) ? ledgerRes.data : ledgerRes.data?.data || [];
              finalLedgerList = ledgersData;
              setLedgers(finalLedgerList);

              const newLedger = finalLedgerList.find(
                (l) =>
                  (l.name || "").toLowerCase().trim() ===
                  (firstVoucher.customer || "").toLowerCase().trim(),
              );
              if (newLedger) {
                ledgerId = newLedger.id;
              }
            }
          } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to auto-create ledger.", "error");
          }
        }
      }

      setVoucher((prev) => ({
        ...prev,

        date: firstVoucher.date,

        invoiceNo: firstVoucher.invoiceNo,

        customer: firstVoucher.customer,

        ledger: ledgerId,

        narration: firstVoucher.narration,

        supplierInvoiceNo: firstVoucher.supplierInvoiceNo,

        supplierInvoiceDate: firstVoucher.supplierInvoiceDate,

        mailingName: firstVoucher.mailingName,

        address: firstVoucher.address,

        state: firstVoucher.state,

        country: firstVoucher.country,

        gstin: firstVoucher.gstin,

        placeOfSupply: firstVoucher.placeOfSupply,

        paymentTerms: firstVoucher.paymentTerms,

        deliveryNoteNo: firstVoucher.deliveryNoteNo,

        deliveryNoteDate: firstVoucher.deliveryNoteDate,

        dispatchDocNo: firstVoucher.dispatchDocNo,

        destination: firstVoucher.destination,

        carrierName: firstVoucher.carrierName,

        items: firstVoucher.items,
      }));

      const effectiveRate =
        firstVoucher.gst_percentage ||
        firstVoucher.igst + firstVoucher.cgst + firstVoucher.sgst;

      setGst({
        applied: effectiveRate > 0,

        percentage: effectiveRate,

        igst: firstVoucher.igst || 0,

        cgst: firstVoucher.cgst || 0,

        sgst: firstVoucher.sgst || 0,

        amount: 0,
      });

      Swal.fire({
        icon: "success",
        title: "Import Successful",
        text: "Purchase voucher loaded successfully",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);

      Swal.fire("Error", "Failed to import file", "error");
    }
  };

  const resetForm = () => {
    setVoucher({
      date: new Date().toISOString().split("T")[0],
      invoiceNo: "",
      customer: "",
      ledger: "",
      narration: "",
      project_unit_ref: "",
      mailingName: "",
      address: "",
      state: "Not Applicable",
      country: "India",
      gstRegistrationType: "Unregistered/Consumer",
      gstin: "",
      placeOfSupply: "Not Applicable",
      deliveryNoteNo: "",
      deliveryNoteDate: "",
      paymentTerms: "",
      otherReferences: "",
      referenceNo: "",
      referenceDate: "",
      buyerOrderNo: "",
      buyerOrderDate: "",
      dispatchDocNo: "",
      dispatchedThrough: "",
      destination: "",
      carrierName: "",
      billOfLading: "",
      billOfLadingDate: "",
      dispatchDate: "",
      receiptNoteNo: "",
      receiptDate: "",
      receiptDocNo: "",
      supplierInvoiceNo: "",
      supplierInvoiceDate: "",
      termsOfDelivery: "",
      consigneeSameAsBilling: true,
      consigneeName: "",
      consigneeGSTIN: "",
      consigneeAddress: "",
      consigneeState: "Not Applicable",
      consigneePincode: "",
      items: [
        { itemName: "", hsn_code: "", qty: 1, per: "Nos", rate: 0, amount: 0 },
      ],
    });
    setGst({
      applied: false,
      percentage: 0,
      amount: 0,
      igst: 0,
      cgst: 0,
      sgst: 0,
    });
    if (companyId) {
      axios
        .get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher-util/next/${companyId}/purchase`,
        )
        .then((res) =>
          setVoucher((prev) => ({ ...prev, invoiceNo: res.data.nextNumber })),
        )
        .catch(console.error);
    }
  };

  const saveVoucher = async () => {
    if (!voucher.date || !voucher.customer || !voucher.ledger) {
      return Swal.fire(
        "Error",
        "Please fill required fields (Date, Party Name, Purchase Ledger)",
        "error",
      );
    }
    try {
      const employeeId = user?.employee_id || null;
      const role = user?.role || "admin";

      const payload = {
        ...voucher,
        voucherNo: voucher.invoiceNo || voucher.voucherNo || "",
        companyId,
        subtotal: totalAmount,
        gst_percentage: gst.percentage || effectiveGstRate,
        gst_amount: gstAmount,
        igst: (totalAmount * Number(gst.igst || 0)) / 100,
        cgst: (totalAmount * Number(gst.cgst || 0)) / 100,
        sgst: (totalAmount * Number(gst.sgst || 0)) / 100,
        igst_rate: Number(gst.igst || 0),
        cgst_rate: Number(gst.cgst || 0),
        sgst_rate: Number(gst.sgst || 0),
        grand_total: grandTotal,
        narration: voucher.narration,
        items: voucher.items.map((i) => ({
          item: i.itemName,
          hsn_code: i.hsn_code,
          qty: i.qty,
          per: i.per,
          rate: i.rate,
          amount: i.amount,
        })),
        ...(employeeId && { employee_id: employeeId }),
        role,
      };

      if (isEditMode) {
        await axios.put(`${API}/${id}`, payload);
        Swal.fire({
          icon: "success",
          title: "Purchase Voucher Updated Successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(listPath);
        return;
      }

      const res = await axios.post(API, payload);

      const result = await Swal.fire({
        icon: "success",
        title: "Purchase Voucher Created Successfully",
        text: "The purchase voucher has been saved. What would you like to do next?",
        showCancelButton: true,
        showDenyButton: !!res.data?.pdf_path,
        confirmButtonColor: "#00a651",
        cancelButtonColor: "#6b7280",
        denyButtonColor: "#2563eb",
        confirmButtonText: "Create Another",
        cancelButtonText: "Go to Purchase Voucher List",
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
              res.data.pdf_path.split("/").pop() || "PurchaseVoucher.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          })
          .catch((err) => console.error("Error downloading PDF:", err));

        const followUp = await Swal.fire({
          icon: "info",
          title: "What's Next?",
          text: "Would you like to create another purchase voucher or go to the list?",
          showCancelButton: true,
          confirmButtonColor: "#00a651",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Create Another",
          cancelButtonText: "Go to Purchase Voucher List",
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
      if (err.response && err.response.status === 409) {
        Swal.fire("Warning", "Invoice Number Already Exists!", "warning");
      } else {
        Swal.fire(
          "Error",
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            `Something went wrong while ${isEditMode ? "updating" : "saving"}!`,
          "error",
        );
      }
    }
  };

  const inputClass =
    "app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium";

  const tableInputClass =
    "w-full border border-[#c8ddcd] bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] rounded-xl font-semibold py-2.25 px-3 text-xs outline-none transition-all";

  const role = user?.role || "admin";
  const listPath =
    role === "employee"
      ? "/employee/hr/accounting/client/listOfPurchaseVoucher"
      : "/accounting/client/listOfPurchaseVoucher";

  return (
    <>
      <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans">
        <div className="max-w-6xl mx-auto bg-white app-panel border border-[#e2f2e9]/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex justify-between items-center border-b border-[#e2f2e9] pb-5 mb-8">
            <div className="flex items-center gap-3">
              <h2 className="app-title text-xl font-extrabold text-[#042f2e]">
                {isEditMode
                  ? "Purchase Voucher Alteration"
                  : "Purchase Voucher Creation"}
              </h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f0fdf4] text-[#00a651] border border-[#c6f1d6]">
                PUR
              </span>
            </div>

            <div className="flex items-center gap-3">
              <BulkImportButton onImport={handleBulkImport} />
              <button
                type="button"
                onClick={() => navigate(listPath)}
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors text-sm font-medium cursor-pointer"
              >
                <ArrowLeft size={16} /> Back to Purchase Vouchers
              </button>
            </div>
          </div>

          <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
            <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider mb-4 border-b border-[#cbe0d2] pb-1.5 flex items-center gap-2">
              <FileText size={16} className="text-[#00a651]" /> Voucher &
              Supplier Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                  Voucher No :
                </label>
                <input
                  className={inputClass}
                  placeholder="e.g. PUR-001"
                  value={voucher.invoiceNo}
                  onChange={(e) => set("invoiceNo", e.target.value)}
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
                  onChange={(e) => set("date", e.target.value)}
                />
              </div>
              <div>
                <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                  Party Name * :
                </label>
                <input
                  className={inputClass}
                  placeholder="Enter supplier / party"
                  value={voucher.customer}
                  onChange={(e) => set("customer", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                  Supplier Invoice No :
                </label>
                <input
                  className={inputClass}
                  placeholder="e.g. ABC/123"
                  value={voucher.supplierInvoiceNo}
                  onChange={(e) => set("supplierInvoiceNo", e.target.value)}
                />
              </div>
              <div>
                <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                  Supplier Invoice Date :
                </label>
                <input
                  type="date"
                  className={inputClass}
                  value={voucher.supplierInvoiceDate}
                  onChange={(e) => set("supplierInvoiceDate", e.target.value)}
                />
              </div>
              <div>
                <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                  Purchase Ledger * :
                </label>
                <SearchableLedgerSelect
                  ledgers={ledgers}
                  value={voucher.ledger}
                  onSelect={(ledgerId) => {
                    const selectedLedger = ledgers.find(
                      (l) => String(l.id) === String(ledgerId),
                    );
                    setVoucher((prev) => ({
                      ...prev,
                      ledger: ledgerId,
                      customer: selectedLedger?.name || "",
                      mailingName: selectedLedger?.mailingName || "",
                      address: selectedLedger?.address || "",
                      state: selectedLedger?.state || "Not Applicable",
                      country: selectedLedger?.country || "India",
                      gstRegistrationType:
                        selectedLedger?.registrationType ||
                        "Unregistered/Consumer",
                      gstin: selectedLedger?.gstin || "",
                      placeOfSupply: selectedLedger?.state || "Not Applicable",
                    }));
                  }}
                  onCreateNew={(name) => handleQuickCreateLedger(name)}
                  placeholder="— Select ledger —"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-[#e2f2e9]">
              <div>
                <label className="app-label flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1 h-5">
                  <Building size={14} className="text-[#00a651] shrink-0" />
                  <span>Project :</span>
                </label>
                <select
                  className={inputClass}
                  value={parsedProjectAndUnit.projectCompositeKey}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                >
                  <option value="">— No Project Selected —</option>
                  {projectOptions.map((p) => (
                    <option
                      key={p.project_id || p.composite_key || p.id}
                      value={p.project_id}
                    >
                      {p.name || p.project_name}{" "}
                      {p.location ? `- ${p.location}` : ""}{" "}
                      {p.display_type || p.property_type
                        ? `(${p.display_type || p.property_type})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="app-label flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1 h-5">
                  <Layers size={14} className="text-[#00a651] shrink-0" />
                  <span>Unit / Flat :</span>
                </label>
                <select
                  className={inputClass}
                  disabled={!parsedProjectAndUnit.projectCompositeKey}
                  value={parsedProjectAndUnit.unitId}
                  onChange={(e) => handleUnitSelect(e.target.value)}
                >
                  <option value="">— All Units / General Site —</option>
                  {availableUnits.map((u) => {
                    const uId = String(u.unit_id || u.id || "");
                    const uName = u.unit_name || u.name || `Unit ${uId}`;
                    return (
                      <option key={uId} value={uId}>
                        {uName} {u.block ? `(${u.block})` : ""}
                      </option>
                    );
                  })}
                </select>
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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeDetailTab === "receipt" ? "bg-[#00a651] text-white shadow-sm" : "bg-white text-slate-700 border border-[#cbe0d2] hover:bg-[#f0fdf4]"}`}
                onClick={() => setActiveDetailTab("receipt")}
              >
                <Truck size={14} /> Purchase & Dispatch Details
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
                    onChange={(e) => set("mailingName", e.target.value)}
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    Address :
                  </label>
                  <textarea
                    className={`${inputClass} h-20 resize-none`}
                    value={voucher.address}
                    onChange={(e) => set("address", e.target.value)}
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    State :
                  </label>
                  <select
                    className={inputClass}
                    value={voucher.state}
                    onChange={(e) => set("state", e.target.value)}
                  >
                    <option value="Not Applicable">Not Applicable</option>
                    {states.map((s, idx) => (
                      <option key={idx} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                    Country :
                  </label>
                  <select
                    className={inputClass}
                    value={voucher.country}
                    onChange={(e) => set("country", e.target.value)}
                  >
                    <option value="India">India</option>
                    {countries.map((c, idx) => (
                      <option key={idx} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    GST Registration Type :
                  </label>
                  <select
                    className={inputClass}
                    value={voucher.gstRegistrationType}
                    onChange={(e) => set("gstRegistrationType", e.target.value)}
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
                    onChange={(e) => set("gstin", e.target.value)}
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    Place of Supply :
                  </label>
                  <select
                    className={inputClass}
                    value={voucher.placeOfSupply}
                    onChange={(e) => set("placeOfSupply", e.target.value)}
                  >
                    <option value="Not Applicable">Not Applicable</option>
                    {states.map((s, idx) => (
                      <option key={idx} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeDetailTab === "receipt" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                    Receipt Doc No :
                  </label>
                  <input
                    className={inputClass}
                    value={voucher.receiptDocNo}
                    onChange={(e) => set("receiptDocNo", e.target.value)}
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    Dispatched Through :
                  </label>
                  <input
                    className={inputClass}
                    value={voucher.dispatchedThrough}
                    onChange={(e) => set("dispatchedThrough", e.target.value)}
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    Destination :
                  </label>
                  <input
                    className={inputClass}
                    value={voucher.destination}
                    onChange={(e) => set("destination", e.target.value)}
                  />
                </div>
                <div>
                  <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                    Carrier Name / Agent :
                  </label>
                  <input
                    className={inputClass}
                    value={voucher.carrierName}
                    onChange={(e) => set("carrierName", e.target.value)}
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    Bill of Lading / LR No :
                  </label>
                  <input
                    className={inputClass}
                    value={voucher.billOfLading}
                    onChange={(e) => set("billOfLading", e.target.value)}
                  />

                  <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                    Motor Vehicle No :
                  </label>
                  <input
                    className={`${inputClass} uppercase`}
                    value={voucher.motorVehicleNo}
                    onChange={(e) => set("motorVehicleNo", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
            <div className="flex justify-between items-center mb-4 border-b border-[#cbe0d2] pb-1.5">
              <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-[#00a651]" /> Line Items
              </h3>
              <button
                type="button"
                className="flex items-center gap-1 text-xs font-bold text-[#00a651] bg-white border border-[#cbe0d2] px-3 py-1.5 rounded-lg hover:bg-[#f0fdf4] transition-colors cursor-pointer"
                onClick={addRow}
              >
                <Plus size={14} /> Add Line Item
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
                      Qty
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
                        <input
                          className={tableInputClass}
                          placeholder="Item description"
                          value={row.itemName}
                          onChange={(e) =>
                            handleItemChange(index, "itemName", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className={tableInputClass}
                          placeholder="0000"
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
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs ${gst.applied ? "bg-[#00a651] text-white" : "bg-white text-slate-700 border border-[#cbe0d2]"}`}
                    onClick={handleAutoGST}
                  >
                    Auto GST
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs ${!gst.applied && (gst.igst > 0 || gst.cgst > 0 || gst.sgst > 0) ? "bg-amber-600 text-white" : "bg-white text-slate-700 border border-[#cbe0d2]"}`}
                    onClick={handleManualGST}
                  >
                    Manual GST
                  </button>
                </div>
                {gst.applied && (
                  <div className="inline-flex items-center gap-2 px-3 py-2 mb-4 rounded-xl text-xs font-bold bg-[#f0fdf4] border border-[#c6f1d6] text-[#00a651]">
                    {gst.percentage}% GST applied — ₹{" "}
                    {Number(gstAmount).toFixed(2)}
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
                        {label} (%)
                      </span>
                      <input
                        type="number"
                        className="app-input w-24 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] font-medium py-1 px-2 text-xs"
                        placeholder="Rate %"
                        value={gst[key]}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGst((g) => {
                            const updated = { ...g, [key]: val };
                            const newEffective =
                              Number(updated.igst || 0) +
                              Number(updated.cgst || 0) +
                              Number(updated.sgst || 0);
                            return {
                              ...updated,
                              percentage: newEffective,
                              applied: newEffective > 0,
                            };
                          });
                        }}
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
                {gst.applied && (
                  <div className="flex justify-between items-center py-1.5 text-xs text-emerald-700 border-b border-[#e2f2e9]">
                    <span>GST ({gst.percentage}%)</span>
                    <span>₹ {Number(gstAmount).toFixed(2)}</span>
                  </div>
                )}
                {Number(gst.igst) > 0 && (
                  <div className="flex justify-between items-center py-1.5 text-xs text-slate-600 border-b border-[#e2f2e9]">
                    <span>IGST ({gst.igst}%)</span>
                    <span>
                      ₹ {((totalAmount * Number(gst.igst)) / 100).toFixed(2)}
                    </span>
                  </div>
                )}
                {Number(gst.cgst) > 0 && (
                  <div className="flex justify-between items-center py-1.5 text-xs text-slate-600 border-b border-[#e2f2e9]">
                    <span>CGST ({gst.cgst}%)</span>
                    <span>
                      ₹ {((totalAmount * Number(gst.cgst)) / 100).toFixed(2)}
                    </span>
                  </div>
                )}
                {Number(gst.sgst) > 0 && (
                  <div className="flex justify-between items-center py-1.5 text-xs text-slate-600 border-b border-[#e2f2e9]">
                    <span>SGST ({gst.sgst}%)</span>
                    <span>
                      ₹ {((totalAmount * Number(gst.sgst)) / 100).toFixed(2)}
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
              placeholder="Add internal notes or narration for this purchase voucher…"
              value={voucher.narration}
              onChange={(e) => set("narration", e.target.value)}
            />
          </div>

          <div className="mt-8 flex justify-end gap-4 border-t border-[#e2f2e9] pt-6">
            <button
              type="button"
              onClick={saveVoucher}
              className="app-btn-primary flex items-center justify-center gap-2 cursor-pointer shadow-md min-w-36 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Save size={16} />{" "}
              {isEditMode ? "Update Purchase Voucher" : "Save Purchase Voucher"}
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
    </>
  );
};

export default PurchaseVoucher;
