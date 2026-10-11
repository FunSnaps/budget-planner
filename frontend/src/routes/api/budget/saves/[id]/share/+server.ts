import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { apiClient, InternalApiError } from '$lib/server/api';
import type { Share } from '$lib/domain/entities/Share';

export const POST: RequestHandler = async ({ locals, params, request }) => {
  if (!locals.user) throw error(401, 'Unauthorized');
  const body = await request.json() as { permission: 'view' | 'edit' };
  try {
    const share = await apiClient(locals.user.id).post<Share>(
      `/api/v1/users/${locals.user.id}/budget/saves/${params.id}/share`,
      body
    );
    return json(share, { status: 201 });
  } catch (e) {
    if (e instanceof InternalApiError) throw error(e.status, e.message);
    throw error(500, 'Internal server error');
  }
};
