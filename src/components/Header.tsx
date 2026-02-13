import { Box, Title, Text, Group, Anchor, Badge } from '@mantine/core';
import { colors } from '@/designTokens';
import type { CBOComparison } from '@/data/types';

interface HeaderProps {
  metadata?: CBOComparison['metadata'];
}

export function Header({ metadata }: HeaderProps) {
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
          {metadata ? (
            <Group gap="xs" mt={8}>
              <Badge variant="outline" color="gray" size="sm">
                {metadata.old_baseline}
              </Badge>
              <Text size="sm" c="dimmed">vs</Text>
              <Badge variant="filled" color="primary" size="sm">
                {metadata.new_baseline}
              </Badge>
            </Group>
          ) : (
            <Text size="sm" c="dimmed" mt={4}>
              Comparing CBO budget projections across baselines
            </Text>
          )}
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
