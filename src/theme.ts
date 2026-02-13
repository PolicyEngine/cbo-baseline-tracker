import { createTheme } from '@mantine/core';
import type { MantineColorsTuple } from '@mantine/core';
import { colors, typography } from '@policyengine/design-system/tokens';

const primary: MantineColorsTuple = [
  colors.primary[50],
  colors.primary[100],
  colors.primary[200],
  colors.primary[300],
  colors.primary[400],
  colors.primary[500],
  colors.primary[600],
  colors.primary[700],
  colors.primary[800],
  colors.primary[900],
];

const gray: MantineColorsTuple = [
  colors.gray[50],
  colors.gray[100],
  colors.gray[200],
  colors.gray[300],
  colors.gray[400],
  colors.gray[500],
  colors.gray[600],
  colors.gray[700],
  colors.gray[800],
  colors.gray[900],
];

const blue: MantineColorsTuple = [
  colors.blue[50],
  colors.blue[100],
  colors.blue[200],
  colors.blue[300],
  colors.blue[400],
  colors.blue[500],
  colors.blue[600],
  colors.blue[700],
  colors.blue[800],
  colors.blue[900],
];

export const theme = createTheme({
  primaryColor: 'primary',
  colors: {
    primary,
    gray,
    blue,
  },
  fontFamily: typography.fontFamily.primary,
  fontFamilyMonospace: typography.fontFamily.mono,
  fontSizes: {
    xs: typography.fontSize.xs,
    sm: typography.fontSize.sm,
    md: typography.fontSize.base,
    lg: typography.fontSize.lg,
    xl: typography.fontSize.xl,
  },
  headings: {
    fontFamily: typography.fontFamily.primary,
    fontWeight: '600',
  },
  defaultRadius: 'md',
  focusRing: 'auto',
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        shadow: 'xs',
      },
    },
  },
});
