import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { theme } from '@/theme';
import type { ParameterData } from '@/data/types';

vi.mock('react-plotly.js', () => ({
  default: ({ data, layout }: { data: unknown[]; layout: { title?: { text?: string } } }) => (
    <div data-testid="plotly-chart" data-traces={data.length} data-title={layout?.title?.text} />
  ),
}));

import { ComparisonChart } from '@/components/ComparisonChart';

const mockParam: ParameterData = {
  label: 'Individual income tax revenue',
  unit: 'currency-USD',
  category: 'revenue',
  old: { '2025': 2520000000000, '2026': 2789000000000 },
  new: { '2025': 2621342000000, '2026': 2968420000000 },
  pct_change: { '2025': 4.02, '2026': 6.43 },
};

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider theme={theme}>{ui}</MantineProvider>);
}

describe('ComparisonChart', () => {
  it('renders without crashing', () => {
    renderWithMantine(
      <ComparisonChart param={mockParam} paramKey="individual_income_tax" />,
    );
    expect(screen.getByTestId('plotly-chart')).toBeInTheDocument();
  });

  it('passes correct number of traces (old line, new line, fill area)', () => {
    renderWithMantine(
      <ComparisonChart param={mockParam} paramKey="individual_income_tax" />,
    );
    const chart = screen.getByTestId('plotly-chart');
    expect(chart.getAttribute('data-traces')).toBe('3');
  });

  it('passes the parameter label as title', () => {
    renderWithMantine(
      <ComparisonChart param={mockParam} paramKey="individual_income_tax" />,
    );
    const chart = screen.getByTestId('plotly-chart');
    expect(chart.getAttribute('data-title')).toBe('Individual income tax revenue');
  });
});
