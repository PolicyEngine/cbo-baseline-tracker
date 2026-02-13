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
  const years = Object.keys(param.new).sort();
  const oldValues = years.map((y) => param.old[y]);
  const newValues = years.map((y) => param.new[y]);

  const formatFn = param.unit === 'currency-USD' ? formatCurrency : formatCpiValue;

  const hoverOld = years.map(
    (y) => `Year: ${y}<br>Old: ${formatFn(param.old[y])}<br>Change: ${formatPercent(param.pct_change[y])}`,
  );
  const hoverNew = years.map(
    (y) => `Year: ${y}<br>New: ${formatFn(param.new[y])}<br>Change: ${formatPercent(param.pct_change[y])}`,
  );

  const traces: Data[] = [
    {
      x: years,
      y: oldValues,
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: 'Old baseline',
      line: { color: chartColors.oldBaseline, dash: 'dash' as const, width: 2 },
      marker: { size: 5 },
      text: hoverOld,
      hoverinfo: 'text' as const,
    },
    {
      x: years,
      y: newValues,
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: 'New baseline',
      line: { color: chartColors.newBaseline, width: 2 },
      marker: { size: 5 },
      text: hoverNew,
      hoverinfo: 'text' as const,
    },
    {
      x: [...years, ...years.slice().reverse()],
      y: [...newValues, ...oldValues.slice().reverse()],
      type: 'scatter' as const,
      fill: 'toself' as const,
      fillcolor: 'rgba(49, 151, 149, 0.1)',
      line: { color: 'transparent' },
      showlegend: false,
      hoverinfo: 'skip' as const,
    },
  ];

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
