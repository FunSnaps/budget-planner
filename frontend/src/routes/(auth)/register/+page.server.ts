import { fail, redirect } from '@sveltejs/kit';
import { hash } from '@node-rs/argon2';
import { lucia } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';
import pg from 'pg';
import { DATABASE_URL } from '$env/static/private';
import { generateId } from 'lucia';

const pool = new pg.Pool({ connectionString: DATABASE_URL });

export const load: PageServerLoad = ({ locals }) => {
  if (locals.user) throw redirect(302, '/');
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');

    if (typeof email !== 'string' || typeof password !== 'string') {
      return fail(400, { error: 'Invalid form data.', email: '' });
    }

    const trimmedEmail = email.trim().toLowerCase().slice(0, 254);

    if (password.length < 8) {
      return fail(400, { error: 'Password must be at least 8 characters.', email: trimmedEmail });
    }
    if (password.length > 256) {
      return fail(400, { error: 'Password is too long.', email: trimmedEmail });
    }

    const existing = await pool.query('SELECT 1 FROM users WHERE email = $1', [trimmedEmail]);
    if (existing.rowCount && existing.rowCount > 0) {
      return fail(400, { error: 'An account with that email already exists.', email: trimmedEmail });
    }

    const hashedPassword = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateId(15);

    await pool.query(
      'INSERT INTO users (id, email, hashed_password) VALUES ($1, $2, $3)',
      [userId, trimmedEmail, hashedPassword]
    );

    const session = await lucia.createSession(userId, {});
    const cookie = lucia.createSessionCookie(session.id);
    cookies.set(cookie.name, cookie.value, { path: '/', ...cookie.attributes });

    throw redirect(302, '/');
  },
};
