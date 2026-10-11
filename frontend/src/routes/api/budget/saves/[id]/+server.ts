import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { apiClient, InternalApiError } from '$lib/server/api';
import type { Budget, BudgetState } from '$lib/domain/entities/Budget';

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
  if (!locals.user) throw error(401, 'Unauthorized');
  const body = await request.json() as { name?: string; state?: BudgetState };
  try {
    const budget = await apiClient(locals.user.id).patch<Budget>(
      `/api/v1/users/${locals.user.id}/budget/saves/${params.id}`,
      body
    );
    return json(budget);
  } catch (e) {
    if (e instanceof InternalApiError) throw error(e.status, e.message);
    throw error(500, 'Internal server error');
  }
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
  if (!locals.user) throw error(401, 'Unauthorized');
  try {
    await apiClient(locals.user.id).delete(
      `/api/v1/users/${locals.user.id}/budget/saves/${params.id}`
    );
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof InternalApiError) throw error(e.status, e.message);
    throw error(500, 'Internal server error');
  }
};
