const UNITS = [
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

const TENS = [
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
  if (n < 20) return UNITS[n];
  if (n < 100) {
    const tens = TENS[Math.floor(n / 10)];
    const rem = n % 10;
    return rem !== 0 ? `${tens} ${UNITS[rem]}` : tens;
  }
  const hundreds = UNITS[Math.floor(n / 100)];
  const rem = n % 100;
  return rem !== 0
    ? `${hundreds} Hundred And ${convertLessThanThousand(rem)}`
    : `${hundreds} Hundred`;
};

const convertIntegerToWords = (n) => {
  if (n === 0) return "Zero";

  const crore = Math.floor(n / 10000000);
  let rem = n % 10000000;

  const lakh = Math.floor(rem / 100000);
  rem %= 100000;

  const thousand = Math.floor(rem / 1000);
  rem %= 1000;

  const parts = [];

  if (crore > 0) parts.push(`${convertLessThanThousand(crore)} Crore`);
  if (lakh > 0) parts.push(`${convertLessThanThousand(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${convertLessThanThousand(thousand)} Thousand`);
  if (rem > 0) parts.push(convertLessThanThousand(rem));

  return parts.join(" ");
};

export const numberToWords = (amount) => {
  const num = Number(amount);
  if (Number.isNaN(num)) return "Zero Rupees";

  const absNum = Math.abs(num);
  const intPart = Math.floor(absNum);
  const decStr = absNum.toFixed(2).split(".")[1];
  const decPart = Number(decStr);

  let words = convertIntegerToWords(intPart);

  if (decPart > 0) {
    const digitWords = {
      "0": "Zero",
      "1": "One",
      "2": "Two",
      "3": "Three",
      "4": "Four",
      "5": "Five",
      "6": "Six",
      "7": "Seven",
      "8": "Eight",
      "9": "Nine",
    };
    const decWords = decStr
      .split("")
      .map((d) => digitWords[d])
      .join(" ");
    words += ` Point ${decWords}`;
  }

  return `${words} Rupees`;
};

const formatSnapshotDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) {
    return val.toISOString().split("T")[0];
  }
  const str = String(val).trim();
  if (!str || str === "N/A" || str === "null" || str === "undefined")
    return null;
  return str.split("T")[0];
};

