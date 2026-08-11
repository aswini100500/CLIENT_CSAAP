import test from "node:test";
import assert from "node:assert/strict";
import {
  mapPayslipPayload,
  buildPayrollSnapshot,
  numberToWords,
  roundHalfUp,
  formatINR,
  getUiPresentDays,
} from "./payrollUtils.js";

test("mapPayslipPayload - extracts employee & payroll records from structured payroll_snapshot", () => {
  const mockEntry = {
    id: 101,
    employee_id: 26,
    period_month: 4,
    period_year: 2026,
    payroll_snapshot: JSON.stringify({
      employeeDetails: {
        employeeCode: "EMP026",
        employeeName: "Gosantini Meher",
        fatherOrHusbandName: "Ramesh Gosantini",
        designation: "Senior Engineer",
        panNumber: "EKBPM7561M",
        uanNumber: "101928374651",
        dateOfJoining: "2024-03-15",
      },
      bankDetails: {
        paymentMode: "Bank Transfer",
        bankName: "Kotak Mahindra",
        accountNumber: "0914030902",
        ifscCode: "KKBK0007241",
      },
      attendanceSummary: {
        workingDays: 26,
        holidays: 1,
        weeklyOffs: 4,
        lopDays: 1,
        paidLeaveDays: 2,
        fullDayLeaveDays: 0,
        halfDayLeaveDays: 1,
        daysOnDuty: 19,
        paidDays: 21,
        trainingDays: 0,
        leaveBalance: {
          casualLeave: 3,
          earnedLeave: 5,
          medicalLeave: 2,
        },
      },
      earnings: {
        components: [
          { componentName: "Basic Pay", monthlyRate: 30000, amountEarned: 28846.15, arrears: 0 },
          { componentName: "Dearness Allowance", monthlyRate: 3000, amountEarned: 2884.62, arrears: 0 },
          { componentName: "Travel Allowance", monthlyRate: 1600, amountEarned: 1600, arrears: 0 },
          { componentName: "House Rent Allowance", monthlyRate: 6000, amountEarned: 5769.23, arrears: 0 },
          { componentName: "Special Allowance", monthlyRate: 4000, amountEarned: 3846.15, arrears: 0 },
        ],
        grossRate: 44600,
        grossEarnings: 42946.15,
        totalArrears: 0,
      },
      deductions: {
        providentFund: { ratePercent: 12, amount: 3600 },
        employeeStateInsurance: { ratePercent: 0.75, amount: 322 },
        lossOfPay: 1153.85,
        halfDayLossOfPay: 576.92,
        salaryAdvance: {
          totalAdvance: 0,
          amountDeducted: 0,
          amountPending: 0,
          recoveryApplicableMonth: "N/A",
        },
        otherDeductions: [
          { componentName: "Professional Tax", amount: 200 },
          { componentName: "Labor Welfare Fund", amount: 10 },
        ],
        totalDeductions: 5862.77,
      },
      netPay: {
        amount: 37083,
        amountInWords: "Thirty Seven Thousand Eighty Three Rupees",
      },
    }),
  };

  const { employeeRecord, payrollRecord } = mapPayslipPayload(mockEntry);

  assert.equal(employeeRecord.id, "EMP026");
  assert.equal(employeeRecord.name, "Gosantini Meher");
  assert.equal(employeeRecord.fatherName, "Ramesh Gosantini");
  assert.equal(employeeRecord.jobTitle, "Senior Engineer");
  assert.equal(employeeRecord.panNo, "EKBPM7561M");
  assert.equal(employeeRecord.uan, "101928374651");
  assert.equal(employeeRecord.bankName, "Kotak Mahindra");
  assert.equal(employeeRecord.accountNo, "0914030902");
  assert.equal(employeeRecord.ifsc, "KKBK0007241");
  assert.equal(employeeRecord.modeOfPayment, "Bank Transfer");

  assert.equal(payrollRecord.basic, 30000);
  assert.equal(payrollRecord.da, 3000);
  assert.equal(payrollRecord.ta, 1600);
  assert.equal(payrollRecord.hra, 6000);
  assert.equal(payrollRecord.specialAllowance, 4000);
  assert.equal(payrollRecord.baseGross, 44600);
  assert.equal(payrollRecord.gross, 42946.15);

  assert.equal(payrollRecord.epf, 3600);
  assert.equal(payrollRecord.esi, 322);
  assert.equal(payrollRecord.pt, 200);
  assert.equal(payrollRecord.lwf, 10);
  assert.equal(payrollRecord.lopDeduction, 1153.85);
  assert.equal(payrollRecord.halfDayDeduction, 576.92);
  assert.equal(payrollRecord.totalDeductions, 5862.77);
  assert.equal(payrollRecord.netSalary, 37083);
  assert.equal(payrollRecord.netPayInWords, "Thirty Seven Thousand Eighty Three Rupees");

  assert.equal(payrollRecord.workingDays, 26);
  assert.equal(payrollRecord.holidays, 1);
  assert.equal(payrollRecord.weeklyOffs, 4);
  assert.equal(payrollRecord.paidOffs, 2);
  assert.equal(payrollRecord.daysOnDuty, 19);
  assert.equal(payrollRecord.paidDays, 21);
  assert.equal(payrollRecord.trainingDays, 0);
  assert.equal(payrollRecord.clDays, 3);
  assert.equal(payrollRecord.elDays, 5);
  assert.equal(payrollRecord.mlDays, 2);
});

