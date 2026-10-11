import type { Budget, BudgetState } from '../entities/Budget';
import type { Permission, Share } from '../entities/Share';

export interface IBudgetService {
  getActive(): Promise<Budget>;
  putActive(state: BudgetState): Promise<Budget>;
  listSaves(): Promise<Budget[]>;
  createSave(name: string, state: BudgetState): Promise<Budget>;
  updateSave(id: string, data: { name?: string; state?: BudgetState }): Promise<Budget>;
  deleteSave(id: string): Promise<void>;
  createShare(budgetId: string, permission: Permission): Promise<Share>;
}
