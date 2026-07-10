import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Check,
  Copy,
  Download,
  ExternalLink,
  LoaderCircle,
  MapPin,
  QrCode,
  TriangleAlert,
  X,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import React from "react";

const API_BASE = import.meta.env.VITE_HRMS_BASE_URL;


function safeParse(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function firstValue(values) {
  return (
    values.find(
      (value) =>
        value !== undefined && value !== null && String(value).trim() !== "",
    ) ?? ""
  );
}

function resolveQrScope(user) {
  const candidates = [user].filter(Boolean);

  const companyId = firstValue(
    candidates.map(
      (item) =>
        item?.company_id ?? item?.companyId ?? item?.id ?? item?.user_id,
    ),
  );
  const companySlug = firstValue(
    candidates.map(
      (item) =>
        item?.slug ??
        item?.subdomain ??
        item?.company_slug ??
        item?.companySlug ??
        item?.company,
    ),
  );
  const companyName = firstValue(
    candidates.map(
      (item) =>
        item?.companyName ?? item?.name ?? item?.company ?? item?.subdomain,
    ),
  );

  return {
    companyId,
    companySlug,
    companyName,
  };
}

const AttendanceQRModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [qrRecord, setQrRecord] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const qrScope = resolveQrScope(user);
  const companyName =
    qrScope.companyName || qrScope.companySlug || "Company QR";

  useEffect(() => {
    if (!isOpen) return;

    const fetchQr = async () => {
      if (!qrScope.companyId || !qrScope.companySlug) {
        setFetching(false);
        setError("Company details are missing.");
        return;
      }

      try {
        setFetching(true);
        setError("");

        const response = await axios.get(
          `${API_BASE}/api/qr/company/${encodeURIComponent(qrScope.companyId)}/${encodeURIComponent(qrScope.companySlug)}`,
        );

        if (response.data?.data) {
          setQrRecord(response.data.data);
        } else {
          setError("No QR code record found.");
        }
      } catch (fetchError) {
        console.error("Failed to fetch QR code", fetchError);
        setError(
          fetchError.response?.data?.message ||
            "Unable to load the saved QR code.",
        );
      } finally {
        setFetching(false);
      }
    };

    fetchQr();
  }, [isOpen, qrScope.companyId, qrScope.companySlug]);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const qrUrl = qrRecord?.url || "";

  const handleDownloadQR = () => {
    const canvas = document.getElementById("attendance-qr-canvas-modal");
    if (!canvas) return;

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${companyName.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleCopyLink = async () => {
    if (!qrUrl) return;
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
    } catch (clipboardError) {
      console.error("Failed to copy QR link", clipboardError);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />


          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="app-modal relative w-full max-w-lg overflow-hidden"
          >

            <div className="flex items-center justify-between border-b border-(--border-soft) bg-white px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-(--border-soft) bg-(--brand-soft) text-(--brand)">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="modal-title">
                    Attendance QR
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="app-icon-button flex h-10 w-10 items-center justify-center bg-(--bg-subtle) text-(--text-soft) hover:bg-white hover:text-(--text-strong)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-8">
              {fetching ? (
                <div className="flex min-h-75 flex-col items-center justify-center text-slate-400">
                  <LoaderCircle className="h-10 w-10 animate-spin text-(--brand)" />
                  <p className="mt-4 font-medium">Fetching QR from server...</p>
                </div>
              ) : error ? (
                <div className="flex min-h-75 flex-col items-center justify-center rounded-3xl bg-rose-50 p-8 text-center">
                  <div className="mb-4 rounded-full bg-rose-100 p-4 text-rose-600">
                    <TriangleAlert className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-rose-900">
                    Couldn't Load QR
                  </h3>
                  <p className="mt-2 text-sm text-rose-600/80">{error}</p>
                  <button
                    onClick={onClose}
                    className="mt-6 rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-700 transition-colors"
                  >
                    Close Modal
                  </button>
                </div>
              ) : (
                <div className="space-y-6">

                  <div className="flex flex-col items-center">
                    <div className="relative rounded-2xl border border-(--border-soft) bg-white p-6 shadow-sm">
                      <QRCodeCanvas
                        id="attendance-qr-canvas-modal"
                        value={qrUrl}
                        size={220}
                        level="H"
                        className="block"
                      />
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <button
                        onClick={handleDownloadQR}
                        className="app-btn-primary flex items-center gap-2 px-5 py-2.5 active:scale-[0.98]"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                      <button
                        onClick={handleCopyLink}
                        className="app-btn-secondary flex items-center gap-2 px-5 py-2.5 active:scale-[0.98]"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copied ? "Copied!" : "Copy Link"}
                      </button>
                      <button
                        onClick={() =>
                          window.open(qrUrl, "_blank", "noopener,noreferrer")
                        }
                        disabled={!qrUrl}
                        className="app-btn-secondary flex items-center gap-2 px-5 py-2.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open Link
                      </button>
                    </div>
                  </div>


                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                        <Building2 className="h-3.5 w-3.5" />
                        Company
                      </div>
                      <p className="truncate text-sm font-bold text-slate-900">
                        {companyName}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                        <span className="text-xs">#</span>
                        Company ID
                      </div>
                      <p className="truncate text-sm font-bold text-slate-900">
                        {qrScope.companyId || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-(--border-soft) bg-(--brand-soft) p-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-(--brand) mb-2">
                      <MapPin className="h-3.5 w-3.5" />
                      Assigned Location
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400">
                          LAT
                        </span>
                        <p className="font-mono text-sm font-bold text-slate-900">
                          {qrRecord?.latitude || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400">
                          LONG
                        </span>
                        <p className="font-mono text-sm font-bold text-slate-900">
                          {qrRecord?.longitude || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {qrRecord?.updated_at && (
                    <p className="text-center text-[10px] font-medium text-slate-400 italic">
                      Last updated:{" "}
                      {new Date(qrRecord.updated_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AttendanceQRModal;
