import React from "react";
import axios from "axios";
import {
  ArrowLeft,
  FileText,
  Layers,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";
import BulkImportButton from "./BulkImportButton";

const API = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1`;

const ContraVoucher = () => {
  const { user, role: userRole, companyId } = useAuth();

  const { id } = useParams();
  const navigate = useNavigate();

  const [isEditMode, setIsEditMode] = useState(false);
  const [voucher, setVoucher] = useState({
    date: new Date().toISOString().split("T")[0],
    voucherNo: "",
    narration: "",
    transactions: [{ fromAccount: "", toAccount: "", amount: "" }],
  });

  const [gst, setGst] = useState({ applied: false, percentage: 0, amount: 0 });

  const [accounts, setAccounts] = useState([]);

  const fetchAccounts = async () => {
    try {
      const bankRes = await axios.get(`${API}/bank/${companyId}/all`);
      const banks = bankRes.data.accounts || [];
      const contraOptions = banks.map((b) => ({
        id: `bank_${b.id}`,
        name: b.bankName ? `${b.accountName} (${b.bankName})` : b.accountName,
      }));

      const ledgerRes = await axios.get(`${API}/ledger/${companyId}/all`);
      const allLedgers = Array.isArray(ledgerRes.data) ? ledgerRes.data : ledgerRes.data?.data || [];
      const cashLedger = allLedgers.find(
        (l) =>
          l.name?.toLowerCase().includes("cash") ||
          l.underGroup === "Cash-in-Hand" ||
          l.under === "Cash-in-Hand",
      );

      if (cashLedger) {
        contraOptions.push({
          id: `ledger_${cashLedger.id}`,
          name: cashLedger.name,
        });
      } else {
        contraOptions.push({ id: "cash", name: "Cash" });
      }

      setAccounts(contraOptions);
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };

  const fetchVoucher = async () => {
    if (!id) return;
    try {
      setIsEditMode(true);
      const res = await axios.get(`${API}/contra-voucher/voucher/${id}`);
      const data = res.data;
      const vData = data.voucher || {};
      setVoucher({
        date: vData.date
          ? new Date(vData.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        voucherNo: vData.voucherNo || "",
        narration: vData.narration || "",
        transactions: data.transactions?.length
          ? data.transactions
          : [{ fromAccount: "", toAccount: "", amount: "" }],
      });
    } catch (err) {
      console.error("Error fetching voucher:", err);
      Swal.fire("Error", "Could not fetch voucher details", "error");
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchAccounts();
    }
  }, [companyId]);

  useEffect(() => {
    if (id && companyId) {
      fetchVoucher();
    } else if (companyId) {
      axios
        .get(`${API}/voucher-util/next/${companyId}/contra`)
        .then((res) =>
          setVoucher((prev) => ({ ...prev, voucherNo: res.data.nextNumber })),
        )
        .catch(console.error);
    }
  }, [id, companyId]);

  const handleTransactionChange = (index, field, value) => {
    const updated = [...voucher.transactions];
    updated[index][field] = value;

    if (field === "amount" && gst.applied) {
      const totalAmount = updated.reduce(
        (sum, t) => sum + (parseFloat(t.amount) || 0),
        0,
      );
      const gstAmount = (totalAmount * gst.percentage) / 100;
      setGst({ ...gst, amount: gstAmount });
    }

    setVoucher({ ...voucher, transactions: updated });
  };

  const addTransaction = () => {
    setVoucher({
      ...voucher,
      transactions: [
        ...voucher.transactions,
        { fromAccount: "", toAccount: "", amount: "" },
      ],
    });
  };

  const totalAmount = voucher.transactions.reduce(
    (sum, t) => sum + (parseFloat(t.amount) || 0),
    0,
  );
  const grandTotal = totalAmount + (gst.applied ? gst.amount : 0);

  const saveVoucher = async () => {
    if (
      voucher.transactions.some(
        (t) => !t.fromAccount || !t.toAccount || !t.amount,
      )
    ) {
      Swal.fire({
        icon: "error",
        title: "Incomplete Details",
        text: "Please fill all fields in each transaction.",
      });
      return;
    }

    const employeeId = user?.employee_id || null;
    const roleName = userRole || "admin";

    const payload = {
      ...voucher,
      companyId,
      totalAmount,
      gstAmount: gst.amount,
      grandTotal,
      ...(employeeId && { employee_id: employeeId }),
      role: roleName,
    };

    const listPath =
      roleName === "employee"
        ? "/employee/hr/accounting/client/listOfContraVoucher"
        : "/accounting/client/listOfContraVoucher";

    try {
      if (isEditMode) {
        await axios.put(`${API}/contra-voucher/update/${id}`, payload);

        Swal.fire({
          icon: "success",
          title: "Contra Voucher Updated Successfully",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate(listPath);
        return;
      }

      const res = await axios.post(
        `${API}/contra-voucher/${companyId}/create`,
        payload,
      );

      const result = await Swal.fire({
        icon: "success",
        title: "Contra Voucher Created Successfully",
        text: "The contra voucher has been saved. What would you like to do next?",
        showCancelButton: true,
        showDenyButton: !!res.data?.pdf_path,
        confirmButtonColor: "#00a651",
        cancelButtonColor: "#6b7280",
        denyButtonColor: "#2563eb",
        confirmButtonText: "Create Another",
        cancelButtonText: "Go to Contra Voucher List",
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
              res.data.pdf_path.split("/").pop() || "ContraVoucher.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          })
          .catch((err) => console.error("Error downloading PDF:", err));

        const followUp = await Swal.fire({
          icon: "info",
          title: "What's Next?",
          text: "Would you like to create another contra voucher or go to the list?",
          showCancelButton: true,
          confirmButtonColor: "#00a651",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Create Another",
          cancelButtonText: "Go to Contra Voucher List",
        });
        if (!followUp.isConfirmed) {
          navigate(listPath);
          return;
        }
      } else if (!result.isConfirmed) {
        navigate(listPath);
        return;
      }

      setVoucher({
        date: new Date().toISOString().split("T")[0],
        voucherNo: "",
        narration: "",
        transactions: [
          {
            fromAccount: "",
            toAccount: "",
            amount: "",
          },
        ],
      });

      setGst({
        applied: false,
        percentage: 0,
        amount: 0,
      });

      axios
        .get(`${API}/voucher-util/next/${companyId}/contra`)
        .then((nextRes) =>
          setVoucher((prev) => ({
            ...prev,
            voucherNo: nextRes.data.nextNumber,
          })),
        )
        .catch(console.error);
    } catch (err) {
      console.log("Error saving:", err);

      if (err.response && err.response.status === 409) {
        Swal.fire("Warning", "Voucher Number Already Exists!", "warning");
      } else {
        Swal.fire({
          icon: "error",
          title: "Save Failed",
          text: `Something went wrong while ${isEditMode ? "updating" : "saving"}!`,
        });
      }
    }
  };
  const handleBulkImport = async (data) => {
    try {
      if (!data || data.length === 0) {
        Swal.fire("Error", "No data found in file", "error");

        return;
      }

      const firstRow = data[0];

      const bankRes = await axios.get(`${API}/bank/${companyId}/all`);

      const latestBanks = bankRes.data.accounts || [];

      const ledgerRes = await axios.get(`${API}/ledger/${companyId}/all`);

      const allLedgers = Array.isArray(ledgerRes.data) ? ledgerRes.data : ledgerRes.data?.data || [];

      const latestAccounts = latestBanks.map((b) => ({
        id: `bank_${b.id}`,

        name: b.bankName ? `${b.accountName} (${b.bankName})` : b.accountName,
      }));

      const cashLedger = allLedgers.find(
        (l) =>
          l.name?.toLowerCase().includes("cash") ||
          l.underGroup === "Cash-in-Hand" ||
          l.under === "Cash-in-Hand",
      );

      if (cashLedger) {
        latestAccounts.push({
          id: `ledger_${cashLedger.id}`,

          name: cashLedger.name,
        });
      } else {
        latestAccounts.push({
          id: "cash",
          name: "Cash",
        });
      }

      const importedTransactions = [];

      for (const row of data) {
        const fromName = row.FromAccount?.trim()?.toLowerCase();

        const toName = row.ToAccount?.trim()?.toLowerCase();

        const createBankIfMissing = async (name) => {
          if (!name || name === "cash") return;

          const exists = latestAccounts.find(
            (a) => a.name?.toLowerCase()?.trim() === name,
          );

          if (!exists) {
            try {
              const res = await axios.post(`${API}/bank/${companyId}/create`, {
                accountName: name,
                bankName: name,
                currentBalance: 0,
              });

              latestAccounts.push({
                id: `bank_${res.data.id}`,

                name,
              });
            } catch (err) {
              console.log("Bank create failed", err);
            }
          }
        };

        await createBankIfMissing(fromName);

        await createBankIfMissing(toName);

        const fromAcc = latestAccounts.find(
          (a) => a.name?.toLowerCase()?.trim() === fromName,
        );

        const toAcc = latestAccounts.find(
          (a) => a.name?.toLowerCase()?.trim() === toName,
        );

        importedTransactions.push({
          fromAccount:
            fromName === "cash"
              ? cashLedger
                ? `ledger_${cashLedger.id}`
                : "cash"
              : fromAcc?.id || "",

          toAccount:
            toName === "cash"
              ? cashLedger
                ? `ledger_${cashLedger.id}`
                : "cash"
              : toAcc?.id || "",

          amount: parseFloat(row.Amount || 0),
        });
      }

      setAccounts(latestAccounts);

      setVoucher({
        ...voucher,

        voucherNo: firstRow.VoucherNo || "",

        date: firstRow.Date
          ? new Date(firstRow.Date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],

        narration: firstRow.Narration || "",

        transactions: importedTransactions,
      });

      const refreshedBankRes = await axios.get(`${API}/bank/${companyId}/all`);

      const banks = refreshedBankRes.data.accounts || [];

      const contraOptions = banks.map((b) => ({
        id: `bank_${b.id}`,
        name: b.bankName ? `${b.accountName} (${b.bankName})` : b.accountName,
      }));

      contraOptions.push({ id: "cash", name: "Cash" });

      setAccounts(contraOptions);

      Swal.fire({
        icon: "success",
        title: "Import Successful",
        text: "Imported data loaded successfully. Review and click Save Voucher.",
      });
    } catch (error) {
      console.log(error);

      Swal.fire("Error", "Import failed", "error");
    }
  };

  const resetForm = () => {
    setVoucher({
      date: new Date().toISOString().split("T")[0],
      voucherNo: "",
      narration: "",
      transactions: [
        {
          fromAccount: "",
          toAccount: "",
          amount: "",
        },
      ],
    });

    setGst({
      applied: false,
      percentage: 0,
      amount: 0,
    });
  };

  const inputClass =
    "app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium";

  const tableInputClass =
    "w-full border border-[#c8ddcd] bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] rounded-xl font-semibold py-2.25 px-3 text-xs outline-none transition-all";

  const role = userRole || "admin";

  return (
    <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans">
      <div className="max-w-6xl mx-auto bg-white app-panel border border-[#e2f2e9]/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex justify-between items-center border-b border-[#e2f2e9] pb-5 mb-8">
          <div className="flex items-center gap-3">
            <h2 className="app-title text-xl font-extrabold text-[#042f2e]">
              {isEditMode
                ? "Contra Voucher Alteration"
                : "Contra Voucher Creation"}
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f0fdf4] text-[#00a651] border border-[#c6f1d6]">
              CV
            </span>
          </div>

          <div className="flex items-center gap-3">
            <BulkImportButton onDataParsed={handleBulkImport} />
            <button
              type="button"
              onClick={() =>
                navigate(
                  role === "employee"
                    ? "/employee/hr/accounting/client/listOfContraVoucher"
                    : "/accounting/client/listOfContraVoucher",
                )
              }
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors text-sm font-medium cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Contra List
            </button>
          </div>
        </div>

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider mb-4 border-b border-[#cbe0d2] pb-1.5 flex items-center gap-2">
            <FileText size={16} className="text-[#00a651]" /> Basic Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Voucher Number :
              </label>
              <input
                type="text"
                className={inputClass}
                value={voucher.voucherNo}
                onChange={(e) =>
                  setVoucher({
                    ...voucher,
                    voucherNo: e.target.value,
                  })
                }
                placeholder="Enter voucher number"
              />
            </div>

            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1">
                Date :
              </label>
              <input
                type="date"
                className={inputClass}
                value={voucher.date}
                onChange={(e) =>
                  setVoucher({
                    ...voucher,
                    date: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="bg-[#f6faf7] border border-[#cbe0d2] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,166,81,0.01)] mb-6">
          <div className="flex justify-between items-center mb-4 border-b border-[#cbe0d2] pb-1.5">
            <h3 className="text-sm font-bold text-[#042f2e] uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} className="text-[#00a651]" /> Transaction
              Entries
            </h3>
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-bold text-[#00a651] bg-white border border-[#cbe0d2] px-3 py-1.5 rounded-lg hover:bg-[#f0fdf4] transition-colors cursor-pointer"
              onClick={addTransaction}
            >
              <Plus size={14} /> Add Row
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#cbe0d2] bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f0fdf4] border-b border-[#cbe0d2]">
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e]">
                    From Account (Credit)
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e]">
                    To Account (Debit)
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e] w-40">
                    Amount (₹)
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-extrabold uppercase tracking-wider text-[#042f2e] w-14">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2f2e9]">
                {voucher.transactions.map((transaction, index) => (
                  <tr
                    key={index}
                    className="hover:bg-[#f8faf8] transition-colors"
                  >
                    <td className="p-2.5">
                      <select
                        className={tableInputClass}
                        value={transaction.fromAccount}
                        onChange={(e) =>
                          handleTransactionChange(
                            index,
                            "fromAccount",
                            e.target.value,
                          )
                        }
                      >
                        <option value="">Select account</option>
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2.5">
                      <select
                        className={tableInputClass}
                        value={transaction.toAccount}
                        onChange={(e) =>
                          handleTransactionChange(
                            index,
                            "toAccount",
                            e.target.value,
                          )
                        }
                      >
                        <option value="">Select account</option>
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        className={`${tableInputClass} text-right font-semibold`}
                        placeholder="0.00"
                        value={transaction.amount}
                        onChange={(e) =>
                          handleTransactionChange(
                            index,
                            "amount",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded p-1 transition-colors cursor-pointer"
                        title="Remove Row"
                        onClick={() => {
                          const updated = voucher.transactions.filter(
                            (_, i) => i !== index,
                          );
                          setVoucher({
                            ...voucher,
                            transactions: updated.length
                              ? updated
                              : [
                                  {
                                    fromAccount: "",
                                    toAccount: "",
                                    amount: "",
                                  },
                                ],
                          });
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-5">
            <div className="bg-white border border-[#cbe0d2] rounded-xl p-4 min-w-64 text-right shadow-xs space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600 gap-6">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-800">
                  ₹ {totalAmount.toFixed(2)}
                </span>
              </div>
              {gst.applied && (
                <div className="flex justify-between text-xs font-semibold text-emerald-700 gap-6">
                  <span>GST ({gst.percentage}%):</span>
                  <span>₹ {gst.amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-[#042f2e] border-t border-[#e2f2e9] pt-2 gap-6">
                <span>Grand Total:</span>
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
            className="app-input w-full mt-1 border-[#c8ddcd]! bg-white text-slate-900 focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium h-20 resize-none"
            placeholder="Enter narration or note..."
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
            <Save size={16} /> {isEditMode ? "Update Voucher" : "Save Voucher"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="app-btn-secondary flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 hover:text-slate-800 min-w-30 transition-all"
          >
            <RotateCcw size={16} /> Reset Form
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

export default ContraVoucher;
