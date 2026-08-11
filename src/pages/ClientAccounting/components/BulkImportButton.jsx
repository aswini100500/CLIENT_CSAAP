import React from "react";
import { useRef } from "react";
import * as XLSX from "xlsx";
import { Upload } from "lucide-react";

const BulkImportButton = ({
  onDataParsed,
  onImport,
  buttonLabel,
  buttonText,
  className,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const wsname = workbook.SheetNames[0];
      const ws = workbook.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, {
        raw: false,
        dateNF: "yyyy-mm-dd",
      });
      if (onDataParsed) onDataParsed(data);
      if (onImport) onImport(data);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsBinaryString(file);
  };

  const label = buttonLabel || buttonText || "Import Excel / CSV";
  const defaultClass =
    "flex items-center gap-1.5 bg-[#f0fdf4] hover:bg-[#e1f9eb] text-[#00a651] px-3 py-1.5 rounded-lg border border-[#c6f1d6] transition-colors text-sm font-medium cursor-pointer shadow-xs";

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={className || defaultClass}
      >
        <Upload size={16} />
        <span>{label}</span>
      </button>
    </div>
  );
};

export default BulkImportButton;
