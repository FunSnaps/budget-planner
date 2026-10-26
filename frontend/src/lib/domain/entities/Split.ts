export type SplitBasis = 'takeHome' | 'gross';

export interface Person {
  id: string;
  name: string;
  /** Annual gross salary in £ */
  gross: number;
  /** Monthly take-home in £ */
  takeHome: number;
}

export interface Bill {
  id: string;
  label: string;
  /** Monthly amount in £ */
  amount: number;
  /** Person.id of whoever actually pays the bill */
  paidBy: string;
}

export interface SplitState {
  basis: SplitBasis;
  people: Person[];
  bills: Bill[];
}

export interface Transfer {
  from: string;
  to: string;
  amount: number;
}

export interface SplitResult {
  /** Each person's fraction of the bills (sums to 1) */
  fractions: number[];
  /** shares[billIndex][personIndex] in £, each row sums exactly to the bill amount */
  shares: number[][];
  /** Total each person owes across all bills */
  owed: number[];
  /** Total each person has paid out */
  paid: number[];
  /** paid − owed: positive means they are owed money */
  balance: number[];
  /** What each person would owe under an equal split */
  equalOwed: number[];
  total: number;
  /** True when no income was entered, so the split fell back to equal */
  usedEqualFallback: boolean;
  transfers: Transfer[];
}
