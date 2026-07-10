import axios from "axios";
import React, { useState, useEffect } from "react";
import { useCompany } from "../context/CompanyContext";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

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

  const { companyId } = useCompany();

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
            `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group/all/${companyId}`,
          );
          setGroups(res.data || []);
        } catch (err) {
          console.error("Error fetching groups:", err);
        }
      };

      fetchGroups();
    }
  }, [companyId]);

  const [stockId, setStockId] = useState(null);

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
            `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/stock/getStockById/${companyId}/${id}`,
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
        const { data } = await axios.put(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/stock/updateStock/${companyId}/${stockId}`,
          payload,
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
        const { data } = await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/stock/createStock/${companyId}`,
          payload,
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
    <div className="w-full  bg-[#f6f3e9] p-4 font-mono text-sm overflow-auto">
      <h1 className="text-center font-bold text-lg mb-4">
        {stockId ? "Edit: Stock Item" : "Create: Stock Item"}
      </h1>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-9 pl-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <label className="w-48">Name:</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="border px-2 py-1 w-80"
                type="text"
              />
            </div>

            <div className="flex items-center">
              <label className="w-48">Alias:</label>
              <input
                name="alias"
                value={form.alias}
                onChange={handleChange}
                className="border px-2 py-1 w-80"
                type="text"
              />
            </div>

            <div className="flex items-center">
              <label className="w-48">Under:</label>
              <select
                name="under"
                value={form.under}
                onChange={handleChange}
                className="border px-2 py-1 w-80"
              >
                <option value="">Select Group</option>

                {groups.map((g) => (
                  <option key={g.id} value={g.groupName}>
                    {g.groupName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-start">
              <label className="w-48 pt-2">Units:</label>

              <div className="flex flex-col gap-2 w-80">
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
                  className="border px-2 py-1 w-full"
                >
                  <option value="">Select Unit</option>

                  <option value="Nos">Nos</option>
                  <option value="Piece">Piece</option>
                  <option value="Pair">Pair</option>
                  <option value="Set">Set</option>
                  <option value="Dozen">Dozen</option>

                  <option value="Kg">Kg</option>
                  <option value="Gram">Gram</option>
                  <option value="Quintal">Quintal</option>
                  <option value="Ton">Ton</option>

                  <option value="Litre">Litre</option>
                  <option value="ML">ML</option>

                  <option value="Meter">Meter</option>
                  <option value="Feet">Feet</option>
                  <option value="Inch">Inch</option>
                  <option value="CM">CM</option>

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

                  <option value="Other">Other (Add Manually)</option>
                </select>

                {form.units === "Other" && (
                  <input
                    type="text"
                    placeholder="Enter custom unit"
                    value={form.customUnit || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        customUnit: e.target.value,
                      })
                    }
                    className="border px-2 py-1 w-full"
                  />
                )}

                <p className="text-[11px] text-gray-500">
                  Select predefined unit or add your own custom unit.
                </p>
              </div>
            </div>
          </div>

          <hr className="my-4 border-black" />

          <div className="space-y-2">
            <div className="flex items-center">
              <label className="w-48">Maintain in Batches:</label>
              <input
                type="checkbox"
                name="maintainInBatches"
                checked={form.maintainInBatches}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center">
              <label className="w-48">Track Date of Mfg:</label>
              <input
                type="checkbox"
                name="trackDateOfManufacture"
                checked={form.trackDateOfManufacture}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center">
              <label className="w-48">Expiry Date of Batches:</label>
              <input
                type="checkbox"
                name="expiryDateOfBatches"
                checked={form.expiryDateOfBatches}
                onChange={handleChange}
              />
            </div>
          </div>

          <hr className="my-4 border-black" />

          <div className="space-y-3">
            <p className="font-semibold">GST Details</p>

            <div className="flex items-center">
              <label className="w-48">GST Applicable:</label>
              <select
                name="gstApplicable"
                value={form.gstApplicable}
                onChange={handleChange}
                className="border px-2 py-1 w-80"
              >
                <option value="">Select</option>
                <option value="Applicable">Applicable</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="w-48">HSN Code:</label>
              <input
                name="hsn"
                value={form.hsn}
                onChange={handleChange}
                className="border px-2 py-1 w-80"
                type="text"
              />
            </div>
          </div>

          <hr className="my-4 border-black" />

          <div>
            <p className="font-semibold mb-2">Opening Balance</p>

            <div className="grid grid-cols-3 gap-4 w-150">
              <div>
                <label>Qty:</label>
                <input
                  name="openingBalanceQty"
                  value={form.openingBalanceQty}
                  onChange={handleChange}
                  className="border w-full px-2 py-1"
                  type="text"
                />
              </div>

              <div>
                <label>Rate:</label>
                <input
                  name="openingBalanceRate"
                  value={form.openingBalanceRate}
                  onChange={handleChange}
                  className="border w-full px-2 py-1"
                  type="text"
                />
              </div>

              <div>
                <label>Value:</label>
                <input
                  name="openingBalanceValue"
                  value={form.openingBalanceValue}
                  onChange={handleChange}
                  className="border w-full px-2 py-1"
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 space-x-6 font-semibold">
        <button
          onClick={handleAccept}
          className="bg-green-600 text-white px-6 py-2"
        >
          Yes
        </button>
        <button
          onClick={handleReject}
          className="bg-red-600 text-white px-6 py-2"
        >
          No
        </button>
      </div>
    </div>
  );
};

export default StockItemCreation;
