import axios from "axios";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Copy,
  Download,
  LoaderCircle,
  QrCode,
  RefreshCw,
  ShieldAlert,
  TriangleAlert,
  UserCheck,
  Users,
  ExternalLink,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import useAuth from "../../../../hooks/useAuth";
import {
  formatAttendanceTime24,
  getAttendanceDateValue,
  getCurrentIndiaDate,
} from "../../utils/attendanceTime";
import GeofenceExemptionsModal from "../Attendance/GeofenceExemptionsModal";

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
  const companyId =
    user?.company_id ?? user?.companyId ?? user?.id ?? user?.user_id ?? "";
  const companySlug =
    user?.slug ??
    user?.subdomain ??
    user?.company_slug ??
    user?.companySlug ??
    user?.company ??
    "";
  const companyName =
    user?.companyName ?? user?.name ?? user?.company ?? user?.subdomain ?? "";

  return {
    companyId,
    companySlug,
    companyName,
  };
}

const Attendance2 = () => {
  const canViewQr = true;
  const canGenerateQr = true;
  const canViewGeofence = true;

  const { user } = useAuth();
  const companyFromRedux = user?.companyName;
  const [companyName, setCompanyName] = useState(companyFromRedux || "");
  const [qrRecord, setQrRecord] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getCurrentIndiaDate());
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showGeofenceModal, setShowGeofenceModal] = useState(false);

  const qrScope = resolveQrScope(user);
  const hasRequiredStorage = Boolean(qrScope.companyId && qrScope.companySlug);

  useEffect(() => {
    if (companyFromRedux) {
      setCompanyName(companyFromRedux);
      return;
    }

    if (qrScope.companyName) {
      setCompanyName(qrScope.companyName);
    }
  }, [companyFromRedux, qrScope.companyName]);

  useEffect(() => {
    const fetchQr = async () => {
      if (!qrScope.companyId || !qrScope.companySlug) {
        setFetching(false);
        setError("Company details are missing from your session.");
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
          setCompanyName(
            (prev) =>
              prev ||
              qrScope.companyName ||
              response.data.data.company_slug ||
              "",
          );
        }
      } catch (fetchError) {
        if (fetchError.response?.status !== 404) {
          console.error("Failed to fetch QR code", fetchError);
          setError(
            fetchError.response?.data?.message ||
              "Unable to load the saved QR code.",
          );
        }
      } finally {
        setFetching(false);
      }
    };

    fetchQr();
  }, [qrScope.companyId, qrScope.companySlug, qrScope.companyName]);

  useEffect(() => {
    if (!copied) return undefined;

    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const qrUrl = qrRecord?.url || "";

  const getTodayDate = () => getCurrentIndiaDate();

  const getAttendanceHeading = () => {
    const today = getTodayDate();

    if (selectedDate === today) {
      return "Attendance today";
    }

    const todayDate = new Date(`${today}T00:00:00+05:30`);
    const selectedDateValue = new Date(`${selectedDate}T00:00:00+05:30`);
    const diffDays = Math.round(
      (todayDate.getTime() - selectedDateValue.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (diffDays === 1) {
      return "Attendance yesterday";
    }

    const [year, month, day] = selectedDate.split("-");
    return `Attendance ${day}-${month}-${year}`;
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!qrScope.companyId) {
        setAttendanceRecords([]);
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE}/api/attendance/${qrScope.companySlug}?date=${selectedDate}`,
        );

        const attendanceData = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];

        const formattedAttendance = attendanceData.map((item) => ({
          id: item.id,
          name: item.employee_name || "Unknown",
          mispunch_time: item.mispunch_time
            ? formatAttendanceTime24(item.mispunch_time)
            : "N/A",
          leave_time: item.leave_time
            ? formatAttendanceTime24(item.leave_time)
            : "N/A",
          date: getAttendanceDateValue(item) || "N/A",
          is_half_day: Number(item.is_half_day || 0),
          is_late: Number(item.is_late || 0),
          is_early_leave: Number(item.is_early_leave || 0),
          reason: item.reason?.trim() || "",
        }));

        setAttendanceRecords(
          formattedAttendance.filter((item) => item.date === selectedDate),
        );
      } catch (attendanceError) {
        console.error("Error fetching attendance", attendanceError);
        setAttendanceRecords([]);
      }
    };

    fetchAttendance();
  }, [qrScope.companyId, qrScope.companySlug, selectedDate]);

  const buildStatusChips = (record) => {
    const chips = [
      Number(record.is_late) === 1
        ? {
            label: "Late Arrival",
            icon: AlertCircle,
            className: "bg-amber-50 text-amber-700 border-amber-200/60",
          }
        : {
            label: "On Time",
            icon: UserCheck,
            className: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
          },
    ];

    if (Number(record.is_half_day) === 1) {
      chips.push({
        label: "Half Day",
        icon: Clock,
        className: "bg-orange-50 text-orange-700 border-orange-200/60",
      });
    }

    if (Number(record.is_early_leave) === 1) {
      chips.push({
        label: "Early Leave",
        icon: AlertCircle,
        className: "bg-rose-50 text-rose-700 border-rose-200/60",
      });
    }

    return chips;
  };

  const getBrowserLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Browser location is not available."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = Number(position.coords.latitude).toFixed(6);
          const longitude = Number(position.coords.longitude).toFixed(6);
          resolve({
            latitude,
            longitude,
          });
        },
        (locationError) => {
          reject(
            new Error(
              locationError?.message ||
                "Unable to access your location. Please allow location access and try again.",
            ),
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60 * 1000,
        },
      );
    });

  const handleDownloadQR = () => {
    const canvas = document.getElementById("attendance-qr-canvas");
    if (!canvas) return;

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${companyName || qrScope.companySlug || "qr-code"}.png`;
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
      setError("Failed to copy the QR link.");
    }
  };

  const handleGenerate = async () => {
    if (!qrScope.companyId || !qrScope.companySlug) {
      setError("Company details are missing from your session.");
      return;
    }

    try {
      setLoading(true);
      setSaving(true);
      setError("");

      const browserLocation = await getBrowserLocation();
      setCurrentLocation(browserLocation);

      const response = await axios.post(`${API_BASE}/api/qr/upsert`, {
        company_id: qrScope.companyId,
        company_slug: qrScope.companySlug,
        latitude: browserLocation.latitude,
        longitude: browserLocation.longitude,
        frontend_base_url: window.location.origin,
      });

      if (response.data?.data) {
        setQrRecord(response.data.data);
      }
    } catch (saveError) {
      console.error("Failed to generate QR code", saveError);
      setError(
        saveError.response?.data?.message ||
          "Unable to generate the QR code right now.",
      );
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  const renderEmptyCard = () => (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={fetching || saving || !hasRequiredStorage || !canGenerateQr}
      className="app-panel group flex min-h-105 w-full flex-col items-center justify-center border-dashed px-6 py-10 text-center transition-all hover:border-(--border-strong) disabled:cursor-not-allowed disabled:opacity-70"
    >
      <div className="mb-4 rounded-2xl border border-(--border-soft) bg-(--brand-soft) p-5 text-(--brand) transition-transform duration-300 group-hover:scale-105">
        <QrCode className="h-10 w-10" />
      </div>
      <h2 className="app-heading">No QR code saved yet</h2>
      <p className="mt-2 max-w-sm text-[13px] font-medium text-(--text-soft)">
        {!canGenerateQr
          ? "You do not have permission to generate QR codes."
          : hasRequiredStorage
            ? "Click to create the QR code using your live location."
            : "Company details are missing from your session."}
      </p>
      {canGenerateQr && (
        <span className="app-btn-primary mt-6 inline-flex items-center gap-2">
          {saving ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Generating
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 stroke-[3px]" />
              Create QR code
            </>
          )}
        </span>
      )}
    </button>
  );

  const renderQrCard = () => (
    <div className="app-panel overflow-hidden">
      <div className="app-section-bar px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
              Current QR code
            </p>
            <h2 className="app-heading mt-2">
              {companyName || qrScope.companySlug || "Company QR"}
            </h2>
            <p className="mt-1 text-[12px] font-medium text-(--text-soft)">
              {qrRecord?.updated_at
                ? `Last updated ${new Date(qrRecord.updated_at).toLocaleString()}`
                : "Loaded from the saved QR record"}
            </p>
          </div>
          <div className="rounded-2xl border border-(--border-soft) bg-(--brand-soft) p-4 text-(--brand)">
            <QrCode className="h-8 w-8" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        <div className="flex min-h-80 items-center justify-center rounded-2xl border border-(--border-soft) bg-(--bg-subtle)/70 p-5">
          <div className="rounded-2xl border border-(--border-soft) bg-white p-5 shadow-sm">
            <QRCodeCanvas
              id="attendance-qr-canvas"
              value={qrUrl}
              size={260}
              level="H"
              className="block"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="rounded-2xl border border-(--border-soft) bg-(--bg-subtle)/70 p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                QR URL
              </p>
              <p className="mt-2 break-all font-mono text-[13px] font-medium text-(--text-body)">
                {qrUrl}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-blue-600/70">
                  Company ID
                </p>
                <p className="mt-2 text-sm font-semibold text-blue-950">
                  {qrScope.companyId || "N/A"}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-600/70">
                  Company Slug
                </p>
                <p className="mt-2 text-sm font-semibold text-emerald-950">
                  {qrScope.companySlug || "N/A"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-600/70">
                  Latitude
                </p>
                <p className="mt-2 text-sm font-semibold text-amber-950">
                  {currentLocation?.latitude || qrRecord?.latitude || "N/A"}
                </p>
              </div>
              <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-teal-600/70">
                  Longitude
                </p>
                <p className="mt-2 text-sm font-semibold text-teal-950">
                  {currentLocation?.longitude || qrRecord?.longitude || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {canGenerateQr && (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !hasRequiredStorage}
                className="app-btn-primary inline-flex items-center gap-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 stroke-[3px]" />
                )}
                <span className="leading-none">Refresh QR code</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadQR}
              className="app-btn-secondary inline-flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="app-btn-secondary inline-flex items-center gap-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600 stroke-[3px]" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy QR link"}
            </button>

            <button
              type="button"
              onClick={() =>
                window.open(qrUrl, "_blank", "noopener,noreferrer")
              }
              disabled={!qrUrl}
              className="app-btn-secondary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ExternalLink className="h-4 w-4" />
              Open URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAttendanceList = () => (
    <div className="app-panel overflow-hidden flex flex-col h-[calc(100vh-280px)] min-h-125">
      <div className="app-section-bar px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-(--border-soft) bg-(--brand-soft) p-2 text-(--brand) shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <h2 className="app-heading">{getAttendanceHeading()}</h2>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-(--border-soft) bg-white px-4 py-2 text-[13px] font-semibold text-(--text-soft)">
          <Calendar className="w-4 h-4 text-(--text-faint)" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={getTodayDate()}
            className="bg-transparent text-(--text-strong) outline-none"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide bg-(--bg-subtle)/45">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="app-panel p-4 flex flex-col items-center justify-center py-5">
            <div className="bg-emerald-50 p-2 rounded-xl mb-2 border border-emerald-100">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mb-1">
              {attendanceRecords.length}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Check-ins
            </p>
          </div>

          <div className="app-panel p-4 flex flex-col items-center justify-center py-5">
            <div className="bg-amber-50 p-2 rounded-xl mb-2 border border-amber-100">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mb-1">
              {
                attendanceRecords.filter((r) => Number(r.is_half_day) === 1)
                  .length
              }
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Half Day
            </p>
          </div>

          <div className="app-panel p-4 flex flex-col items-center justify-center py-5">
            <div className="bg-orange-50 p-2 rounded-xl mb-2 border border-orange-100">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mb-1">
              {attendanceRecords.filter((r) => r.is_late === 1).length}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Late
            </p>
          </div>

          <div className="app-panel p-4 flex flex-col items-center justify-center py-5">
            <div className="bg-rose-50 p-2 rounded-xl mb-2 border border-rose-100">
              <Clock className="w-5 h-5 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mb-1">
              {attendanceRecords.filter((r) => r.is_early_leave === 1).length}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Early Leave
            </p>
          </div>
        </div>

        <div className="mt-4">
          {attendanceRecords.length > 0 ? (
            <div className="space-y-3">
              {attendanceRecords.map((record) => (
                <div
                  key={record.id}
                  className="app-panel p-4 hover:bg-(--bg-subtle) transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-(--border-soft) bg-white font-black text-(--text-body) shadow-sm transition-transform group-hover:scale-105">
                      {record.name?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">
                        {record.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{record.mispunch_time}</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-rose-400" />
                          <span>{record.leave_time}</span>
                        </div>
                      </div>
                      {Number(record.is_late) === 1 && record.reason && (
                        <p className="mt-2 max-w-md text-xs font-medium text-amber-700 truncate">
                          Reason: {record.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex max-w-xs flex-wrap justify-end gap-2">
                      {buildStatusChips(record).map((chip) => {
                        const Icon = chip.icon;

                        return (
                          <span
                            key={`${record.id}-${chip.label}`}
                            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${chip.className}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {chip.label}
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {record.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5 ring-4 ring-slate-50">
                <Users className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                No records found
              </h3>
              <p className="text-slate-500 text-sm max-w-sm">
                No attendance records were found for {selectedDate}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-shell min-h-[calc(100vh-80px)] px-4 py-4 text-(--text-body)">
      <div className="mx-auto w-full max-w-5xl">
        <div className="space-y-4">
          {error ? (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          ) : null}

          {canViewQr ? (
            fetching && !qrRecord ? (
              <div className="app-panel flex min-h-105 items-center justify-center">
                <div className="flex items-center gap-3 text-(--text-soft)">
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Loading saved QR code...
                </div>
              </div>
            ) : qrRecord ? (
              renderQrCard()
            ) : (
              renderEmptyCard()
            )
          ) : (
            <div className="app-panel flex min-h-40 items-center justify-center p-6 text-center text-rose-500 font-semibold border border-rose-100 bg-rose-50/50 rounded-2xl">
              You do not have permission to view QR codes.
            </div>
          )}
        </div>

        {canViewGeofence && (
          <div className="mt-8">
            <div className="app-panel overflow-hidden p-2">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-5 px-6 py-6 sm:px-8 sm:py-7">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-(--border-soft) bg-(--brand-soft) text-(--brand) transition-transform hover:scale-105">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="app-heading">Geofence Exemptions</h2>
                    <p className="mt-1 text-[13px] font-medium text-(--text-soft)">
                      Manage location-based attendance overrides for remote and
                      field personnel.
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 lg:px-8 lg:pb-0">
                  <button
                    type="button"
                    onClick={() => setShowGeofenceModal(true)}
                    className="app-btn-primary inline-flex items-center gap-2 active:scale-[0.98]"
                  >
                    <span className="leading-none">Open Ledger</span>
                    <ArrowRight className="h-4 w-4 stroke-[3px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">{renderAttendanceList()}</div>
      </div>

      <GeofenceExemptionsModal
        isOpen={showGeofenceModal}
        onClose={() => setShowGeofenceModal(false)}
        companySlug={qrScope.companySlug}
        companyName={companyName || qrScope.companyName}
        currentUserId={user?.id || user?.user_id || user?.employee_id}
        currentUserName={user?.name || companyName || "Current admin"}
      />
    </div>
  );
};

export default Attendance2;