export const buildPayrollSnapshot = (entry = {}) => {
  const breakdown = safeJsonParse(entry.attendance_breakdown, {}) || {};
  const leaveBalance = entry.leave_balance || breakdown.leave_balance || null;

  // 1. Employee Details
  const employeeDetails = {
    employeeCode: String(
      entry.registered_emp_id ||
        entry.employee_code ||
        entry.employee_id ||
        entry.id ||
        "N/A",
    ),
    employeeName: entry.employee_name || entry.name || "N/A",
    fatherOrHusbandName:
      entry.fatherName ||
      entry.father_name ||
      entry.fatherOrHusbandName ||
      "N/A",
    designation:
      entry.jobTitle || entry.job_title || entry.designation || "N/A",
    panNumber: entry.panNo || entry.pan_no || entry.panNumber || "N/A",
    uanNumber: entry.epfo_id || entry.uan || entry.uanNumber || "N/A",
    dateOfJoining: formatSnapshotDate(
      entry.joinDate || entry.join_date || entry.dateOfJoining,
    ),
  };

  // 2. Bank Details
  const bankDetails = {
    paymentMode: entry.mode_of_payment || entry.paymentMode || "Bank Transfer",
    bankName: entry.bankname || entry.bank_name || entry.bankName || "N/A",
    accountNumber:
      entry.accountnumber || entry.account_no || entry.accountNumber || "N/A",
    ifscCode: entry.ifsc_code || entry.ifscCode || "N/A",
  };

  // 3. Attendance Summary
  const attendanceSummary = {
    workingDays: Number(breakdown.working_days ?? entry.working_days ?? 0),
    holidays: Number(breakdown.holidays ?? entry.holidays ?? 0),
    weeklyOffs: Number(breakdown.weekly_offs ?? entry.weekly_offs ?? 0),
    lopDays: Number(
      breakdown.without_pay ?? entry.unpaid_leave_days ?? entry.lop_days ?? 0,
    ),
    paidLeaveDays: Number(
      breakdown.paid_offs ?? entry.approved_leave_days ?? 0,
    ),
    fullDayLeaveDays: Number(
      breakdown.full_day_leave ?? entry.unpaid_leave_days ?? 0,
    ),
    halfDayLeaveDays: Number(
      breakdown.half_day_leave ?? entry.half_days ?? 0,
    ),
    daysOnDuty: Number(breakdown.on_duty ?? entry.days_present ?? 0),
    paidDays: Number(breakdown.paid_days ?? 0),
    trainingDays: Number(entry.training_days ?? breakdown.training_days ?? 0),
    leaveBalance: leaveBalance
      ? {
          casualLeave: Number(
            leaveBalance.monthly_remaining_CL ??
              leaveBalance.casualLeave ??
              leaveBalance.yearly_remaining_CL ??
              0,
          ),
          earnedLeave: Number(
            leaveBalance.monthly_remaining_EL ??
              leaveBalance.earnedLeave ??
              leaveBalance.yearly_remaining_EL ??
              0,
          ),
          medicalLeave: Number(
            leaveBalance.monthly_remaining_ML ??
              leaveBalance.medicalLeave ??
              leaveBalance.yearly_remaining_ML ??
              0,
          ),
        }
      : {
          casualLeave: 0,
          earnedLeave: 0,
          medicalLeave: 0,
        },
  };

  // 4. Earnings
  const attendanceRatio =
    entry.attendance_ratio !== undefined && entry.attendance_ratio !== null
      ? Number(entry.attendance_ratio)
      : 1;

  const basicRate = roundHalfUp(entry.basic || 0);
  const hraRate = roundHalfUp(entry.hra || 0);
  const taRate = roundHalfUp(entry.ta || 0);
  const daRate = roundHalfUp(entry.da || 0);
  const saRate = roundHalfUp(entry.special_allowance || 0);

  const earningsComponents = [
    {
      componentName: "Basic Pay",
      monthlyRate: basicRate,
      amountEarned: roundHalfUp(basicRate * attendanceRatio),
      arrears: 0.0,
    },
    {
      componentName: "Dearness Allowance",
      monthlyRate: daRate,
      amountEarned: roundHalfUp(daRate * attendanceRatio),
      arrears: 0.0,
    },
    {
      componentName: "Travel Allowance",
      monthlyRate: taRate,
      amountEarned: roundHalfUp(taRate * attendanceRatio),
      arrears: 0.0,
    },
    {
      componentName: "House Rent Allowance",
      monthlyRate: hraRate,
      amountEarned: roundHalfUp(hraRate * attendanceRatio),
      arrears: 0.0,
    },
    {
      componentName: "Special Allowance",
      monthlyRate: saRate,
      amountEarned: roundHalfUp(saRate * attendanceRatio),
      arrears: 0.0,
    },
  ];

  const extraEarnings = safeJsonParse(entry.extra_earnings, []) || [];
  if (Array.isArray(extraEarnings)) {
    extraEarnings.forEach((item) => {
      earningsComponents.push({
        componentName: item.componentName || item.name || "Extra Earning",
        monthlyRate: roundHalfUp(item.monthlyRate || item.amount || 0),
        amountEarned: roundHalfUp(item.amountEarned || item.amount || 0),
        arrears: roundHalfUp(item.arrears || 0),
      });
    });
  }

  if (entry.ot_pay && Number(entry.ot_pay) > 0) {
    earningsComponents.push({
      componentName: "Overtime Pay",
      monthlyRate: roundHalfUp(entry.ot_pay),
      amountEarned: roundHalfUp(entry.ot_pay),
      arrears: 0.0,
    });
  }

  const grossRate = roundHalfUp(
    entry.gross_base || basicRate + hraRate + taRate + daRate + saRate,
  );
  const grossEarnings = roundHalfUp(entry.gross_earnings || 0);

  const earnings = {
    components: earningsComponents,
    grossRate,
    grossEarnings,
    totalArrears: 0.0,
  };

  // 5. Deductions
  const otherDeductions = [];

  const ptAmount = roundHalfUp(entry.pt || 0);
  if (ptAmount > 0) {
    otherDeductions.push({
      componentName: "Professional Tax",
      amount: ptAmount,
    });
  }

  const lwfAmount = roundHalfUp(entry.lwf || 0);
  if (lwfAmount > 0) {
    otherDeductions.push({
      componentName: "Labor Welfare Fund",
      amount: lwfAmount,
    });
  }

  const extraDeductions = safeJsonParse(entry.extra_deductions, []) || [];
  if (Array.isArray(extraDeductions)) {
    extraDeductions.forEach((item) => {
      otherDeductions.push({
        componentName: item.componentName || item.name || "Extra Deduction",
        amount: roundHalfUp(item.amount || 0),
      });
    });
  }

  const deductions = {
    providentFund: {
      ratePercent: Number(entry.epf_rate || 12),
      amount: roundHalfUp(entry.epf || 0),
    },
    employeeStateInsurance: {
      ratePercent: Number(entry.esi_rate || 0.75),
      amount: roundHalfUp(entry.esi || 0),
    },
    lossOfPay: roundHalfUp(entry.lop_deduction || 0),
    halfDayLossOfPay: roundHalfUp(entry.half_day_deduction || 0),
    salaryAdvance: {
      totalAdvance: Number(entry.salary_advance?.totalAdvance || 0),
      amountDeducted: Number(entry.salary_advance?.amountDeducted || 0),
      amountPending: Number(entry.salary_advance?.amountPending || 0),
      recoveryApplicableMonth:
        entry.salary_advance?.recoveryApplicableMonth || "N/A",
    },
    otherDeductions,
    totalDeductions: roundHalfUp(entry.total_deductions || 0),
  };

  // 6. Net Pay (Rounded off to whole rupees)
  const netPayAmount = Math.round(Number(entry.net_payable) || 0);
  const netPay = {
    amount: netPayAmount,
    amountInWords: numberToWords(netPayAmount),
  };

  return {
    employeeDetails,
    bankDetails,
    attendanceSummary,
    earnings,
    deductions,
    netPay,
  };
};

