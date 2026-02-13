import { useState } from 'react';
import { Container, Grid, Modal, Stack, Loader, Alert, Center } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { CBOComparison, Category } from '@/data/types';
import { CategoryFilter } from './CategoryFilter';
import { ParameterCard } from './ParameterCard';
import { ComparisonChart } from './ComparisonChart';
import { ChangeHeatmap } from './ChangeHeatmap';

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
    <Container size="xl" py="lg">
      <Stack gap="lg">
        <CategoryFilter value={selectedCategory} onChange={setSelectedCategory} />

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

        <Modal
          opened={selectedParam !== null}
          onClose={() => setSelectedParam(null)}
          title={selectedParamData?.label}
          size="xl"
        >
          {selectedParamData && selectedParam && (
            <ComparisonChart param={selectedParamData} paramKey={selectedParam} />
          )}
        </Modal>

        <ChangeHeatmap parameters={data.parameters} category={selectedCategory} />
      </Stack>
    </Container>
  );
}
