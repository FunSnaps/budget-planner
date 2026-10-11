import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const PUBLIC_PATHS = ['/login', '/register', '/share'];

export const load: LayoutServerLoad = ({ locals, url }) => {
  const isPublic = PUBLIC_PATHS.some((p) => url.pathname.startsWith(p));

  if (!locals.user && !isPublic) {
    throw redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }

  return {
    user: locals.user ? { id: locals.user.id, email: locals.user.email } : null,
  };
};
