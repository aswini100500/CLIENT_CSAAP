import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { formatINR } from "../payrollUtils";
import React from "react";

const safeFormat = (amount) => {
  if (amount === undefined || amount === null) return "0";
  const formatted = formatINR(amount);
  const cleanNumber = String(formatted).replace(/[^\d.,-]/g, "");
  return cleanNumber;
};

const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontFamily: "Helvetica",
    fontSize: 6.5,
    color: "#374151",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: "#111827",
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerRight: {
    textAlign: "right",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  companyName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },
  periodText: {
    fontSize: 8,
    color: "#4b5563",
    marginTop: 1,
  },
  metaText: {
    fontSize: 6,
    color: "#9ca3af",
  },

  table: {
    width: "100%",
  },

  groupHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  groupHeaderText: {
    fontSize: 6,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 2,
    color: "#4b5563",
    textTransform: "uppercase",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#111827",
    color: "#ffffff",
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  headerText: {
    fontSize: 5.5,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 3,
    paddingHorizontal: 2,
    alignItems: "center",
  },
  tableRowEven: {
    backgroundColor: "#f9fafb",
  },
  rowText: {
    fontSize: 5.5,
    textAlign: "center",
  },
  rowTextName: {
    fontSize: 5.5,
    textAlign: "left",
    paddingLeft: 2,
  },
  deptText: {
    fontSize: 4.5,
    color: "#6b7280",
    textAlign: "left",
    paddingLeft: 2,
  },

  totalRow: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    paddingVertical: 4,
    paddingHorizontal: 2,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },
  totalText: {
    fontSize: 6,
    fontWeight: "bold",
    textAlign: "right",
  },

  colId: { width: "3%" },
  colName: { width: "12%" },
  colAttendance: { width: "3.5%" },
  colLop: { width: "2.5%" },

  colFixedGross: { width: "6.5%", textAlign: "right" },
  colEarnedBasic: { width: "5%", textAlign: "right" },
  colEarnedHra: { width: "4%", textAlign: "right" },
  colEarnedTa: { width: "4%", textAlign: "right" },
  colEarnedDa: { width: "4%", textAlign: "right" },
  colEarnedSpecial: { width: "5%", textAlign: "right" },
  colOtherEarn: { width: "6%", textAlign: "right" },
  colOT: { width: "4%", textAlign: "right" },
  colTotalGross: { width: "7%", textAlign: "right", fontWeight: "bold" },

  colEpf: { width: "5%", textAlign: "right" },
  colEsi: { width: "4.5%", textAlign: "right" },
  colPt: { width: "4%", textAlign: "right" },
  colTds: { width: "4%", textAlign: "right" },
  colLopDed: { width: "5.5%", textAlign: "right" },
  colOtherDed: { width: "6%", textAlign: "right" },
  colTotalDed: { width: "7%", textAlign: "right", fontWeight: "bold" },

  colNet: {
    width: "7.5%",
    textAlign: "right",
    fontWeight: "bold",
    color: "#111827",
  },

  summarySection: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  summaryCard: {
    width: "22%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: 6,
    backgroundColor: "#f9fafb",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 6,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 6,
    fontWeight: "bold",
    color: "#111827",
  },
  summaryTotal: {
    marginTop: 3,
    paddingTop: 3,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
  },

  footer: {
    position: "absolute",
    bottom: 15,
    left: 15,
    right: 15,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 5.5,
    fontStyle: "italic",
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
});

