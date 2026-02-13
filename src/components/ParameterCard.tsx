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

function formatValue(value: number, unit: string, category: string): string {
  if (category === 'cpi') {
    return formatCpiValue(value);
  }
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

  const width = 200;
  const height = 36;
  const padY = 3;

  function toPoints(values: number[]): string {
    return values
      .filter(v => v !== undefined)
      .map((v, i, arr) => {
        const x = arr.length > 1 ? (i / (arr.length - 1)) * width : width / 2;
        const y = height - padY - ((v - min) / range) * (height - 2 * padY);
        return `${x},${y}`;
      })
      .join(' ');
  }

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
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
  const oldYears = Object.keys(param.old).sort();
  const newValues = newYears.map((y) => param.new[y]);
  const oldValues = oldYears.map((y) => param.old[y]);

  // Find the latest year that exists in both old and new for comparison
  const overlapYears = newYears.filter((y) => param.old[y] !== undefined).sort();
  const comparisonYear = overlapYears.length > 0 ? overlapYears[overlapYears.length - 1] : null;

  const newLatest = param.new[newYears[newYears.length - 1]];
  const oldComparison = comparisonYear ? param.old[comparisonYear] : undefined;
  const newComparison = comparisonYear ? param.new[comparisonYear] : undefined;
  const pctComparison = comparisonYear ? param.pct_change[comparisonYear] : undefined;

  const hasComparison = oldComparison !== undefined && newComparison !== undefined && pctComparison !== undefined;
  const isPositiveChange = pctComparison !== undefined && pctComparison >= 0;
  const changeColor = isPositiveChange ? 'green' : 'red';

  return (
    <Card
      withBorder
      padding="md"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
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

        <Group gap="xs" align="center" wrap="nowrap">
          {hasComparison ? (
            <>
              <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                {formatValue(oldComparison!, param.unit, param.category)}
              </Text>
              <Text size="xs" c="dimmed">&rarr;</Text>
              <Text size="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
                {formatValue(newComparison!, param.unit, param.category)}
              </Text>
              <Badge size="xs" variant="light" color={changeColor}>
                {formatPercent(pctComparison!)}
              </Badge>
            </>
          ) : (
            <Text size="sm" fw={500}>
              {formatValue(newLatest, param.unit, param.category)}
            </Text>
          )}
        </Group>

        {comparisonYear && (
          <Text size="xs" c="dimmed">in {comparisonYear}</Text>
        )}

        <Sparkline oldValues={oldValues} newValues={newValues} />
      </Stack>
    </Card>
  );
}
