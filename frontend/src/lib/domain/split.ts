import type { Bill, Person, SplitBasis, SplitResult, Transfer } from './entities/Split';

const toPence = (n: number): number => Math.round((n || 0) * 100);
const toPounds = (p: number): number => p / 100;

/**
 * Split `totalPence` in proportion to `weights` so the parts sum exactly to the total
 * (largest-remainder method). Falls back to an equal split if every weight is zero.
 */
export function allocate(totalPence: number, weights: number[]): number[] {
  if (weights.length === 0) return [];
  const clean = weights.map((w) => (w > 0 ? w : 0));
  const weightSum = clean.reduce((a, b) => a + b, 0);
  const effective = weightSum > 0 ? clean : clean.map(() => 1);
  const effectiveSum = weightSum > 0 ? weightSum : effective.length;

  const exact = effective.map((w) => (totalPence * w) / effectiveSum);
  const parts = exact.map(Math.floor);
  let leftover = totalPence - parts.reduce((a, b) => a + b, 0);

  const byRemainder = exact
    .map((x, i) => ({ i, rem: x - Math.floor(x) }))
    .sort((a, b) => b.rem - a.rem || a.i - b.i);
  for (let k = 0; leftover > 0; k = (k + 1) % byRemainder.length, leftover--) {
    parts[byRemainder[k].i] += 1;
  }
  return parts;
}

export function incomeWeights(people: Person[], basis: SplitBasis): number[] {
  return people.map((p) => (basis === 'gross' ? p.gross : p.takeHome) || 0);
}

/** Minimal set of payments that settles the balances (positive = owed money). */
export function settle(people: Person[], balancePence: number[]): Transfer[] {
  const debtors = people
    .map((p, i) => ({ id: p.id, amt: -balancePence[i] }))
    .filter((d) => d.amt > 0)
    .sort((a, b) => b.amt - a.amt);
  const creditors = people
    .map((p, i) => ({ id: p.id, amt: balancePence[i] }))
    .filter((c) => c.amt > 0)
    .sort((a, b) => b.amt - a.amt);

  const transfers: Transfer[] = [];
  let d = 0;
  let c = 0;
  while (d < debtors.length && c < creditors.length) {
    const amt = Math.min(debtors[d].amt, creditors[c].amt);
    transfers.push({ from: debtors[d].id, to: creditors[c].id, amount: toPounds(amt) });
    debtors[d].amt -= amt;
    creditors[c].amt -= amt;
    if (debtors[d].amt === 0) d++;
    if (creditors[c].amt === 0) c++;
  }
  return transfers;
}

export function computeSplit(
  people: Person[],
  bills: Bill[],
  basis: SplitBasis
): SplitResult {
  const weights = incomeWeights(people, basis);
  const weightSum = weights.reduce((a, b) => a + (b > 0 ? b : 0), 0);
  const usedEqualFallback = weightSum <= 0;
  const fractions = people.map((_, i) =>
    usedEqualFallback ? 1 / (people.length || 1) : Math.max(weights[i], 0) / weightSum
  );

  const sharePence = bills.map((b) => allocate(toPence(b.amount), weights));
  const equalPence = bills.map((b) => allocate(toPence(b.amount), people.map(() => 1)));

  const owedP = people.map((_, i) => sharePence.reduce((a, row) => a + row[i], 0));
  const equalP = people.map((_, i) => equalPence.reduce((a, row) => a + row[i], 0));
  const paidP = people.map((p) =>
    bills.reduce((a, b) => a + (b.paidBy === p.id ? toPence(b.amount) : 0), 0)
  );
  const balanceP = people.map((_, i) => paidP[i] - owedP[i]);

  return {
    fractions,
    shares: sharePence.map((row) => row.map(toPounds)),
    owed: owedP.map(toPounds),
    paid: paidP.map(toPounds),
    balance: balanceP.map(toPounds),
    equalOwed: equalP.map(toPounds),
    total: toPounds(bills.reduce((a, b) => a + toPence(b.amount), 0)),
    usedEqualFallback,
    transfers: settle(people, balanceP),
  };
}
