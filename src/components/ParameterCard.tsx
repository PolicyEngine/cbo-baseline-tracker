import { Card, Text, Badge, Group, Stack } from '@mantine/core';
import type { ParameterData } from '@/data/types';
import { formatCurrency, formatPercent, formatCpiValue } from '@/utils/formatters';
import { colors } from '@/designTokens';

interface ParameterCardProps {
  param: ParameterData;
  paramKey: string;
  onClick: () => void;
}

const categoryColors: Record<string, string> = {
  revenue: 'blue',
  spending: 'red',
  income: 'green',
  cpi: 'orange',
};

function formatValue(value: number, unit: string): string {
  if (unit === 'currency-USD') {
    return formatCurrency(value);
  }
  return formatCpiValue(value);
}

function Sparkline({ oldValues, newValues }: { oldValues: number[]; newValues: number[] }) {
  const allValues = [...oldValues, ...newValues];
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;

  const width = 120;
  const height = 32;
  const padY = 2;

  function toPoints(values: number[]): string {
    return values
      .map((v, i) => {
        const x = values.length > 1 ? (i / (values.length - 1)) * width : width / 2;
        const y = height - padY - ((v - min) / range) * (height - 2 * padY);
        return `${x},${y}`;
      })
      .join(' ');
  }

  return (
    <svg width={width} height={height} aria-hidden="true">
      <polyline
        points={toPoints(oldValues)}
        fill="none"
        stroke={colors.gray[400]}
        strokeWidth="1.5"
        strokeDasharray="4 2"
      />
      <polyline
        points={toPoints(newValues)}
        fill="none"
        stroke={colors.primary[500]}
        strokeWidth="2"
      />
    </svg>
  );
}

export function ParameterCard({ param, paramKey: _paramKey, onClick }: ParameterCardProps) {
  const years = Object.keys(param.new).sort();
  const latestYear = years[years.length - 1];
  const oldLatest = param.old[latestYear];
  const newLatest = param.new[latestYear];
  const pctLatest = param.pct_change[latestYear];

  const oldValues = years.map((y) => param.old[y]);
  const newValues = years.map((y) => param.new[y]);

  const isPositiveChange = pctLatest >= 0;
  const changeColor = isPositiveChange ? 'green' : 'red';

  return (
    <Card
      withBorder
      padding="md"
      onClick={onClick}
      style={{ cursor: 'pointer', transition: 'box-shadow 0.15s ease' }}
      data-testid="parameter-card"
    >
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Text fw={600} size="sm" lineClamp={2} style={{ flex: 1 }}>
            {param.label}
          </Text>
          <Badge size="xs" variant="light" color={categoryColors[param.category]}>
            {param.category}
          </Badge>
        </Group>

        <Group gap="xs" align="center">
          <Text size="xs" c="dimmed">
            {formatValue(oldLatest, param.unit)}
          </Text>
          <Text size="xs" c="dimmed">
            &rarr;
          </Text>
          <Text size="sm" fw={500}>
            {formatValue(newLatest, param.unit)}
          </Text>
          <Badge size="xs" variant="light" color={changeColor}>
            {formatPercent(pctLatest)}
          </Badge>
        </Group>

        <Sparkline oldValues={oldValues} newValues={newValues} />
      </Stack>
    </Card>
  );
}
