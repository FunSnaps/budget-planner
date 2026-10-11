import { Lucia } from 'lucia';
import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql';
import pg from 'pg';
import { DATABASE_URL, NODE_ENV } from '$env/static/private';

const pool = new pg.Pool({ connectionString: DATABASE_URL });

const adapter = new NodePostgresAdapter(pool, {
  user: 'users',
  session: 'sessions',
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: NODE_ENV === 'production',
      sameSite: 'lax',
    },
  },
  getUserAttributes(attrs) {
    return { email: (attrs as { email: string }).email };
  },
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: { email: string };
  }
}
