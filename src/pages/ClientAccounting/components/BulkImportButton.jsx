import React, { useRef } from "react";
import * as XLSX from "xlsx";
import { Upload } from "lucide-react";

const BulkImportButton = ({
  onDataParsed,
  buttonLabel = "Import Excel/CSV",
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
      onDataParsed(data);

      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsBinaryString(file);
  };

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
        onClick={() => fileInputRef.current.click()}
        className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition text-sm font-medium"
      >
        <Upload size={16} />
        {buttonLabel}
      </button>
    </div>
  );
};

export default BulkImportButton;
