/**
 * Design tokens from @policyengine/ui-kit/legacy, re-exported with
 * chart-specific aliases derived from the underlying palette.
 */

export { colors, typography, spacing } from '@policyengine/ui-kit/legacy/tokens';

import { colors, typography } from '@policyengine/ui-kit/legacy/tokens';

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
