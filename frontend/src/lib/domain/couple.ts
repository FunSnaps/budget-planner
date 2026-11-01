import type { BudgetState } from './entities/Budget';
import type { SplitResult } from './entities/Split';
import { computeSplit } from './split';

export type SharedCat = 'needs' | 'wants' | 'savings';

export const SHARED_CATS: { key: SharedCat; label: string }[] = [
  { key: 'needs', label: 'Needs' },
  { key: 'wants', label: 'Wants' },
  { key: 'savings', label: 'Savings' },
];

export interface SharedCost {
  key: string;
  cat: SharedCat;
  label: string;
  amount: number;
  shared: boolean;
}

export const costKey = (cat: SharedCat, label: string): string => `${cat}:${label}`;

/** Needs are shared unless switched off; wants and savings stay personal unless switched on. */
export function isShared(shared: Record<string, boolean>, cat: SharedCat, key: string): boolean {
  return shared[key] ?? cat === 'needs';
}

/** Every budget line with an amount, flagged as shared or personal. */
export function sharedCosts(state: BudgetState, shared: Record<string, boolean>): SharedCost[] {
  return SHARED_CATS.flatMap(({ key: cat }) =>
    state[cat]
      .filter((item) => item.amount > 0)
      .map((item) => {
        const label = item.label.trim() || 'Untitled';
        const key = costKey(cat, label);
        return { key, cat, label, amount: item.amount, shared: isShared(shared, cat, key) };
      })
  );
}

/** What the ticked budget lines add up to. */
export function sharedTotal(costs: SharedCost[]): number {
  return costs.reduce((sum, c) => sum + (c.shared ? c.amount : 0), 0);
}

/**
 * Split the shared costs between two people in proportion to their take-home pay.
 * A custom total replaces the budget lines entirely.
 */
export function computeCouple(
  yourIncome: number,
  partnerIncome: number,
  costs: SharedCost[],
  customTotal: number | null = null
): SplitResult {
  const people = [
    { id: 'you', name: 'You', gross: 0, takeHome: yourIncome },
    { id: 'partner', name: 'Partner', gross: 0, takeHome: partnerIncome },
  ];
  const bills =
    customTotal !== null
      ? [{ id: 'custom', label: 'Custom total', amount: customTotal, paidBy: 'you' }]
      : costs
          .filter((c) => c.shared)
          .map((c) => ({ id: c.key, label: c.label, amount: c.amount, paidBy: 'you' }));
  return computeSplit(people, bills, 'takeHome');
}
