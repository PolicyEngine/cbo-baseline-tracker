import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import type { ParameterData } from '@/data/types';
import { chartLayout, chartColors } from '@/designTokens';
import { formatCurrency, formatPercent, formatCpiValue } from '@/utils/formatters';

interface ComparisonChartProps {
  param: ParameterData;
  paramKey: string;
}

export function ComparisonChart({ param, paramKey: _paramKey }: ComparisonChartProps) {
  const newYears = Object.keys(param.new).sort();
  const oldYears = Object.keys(param.old).sort();
  const allYears = Array.from(new Set([...oldYears, ...newYears])).sort();

  const formatFn = param.unit === 'currency-USD' ? formatCurrency : formatCpiValue;

  const hasOld = oldYears.length > 0;

  const traces: Data[] = [];

  if (hasOld) {
    traces.push({
      x: oldYears,
      y: oldYears.map((y) => param.old[y]),
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: 'Old baseline',
      line: { color: chartColors.oldBaseline, dash: 'dash' as const, width: 2 },
      marker: { size: 5 },
      text: oldYears.map(
        (y) => {
          const pct = param.pct_change[y];
          return `Year: ${y}<br>Old: ${formatFn(param.old[y])}${pct !== undefined ? `<br>Change: ${formatPercent(pct)}` : ''}`;
        },
      ),
      hoverinfo: 'text' as const,
    });
  }

  traces.push({
    x: newYears,
    y: newYears.map((y) => param.new[y]),
    type: 'scatter' as const,
    mode: 'lines+markers' as const,
    name: 'New baseline',
    line: { color: chartColors.newBaseline, width: 2 },
    marker: { size: 5 },
    text: newYears.map(
      (y) => {
        const pct = param.pct_change[y];
        return `Year: ${y}<br>New: ${formatFn(param.new[y])}${pct !== undefined ? `<br>Change: ${formatPercent(pct)}` : ''}`;
      },
    ),
    hoverinfo: 'text' as const,
  });

  // Shaded fill between old and new for overlapping years
  if (hasOld) {
    const overlapYears = allYears.filter((y) => param.old[y] !== undefined && param.new[y] !== undefined);
    if (overlapYears.length > 0) {
      traces.push({
        x: [...overlapYears, ...overlapYears.slice().reverse()],
        y: [
          ...overlapYears.map((y) => param.new[y]),
          ...overlapYears.slice().reverse().map((y) => param.old[y]),
        ],
        type: 'scatter' as const,
        fill: 'toself' as const,
        fillcolor: 'rgba(49, 151, 149, 0.1)',
        line: { color: 'transparent' },
        showlegend: false,
        hoverinfo: 'skip' as const,
      });
    }
  }

  const layout: Partial<Layout> = {
    ...chartLayout,
    title: { text: param.label, font: chartLayout.font },
    xaxis: { title: { text: 'Year' }, dtick: 1 },
    yaxis: { title: { text: param.unit === 'currency-USD' ? 'USD' : 'Index' } },
    legend: { orientation: 'h' as const, y: -0.2 },
    hovermode: 'x unified' as const,
  };

  return (
    <Plot
      data={traces}
      layout={layout}
      config={{ responsive: true }}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
