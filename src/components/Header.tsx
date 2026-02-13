import { Box, Title, Text, Group, Anchor } from '@mantine/core';
import { colors } from '@/designTokens';

export function Header() {
  return (
    <Box
      py="lg"
      px="xl"
      style={{
        backgroundColor: colors.background.primary,
        borderBottom: `1px solid ${colors.border.light}`,
      }}
    >
      <Group justify="space-between" align="center">
        <div>
          <Text
            fw={700}
            size="lg"
            style={{ color: colors.primary[500], letterSpacing: '-0.02em' }}
          >
            PolicyEngine
          </Text>
          <Title order={2} mt={4}>
            CBO baseline tracker
          </Title>
          <Text size="sm" c="dimmed" mt={4}>
            Comparing CBO budget projections across baselines
          </Text>
        </div>
        <Anchor
          href="https://www.cbo.gov/data/budget-economic-data"
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
        >
          CBO source data
        </Anchor>
      </Group>
    </Box>
  );
}
