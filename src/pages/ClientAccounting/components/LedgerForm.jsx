import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Save,
  RotateCcw,
  X,
  ArrowLeft,
  Mail,
  Globe,
  Landmark,
  FileText,
} from "lucide-react";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";

const API_URL = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group`;

const LedgerForm = () => {
  const { user, role: userRole, companyId } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const role = userRole || "admin";
  const listPath =
    role === "employee"
      ? "/employee/hr/accounting/client/listOfLedgers"
      : "/accounting/client/listOfLedgers";

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [ledger, setLedger] = useState({
    name: "",
    alias: "",
    under: "",
    openingBalance: 0,
    type: "Debit",
    mailingName: "",
    address: "",
    state: "Not Applicable",
    country: "India",
    pincode: "",
    provideBankDetails: "No",
    pan: "",
    registrationType: "Regular",
    gstin: "",
    alterGst: "No",
  });

  const [errors, setErrors] = useState({ pan: "", gstin: "" });

  const [showBankPopup, setShowBankPopup] = useState(false);

  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    branch: "",
    accountNumber: "",
    ifsc: "",
  });

  const handleLedgerChange = (key, value) => {
    let finalValue = value;
    if (key === "pan" || key === "gstin") {
      finalValue = value.toUpperCase();
    }
    setLedger((prev) => ({ ...prev, [key]: finalValue }));

    if (key === "pan") {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      setErrors((prev) => ({
        ...prev,
        pan:
          finalValue && !panRegex.test(finalValue)
            ? "Invalid PAN format (e.g. ABCDE1234F)"
            : "",
      }));
    }
    if (key === "gstin") {
      const gstinRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      setErrors((prev) => ({
        ...prev,
        gstin:
          finalValue && !gstinRegex.test(finalValue)
            ? "Invalid GSTIN format (e.g. 27AAAAA0000A1Z5)"
            : "",
      }));
    }
  };

  const handleBankChange = (key, value) =>
    setBankDetails((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!companyId) return;

    const fetchGroups = async () => {
      try {
        const res = await axios.get(`${API_URL}/all/${companyId}`);
        setGroups(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching groups:", err);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [companyId]);

  useEffect(() => {
    if (!id || !companyId) return;

    const fetchLedger = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/${id}`,
        );
        const data = res.data;

        let actualUnderGroupName = data.underGroup;
        let actualGroupId = data.groupId;
        if (data.underGroup && data.underGroup.trim().startsWith("{")) {
          try {
            const parsed = JSON.parse(data.underGroup);
            actualUnderGroupName = parsed.name;
            if (parsed.id) actualGroupId = parsed.id;
          } catch (e) {
            console.error("Could not parse nested underGroup:", e);
          }
        }

        setLedger({
          name: data.name,
          alias: data.aliasName,
          under: JSON.stringify({
            id: actualGroupId,
            name: actualUnderGroupName,
          }),
          openingBalance: data.openingBalance,
          type: data.balanceType,
          mailingName: data.mailingName,
          address: data.address,
          state: data.state,
          country: data.country,
          pincode: data.pincode,
          provideBankDetails: data.haveBankDetails,
          pan: data.pan,
          registrationType: data.registrationType,
          gstin: data.gstin,
          alterGst: data.alterGstDetails,
        });

        if (data.bankDetails) {
          setBankDetails(data.bankDetails);
        }
      } catch (err) {
        console.error("Error fetching ledger:", err);
        Swal.fire("Error", "Could not load ledger data", "error");
      }
    };

    fetchLedger();
  }, [id, companyId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name");
    if (name && !id) {
      setLedger((prev) => ({
        ...prev,
        name: name,
        mailingName: name,
      }));
    }
  }, [id]);
  console.log(groups);

  const handleSubmit = async () => {
    if (!ledger.name || !ledger.under) {
      Swal.fire("Error", "Name & Under Group are required!", "error");
      return;
    }

    if (!companyId) {
      Swal.fire("Error", "Company not selected!", "error");
      return;
    }

    const employeeId = user?.employee_id || null;
    const role = userRole || "admin";

    const payload = {
      ...ledger,
      companyId,
      bankDetails: ledger.provideBankDetails === "Yes" ? bankDetails : null,
      ...(employeeId && { employee_id: employeeId }),
      role,
    };

    try {
      if (id) {
        await axios.put(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/update/${companyId}/${id}`,
          payload,
        );
        Swal.fire({
          icon: "success",
          title: "Ledger Updated Successfully",
          text: "The ledger has been updated.",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(listPath);
        return;
      } else {
        console.log("Creating ledger with payload:", payload);
        await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/create`,
          payload,
        );

        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        if (redirect) {
          Swal.fire({
            icon: "success",
            title: "Ledger Created Successfully",
            text: "The ledger has been created.",
            timer: 1500,
            showConfirmButton: false,
          });
          navigate(redirect);
          return;
        }

        const result = await Swal.fire({
          icon: "success",
          title: "Ledger Created Successfully",
          text: "The ledger has been saved. Would you like to create another ledger?",
          showCancelButton: true,
          confirmButtonColor: "#2563eb",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Create Another",
          cancelButtonText: "Go to Ledger List",
        });

        if (!result.isConfirmed) {
          navigate(listPath);
          return;
        }
      }

      setLedger({
        name: "",
        alias: "",
        under: "",
        openingBalance: 0,
        type: "Debit",
        mailingName: "",
        address: "",
        state: "Not Applicable",
        country: "India",
        pincode: "",
        provideBankDetails: "No",
        pan: "",
        registrationType: "Regular",
        gstin: "",
        alterGst: "No",
      });

      setErrors({ pan: "", gstin: "" });

      setBankDetails({
        bankName: "",
        branch: "",
        accountNumber: "",
        ifsc: "",
      });
    } catch (err) {
      Swal.fire("Error", "Could not save ledger!", "error");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans">
      <div className="max-w-6xl mx-auto bg-white app-panel border border-[#e2f2e9]/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex justify-between items-center border-b border-[#e2f2e9] pb-5 mb-8">
          <h2 className="app-title text-xl font-extrabold text-[#042f2e]">
            {id ? "Ledger Alteration" : "Ledger Creation"}
          </h2>
          <button
            onClick={() => navigate(listPath)}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors text-sm font-medium cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Ledger List
          </button>
        </div>

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider mb-4 border-b border-[#cbe0d2] pb-1.5 flex items-center gap-2">
            <FileText size={16} className="text-[#00a651]" /> Identity &
            Grouping
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Name :
              </label>
              <input
                type="text"
                value={ledger.name}
                onChange={(e) => handleLedgerChange("name", e.target.value)}
                className="app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium"
                placeholder="Enter ledger name"
              />

              <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
                (alias) :
              </label>
              <input
                type="text"
                value={ledger.alias}
                onChange={(e) => handleLedgerChange("alias", e.target.value)}
                className="app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium"
                placeholder="Enter alias"
              />
            </div>

            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Opening Balance :
              </label>
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  value={ledger.openingBalance}
                  onChange={(e) =>
                    handleLedgerChange("openingBalance", e.target.value)
                  }
                  className="app-input flex-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium"
                  placeholder="0.00"
                />
                <select
                  value={ledger.type}
                  onChange={(e) => handleLedgerChange("type", e.target.value)}
                  className="app-input w-28 bg-white border-[#c8ddcd]! text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] cursor-pointer font-medium"
                >
                  <option value="Debit">Dr</option>
                  <option value="Credit">Cr</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-[#cbe0d2]">
            <label className="app-label block text-xs font-bold text-slate-800 mb-1">
              Under Group :
            </label>

            {loading ? (
              <p className="text-slate-500 text-sm italic mt-2">
                Loading groups...
              </p>
            ) : (
              <select
                value={ledger.under}
                onChange={(e) => handleLedgerChange("under", e.target.value)}
                className="app-input w-full md:w-1/2 mt-1.5 bg-white border-[#c8ddcd]! text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] cursor-pointer font-medium"
              >
                <option value="">Select a group</option>

                {groups.map((g) => (
                  <option
                    key={g.id}
                    value={JSON.stringify({ id: g.id, name: g.groupName })}
                  >
                    {g.groupName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)]">
            <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider mb-4 border-b border-[#cbe0d2] pb-1.5 flex items-center gap-2">
              <Mail size={16} className="text-[#00a651]" /> Mailing Details
            </h3>

            <label className="app-label block text-xs font-bold text-slate-800 mb-1">
              Mailing Name :
            </label>
            <input
              type="text"
              value={ledger.mailingName}
              onChange={(e) =>
                handleLedgerChange("mailingName", e.target.value)
              }
              className="app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium"
              placeholder="Enter mailing name"
            />

            <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
              Address :
            </label>
            <textarea
              value={ledger.address}
              onChange={(e) => handleLedgerChange("address", e.target.value)}
              className="app-input w-full mt-1 h-20 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium"
              placeholder="Enter address details"
            />
          </div>

          <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)]">
            <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider mb-4 border-b border-[#cbe0d2] pb-1.5 flex items-center gap-2">
              <Globe size={16} className="text-[#00a651]" /> Location & Region
            </h3>

            <label className="app-label block text-xs font-bold text-slate-800 mb-1">
              State :
            </label>
            <select
              value={ledger.state}
              onChange={(e) => handleLedgerChange("state", e.target.value)}
              className="app-input w-full mt-1 bg-white border-[#c8ddcd]! text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] cursor-pointer font-medium"
            >
              <option>Not Applicable</option>
              <option>Andhra Pradesh</option>
              <option>Arunachal Pradesh</option>
              <option>Assam</option>
              <option>Bihar</option>
              <option>Chhattisgarh</option>
              <option>Goa</option>
              <option>Gujarat</option>
              <option>Haryana</option>
              <option>Himachal Pradesh</option>
              <option>Jharkhand</option>
              <option>Karnataka</option>
              <option>Kerala</option>
              <option>Madhya Pradesh</option>
              <option>Maharashtra</option>
              <option>Manipur</option>
              <option>Meghalaya</option>
              <option>Mizoram</option>
              <option>Nagaland</option>
              <option>Odisha</option>
              <option>Punjab</option>
              <option>Rajasthan</option>
              <option>Sikkim</option>
              <option>Tamil Nadu</option>
              <option>Telangana</option>
              <option>Tripura</option>
              <option>Uttar Pradesh</option>
              <option>Uttarakhand</option>
              <option>West Bengal</option>
              <option>Andaman and Nicobar Islands</option>
              <option>Chandigarh</option>
              <option>Dadra and Nagar Haveli and Daman and Diu</option>
              <option>Delhi</option>
              <option>Jammu and Kashmir</option>
              <option>Ladakh</option>
              <option>Lakshadweep</option>
              <option>Puducherry</option>
            </select>

            <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
              Country :
            </label>
            <input
              type="text"
              value={ledger.country}
              onChange={(e) => handleLedgerChange("country", e.target.value)}
              className="app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium"
              placeholder="Enter country"
            />

            <label className="app-label block text-xs font-bold text-slate-800 mb-1 mt-4">
              Pincode :
            </label>
            <input
              type="text"
              value={ledger.pincode}
              onChange={(e) => handleLedgerChange("pincode", e.target.value)}
              className="app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium"
              placeholder="Enter pincode"
            />
          </div>
        </div>

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider mb-4 border-b border-[#cbe0d2] pb-1.5 flex items-center gap-2">
            <Landmark size={16} className="text-[#00a651]" /> Beneficiary
            Details
          </h3>

          <div className="flex items-center gap-3 mt-2">
            <label className="app-label block text-xs font-bold text-slate-800">
              Provide Beneficiary details :
            </label>
            <select
              value={ledger.provideBankDetails}
              onChange={(e) => {
                const val = e.target.value;
                handleLedgerChange("provideBankDetails", val);
                if (val === "Yes") {
                  setShowBankPopup(true);
                } else {
                  setBankDetails({
                    bankName: "",
                    branch: "",
                    accountNumber: "",
                    ifsc: "",
                  });
                }
              }}
              className="app-input bg-white border-[#c8ddcd]! text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] cursor-pointer py-1 px-3 min-h-9 font-medium"
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>

          {ledger.provideBankDetails === "Yes" && (
            <div className="mt-4 p-4 bg-white border border-[#cbe0d2] rounded-xl shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-[#042f2e] uppercase tracking-wider flex items-center gap-1.5">
                  Saved Bank Details
                </span>
                <button
                  type="button"
                  onClick={() => setShowBankPopup(true)}
                  className="text-xs font-bold text-[#00a651] hover:underline cursor-pointer flex items-center gap-1"
                >
                  Edit Bank Details
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">
                    Bank Name
                  </span>
                  <span className="font-semibold text-slate-800">
                    {bankDetails.bankName || "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">
                    Account Number
                  </span>
                  <span className="font-semibold text-slate-800">
                    {bankDetails.accountNumber || "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">
                    IFSC Code
                  </span>
                  <span className="font-semibold text-slate-800">
                    {bankDetails.ifsc || "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">
                    Branch
                  </span>
                  <span className="font-semibold text-slate-800">
                    {bankDetails.branch || "—"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider mb-4 border-b border-[#cbe0d2] pb-1.5 flex items-center gap-2">
            <FileText size={16} className="text-[#00a651]" /> Tax Registration
            Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                PAN/IT No. :
              </label>
              <input
                type="text"
                value={ledger.pan}
                onChange={(e) => handleLedgerChange("pan", e.target.value)}
                placeholder="eg: ABCDE1234F"
                maxLength={10}
                className={`app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium ${errors.pan ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`}
              />
              {errors.pan && (
                <p className="text-red-500 text-[11px] mt-1 font-semibold">
                  {errors.pan}
                </p>
              )}
            </div>

            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Registration Type :
              </label>
              <select
                value={ledger.registrationType}
                onChange={(e) =>
                  handleLedgerChange("registrationType", e.target.value)
                }
                className="app-input w-full mt-1 bg-white border-[#c8ddcd]! text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] cursor-pointer font-medium"
              >
                <option>Regular</option>
                <option>Composition</option>
                <option>Unregistered</option>
              </select>
            </div>

            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                GSTIN/UIN :
              </label>
              <input
                type="text"
                value={ledger.gstin}
                onChange={(e) => handleLedgerChange("gstin", e.target.value)}
                placeholder="eg: 27AAAAA0000A1Z5"
                maxLength={15}
                className={`app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium ${errors.gstin ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`}
              />
              {errors.gstin && (
                <p className="text-red-500 text-[11px] mt-1 font-semibold">
                  {errors.gstin}
                </p>
              )}
            </div>

            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Alter additional GST details :
              </label>
              <select
                value={ledger.alterGst}
                onChange={(e) => handleLedgerChange("alterGst", e.target.value)}
                className="app-input w-full mt-1 bg-[#fffdf5] border-[#c8ddcd]! text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] cursor-pointer font-medium"
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4 border-t border-[#e2f2e9] pt-6">
          <button
            onClick={handleSubmit}
            className="app-btn-primary flex items-center justify-center gap-2 cursor-pointer shadow-md min-w-30 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Save size={16} /> Save Ledger
          </button>

          <button
            onClick={() => window.location.reload()}
            className="app-btn-secondary flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 hover:text-slate-800 min-w-30 transition-all"
          >
            <RotateCcw size={16} /> Reset Form
          </button>

          <button
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              const redirect = params.get("redirect");
              if (redirect) {
                navigate(redirect);
              } else {
                navigate(-1);
              }
            }}
            className="app-btn-secondary flex items-center justify-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl cursor-pointer hover:bg-rose-100 hover:text-rose-800 hover:border-rose-300 min-w-30 transition-all"
          >
            <X size={16} /> Cancel
          </button>
        </div>
      </div>

      {showBankPopup && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-[#e2f2e9]">
            <h3 className="text-lg font-bold text-[#042f2e] border-b border-[#e2f2e9] pb-3 mb-4">
              Bank Details
            </h3>

            <label className="app-label block text-xs font-bold text-slate-700 mb-1">
              Bank Name :
            </label>
            <input
              type="text"
              value={bankDetails.bankName}
              onChange={(e) => handleBankChange("bankName", e.target.value)}
              className="app-input w-full mt-1 border-[#e2f2e9] focus:border-[#00a651]"
              placeholder="Enter bank name"
            />

            <label className="app-label block text-xs font-bold text-slate-700 mb-1 mt-3">
              Account Number :
            </label>
            <input
              type="text"
              value={bankDetails.accountNumber}
              onChange={(e) =>
                handleBankChange("accountNumber", e.target.value)
              }
              className="app-input w-full mt-1 border-[#e2f2e9] focus:border-[#00a651]"
              placeholder="Enter account number"
            />

            <label className="app-label block text-xs font-bold text-slate-700 mb-1 mt-3">
              IFSC Code :
            </label>
            <input
              type="text"
              value={bankDetails.ifsc}
              onChange={(e) => handleBankChange("ifsc", e.target.value)}
              className="app-input w-full mt-1 border-[#e2f2e9] focus:border-[#00a651]"
              placeholder="Enter IFSC code"
            />

            <label className="app-label block text-xs font-bold text-slate-700 mb-1 mt-3">
              Branch :
            </label>
            <input
              type="text"
              value={bankDetails.branch}
              onChange={(e) => handleBankChange("branch", e.target.value)}
              className="app-input w-full mt-1 mb-6 border-[#e2f2e9] focus:border-[#00a651]"
              placeholder="Enter branch name"
            />

            <div className="flex justify-end gap-3 border-t border-[#e2f2e9] pt-4">
              <button
                className="app-btn-primary py-1 px-4 min-h-9 rounded-lg text-xs cursor-pointer shadow-sm"
                onClick={() => setShowBankPopup(false)}
              >
                Save
              </button>

              <button
                className="app-btn-secondary py-1 px-4 min-h-9 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-700 cursor-pointer hover:bg-slate-100 hover:text-slate-800"
                onClick={() => {
                  setShowBankPopup(false);
                  handleLedgerChange("provideBankDetails", "No");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LedgerForm;
