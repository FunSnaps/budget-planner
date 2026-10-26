import { describe, it, expect } from 'vitest';
import { allocate, computeSplit, settle } from './split';
import type { Bill, Person } from './entities/Split';

const people = (a: number, b: number): Person[] => [
  { id: 'a', name: 'A', gross: a * 12, takeHome: a },
  { id: 'b', name: 'B', gross: b * 12, takeHome: b },
];
const bill = (amount: number, paidBy = 'a'): Bill => ({ id: 'x', label: 'x', amount, paidBy });

describe('allocate', () => {
  it('splits proportionally', () => {
    expect(allocate(100_00, [3000, 1000])).toEqual([75_00, 25_00]);
  });

  it('always sums exactly to the total', () => {
    const parts = allocate(100_01, [1, 1, 1]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(100_01);
  });

  it('falls back to equal when all weights are zero', () => {
    expect(allocate(10_00, [0, 0])).toEqual([5_00, 5_00]);
  });
});

describe('computeSplit', () => {
  it('weights bills by income', () => {
    const r = computeSplit(people(3000, 1000), [bill(1000)], 'takeHome');
    expect(r.owed).toEqual([750, 250]);
    expect(r.fractions).toEqual([0.75, 0.25]);
    expect(r.usedEqualFallback).toBe(false);
  });

  it('can split on gross salary instead of take-home', () => {
    const ps = people(2000, 2000);
    ps[0].gross = 60000;
    ps[1].gross = 20000;
    const r = computeSplit(ps, [bill(1000)], 'gross');
    expect(r.owed).toEqual([750, 250]);
  });

  it('splits equally and flags it when no income is entered', () => {
    const r = computeSplit(people(0, 0), [bill(100)], 'takeHome');
    expect(r.owed).toEqual([50, 50]);
    expect(r.usedEqualFallback).toBe(true);
  });

  it('works out who owes whom from who paid', () => {
    const r = computeSplit(people(3000, 1000), [bill(1000, 'a')], 'takeHome');
    expect(r.balance).toEqual([250, -250]);
    expect(r.transfers).toEqual([{ from: 'b', to: 'a', amount: 250 }]);
  });

  it('reports the equal-split comparison', () => {
    const r = computeSplit(people(3000, 1000), [bill(1000)], 'takeHome');
    expect(r.equalOwed).toEqual([500, 500]);
  });
});

describe('settle', () => {
  it('returns nothing when balances are square', () => {
    expect(settle(people(1, 1), [0, 0])).toEqual([]);
  });
});
