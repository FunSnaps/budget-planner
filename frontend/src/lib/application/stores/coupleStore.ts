import { writable } from 'svelte/store';

const STORAGE_KEY = 'planner.couple.v1';

export interface CoupleState {
  partnerName: string;
  partnerIncome: number;
  /** Per budget line overrides, keyed by costKey. Missing keys use the default for their category. */
  shared: Record<string, boolean>;
  /** A typed-in total to split instead of the budget lines. Null means use the lines. */
  customTotal: number | null;
}

const defaults = (): CoupleState => ({ partnerName: 'Partner', partnerIncome: 0, shared: {}, customTotal: null });

export const couple = writable<CoupleState>(defaults());

/** Load this browser's saved choices. Call from onMount (client only). */
export function loadCouple(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const p = JSON.parse(raw) as Partial<CoupleState>;
    couple.set({
      partnerName: typeof p.partnerName === 'string' ? p.partnerName : 'Partner',
      partnerIncome: typeof p.partnerIncome === 'number' && p.partnerIncome > 0 ? p.partnerIncome : 0,
      shared: p.shared && typeof p.shared === 'object' ? p.shared : {},
      customTotal: typeof p.customTotal === 'number' && p.customTotal > 0 ? p.customTotal : null,
    });
  } catch {
    /* storage unavailable or corrupt, keep defaults */
  }
}

/** Persist on every change. Returns the unsubscribe function. */
export function persistCouple(): () => void {
  return couple.subscribe((c) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    } catch {
      /* ignore */
    }
  });
}

export function setPartnerName(partnerName: string) {
  couple.update((c) => ({ ...c, partnerName: partnerName.slice(0, 40) }));
}

export function setPartnerIncome(partnerIncome: number) {
  couple.update((c) => ({ ...c, partnerIncome }));
}

/** Zero or empty goes back to using the budget lines. */
export function setCustomTotal(total: number | null) {
  couple.update((c) => ({ ...c, customTotal: total && total > 0 ? total : null }));
}

export function setShared(key: string, on: boolean) {
  couple.update((c) => ({ ...c, shared: { ...c.shared, [key]: on } }));
}
