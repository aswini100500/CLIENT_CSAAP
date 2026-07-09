import React from "react";
/* eslint-disable react-refresh/only-export-components */

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
  Svg,
  Polygon,
  pdf,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { getUiPresentDays } from "../payrollUtils";

// Custom helper to capitalize each word in Title Case
const convertToTitleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Custom helper to translate numbers (including precise decimal places) into English words
const numberToWords = (num) => {
  const amount = parseFloat(num);
  if (isNaN(amount) || amount === 0) return "zero";

  const unitsEng = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen"
  ];
  const tensEng = [
    "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
  ];

  const convertLessThanOneThousand = (n) => {
    if (n === 0) return "";
    let str = "";
    if (n >= 100) {
      str += unitsEng[Math.floor(n / 100)] + " hundred ";
      n %= 100;
      if (n > 0) str += "and ";
    }
    if (n >= 20) {
      str += tensEng[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += unitsEng[n] + " ";
    }
    return str.trim();
  };

  const convert = (n) => {
    if (n === 0) return "zero";
    let words = "";

    // Crores (1,00,00,000)
    if (Math.floor(n / 10000000) > 0) {
      words += convertLessThanOneThousand(Math.floor(n / 10000000)) + " crore ";
      n %= 10000000;
    }
    // Lakhs (1,00,000)
    if (Math.floor(n / 100000) > 0) {
      words += convertLessThanOneThousand(Math.floor(n / 100000)) + " lakh ";
      n %= 100000;
    }
    // Thousands (1,000)
    if (Math.floor(n / 1000) > 0) {
      words += convertLessThanOneThousand(Math.floor(n / 1000)) + " thousand ";
      n %= 1000;
    }
    // Hundreds, Tens & Units
    if (n > 0) {
      words += convertLessThanOneThousand(n);
    }
    return words.trim();
  };

  const parts = String(amount).split(".");
  const integerPart = parseInt(parts[0], 10);
  let result = convert(integerPart);

  if (parts.length > 1 && parts[1]) {
    const decimalPart = parts[1];
    result += " point";
    const digitWords = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
    for (let i = 0; i < decimalPart.length; i++) {
      const digit = parseInt(decimalPart[i], 10);
      result += " " + (digitWords[digit] || "");
    }
  }

  return result.trim();
};

// Smart value formatter matching Tracolab PDF rules
const formatValue = (amount) => {
  if (amount === undefined || amount === null || amount === "") return "0.00";
  const num = parseFloat(amount);
  if (isNaN(num)) return "0.00";
  if (num === 0) return "0.00";
  const str = num.toString();
  if (str.includes(".")) {
    const dec = str.split(".")[1];
    if (dec.length > 2) {
      return num.toFixed(Math.min(dec.length, 4));
    }
  }
  return num.toFixed(2);
};

// Smart value formatter for Deductions (prints 0 as "0" instead of "0.00")
const formatValueDeduction = (amount) => {
  if (amount === undefined || amount === null || amount === "") return "0";
  const num = parseFloat(amount);
  if (isNaN(num)) return "0";
  if (num === 0) return "0";
  const str = num.toString();
  if (str.includes(".")) {
    const dec = str.split(".")[1];
    if (dec.length > 2) {
      return num.toFixed(Math.min(dec.length, 4));
    }
  }
  return num.toFixed(2);
};

// Formats a date string (YYYY-MM-DD) into DD-MM-YYYY
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

