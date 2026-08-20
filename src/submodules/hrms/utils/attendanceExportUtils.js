import * as XLSX from "xlsx";

/**
 * Format duration from seconds to readable string "Xh Ym"
 */
export function formatDurationFromSeconds(seconds) {
  if (!seconds || isNaN(Number(seconds)) || Number(seconds) <= 0) {
    return "0h 0m";
  }
  const safeSec = Math.floor(Number(seconds));
  const h = Math.floor(safeSec / 3600);
  const m = Math.floor((safeSec % 3600) / 60);
  return `${h}h ${m}m`;
}

/**
 * Formats an individual attendance record into a normalized object for tabular export
 */
export function formatAttendanceRecordForExport(record) {
  const isHalfDay = Number(record.is_half_day || record.rawData?.is_half_day || 0) === 1;
  const isLate = Number(record.is_late || record.rawData?.is_late || 0) === 1;
  const isEarlyLeave = Number(record.is_early_leave || record.rawData?.is_early_leave || 0) === 1;
  
  const breakSeconds = Number(
    record.total_break_seconds ??
    record.rawData?.total_break_seconds ??
    0
  );

  return {
    "Employee ID": record.employee_id || record.rawData?.employee_id || "N/A",
    "Employee Name": record.name || record.employee_name || record.rawData?.employee_name || "Unknown",
    "Department": record.department || record.rawData?.department || "N/A",
    "Branch": record.branch_name || record.rawData?.branch_name || "Unassigned",
    "Date": record.date || record.attendance_date || record.rawData?.attendance_date || "N/A",
    "Shift": record.shift || record.shift_name || record.rawData?.shift_name || "General",
    "Check In": record.mispunch_time || record.checkInTime || record.rawData?.mispunch_time || "--:--",
    "Check Out": record.leave_time || record.checkOutTime || record.rawData?.leave_time || "--:--",
    "Break Duration": formatDurationFromSeconds(breakSeconds),
    "Net Worked Hours": record.total_hours || record.totalHours || record.rawData?.total_hours || "--:--",
    "Status": isHalfDay ? "Half Day" : "Present",
    "Late": isLate ? "Yes" : "No",
    "Late Reason": record.reason || record.rawData?.reason || "",
    "Early Leave": isEarlyLeave ? "Yes" : "No",
    "Overtime": record.overtime || record.rawData?.overtime || "0h 0m",
    "Timesheet Notes": record.timesheet_details || record.timesheetDetails || record.rawData?.timesheet_details || "",
  };
}

/**
 * Export attendance rows to a downloadable CSV file
 */
export function exportAttendanceToCsv(records, filename = "attendance_report.csv") {
  if (!Array.isArray(records) || records.length === 0) return false;

  const formattedRows = records.map(formatAttendanceRecordForExport);
  const worksheet = XLSX.utils.json_to_sheet(formattedRows);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Export attendance rows to a downloadable Excel (.xlsx) file
 */
export function exportAttendanceToExcel(records, filename = "attendance_report.xlsx", sheetName = "Attendance") {
  if (!Array.isArray(records) || records.length === 0) return false;

  const formattedRows = records.map(formatAttendanceRecordForExport);
  const worksheet = XLSX.utils.json_to_sheet(formattedRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
  return true;
}
