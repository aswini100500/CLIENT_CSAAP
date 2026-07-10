









































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































import React, { useState, useEffect, useRef } from "react";
import { Trash2, Plus, Search, UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import BulkImportButton from "./BulkImportButton";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";


const SearchableLedgerSelect = ({ ledgers, value, onSelect, onCreateNew }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedLedger = ledgers.find((l) => String(l.id) === String(value));

  useEffect(() => {
    if (selectedLedger) {
      setSearchTerm(selectedLedger.name);
    }
  }, [selectedLedger]);

  const filtered = ledgers.filter((l) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (selectedLedger) setSearchTerm(selectedLedger.name);
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
          className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition pr-8"
          placeholder="Search or add ledger..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={14} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-100 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((l) => (
              <div
                key={l.id}
                className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer text-slate-700 border-b border-slate-50 last:border-b-0"
                onClick={() => {
                  onSelect(l.id);
                  setSearchTerm(l.name);
                  setIsOpen(false);
                }}
              >
                {l.name}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-500 italic">No matches found</div>
          )}

          <div
            className="px-3 py-2 text-sm bg-slate-50 hover:bg-blue-100 cursor-pointer text-blue-600 font-medium flex items-center gap-2 border-t border-slate-200"
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

const PaymentVoucher = () => {
  const { user } = useAuth();
  const { companyId } = useCompany();
  const { id } = useParams();
  const navigate = useNavigate();

  const [ledgers, setLedgers] = useState([]);
  const [bankCashLedgers, setBankCashLedgers] = useState([]);
  const [voucherNo, setVoucherNo] = useState("1");
  const [date, setDate] = useState("");
  const [accountType, setAccountType] = useState("");
  const [narration, setNarration] = useState("");
  const [savedVouchers, setSavedVouchers] = useState([]);
  const [entries, setEntries] = useState([
    { ledger: "", amount: "", openingBalance: 0, closingBalance: 0, remainingBalance: 0, balanceType: "Debit" },
  ]);
  const [groups, setGroups] = useState([]);

  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`
        );
        const allLedgers = res.data || [];
        setLedgers(allLedgers);

        const bankRes = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/all`
        );
        const banks = bankRes.data.accounts || [];

        const bankOptions = banks.map((b) => ({
          id: `bank_${b.id}`,
          name: b.bankName ? `${b.accountName} (${b.bankName})` : b.accountName,
          type: "bank",
          originalId: b.id,
        }));

        const cashLedger = allLedgers.find(
          (l) =>
            l.name.toLowerCase().includes("cash") ||
            l.underGroup === "Cash-in-Hand" ||
            l.under === "Cash-in-Hand"
        );

        bankOptions.push(
          cashLedger
            ? { id: `ledger_${cashLedger.id}`, name: cashLedger.name, type: "cash", originalId: cashLedger.id }
            : { id: "cash", name: "Cash", type: "cash", originalId: "cash" }
        );

        setBankCashLedgers(bankOptions);

        const groupRes = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group/all/${companyId}`);
        setGroups(groupRes.data || []);


        const savedState = sessionStorage.getItem("paymentVoucherState");
        if (savedState) {
          const state = JSON.parse(savedState);
          setVoucherNo(state.voucherNo);
          setDate(state.date);
          setAccountType(state.accountType);
          setNarration(state.narration);
          setEntries(state.entries);
          sessionStorage.removeItem("paymentVoucherState");
          Swal.fire({
            title: "Welcome back!",
            text: "Your voucher progress has been restored.",
            icon: "info",
            timer: 2000,
            showConfirmButton: false
          });
        }


        if (id) {
          setIsEditMode(true);
          const voucherRes = await axios.get(
            `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/payment-voucher/get/${id}`
          );
          const v = voucherRes.data;
          if (v && v.voucherNo) {
            setVoucherNo(v.voucherNo);
            setDate(v.date ? new Date(v.date).toISOString().split('T')[0] : "");


            let rawAccType = v.accountType;
            if (rawAccType && !rawAccType.toString().startsWith("bank_") && !rawAccType.toString().startsWith("ledger_")) {

              const isBank = banks.some(b => String(b.id) === String(rawAccType));
              if (isBank) {
                rawAccType = `bank_${rawAccType}`;
              } else {
                rawAccType = `ledger_${rawAccType}`;
              }
            }
            setAccountType(rawAccType);

            setNarration(v.narration || "");
            const entriesList = v.entries || v.items || [];
            if (entriesList.length > 0) {
              setEntries(entriesList.map(item => {
                const ledgerObj = allLedgers.find(l => String(l.id) === String(item.ledgerId));
                const opening = parseFloat(ledgerObj?.openingBalance) || 0;
                const debit = parseFloat(ledgerObj?.debit) || 0;
                const credit = parseFloat(ledgerObj?.credit) || 0;
                const type = ledgerObj?.balanceType || ledgerObj?.type || "Debit";

                let closing = 0;
                if (type === "Debit") {
                  closing = opening + debit - credit;
                } else {
                  closing = opening - debit + credit;
                }

                const amt = parseFloat(item.amount) || 0;
                let rem = 0;
                if (type === "Debit") {
                  rem = closing + amt;
                } else {
                  rem = closing - amt;
                }
                return {
                  ledger: item.ledgerId,
                  amount: item.amount,
                  openingBalance: opening,
                  closingBalance: closing,
                  remainingBalance: rem,
                  balanceType: type
                };
              }));
            }
          }
        } else if (companyId) {
          try {
            const nextRes = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher-util/next/${companyId}/payment`);
            if (nextRes.data && nextRes.data.nextNumber) {
              setVoucherNo(nextRes.data.nextNumber);
            }
          } catch (e) { console.error(e); }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    if (companyId) fetchData();
  }, [companyId, id]);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/payment-voucher/all/${companyId}`
        );
        setSavedVouchers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVouchers();
  }, [companyId]);

  const formatBalance = (val, originalType) => {
    if (val === 0) return "0.00";
    if (val > 0) {
      return `${val.toFixed(2)} ${originalType === "Debit" ? "Dr" : "Cr"}`;
    } else {
      const absoluteVal = Math.abs(val);
      const flippedType = originalType === "Debit" ? "Cr" : "Dr";
      return `${absoluteVal.toFixed(2)} ${flippedType}`;
    }
  };

  const addRow = () => {
    setEntries([
      ...entries,
      { ledger: "", amount: "", openingBalance: 0, closingBalance: 0, remainingBalance: 0, balanceType: "Debit" },
    ]);
  };

  const removeRow = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const onLedgerSelect = (index, ledgerId) => {
    const ledger = ledgers.find((l) => l.id == ledgerId);
    const opening = parseFloat(ledger?.openingBalance) || 0;
    const debit = parseFloat(ledger?.debit) || 0;
    const credit = parseFloat(ledger?.credit) || 0;
    const type = ledger?.balanceType || ledger?.type || "Debit";

    let closing = 0;
    if (type === "Debit") {
      closing = opening + debit - credit;
    } else {
      closing = opening - debit + credit;
    }

    const updated = [...entries];
    updated[index].ledger = ledgerId;
    updated[index].openingBalance = opening;
    updated[index].closingBalance = closing;
    updated[index].balanceType = type;

    const amt = parseFloat(updated[index].amount) || 0;
    if (type === "Debit") {
      updated[index].remainingBalance = closing + amt;
    } else {
      updated[index].remainingBalance = closing - amt;
    }
    setEntries(updated);
  };


  const handleQuickCreateLedger = async (index, initialName) => {

    const stateToSave = {
      voucherNo,
      date,
      accountType,
      narration,
      entries,
      editingIndex: index
    };
    sessionStorage.setItem("paymentVoucherState", JSON.stringify(stateToSave));

    const userStr = sessionStorage.getItem("user");
    let role = "admin";
    if (userStr) {
      const userObj = JSON.parse(userStr);
      role = userObj.role || "admin";
    }
    const basePath = role === "employee" ? "/employee/hr/accounting/client" : "/accounting/client";


    const redirectPath = id ? `${basePath}/paymentvoucher/${id}` : `${basePath}/paymentvoucher`;
    navigate(`${basePath}/ledger?redirect=${redirectPath}&name=${encodeURIComponent(initialName)}`);
  };

  const updateAmount = (index, value) => {
    const updated = [...entries];
    const amt = parseFloat(value) || 0;
    updated[index].amount = value;

    const closing = parseFloat(updated[index].closingBalance) || 0;
    const type = updated[index].balanceType || "Debit";

    if (type === "Debit") {
      updated[index].remainingBalance = closing + amt;
    } else {
      updated[index].remainingBalance = closing - amt;
    }
    setEntries(updated);
  };

  const totalAmount = entries.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  const resetForm = () => {
    setVoucherNo(String(Number(voucherNo) + 1));
    setDate("");
    setAccountType("");
    setEntries([{ ledger: "", amount: "", openingBalance: 0, closingBalance: 0, remainingBalance: 0, balanceType: "Debit" }]);
    setNarration("");
  };

  const handleBulkImport = async (data) => {

    try {

      if (!data || data.length === 0) {

        Swal.fire(
          "Error",
          "No data found in file",
          "error"
        );

        return;
      }

      const firstRow = data[0];



      const ledgerRes =
        await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`
        );

      let latestLedgers =
        ledgerRes.data || [];



      const bankRes =
        await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/all`
        );

      const latestBanks =
        bankRes.data.accounts || [];



      const latestBankCash =
        latestBanks.map((b) => ({

          id:
            `bank_${b.id}`,

          name:
            b.bankName
              ? `${b.accountName} (${b.bankName})`
              : b.accountName,

          type: "bank",
        }));

      const cashLedger =
        latestLedgers.find(
          (l) =>
            l.name
              ?.toLowerCase()
              .includes("cash") ||

            l.underGroup ===
            "Cash-in-Hand" ||

            l.under ===
            "Cash-in-Hand"
        );

      if (cashLedger) {

        latestBankCash.push({

          id:
            `ledger_${cashLedger.id}`,

          name:
            cashLedger.name,

          type: "cash",
        });

      } else {

        latestBankCash.push({

          id: "cash",
          name: "Cash",
          type: "cash",
        });
      }



      const rawPaymentMode =
        String(
          firstRow["Payment Mode"] ||
          firstRow["accountType"] ||
          ""
        )
          .trim()
          .toLowerCase();

      let selectedAccount = "";

      if (rawPaymentMode === "cash") {

        selectedAccount =
          cashLedger
            ? `ledger_${cashLedger.id}`
            : "cash";

      } else {

        let matchedBank =
          latestBankCash.find(
            (b) =>
              b.name
                ?.toLowerCase()
                ?.trim() ===
              rawPaymentMode
          );



        if (!matchedBank && rawPaymentMode) {

          try {

            const createBank =
              await axios.post(
                `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/create`,
                {

                  accountName:
                    rawPaymentMode,

                  bankName:
                    rawPaymentMode,

                  currentBalance: 0,
                }
              );

            matchedBank = {

              id:
                `bank_${createBank.data.id}`,

              name:
                rawPaymentMode,

              type: "bank",
            };

            latestBankCash.push(
              matchedBank
            );

          } catch (err) {

            console.log(
              "Bank create failed",
              err
            );
          }
        }

        selectedAccount =
          matchedBank?.id || "";
      }



      const importedEntries = [];

      for (const row of data) {

        const ledgerName =
          String(
            row["Paid To"] ||
            row["ledgerId"] ||
            ""
          )
            .trim();

        let matchedLedger =
          latestLedgers.find(
            (l) =>
              l.name
                ?.toLowerCase()
                ?.trim() ===
              ledgerName
                ?.toLowerCase()
                ?.trim()
          );



        if (!matchedLedger && ledgerName) {

          try {



            const creditorGroup =
              groups.find(
                (g) =>
                  g.groupName ===
                  "Sundry Creditors"
              );



            const createRes =
              await axios.post(
                `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/create`,
                {

                  name:
                    ledgerName,

                  under:
                    JSON.stringify({

                      id:
                        creditorGroup?.id,

                      name:
                        "Sundry Creditors",
                    }),

                  openingBalance: 0,

                  mailingName:
                    ledgerName,

                  address: "",

                  city: "",

                  state:
                    "Odisha",

                  country:
                    "India",

                  pincode: "",

                  pan: "",

                  gstin: "",

                  registrationType:
                    "Regular",

                  companyId,
                }
              );



            matchedLedger = {

              id:
                createRes.data.id,

              name:
                ledgerName,

              openingBalance: 0,

              closingBalance: 0,

              balanceType:
                "Debit",
            };



            latestLedgers.push(
              matchedLedger
            );

          } catch (err) {

            console.log(
              "Ledger auto create failed",
              err
            );
          }
        }


        const opening = parseFloat(matchedLedger?.openingBalance) || 0;
        const debit = parseFloat(matchedLedger?.debit) || 0;
        const credit = parseFloat(matchedLedger?.credit) || 0;
        const type = matchedLedger?.balanceType || "Debit";

        let closing = 0;
        if (type === "Debit") {
          closing = opening + debit - credit;
        } else {
          closing = opening - debit + credit;
        }



        importedEntries.push({

          ledger:
            matchedLedger
              ? matchedLedger.id
              : "",

          amount:
            row["Amount"] ||
            row["amount"] ||
            "",

          openingBalance:
            opening,

          closingBalance:
            closing,

          remainingBalance:
            closing,

          balanceType:
            type,
        });
      }



      setLedgers(
        latestLedgers
      );

      setBankCashLedgers(
        latestBankCash
      );

      setVoucherNo(
        firstRow["Voucher No"] ||
        firstRow["voucherNo"] ||
        ""
      );

      setDate(
        firstRow["Date"]
          ? new Date(
            firstRow["Date"]
          )
            .toISOString()
            .split("T")[0]
          : new Date()
            .toISOString()
            .split("T")[0]
      );

      setNarration(
        firstRow[
        "Voucher Narration"
        ] ||
        firstRow["narration"] ||
        ""
      );

      setAccountType(
        selectedAccount
      );

      setEntries(
        importedEntries
      );

      Swal.fire({

        icon: "success",

        title:
          "Import Successful",

        text:
          "Imported data loaded successfully. Review and click Save Voucher.",
      });

    } catch (err) {

      console.log(err);

      Swal.fire(
        "Error",
        "Import failed",
        "error"
      );
    }
  };

  const saveVoucher = async () => {
    if (!date) return Swal.fire("Error", "Please select a date", "error");
    if (!accountType) return Swal.fire("Error", "Please select Account Type", "error");
    if (entries.some((e) => !e.ledger)) return Swal.fire("Error", "Select all debit ledgers", "error");

    const formattedItems = entries.map((e) => ({
      ledgerId: Number(e.ledger),
      amount: parseFloat(e.amount) || 0,
    }));

    const employeeId = user?.employee_id || null;
    const role = user?.role || "admin";

    const payload = { voucherNo, date, accountType, narration, totalAmount, companyId, items: formattedItems, ...(employeeId && { employee_id: employeeId }), role };

    try {
      if (isEditMode) {
        await axios.put(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/payment-voucher/update/${id}`,
          payload
        );
        Swal.fire("Success", "Voucher updated successfully", "success");
        if (role === "employee") {
          navigate("/employee/hr/accounting/client/listOfPaymentVoucher");
        } else {
          navigate("/accounting/client/listOfPaymentVoucher");
        }
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/payment-voucher/create/${companyId}`,
          payload
        );

        Swal.fire({
          title: "Saved",
          text: "Voucher saved successfully",
          icon: "success",
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
                link.download = res.data.pdf_path.split("/").pop() || "PaymentVoucher.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
              })
              .catch((err) => console.error("Error downloading PDF:", err));
          }
          if (role === "employee") {
            navigate("/employee/hr/accounting/client/listOfPaymentVoucher");
          } else {
            navigate("/accounting/client/listOfPaymentVoucher");
          }
        });
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 409) {
        Swal.fire("Warning", "Voucher Number Already Exists!", "warning");
      } else {
        Swal.fire("Error", `Failed to ${isEditMode ? 'update' : 'save'} voucher`, "error");
      }
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition bg-white";

  const tableInputClass =
    "w-full rounded border border-transparent px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition bg-transparent";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 mx-auto">


      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-slate-800">Payment Voucher</h1>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
            PV
          </span>
        </div>
        <BulkImportButton onImport={handleBulkImport} />
      </div>


      <div className="flex flex-col gap-1 mb-5">
        <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
          Account Type (Bank / Cash)
        </label>
        <select
          className={inputClass}
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
        >
          <option value="">Select Bank / Cash Account</option>
          {bankCashLedgers.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>


      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
            Voucher Number
          </label>
          <input
            type="text"
            className={inputClass}
            value={voucherNo}
            onChange={(e) => setVoucherNo(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
            Date
          </label>
          <input
            type="date"
            className={inputClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>


      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
        Transaction Details
      </p>


      <div className="rounded-lg border border-slate-200 overflow-visible mb-3">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 font-medium text-left">Particulars</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 font-medium text-right">Opening</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 font-medium text-right">Closing</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 font-medium text-right">Amount (₹)</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 font-medium text-right">Remaining</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 font-medium text-center w-10"></th>
            </tr>
          </thead>

          <tbody>
            {entries.map((row, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors relative hover:z-50"
              >

                <td className="px-2 py-1">
                  <SearchableLedgerSelect
                    ledgers={ledgers}
                    value={row.ledger}
                    onSelect={(val) => onLedgerSelect(index, val)}
                    onCreateNew={(name) => handleQuickCreateLedger(index, name)}
                  />
                </td>


                <td className="px-3 py-2 text-right text-slate-500 text-sm">
                  {row.ledger ? formatBalance(row.openingBalance, row.balanceType) : "0.00"}
                </td>


                <td className="px-3 py-2 text-right text-slate-500 text-sm">
                  {row.ledger ? formatBalance(row.closingBalance, row.balanceType) : "0.00"}
                </td>


                <td className="px-2 py-1">
                  <input
                    type="number"
                    placeholder="0.00"
                    className={`${tableInputClass} text-right`}
                    value={row.amount}
                    onChange={(e) => updateAmount(index, e.target.value)}
                  />
                </td>


                <td className="px-3 py-2 text-right text-slate-800 font-medium text-sm">
                  {row.ledger ? formatBalance(row.remainingBalance, row.balanceType) : "0.00"}
                </td>


                <td className="px-2 py-1 text-center">
                  {index > 0 && (
                    <button
                      onClick={() => removeRow(index)}
                      className="text-slate-300 hover:text-red-400 hover:bg-red-50 rounded p-1 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>


          <tfoot>
            <tr className="bg-slate-50 border-t border-slate-200">
              <td className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Total
              </td>
              <td />
              <td />
              <td className="px-3 py-2 text-right text-sm font-semibold text-slate-800">
                ₹ {totalAmount.toFixed(2)}
              </td>
              <td />
              <td />
            </tr>
          </tfoot>
        </table>
      </div>


      <button
        onClick={addRow}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors mb-5"
      >
        <Plus size={13} /> Add Row
      </button>


      <div className="flex justify-end mb-5">
        <div className="bg-slate-50 rounded-lg px-5 py-3 flex flex-col items-end gap-1 min-w-48">
          <div className="flex justify-between w-full text-sm font-semibold text-slate-800 gap-8">
            <span>Grand Total</span>
            <span>₹ {totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>


      <div className="flex flex-col gap-1 mb-5">
        <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
          Narration
        </label>
        <textarea
          rows="2"
          placeholder="Enter narration (optional)..."
          className={`${inputClass} resize-none`}
          value={narration}
          onChange={(e) => setNarration(e.target.value)}
        />
      </div>


      <div className="flex justify-end gap-2">
        <button
          onClick={resetForm}
          className="px-4 py-2 rounded-lg text-sm text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={saveVoucher}
          className="px-5 py-2 rounded-lg text-sm text-white font-medium bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          {isEditMode ? "Update Voucher" : "Save Voucher"}
        </button>
      </div>
    </div>
  );
};

export default PaymentVoucher;