const styles = StyleSheet.create({
  page: {
    padding: 20,
    paddingBottom: 85, // Reserves space for absolute bottom footer to prevent overlap
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#1E293B", // Premium slate-800 text
  },
  headerContainer: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1", // Soft slate-300 border
    marginBottom: 10,
    minHeight: 68, // Accommodates larger logo nicely
  },
  logoContainer: {
    position: "absolute",
    left: 0,
    top: -8,
    width: 76,
    height: 76,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain", // Absolutely prevents distortion/squeezing
  },
  headerTextContainer: {
    alignItems: "center",
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#002FBE", // Bold Royal Blue (matching new Cloudsat PNG)
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  payslipTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000", // Solid Black (matching new Cloudsat PNG)
    letterSpacing: 0.5,
  },
  gridTable: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#CBD5E1", // Soft slate-300 borders
    marginBottom: 15,
  },
  gridRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
  },
  gridRowLast: {
    flexDirection: "row",
    borderBottomWidth: 0,
  },
  gridCell: {
    width: "50%",
    flexDirection: "row",
    paddingHorizontal: 4,
    paddingVertical: 3.8,
    borderRightWidth: 1,
    borderRightColor: "#CBD5E1",
  },
  gridCellLast: {
    width: "50%",
    flexDirection: "row",
    paddingHorizontal: 4,
    paddingVertical: 3.8,
    borderRightWidth: 0,
  },
  cellLabel: {
    width: 90,
    fontWeight: "bold",
    color: "#1E293B",
  },
  cellValue: {
    flex: 1,
    color: "#002FBE", // Corporate Royal Blue values
    fontWeight: "bold",
  },
  // 3-Column Attendance Table styles
  attCell: {
    width: "33.33%",
    flexDirection: "row",
    paddingHorizontal: 4,
    paddingVertical: 3.8,
    borderRightWidth: 1,
    borderRightColor: "#CBD5E1",
  },
  attCellLast: {
    width: "33.33%",
    flexDirection: "row",
    paddingHorizontal: 4,
    paddingVertical: 3.8,
    borderRightWidth: 0,
  },
  attLabel: {
    width: 75,
    fontWeight: "bold",
    color: "#1E293B",
  },
  attValue: {
    flex: 1,
    color: "#002FBE", // Royal Blue
    fontWeight: "bold",
  },
  // Main Earnings & Deductions Table styles
  tableHeaderContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC", // Clean Slate-50 Header background
    marginBottom: 8, // Margin between table head and body
  },
  earningsHeaderCol: {
    width: "55%",
    flexDirection: "row",
  },
  deductionsHeaderCol: {
    width: "45%",
    flexDirection: "row",
    borderLeftWidth: 1,
    borderLeftColor: "#CBD5E1",
  },
  tableBodyContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 15, // Balanced margin below table body
  },
  earningsCol: {
    width: "55%",
  },
  deductionsCol: {
    width: "45%",
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    backgroundColor: "#F8FAFC", // Clean Slate-50 Header background
  },
  tableBodyRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    minHeight: 16,
    alignItems: "center",
  },
  tableBodyRowLast: {
    flexDirection: "row",
    borderBottomWidth: 0,
    minHeight: 16,
    alignItems: "center",
  },
  headerCell: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    fontWeight: "bold",
    color: "#1E293B",
    fontSize: 7.5,
  },
  bodyCellText: {
    paddingHorizontal: 4,
    paddingVertical: 2.8,
    fontSize: 7.5,
  },
  colBlueText: {
    color: "#002FBE", // Royal Blue values
    fontWeight: "bold",
  },
  colBoldText: {
    fontWeight: "bold",
    color: "#1E293B",
  },
  // Net Pay and words section
  netPaySection: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 15,
    alignItems: "flex-start",
  },
  wordsContainer: {
    width: "60%",
    paddingRight: 8,
    paddingTop: 4,
  },
  wordsText: {
    fontWeight: "bold",
    fontSize: 8.5,
    color: "#1E293B",
  },
  netPayBoxContainer: {
    width: "40%",
    alignItems: "flex-end",
  },
  netPayBox: {
    borderWidth: 1.5,
    borderColor: "#002FBE", // Royal Blue border
    backgroundColor: "#EFF6FF", // Sky Blue tint background
    width: "100%",
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  netPayLabel: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#002FBE",
    marginBottom: 1,
  },
  netPayVal: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: "#002FBE",
  },
  // Disclaimer Statement kept in the main page flow
  statementText: {
    fontSize: 7.5,
    fontStyle: "italic",
    color: "#475569",
    marginTop: 35, // Pushes it slightly down from the Net Payable box
    textAlign: "center",
    width: "100%",
  },
  // Footer block - Absolutely positioned at the bottom of the page
  footerContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  footerCompanyName: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 1,
  },
  footerAddress: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#475569",
    marginBottom: 1,
    textAlign: "center",
  },
  footerEmail: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#002FBE",
  },
});

