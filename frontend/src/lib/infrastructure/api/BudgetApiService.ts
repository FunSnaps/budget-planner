import { http } from './http';
import type { IBudgetService } from '$lib/domain/ports/IBudgetService';
import type { Budget, BudgetState } from '$lib/domain/entities/Budget';
import type { Permission, Share } from '$lib/domain/entities/Share';

export class BudgetApiService implements IBudgetService {
  async getActive(): Promise<Budget> {
    return http.get<Budget>('/api/budget/active');
  }

  async putActive(state: BudgetState): Promise<Budget> {
    return http.put<Budget>('/api/budget/active', { state });
  }

  async listSaves(): Promise<Budget[]> {
    return http.get<Budget[]>('/api/budget/saves');
  }

  async createSave(name: string, state: BudgetState): Promise<Budget> {
    return http.post<Budget>('/api/budget/saves', { name, state });
  }

  async updateSave(id: string, data: { name?: string; state?: BudgetState }): Promise<Budget> {
    return http.patch<Budget>(`/api/budget/saves/${id}`, data);
  }

  async deleteSave(id: string): Promise<void> {
    return http.delete(`/api/budget/saves/${id}`);
  }

  async createShare(budgetId: string, permission: Permission): Promise<Share> {
    return http.post<Share>(`/api/budget/saves/${budgetId}/share`, { permission });
  }
}