const PayrollReportDocument = ({
  payrollRecords = [],
  month,
  year,
  companyName = "HRMS PORTAL",
}) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const periodLabel = month && year ? `${monthNames[month - 1]} ${year}` : "";

  let gtFixedGross = 0;
  let gtGrossEarned = 0;
  let gtDeductions = 0;
  let gtNet = 0;
  let gtEPF = 0;
  let gtESI = 0;
  let gtTDS = 0;
  let gtPT = 0;
  let gtOT = 0;
  let gtLopDed = 0;
  let gtOtherEarn = 0;
  let gtOtherDed = 0;
  let gtBasic = 0;
  let gtHRA = 0;
  let gtTA = 0;
  let gtDA = 0;
  let gtSpecial = 0;

  const rows = payrollRecords.map((record) => {
    const p = record.payroll || {};

    const otherEarnings =
      (p.otherComponents || [])
        .filter((c) => c.type === "earning")
        .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0) +
      (p.extraEarnings || []).reduce(
        (sum, c) => sum + (parseFloat(c.amount) || 0),
        0,
      );

    const otherDeductions =
      (p.otherComponents || [])
        .filter((c) => c.type === "deduction")
        .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0) +
      (p.extraDeductions || []).reduce(
        (sum, c) => sum + (parseFloat(c.amount) || 0),
        0,
      ) +
      (p.lwf || 0);

    const lopDed = (p.lopDeduction || 0) + (p.halfDayDeduction || 0);
    const basic = p.proratedEarnings?.basic || p.basic || 0;
    const hra = p.proratedEarnings?.hra || p.hra || 0;
    const ta = p.proratedEarnings?.ta || p.ta || 0;
    const da = p.proratedEarnings?.da || p.da || 0;
    const special =
      p.proratedEarnings?.specialAllowance || p.specialAllowance || 0;

    gtFixedGross += p.monthlyCTC || 0;
    gtGrossEarned += p.gross || 0;
    gtDeductions += p.totalDeductions || 0;
    gtNet += p.netSalary || 0;
    gtEPF += p.epf || 0;
    gtESI += p.esi || 0;
    gtTDS += p.tds || 0;
    gtPT += p.pt || 0;
    gtOT += p.otPay || 0;
    gtLopDed += lopDed;
    gtOtherEarn += otherEarnings;
    gtOtherDed += otherDeductions;
    gtBasic += basic;
    gtHRA += hra;
    gtTA += ta;
    gtDA += da;
    gtSpecial += special;

    return {
      id: record.id,
      name: record.name,
      department: record.department || "N/A",
      attendance: p.uiPresentDays || 0,
      lopDays: p.lopDays || 0,
      fixedGross: p.monthlyCTC || 0,
      earnedBasic: basic,
      earnedHra: hra,
      earnedTa: ta,
      earnedDa: da,
      earnedSpecial: special,
      otherEarn: otherEarnings,
      ot: p.otPay || 0,
      totalGross: p.gross || 0,
      epf: p.epf || 0,
      esi: p.esi || 0,
      pt: p.pt || 0,
      tds: p.tds || 0,
      lopDed: lopDed,
      otherDed: otherDeductions,
      totalDed: p.totalDeductions || 0,
      net: p.netSalary || 0,
    };
  });

  return (
    <Document title={`Payroll Register - ${periodLabel}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Payroll Register</Text>
            <Text style={styles.periodText}>{periodLabel}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.metaText}>
              Generated: {new Date().toLocaleString()}
            </Text>
            <Text style={styles.metaText}>Employees: {rows.length}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.groupHeader}>
            <View style={{ width: "21%" }}>
              <Text style={styles.groupHeaderText}>Employee Info</Text>
            </View>
            <View style={{ width: "40.5%", backgroundColor: "#eff6ff" }}>
              <Text style={styles.groupHeaderText}>Earnings (Paid)</Text>
            </View>
            <View style={{ width: "35%", backgroundColor: "#fff7ed" }}>
              <Text style={styles.groupHeaderText}>Deductions</Text>
            </View>
            <View style={{ width: "7.5%" }}>
              <Text style={styles.groupHeaderText}>Net</Text>
            </View>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colId]}>ID</Text>
            <Text
              style={[
                styles.headerText,
                styles.colName,
                { textAlign: "left", paddingLeft: 2 },
              ]}
            >
              Name / Dept
            </Text>
            <Text style={[styles.headerText, styles.colAttendance]}>Days</Text>
            <Text style={[styles.headerText, styles.colLop]}>LOP</Text>

            <Text style={[styles.headerText, styles.colFixedGross]}>
              Fixed G.
            </Text>
            <Text style={[styles.headerText, styles.colEarnedBasic]}>
              Basic
            </Text>
            <Text style={[styles.headerText, styles.colEarnedHra]}>HRA</Text>
            <Text style={[styles.headerText, styles.colEarnedTa]}>TA</Text>
            <Text style={[styles.headerText, styles.colEarnedDa]}>DA</Text>
            <Text style={[styles.headerText, styles.colEarnedSpecial]}>
              Special
            </Text>
            <Text style={[styles.headerText, styles.colOtherEarn]}>Other</Text>
            <Text style={[styles.headerText, styles.colOT]}>OT</Text>
            <Text style={[styles.headerText, styles.colTotalGross]}>
              Tot Gross
            </Text>

            <Text style={[styles.headerText, styles.colEpf]}>EPF</Text>
            <Text style={[styles.headerText, styles.colEsi]}>ESI</Text>
            <Text style={[styles.headerText, styles.colPt]}>PT</Text>
            <Text style={[styles.headerText, styles.colTds]}>TDS</Text>
            <Text style={[styles.headerText, styles.colLopDed]}>LOP Ded</Text>
            <Text style={[styles.headerText, styles.colOtherDed]}>Other</Text>
            <Text style={[styles.headerText, styles.colTotalDed]}>Tot Ded</Text>

            <Text style={[styles.headerText, styles.colNet]}>Net Pay</Text>
          </View>

          {rows.map((row, idx) => (
            <View
              key={idx}
              style={[styles.tableRow, idx % 2 === 1 && styles.tableRowEven]}
            >
              <Text style={[styles.rowText, styles.colId]}>{row.id}</Text>
              <View style={styles.colName}>
                <Text style={styles.rowTextName}>{row.name}</Text>
                <Text style={styles.deptText}>{row.department}</Text>
              </View>
              <Text style={[styles.rowText, styles.colAttendance]}>
                {row.attendance}
              </Text>
              <Text style={[styles.rowText, styles.colLop]}>{row.lopDays}</Text>

              <Text style={[styles.rowText, styles.colFixedGross]}>
                {safeFormat(row.fixedGross)}
              </Text>
              <Text style={[styles.rowText, styles.colEarnedBasic]}>
                {safeFormat(row.earnedBasic)}
              </Text>
              <Text style={[styles.rowText, styles.colEarnedHra]}>
                {safeFormat(row.earnedHra)}
              </Text>
              <Text style={[styles.rowText, styles.colEarnedTa]}>
                {safeFormat(row.earnedTa)}
              </Text>
              <Text style={[styles.rowText, styles.colEarnedDa]}>
                {safeFormat(row.earnedDa)}
              </Text>
              <Text style={[styles.rowText, styles.colEarnedSpecial]}>
                {safeFormat(row.earnedSpecial)}
              </Text>
              <Text style={[styles.rowText, styles.colOtherEarn]}>
                {safeFormat(row.otherEarn)}
              </Text>
              <Text style={[styles.rowText, styles.colOT]}>
                {safeFormat(row.ot)}
              </Text>
              <Text
                style={[
                  styles.rowText,
                  styles.colTotalGross,
                  { fontWeight: "bold" },
                ]}
              >
                {safeFormat(row.totalGross)}
              </Text>

              <Text style={[styles.rowText, styles.colEpf]}>
                {safeFormat(row.epf)}
              </Text>
              <Text style={[styles.rowText, styles.colEsi]}>
                {safeFormat(row.esi)}
              </Text>
              <Text style={[styles.rowText, styles.colPt]}>
                {safeFormat(row.pt)}
              </Text>
              <Text style={[styles.rowText, styles.colTds]}>
                {safeFormat(row.tds)}
              </Text>
              <Text style={[styles.rowText, styles.colLopDed]}>
                {safeFormat(row.lopDed)}
              </Text>
              <Text style={[styles.rowText, styles.colOtherDed]}>
                {safeFormat(row.otherDed)}
              </Text>
              <Text
                style={[
                  styles.rowText,
                  styles.colTotalDed,
                  { fontWeight: "bold" },
                ]}
              >
                {safeFormat(row.totalDed)}
              </Text>

              <Text
                style={[styles.rowText, styles.colNet, { fontWeight: "bold" }]}
              >
                {safeFormat(row.net)}
              </Text>
            </View>
          ))}

          {rows.length > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.colId]}></Text>
              <Text
                style={[
                  styles.colName,
                  { fontSize: 6, fontWeight: "bold", paddingLeft: 2 },
                ]}
              >
                GRAND TOTAL
              </Text>
              <Text style={[styles.colAttendance]}></Text>
              <Text style={[styles.colLop]}></Text>

              <Text style={[styles.totalText, styles.colFixedGross]}>
                {safeFormat(gtFixedGross)}
              </Text>
              <Text style={[styles.totalText, styles.colEarnedBasic]}>
                {safeFormat(gtBasic)}
              </Text>
              <Text style={[styles.totalText, styles.colEarnedHra]}>
                {safeFormat(gtHRA)}
              </Text>
              <Text style={[styles.totalText, styles.colEarnedTa]}>
                {safeFormat(gtTA)}
              </Text>
              <Text style={[styles.totalText, styles.colEarnedDa]}>
                {safeFormat(gtDA)}
              </Text>
              <Text style={[styles.totalText, styles.colEarnedSpecial]}>
                {safeFormat(gtSpecial)}
              </Text>
              <Text style={[styles.totalText, styles.colOtherEarn]}>
                {safeFormat(gtOtherEarn)}
              </Text>
              <Text style={[styles.totalText, styles.colOT]}>
                {safeFormat(gtOT)}
              </Text>
              <Text style={[styles.totalText, styles.colTotalGross]}>
                {safeFormat(gtGrossEarned)}
              </Text>

              <Text style={[styles.totalText, styles.colEpf]}>
                {safeFormat(gtEPF)}
              </Text>
              <Text style={[styles.totalText, styles.colEsi]}>
                {safeFormat(gtESI)}
              </Text>
              <Text style={[styles.totalText, styles.colPt]}>
                {safeFormat(gtPT)}
              </Text>
              <Text style={[styles.totalText, styles.colTds]}>
                {safeFormat(gtTDS)}
              </Text>
              <Text style={[styles.totalText, styles.colLopDed]}>
                {safeFormat(gtLopDed)}
              </Text>
              <Text style={[styles.totalText, styles.colOtherDed]}>
                {safeFormat(gtOtherDed)}
              </Text>
              <Text style={[styles.totalText, styles.colTotalDed]}>
                {safeFormat(gtDeductions)}
              </Text>

              <Text style={[styles.totalText, styles.colNet]}>
                {safeFormat(gtNet)}
              </Text>
            </View>
          )}

          {rows.length === 0 && (
            <View style={styles.tableRow}>
              <Text
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 8,
                  padding: 10,
                }}
              >
                No records found for this period.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text
              style={{
                fontSize: 8,
                fontWeight: "bold",
                marginBottom: 4,
                color: "#111827",
              }}
            >
              Payroll Summary
            </Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Employees:</Text>
              <Text style={styles.summaryValue}>{rows.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Earnings:</Text>
              <Text style={styles.summaryValue}>
                Rs. {safeFormat(gtGrossEarned)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Deductions:</Text>
              <Text style={styles.summaryValue}>
                Rs. {safeFormat(gtDeductions)}
              </Text>
            </View>

            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text
                style={[
                  styles.summaryLabel,
                  { fontWeight: "bold", color: "#111827" },
                ]}
              >
                Net Payable:
              </Text>
              <Text style={[styles.summaryValue, { fontSize: 7 }]}>
                Rs. {safeFormat(gtNet)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Confidential Payroll Register - Generated via HRMS Portal</Text>
          <Text style={{ marginTop: 2 }}>
            This is a computer-generated report and does not require a physical
            signature.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export const downloadPayrollReportPDF = async (
  payrollRecords = [],
  month,
  year,
  companyName,
) => {
  const blob = await pdf(
    <PayrollReportDocument
      payrollRecords={payrollRecords}
      month={month}
      year={year}
      companyName={companyName}
    />,
  ).toBlob();

  const fileName = `Payroll_Register_${month}_${year}_${new Date().getTime()}.pdf`;
  saveAs(blob, fileName);
};
