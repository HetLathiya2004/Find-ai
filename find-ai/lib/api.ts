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

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  try {
    return await fetch(`${API_V1}${path}`, {
      ...init,
      signal: init.signal ?? controller.signal,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
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
      // non-JSON error body
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
