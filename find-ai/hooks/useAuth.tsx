// Real auth backed by Supabase Auth (email+password and Google OAuth via
// Supabase's built-in provider). Replaces the Phase 1 mock auth. Tokens are
// managed by the Supabase SDK and persisted through MMKV (lib/supabase.ts);
// screens never touch tokens — API calls attach them via lib/api.ts.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { Session } from '@supabase/supabase-js';
import { apiGet, apiPut } from '@/lib/api';
import { getJSON, setJSON, StorageKeys } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import type { ApiUserProfileResponse } from '@/types/api';

WebBrowser.maybeCompleteAuthSession();

export interface AuthState {
  isAuthenticated: boolean;
  onboarded: boolean;
  displayName: string;
  email: string;
  goal: 'grow_wealth' | 'understand_news' | 'learn_basics';
  dailyGoalMinutes: 5 | 10 | 15;
}

/** Device-local preferences that don't live on the server. */
interface AuthPrefs {
  onboarded: boolean;
  displayName: string;
  goal: AuthState['goal'];
  dailyGoalMinutes: AuthState['dailyGoalMinutes'];
}

const DEFAULT_PREFS: AuthPrefs = {
  onboarded: false,
  displayName: '',
  goal: 'grow_wealth',
  dailyGoalMinutes: 10,
};

interface AuthContextValue extends AuthState {
  /** True while the persisted session is being restored on launch. */
  loading: boolean;
  userId: string | null;
  /** Resolve to an error message to display, or null on success. */
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  completeOnboarding: (opts: {
    goal: AuthState['goal'];
    dailyGoalMinutes: AuthState['dailyGoalMinutes'];
    displayName: string;
  }) => void;
  updateDisplayName: (name: string) => void;
  cycleDailyGoal: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadPrefs(): AuthPrefs {
  return { ...DEFAULT_PREFS, ...(getJSON<Partial<AuthPrefs>>(StorageKeys.auth) ?? {}) };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<AuthPrefs>(loadPrefs);

  const persistPrefs = useCallback((next: AuthPrefs) => {
    setPrefs(next);
    setJSON(StorageKeys.auth, next);
  }, []);

  // Restore the persisted session, then track auth state changes.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Hydrate displayName from the server profile (users.username) when a
  // session exists and no local name was chosen yet.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      try {
        const { user } = await apiGet<ApiUserProfileResponse>('/me');
        if (!cancelled && user.username && !loadPrefs().displayName) {
          persistPrefs({ ...loadPrefs(), displayName: user.username });
        }
      } catch {
        // Offline or backend unreachable — keep local prefs.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return error.message;
      // Existing accounts skip onboarding.
      persistPrefs({ ...loadPrefs(), onboarded: true });
      return null;
    },
    [persistPrefs],
  );

  const signUp = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return error.message;
      if (!data.session) {
        // Email confirmation is enabled on the project.
        return 'Check your inbox to confirm your email, then sign in.';
      }
      persistPrefs({ ...loadPrefs(), onboarded: false });
      return null;
    },
    [persistPrefs],
  );

  const signInWithGoogle = useCallback(async (): Promise<string | null> => {
    try {
      const redirectTo = Linking.createURL('auth/callback');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) return error.message;
      if (!data.url) return 'Could not start Google sign-in';

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success') return null; // user dismissed the browser

      const code = new URL(result.url).searchParams.get('code');
      if (!code) return 'Google sign-in was cancelled';

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) return exchangeError.message;
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Google sign-in failed';
    }
  }, []);

  const completeOnboarding = useCallback(
    (opts: {
      goal: AuthState['goal'];
      dailyGoalMinutes: AuthState['dailyGoalMinutes'];
      displayName: string;
    }) => {
      const displayName = opts.displayName.trim();
      persistPrefs({
        onboarded: true,
        goal: opts.goal,
        dailyGoalMinutes: opts.dailyGoalMinutes,
        displayName,
      });
      if (displayName) {
        apiPut('/me', { username: displayName }).catch(() => {
          // Username may be taken or the backend unreachable; the local
          // display name still applies.
        });
      }
    },
    [persistPrefs],
  );

  const updateDisplayName = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      persistPrefs({ ...prefs, displayName: trimmed });
      apiPut('/me', { username: trimmed }).catch(() => {});
    },
    [persistPrefs, prefs],
  );

  const cycleDailyGoal = useCallback(() => {
    const next = prefs.dailyGoalMinutes === 5 ? 10 : prefs.dailyGoalMinutes === 10 ? 15 : 5;
    persistPrefs({ ...prefs, dailyGoalMinutes: next });
  }, [persistPrefs, prefs]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    persistPrefs(DEFAULT_PREFS);
  }, [persistPrefs]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: session != null,
      onboarded: prefs.onboarded,
      displayName: prefs.displayName || (session?.user?.email?.split('@')[0] ?? 'Learner'),
      email: session?.user?.email ?? '',
      goal: prefs.goal,
      dailyGoalMinutes: prefs.dailyGoalMinutes,
      loading,
      userId: session?.user?.id ?? null,
      signIn,
      signUp,
      signInWithGoogle,
      completeOnboarding,
      updateDisplayName,
      cycleDailyGoal,
      signOut,
    }),
    [
      session,
      prefs,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      completeOnboarding,
      updateDisplayName,
      cycleDailyGoal,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
