import React from "react";

import {
  ExternalLink,
  FileCheck,
  FileText,
  Image,
  Trash2,
  Upload,
} from "lucide-react";
import { FILE_UPLOAD_CONFIG } from "./constants";

const API_BASE = import.meta.env.VITE_HRMS_BASE_URL;

const getFileIcon = (fileType) => {
  if (fileType === "photo") return <Image size={20} className="text-(--brand)" />;
  if (
    fileType === "educationalCertificates" ||
    fileType === "termandconditionCertificates"
  )
    return <FileText size={20} className="text-blue-500" />;
  return <FileCheck size={20} className="text-emerald-500" />;
};

const getFileName = (fileObj) => {
  if (!fileObj) return "";
  if (fileObj.actualFile?.name) return fileObj.actualFile.name;
  if (fileObj.name) return fileObj.name;
  if (typeof fileObj === "string") {
    return fileObj.split("/").pop()?.split("\\").pop() || fileObj;
  }
  return "Uploaded file";
};

const getFileUrl = (fileObj) => {
  const rawValue = fileObj?.preview || fileObj?.name || "";
  if (!rawValue) return "";
  if (rawValue.startsWith("blob:") || /^https?:\/\//i.test(rawValue)) {
    return rawValue;
  }

  const normalized = rawValue.replace(/^\/?uploads\/?/i, "");
  return `${API_BASE}/uploads/${normalized
    .split(/[\\/]/)
    .map((part) => encodeURIComponent(part))
    .join("/")}`;
};

const UploadedFileRow = ({ fileObj, onRemove }) => {
  const fileUrl = getFileUrl(fileObj);
  const fileName = getFileName(fileObj);

  return (
    <div className="flex items-center justify-between gap-2 p-2 bg-emerald-50/50 border border-emerald-200 rounded-xl">
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-emerald-800">
        {fileName}
      </span>
      {fileUrl ? (
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-(--brand) hover:text-(--brand-strong)"
          title={`View ${fileName}`}
        >
          <ExternalLink size={14} />
          View
        </a>
      ) : null}
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-100/50 p-1 rounded-lg transition-colors"
        title={`Remove ${fileName}`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

const DocumentsTab = ({
  uploadedFiles,
  uploadProgress,
  isUploading,
  handleFileInput,
  removeUploadedFile,
}) => (
  <div className="app-panel p-6">
    <h2 className="app-heading text-lg font-bold text-(--text-strong) mb-6 border-b border-(--border-soft) pb-3">
      Document Upload
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {FILE_UPLOAD_CONFIG.map((config) => (
        <div
          key={config.type}
          className="border border-(--border-soft) rounded-xl p-4 bg-(--bg-app)/30 hover:shadow-sm transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-(--text-strong)">{config.label}</h3>
            {getFileIcon(config.type)}
          </div>

          <p className="text-xs text-(--text-soft) mb-4">{config.description}</p>

          {/* File Input */}
          <div className="mb-3">
            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-(--border-strong) rounded-xl hover:border-(--brand) hover:bg-white text-(--text-soft) hover:text-(--brand) cursor-pointer transition-all duration-200 bg-white">
              <Upload size={16} />
              <span className="text-sm font-semibold">Choose File</span>
              <input
                type="file"
                className="hidden"
                accept={config.accept}
                multiple={config.multiple || false}
                onChange={(e) => handleFileInput(config.type, e)}
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Upload Progress */}
          {uploadProgress[config.type] > 0 && (
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
              <div
                className="bg-linear-to-r from-green-500 to-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress[config.type]}%` }}
              ></div>
            </div>
          )}

          {/* Uploaded Files Display */}
          <div className="space-y-2">
            {config.type === "educationalCertificates" ||
            config.type === "termandconditionCertificates"
              ? uploadedFiles[config.type].map((fileObj, index) => (
                  <UploadedFileRow
                    key={index}
                    fileObj={fileObj}
                    onRemove={() => removeUploadedFile(config.type, index)}
                  />
                ))
              : uploadedFiles[config.type] && (
                  <UploadedFileRow
                    fileObj={uploadedFiles[config.type]}
                    onRemove={() => removeUploadedFile(config.type)}
                  />
                )}
          </div>
        </div>
      ))}
    </div>

    {/* Upload Status */}
    {isUploading && (
      <div className="mt-4 p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
        <p className="text-sm font-semibold text-emerald-800 text-center flex items-center justify-center gap-2">
          Uploading files... Please wait.
        </p>
      </div>
    )}
  </div>
);

export default DocumentsTab;
