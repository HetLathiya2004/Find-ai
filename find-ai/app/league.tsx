import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { BackRow } from '@/components/ui/BackRow';
import { ErrorState } from '@/components/ui/ErrorState';
import { Mascot } from '@/components/ui/Mascot';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import type { LeaderboardUser } from '@/types/api';

const PROMOTION_CUTOFF = 5;
const DEMOTION_CUTOFF = 25;

function zoneDotColor(rank: number, total: number): string {
  if (rank <= PROMOTION_CUTOFF) return Colors.accent;
  if (rank > Math.max(total - 5, DEMOTION_CUTOFF)) return Colors.danger;
  return Colors.borderDefault;
}

function LeagueRow({ user, total }: { user: LeaderboardUser; total: number }) {
  return (
    <View style={[styles.row, user.is_current_user && styles.currentUserRow]}>
      <View style={[styles.zoneDot, { backgroundColor: zoneDotColor(user.rank, total) }]} />
      <AppText size="sm" weight="medium" style={styles.rank}>
        {user.rank}
      </AppText>
      <AppText size="base" style={styles.name}>
        {user.username}
      </AppText>
      <View style={styles.scoreCol}>
        <AppText size="sm" color={Colors.textSecondary}>
          {user.league_score} pts
        </AppText>
        {user.streak > 0 ? (
          <AppText size="xs" color={Colors.textMuted}>
            {user.total_xp} XP + {user.streak * 10} streak
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

export default function LeagueScreen() {
  const { leaderboard, loading, error, refresh } = useLeaderboard();

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <BackRow label="back" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
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
              <Mascot pose="celebrate" size={128} animate="entrance" />
              <AppText size="2xl" weight="medium" center>
                {tier} League
              </AppText>
              <AppText size="sm" color={Colors.textSecondary} center style={styles.subtitle}>
                climb the ranks, stack that XP
              </AppText>
              <AppText size="xs" color={Colors.textMuted} center style={styles.scoring}>
                score = total XP + streak × 10
              </AppText>
            </View>
            <AppText size="caption" label color={Colors.accent} style={styles.zoneLabel}>
              promotion zone · top {PROMOTION_CUTOFF}
            </AppText>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText size="base" color={Colors.textSecondary} center>
              nobody's on the board yet. finish a lesson to claim the top spot
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <>
            <LeagueRow user={item} total={total} />
            {item.rank === DEMOTION_CUTOFF && total > DEMOTION_CUTOFF ? (
              <AppText size="caption" label color={Colors.danger} style={styles.demotionLabel}>
                danger zone · bottom {total - DEMOTION_CUTOFF}
              </AppText>
            ) : null}
          </>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
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
    backgroundColor: Colors.surface2,
    borderLeftWidth: 3,
    borderLeftColor: Colors.textPrimary,
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
