import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { apiClient, InternalApiError } from '$lib/server/api';
import type { Budget, BudgetState } from '$lib/domain/entities/Budget';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) throw error(401, 'Unauthorized');
  try {
    const saves = await apiClient(locals.user.id).get<Budget[]>(
      `/api/v1/users/${locals.user.id}/budget/saves`
    );
    return json(saves);
  } catch (e) {
    if (e instanceof InternalApiError) throw error(e.status, e.message);
    throw error(500, 'Internal server error');
  }
};

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) throw error(401, 'Unauthorized');
  const body = await request.json() as { name: string; state: BudgetState };
  try {
    const budget = await apiClient(locals.user.id).post<Budget>(
      `/api/v1/users/${locals.user.id}/budget/saves`,
      body
    );
    return json(budget, { status: 201 });
  } catch (e) {
    if (e instanceof InternalApiError) throw error(e.status, e.message);
    throw error(500, 'Internal server error');
  }
};