test("mapPayslipPayload - generates snapshot on-the-fly when payroll_snapshot is NULL (legacy record)", () => {
  const legacyEntry = {
    id: 42,
    employee_id: 10,
    employee_name: "Jane Smith",
    job_title: "Product Manager",
    father_name: "John Smith",
    bank_name: "HDFC Bank",
    account_no: "1234567890",
    pan_no: "ABCDE1234F",
    ifsc_code: "HDFC0001234",
    uan: "9876543210",
    mode_of_payment: "NEFT",
    period_month: 3,
    period_year: 2026,
    basic: 20000,
    hra: 4000,
    ta: 1600,
    da: 2000,
    special_allowance: 2400,
    gross_base: 30000,
    gross_earnings: 30000,
    epf: 2400,
    esi: 225,
    pt: 200,
    lwf: 10,
    lop_deduction: 0,
    total_deductions: 2835,
    net_payable: 27165,
    days_present: 22,
    unpaid_leave_days: 0,
    approved_leave_days: 0,
    payroll_snapshot: null,
  };

  const { employeeRecord, payrollRecord } = mapPayslipPayload(legacyEntry);

  assert.equal(employeeRecord.id, "10");
  assert.equal(employeeRecord.name, "Jane Smith");
  assert.equal(employeeRecord.jobTitle, "Product Manager");
  assert.equal(employeeRecord.fatherName, "John Smith");
  assert.equal(employeeRecord.bankName, "HDFC Bank");
  assert.equal(employeeRecord.accountNo, "1234567890");

  assert.equal(payrollRecord.basic, 20000);
  assert.equal(payrollRecord.hra, 4000);
  assert.equal(payrollRecord.gross, 30000);
  assert.equal(payrollRecord.epf, 2400);
  assert.equal(payrollRecord.totalDeductions, 2835);
  assert.equal(payrollRecord.netSalary, 27165);
  assert.equal(payrollRecord.netPayInWords, "Twenty Seven Thousand One Hundred And Sixty Five Rupees");
  assert.ok(payrollRecord.payrollSnapshot);
});

test("buildPayrollSnapshot - constructs complete snapshot structure", () => {
  const entry = {
    employee_id: "EMP100",
    employee_name: "Alice Johnson",
    job_title: "Lead Architect",
    basic: 50000,
    hra: 10000,
    net_payable: 54000,
  };

  const snapshot = buildPayrollSnapshot(entry);

  assert.equal(snapshot.employeeDetails.employeeCode, "EMP100");
  assert.equal(snapshot.employeeDetails.employeeName, "Alice Johnson");
  assert.equal(snapshot.employeeDetails.designation, "Lead Architect");
  assert.equal(snapshot.netPay.amount, 54000);
  assert.equal(snapshot.netPay.amountInWords, "Fifty Four Thousand Rupees");
});

test("numberToWords - converts numbers to Indian verbal format", () => {
  assert.equal(numberToWords(0), "Zero Rupees");
  assert.equal(numberToWords(1500), "One Thousand Five Hundred Rupees");
  assert.equal(numberToWords(37083), "Thirty Seven Thousand Eighty Three Rupees");
  assert.equal(numberToWords(100000), "One Lakh Rupees");
  assert.equal(numberToWords(1250050.50), "Twelve Lakh Fifty Thousand Fifty Point Five Zero Rupees");
  assert.equal(numberToWords("invalid"), "Zero Rupees");
});

test("roundHalfUp - performs 2-decimal half-up rounding", () => {
  assert.equal(roundHalfUp(4166.665), 4166.67);
  assert.equal(roundHalfUp(4166.664), 4166.66);
  assert.equal(roundHalfUp(0), 0);
  assert.equal(roundHalfUp(null), 0);
  assert.equal(roundHalfUp(undefined), 0);
});

test("formatINR - formats numbers as Indian Rupee strings", () => {
  const result = formatINR(13146.666);
  assert.ok(result.includes("13,146.67"));
});

test("getUiPresentDays - sums present, late, and half days", () => {
  assert.equal(getUiPresentDays({ daysPresent: 20, lateDays: 2, halfDays: 1 }), 23);
  assert.equal(getUiPresentDays({ days_present: 15, late_days: 1, half_days: 2 }), 18);
  assert.equal(getUiPresentDays({}), 0);
});
