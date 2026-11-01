import { describe, it, expect } from 'vitest';
import { computeCouple, sharedCosts, sharedTotal, type SharedCost } from './couple';
import { EMPTY_STATE } from './entities/Budget';

const cost = (label: string, amount: number, shared = true): SharedCost => ({
  key: `needs:${label}`, cat: 'needs', label, amount, shared,
});

describe('computeCouple', () => {
  it('splits shared costs in proportion to take-home pay', () => {
    const r = computeCouple(3000, 2000, [cost('Rent', 1000)]);
    expect(r.fractions).toEqual([0.6, 0.4]);
    expect(r.owed).toEqual([600, 400]);
  });

  it('keeps the shares adding up to the total to the penny', () => {
    const r = computeCouple(2100, 1900, [cost('Gas', 33.33), cost('Water', 20.01)]);
    expect(r.owed[0] + r.owed[1]).toBeCloseTo(53.34, 2);
  });

  it('ignores costs that are not shared', () => {
    const r = computeCouple(3000, 2000, [cost('Rent', 1000), cost('Gym', 50, false)]);
    expect(r.total).toBe(1000);
  });

  it('falls back to an equal split until both incomes are known', () => {
    const r = computeCouple(0, 0, [cost('Rent', 1000)]);
    expect(r.usedEqualFallback).toBe(true);
    expect(r.owed).toEqual([500, 500]);
  });

  it('uses a custom total instead of the budget lines', () => {
    const r = computeCouple(3000, 2000, [cost('Rent', 1000)], 2500);
    expect(r.total).toBe(2500);
    expect(r.owed).toEqual([1500, 1000]);
  });

  it('sums only the shared lines', () => {
    expect(sharedTotal([cost('Rent', 1000), cost('Gym', 50, false), cost('Gas', 60)])).toBe(1060);
  });

  it('puts everything on the earner when the partner has no income', () => {
    expect(computeCouple(2500, 0, [cost('Rent', 800)]).owed).toEqual([800, 0]);
  });
});

describe('sharedCosts', () => {
  const state = {
    ...EMPTY_STATE,
    needs: [{ label: 'Rent', amount: 900 }, { label: 'Water', amount: 0 }],
    wants: [{ label: 'Eating out', amount: 120 }],
    savings: [{ label: '', amount: 50 }],
  };

  it('lists named lines even at zero, and unnamed lines only with an amount', () => {
    const withBlankZero = { ...state, wants: [...state.wants, { label: '', amount: 0 }] };
    expect(sharedCosts(withBlankZero, {}).map((c) => c.label)).toEqual(['Rent', 'Water', 'Eating out', 'Untitled']);
  });

  it('shares needs by default and leaves wants and savings personal', () => {
    expect(sharedCosts(state, {}).map((c) => c.shared)).toEqual([true, true, false, false]);
  });

  it('respects the user toggles over the defaults', () => {
    const costs = sharedCosts(state, { 'needs:Rent': false, 'wants:Eating out': true });
    expect(costs.map((c) => c.shared)).toEqual([false, true, true, false]);
  });

  it('lets typed amounts win over the budget without touching it', () => {
    const before = JSON.stringify(state);
    const costs = sharedCosts(state, {}, { 'needs:Water': 40, 'needs:Rent': 0 });
    expect(costs.find((c) => c.label === 'Water')?.amount).toBe(40);
    expect(costs.find((c) => c.label === 'Rent')?.amount).toBe(0);
    expect(JSON.stringify(state)).toBe(before);
  });

  it('feeds typed amounts straight into the split', () => {
    const costs = sharedCosts(state, {}, { 'needs:Water': 100 });
    expect(computeCouple(3000, 2000, costs).total).toBe(1000);
  });
});
