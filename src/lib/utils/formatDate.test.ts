import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatDate, formatRelativeTime, daysUntil } from './formatDate';

describe('formatDate', () => {
  describe('short format', () => {
    it('formats a date string in short format', () => {
      const result = formatDate('2026-03-29', 'short');
      expect(result).toBe('Mar 29, 2026');
    });

    it('formats a Date object', () => {
      const result = formatDate(new Date(2026, 0, 15), 'short');
      expect(result).toBe('Jan 15, 2026');
    });

    it('defaults to short format', () => {
      const result = formatDate('2026-06-01');
      expect(result).toBe('Jun 1, 2026');
    });
  });

  describe('long format', () => {
    it('includes weekday and full month', () => {
      // 2026-03-29 is a Sunday
      const result = formatDate('2026-03-29T12:00:00Z', 'long');
      expect(result).toContain('March');
      expect(result).toContain('29');
      expect(result).toContain('2026');
    });
  });

  describe('datetime format', () => {
    it('includes time component', () => {
      const result = formatDate(new Date(2026, 2, 29, 14, 15), 'datetime');
      expect(result).toContain('Mar');
      expect(result).toContain('29');
      expect(result).toContain('2026');
      // Should include time digits
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('relative format', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns relative time string for past dates', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-03-29T12:00:00Z'));

      const result = formatDate('2026-03-28T12:00:00Z', 'relative');
      expect(result).toContain('yesterday');
    });

    it('returns relative time string for future dates', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-03-29T12:00:00Z'));

      const result = formatDate('2026-03-30T12:00:00Z', 'relative');
      expect(result).toContain('tomorrow');
    });
  });
});

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns seconds for very recent times', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-29T12:00:00Z'));

    const result = formatRelativeTime('2026-03-29T11:59:30Z');
    expect(result).toContain('second');
  });

  it('returns minutes for sub-hour differences', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-29T12:00:00Z'));

    const result = formatRelativeTime('2026-03-29T11:55:00Z');
    expect(result).toContain('minute');
  });

  it('returns hours for sub-day differences', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-29T12:00:00Z'));

    const result = formatRelativeTime('2026-03-29T08:00:00Z');
    expect(result).toContain('hour');
  });
});

describe('daysUntil', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns positive number for future dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-29T00:00:00Z'));

    const result = daysUntil('2026-04-01T00:00:00Z');
    expect(result).toBe(3);
  });

  it('returns negative number for past dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-29T00:00:00Z'));

    const result = daysUntil('2026-03-27T00:00:00Z');
    expect(result).toBeLessThan(0);
  });

  it('returns 0 for the same date', () => {
    vi.useFakeTimers();
    const now = new Date('2026-03-29T12:00:00Z');
    vi.setSystemTime(now);

    const result = daysUntil(now);
    expect(result).toBe(0);
  });
});
