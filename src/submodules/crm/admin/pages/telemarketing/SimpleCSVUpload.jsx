import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../../../api";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Upload,
  User,
} from "lucide-react";
import { usePermission } from "../../../../../hooks/usePermission";
import useAuth from "../../../../../hooks/useAuth";

const HEADER_ALIASES = {
  name: ["name", "full name", "customer name", "lead name"],
  first_name: ["first name", "firstname", "first_name", "fname"],
  last_name: ["last name", "lastname", "last_name", "lname"],
  phone: [
    "phone",
    "phone number",
    "mobile",
    "mobile number",
    "contact no",
    "contact number",
  ],
  email: ["email", "email address", "mail"],
  source: ["source", "lead source"],
  location: ["location", "city", "address"],
  assigned_to: ["assigned_to", "assigned to", "assignee", "assigned_to_name"],
};

const REQUIRED_FIELDS = ["name", "phone"];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const normalizeHeader = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const parseCsvLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const parseCsv = (text) => {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, headerIndex) => {
      row[header] = values[headerIndex] ?? "";
    });

    row.__rowNumber = index + 2;
    return row;
  });

  return { headers, rows };
};

const buildHeaderMap = (headers) => {
  const normalizedHeaders = headers.map((header) => ({
    original: header,
    normalized: normalizeHeader(header),
  }));

  return Object.entries(HEADER_ALIASES).reduce(
    (accumulator, [field, aliases]) => {
      const match = normalizedHeaders.find(({ normalized }) =>
        aliases.includes(normalized),
      );
      accumulator[field] = match?.original || null;
      return accumulator;
    },
    {},
  );
};

const toTitleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const buildLeadFromRow = (row, headerMap) => {
  const getValue = (field) => {
    const header = headerMap[field];
    return header ? String(row[header] || "").trim() : "";
  };

  const explicitName = getValue("name");
  const firstName = getValue("first_name");
  const lastName = getValue("last_name");
  const name = explicitName || [firstName, lastName].filter(Boolean).join(" ");

  return {
    rowNumber: row.__rowNumber,
    name: toTitleCase(name),
    phone: getValue("phone"),
    email: getValue("email").toLowerCase(),
    source: getValue("source") || null,
    location: getValue("location") || null,
    assigned_to: getValue("assigned_to") || null,
  };
};

