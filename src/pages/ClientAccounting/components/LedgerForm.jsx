import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Save, RotateCcw, X } from "lucide-react";
import Swal from "sweetalert2";
import { useCompany } from "../context/CompanyContext";
import useAuth from "../../../hooks/useAuth";

const API_URL = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group`;

const demoGroups = [];

const LedgerForm = () => {
  const { companyId } = useCompany();
  const { user, role: userRole } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

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
        pan: finalValue && !panRegex.test(finalValue) ? "Invalid PAN format (e.g. ABCDE1234F)" : "",
      }));
    }
    if (key === "gstin") {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      setErrors((prev) => ({
        ...prev,
        gstin: finalValue && !gstinRegex.test(finalValue) ? "Invalid GSTIN format (e.g. 27AAAAA0000A1Z5)" : "",
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

        if (res.data && res.data.length > 0) {
          setGroups(res.data);

        } else {
          throw new Error("No backend data");
        }
      } catch (err) {


        const stored = JSON.parse(localStorage.getItem("tallyGroups"));

        if (stored && stored.length > 0) {
          setGroups(stored);
        } else {

          setGroups(demoGroups);
        }
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
        const res = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/${id}`);
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
          under: JSON.stringify({ id: actualGroupId, name: actualUnderGroupName }),
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
      setLedger(prev => ({
        ...prev,
        name: name,
        mailingName: name
      }));
    }
  }, [id]);



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

        await axios.put(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/update/${companyId}/${id}`, payload);
        Swal.fire("Success!", "Ledger updated successfully!", "success");
        navigate("/accounting/client/listOfLedgers");
      } else {


        await axios.post(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/create`, payload);
        Swal.fire("Success!", "Ledger created successfully!", "success");

        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        if (redirect) {
          navigate(redirect);
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
    <div className="min-h-screen bg-[#f5f7fa] p-4 font-[monospace]">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg border border-gray-300 p-6">
        <h2 className="text-center text-lg font-bold text-blue-800 mb-4">
          {id ? "Ledger Alteration" : "Ledger Creation"}
        </h2>


        <div className="grid grid-cols-2 gap-6 border-b pb-4">
          <div>
            <label className="block text-sm mb-1">Name :</label>
            <input
              type="text"
              value={ledger.name}
              onChange={(e) => handleLedgerChange("name", e.target.value)}
              className="border px-2 py-1 w-full"
            />

            <label className="block text-sm mt-2">(alias) :</label>
            <input
              type="text"
              value={ledger.alias}
              onChange={(e) => handleLedgerChange("alias", e.target.value)}
              className="border px-2 py-1 w-full"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Opening Balance :</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={ledger.openingBalance}
                onChange={(e) =>
                  handleLedgerChange("openingBalance", e.target.value)
                }
                className="border px-2 py-1 flex-1"
                placeholder="0.00"
              />
              <select
                value={ledger.type}
                onChange={(e) => handleLedgerChange("type", e.target.value)}
                className="border px-2 py-1 w-24 bg-white"
              >
                <option value="Debit">Dr</option>
                <option value="Credit">Cr</option>
              </select>
            </div>
          </div>
        </div>


        <div className="mt-3 border-b pb-4">
          <label className="block text-sm mb-1">Under :</label>

          {loading ? (
            <p className="text-gray-500 text-sm">Loading groups...</p>
          ) : (
            <select
              value={ledger.under}
              onChange={(e) => handleLedgerChange("under", e.target.value)}
              className="border px-2 py-1 w-1/2"
            >
              <option value="">Select</option>

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


        <div className="grid grid-cols-2 mt-4 gap-6 border-b pb-4">
          <div>
            <h3 className="font-semibold text-blue-700 mb-2">Mailing Details</h3>

            <label className="block text-sm mb-1">Mailing Name :</label>
            <input
              type="text"
              value={ledger.mailingName}
              onChange={(e) =>
                handleLedgerChange("mailingName", e.target.value)
              }
              className="border px-2 py-1 w-full"
            />

            <label className="block text-sm mb-1 mt-2">Address :</label>
            <textarea
              value={ledger.address}
              onChange={(e) => handleLedgerChange("address", e.target.value)}
              className="border px-2 py-1 w-full h-16"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">State :</label>
            <select
              value={ledger.state}
              onChange={(e) => handleLedgerChange("state", e.target.value)}
              className="border px-2 py-1 w-full"
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

            <label className="block text-sm mb-1 mt-2">Country :</label>
            <input
              type="text"
              value={ledger.country}
              onChange={(e) => handleLedgerChange("country", e.target.value)}
              className="border px-2 py-1 w-full"
            />

            <label className="block text-sm mb-1 mt-2">Pincode :</label>
            <input
              type="text"
              value={ledger.pincode}
              onChange={(e) => handleLedgerChange("pincode", e.target.value)}
              className="border px-2 py-1 w-full"
            />
          </div>
        </div>


        <div className="mt-4 border-b pb-4">
          <h3 className="font-semibold text-blue-700 mb-2">
            Beneficiary Details
          </h3>

          <div className="flex items-center gap-2">
            <label>Provide Beneficiary details :</label>
            <select
              value={ledger.provideBankDetails}
              onChange={(e) => {
                handleLedgerChange("provideBankDetails", e.target.value);
                if (e.target.value === "Yes") setShowBankPopup(true);
              }}
              className="border px-2 py-1"
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>
        </div>


        <div className="mt-4">
          <h3 className="font-semibold text-blue-700 mb-2">
            Tax Registration Details
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>PAN/IT No. :</label>
              <input
                type="text"
                value={ledger.pan}
                onChange={(e) => handleLedgerChange("pan", e.target.value)}
                placeholder="eg:ABCDE1234F"
                maxLength={10}
                className={`border px-2 py-1 w-full ${errors.pan ? "border-red-500" : ""}`}
              />
              {errors.pan && <p className="text-red-500 text-[12px] mt-1">{errors.pan}</p>}
            </div>

            <div>
              <label>Registration Type :</label>
              <select
                value={ledger.registrationType}
                onChange={(e) =>
                  handleLedgerChange("registrationType", e.target.value)
                }
                className="border px-2 py-1 w-full"
              >
                <option>Regular</option>
                <option>Composition</option>
                <option>Unregistered</option>
              </select>
            </div>

            <div>
              <label>GSTIN/UIN :</label>
              <input
                type="text"
                value={ledger.gstin}
                onChange={(e) => handleLedgerChange("gstin", e.target.value)}
                placeholder="eg:27AAAAA0000A1Z5"
                maxLength={15}
                className={`border px-2 py-1 w-full ${errors.gstin ? "border-red-500" : ""}`}
              />
              {errors.gstin && <p className="text-red-500 text-[10px] mt-1">{errors.gstin}</p>}
            </div>

            <div>
              <label>Alter additional GST details :</label>
              <select
                value={ledger.alterGst}
                onChange={(e) => handleLedgerChange("alterGst", e.target.value)}
                className="border px-2 py-1 w-full bg-yellow-100"
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
          </div>
        </div>


        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 flex items-center gap-2"
          >
            <Save size={16} /> Save
          </button>

          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
          >
            <RotateCcw size={16} /> Reset
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
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 flex items-center gap-2"
          >
            <X size={16} /> Cancel
          </button>
        </div>
      </div>


      {showBankPopup && (
        <div className="fixed inset-0 backdrop-blur bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-xl w-100 p-6 border border-gray-300">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">
              Bank Details
            </h3>

            <label>Bank Name :</label>
            <input
              type="text"
              value={bankDetails.bankName}
              onChange={(e) => handleBankChange("bankName", e.target.value)}
              className="border w-full px-2 py-1 mb-2"
            />

            <label>Account Number :</label>
            <input
              type="text"
              value={bankDetails.accountNumber}
              onChange={(e) =>
                handleBankChange("accountNumber", e.target.value)
              }
              className="border w-full px-2 py-1 mb-2"
            />

            <label>IFSC Code :</label>
            <input
              type="text"
              value={bankDetails.ifsc}
              onChange={(e) => handleBankChange("ifsc", e.target.value)}
              className="border w-full px-2 py-1 mb-2"
            />

            <label>Branch :</label>
            <input
              type="text"
              value={bankDetails.branch}
              onChange={(e) => handleBankChange("branch", e.target.value)}
              className="border w-full px-2 py-1 mb-6"
            />

            <div className="flex justify-end gap-3">
              <button
                className="bg-green-600 text-white px-4 py-1 rounded"
                onClick={() => setShowBankPopup(false)}
              >
                Save
              </button>

              <button
                className="bg-gray-500 text-white px-4 py-1 rounded"
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
