import { Card, Text, Group, Stack, SimpleGrid, Badge, Loader, Alert, Center, Title } from '@mantine/core';
import { IconAlertCircle, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import type { AggregateImpacts, AggregateMetric } from '@/data/types';
import { useAggregateData } from '@/data/useAggregateData';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { chartLayout, chartColors, colors } from '@/designTokens';

function MetricCard({ metric, year }: { metric: AggregateMetric; year: string }) {
  const oldVal = metric.old[year];
  const newVal = metric.new[year];
  const pctChange = metric.pct_change[year];
  const diff = metric.diff[year];

  const hasData = oldVal !== undefined && newVal !== undefined;
  const isPositive = pctChange !== undefined && pctChange >= 0;

  return (
    <Card withBorder padding="md" data-testid="metric-card">
      <Stack gap="xs">
        <Text fw={600} size="sm">{metric.label}</Text>
        <Text size="xs" c="dimmed">{metric.description}</Text>

        {hasData ? (
          <>
            <Group gap="xs" align="center" wrap="nowrap">
              <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                {formatCurrency(oldVal)}
              </Text>
              <Text size="xs" c="dimmed">&rarr;</Text>
              <Text size="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
                {formatCurrency(newVal)}
              </Text>
            </Group>

            <Group gap="xs" align="center">
              {pctChange !== undefined && (
                <Badge
                  size="sm"
                  variant="light"
                  color={isPositive ? 'green' : 'red'}
                  leftSection={isPositive ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />}
                >
                  {formatPercent(pctChange)}
                </Badge>
              )}
              {diff !== undefined && (
                <Text size="xs" c="dimmed">
                  ({diff >= 0 ? '+' : ''}{formatCurrency(diff)})
                </Text>
              )}
            </Group>

            <Text size="xs" c="dimmed">in {year}</Text>
          </>
        ) : (
          <Text size="sm" c="dimmed">No data for {year}</Text>
        )}
      </Stack>
    </Card>
  );
}

function AggregateChart({ data }: { data: AggregateImpacts }) {
  const years = data.years;
  const revenue = data.metrics.total_revenue;
  const spending = data.metrics.total_spending;

  const traces: Data[] = [
    // Old revenue (dashed)
    {
      x: years.filter((y) => revenue.old[y] !== undefined),
      y: years.filter((y) => revenue.old[y] !== undefined).map((y) => revenue.old[y]),
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: 'Revenue (old)',
      line: { color: chartColors.oldBaseline, dash: 'dash' as const, width: 2 },
      marker: { size: 5 },
      legendgroup: 'revenue',
      text: years
        .filter((y) => revenue.old[y] !== undefined)
        .map((y) => `Year: ${y}<br>Revenue (old): ${formatCurrency(revenue.old[y])}`),
      hoverinfo: 'text' as const,
    },
    // New revenue (solid teal)
    {
      x: years.filter((y) => revenue.new[y] !== undefined),
      y: years.filter((y) => revenue.new[y] !== undefined).map((y) => revenue.new[y]),
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: 'Revenue (new)',
      line: { color: chartColors.newBaseline, width: 2 },
      marker: { size: 5 },
      legendgroup: 'revenue',
      text: years
        .filter((y) => revenue.new[y] !== undefined)
        .map((y) => `Year: ${y}<br>Revenue (new): ${formatCurrency(revenue.new[y])}`),
      hoverinfo: 'text' as const,
    },
    // Old spending (dashed blue)
    {
      x: years.filter((y) => spending.old[y] !== undefined),
      y: years.filter((y) => spending.old[y] !== undefined).map((y) => spending.old[y]),
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: 'Spending (old)',
      line: { color: colors.blue[300], dash: 'dash' as const, width: 2 },
      marker: { size: 5 },
      legendgroup: 'spending',
      text: years
        .filter((y) => spending.old[y] !== undefined)
        .map((y) => `Year: ${y}<br>Spending (old): ${formatCurrency(spending.old[y])}`),
      hoverinfo: 'text' as const,
    },
    // New spending (solid blue)
    {
      x: years.filter((y) => spending.new[y] !== undefined),
      y: years.filter((y) => spending.new[y] !== undefined).map((y) => spending.new[y]),
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: 'Spending (new)',
      line: { color: chartColors.secondary, width: 2 },
      marker: { size: 5 },
      legendgroup: 'spending',
      text: years
        .filter((y) => spending.new[y] !== undefined)
        .map((y) => `Year: ${y}<br>Spending (new): ${formatCurrency(spending.new[y])}`),
      hoverinfo: 'text' as const,
    },
  ];

  const layout: Partial<Layout> = {
    ...chartLayout,
    title: { text: 'Revenue vs. mandatory spending over time', font: chartLayout.font },
    xaxis: { title: { text: 'Year' }, dtick: 1 },
    yaxis: { title: { text: 'USD' } },
    legend: { orientation: 'h' as const, y: -0.25 },
    hovermode: 'x unified' as const,
  };

  return (
    <Plot
      data={traces}
      layout={{ ...layout, height: 450 }}
      config={{ responsive: true }}
      style={{ width: '100%', minHeight: 450 }}
    />
  );
}

function FiscalBalanceChart({ data }: { data: AggregateImpacts }) {
  const years = data.years;
  const balance = data.metrics.fiscal_balance;

  const oldYears = years.filter((y) => balance.old[y] !== undefined);
  const newYears = years.filter((y) => balance.new[y] !== undefined);

  const traces: Data[] = [
    {
      x: oldYears,
      y: oldYears.map((y) => balance.old[y]),
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: 'Old baseline',
      line: { color: chartColors.oldBaseline, dash: 'dash' as const, width: 2 },
      marker: { size: 5 },
      text: oldYears.map((y) => `Year: ${y}<br>Balance (old): ${formatCurrency(balance.old[y])}`),
      hoverinfo: 'text' as const,
    },
    {
      x: newYears,
      y: newYears.map((y) => balance.new[y]),
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: 'New baseline',
      line: { color: chartColors.newBaseline, width: 2 },
      marker: { size: 5 },
      text: newYears.map((y) => `Year: ${y}<br>Balance (new): ${formatCurrency(balance.new[y])}`),
      hoverinfo: 'text' as const,
    },
  ];

  // Shaded fill between old and new for overlapping years
  const overlapYears = oldYears.filter((y) => balance.new[y] !== undefined);
  if (overlapYears.length > 0) {
    traces.push({
      x: [...overlapYears, ...overlapYears.slice().reverse()],
      y: [
        ...overlapYears.map((y) => balance.new[y]),
        ...overlapYears.slice().reverse().map((y) => balance.old[y]),
      ],
      type: 'scatter' as const,
      fill: 'toself' as const,
      fillcolor: 'rgba(49, 151, 149, 0.1)',
      line: { color: 'transparent' },
      showlegend: false,
      hoverinfo: 'skip' as const,
    });
  }

  const layout: Partial<Layout> = {
    ...chartLayout,
    title: { text: 'Fiscal balance (revenue minus mandatory spending)', font: chartLayout.font },
    xaxis: { title: { text: 'Year' }, dtick: 1 },
    yaxis: { title: { text: 'USD' } },
    legend: { orientation: 'h' as const, y: -0.25 },
    hovermode: 'x unified' as const,
  };

  return (
    <Plot
      data={traces}
      layout={{ ...layout, height: 450 }}
      config={{ responsive: true }}
      style={{ width: '100%', minHeight: 450 }}
    />
  );
}

export function AggregatePanel() {
  const { data, loading, error } = useAggregateData();

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle />} title="Error loading aggregate data" color="red">
        {error}
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  // Find the latest overlapping year for summary cards
  const overlapYears = data.years.filter(
    (y) =>
      data.metrics.total_revenue.old[y] !== undefined &&
      data.metrics.total_revenue.new[y] !== undefined,
  );
  const latestYear = overlapYears[overlapYears.length - 1] ?? data.years[data.years.length - 1];

  return (
    <Stack gap="lg" data-testid="aggregate-panel">
      <div>
        <Title order={4} mb="xs">Aggregate fiscal impact</Title>
        <Text size="sm" c="dimmed" mb="sm">
          Comparing {data.metadata.old_baseline} with {data.metadata.new_baseline} CBO baselines
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <MetricCard metric={data.metrics.total_revenue} year={latestYear} />
        <MetricCard metric={data.metrics.total_spending} year={latestYear} />
        <MetricCard metric={data.metrics.fiscal_balance} year={latestYear} />
      </SimpleGrid>

      <AggregateChart data={data} />

      <FiscalBalanceChart data={data} />
    </Stack>
  );
}
