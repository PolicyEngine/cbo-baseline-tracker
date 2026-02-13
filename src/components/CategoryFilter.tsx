import { SegmentedControl } from '@mantine/core';
import type { Category } from '@/data/types';

interface CategoryFilterProps {
  value: Category;
  onChange: (value: Category) => void;
}

const options = [
  { label: 'All', value: 'all' },
  { label: 'Revenue', value: 'revenue' },
  { label: 'Spending', value: 'spending' },
  { label: 'Income', value: 'income' },
  { label: 'CPI', value: 'cpi' },
];

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <SegmentedControl
      value={value}
      onChange={(val) => onChange(val as Category)}
      data={options}
      size="sm"
    />
  );
}
