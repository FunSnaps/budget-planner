import type { Budget } from './Budget';

export type Permission = 'view' | 'edit';

export interface Share {
  id: string;
  budgetId: string;
  token: string;
  permission: Permission;
  expiresAt: string | null;
  createdAt: string;
}

export interface SharedBudget {
  budget: Budget;
  permission: Permission;
  expiresAt: string | null;
}
