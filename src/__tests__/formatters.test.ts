import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercent, formatNumber, formatCpiValue } from '@/utils/formatters';

describe('formatCurrency', () => {
  it('formats trillions', () => {
    expect(formatCurrency(2_520_000_000_000)).toBe('$2.52 T');
    expect(formatCurrency(1_000_000_000_000)).toBe('$1.00 T');
  });

  it('formats billions', () => {
    expect(formatCurrency(456_000_000_000)).toBe('$456.00 B');
    expect(formatCurrency(1_500_000_000)).toBe('$1.50 B');
  });

  it('formats millions', () => {
    expect(formatCurrency(250_000_000)).toBe('$250.00 M');
    expect(formatCurrency(1_000_000)).toBe('$1.00 M');
  });

  it('formats small numbers', () => {
    expect(formatCurrency(999_999)).toBe('$999,999');
    expect(formatCurrency(0)).toBe('$0');
  });

  it('formats negative values', () => {
    expect(formatCurrency(-2_520_000_000_000)).toBe('-$2.52 T');
    expect(formatCurrency(-456_000_000_000)).toBe('-$456.00 B');
    expect(formatCurrency(-5_000_000)).toBe('-$5.00 M');
  });
});

describe('formatPercent', () => {
  it('formats positive percentages', () => {
    expect(formatPercent(3.24)).toBe('3.2%');
  });

  it('formats negative percentages', () => {
    expect(formatPercent(-1.567)).toBe('-1.6%');
  });

  it('formats zero', () => {
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('supports custom decimals', () => {
    expect(formatPercent(3.456, 2)).toBe('3.46%');
    expect(formatPercent(3.456, 0)).toBe('3%');
  });
});

describe('formatNumber', () => {
  it('formats large numbers with commas', () => {
    expect(formatNumber(1_234_567)).toBe('1,234,567');
  });

  it('formats small numbers', () => {
    expect(formatNumber(42)).toBe('42');
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatCpiValue', () => {
  it('formats typical CPI values', () => {
    expect(formatCpiValue(325.876)).toBe('325.9');
    expect(formatCpiValue(300.0)).toBe('300.0');
    expect(formatCpiValue(299.46)).toBe('299.5');
  });
});
