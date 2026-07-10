























































































































































































































































































































































































































































































































































































import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import BulkImportButton from "./BulkImportButton";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

const API = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1`;

const ContraVoucher = () => {
  const { companyId } = useCompany();
  const { user, role: userRole } = useAuth();

  const { id } = useParams();
  const navigate = useNavigate();

  const [isEditMode, setIsEditMode] = useState(false);
  const [voucher, setVoucher] = useState({
    date: new Date().toISOString().split("T")[0],
    voucherNo: "",
    narration: "",
    transactions: [
      { fromAccount: "", toAccount: "", amount: "" },
    ],

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
      const allLedgers = ledgerRes.data || [];
      const cashLedger = allLedgers.find(
        (l) =>
          l.name?.toLowerCase().includes("cash") ||
          l.underGroup === "Cash-in-Hand" ||
          l.under === "Cash-in-Hand"
      );

      if (cashLedger) {
        contraOptions.push({ id: `ledger_${cashLedger.id}`, name: cashLedger.name });
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
        date: vData.date ? new Date(vData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        voucherNo: vData.voucherNo || "",
        narration: vData.narration || "",
        transactions: data.transactions?.length ? data.transactions : [{ fromAccount: "", toAccount: "", amount: "" }],
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
      axios.get(`${API}/voucher-util/next/${companyId}/contra`)
        .then(res => setVoucher(prev => ({ ...prev, voucherNo: res.data.nextNumber })))
        .catch(console.error);
    }
  }, [id, companyId]);


  const handleTransactionChange = (index, field, value) => {
    const updated = [...voucher.transactions];
    updated[index][field] = value;


    if (field === "amount" && gst.applied) {
      const totalAmount = updated.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
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
    0
  );
  const grandTotal = totalAmount + (gst.applied ? gst.amount : 0);


















































































  const saveVoucher = async () => {
    if (
      voucher.transactions.some(
        (t) => !t.fromAccount || !t.toAccount || !t.amount
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

    try {
      if (isEditMode) {
        await axios.put(
          `${API}/contra-voucher/update/${id}`,
          payload
        );

        Swal.fire(
          "Success",
          "Contra Voucher updated successfully",
          "success"
        );

        navigate("/accounting/client/listOfContraVoucher");
        return;
      }

      const res = await axios.post(
        `${API}/contra-voucher/${companyId}/create`,
        payload
      );


      await axios.post(
        `${API}/voucher/createVoucher`,
        {
          companyId,
          voucherNo: voucher.voucherNo,
          voucherType: "Contra",
          date: voucher.date,
          narration: voucher.narration,
          items: payload.transactions,
        }
      );

      Swal.fire({
        title: "Saved",
        text: "Contra Voucher saved successfully",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Download PDF",
        cancelButtonText: "Close",
      }).then((result) => {
        if (res.data?.pdf_path) {
          const pdfUrl = `${import.meta.env.VITE_ACCOUNTING_URL}/${res.data.pdf_path}`;
          if (result.isConfirmed) {

            window.open(pdfUrl, "_blank");
            

            fetch(pdfUrl)
              .then((response) => response.blob())
              .then((blob) => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = res.data.pdf_path.split("/").pop() || "ContraVoucher.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
              })
              .catch((err) => console.error("Error downloading PDF:", err));
          }
        }
      });


      setVoucher({
        date: new Date()
          .toISOString()
          .split("T")[0],
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

        Swal.fire(
          "Error",
          "No data found in file",
          "error"
        );

        return;
      }



      const firstRow = data[0];





      const bankRes =
        await axios.get(
          `${API}/bank/${companyId}/all`
        );

      const latestBanks =
        bankRes.data.accounts || [];



      const ledgerRes =
        await axios.get(
          `${API}/ledger/${companyId}/all`
        );

      const allLedgers =
        ledgerRes.data || [];



      const latestAccounts =
        latestBanks.map((b) => ({

          id: `bank_${b.id}`,

          name:
            b.bankName
              ? `${b.accountName} (${b.bankName})`
              : b.accountName,
        }));



      const cashLedger =
        allLedgers.find(
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

        latestAccounts.push({

          id:
            `ledger_${cashLedger.id}`,

          name:
            cashLedger.name,
        });

      } else {

        latestAccounts.push({
          id: "cash",
          name: "Cash",
        });
      }



      const importedTransactions = [];

      for (const row of data) {

        const fromName =
          row.FromAccount
            ?.trim()
            ?.toLowerCase();

        const toName =
          row.ToAccount
            ?.trim()
            ?.toLowerCase();



        const createBankIfMissing =
          async (name) => {

            if (
              !name ||
              name === "cash"
            ) return;

            const exists =
              latestAccounts.find(
                (a) =>
                  a.name
                    ?.toLowerCase()
                    ?.trim() === name
              );

            if (!exists) {

              try {

                const res =
                  await axios.post(
                    `${API}/bank/${companyId}/create`,
                    {
                      accountName: name,
                      bankName: name,
                      currentBalance: 0,
                    }
                  );

                latestAccounts.push({

                  id:
                    `bank_${res.data.id}`,

                  name,
                });

              } catch (err) {

                console.log(
                  "Bank create failed",
                  err
                );
              }
            }
          };

        await createBankIfMissing(
          fromName
        );

        await createBankIfMissing(
          toName
        );



        const fromAcc =
          latestAccounts.find(
            (a) =>
              a.name
                ?.toLowerCase()
                ?.trim() ===
              fromName
          );

        const toAcc =
          latestAccounts.find(
            (a) =>
              a.name
                ?.toLowerCase()
                ?.trim() ===
              toName
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

          amount:
            parseFloat(
              row.Amount || 0
            ),
        });
      }



      setAccounts(latestAccounts);



      setVoucher({

        ...voucher,

        voucherNo:
          firstRow.VoucherNo ||
          "",

        date:
          firstRow.Date
            ? new Date(
              firstRow.Date
            )
              .toISOString()
              .split("T")[0]
            : new Date()
              .toISOString()
              .split("T")[0],

        narration:
          firstRow.Narration ||
          "",

        transactions:
          importedTransactions,
      });



      const refreshedBankRes =
        await axios.get(
          `${API}/bank/${companyId}/all`
        );

      const banks =
        refreshedBankRes.data.accounts || [];

      const contraOptions =
        banks.map((b) => ({
          id: `bank_${b.id}`,
          name: b.bankName ? `${b.accountName} (${b.bankName})` : b.accountName,
        }));

      contraOptions.push({ id: "cash", name: "Cash" });

      setAccounts(contraOptions);

      Swal.fire({
        icon: "success",
        title: "Import Successful",
        text:
          "Imported data loaded successfully. Review and click Save Voucher.",
      });

    } catch (error) {

      console.log(error);

      Swal.fire(
        "Error",
        "Import failed",
        "error"
      );
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
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition bg-white";

  const tableInputClass =
    "w-full rounded border border-transparent px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition bg-transparent";

  return (
    <div className="p-6 bg-white mx-auto shadow-md rounded-xl border border-gray-300">

      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-slate-800">
            Contra Voucher
          </h1>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
            CV
          </span>
        </div>

        <BulkImportButton onDataParsed={handleBulkImport} />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
            Voucher Number
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
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
            Date
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


      <div className="overflow-x-auto mb-2 border border-slate-100 rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-slate-500 font-semibold">
                From Account (Credit)
              </th>

              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-slate-500 font-semibold">
                To Account (Debit)
              </th>

              <th className="px-3 py-2 text-right text-xs uppercase tracking-wider text-slate-500 font-semibold w-32">
                Amount
              </th>

              <th className="px-3 py-2 text-center text-xs uppercase tracking-wider text-slate-500 font-semibold w-10"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {voucher.transactions.map((transaction, index) => (
              <tr
                key={index}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-2 py-1">
                  <select
                    className={tableInputClass}
                    value={transaction.fromAccount}
                    onChange={(e) =>
                      handleTransactionChange(
                        index,
                        "fromAccount",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select account
                    </option>

                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-2 py-1">
                  <select
                    className={tableInputClass}
                    value={transaction.toAccount}
                    onChange={(e) =>
                      handleTransactionChange(
                        index,
                        "toAccount",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select account
                    </option>

                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}

                  </select>
                </td>

                <td className="px-2 py-1">
                  <input
                    type="number"
                    className={`${tableInputClass} text-right`}
                    placeholder="0.00"
                    value={transaction.amount}
                    onChange={(e) =>
                      handleTransactionChange(
                        index,
                        "amount",
                        e.target.value
                      )
                    }
                  />
                </td>

                <td className="px-2 py-1 text-center">
                  <button
                    type="button"
                    className="text-slate-300 hover:text-red-400 hover:bg-red-50 rounded px-1.5 py-0.5 transition-colors text-xs"
                    onClick={() => {
                      const updated =
                        voucher.transactions.filter(
                          (_, i) => i !== index
                        );

                      setVoucher({
                        ...voucher,
                        transactions:
                          updated.length
                            ? updated
                            : [
                              {
                                fromAccount:
                                  "",
                                toAccount:
                                  "",
                                amount: "",
                              },
                            ],
                      });
                    }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="mt-3 text-blue-700" onClick={addTransaction}>
        + Add Transaction
      </button>





      <div className="flex justify-end mt-4">
        <div className="text-right space-y-1">
          <p className="font-medium">Subtotal: ₹ {totalAmount.toFixed(2)}</p>
          {gst.applied && (
            <p className="text-green-700 font-medium">
              GST ({gst.percentage}%): ₹ {gst.amount.toFixed(2)}
            </p>
          )}
          <p className="text-lg font-semibold border-t pt-1">
            Grand Total: ₹ {grandTotal.toFixed(2)}
          </p>
        </div>
      </div>


      <div className="mt-6">
        <label className="text-sm font-medium">Narration</label>
        <textarea
          className="w-full border rounded px-3 py-2 mt-1"
          rows="3"
          placeholder="Enter narration..."
          value={voucher.narration}
          onChange={(e) =>
            setVoucher({ ...voucher, narration: e.target.value })
          }
        ></textarea>
      </div>


      <button
        onClick={saveVoucher}
        className="mt-6 bg-blue-700 text-white px-6 py-2 rounded"
      >
        {isEditMode
          ? "Update Voucher"
          : "Save Voucher"}
      </button>
    </div>
  );
};

export default ContraVoucher;