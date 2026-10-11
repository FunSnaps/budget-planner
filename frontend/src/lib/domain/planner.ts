import type { BudgetState, BudgetStateItem } from './entities/Budget';

export type GaugeStatus = 'good' | 'warning' | 'critical';

export interface Cat {
  key: keyof Pick<BudgetState, 'needs' | 'wants' | 'savings'>;
  label: string;
  target: number;
  color: string;
}

export const CATS: Cat[] = [
  { key: 'needs',   label: 'Needs',   target: 0.5,  color: '#0088a0' },
  { key: 'wants',   label: 'Wants',   target: 0.3,  color: '#c98a00' },
  { key: 'savings', label: 'Savings', target: 0.2,  color: '#0ca30c' },
];

export const CAT_KEYS = CATS.map((c) => c.key);

export function sum(items: BudgetStateItem[]): number {
  return items.reduce((acc, it) => acc + (it.amount || 0), 0);
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function fmt(n: number): string {
  return n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 });
}

export function pct(value: number, total: number): number {
  if (!total) return 0;
  return round2((value / total) * 100);
}

export function statusFor(actual: number, target: number, takeHome: number): GaugeStatus {
  if (!takeHome) return 'good';
  const ratio = actual / takeHome;
  const diff = Math.abs(ratio - target);
  if (diff <= 0.05) return 'good';
  if (diff <= 0.1) return 'warning';
  return 'critical';
}

export function annualFromMonthly(monthly: number): number {
  return round2(monthly * 12);
}

export function monthlyFromAnnual(annual: number): number {
  return round2(annual / 12);
}

export function estimateTakeHome(gross: number): number {
  // rough UK take-home after income tax + NI (2024/25 rates)
  if (gross <= 12570) return gross;
  if (gross <= 50270) return 12570 + (gross - 12570) * 0.68;
  if (gross <= 125140) return 12570 + 37700 * 0.68 + (gross - 50270) * 0.58;
  return 12570 + 37700 * 0.68 + 74870 * 0.58 + (gross - 125140) * 0.55;
}
