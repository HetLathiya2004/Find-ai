// Authenticated API client for the FastAPI gateway. Every request carries
// the Supabase access token as a Bearer header — the backend has no public
// routes. Supabase's session management handles token refresh; we just read
// the current access token per request.

import { API_V1 } from '@/constants/api';
import { supabase } from '@/lib/supabase';

const FETCH_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function getAccessToken(): Promise<string | null> {
  // getSession() refreshes the token automatically when it is expired.
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/**
 * fetch() against the gateway with Authorization header + timeout. `path` is
 * relative to /api/v1 (e.g. '/courses', '/me/progress').
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(`${API_V1}${path}`, {
      ...init,
      signal: init.signal ?? controller.signal,
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function parseOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { detail?: string };
      if (body?.detail) detail = body.detail;
    } catch {
      // non-JSON error body; keep the status message
    }
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  return parseOrThrow<T>(await apiFetch(path));
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return parseOrThrow<T>(await apiFetch(path, { method: 'POST', body: JSON.stringify(body) }));
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return parseOrThrow<T>(await apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }));
}
