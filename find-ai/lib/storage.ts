// MMKV wrapper for persisting mock state in Phase 1.
// Falls back to an in-memory store when the native MMKV module is unavailable
// (e.g. running in Expo Go, which can't load custom native modules).

type StorageLike = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
  clearAll: () => void;
};

function createMemoryStorage(): StorageLike {
  const store = new Map<string, string>();
  return {
    getString: (key) => store.get(key),
    set: (key, value) => {
      store.set(key, value);
    },
    delete: (key) => {
      store.delete(key);
    },
    clearAll: () => {
      store.clear();
    },
  };
}

let storage: StorageLike;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MMKV } = require('react-native-mmkv');
  storage = new MMKV({ id: 'find-ai' });
} catch {
  storage = createMemoryStorage();
}

export const StorageKeys = {
  auth: 'auth-state',
  progress: 'progress-state',
} as const;

export function getJSON<T>(key: string): T | null {
  const raw = storage.getString(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setJSON(key: string, value: unknown): void {
  storage.set(key, JSON.stringify(value));
}

export function remove(key: string): void {
  storage.delete(key);
}

export function clearAll(): void {
  storage.clearAll();
}
