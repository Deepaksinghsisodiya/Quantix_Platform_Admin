/**
 * Converts a UTC date string from the backend into a local Date object.
 * Handles cases where the backend might omit the 'Z' suffix.
 */
export const toLocalDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;

  // 1. If it already has a timezone indicator, trust it
  const tPartsForIndicator = dateStr.split('T');
  const secondPartForIndicator = tPartsForIndicator[1];
  if (dateStr.endsWith('Z') || dateStr.includes('+') || (dateStr.includes('T') && secondPartForIndicator && secondPartForIndicator.includes('-'))) {
    return new Date(dateStr);
  }

  // 2. Try interpreting it as UTC (adding Z)
  // We handle both "YYYY-MM-DD HH:mm:ss" and "YYYY-MM-DDTHH:mm:ss"
  const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
  const utcInterpretation = new Date(`${normalized}Z`);

  // 3. For our system, we assume all strings from backend are UTC.
  return utcInterpretation;

  // Otherwise, assume it was UTC (which is the standard for our backend)
  return utcInterpretation;
};

/**
 * Formats a date string into local time string (HH:mm AM/PM).
 */
export const formatLocalTime = (dateStr: string | null | undefined): string => {
  const date = toLocalDate(dateStr);
  if (!date) return '--:--';

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Formats a date string into local date string (DD MMM YYYY).
 */
export const formatLocalDate = (dateStr: string | null | undefined): string => {
  const date = toLocalDate(dateStr);
  if (!date) return '--/--/----';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Converts a time string like "10:00" or "19:00" to "10:00 AM" or "07:00 PM".
 */
export const formatTimeString = (timeStr: string | null | undefined): string => {
  if (!timeStr) return '--:--';
  
  // Handle HH:mm or HH:mm:ss
  const parts = timeStr.split(':');
  const hours = parts[0];
  const minutes = parts[1];
  if (!hours || !minutes) return timeStr;
  
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // the hour '0' should be '12'
  
  const paddedH = h.toString().padStart(2, '0');
  
  return `${paddedH}:${minutes} ${ampm}`;
};

/**
 * Safely parses a YYYY-MM-DD string (or ISO timestamp) as a Date object in UTC,
 * ignoring any local browser timezone shift.
 */
export const parseUTCDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  const tParts = dateStr.split('T');
  const datePart = tParts[0];
  if (!datePart) return null;
  const parts = datePart.split('-');
  
  const yStr = parts[0];
  const mStr = parts[1];
  const dStr = parts[2];
  if (!yStr || !mStr || !dStr) return null;

  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10) - 1; // Month is 0-indexed
  const d = parseInt(dStr, 10);
  return new Date(Date.UTC(y, m, d));
};

/**
 * Returns the weekday name (e.g., "Monday") in UTC to avoid timezone shift.
 */
export const getUTCWeekday = (dateStr: string | null | undefined): string => {
  const date = parseUTCDate(dateStr);
  if (!date) return '';
  return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
};

/**
 * Formats a date string into UTC date string (DD MMM YYYY) timezone-independently.
 */
export const formatLocalDateNeutral = (dateStr: string | null | undefined): string => {
  const date = parseUTCDate(dateStr);
  if (!date) return '--/--/----';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });
};
