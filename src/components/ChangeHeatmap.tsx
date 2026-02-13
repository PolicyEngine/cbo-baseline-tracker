import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import type { ParameterData, Category } from '@/data/types';
import { chartLayout, chartColors } from '@/designTokens';

interface ChangeHeatmapProps {
  parameters: Record<string, ParameterData>;
  category: Category;
}

export function ChangeHeatmap({ parameters, category }: ChangeHeatmapProps) {
  const filtered = Object.entries(parameters).filter(
    ([, param]) => category === 'all' || param.category === category,
  );

  if (filtered.length === 0) {
    return null;
  }

  // Only show projection years (2024+) to keep the heatmap focused
  const allYears = new Set<string>();
  for (const [, param] of filtered) {
    for (const year of Object.keys(param.pct_change)) {
      if (parseInt(year) >= 2024) {
        allYears.add(year);
      }
    }
  }
  const years = Array.from(allYears).sort();

  if (years.length === 0) {
    return null;
  }

  const labels = filtered.map(([, param]) => param.label);
  const z = filtered.map(([, param]) =>
    years.map((y) => param.pct_change[y] ?? 0),
  );
  const hoverText = filtered.map(([, param]) =>
    years.map((y) => `${param.label}<br>Year: ${y}<br>Change: ${(param.pct_change[y] ?? 0).toFixed(1)}%`),
  );

  // Cap scale at 50% so outliers don't wash out the rest
  const rawMax = Math.max(...z.flat().map((v) => Math.abs(v)), 0.1);
  const maxAbs = Math.min(rawMax, 50);

  const traces: Data[] = [
    {
      x: years,
      y: labels,
      z,
      type: 'heatmap' as const,
      colorscale: [
        [0, chartColors.negative],
        [0.5, '#FFFFFF'],
        [1, chartColors.positive],
      ],
      zmin: -maxAbs,
      zmax: maxAbs,
      text: hoverText as unknown as string[],
      hoverinfo: 'text' as const,
      colorbar: {
        title: { text: '% change' },
        ticksuffix: '%',
      },
    },
  ];

  const chartHeight = Math.max(400, filtered.length * 40 + 150);

  const layout: Partial<Layout> = {
    ...chartLayout,
    title: { text: 'Percentage change across parameters', font: chartLayout.font },
    xaxis: { title: { text: 'Year' }, dtick: 1 },
    yaxis: { automargin: true },
    margin: { ...chartLayout.margin, l: 200 },
    height: chartHeight,
  };

  return (
    <Plot
      data={traces}
      layout={layout}
      config={{ responsive: true }}
      style={{ width: '100%', minHeight: chartHeight }}
    />
  );
}
