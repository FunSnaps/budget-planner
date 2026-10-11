import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { publicApiGet, InternalApiError } from '$lib/server/api';
import type { SharedBudget } from '$lib/domain/entities/Share';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const shared = await publicApiGet<SharedBudget>(`/api/v1/shared/${params.token}`);
    return { shared };
  } catch (e) {
    if (e instanceof InternalApiError) {
      if (e.status === 404) throw error(404, 'Share link not found or expired.');
      if (e.status === 410) throw error(410, 'This share link has expired.');
    }
    throw error(500, 'Could not load shared budget.');
  }
};
