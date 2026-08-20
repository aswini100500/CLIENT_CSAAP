import {
  parseIndiaDateTime,
} from "./attendanceTime.js";

/**
 * Converts total seconds into a readable "Xh Ym" string
 */
export function secondsToDurationLabel(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "0h 0m";
  }

  const safeSeconds = Math.floor(totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

/**
 * Validates the chronological sequence of BREAK_START and BREAK_END logs
 * Returns array of validation error messages, or empty array if valid.
 */
export function validateBreakLogSequence(breakLogs) {
  const events = (breakLogs || [])
    .filter((l) => l.log_type === "BREAK_START" || l.log_type === "BREAK_END")
    .map((l) => ({
      ...l,
      timeMs: new Date((l.timestamp || "").replace(" ", "T")).getTime(),
    }))
    .sort((a, b) => (a.timeMs || 0) - (b.timeMs || 0));

  const errors = [];
  let activeStart = null;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const timeStr = event.timestamp ? event.timestamp.slice(11, 19) : "unknown time";

    if (event.log_type === "BREAK_START") {
      if (activeStart) {
        errors.push(`Multiple Break Start entries recorded without a Break End around ${timeStr}.`);
      }
      activeStart = event;
    } else if (event.log_type === "BREAK_END") {
      if (!activeStart) {
        errors.push(`Break End entry at ${timeStr} is missing a corresponding Break Start.`);
      } else {
        if (!Number.isNaN(activeStart.timeMs) && !Number.isNaN(event.timeMs) && event.timeMs <= activeStart.timeMs) {
          errors.push(`Break End time (${timeStr}) must be later than Break Start time (${activeStart.timestamp?.slice(11, 19)}).`);
        }
        activeStart = null;
      }
    }
  }

  return errors;
}

/**
 * Accumulates total completed break duration in seconds from logs
 */
export function calculateBreakSecondsFromLogs(logs) {
  if (!Array.isArray(logs)) return 0;
  let totalSeconds = 0;
  let activeStart = null;

  const sortedEvents = logs
    .filter((l) => l.log_type === "BREAK_START" || l.log_type === "BREAK_END")
    .map((l) => ({
      ...l,
      timeMs: new Date((l.timestamp || "").replace(" ", "T")).getTime(),
    }))
    .sort((a, b) => (a.timeMs || 0) - (b.timeMs || 0));

  for (const log of sortedEvents) {
    if (log.log_type === "BREAK_START") {
      activeStart = log;
    } else if (log.log_type === "BREAK_END") {
      if (activeStart) {
        if (!Number.isNaN(activeStart.timeMs) && !Number.isNaN(log.timeMs)) {
          const delta = Math.floor((log.timeMs - activeStart.timeMs) / 1000);
          if (delta > 0) {
            totalSeconds += delta;
          }
        }
        activeStart = null;
      }
    }
  }
  return totalSeconds;
}

/**
 * Computes live preview metrics for an attendance audit session
 */
export function computeAuditPreview({
  attendanceDate,
  punchInTime,
  punchOutTime,
  shiftStart,
  shiftEnd,
  breakLogs = [],
}) {
  const defaultPreview = {
    workedSeconds: 0,
    grossWorkedSeconds: 0,
    totalBreakSeconds: 0,
    shiftSeconds: 0,
    overtimeSeconds: 0,
    overtime: "0h 0m",
    isLate: 0,
    isEarlyLeave: 0,
    isHalfDay: 0,
    otEligible: false,
  };

  if (!attendanceDate || !punchInTime) {
    return defaultPreview;
  }

  const punchInDateTime = parseIndiaDateTime(attendanceDate, punchInTime);
  const punchOutDateTime = punchOutTime
    ? parseIndiaDateTime(attendanceDate, punchOutTime)
    : null;

  if (!punchInDateTime) {
    return defaultPreview;
  }

  const grossWorkedSeconds = punchOutDateTime
    ? Math.max(Math.floor((punchOutDateTime - punchInDateTime) / 1000), 0)
    : 0;

  const totalBreakSeconds = calculateBreakSecondsFromLogs(breakLogs);
  const workedSeconds = Math.max(grossWorkedSeconds - totalBreakSeconds, 0);

  let shiftSeconds = 0;
  let overtimeSeconds = 0;
  let isLate = 0;
  let isEarlyLeave = 0;

  const shiftStartDateTime = shiftStart
    ? parseIndiaDateTime(attendanceDate, shiftStart)
    : null;
  const shiftEndDateTime = shiftEnd
    ? parseIndiaDateTime(attendanceDate, shiftEnd)
    : null;

  if (shiftStartDateTime && shiftEndDateTime) {
    if (shiftEndDateTime <= shiftStartDateTime) {
      shiftEndDateTime.setDate(shiftEndDateTime.getDate() + 1);
    }

    shiftSeconds = Math.max(
      Math.floor((shiftEndDateTime - shiftStartDateTime) / 1000),
      0,
    );

    if (punchInDateTime > shiftStartDateTime) {
      const graceSeconds = 15 * 60;
      if (
        Math.floor((punchInDateTime - shiftStartDateTime) / 1000) > graceSeconds
      ) {
        isLate = 1;
      }
    }

    if (punchOutDateTime && punchOutDateTime < shiftEndDateTime) {
      const earlyThresholdSeconds = 15 * 60;
      if (
        Math.floor((shiftEndDateTime - punchOutDateTime) / 1000) >
        earlyThresholdSeconds
      ) {
        isEarlyLeave = 1;
      }
    }
  }

  if (shiftSeconds > 0 && workedSeconds > shiftSeconds) {
    overtimeSeconds = workedSeconds - shiftSeconds;
  }

  const isHalfDay = workedSeconds > 0 && workedSeconds < 7 * 3600 ? 1 : 0;
  const otEligible = overtimeSeconds > 0;

  return {
    workedSeconds,
    grossWorkedSeconds,
    totalBreakSeconds,
    shiftSeconds,
    overtimeSeconds,
    overtime: secondsToDurationLabel(overtimeSeconds),
    isLate,
    isEarlyLeave,
    isHalfDay,
    otEligible,
  };
}
