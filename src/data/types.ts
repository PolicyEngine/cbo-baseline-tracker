export interface ParameterData {
  label: string;
  unit: string;
  category: 'revenue' | 'spending' | 'income' | 'cpi';
  old: Record<string, number>;
  new: Record<string, number>;
  pct_change: Record<string, number>;
}

export interface CBOComparison {
  metadata: {
    old_baseline: string;
    new_baseline: string;
    source_url: string;
    generated_at: string;
  };
  parameters: Record<string, ParameterData>;
}

export type Category = 'all' | 'revenue' | 'spending' | 'income' | 'cpi';
