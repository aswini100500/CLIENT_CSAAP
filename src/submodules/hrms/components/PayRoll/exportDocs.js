import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { getUiPresentDays } from "./payrollUtils";

export const downloadPayrollExcel = (payrollRecords = []) => {
  const rows = payrollRecords.map((record) => {
    const p = record.payroll || {};
    return {
      "Employee ID": record.id,
      Name: record.name,
      Department: record.department || "N/A",
      "Job Title": record.jobTitle || "N/A",
      "Annual CTC": p.annualCTC,
      "Monthly Basic": p.basic,
      "Monthly HRA": p.hra,
      "Monthly TA": p.ta,
      "Monthly DA": p.da,
      "Monthly Special Allowance": p.specialAllowance,
      "Monthly Gross": p.gross,
      EPF: p.epf,
      ESI: p.esi,
      "Professional Tax": p.pt,
      TDS: p.tds,
      "Total Deductions": p.totalDeductions,
      "Net Salary": p.netSalary,
      "Days Present": getUiPresentDays(p),
      "Late Days": p.lateDays,
      "Half Days": p.halfDays,
      "OT Hours": p.otHoursDecimal,
      "Approved Leaves": p.leaveDays,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  saveAs(
    new Blob([excelBuffer], { type: "application/octet-stream" }),
    `payroll-${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};

export const downloadBankTransferFile = (payrollRecords = []) => {
  const csvData = ["Employee ID,Employee Name,Department,Net Salary"];

  payrollRecords.forEach((record) => {
    const p = record.payroll || {};
    csvData.push(
      `${record.id},"${record.name}","${record.department || "N/A"}",${p.netSalary}`,
    );
  });

  const csvContent = csvData.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `bank-transfer-${new Date().toISOString().split("T")[0]}.csv`);
};
