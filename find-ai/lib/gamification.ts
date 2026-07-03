// Pure gamification logic — no backend calls. Phase 1 uses MMKV for persistence.

// Level thresholds (13 tiers)
const LEVEL_THRESHOLDS = [0, 200, 500, 900, 1400, 2000, 2700, 3500, 4500, 5700, 7000, 8500, 10100];

export function levelForXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function xpForNextLevel(xp: number) {
  const level = levelForXP(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold;
  const needed = nextThreshold - currentThreshold;
  return {
    current: xp - currentThreshold,
    needed,
    toNext: nextThreshold - xp,
    progress: needed > 0 ? (xp - currentThreshold) / needed : 1,
  };
}

export function masteryLabel(level: number): string {
  return ['Unknown', 'Aware', 'Learning', 'Practicing', 'Proficient', 'Mastered'][level] ?? 'Unknown';
}

export function domainLabel(domain: string): string {
  const map: Record<string, string> = {
    markets: 'Markets',
    investing: 'Investing',
    macro: 'Macro',
    corporate_finance: 'Corporate Finance',
  };
  return map[domain] ?? domain;
}

export function domainColor(domain: string): string {
  const map: Record<string, string> = {
    markets: '#3B82F6',
    investing: '#10B981',
    macro: '#F97316',
    corporate_finance: '#8B5CF6',
  };
  return map[domain] ?? '#FFFFFF';
}

export function greetingForTime(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatXP(xp: number): string {
  return xp.toLocaleString('en-US');
}