const getRowIssues = (lead) => {
  const issues = [];

  REQUIRED_FIELDS.forEach((field) => {
    if (!lead[field]) {
      issues.push(`${field} is required`);
    }
  });

  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    issues.push("email format is invalid");
  }

  return issues;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const units = ["Bytes", "KB", "MB", "GB"];
  const power = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** power).toFixed(2)} ${units[power]}`;
};

const downloadBlob = (content, fileName, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const convertRowsToCsv = (rows) => {
  if (!rows.length) {
    return "";
  }

  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row || {}).forEach((key) => set.add(key));
      return set;
    }, new Set()),
  );

  const escapeValue = (value) => {
    const stringValue =
      value === undefined || value === null ? "" : String(value);
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  return [
    headers.map(escapeValue).join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeValue(row?.[header])).join(","),
    ),
  ].join("\n");
};

const SimpleCSVUpload = () => {
  const { has } = usePermission();
  const canUpload = has("crm.upload.create");

  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [validationErrors, setValidationErrors] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadSummary, setUploadSummary] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  const { token: authToken, user: authUser } = useAuth();

  useEffect(() => {
    const revealTimer = setTimeout(() => {
      setContentVisible(true);
    }, 40);

    return () => clearTimeout(revealTimer);
  }, []);

  useEffect(() => {
    if (uploadStatus !== "success") {
      return undefined;
    }

    const successTimer = setTimeout(() => {
      setUploadStatus(null);
      setUploadMessage("");
      setUploadSummary(null);
    }, 3000);

    return () => clearTimeout(successTimer);
  }, [uploadStatus]);

  const invalidRowsForDownload = useMemo(() => {
    if (uploadSummary?.rejectedRows?.length) {
      return uploadSummary.rejectedRows.map((row) => ({
        ...(row.originalData || {}),
        row_number: row.rowNumber,
        error_reason: row.reason,
      }));
    }

    if (validationErrors.length && previewRows.length) {
      return validationErrors.map((row) => {
        const previewRow = previewRows.find(
          (item) => item.rowNumber === row.rowNumber,
        );
        return {
          ...(previewRow || {}),
          row_number: row.rowNumber,
          error_reason: Array.isArray(row.issues)
            ? row.issues.join("; ")
            : row.reason,
        };
      });
    }

    return [];
  }, [previewRows, uploadSummary, validationErrors]);

  const ROWS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(previewRows.length / ROWS_PER_PAGE));
  const paginatedPreviewRows = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return previewRows.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [currentPage, previewRows]);

  const handleDownloadTemplate = () => {
    const headers = [
      "Name",
      "Phone",
      "Email",
      "Source",
      "Location",
      "Assigned To",
    ];

    const sampleRows = [
      [
        "Amit Sharma",
        "9876543210",
        "amit@example.com",
        "Website",
        "Mumbai",
        "Aarav Patel",
      ],
      ["Neha Verma", "9988776655", "neha@example.com", "Referral", "Delhi", ""],
    ];

    downloadBlob(
      [headers.join(","), ...sampleRows.map((row) => row.join(","))].join("\n"),
      "lead-import-template.csv",
      "text/csv;charset=utf-8;",
    );
  };

  const resetStateForNewFile = () => {
    setCurrentPage(1);
    setPreviewRows([]);
    setValidationErrors([]);
    setUploadSummary(null);
    setUploadStatus(null);
    setUploadMessage("");
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    resetStateForNewFile();

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xls", "xlsx"].includes(extension || "")) {
      setSelectedFile(null);
      setUploadStatus("error");
      setUploadMessage("Only CSV and Excel files are supported.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setUploadStatus("error");
      setUploadMessage("File must be smaller than 20 MB.");
      return;
    }

    setSelectedFile(file);

    if (extension !== "csv") {
      setPreviewRows([]);
      setValidationErrors([]);
      return;
    }

    try {
      const text = await file.text();
      const { headers, rows } = parseCsv(text);

      if (headers.length === 0 || rows.length === 0) {
        throw new Error("The file is empty or missing data rows.");
      }

      const headerMap = buildHeaderMap(headers);
      const hasName =
        headerMap.name || (headerMap.first_name && headerMap.last_name);
      const missingRequired = [
        ...(!hasName ? ["name"] : []),
        ...(!headerMap.phone ? ["phone"] : []),
      ];

      if (missingRequired.length > 0) {
        throw new Error(
          `Missing required columns: ${missingRequired.join(", ")}`,
        );
      }

      const leads = rows.map((row) => buildLeadFromRow(row, headerMap));
      const issues = leads
        .map((lead) => ({
          rowNumber: lead.rowNumber,
          issues: getRowIssues(lead),
        }))
        .filter((row) => row.issues.length > 0);

      setPreviewRows(leads);
      setCurrentPage(1);
      setValidationErrors(issues);
      setUploadStatus(issues.length > 0 ? "error" : null);
      setUploadMessage(
        issues.length > 0
          ? `${issues.length} row(s) need attention before import.`
          : "",
      );
    } catch (error) {
      setSelectedFile(null);
      setPreviewRows([]);
      setUploadStatus("error");
      setUploadMessage(error.message || "Unable to read this file.");
    }
  };

  const handleUpload = async () => {
    if (!authToken || !authUser?.company_id || !authUser?.slug) {
      setUploadStatus("error");
      setUploadMessage(
        "Login context is missing. Please sign in again before importing leads.",
      );
      return;
    }

    if (!selectedFile) {
      setUploadStatus("error");
      setUploadMessage("Choose a file before starting the import.");
      return;
    }

    if (
      selectedFile.name.toLowerCase().endsWith(".csv") &&
      validationErrors.length > 0
    ) {
      setUploadStatus("error");
      setUploadMessage("Fix the invalid rows in the file before importing.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus("uploading");
      setUploadMessage("Importing leads into the new leads backend...");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("company_id", authUser.company_id);
      formData.append("company_slug", authUser.slug);

      const response = await api.post("/api/leads/import", formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const summary = response.data?.data || {};
      setUploadSummary(summary);
      setUploadStatus(summary.rejected > 0 ? "warning" : "success");
      setUploadMessage(
        response.data?.message || "Lead import completed successfully.",
      );
      setSelectedFile(null);
      setPreviewRows([]);
      setCurrentPage(1);
      setValidationErrors(summary.rejectedRows || []);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage(
        error.response?.data?.message ||
          "Lead import failed. Please try again.",
      );
      setUploadSummary(error.response?.data?.data || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadInvalidRows = () => {
    if (!invalidRowsForDownload.length) {
      return;
    }

    const csvContent = convertRowsToCsv(invalidRowsForDownload);
    downloadBlob(
      csvContent,
      "invalid-lead-rows.csv",
      "text/csv;charset=utf-8;",
    );
  };

  return (
    <div
      className={`app-shell p-4 transition-all duration-400 ease-out ${
        contentVisible
          ? "opacity-100 blur-0 translate-y-0"
          : "opacity-0 blur-sm translate-y-2"
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="app-title mb-1">Upload Leads</h1>
              <p className="app-subtitle">
                Upload your file and import your leads in one step
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
              <button
                onClick={handleDownloadTemplate}
                className="app-btn-secondary px-3 py-1.5 active:scale-[0.98] flex items-center text-[13px]"
              >
                <Download className="size-3.5  mr-1.5 text-(--text-soft)" />
                Download template
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="app-panel p-4">
            <div className="mb-4">
              <h2 className="app-heading">Upload File</h2>
              <p className="mt-1 app-subtitle">
                Use a `.csv`, `.xls`, or `.xlsx` file with lead details.
              </p>
            </div>

            <label
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-(--border-soft) bg-(--bg-subtle) px-6 py-10 text-center transition-all duration-200 hover:border-(--brand) hover:bg-white ${!canUpload ? "pointer-events-none opacity-50" : ""}`}
            >
              <div className="p-2 bg-(--brand-soft) rounded-xl border border-(--border-soft) mb-3">
                <Upload className="size-4 text-(--brand)" />
              </div>
              <span className="text-[14px] font-medium text-(--text-strong)">
                Choose file
              </span>
              <span className="mt-1 text-[12px] text-(--text-soft)">
                CSV, XLS, or XLSX up to 20 MB
              </span>
              <input
                ref={inputRef}
                type="file"
                disabled={!canUpload}
                accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-(--border-soft) bg-(--bg-subtle)/70 px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText className="size-4 text-(--text-soft)" />
                <div>
                  <div className="text-[13px] font-medium text-(--text-strong)">
                    {selectedFile ? selectedFile.name : "No file selected"}
                  </div>
                  <div className="text-[12px] text-(--text-soft)">
                    {selectedFile
                      ? formatFileSize(selectedFile.size)
                      : "Upload a file to begin import"}
                  </div>
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={
                  isUploading ||
                  !selectedFile ||
                  validationErrors.length > 0 ||
                  !canUpload
                }
                className={`px-3 py-1.5 rounded-md active:scale-[0.98] transition-all duration-200 flex items-center text-[13px] font-medium ${
                  isUploading ||
                  !selectedFile ||
                  validationErrors.length > 0 ||
                  !canUpload
                    ? "cursor-not-allowed bg-slate-300 text-white"
                    : "app-btn-primary text-white"
                }`}
              >
                <Upload className="size-3.5  mr-1.5" />
                {isUploading ? "Importing..." : "Import Leads"}
              </button>
            </div>

            {uploadMessage && (
              <div
                className={`mt-4 p-3 rounded-lg border ${
                  uploadStatus === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : uploadStatus === "warning"
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : uploadStatus === "error"
                        ? "border-rose-200 bg-rose-50 text-rose-800"
                        : "border-blue-200 bg-blue-50 text-blue-800"
                }`}
              >
                <div className="flex items-start">
                  {uploadStatus === "success" ? (
                    <CheckCircle2 className="size-4  text-emerald-600 mr-2 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="size-4  mr-2 mt-0.5 shrink-0" />
                  )}
                  <div className="space-y-2">
                    <div className="text-[13px]">{uploadMessage}</div>
                    {uploadStatus === "error" &&
                      validationErrors.length > 0 && (
                        <div className="space-y-1 text-[12px]">
                          {validationErrors.slice(0, 8).map((row) => (
                            <div key={row.rowNumber}>
                              Row {row.rowNumber}:{" "}
                              {Array.isArray(row.issues)
                                ? row.issues.join(", ")
                                : row.reason}
                            </div>
                          ))}
                        </div>
                      )}
                    {(uploadStatus === "error" || uploadStatus === "warning") &&
                      invalidRowsForDownload.length > 0 && (
                        <div>
                          <button
                            type="button"
                            onClick={handleDownloadInvalidRows}
                            className="px-3 py-1.5 bg-white text-slate-800 border border-slate-200 rounded-md hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 flex items-center text-[13px] font-medium"
                          >
                            <Download className="size-3.5  mr-1.5 text-slate-600" />
                            Download invalid rows
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 h-full">
            <div className="app-panel p-4 h-full">
              <div className="flex items-start gap-3 pb-4 border-b border-(--border-soft)">
                <div className="p-2 bg-(--brand-soft) rounded-xl border border-(--border-soft)">
                  <FileText className="size-4  text-(--brand)" />
                </div>
                <div>
                  <h2 className="app-heading">Before You Upload</h2>
                  <p className="mt-1 text-[12px] text-(--text-soft)">
                    A quick checklist to keep your import clean and predictable.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-(--border-soft) bg-(--bg-subtle)/70 p-3">
                  <div className="text-[13px] font-medium text-(--text-strong)">
                    Supported files
                  </div>
                  <div className="mt-1 text-[12px] text-(--text-soft)">
                    CSV, XLS, and XLSX files are supported on this screen.
                  </div>
                </div>

                <div className="rounded-2xl border border-(--border-soft) bg-(--bg-subtle)/70 p-3">
                  <div className="text-[13px] font-medium text-(--text-strong)">
                    Use the template
                  </div>
                  <div className="mt-1 text-[12px] text-(--text-soft)">
                    Download the template if you want the expected column names
                    and sample values.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {previewRows.length > 0 && (
          <div className="app-panel overflow-hidden">
            <div className="app-section-bar px-4 py-3">
              <h3 className="app-heading">
                Review leads ({previewRows.length} rows)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-white border-b border-(--border-soft)">
                    {["Name", "Phone", "Source", "Location", "Assigned To"].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-(--bg-subtle)">
                  {paginatedPreviewRows.map((lead) => (
                    <tr
                      key={lead.rowNumber}
                      className="hover:bg-(--bg-subtle)/70 transition-colors duration-200"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-xl flex items-center justify-center shrink-0 bg-(--bg-subtle) border border-(--border-soft)">
                            <User className="size-4 text-(--text-faint)" />
                          </div>
                          <div>
                            <div className="text-[14px] font-bold tracking-[-0.02em] text-(--text-strong)">
                              {lead.name || "Unnamed lead"}
                            </div>
                            <div className="text-[12px] font-medium text-(--text-faint) truncate max-w-45">
                              {lead.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px] font-semibold text-(--text-body) whitespace-nowrap">
                        {lead.phone}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-medium text-(--text-body) whitespace-nowrap">
                        {lead.source || "—"}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-medium text-(--text-body) whitespace-nowrap">
                        {lead.location || "—"}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-semibold text-(--text-body) whitespace-nowrap">
                        {lead.assigned_to || "Unassigned"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previewRows.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 app-section-bar border-t border-(--border-soft)">
                <div className="text-[13px] text-(--text-soft) font-medium mb-3 sm:mb-0">
                  Showing {paginatedPreviewRows.length} of {previewRows.length}{" "}
                  entries
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    className="app-btn-secondary px-3 py-1.5 text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <button className="size-8 bg-(--brand) text-white rounded-lg font-medium text-[13px]">
                    {currentPage}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    className="app-btn-secondary px-3 py-1.5 text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleCSVUpload;
