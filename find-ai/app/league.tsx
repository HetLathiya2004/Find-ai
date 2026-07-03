import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { BackRow } from '@/components/ui/BackRow';
import { Colors } from '@/constants/colors';
import { MOCK_LEAGUE, MockLeagueUser } from '@/constants/mock-data';
import { Spacing } from '@/constants/spacing';

const PROMOTION_CUTOFF = 5;
const DEMOTION_CUTOFF = 25; // ranks 26-30 demote

function zoneDotColor(rank: number, total: number): string {
  if (rank <= PROMOTION_CUTOFF) return Colors.accent;
  if (rank > total - PROMOTION_CUTOFF) return Colors.danger;
  return Colors.borderDefault;
}

function LeagueRow({ user, total }: { user: MockLeagueUser; total: number }) {
  return (
    <View style={[styles.row, user.is_current_user && styles.currentUserRow]}>
      <View style={[styles.zoneDot, { backgroundColor: zoneDotColor(user.rank, total) }]} />
      <AppText size="sm" weight="medium" style={styles.rank}>
        {user.rank}
      </AppText>
      <AppText size="base" style={styles.name}>
        {user.name}
      </AppText>
      <AppText size="sm" color={Colors.textSecondary}>
        {user.weekly_xp} XP
      </AppText>
    </View>
  );
}

export default function LeagueScreen() {
  const total = MOCK_LEAGUE.users.length;
  const daysUntilReset = Math.max(
    Math.ceil((new Date(MOCK_LEAGUE.week_end).getTime() - Date.now()) / 86_400_000),
    0,
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <FlatList
        data={MOCK_LEAGUE.users}
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
                {MOCK_LEAGUE.tier} League
              </AppText>
              <AppText size="sm" color={Colors.textSecondary} center style={styles.subtitle}>
                Resets in {daysUntilReset} days
              </AppText>
            </View>
            <AppText size="caption" label color={Colors.accent} style={styles.zoneLabel}>
              Promotion zone — top {PROMOTION_CUTOFF}
            </AppText>
          </>
        }
        renderItem={({ item }) => (
          <>
            <LeagueRow user={item} total={total} />
            {item.rank === DEMOTION_CUTOFF ? (
              <AppText size="caption" label color={Colors.danger} style={styles.demotionLabel}>
                Demotion zone — bottom {total - DEMOTION_CUTOFF}
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
  list: {
    padding: Spacing.padding.screen,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.gap.xl,
  },
  trophy: {
    fontSize: 36,
    lineHeight: 44,
    marginBottom: Spacing.gap.sm,
  },
  subtitle: {
    marginTop: 4,
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
});
