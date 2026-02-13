import { useState, useEffect } from 'react';
import type { AggregateImpacts } from './types';

interface UseAggregateDataResult {
  data: AggregateImpacts | null;
  loading: boolean;
  error: string | null;
}

export function useAggregateData(): UseAggregateDataResult {
  const [data, setData] = useState<AggregateImpacts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const response = await fetch('/data/aggregate_impacts.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch aggregate data: ${response.status} ${response.statusText}`);
        }
        const json: AggregateImpacts = await response.json();
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
