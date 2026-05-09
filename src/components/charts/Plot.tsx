'use client';

/**
 * Client-only Plotly wrapper.
 *
 * react-plotly.js touches `window` at module-evaluation time, so importing it
 * during Next's server render crashes the build. next/dynamic with ssr:false
 * defers the require to the browser.
 */
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { PlotParams } from 'react-plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
}) as ComponentType<PlotParams>;

export default Plot;