export const roundHalfUp = (num, decimals = 2) => {
  if (num === null || num === undefined || num === "") return 0;
  const n = Number(num);
  if (Number.isNaN(n)) return 0;
  return Number(Math.round(Number(n + "e" + decimals)) + "e-" + decimals);
};

export const getUiPresentDays = (value = {}) => {
  const daysPresent = Number(value.daysPresent ?? value.days_present) || 0;
  const lateDays = Number(value.lateDays ?? value.late_days) || 0;
  const halfDays = Number(value.halfDays ?? value.half_days) || 0;

  return daysPresent + lateDays + halfDays;
};

export const formatINR = (amount) => {
  const rounded = roundHalfUp(amount, 2);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rounded);
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const safeJsonParse = (val, fallback = null) => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

export const formatDate = (dateStr) => {
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

export const mapPayslipPayload = (entry) => {
  if (!entry) return { employeeRecord: {}, payrollRecord: {} };

  const snapshot = safeJsonParse(entry.payroll_snapshot, null) || buildPayrollSnapshot(entry);

  const empDetails = snapshot.employeeDetails || {};
  const bankDetails = snapshot.bankDetails || {};
  const attSummary = snapshot.attendanceSummary || {};
  const earningsSnap = snapshot.earnings || {};
  const deductionsSnap = snapshot.deductions || {};
  const netPaySnap = snapshot.netPay || {};

  const periodMonth = parseInt(entry.period_month, 10) || 1;
  const periodYear = parseInt(entry.period_year, 10) || new Date().getFullYear();
  const monthName = MONTH_NAMES[periodMonth - 1] || "January";

  const otherComps = safeJsonParse(entry.other_components, []);
  const extraEarns = safeJsonParse(entry.extra_earnings, []);
  const extraDeds = safeJsonParse(entry.extra_deductions, []);

  const latePenaltyEntries = extraDeds.filter(
    (deduction) => deduction?.system_key === "late_penalty"
  );
  const latePenaltyDeduction = latePenaltyEntries.reduce(
    (total, deduction) => total + (parseFloat(deduction.amount) || 0),
    0
  );
  const latePenaltyHalfDays = latePenaltyEntries.reduce(
    (total, deduction) => total + (parseFloat(deduction.units) || 0),
    0
  );
  const filteredExtraDeds = extraDeds.filter(
    (deduction) => deduction?.system_key !== "late_penalty"
  );

  const getEarningComponentRate = (compName) => {
    if (!earningsSnap.components) return null;
    const item = earningsSnap.components.find((c) => c.componentName === compName);
    return item ? parseFloat(item.monthlyRate) : null;
  };

  const getDeductionComponentAmount = (compName) => {
    if (!deductionsSnap.otherDeductions) return null;
    const item = deductionsSnap.otherDeductions.find((d) => d.componentName === compName);
    return item ? parseFloat(item.amount) : null;
  };

  const basic = getEarningComponentRate("Basic Pay") ?? (parseFloat(entry.basic) || 0);
  const hra = getEarningComponentRate("House Rent Allowance") ?? (parseFloat(entry.hra) || 0);
  const ta = getEarningComponentRate("Travel Allowance") ?? (parseFloat(entry.ta) || 0);
  const da = getEarningComponentRate("Dearness Allowance") ?? (parseFloat(entry.da) || 0);
  const specialAllowance = getEarningComponentRate("Special Allowance") ?? (parseFloat(entry.special_allowance) || 0);

  const baseGross = earningsSnap.grossRate !== undefined
    ? parseFloat(earningsSnap.grossRate)
    : (parseFloat(entry.gross_base) || (basic + hra + ta + da + specialAllowance));

  const gross = earningsSnap.grossEarnings !== undefined
    ? parseFloat(earningsSnap.grossEarnings)
    : (parseFloat(entry.gross_earnings) || baseGross);

  const epf = deductionsSnap.providentFund?.amount !== undefined
    ? parseFloat(deductionsSnap.providentFund.amount)
    : (parseFloat(entry.epf) || 0);

  const esi = deductionsSnap.employeeStateInsurance?.amount !== undefined
    ? parseFloat(deductionsSnap.employeeStateInsurance.amount)
    : (parseFloat(entry.esi) || 0);

  const pt = getDeductionComponentAmount("Professional Tax") ?? (parseFloat(entry.pt) || 0);
  const lwf = getDeductionComponentAmount("Labor Welfare Fund") ?? (parseFloat(entry.lwf) || 0);
  const lopDeduction = deductionsSnap.lossOfPay !== undefined
    ? parseFloat(deductionsSnap.lossOfPay)
    : (parseFloat(entry.lop_deduction) || 0);
  const halfDayDeduction = deductionsSnap.halfDayLossOfPay !== undefined
    ? parseFloat(deductionsSnap.halfDayLossOfPay)
    : (parseFloat(entry.half_day_deduction) || 0);

  const totalDeductions = deductionsSnap.totalDeductions !== undefined
    ? parseFloat(deductionsSnap.totalDeductions)
    : (parseFloat(entry.total_deductions) || 0);

  const netSalary = netPaySnap.amount !== undefined
    ? parseFloat(netPaySnap.amount)
    : (parseFloat(entry.net_payable) || 0);

  const daysInMonth = new Date(periodYear, periodMonth, 0).getDate();
  const periodStr = `${monthName.slice(0, 3)} 1 - ${monthName.slice(0, 3)} ${daysInMonth}, ${periodYear}`;

  const pickField = (snapVal, entryVal) => {
    if (snapVal !== undefined && snapVal !== null && snapVal !== "" && snapVal !== "N/A") {
      return snapVal;
    }
    return entryVal || null;
  };

  const employeeRecord = {
    id: pickField(empDetails.employeeCode, entry.registered_emp_id || entry.employee_id || entry.id),
    name: pickField(empDetails.employeeName, entry.employee_name),
    department: entry.department || null,
    jobTitle: pickField(empDetails.designation, entry.job_title),
    email: entry.office_email || entry.email || null,
    joinDate: pickField(empDetails.dateOfJoining, entry.join_date),
    fatherName: pickField(empDetails.fatherOrHusbandName, entry.father_name),
    bankName: pickField(bankDetails.bankName, entry.bank_name),
    accountNo: pickField(bankDetails.accountNumber, entry.account_no),
    panNo: pickField(empDetails.panNumber, entry.pan_no),
    ifsc: pickField(bankDetails.ifscCode, entry.ifsc_code),
    uan: pickField(empDetails.uanNumber, entry.uan),
    modeOfPayment: pickField(bankDetails.paymentMode, entry.mode_of_payment || "NEFT"),
    month: periodMonth,
    year: periodYear,
  };

  const ab = safeJsonParse(entry.attendance_breakdown, {});

  const holidays = attSummary.holidays ?? (ab.holidays ?? (Array.isArray(entry.holiday_dates) ? entry.holiday_dates.length : 0));
  const weeklyOffs = attSummary.weeklyOffs ?? (ab.weekly_offs ?? 4);
  const workingDays = attSummary.workingDays ?? (ab.working_days ?? Math.max(0, daysInMonth - weeklyOffs - holidays));
  const paidOffs = attSummary.paidLeaveDays ?? (ab.paid_offs ?? (parseInt(entry.approved_leave_days) || 0));
  const fullDayLeave = attSummary.fullDayLeaveDays ?? (ab.full_day_leave ?? (parseInt(entry.unpaid_leave_days) || 0));
  const halfDayLeave = attSummary.halfDayLeaveDays ?? (ab.half_day_leave ?? (parseInt(entry.half_days) || 0));
  const clDays = attSummary.leaveBalance?.casualLeave ?? (ab.cl_days ?? 0);
  const elDays = attSummary.leaveBalance?.earnedLeave ?? (ab.el_days ?? 0);
  const mlDays = attSummary.leaveBalance?.medicalLeave ?? (ab.ml_days ?? 0);
  const lopDays = attSummary.lopDays ?? (parseInt(entry.unpaid_leave_days) || 0);

  const daysOnDuty = attSummary.daysOnDuty ?? (parseInt(entry.days_present) || 0);
  const paidDays = attSummary.paidDays ?? (parseInt(entry.days_paid) || Math.max(0, workingDays + weeklyOffs + holidays - lopDays));
  const trainingDays = attSummary.trainingDays ?? (parseInt(entry.training_days) || 0);

  const payrollRecord = {
    periodMonth,
    periodYear,
    month: periodMonth,
    year: periodYear,
    monthName,
    period: periodStr,
    annualCTC: (parseFloat(entry.ctc) || 0) * 12,
    monthlyCTC: parseFloat(entry.ctc) || 0,
    basic,
    hra,
    ta,
    da,
    specialAllowance,
    baseGross,
    gross,
    epf,
    esi,
    pt,
    lwf,
    tds: parseFloat(entry.tds) || 0,
    totalDeductions,
    netSalary,
    netPayInWords: netPaySnap.amountInWords || null,
    daysPresent: daysOnDuty,
    daysOnDuty,
    paidDays,
    trainingDays,
    lateDays: parseInt(entry.late_days) || 0,
    halfDays: attSummary.halfDayLeaveDays !== undefined ? attSummary.halfDayLeaveDays : (parseInt(entry.half_days) || 0),
    uiPresentDays: getUiPresentDays(entry),
    leaveDays: attSummary.paidLeaveDays !== undefined ? attSummary.paidLeaveDays : (parseInt(entry.approved_leave_days) || 0),
    lopDays,
    lopDeduction,
    halfDayDeduction,
    latePenaltyDeduction,
    latePenaltyHalfDays,
    workingDays,
    weeklyOffs,
    holidays,
    paidOffs,
    fullDayLeave,
    halfDayLeave,
    clDays,
    elDays,
    mlDays,
    otHoursDecimal: parseFloat(entry.total_ot_hours) || 0,
    otPay: parseFloat(entry.ot_pay) || 0,
    paymentStatus: entry.payment_status || "paid",
    runStatus: entry.run_status || "PAID",
    taxRegime: entry.tax_regime || "NEW",
    otherComponents: otherComps,
    extraEarnings: extraEarns,
    extraDeductions: filteredExtraDeds,
    attendanceBreakdown: ab,
    payrollSnapshot: snapshot,
  };

  return { employeeRecord, payrollRecord };
};
