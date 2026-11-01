import { http } from './http';
import type { IBudgetService } from '$lib/domain/ports/IBudgetService';
import { normaliseBudget } from '$lib/domain/entities/Budget';
import type { Budget, BudgetState, RawBudget } from '$lib/domain/entities/Budget';
import type { Permission, Share } from '$lib/domain/entities/Share';

export class BudgetApiService implements IBudgetService {
  async getActive(): Promise<Budget> {
    return normaliseBudget(await http.get<RawBudget>('/api/budget/active'));
  }

  async putActive(state: BudgetState): Promise<Budget> {
    return normaliseBudget(await http.put<RawBudget>('/api/budget/active', { state }));
  }

  async listSaves(): Promise<Budget[]> {
    return (await http.get<RawBudget[]>('/api/budget/saves')).map(normaliseBudget);
  }

  async createSave(name: string, state: BudgetState): Promise<Budget> {
    return normaliseBudget(await http.post<RawBudget>('/api/budget/saves', { name, state }));
  }

  async updateSave(id: string, data: { name?: string; state?: BudgetState }): Promise<Budget> {
    return normaliseBudget(await http.patch<RawBudget>(`/api/budget/saves/${id}`, data));
  }

  async deleteSave(id: string): Promise<void> {
    return http.delete(`/api/budget/saves/${id}`);
  }

  async createShare(budgetId: string, permission: Permission): Promise<Share> {
    return http.post<Share>(`/api/budget/saves/${budgetId}/share`, { permission });
  }
}
