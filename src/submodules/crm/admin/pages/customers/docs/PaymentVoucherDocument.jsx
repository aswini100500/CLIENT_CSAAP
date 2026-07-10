import React from "react";

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";

const formatINR = (val) => {
  const num = parseFloat(val) || 0;
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
  return `Rs. ${formatted}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateStr;
  }
};

const numberToWords = (num) => {
  const amount = Math.floor(parseFloat(num) || 0);
  if (amount === 0) return "Zero";

  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const convertLessThanThousand = (n) => {
    if (n === 0) return "";
    let str = "";
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
      if (n > 0) str += "and ";
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) str += units[n] + " ";
    return str.trim();
  };

  const convert = (n) => {
    if (n === 0) return "Zero";
    let words = "";
    if (Math.floor(n / 10000000) > 0) {
      words += convertLessThanThousand(Math.floor(n / 10000000)) + " Crore ";
      n %= 10000000;
    }
    if (Math.floor(n / 100000) > 0) {
      words += convertLessThanThousand(Math.floor(n / 100000)) + " Lakh ";
      n %= 100000;
    }
    if (Math.floor(n / 1000) > 0) {
      words += convertLessThanThousand(Math.floor(n / 1000)) + " Thousand ";
      n %= 1000;
    }
    if (n > 0) {
      words += convertLessThanThousand(n);
    }
    return words.trim();
  };

  return convert(amount) + " Rupees Only";
};

const modeLabels = {
  cash: "Cash",
  cheque: "Cheque",
  bank_transfer: "Bank Transfer",
  upi: "UPI",
  other: "Other",
};

const styles = StyleSheet.create({
  page: {
    padding: 24,
    paddingBottom: 50,
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: "#334155",
  },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: "#10b981",
    marginBottom: 15,
  },
  headerLeft: {
    flexDirection: "column",
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: 0.5,
  },
  companySubtitle: {
    fontSize: 7,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  voucherTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#10b981",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 8,
    marginBottom: 15,
  },
  infoCol: {
    width: "48%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  infoLabel: {
    fontWeight: "bold",
    color: "#64748b",
    fontSize: 8,
    width: "40%",
  },
  infoValue: {
    fontWeight: "bold",
    color: "#0f172a",
    fontSize: 8,
    width: "60%",
    textAlign: "left",
  },

  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  table: {
    width: "100%",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableRowLast: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  thCell: {
    fontWeight: "bold",
    fontSize: 8,
    color: "#475569",
    textTransform: "uppercase",
  },
  tdCell: {
    fontSize: 8.5,
    color: "#334155",
  },
  tdCellBold: {
    fontSize: 8.5,
    color: "#0f172a",
    fontWeight: "bold",
  },

  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 20,
  },
  wordsContainer: {
    width: "50%",
  },
  wordsLabel: {
    fontSize: 7,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  wordsText: {
    fontWeight: "bold",
    fontSize: 8,
    color: "#334155",
    fontStyle: "italic",
    lineHeight: 1.1,
  },
  totalBoxContainer: {
    width: "45%",
  },
  totalBox: {
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
    backgroundColor: "#f8fafc",
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
  },
  totalVal: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#10b981",
  },

  statementText: {
    fontSize: 7,
    color: "#94a3b8",
    textAlign: "center",
    width: "100%",
    marginTop: 20,
  },
  footerContainer: {
    position: "absolute",
    bottom: 20,
    left: 24,
    right: 24,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 6,
  },
  footerCompany: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

const PaymentVoucherDocument = ({ customer, payment, companyName }) => {
  const segments = payment.segments || [payment];
  const totalAmount = payment.totalAmount || Number(payment.amount) || 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>
              {(companyName || "Company").toUpperCase()}
            </Text>
            <Text style={styles.companySubtitle}>
              Authorized Transaction Voucher
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.voucherTitle}>Payment Voucher</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Voucher No.</Text>
            <Text style={styles.infoValue}>
              PV-{String(payment.id || segments[0]?.id || "").padStart(5, "0")}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>
              {formatDate(payment.payment_date)}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Customer</Text>
            <Text style={styles.infoValue}>{customer?.name || "N/A"}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Total Amount</Text>
            <Text style={styles.infoValue}>{formatINR(totalAmount)}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Payment Mode</Text>
            <Text style={styles.infoValue}>
              {modeLabels[payment.payment_mode] ||
                payment.payment_mode ||
                "N/A"}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Reference No.</Text>
            <Text style={styles.infoValue}>
              {payment.reference_number || "—"}
            </Text>
          </View>
          {payment.cleanNote ? (
            <View style={[styles.infoCol, { width: "100%", marginTop: 4 }]}>
              <Text style={[styles.infoLabel, { width: "19.2%" }]}>Note</Text>
              <Text style={[styles.infoValue, { width: "80.8%" }]}>
                {payment.cleanNote}
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Slab-wise Allocation</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.thCell, { width: "10%" }]}>#</Text>
            <Text style={[styles.thCell, { width: "60%" }]}>Stage / Slab</Text>
            <Text style={[styles.thCell, { width: "30%", textAlign: "right" }]}>
              Amount
            </Text>
          </View>
          {segments.map((seg, idx) => {
            const isLast = idx === segments.length - 1;
            return (
              <View
                key={seg.id || idx}
                style={isLast ? styles.tableRowLast : styles.tableRow}
              >
                <Text style={[styles.tdCell, { width: "10%" }]}>{idx + 1}</Text>
                <Text style={[styles.tdCellBold, { width: "60%" }]}>
                  {seg.stage_name || "—"}
                </Text>
                <Text
                  style={[
                    styles.tdCellBold,
                    { width: "30%", textAlign: "right", color: "#065f46" },
                  ]}
                >
                  {formatINR(seg.amount)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.totalSection}>
          <View style={styles.wordsContainer}>
            <Text style={styles.wordsLabel}>Amount in Words</Text>
            <Text style={styles.wordsText}>({numberToWords(totalAmount)})</Text>
          </View>
          <View style={styles.totalBoxContainer}>
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalVal}>{formatINR(totalAmount)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.statementText}>
          This is a computer generated payment voucher, hence no signature is
          required.
        </Text>

        <View style={styles.footerContainer}>
          <Text style={styles.footerCompany}>
            {(companyName || "Company").toUpperCase()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export const downloadPaymentVoucher = async (
  customer,
  mergedPayment,
  companyName,
) => {
  const blob = await pdf(
    <PaymentVoucherDocument
      customer={customer}
      payment={mergedPayment}
      companyName={companyName}
    />,
  ).toBlob();
  const custName = (customer?.name || "customer").replace(/\s+/g, "_");
  const dateStr = mergedPayment.payment_date
    ? new Date(mergedPayment.payment_date).toISOString().split("T")[0]
    : "unknown";
  saveAs(blob, `payment-voucher-${custName}-${dateStr}.pdf`);
};

export default PaymentVoucherDocument;
