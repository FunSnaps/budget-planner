import { describe, it, expect } from 'vitest';
import { EMPTY_STATE, defaultSpending, normaliseBudget, withDefaultSpending } from './Budget';

describe('normaliseBudget', () => {
  const base = { id: 'b1', name: 'June', state: EMPTY_STATE };

  it('maps the API snake_case timestamps to camelCase', () => {
    const b = normaliseBudget({ ...base, created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-02T10:00:00Z' });
    expect(b.createdAt).toBe('2026-06-01T10:00:00Z');
    expect(b.updatedAt).toBe('2026-06-02T10:00:00Z');
    expect(Number.isNaN(new Date(b.updatedAt).getTime())).toBe(false);
    expect(b).not.toHaveProperty('updated_at');
  });

  it('passes through a budget that is already camelCase', () => {
    const b = normaliseBudget({ ...base, userId: 'u1', createdAt: '2026-06-01T10:00:00Z', updatedAt: '2026-06-03T10:00:00Z' });
    expect(b.userId).toBe('u1');
    expect(b.updatedAt).toBe('2026-06-03T10:00:00Z');
  });

  it('falls back to the created time when there is no update time', () => {
    expect(normaliseBudget({ ...base, created_at: '2026-06-01T10:00:00Z' }).updatedAt).toBe('2026-06-01T10:00:00Z');
  });
});

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
