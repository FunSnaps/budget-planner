import { describe, it, expect } from 'vitest';
import { EMPTY_STATE, defaultSpending, withDefaultSpending } from './Budget';

describe('withDefaultSpending', () => {
  it('fills a brand new budget with common items at zero', () => {
    const s = withDefaultSpending(EMPTY_STATE);
    const labels = s.needs.map((i) => i.label);
    expect(labels).toEqual(expect.arrayContaining(['Rent / mortgage', 'Electricity', 'Water']));
    expect([...s.needs, ...s.wants, ...s.savings].every((i) => i.amount === 0)).toBe(true);
    expect(s.wants.length).toBeGreaterThan(0);
    expect(s.savings.length).toBeGreaterThan(0);
  });

  it('keeps take-home and other fields when seeding an existing budget', () => {
    const s = withDefaultSpending({ ...EMPTY_STATE, takeHome: 2500, annualSalary: 40000 });
    expect(s.takeHome).toBe(2500);
    expect(s.annualSalary).toBe(40000);
    expect(s.needs.length).toBeGreaterThan(0);
  });

  it('leaves a budget alone once it has any spending lines', () => {
    const s = { ...EMPTY_STATE, needs: [{ label: 'Rent', amount: 900 }] };
    expect(withDefaultSpending(s)).toBe(s);
  });

  it('returns fresh arrays each time so edits never leak between budgets', () => {
    expect(defaultSpending().needs).not.toBe(defaultSpending().needs);
  });
});
