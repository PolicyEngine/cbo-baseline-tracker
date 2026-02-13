import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useData } from '@/data/useData';
import type { CBOComparison } from '@/data/types';

const mockData: CBOComparison = {
  metadata: {
    old_baseline: 'February 2024',
    new_baseline: 'February 2026',
    source_url: 'https://www.cbo.gov/data/budget-economic-data',
    generated_at: '2026-02-13T00:00:00Z',
  },
  parameters: {
    individual_income_tax: {
      label: 'Individual income tax revenue',
      unit: 'currency-USD',
      category: 'revenue',
      old: { '2025': 2520000000000 },
      new: { '2025': 2621342000000 },
      pct_change: { '2025': 4.02 },
    },
  },
};

const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('useData', () => {
  it('starts in loading state', () => {
    globalThis.fetch = vi.fn(() =>
      new Promise<Response>(() => {}),
    );
    const { result } = renderHook(() => useData());
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('returns data on successful fetch', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify(mockData), { status: 200 })),
    );

    const { result } = renderHook(() => useData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('returns error on fetch failure', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(new Response(null, { status: 500, statusText: 'Internal Server Error' })),
    );

    const { result } = renderHook(() => useData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Failed to fetch data: 500 Internal Server Error');
  });

  it('returns error on network failure', async () => {
    globalThis.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    const { result } = renderHook(() => useData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network error');
  });
});
