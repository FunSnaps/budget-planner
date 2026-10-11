import { API_URL } from '$env/static/private';

export class InternalApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'InternalApiError';
  }
}

async function internalRequest<T>(
  userId: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (typeof body?.detail === 'string') detail = body.detail;
    } catch { /* ignore */ }
    throw new InternalApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function apiClient(userId: string) {
  return {
    get<T>(path: string): Promise<T> {
      return internalRequest<T>(userId, path);
    },
    post<T>(path: string, body: unknown): Promise<T> {
      return internalRequest<T>(userId, path, { method: 'POST', body: JSON.stringify(body) });
    },
    put<T>(path: string, body: unknown): Promise<T> {
      return internalRequest<T>(userId, path, { method: 'PUT', body: JSON.stringify(body) });
    },
    patch<T>(path: string, body: unknown): Promise<T> {
      return internalRequest<T>(userId, path, { method: 'PATCH', body: JSON.stringify(body) });
    },
    delete<T = void>(path: string): Promise<T> {
      return internalRequest<T>(userId, path, { method: 'DELETE' });
    },
  };
}

export function publicApiGet<T>(path: string): Promise<T> {
  return fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  }).then(async (res) => {
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const body = await res.json();
        if (typeof body?.detail === 'string') detail = body.detail;
      } catch { /* ignore */ }
      throw new InternalApiError(res.status, detail);
    }
    return res.json() as Promise<T>;
  });
}
