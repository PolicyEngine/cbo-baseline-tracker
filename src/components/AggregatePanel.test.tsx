import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AggregatePanel } from './AggregatePanel';

const MOCK_DATA = {
  metadata: {
    old_baseline: 'Sep 2025 (CPI) + Jan 2025 (other)',
    new_baseline: 'February 2026',
    source_url: 'https://www.cbo.gov/publication/61882',
    generated_at: '2026-02-13T00:00:00Z',
    revenue_components: ['income_tax', 'payroll_taxes'],
    spending_components: ['social_security', 'snap', 'ssi', 'unemployment_compensation'],
  },
  years: ['2025', '2026', '2027'],
  metrics: {
    total_revenue: {
      label: 'Total federal revenue',
      description: 'Income tax + payroll taxes',
      old: { '2025': 4379964000000, '2026': 4808675000000, '2027': 5168243000000 },
      new: { '2025': 4404338000000, '2026': 4576864000000, '2027': 4843689000000 },
      pct_change: { '2025': 0.56, '2026': -4.82, '2027': -6.28 },
      diff: { '2025': 24374000000, '2026': -231811000000, '2027': -324554000000 },
    },
    total_spending: {
      label: 'Total mandatory spending',
      description: 'Social Security + SNAP + SSI + unemployment',
      old: { '2025': 1771547000000, '2026': 1870403000000, '2027': 1973819000000 },
      new: { '2025': 1784274000000, '2026': 1875125000000, '2027': 1980052000000 },
      pct_change: { '2025': 0.72, '2026': 0.25, '2027': 0.32 },
      diff: { '2025': 12727000000, '2026': 4722000000, '2027': 6233000000 },
    },
    fiscal_balance: {
      label: 'Fiscal balance',
      description: 'Revenue minus mandatory spending',
      old: { '2025': 2608417000000, '2026': 2938272000000, '2027': 3194424000000 },
      new: { '2025': 2620064000000, '2026': 2701739000000, '2027': 2863637000000 },
      pct_change: { '2025': 0.45, '2026': -8.05, '2027': -10.36 },
      diff: { '2025': 11647000000, '2026': -236533000000, '2027': -330787000000 },
    },
  },
};

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('AggregatePanel', () => {
  it('renders loading state initially', () => {
    // Mock fetch that never resolves
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}));
    const { container } = renderWithMantine(<AggregatePanel />);
    // Mantine Loader renders a span with the mantine-Loader-root class
    expect(container.querySelector('.mantine-Loader-root')).toBeInTheDocument();
  });

  it('renders error state on fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    } as Response);

    renderWithMantine(<AggregatePanel />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading aggregate data/)).toBeInTheDocument();
    });
  });

  it('renders metric cards with data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_DATA),
    } as Response);

    renderWithMantine(<AggregatePanel />);

    await waitFor(() => {
      expect(screen.getByTestId('aggregate-panel')).toBeInTheDocument();
    });

    // Check that all three metric cards are rendered
    const cards = screen.getAllByTestId('metric-card');
    expect(cards).toHaveLength(3);

    // Check metric labels are present
    expect(screen.getByText('Total federal revenue')).toBeInTheDocument();
    expect(screen.getByText('Total mandatory spending')).toBeInTheDocument();
    expect(screen.getByText('Fiscal balance')).toBeInTheDocument();
  });

  it('renders the section title', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_DATA),
    } as Response);

    renderWithMantine(<AggregatePanel />);

    await waitFor(() => {
      expect(screen.getByText('Aggregate fiscal impact')).toBeInTheDocument();
    });
  });

  it('shows baseline comparison description', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_DATA),
    } as Response);

    renderWithMantine(<AggregatePanel />);

    await waitFor(() => {
      expect(
        screen.getByText(/Sep 2025.*February 2026/),
      ).toBeInTheDocument();
    });
  });

  it('displays the latest overlapping year in metric cards', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_DATA),
    } as Response);

    renderWithMantine(<AggregatePanel />);

    await waitFor(() => {
      // The latest overlapping year in the mock data is 2027
      const yearTexts = screen.getAllByText('in 2027');
      expect(yearTexts.length).toBe(3);
    });
  });

  it('renders null when data is null after loading', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null),
    } as Response);

    const { container } = renderWithMantine(<AggregatePanel />);

    // Wait for loading to finish then check it doesn't render much
    await waitFor(() => {
      // After loading null data, the component returns null
      expect(container.querySelector('[data-testid="aggregate-panel"]')).not.toBeInTheDocument();
    });
  });
});
