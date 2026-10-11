import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { apiClient, InternalApiError } from '$lib/server/api';
import type { Budget } from '$lib/domain/entities/Budget';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) return { activeBudget: null, saves: [] };

  try {
    const [activeBudget, saves] = await Promise.all([
      apiClient(locals.user.id).get<Budget>(`/api/v1/users/${locals.user.id}/budget/active`),
      apiClient(locals.user.id).get<Budget[]>(`/api/v1/users/${locals.user.id}/budget/saves`),
    ]);
    return { activeBudget, saves };
  } catch (e) {
    if (e instanceof InternalApiError) throw error(e.status, e.message);
    throw error(500, 'Failed to load budget data');
  }
};
