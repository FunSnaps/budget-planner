import { describe, it, expect } from 'vitest';
import { sortByAmount } from './planner';

describe('sortByAmount', () => {
  const items = [
    { label: 'Gas', amount: 60 },
    { label: 'Rent', amount: 900 },
    { label: 'Water', amount: 25 },
    { label: 'Empty', amount: 0 },
  ];

  it('puts the most expensive first when descending', () => {
    expect(sortByAmount(items, 'desc').map((i) => i.label)).toEqual(['Rent', 'Gas', 'Water', 'Empty']);
  });

  it('puts the cheapest first when ascending', () => {
    expect(sortByAmount(items, 'asc').map((i) => i.label)).toEqual(['Empty', 'Water', 'Gas', 'Rent']);
  });

  it('keeps the original order for equal amounts', () => {
    const tied = [
      { label: 'A', amount: 10 },
      { label: 'B', amount: 10 },
      { label: 'C', amount: 10 },
    ];
    expect(sortByAmount(tied, 'desc').map((i) => i.label)).toEqual(['A', 'B', 'C']);
    expect(sortByAmount(tied, 'asc').map((i) => i.label)).toEqual(['A', 'B', 'C']);
  });

  it('does not mutate its input', () => {
    const copy = items.map((i) => ({ ...i }));
    sortByAmount(items, 'desc');
    expect(items).toEqual(copy);
  });
});
