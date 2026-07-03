import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { MOCK_USER } from '@/constants/mock-data';
import { getJSON, remove, setJSON, StorageKeys } from '@/lib/storage';

export interface AuthState {
  isAuthenticated: boolean;
  onboarded: boolean;
  displayName: string;
  email: string;
  goal: 'grow_wealth' | 'understand_news' | 'learn_basics';
  dailyGoalMinutes: 5 | 10 | 15;
}

const DEFAULT_STATE: AuthState = {
  isAuthenticated: false,
  onboarded: false,
  displayName: MOCK_USER.display_name,
  email: MOCK_USER.email,
  goal: MOCK_USER.goal,
  dailyGoalMinutes: MOCK_USER.daily_goal_minutes,
};

interface AuthContextValue extends AuthState {
  signIn: (email: string) => void;
  signUp: (email: string) => void;
  completeOnboarding: (opts: {
    goal: AuthState['goal'];
    dailyGoalMinutes: AuthState['dailyGoalMinutes'];
    displayName: string;
  }) => void;
  updateDisplayName: (name: string) => void;
  cycleDailyGoal: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(
    () => getJSON<AuthState>(StorageKeys.auth) ?? DEFAULT_STATE,
  );

  const persist = useCallback((next: AuthState) => {
    setState(next);
    setJSON(StorageKeys.auth, next);
  }, []);

  const signIn = useCallback(
    (email: string) => {
      // Existing accounts skip onboarding in the mock flow.
      persist({ ...DEFAULT_STATE, isAuthenticated: true, onboarded: true, email });
    },
    [persist],
  );

  const signUp = useCallback(
    (email: string) => {
      persist({ ...DEFAULT_STATE, isAuthenticated: true, onboarded: false, email });
    },
    [persist],
  );

  const completeOnboarding = useCallback(
    (opts: { goal: AuthState['goal']; dailyGoalMinutes: AuthState['dailyGoalMinutes']; displayName: string }) => {
      persist({
        ...state,
        onboarded: true,
        goal: opts.goal,
        dailyGoalMinutes: opts.dailyGoalMinutes,
        displayName: opts.displayName,
      });
    },
    [persist, state],
  );

  const updateDisplayName = useCallback(
    (name: string) => {
      persist({ ...state, displayName: name.trim() || state.displayName });
    },
    [persist, state],
  );

  const cycleDailyGoal = useCallback(() => {
    const next = state.dailyGoalMinutes === 5 ? 10 : state.dailyGoalMinutes === 10 ? 15 : 5;
    persist({ ...state, dailyGoalMinutes: next });
  }, [persist, state]);

  const signOut = useCallback(() => {
    remove(StorageKeys.auth);
    setState(DEFAULT_STATE);
  }, []);

  const value = useMemo(
    () => ({ ...state, signIn, signUp, completeOnboarding, updateDisplayName, cycleDailyGoal, signOut }),
    [state, signIn, signUp, completeOnboarding, updateDisplayName, cycleDailyGoal, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useMockAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useMockAuth must be used within MockAuthProvider');
  return ctx;
}
