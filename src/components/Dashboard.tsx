'use client';

import { useState } from 'react';
import { Container, Grid, Modal, Stack, Loader, Alert, Center, Title, Text, Group } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { CBOComparison, Category } from '@/data/types';
import { CategoryFilter } from './CategoryFilter';
import { ParameterCard } from './ParameterCard';
import { ComparisonChart } from './ComparisonChart';
import { ChangeHeatmap } from './ChangeHeatmap';
import { AggregatePanel } from './AggregatePanel';

interface DashboardProps {
  data: CBOComparison | null;
  loading: boolean;
  error: string | null;
}

export function Dashboard({ data, loading, error }: DashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedParam, setSelectedParam] = useState<string | null>(null);

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container py="xl">
        <Alert icon={<IconAlertCircle />} title="Error loading data" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!data) {
    return null;
  }

  const filteredParams = Object.entries(data.parameters).filter(
    ([, param]) => selectedCategory === 'all' || param.category === selectedCategory,
  );

  const selectedParamData = selectedParam ? data.parameters[selectedParam] : null;

  return (
    <Container component="main" size="xl" py="lg" role="main">
      <Stack gap="xl">
        <CategoryFilter value={selectedCategory} onChange={setSelectedCategory} />

        <section aria-label="Parameter projections">
          <Group justify="space-between" mb="sm">
            <Title order={2} size="h4">Parameter projections</Title>
            <Text size="sm" c="dimmed">{filteredParams.length} parameters</Text>
          </Group>
          <Grid>
            {filteredParams.map(([key, param]) => (
              <Grid.Col key={key} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <ParameterCard
                  param={param}
                  paramKey={key}
                  onClick={() => setSelectedParam(key)}
                />
              </Grid.Col>
            ))}
          </Grid>
        </section>

        <Modal
          opened={selectedParam !== null}
          onClose={() => setSelectedParam(null)}
          title={selectedParamData?.label}
          size="xl"
          centered
        >
          {selectedParamData && selectedParam && (
            <ComparisonChart param={selectedParamData} paramKey={selectedParam} />
          )}
        </Modal>

        <section aria-label="Change heatmap">
          <Title order={2} size="h4" mb="sm">Change heatmap</Title>
          <ChangeHeatmap parameters={data.parameters} category={selectedCategory} />
        </section>

        <AggregatePanel />
      </Stack>
    </Container>
  );
}