const PayslipDocument = ({ employee, payroll }) => {
  const uiPresentDays = getUiPresentDays(payroll);
  const prorated = payroll.proratedEarnings || {};

  // Formulate dynamic displaying period (3-Letter Month Abbreviation-Year, e.g. Apr-2026)
  const monthAbbrs = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const monthVal = payroll.month || employee.month || new Date().getMonth() + 1;
  const yearVal = payroll.year || employee.year || new Date().getFullYear();
  const monthName = monthAbbrs[monthVal - 1] || "Apr";
  const displayPeriod = `${monthName}-${yearVal}`;

  // Dynamically load the logo using absolute URL relative to location context
  const logoUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/Cloudsat_Icon.png`
      : "/Cloudsat_Icon.png";

  // Build structured Earnings List (Mapped exactly to 'Pay slip of cloudsat.png' labels)
  const earningsList = [
    { label: "Basic Pay", rate: payroll.basic || 0, earning: prorated.basic || payroll.basic || 0, arrears: 0 },
    { label: "D.A.", rate: payroll.da || 0, earning: prorated.da || payroll.da || 0, arrears: 0 },
    { label: "T.A.", rate: payroll.ta || 0, earning: prorated.ta || payroll.ta || 0, arrears: 0 },
    { label: "HRA", rate: payroll.hra || 0, earning: prorated.hra || payroll.hra || 0, arrears: 0 },
    { label: "Incentive", rate: payroll.specialAllowance || 0, earning: prorated.specialAllowance || payroll.specialAllowance || 0, arrears: 0 },
  ];

  if (payroll.otPay > 0) {
    earningsList.push({ label: "OT Pay", rate: 0, earning: payroll.otPay, arrears: 0 });
  }

  (payroll.extraEarnings || []).forEach((e) => {
    earningsList.push({ label: e.name, rate: 0, earning: e.amount, arrears: 0 });
  });

  (payroll.otherComponents || [])
    .filter((c) => c.type === "earning")
    .forEach((c) => {
      const lower = c.name?.toLowerCase();
      if (!["basic", "hra", "ta", "da", "specialallowance", "special allowance", "g.basic pay", "basic pay"].includes(lower)) {
        earningsList.push({ label: c.name, rate: 0, earning: c.amount, arrears: 0 });
      }
    });

  // Build structured Deductions List
  const epfLabel = payroll.epf > 0 ? `EPF @12%` : `EPF @0.0000%`;
  const esiLabel = payroll.esi > 0 ? `ESI @0.7500%` : `ESI @0.0000%`;

  // Standard static-dynamic deductions from new PNG
  const deductionsList = [
    { label: epfLabel, amount: payroll.epf || 0 },
    { label: esiLabel, amount: payroll.esi || 0 },
    { label: "Total Advance", amount: 0 },
    { label: "Deduct Advance", amount: 0 },
    { label: "Pending Advance", amount: 0 },
    { label: "Applicable month", amount: 0 },
  ];

  if (payroll.pt > 0) deductionsList.push({ label: "Prof. Tax (PT)", amount: payroll.pt });
  if (payroll.lwf > 0) deductionsList.push({ label: "LWF", amount: payroll.lwf });
  if (payroll.tds > 0) deductionsList.push({ label: "TDS", amount: payroll.tds });
  if (payroll.lopDeduction > 0 || payroll.lopDays > 0) {
    deductionsList.push({ label: "LOP Deduction", amount: payroll.lopDeduction || 0 });
  }

  (payroll.extraDeductions || []).forEach((e) => {
    deductionsList.push({ label: e.name, amount: e.amount });
  });

  (payroll.otherComponents || [])
    .filter((c) => c.type === "deduction")
    .forEach((c) => {
      const lower = c.name?.toLowerCase();
      if (!["epf", "esi", "pt", "lwf", "tds", "lop deduction", "half-day deduction"].includes(lower)) {
        deductionsList.push({ label: c.name, amount: c.amount });
      }
    });

  // Only show the actual earnings and deductions without unnecessary empty rows
  const maxRows = Math.max(earningsList.length, deductionsList.length);

  // Totals calculations
  const totalRate = earningsList.reduce((acc, curr) => acc + curr.rate, 0);
  const totalEarning = earningsList.reduce((acc, curr) => acc + curr.earning, 0);
  const totalArrears = earningsList.reduce((acc, curr) => acc + curr.arrears, 0);
  const totalDeductions = deductionsList.reduce((acc, curr) => acc + curr.amount, 0);

  const netPay = payroll.netSalary || (totalEarning - totalDeductions);

  // Mappings to represent blank Earning column when LOP is 0
  const hasLop = payroll.lopDays > 0 || payroll.lopDeduction > 0;
  const displayEarningVal = (rate, earning) => {
    if (!hasLop) return "";
    return formatValue(earning);
  };
  const totalEarningDisplay = hasLop ? formatValue(totalEarning) : "0.00";

  // Mappings to represent exact words (Title Case + "Rupees" suffix)
  const netPayInWords = `(${convertToTitleCase(numberToWords(netPay))} Rupees)`;

  // 3-Column Attendance details (Mapped to new 'Pay slip of cloudsat.png')
  const attendanceRows = [
    [
      { label: "Daily work", value: "0.00" },
      { label: "On duty", value: formatValueDeduction(uiPresentDays || 30) }, // shows '30' or actual working days
      { label: "Consumed", value: "" }
    ],
    [
      { label: "Holidays", value: "0.00" },
      { label: "Training Days", value: "0.00" },
      { label: "EL", value: formatValue(payroll.leaveDays || 0) }
    ],
    [
      { label: "Weekly Off", value: "0.00" },
      { label: "Maternity Off", value: "0.00" }, // shows 'Maternity Off'
      { label: "CL", value: "0.00" }
    ],
    [
      { label: "Without Pay", value: formatValue(payroll.lopDays || 0) },
      { label: "Paid Days", value: formatValueDeduction(uiPresentDays || 30) }, // shows '30' or actual paid days
      { label: "", value: "" }
    ],
    [
      { label: "Absent", value: "0.00" },
      { label: "", value: "" },
      { label: "", value: "" }
    ],
    [
      { label: "Compen. Holi", value: "0.00" },
      { label: "", value: "" },
      { label: "", value: "" }
    ],
    [
      { label: "Restricted", value: "0.00" },
      { label: "", value: "" },
      { label: "L2", value: "0.00" }
    ]
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Image style={styles.logo} src={logoUrl} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.companyName}>CLOUDSAT PRIVATE LIMITED</Text>
            <Text style={styles.payslipTitle}>Pay Slip For The Month Of {displayPeriod}</Text>
          </View>
        </View>

        {/* Employee Credentials Table (Department removed to align to 6 rows) */}
        <View style={styles.gridTable}>
          <View style={styles.gridRow}>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Emp Code</Text>
              <Text style={styles.cellValue}>{employee.id || employee.employee_id || "N/A"}</Text>
            </View>
            <View style={styles.gridCellLast}>
              <Text style={styles.cellLabel}>Mode Of Payment</Text>
              <Text style={styles.cellValue}>{employee.modeOfPayment || "NEFT"}</Text>
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Name</Text>
              <Text style={styles.cellValue}>{employee.name || "N/A"}</Text>
            </View>
            <View style={styles.gridCellLast}>
              <Text style={styles.cellLabel}>Bank Name</Text>
              <Text style={styles.cellValue}>{employee.bankName || "Bank Of Baroda"}</Text>
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>F/H Name</Text>
              <Text style={styles.cellValue}>{employee.fatherName || employee.father_name || "N/A"}</Text>
            </View>
            <View style={styles.gridCellLast}>
              <Text style={styles.cellLabel}>A/C No.</Text>
              <Text style={styles.cellValue}>{employee.accountNo || employee.account_no || "N/A"}</Text>
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Desg</Text>
              <Text style={styles.cellValue}>{employee.jobTitle || employee.job_title || "N/A"}</Text>
            </View>
            <View style={styles.gridCellLast}>
              <Text style={styles.cellLabel}>IFSC</Text>
              <Text style={styles.cellValue}>{employee.ifsc || employee.ifsc_code || "N/A"}</Text>
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>PAN NO</Text>
              <Text style={styles.cellValue}>{employee.panNo || employee.pan_no || "N/A"}</Text>
            </View>
            <View style={styles.gridCellLast}>
              <Text style={styles.cellLabel}>DOJ</Text>
              <Text style={styles.cellValue}>{formatDate(employee.joinDate || employee.join_date)}</Text>
            </View>
          </View>
          <View style={styles.gridRowLast}>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>UAN</Text>
              <Text style={styles.cellValue}>{employee.uan || "NA"}</Text>
            </View>
            <View style={styles.gridCellLast}>
              <Text style={styles.cellLabel}></Text>
              <Text style={styles.cellValue}></Text>
            </View>
          </View>
        </View>

        {/* Attendance details Grid */}
        <View style={styles.gridTable}>
          {attendanceRows.map((row, idx) => {
            const isLast = idx === attendanceRows.length - 1;
            return (
              <View key={idx} style={isLast ? styles.gridRowLast : styles.gridRow}>
                <View style={styles.attCell}>
                  <Text style={styles.attLabel}>{row[0].label}</Text>
                  <Text style={styles.attValue}>{row[0].value}</Text>
                </View>
                <View style={styles.attCell}>
                  <Text style={styles.attLabel}>{row[1].label}</Text>
                  <Text style={styles.attValue}>{row[1].value}</Text>
                </View>
                <View style={styles.attCellLast}>
                  <Text style={styles.attLabel}>{row[2].label}</Text>
                  <Text style={styles.attValue}>{row[2].value}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Side-by-Side Earnings and Deductions Table */}
        {/* Table Header */}
        <View style={styles.tableHeaderContainer}>
          {/* Earnings Header Column */}
          <View style={styles.earningsHeaderCol}>
            <Text style={[styles.headerCell, { width: "35%" }]}></Text>
            <Text style={[styles.headerCell, { width: "22%", textAlign: "right" }]}>Rate</Text>
            <Text style={[styles.headerCell, { width: "22%", textAlign: "right" }]}>Earning</Text>
            <Text style={[styles.headerCell, { width: "21%", textAlign: "right" }]}>Arrears</Text>
          </View>
          {/* Deductions Header Column */}
          <View style={styles.deductionsHeaderCol}>
            <Text style={[styles.headerCell, { width: "65%", paddingLeft: 8 }]}>Deductions</Text>
            <Text style={[styles.headerCell, { width: "35%" }]}></Text>
          </View>
        </View>

        {/* Table Body Container */}
        <View style={styles.tableBodyContainer}>
          {/* Earnings Column */}
          <View style={styles.earningsCol}>
            {/* Body */}
            {Array.from({ length: maxRows }).map((_, idx) => {
              const item = earningsList[idx] || {};
              return (
                <View key={idx} style={styles.tableBodyRow}>
                  <Text style={[styles.bodyCellText, styles.colBoldText, { width: "35%" }]}>
                    {item.label || ""}
                  </Text>
                  <Text style={[styles.bodyCellText, styles.colBlueText, { width: "22%", textAlign: "right" }]}>
                    {item.label ? formatValue(item.rate) : ""}
                  </Text>
                  <Text style={[styles.bodyCellText, styles.colBlueText, { width: "22%", textAlign: "right" }]}>
                    {item.label ? displayEarningVal(item.rate, item.earning) : ""}
                  </Text>
                  <Text style={[styles.bodyCellText, styles.colBlueText, { width: "21%", textAlign: "right" }]}>
                    {item.label ? formatValue(item.arrears) : ""}
                  </Text>
                </View>
              );
            })}
            {/* Total Row */}
            <View style={[styles.tableBodyRow, { borderBottomWidth: 0, backgroundColor: "#FFFFFF" }]}>
              <Text style={[styles.bodyCellText, styles.colBoldText, { width: "35%" }]}>Total</Text>
              <Text style={[styles.bodyCellText, styles.colBlueText, { width: "22%", textAlign: "right" }]}>
                {formatValue(totalRate)}
              </Text>
              <Text style={[styles.bodyCellText, styles.colBlueText, { width: "22%", textAlign: "right" }]}>
                {totalEarningDisplay}
              </Text>
              <Text style={[styles.bodyCellText, styles.colBlueText, { width: "21%", textAlign: "right" }]}>
                {formatValue(totalArrears)}
              </Text>
            </View>
          </View>

          {/* Deductions Column */}
          <View style={styles.deductionsCol}>
            {/* Body */}
            {Array.from({ length: maxRows }).map((_, idx) => {
              const item = deductionsList[idx] || {};
              return (
                <View key={idx} style={styles.tableBodyRow}>
                  <Text style={[styles.bodyCellText, styles.colBoldText, { width: "65%", borderLeftWidth: 1, borderLeftColor: "#CBD5E1", paddingLeft: 8 }]}>
                    {item.label || ""}
                  </Text>
                  <Text style={[styles.bodyCellText, styles.colBlueText, { width: "35%", textAlign: "right" }]}>
                    {item.label ? formatValueDeduction(item.amount) : ""}
                  </Text>
                </View>
              );
            })}
            {/* Total Row */}
            <View style={[styles.tableBodyRow, { borderBottomWidth: 0, backgroundColor: "#FFFFFF" }]}>
              <Text style={[styles.bodyCellText, styles.colBoldText, { width: "65%", borderLeftWidth: 1, borderLeftColor: "#CBD5E1", paddingLeft: 8 }]}>
                Total
              </Text>
              <Text style={[styles.bodyCellText, styles.colBlueText, { width: "35%", textAlign: "right" }]}>
                {formatValueDeduction(totalDeductions)}
              </Text>
            </View>
          </View>
        </View>

        {/* Net Salary Row */}
        <View style={styles.netPaySection}>
          <View style={styles.wordsContainer}>
            <Text style={styles.wordsText}>{netPayInWords}</Text>
          </View>
          <View style={styles.netPayBoxContainer}>
            <View style={styles.netPayBox}>
              <Text style={styles.netPayLabel}>Net Payble</Text>
              <Text style={styles.netPayVal}>{formatValue(netPay)}</Text>
            </View>
          </View>
        </View>

        {/* Disclaimer statement kept in main flow, positioned slightly down */}
        <Text style={styles.statementText}>
          This is a computer generated statement, hence no signature required.
        </Text>

        {/* Footer Area - Absolutely positioned at the bottom */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerCompanyName}>CLOUDSAT PRIVATE LIMITED</Text>
          <Text style={styles.footerAddress}>
            Plot No-511, Sarahah Tower, Subhash Nagar, Gurugram, India, Pin-122001
          </Text>
          <Text style={styles.footerEmail}>Email : info@cloudsat.in</Text>
          
          {/* Angled Double Stripe at Bottom */}
          <Svg height="15" width="555" style={{ marginTop: 8 }}>
            <Polygon points="0,0 80,0 60,15 0,15" fill="#EA580C" />
            <Polygon points="80,0 555,0 555,15 60,15" fill="#002FBE" />
          </Svg>
        </View>
      </Page>
    </Document>
  );
};

export const downloadIndividualPayslip = async (employee, payroll) => {
  const blob = await pdf(
    <PayslipDocument employee={employee} payroll={payroll} />,
  ).toBlob();
  saveAs(
    blob,
    `payslip-${employee.id}-${employee.name?.replace(/\s+/g, "_")}.pdf`,
  );
};
