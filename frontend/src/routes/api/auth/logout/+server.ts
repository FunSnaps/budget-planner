import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { lucia } from '$lib/server/auth';

export const POST: RequestHandler = async ({ locals, cookies }) => {
  if (!locals.session) throw redirect(302, '/login');

  await lucia.invalidateSession(locals.session.id);
  const blankCookie = lucia.createBlankSessionCookie();
  cookies.set(blankCookie.name, blankCookie.value, { path: '/', ...blankCookie.attributes });

  throw redirect(302, '/login');
};
