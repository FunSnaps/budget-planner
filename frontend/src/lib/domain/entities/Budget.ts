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
