import { writable, derived } from 'svelte/store';
import type { Budget, BudgetState } from '$lib/domain/entities/Budget';
import { EMPTY_STATE } from '$lib/domain/entities/Budget';
import { CATS, sum, statusFor, pct } from '$lib/domain/planner';

export const state = writable<BudgetState>(EMPTY_STATE);
export const saves = writable<Budget[]>([]);
export const isSaving = writable(false);

export const totals = derived(state, ($s) => ({
  needs:   sum($s.needs),
  wants:   sum($s.wants),
  savings: sum($s.savings),
  oneOff:  sum($s.oneOff),
  bonus:   sum($s.bonus),
}));

export const gaugeStatuses = derived([state, totals], ([$s, $t]) =>
  Object.fromEntries(
    CATS.map((c) => [c.key, statusFor($t[c.key], c.target, $s.takeHome)])
  ) as Record<'needs' | 'wants' | 'savings', 'good' | 'warning' | 'critical'>
);

export const allocated = derived(totals, ($t) => $t.needs + $t.wants + $t.savings);

export const unallocated = derived([state, allocated], ([$s, $a]) =>
  $s.takeHome - $a
);

export const compositionSegments = derived([state, totals], ([$s, $t]) => {
  const th = $s.takeHome;
  return CATS.map((c) => ({
    ...c,
    amount: $t[c.key],
    widthPct: pct($t[c.key], th),
  }));
});

export function initStores(budget: Budget, savedBudgets: Budget[]): void {
  state.set(budget.state);
  saves.set(savedBudgets);
}
