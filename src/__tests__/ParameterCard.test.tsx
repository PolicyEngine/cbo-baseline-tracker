import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { theme } from '@/theme';
import { ParameterCard } from '@/components/ParameterCard';
import type { ParameterData } from '@/data/types';

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

describe('ParameterCard', () => {
  it('renders the parameter label', () => {
    renderWithMantine(
      <ParameterCard param={mockParam} paramKey="individual_income_tax" onClick={() => {}} />,
    );
    expect(screen.getByText('Individual income tax revenue')).toBeInTheDocument();
  });

  it('shows formatted currency values', () => {
    renderWithMantine(
      <ParameterCard param={mockParam} paramKey="individual_income_tax" onClick={() => {}} />,
    );
    // Latest year (2026): old=$2.79T, new=$2.97T
    expect(screen.getByText('$2.79 T')).toBeInTheDocument();
    expect(screen.getByText('$2.97 T')).toBeInTheDocument();
  });

  it('shows percentage change', () => {
    renderWithMantine(
      <ParameterCard param={mockParam} paramKey="individual_income_tax" onClick={() => {}} />,
    );
    expect(screen.getByText('6.4%')).toBeInTheDocument();
  });

  it('shows category badge', () => {
    renderWithMantine(
      <ParameterCard param={mockParam} paramKey="individual_income_tax" onClick={() => {}} />,
    );
    expect(screen.getByText('revenue')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    renderWithMantine(
      <ParameterCard param={mockParam} paramKey="individual_income_tax" onClick={handleClick} />,
    );
    await user.click(screen.getByTestId('parameter-card'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
