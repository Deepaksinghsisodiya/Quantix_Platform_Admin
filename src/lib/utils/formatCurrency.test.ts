import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('formats a positive USD amount', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-99.9)).toBe('-$99.90');
  });

  it('rounds to two decimal places', () => {
    expect(formatCurrency(10.999)).toBe('$11.00');
  });

  it('defaults to USD when no currency provided', () => {
    const result = formatCurrency(50);
    expect(result).toContain('$');
  });

  it('formats EUR amounts', () => {
    const result = formatCurrency(1000, 'EUR');
    // Intl may render as "€1,000.00" or "EUR 1,000.00" depending on env
    expect(result).toContain('1,000.00');
  });

  it('formats GBP amounts', () => {
    const result = formatCurrency(500, 'GBP');
    expect(result).toContain('500.00');
  });

  it('handles large numbers', () => {
    expect(formatCurrency(1_000_000)).toBe('$1,000,000.00');
  });

  it('handles small decimal amounts', () => {
    expect(formatCurrency(0.01)).toBe('$0.01');
  });
});
