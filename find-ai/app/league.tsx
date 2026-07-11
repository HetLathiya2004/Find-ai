import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { BackRow } from '@/components/ui/BackRow';
import { ErrorState } from '@/components/ui/ErrorState';
import { Spacing } from '@/constants/spacing';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import type { LeaderboardUser } from '@/types/api';
import { type ColorPalette, useColors } from '@/theme';

const PROMOTION_CUTOFF = 5;
const DEMOTION_CUTOFF = 25;

function zoneDotColor(colors: ColorPalette, rank: number, total: number): string {
  if (rank <= PROMOTION_CUTOFF) return colors.accent;
  if (rank > Math.max(total - 5, DEMOTION_CUTOFF)) return colors.danger;
  return colors.borderDefault;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    list: {
      padding: Spacing.padding.screen,
      paddingBottom: 48,
    },
    header: {
      alignItems: 'center',
      marginTop: Spacing.gap.xl,
    },
    trophy: {
      fontSize: 42,
      lineHeight: 50,
      marginBottom: Spacing.gap.sm,
    },
    subtitle: {
      marginTop: 4,
    },
    scoring: {
      marginTop: 2,
    },
    zoneLabel: {
      marginTop: Spacing.gap['2xl'],
      marginBottom: Spacing.gap.sm,
    },
    demotionLabel: {
      marginTop: Spacing.gap.sm,
      marginBottom: Spacing.gap.sm,
    },
    row: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.gap.md,
      paddingHorizontal: Spacing.gap.md,
      borderRadius: Spacing.radius.button,
    },
    currentUserRow: {
      backgroundColor: colors.surface2,
      borderLeftWidth: 3,
      borderLeftColor: colors.textPrimary,
      borderRadius: 0,
      borderTopRightRadius: Spacing.radius.button,
      borderBottomRightRadius: Spacing.radius.button,
    },
    zoneDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    rank: {
      width: 28,
    },
    name: {
      flex: 1,
    },
    scoreCol: {
      alignItems: 'flex-end',
    },
    empty: {
      paddingVertical: Spacing.gap['2xl'],
      paddingHorizontal: Spacing.gap.lg,
    },
  });
}

function LeagueRow({ user, total }: { user: LeaderboardUser; total: number }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[styles.row, user.is_current_user && styles.currentUserRow]}>
      <View style={[styles.zoneDot, { backgroundColor: zoneDotColor(colors, user.rank, total) }]} />
      <AppText size="sm" weight="medium" style={styles.rank}>
        {user.rank}
      </AppText>
      <AppText size="base" style={styles.name}>
        {user.username}
      </AppText>
      <View style={styles.scoreCol}>
        <AppText size="sm" color={colors.textSecondary}>
          {user.league_score} pts
        </AppText>
        {user.streak > 0 ? (
          <AppText size="xs" color={colors.textMuted}>
            {user.total_xp} XP + {user.streak * 10} streak
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

export default function LeagueScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { leaderboard, loading, error, refresh } = useLeaderboard();

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <BackRow label="back" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !leaderboard) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <BackRow label="back" />
        <ErrorState message="Could not load leaderboard" onRetry={refresh} />
      </SafeAreaView>
    );
  }

  const total = leaderboard.users.length;
  const tier = leaderboard.current_user_tier ?? 'Bronze';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <FlatList
        data={leaderboard.users}
        keyExtractor={(item) => String(item.rank)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <BackRow label="back" />
            <View style={styles.header}>
              <AppText style={styles.trophy} center>
                🏆
              </AppText>
              <AppText size="2xl" weight="medium" center>
                {tier} League
              </AppText>
              <AppText size="sm" color={colors.textSecondary} center style={styles.subtitle}>
                climb the ranks, stack that XP
              </AppText>
              <AppText size="xs" color={colors.textMuted} center style={styles.scoring}>
                score = total XP + streak × 10
              </AppText>
            </View>
            <AppText size="caption" label color={colors.accent} style={styles.zoneLabel}>
              promotion zone · top {PROMOTION_CUTOFF}
            </AppText>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText size="base" color={colors.textSecondary} center>
              nobody's on the board yet. finish a lesson to claim the top spot
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <>
            <LeagueRow user={item} total={total} />
            {item.rank === DEMOTION_CUTOFF && total > DEMOTION_CUTOFF ? (
              <AppText size="caption" label color={colors.danger} style={styles.demotionLabel}>
                danger zone · bottom {total - DEMOTION_CUTOFF}
              </AppText>
            ) : null}
          </>
        )}
      />
    </SafeAreaView>
  );
}
