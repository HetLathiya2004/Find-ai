import { getString, setString, StorageKeys } from '@/lib/storage';
import type { ColorScheme, ThemePreference } from './types';

const PREFERENCE_ORDER: ThemePreference[] = ['system', 'light', 'dark'];

export function loadThemePreference(): ThemePreference {
  const raw = getString(StorageKeys.theme);
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  return 'system';
}

export function saveThemePreference(preference: ThemePreference): void {
  setString(StorageKeys.theme, preference);
}

export function nextThemePreference(current: ThemePreference): ThemePreference {
  const index = PREFERENCE_ORDER.indexOf(current);
  return PREFERENCE_ORDER[(index + 1) % PREFERENCE_ORDER.length];
}

export function resolveColorScheme(
  preference: ThemePreference,
  systemScheme: ColorScheme | null | undefined,
): ColorScheme {
  if (preference === 'system') {
    return systemScheme === 'light' ? 'light' : 'dark';
  }
  return preference;
}

export function oppositeColorScheme(scheme: ColorScheme): ColorScheme {
  return scheme === 'light' ? 'dark' : 'light';
}
