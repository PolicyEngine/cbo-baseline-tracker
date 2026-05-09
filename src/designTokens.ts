/**
 * Design tokens from @policyengine/ui-kit/legacy
 * Re-exported for local use with chart-specific additions.
 *
 * Note: ui-kit/legacy 0.8.0 dropped the `blue` palette and `success`
 * scalar that the original @policyengine/design-system shipped. Until they
 * are restored upstream, this module re-exports a `colors` object that adds
 * those properties back. Values match design-system 0.3.0.
 */

export { typography, spacing } from '@policyengine/ui-kit/legacy/tokens';
import { colors as legacyColors, typography } from '@policyengine/ui-kit/legacy/tokens';

const BLUE_PALETTE = {
  50: '#F0F9FF',
  100: '#E0F2FE',
  200: '#BAE6FD',
  300: '#7DD3FC',
  400: '#38BDF8',
  500: '#0EA5E9',
  600: '#0284C7',
  700: '#026AA2',
  800: '#075985',
  900: '#0C4A6E',
} as const;

const SUCCESS_GREEN = '#22C55E';

export const colors = {
  ...legacyColors,
  blue: BLUE_PALETTE,
  success: SUCCESS_GREEN,
} as const;

export const chartColors = {
  primary: colors.primary[500],
  secondary: colors.blue[500],
  series: [
    colors.primary[500],
    colors.blue[500],
    colors.primary[700],
    colors.blue[700],
    colors.gray[500],
  ],
  positive: colors.success,
  negative: colors.error,
  oldBaseline: colors.gray[400],
  newBaseline: colors.primary[500],
} as const;

export const chartLayout = {
  font: {
    family: typography.fontFamily.primary,
    size: 14,
    color: colors.text.primary,
  },
  paper_bgcolor: colors.background.primary,
  plot_bgcolor: colors.background.primary,
  margin: { l: 60, r: 40, t: 40, b: 60 },
} as const;
