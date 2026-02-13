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
  const allValues = [...oldValues.filter(v => v !== undefined), ...newValues.filter(v => v !== undefined)];
  if (allValues.length === 0) return null;
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
  const newYears = Object.keys(param.new).sort();
  const latestYear = newYears[newYears.length - 1];
  const oldLatest = param.old[latestYear];
  const newLatest = param.new[latestYear];

  // Find a year that has both old and new for pct_change
  const pctYears = Object.keys(param.pct_change).sort();
  const pctLatest = pctYears.length > 0 ? param.pct_change[pctYears[pctYears.length - 1]] : undefined;

  const oldYears = Object.keys(param.old).sort();
  const oldValues = oldYears.map((y) => param.old[y]);
  const newValues = newYears.map((y) => param.new[y]);

  const hasComparison = oldLatest !== undefined && pctLatest !== undefined;
  const isPositiveChange = pctLatest !== undefined && pctLatest >= 0;
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
          {hasComparison ? (
            <>
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
                {formatPercent(pctLatest!)}
              </Badge>
            </>
          ) : (
            <Text size="sm" fw={500}>
              {formatValue(newLatest, param.unit)}
            </Text>
          )}
        </Group>

        <Sparkline oldValues={oldValues} newValues={newValues} />
      </Stack>
    </Card>
  );
}
