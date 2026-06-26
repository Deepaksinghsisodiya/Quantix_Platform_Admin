type DateFormat = 'short' | 'long' | 'relative' | 'datetime';

const SHORT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const LONG_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
};

const DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

function toDate(date: string | Date): Date {
  return typeof date === 'string' ? new Date(date) : date;
}

/**
 * Format a date value in a human-readable string.
 *
 * - `'short'`    — "Mar 29, 2026"
 * - `'long'`     — "Sunday, March 29, 2026"
 * - `'datetime'` — "Mar 29, 2026, 02:15 PM"
 * - `'relative'` — "3 days ago" / "in 2 hours"
 */
export function formatDate(date: string | Date, format: DateFormat = 'short'): string {
  if (!date) return '—';

  const d = toDate(date);
  if (isNaN(d.getTime())) {
    return '—';
  }

  // Handle uninitialized/placeholder dates (like Go/C# default 0001-01-01)
  if (d.getFullYear() < 1000) {
    return '—';
  }

  if (format === 'relative') {
    return formatRelativeTime(date);
  }

  const optionsMap: Record<Exclude<DateFormat, 'relative'>, Intl.DateTimeFormatOptions> = {
    short: SHORT_OPTIONS,
    long: LONG_OPTIONS,
    datetime: DATETIME_OPTIONS,
  };

  return new Intl.DateTimeFormat('en-US', optionsMap[format]).format(d);
}

/** Return a human-friendly relative time string (e.g. "5 minutes ago", "in 3 days"). */
export function formatRelativeTime(date: string | Date): string {
  const d = toDate(date);
  const now = Date.now();
  const diffMs = d.getTime() - now;
  const absDiffMs = Math.abs(diffMs);

  const seconds = Math.floor(absDiffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const sign = diffMs >= 0 ? 1 : -1;

  if (seconds < 60) return rtf.format(sign * seconds, 'second');
  if (minutes < 60) return rtf.format(sign * minutes, 'minute');
  if (hours < 24) return rtf.format(sign * hours, 'hour');
  if (days < 30) return rtf.format(sign * days, 'day');
  if (months < 12) return rtf.format(sign * months, 'month');
  return rtf.format(sign * years, 'year');
}

/** Return the number of calendar days from now until the given date (negative if in the past). */
export function daysUntil(date: string | Date): number {
  const d = toDate(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
