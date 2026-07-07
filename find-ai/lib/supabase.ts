// Supabase Auth client for the backend project (mjrmavtdhrbrrheuqbzg).
// Only used for authentication — all data still flows through the FastAPI
// gateway, which validates the access token on every request.

import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { getString, remove, setString } from '@/lib/storage';

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://mjrmavtdhrbrrheuqbzg.supabase.co';

// Publishable anon key — safe to ship in the app binary. Set via
// EXPO_PUBLIC_SUPABASE_ANON_KEY in .env (see .env.example).
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcm1hdnRkaHJicnJoZXVxYnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNDc0MDcsImV4cCI6MjA5ODcyMzQwN30.Wd6370I6ns_KQfaVg_Xc-tjDLN7GZH80MR9wnbKhXQk';

if (!SUPABASE_ANON_KEY) {
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_ANON_KEY is not set — auth will not work. ' +
      'Copy .env.example to .env and fill in the anon key.',
  );
}

// Session persistence goes through the MMKV wrapper (falls back to in-memory
// in Expo Go). Supabase accepts a sync storage adapter with this shape.
const mmkvStorageAdapter = {
  getItem: (key: string) => getString(key),
  setItem: (key: string, value: string) => setString(key, value),
  removeItem: (key: string) => remove(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: mmkvStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // PKCE so the Google OAuth redirect returns a one-time code instead of
    // tokens in the URL fragment.
    flowType: 'pkce',
  },
});

// Refresh tokens only while the app is foregrounded (Supabase RN guidance).
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
