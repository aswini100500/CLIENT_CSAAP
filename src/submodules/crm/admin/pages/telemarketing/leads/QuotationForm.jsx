import {
  Calculator,
  ChevronDown,
  CreditCard,
  Download,
  Image as ImageIcon,
  Mail,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToWords } from "to-words";
import { downloadQuotationPDF } from "./QuotationDocument";
import { usePermission } from "../../../../../../hooks/usePermission";

const QuotationForm = () => {
  const { has } = usePermission();
  const canCreate = has("crm.quotation.create");

  const printRef = useRef();
  const navigate = useNavigate();
  const [contentVisible, setContentVisible] = useState(false);
  const logoInputRef = useRef(null);
  const [logoUrl, setLogoUrl] = useState(null);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const revealTimer = setTimeout(() => {
      setContentVisible(true);
    }, 40);
    return () => clearTimeout(revealTimer);
  }, []);

  const [country, setCountry] = useState({
    name: "India",
    code: "IN",
    currency: "INR",
    symbol: "₹",
    flag: "🇮🇳",
    phoneCode: "+91",
    rate: 1,
  });

  const countries = [
    {
      name: "India",
      code: "IN",
      currency: "INR",
      symbol: "₹",
      flag: "🇮🇳",
      phoneCode: "+91",
      rate: 1,
    },
    {
      name: "USA",
      code: "US",
      currency: "USD",
      symbol: "$",
      flag: "🇺🇸",
      phoneCode: "+1",
      rate: 0.012,
    },
  ];

  const [headerInfo, setHeaderInfo] = useState({
    companyName: "Your Company Name",
    email: "contact@company.com",
    phone: "9876543210",
  });

  const [clientEmails, setClientEmails] = useState([]);
  const [clientPans, setClientPans] = useState([]);
  const [vendorEmails, setVendorEmails] = useState([]);
  const [vendorPans, setVendorPans] = useState([]);

  const [items, setItems] = useState([
    { id: 1, name: "", hsn: "", gst: 18, qty: 1, rate: 0, amount: 0 },
  ]);

  const [quotationNo, setQuotationNo] = useState("A00001");
  const [quotationDate, setQuotationDate] = useState("2026-05-23");
  const [fromDetails, setFromDetails] = useState({
    businessName: "",
    phone: "",
    gstin: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [forDetails, setForDetails] = useState({
    businessName: "",
    phone: "",
    gstin: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [terms, setTerms] = useState(
    "1. Validity of this quotation is 30 days.\n2. Delivery within 7 working days.\n3. Prices are inclusive of all taxes.",
  );

  const handleCountryChange = (selectedCountry) => {
    const conversionFactor = selectedCountry.rate / country.rate;
    const updatedItems = items.map((item) => ({
      ...item,
      rate: parseFloat((item.rate * conversionFactor).toFixed(2)),
      amount: parseFloat(
        (item.qty * (item.rate * conversionFactor)).toFixed(2),
      ),
    }));
    setItems(updatedItems);
    setCountry(selectedCountry);
  };

  const updateItem = (id, field, value) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        updatedItem.amount = updatedItem.qty * updatedItem.rate;
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  const addItem = () =>
    setItems([
      ...items,
      {
        id: Date.now(),
        name: "",
        hsn: "",
        gst: 18,
        qty: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  const removeItem = (id) => setItems(items.filter((item) => item.id !== id));

  const addField = (type, side) => {
    if (side === "For") {
      if (type === "email") {
        if (clientEmails.length >= 1) return;
        setClientEmails([...clientEmails, ""]);
      } else {
        if (clientPans.length >= 1) return;
        setClientPans([...clientPans, ""]);
      }
    } else {
      if (type === "email") {
        if (vendorEmails.length >= 1) return;
        setVendorEmails([...vendorEmails, ""]);
      } else {
        if (vendorPans.length >= 1) return;
        setVendorPans([...vendorPans, ""]);
      }
    }
  };

  const updateField = (side, type, index, value) => {
    if (side === "For") {
      if (type === "email") {
        const newEmails = [...clientEmails];
        newEmails[index] = value;
        setClientEmails(newEmails);
      } else {
        const newPans = [...clientPans];
        newPans[index] = value;
        setClientPans(newPans);
      }
    } else {
      if (type === "email") {
        const newEmails = [...vendorEmails];
        newEmails[index] = value;
        setVendorEmails(newEmails);
      } else {
        const newPans = [...vendorPans];
        newPans[index] = value;
        setVendorPans(newPans);
      }
    }
  };

  const removeField = (side, type, index) => {
    if (side === "For") {
      type === "email"
        ? setClientEmails(clientEmails.filter((_, i) => i !== index))
        : setClientPans(clientPans.filter((_, i) => i !== index));
    } else {
      type === "email"
        ? setVendorEmails(vendorEmails.filter((_, i) => i !== index))
        : setVendorPans(vendorPans.filter((_, i) => i !== index));
    }
  };

  const subtotal = items.reduce((acc, item) => acc + item.qty * item.rate, 0);
  const totalGst = items.reduce(
    (acc, item) => acc + item.qty * item.rate * (item.gst / 100),
    0,
  );
  const sgst = totalGst / 2;
  const cgst = totalGst / 2;
  const grandTotal = subtotal + totalGst;

  const totalInWords = React.useMemo(() => {
    if (grandTotal <= 0) return "Zero";
    try {
      const converter = new ToWords({
        localeCode: country.code === "IN" ? "en-IN" : "en-US",
        converterOptions: {
          currency: true,
          ignoreDecimal: false,
          ignoreZeroCurrency: false,
          doNotAddOnly: false,
          currencyOptions: {
            name: country.currency === "INR" ? "Rupee" : "Dollar",
            plural: country.currency === "INR" ? "Rupees" : "Dollars",
            symbol: country.symbol,
            fractionalUnit: {
              name: country.currency === "INR" ? "Paise" : "Cent",
              plural: country.currency === "INR" ? "Paise" : "Cents",
              symbol: "",
            },
          },
        },
      });
      return converter.convert(grandTotal);
    } catch (error) {
      return "Error calculating words";
    }
  }, [grandTotal, country]);

  const generatePDF = async () => {
    const data = {
      quotationNo,
      quotationDate,
      logoUrl,
      headerInfo,
      country,
      fromDetails,
      forDetails,
      vendorEmails,
      vendorPans,
      clientEmails,
      clientPans,
      items,
      subtotal,
      totalGst,
      sgst,
      cgst,
      grandTotal,
      totalInWords,
      terms,
    };
    await downloadQuotationPDF(data);
  };

  return (
    <div className="crm-module-root">
      <div
        className={`app-shell p-4 transition-all duration-400 ease-out ${contentVisible ? "opacity-100 blur-0 translate-y-0" : "opacity-0 blur-xs translate-y-2"}`}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-(--border-soft) pb-4">
            <div>
              <h1 className="app-title">Quotation Generator</h1>
              <p className="app-subtitle mt-1">
                Create and manage quotations for your leads.
              </p>
            </div>
          </div>

          <div className="app-panel overflow-hidden">
            <div ref={printRef} className="p-6 md:p-8 space-y-8 bg-white">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-(--border-soft) pb-6">
                <div className="space-y-3">
                  <h2 className="text-3xl font-extrabold text-(--text-strong) tracking-tight">
                    Quotation
                  </h2>
                  <div className="text-xs space-y-1.5">
                    <p className="flex items-center gap-2 text-(--text-faint)">
                      No:
                      <input
                        type="text"
                        value={quotationNo}
                        onChange={(e) => setQuotationNo(e.target.value)}
                        className="font-bold text-(--text-strong) outline-none w-28 border-b border-dashed border-(--border-soft) focus:border-(--brand) px-1 py-0.5 bg-transparent"
                      />
                    </p>
                    <p className="flex items-center gap-2 text-(--text-faint)">
                      Date:
                      <input
                        type="date"
                        value={quotationDate}
                        onChange={(e) => setQuotationDate(e.target.value)}
                        className="text-(--text-strong) font-semibold outline-none border-b border-dashed border-(--border-soft) focus:border-(--brand) px-1 py-0.5 bg-transparent"
                      />
                    </p>
                    <div className="flex items-center gap-2 text-(--text-faint) mt-1">
                      Currency:
                      <div className="relative inline-block group">
                        <select
                          onChange={(e) =>
                            handleCountryChange(
                              countries.find((c) => c.name === e.target.value),
                            )
                          }
                          value={country.name}
                          className="appearance-none bg-transparent font-semibold text-(--text-strong) outline-none border-b border-dashed border-(--border-soft) focus:border-(--brand) pr-5 pl-1 py-0.5 cursor-pointer text-xs"
                        >
                          {countries.map((c) => (
                            <option
                              key={c.code}
                              value={c.name}
                              className="text-black bg-white"
                            >
                              {c.flag} {c.name} ({c.currency})
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={10}
                          className="absolute right-1 top-2 text-(--text-faint) pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-56 bg-(--bg-app) p-3 border border-(--border-soft) flex flex-col items-center">
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    className="cursor-pointer hover:scale-105 active:scale-95 transition-all text-(--brand) mb-1.5 flex items-center justify-center min-h-16 w-full group"
                    title="Upload Company Logo"
                  >
                    {logoUrl ? (
                      <div className="relative max-h-16 max-w-full flex items-center justify-center">
                        <img
                          src={logoUrl}
                          alt="Logo"
                          className="max-h-16 max-w-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Plus size={16} className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <ImageIcon size={48} />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <input
                    value={headerInfo.companyName}
                    onChange={(e) =>
                      setHeaderInfo({
                        ...headerInfo,
                        companyName: e.target.value,
                      })
                    }
                    className="w-full text-center font-bold text-(--text-strong) bg-transparent outline-none text-xs border-b border-dashed border-(--border-soft) focus:border-(--brand) pb-1 px-1 py-0.5"
                  />
                  <input
                    value={headerInfo.email}
                    onChange={(e) =>
                      setHeaderInfo({ ...headerInfo, email: e.target.value })
                    }
                    className="w-full text-center text-[10px] text-(--text-soft) bg-transparent outline-none border-b border-dashed border-(--border-soft) focus:border-(--brand) mt-1.5 px-1 py-0.5"
                  />
                  <input
                    value={headerInfo.phone}
                    onChange={(e) =>
                      setHeaderInfo({ ...headerInfo, phone: e.target.value })
                    }
                    className="w-full text-center text-[10px] text-(--text-soft) bg-transparent outline-none border-b border-dashed border-(--border-soft) focus:border-(--brand) mt-1 px-1 py-0.5"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                {["From", "For"].map((type) => {
                  const details = type === "From" ? fromDetails : forDetails;
                  const setDetails =
                    type === "From" ? setFromDetails : setForDetails;

                  return (
                    <div
                      key={type}
                      className="space-y-3.5 bg-(--bg-panel)/50 p-4 rounded-2xl border border-(--border-soft)"
                    >
                      <div className="flex items-center justify-between border-b border-(--border-soft) pb-2 mb-1.5">
                        <h3 className="font-bold text-(--text-strong) text-sm">
                          Quotation {type}
                        </h3>
                        <span className="text-[9px] font-extrabold text-(--text-faint) uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-(--border-soft)">
                          {type === "From"
                            ? "Your Details"
                            : "Client's Details"}
                        </span>
                      </div>

                      <input
                        placeholder={`${type === "From" ? "Your" : "Client's"} Business Name (required)`}
                        value={details.businessName}
                        onChange={(e) =>
                          setDetails({
                            ...details,
                            businessName: e.target.value,
                          })
                        }
                        className="app-input w-full px-3 py-1.5 text-xs focus:ring-1 focus:ring-(--brand-ring)"
                      />

                      <div className="flex items-center gap-2 border border-(--border-soft) bg-white rounded-lg px-3 py-1.5">
                        <div className="flex items-center gap-1 text-xs font-semibold text-(--text-strong) select-none">
                          <span>{country.flag}</span>{" "}
                          <span className="text-[10px] text-(--text-soft)">
                            {country.phoneCode}
                          </span>
                        </div>
                        <input
                          placeholder="Phone Number"
                          value={details.phone}
                          onChange={(e) =>
                            setDetails({ ...details, phone: e.target.value })
                          }
                          className="w-full outline-none text-xs text-(--text-strong)"
                        />
                      </div>

                      <input
                        placeholder={`${type === "From" ? "Your" : "Client's"} GSTIN (optional)`}
                        value={details.gstin}
                        onChange={(e) =>
                          setDetails({ ...details, gstin: e.target.value })
                        }
                        className="app-input w-full px-3 py-1.5 text-xs"
                      />
                      <input
                        placeholder="Address (optional)"
                        value={details.address}
                        onChange={(e) =>
                          setDetails({ ...details, address: e.target.value })
                        }
                        className="app-input w-full px-3 py-1.5 text-xs"
                      />

                      {(type === "From" ? vendorEmails : clientEmails).map(
                        (email, idx) => (
                          <div
                            key={`email-${idx}`}
                            className="flex items-center gap-2 border border-(--border-soft) bg-white rounded-lg px-2.5 py-1"
                          >
                            <Mail
                              size={12}
                              className="text-(--brand) shrink-0"
                            />
                            <input
                              value={email}
                              onChange={(e) =>
                                updateField(type, "email", idx, e.target.value)
                              }
                              placeholder="Enter Email"
                              className="w-full outline-none text-xs text-(--text-strong)"
                            />
                            <button
                              onClick={() => removeField(type, "email", idx)}
                              className="text-(--text-faint) hover:text-red-500 transition-colors shrink-0"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ),
                      )}

                      {(type === "From" ? vendorPans : clientPans).map(
                        (pan, idx) => (
                          <div
                            key={`pan-${idx}`}
                            className="flex items-center gap-2 border border-(--border-soft) bg-white rounded-lg px-2.5 py-1"
                          >
                            <CreditCard
                              size={12}
                              className="text-(--brand) shrink-0"
                            />
                            <input
                              value={pan}
                              onChange={(e) =>
                                updateField(type, "pan", idx, e.target.value)
                              }
                              placeholder="Enter PAN Number"
                              className="w-full outline-none text-xs text-(--text-strong)"
                            />
                            <button
                              onClick={() => removeField(type, "pan", idx)}
                              className="text-(--text-faint) hover:text-red-500 transition-colors shrink-0"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ),
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          placeholder="City"
                          value={details.city}
                          onChange={(e) =>
                            setDetails({ ...details, city: e.target.value })
                          }
                          className="app-input w-full px-3 py-1.5 text-xs"
                        />
                        <input
                          placeholder="Postal Code"
                          value={details.postalCode}
                          onChange={(e) =>
                            setDetails({
                              ...details,
                              postalCode: e.target.value,
                            })
                          }
                          className="app-input w-full px-3 py-1.5 text-xs"
                        />
                      </div>

                      {(() => {
                        const emails =
                          type === "From" ? vendorEmails : clientEmails;
                        const pans = type === "From" ? vendorPans : clientPans;
                        const canAddEmail = emails.length < 1;
                        const canAddPan = pans.length < 1;

                        if (!canAddEmail && !canAddPan) return null;

                        return (
                          <div className="flex gap-4 pt-1.5 border-t border-(--border-soft) mt-2">
                            {canAddEmail && (
                              <button
                                type="button"
                                onClick={() => addField("email", type)}
                                className="flex items-center gap-1 text-[9px] font-bold text-(--brand) uppercase tracking-wider hover:text-(--brand-strong) transition-colors cursor-pointer"
                              >
                                <Mail size={10} /> Add Email
                              </button>
                            )}
                            {canAddPan && (
                              <button
                                type="button"
                                onClick={() => addField("pan", type)}
                                className="flex items-center gap-1 text-[9px] font-bold text-(--brand) uppercase tracking-wider hover:text-(--brand-strong) transition-colors cursor-pointer"
                              >
                                <CreditCard size={10} /> Add PAN
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                <div className="app-section-bar px-4 py-2 rounded-t-lg">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                    Quotation Line Items
                  </h4>
                </div>
                <div className="overflow-x-auto border border-(--border-soft) rounded-lg">
                  <table className="min-w-full divide-y divide-(--border-soft)">
                    <thead className="bg-(--bg-app)">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                          Item Description
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-widest text-(--text-soft) w-28">
                          HSN/SAC
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-widest text-(--text-soft) w-20">
                          Qty
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-widest text-(--text-soft) w-32">
                          Rate ({country.symbol})
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-widest text-(--text-soft) w-20">
                          GST %
                        </th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-extrabold uppercase tracking-widest text-(--text-soft) w-36">
                          Total ({country.symbol})
                        </th>
                        <th className="px-3 py-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-(--border-soft) text-xs text-(--text-body)">
                      {items.map((item) => (
                        <tr
                          key={item.id}
                          className="group hover:bg-(--bg-subtle)/40 transition-colors"
                        >
                          <td className="px-3 py-2">
                            <input
                              value={item.name}
                              onChange={(e) =>
                                updateItem(item.id, "name", e.target.value)
                              }
                              placeholder="e.g. 2BHK Flat Booking"
                              className="w-full bg-transparent outline-none border-b border-transparent focus:border-(--border-strong) px-1 py-0.5"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={item.hsn}
                              onChange={(e) =>
                                updateItem(item.id, "hsn", e.target.value)
                              }
                              placeholder="HSN Code"
                              className="w-full bg-transparent outline-none border-b border-transparent focus:border-(--border-strong) px-1 py-0.5"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={item.qty}
                              min="1"
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "qty",
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-full bg-transparent outline-none border-b border-transparent focus:border-(--border-strong) px-1 py-0.5 font-semibold"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={item.rate}
                              min="0"
                              step="0.01"
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "rate",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-full bg-transparent outline-none border-b border-transparent focus:border-(--border-strong) px-1 py-0.5 font-semibold"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={item.gst}
                              min="0"
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "gst",
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-full bg-transparent outline-none border-b border-transparent focus:border-(--border-strong) px-1 py-0.5"
                            />
                          </td>
                          <td className="px-4 py-2 text-right font-bold text-(--text-strong)">
                            {country.symbol}
                            {item.amount.toLocaleString(
                              country.code === "IN" ? "en-IN" : "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </td>
                          <td className="px-2 py-2">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-(--text-faint) hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete Item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1.5 text-[9px] font-extrabold text-(--brand) uppercase tracking-widest hover:text-(--brand-strong) transition-colors mt-2"
                >
                  <Plus size={12} /> Add New Line
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-(--text-strong)">
                      Terms and Conditions
                    </h4>
                  </div>
                  <textarea
                    className="app-input w-full h-32 p-3 text-xs focus:ring-1 focus:ring-(--brand-ring)"
                    placeholder="Provide quotation terms, validities, details..."
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                  />
                </div>

                <div className="app-panel-muted p-5 rounded-2xl space-y-4 shadow-sm border border-(--border-soft)">
                  <div className="flex items-center justify-between text-(--text-strong) font-bold border-b border-(--border-soft) pb-2 mb-2">
                    <span className="text-xs font-bold">
                      Calculation Breakdown
                    </span>
                    <Calculator size={14} className="text-(--text-faint)" />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-(--text-soft) font-medium">
                        Subtotal
                      </span>
                      <span className="font-semibold text-(--text-strong)">
                        {country.symbol}
                        {subtotal.toLocaleString(
                          country.code === "IN" ? "en-IN" : "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </span>
                    </div>
                    {country.currency === "INR" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-(--text-soft) font-medium">
                            SGST (9%)
                          </span>
                          <span className="font-semibold text-(--text-strong)">
                            {country.symbol}
                            {sgst.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-(--border-soft) pb-2">
                          <span className="text-(--text-soft) font-medium">
                            CGST (9%)
                          </span>
                          <span className="font-semibold text-(--text-strong)">
                            {country.symbol}
                            {cgst.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-between items-end pt-2 border-t border-(--border-soft)">
                    <div>
                      <h2 className="text-sm font-extrabold text-(--text-strong) uppercase tracking-wider">
                        Total{" "}
                        <span className="text-[10px] text-(--text-faint) font-normal">
                          ({country.currency})
                        </span>
                      </h2>
                    </div>
                    <span className="text-xl font-extrabold text-(--text-strong)">
                      {country.symbol}
                      {grandTotal.toLocaleString(
                        country.code === "IN" ? "en-IN" : "en-US",
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                      )}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-(--border-soft)">
                    <div className="p-2.5 bg-white border border-(--border-soft) rounded-lg">
                      <p className="text-[8px] text-(--text-faint) uppercase font-bold mb-0.5">
                        Total Amount (in words)
                      </p>
                      <p className="text-[10px] text-(--brand-strong) font-semibold capitalize leading-snug">
                        {totalInWords}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-(--border-soft) flex justify-end">
              {canCreate && (
                <button
                  type="button"
                  onClick={generatePDF}
                  className="app-btn-primary flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  Save & Export PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationForm;
