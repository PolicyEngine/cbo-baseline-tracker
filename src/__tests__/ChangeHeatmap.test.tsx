import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { theme } from '@/theme';
import type { ParameterData } from '@/data/types';

vi.mock('react-plotly.js', () => ({
  default: ({ data, layout }: { data: unknown[]; layout: { title?: { text?: string } } }) => (
    <div data-testid="plotly-heatmap" data-traces={data.length} data-title={layout?.title?.text} />
  ),
}));

import { ChangeHeatmap } from '@/components/ChangeHeatmap';

const mockParameters: Record<string, ParameterData> = {
  individual_income_tax: {
    label: 'Individual income tax revenue',
    unit: 'currency-USD',
    category: 'revenue',
    old: { '2025': 2520000000000, '2026': 2789000000000 },
    new: { '2025': 2621342000000, '2026': 2968420000000 },
    pct_change: { '2025': 4.02, '2026': 6.43 },
  },
  social_security: {
    label: 'Social Security spending',
    unit: 'currency-USD',
    category: 'spending',
    old: { '2025': 1500000000000, '2026': 1600000000000 },
    new: { '2025': 1520000000000, '2026': 1630000000000 },
    pct_change: { '2025': 1.33, '2026': 1.88 },
  },
};

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider theme={theme}>{ui}</MantineProvider>);
}

describe('ChangeHeatmap', () => {
  it('renders without crashing with all categories', () => {
    renderWithMantine(
      <ChangeHeatmap parameters={mockParameters} category="all" />,
    );
    expect(screen.getByTestId('plotly-heatmap')).toBeInTheDocument();
  });

  it('passes one trace for heatmap', () => {
    renderWithMantine(
      <ChangeHeatmap parameters={mockParameters} category="all" />,
    );
    const chart = screen.getByTestId('plotly-heatmap');
    expect(chart.getAttribute('data-traces')).toBe('1');
  });

  it('filters by category', () => {
    renderWithMantine(
      <ChangeHeatmap parameters={mockParameters} category="spending" />,
    );
    expect(screen.getByTestId('plotly-heatmap')).toBeInTheDocument();
  });

  it('returns null when no parameters match category', () => {
    renderWithMantine(
      <ChangeHeatmap parameters={mockParameters} category="cpi" />,
    );
    expect(screen.queryByTestId('plotly-heatmap')).toBeNull();
  });
});
