import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('merges simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional values (false / undefined / null)', () => {
    expect(cn('base', false && 'hidden', undefined, null)).toBe('base');
  });

  it('deduplicates conflicting Tailwind classes (last wins)', () => {
    const result = cn('p-4', 'p-2');
    expect(result).toBe('p-2');
  });

  it('merges Tailwind colour variants correctly', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('');
  });

  it('handles array inputs', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('handles object inputs (clsx style)', () => {
    expect(cn({ visible: true, hidden: false })).toBe('visible');
  });

  it('keeps non-conflicting Tailwind classes', () => {
    const result = cn('p-4', 'mt-2', 'text-sm');
    expect(result).toBe('p-4 mt-2 text-sm');
  });
});
