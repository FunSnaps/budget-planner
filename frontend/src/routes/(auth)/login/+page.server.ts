import { fail, redirect } from '@sveltejs/kit';
import { verify } from '@node-rs/argon2';
import { lucia } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';
import pg from 'pg';
import { DATABASE_URL } from '$env/static/private';

const pool = new pg.Pool({ connectionString: DATABASE_URL });

export const load: PageServerLoad = ({ locals }) => {
  if (locals.user) throw redirect(302, '/');
};

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');

    if (typeof email !== 'string' || typeof password !== 'string') {
      return fail(400, { error: 'Invalid form data.', email: '' });
    }

    const trimmedEmail = email.trim().toLowerCase().slice(0, 254);

    const result = await pool.query<{ id: string; hashed_password: string }>(
      'SELECT id, hashed_password FROM users WHERE email = $1',
      [trimmedEmail]
    );
    const user = result.rows[0];

    // constant-time comparison path, always run verify even if user not found
    const hash = user?.hashed_password ?? '$argon2id$v=19$m=16,t=2,p=1$AAAA$AAAA';
    const valid = user && await verify(hash, password);

    if (!valid) {
      return fail(400, { error: 'Incorrect email or password.', email: trimmedEmail });
    }

    const session = await lucia.createSession(user.id, {});
    const cookie = lucia.createSessionCookie(session.id);
    cookies.set(cookie.name, cookie.value, { path: '/', ...cookie.attributes });

    const redirectTo = url.searchParams.get('redirectTo') ?? '/';
    throw redirect(302, redirectTo.startsWith('/') ? redirectTo : '/');
  },
};
