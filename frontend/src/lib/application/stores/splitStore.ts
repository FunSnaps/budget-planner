import { writable, derived } from 'svelte/store';
import { computeSplit } from '$lib/domain/split';
import type { Bill, Person, SplitBasis, SplitState } from '$lib/domain/entities/Split';

const STORAGE_KEY = 'planner.split.v1';
export const MAX_PEOPLE = 6;

const newId = () => Math.random().toString(36).slice(2, 9);

function defaultState(): SplitState {
  const me = { id: newId(), name: 'Me', gross: 0, takeHome: 0 };
  const partner = { id: newId(), name: 'Partner', gross: 0, takeHome: 0 };
  return {
    basis: 'takeHome',
    people: [me, partner],
    bills: ['Rent', 'Energy', 'Internet'].map((label) => ({
      id: newId(),
      label,
      amount: 0,
      paidBy: me.id,
    })),
  };
}

export const split = writable<SplitState>(defaultState());

export const result = derived(split, ($s) => computeSplit($s.people, $s.bills, $s.basis));

/** Load saved state from this browser, if any. Call from onMount (client only). */
export function loadSplit(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as SplitState;
    if (Array.isArray(parsed.people) && parsed.people.length >= 2 && Array.isArray(parsed.bills)) {
      split.set(parsed);
    }
  } catch {
    /* storage unavailable or corrupt, keep defaults */
  }
}

/** Persist on every change. Returns the unsubscribe function. */
export function persistSplit(): () => void {
  return split.subscribe((s) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  });
}

export function setBasis(basis: SplitBasis) {
  split.update((s) => ({ ...s, basis }));
}

export function addPerson() {
  split.update((s) =>
    s.people.length >= MAX_PEOPLE
      ? s
      : {
          ...s,
          people: [...s.people, { id: newId(), name: `Person ${s.people.length + 1}`, gross: 0, takeHome: 0 }],
        }
  );
}

export function removePerson(id: string) {
  split.update((s) => {
    if (s.people.length <= 2) return s;
    const people = s.people.filter((p) => p.id !== id);
    // Bills paid by the removed person fall back to the first remaining person
    const bills = s.bills.map((b) => (b.paidBy === id ? { ...b, paidBy: people[0].id } : b));
    return { ...s, people, bills };
  });
}

export function updatePerson(id: string, patch: Partial<Omit<Person, 'id'>>) {
  split.update((s) => ({
    ...s,
    people: s.people.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  }));
}

export function addBill() {
  split.update((s) => ({
    ...s,
    bills: [...s.bills, { id: newId(), label: '', amount: 0, paidBy: s.people[0].id }],
  }));
}

export function removeBill(id: string) {
  split.update((s) => ({ ...s, bills: s.bills.filter((b) => b.id !== id) }));
}

export function updateBill(id: string, patch: Partial<Omit<Bill, 'id'>>) {
  split.update((s) => ({
    ...s,
    bills: s.bills.map((b) => (b.id === id ? { ...b, ...patch } : b)),
  }));
}

export function resetSplit() {
  split.set(defaultState());
}
