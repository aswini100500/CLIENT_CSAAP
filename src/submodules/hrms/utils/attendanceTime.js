const TIME_ONLY_PATTERN = /^\d{2}:\d{2}(:\d{2})?$/;
const INDIA_OFFSET = "+05:30";

function extractTimeString(value) {
  if (!value) return "";

  const raw = String(value).trim();
  if (TIME_ONLY_PATTERN.test(raw)) {
    return raw.slice(0, 5);
  }

  const match = raw.match(/(\d{2}):(\d{2})(?::\d{2})?/);
  if (match) {
    return `${match[1]}:${match[2]}`;
  }

  return "";
}

export function formatAttendanceTime24(value, fallback = "N/A") {
  return extractTimeString(value) || fallback;
}

export function getAttendanceDateValue(record) {
  if (record?.attendance_date) {
    return String(record.attendance_date).slice(0, 10);
  }

  const dateTimeValue = record?.mispunch_time || record?.created_at || "";
  const match = String(dateTimeValue).match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

export function getCurrentIndiaDate() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  return `${values.year}-${values.month}-${values.day}`;
}

export function getCurrentIndiaDateTimeLabel() {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function parseIndiaDateTime(dateValue, timeValue = "00:00:00") {
  if (!dateValue || !timeValue) return null;

  const normalizedTime = String(timeValue).trim().slice(0, 8);
  const fullTime =
    normalizedTime.length === 5 ? `${normalizedTime}:00` : normalizedTime;
  const date = new Date(`${dateValue}T${fullTime}${INDIA_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toIndiaDateTime(value) {
  if (!value) return null;

  const raw = String(value).trim().replace("T", " ");
  const [datePart, timePart = "00:00:00"] = raw.split(" ");

  return parseIndiaDateTime(datePart, timePart);
}

export function parseIndiaDateTimeString(str) {
  if (!str) return null;
  const normalized = String(str).trim().replace(" ", "T");
  const d = new Date(
    normalized.includes("+") || normalized.includes("Z")
      ? normalized
      : `${normalized}${INDIA_OFFSET}`
  );
  return Number.isNaN(d.getTime()) ? null : d;
}

export function calculateAttendanceDuration(checkIn, checkOut) {
  const checkInDate = toIndiaDateTime(checkIn);
  const checkOutDate = toIndiaDateTime(checkOut);

  if (!checkInDate || !checkOutDate) return "N/A";

  const diffMs = checkOutDate - checkInDate;
  if (diffMs < 0) return "N/A";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export function formatBreakDuration(seconds) {
  if (!seconds || seconds <= 0) return "0m";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

