import { describe, test, expect } from "vitest";

describe("BankActivities Running Balance & Statement Export Logic", () => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatBalanceWithDrCr = (amount) => {
    const numericAmount = parseFloat(amount) || 0;
    const absVal = Math.abs(numericAmount);
    const suffix = numericAmount >= 0 ? " Cr" : " Dr";
    return formatCurrency(absVal) + suffix;
  };

  const calculatePeriodOpeningBalance = (account, transactions, startDate) => {
    if (!account) return 0;
    const baseOpening = parseFloat(account.openingBalance) || 0;
    if (!startDate) return baseOpening;

    const start = new Date(startDate);
    const sortedTxns = [...transactions].sort((a, b) => {
      const da = new Date((a.date || a.createdAt || "").split("T")[0]);
      const db = new Date((b.date || b.createdAt || "").split("T")[0]);
      if (da - db !== 0) return da - db;
      return (a.id || 0) - (b.id || 0);
    });

    let priorSum = 0;
    for (const t of sortedTxns) {
      const tDate = new Date((t.date || t.createdAt || "").split("T")[0]);
      if (tDate < start) {
        const amt = parseFloat(t.amount) || 0;
        if (t.transactionType === "credit") {
          priorSum += amt;
        } else {
          priorSum -= amt;
        }
      }
    }
    return baseOpening + priorSum;
  };

  const generateStatementExportRows = (account, transactions, startDate) => {
    const periodOpening = calculatePeriodOpeningBalance(account, transactions, startDate);
    const openingDate = startDate || account.openingDate || "2026-01-01";

    const sortedTxns = [...transactions].sort((a, b) => {
      const da = new Date((a.date || a.createdAt || "").split("T")[0]);
      const db = new Date((b.date || b.createdAt || "").split("T")[0]);
      if (da - db !== 0) return da - db;
      return (a.id || 0) - (b.id || 0);
    });

    let runningBal = parseFloat(account.openingBalance) || 0;
    const txnsWithBalances = sortedTxns.map((t) => {
      const amt = parseFloat(t.amount) || 0;
      if (t.transactionType === "credit") {
        runningBal += amt;
      } else {
        runningBal -= amt;
      }
      return { ...t, balanceAfter: runningBal };
    });

    const filtered = txnsWithBalances.filter((t) => {
      const tDate = new Date((t.date || t.createdAt || "").split("T")[0]);
      if (startDate && new Date(startDate) > tDate) return false;
      return true;
    });

    const exportRows = [
      {
        Date: openingDate,
        Particulars: "Opening Balance",
        VoucherType: "-",
        VoucherID: "-",
        WithdrawalDr: "",
        DepositCr: "",
        Balance: formatBalanceWithDrCr(periodOpening),
      },
      ...filtered.map((t) => ({
        Date: t.date,
        Particulars: t.description,
        VoucherType: t.voucherType || "Voucher",
        VoucherID: t.voucherId || "-",
        WithdrawalDr: t.transactionType === "debit" ? t.amount : "",
        DepositCr: t.transactionType === "credit" ? t.amount : "",
        Balance: formatBalanceWithDrCr(t.balanceAfter),
      })),
    ];

    return exportRows;
  };

  describe("formatBalanceWithDrCr", () => {
    test("formats positive balance with Cr suffix", () => {
      const result = formatBalanceWithDrCr(15000);
      expect(result).toContain("15,000.00");
      expect(result).toMatch(/Cr$/);
    });

    test("formats zero balance with Cr suffix", () => {
      const result = formatBalanceWithDrCr(0);
      expect(result).toContain("0.00");
      expect(result).toMatch(/Cr$/);
    });

    test("formats negative overdraft balance with Dr suffix", () => {
      const result = formatBalanceWithDrCr(-2500);
      expect(result).toContain("2,500.00");
      expect(result).toMatch(/Dr$/);
    });
  });

  describe("Period Opening Balance Calculation", () => {
    const account = { id: 1, openingBalance: 10000, openingDate: "2026-01-01" };
    const transactions = [
      { id: 1, date: "2026-01-05", amount: 2000, transactionType: "credit" },
      { id: 2, date: "2026-01-10", amount: 5000, transactionType: "debit" },
      { id: 3, date: "2026-01-15", amount: 3000, transactionType: "credit" },
    ];

    test("returns base opening balance when no startDate filter is applied", () => {
      const periodOpening = calculatePeriodOpeningBalance(account, transactions, "");
      expect(periodOpening).toBe(10000);
    });

    test("accumulates prior transactions when startDate filter is applied", () => {
      const periodOpening = calculatePeriodOpeningBalance(account, transactions, "2026-01-10");
      expect(periodOpening).toBe(12000); // 10000 + 2000 prior credit
    });
  });

  describe("Statement Export Top Row Structure", () => {
    const account = { id: 1, openingBalance: 5000, openingDate: "2026-01-01" };
    const transactions = [
      { id: 1, date: "2026-01-02", amount: 1000, transactionType: "credit", description: "Payment from client" },
      { id: 2, date: "2026-01-03", amount: 500, transactionType: "debit", description: "Office supplies" },
    ];

    test("prepends explicit Opening Balance row at index 0", () => {
      const rows = generateStatementExportRows(account, transactions, "");
      expect(rows.length).toBe(3);
      expect(rows[0].Particulars).toBe("Opening Balance");
      expect(rows[0].VoucherType).toBe("-");
      expect(rows[0].Balance).toContain("5,000.00 Cr");
    });

    test("statement export rows preserve chronological transaction order after Opening Balance row", () => {
      const rows = generateStatementExportRows(account, transactions, "");
      expect(rows[1].Particulars).toBe("Payment from client");
      expect(rows[1].Balance).toContain("6,000.00 Cr");

      expect(rows[2].Particulars).toBe("Office supplies");
      expect(rows[2].Balance).toContain("5,500.00 Cr");
    });
  });
});
