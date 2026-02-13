import { MantineProvider } from '@mantine/core';
import { theme } from './theme';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { useData } from './data/useData';

export default function App() {
  const { data, loading, error } = useData();

  return (
    <MantineProvider theme={theme}>
      <Header />
      <Dashboard data={data} loading={loading} error={error} />
    </MantineProvider>
  );
}
