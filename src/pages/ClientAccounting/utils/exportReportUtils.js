export const getCompanyAddress = (company) => {
  if (!company) return "";
  return [
    company.address,
    company.city,
    company.state,
    company.pinCode || company.pincode,
  ]
    .filter(Boolean)
    .join(", ");
};

export const addReportHeader = (
  doc,
  { companyName, companyAddress, reportTitle, generatedOn },
) => {
  const company = (companyName || "Company").toUpperCase();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(company, 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(reportTitle, 14, 26);

  let headerBottomY = 32;
  if (companyAddress) {
    const addressLines = doc.splitTextToSize(`Address: ${companyAddress}`, 120);
    doc.setFontSize(8);
    doc.setTextColor(90);
    doc.text(addressLines, 14, 31);
    headerBottomY = 32 + addressLines.length * 4;
  }

  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(`Generated on: ${generatedOn}`, 195, 18, { align: "right" });

  doc.setDrawColor(220);
  doc.line(14, headerBottomY, 195, headerBottomY);

  return {
    company,
    summaryY: headerBottomY + 8,
    tableStartY: headerBottomY + 16,
  };
};

export const addWorkbookHeader = (
  XLSX,
  ws,
  { companyName, companyAddress, reportTitle, generatedOn },
) => {
  const headerRows = [
    [`Company Name: ${companyName || "Company"}`],
    [`Address: ${companyAddress || "-"}`],
    [`Report: ${reportTitle}`],
    [`Generated On: ${generatedOn}`],
    [],
  ];

  XLSX.utils.sheet_add_aoa(ws, headerRows, { origin: "A1" });
};
