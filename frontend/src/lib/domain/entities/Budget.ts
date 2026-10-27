export interface BudgetStateItem {
  label: string;
  amount: number;
}

export interface BudgetState {
  takeHome: number;
  roleLabel: string;
  annualSalary: number;
  annualBonus: number;
  needs: BudgetStateItem[];
  wants: BudgetStateItem[];
  savings: BudgetStateItem[];
  oneOff: BudgetStateItem[];
  bonus: BudgetStateItem[];
}

export interface Budget {
  id: string;
  userId: string;
  name: string | null;
  state: BudgetState;
  createdAt: string;
  updatedAt: string;
}

const named = (labels: string[]): BudgetStateItem[] =>
  labels.map((label) => ({ label, amount: 0 }));

/** Common line items a fresh budget starts with, all at £0 so the user just fills in amounts. */
export function defaultSpending(): Pick<BudgetState, 'needs' | 'wants' | 'savings'> {
  return {
    needs: named([
      'Rent / mortgage', 'Council tax', 'Electricity', 'Gas', 'Water',
      'Broadband', 'Mobile phone', 'Groceries', 'Transport', 'Insurance',
    ]),
    wants: named(['Eating out', 'Subscriptions', 'Entertainment', 'Shopping', 'Holidays']),
    savings: named(['Emergency fund', 'Pension top-up', 'Investments']),
  };
}

/** A budget with no spending lines at all gets the defaults, keeping everything else as is. */
export function withDefaultSpending(state: BudgetState): BudgetState {
  const untouched =
    state.needs.length === 0 &&
    state.wants.length === 0 &&
    state.savings.length === 0;
  return untouched ? { ...state, ...defaultSpending() } : state;
}

export const EMPTY_STATE: BudgetState = {
  takeHome: 0,
  roleLabel: '',
  annualSalary: 0,
  annualBonus: 0,
  needs: [],
  wants: [],
  savings: [],
  oneOff: [],
  bonus: [],
};
