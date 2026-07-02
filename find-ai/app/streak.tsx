import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { MOCK_STREAK_HISTORY } from '@/constants/mock-data';
import { Spacing } from '@/constants/spacing';
import { useHaptics } from '@/hooks/useHaptics';
import { useMockProgress } from '@/hooks/useMockProgress';

const CELL_SIZE = 36;
const COLUMNS = 7;

export default function StreakScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const { streakCount, streakBest, streakFreezes } = useMockProgress();

  const todayIndex = MOCK_STREAK_HISTORY.length - 1;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.closeRow}>
        <Pressable
          hitSlop={12}
          onPress={() => {
            haptics.light();
            router.back();
          }}
        >
          <X size={24} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <AppText style={styles.fire} center>
            🔥
          </AppText>
          <AppText weight="medium" color={Colors.warning} center style={styles.count}>
            {streakCount}
          </AppText>
          <AppText size="base" color={Colors.textSecondary} center>
            day streak
          </AppText>
        </View>

        {/* 28-day calendar grid */}
        <View style={styles.grid}>
          {MOCK_STREAK_HISTORY.map((active, i) => {
            const isToday = i === todayIndex;
            return (
              <View
                key={i}
                style={[
                  styles.cell,
                  active && !isToday && styles.cellActive,
                  !active && !isToday && styles.cellInactive,
                  isToday && styles.cellToday,
                ]}
              />
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
            <AppText size="xs" color={Colors.textMuted}>
              Active
            </AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotToday]} />
            <AppText size="xs" color={Colors.textMuted}>
              Today
            </AppText>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card variant="strong" style={styles.statCard}>
            <AppText size="2xl" weight="medium" center>
              {streakBest}
            </AppText>
            <AppText size="xs" color={Colors.textMuted} center style={styles.statLabel}>
              Best streak — days
            </AppText>
          </Card>
          <Card variant="strong" style={styles.statCard}>
            <AppText size="2xl" weight="medium" center>
              {streakFreezes}
            </AppText>
            <AppText size="xs" color={Colors.textMuted} center style={styles.statLabel}>
              Freezes left — remaining
            </AppText>
          </Card>
        </View>

        {/* Info */}
        <Card style={styles.infoCard}>
          <AppText size="sm" color={Colors.textSecondary} leading="normal">
            Streak freezes protect your streak when you miss a day. You have {streakFreezes} freezes.
          </AppText>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  closeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.padding.screen,
    paddingVertical: Spacing.gap.md,
  },
  content: {
    padding: Spacing.padding.screen,
    paddingBottom: 48,
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  fire: {
    fontSize: 60,
    lineHeight: 72,
  },
  count: {
    fontSize: 48,
    lineHeight: 56,
    marginTop: Spacing.gap.sm,
  },
  grid: {
    width: COLUMNS * CELL_SIZE + (COLUMNS - 1) * 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: Spacing.radius.button,
  },
  cellActive: {
    backgroundColor: Colors.accent,
  },
  cellInactive: {
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    backgroundColor: 'transparent',
  },
  cellToday: {
    borderWidth: 2,
    borderColor: Colors.textPrimary,
    backgroundColor: 'transparent',
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.gap.lg,
    marginTop: Spacing.gap.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDotToday: {
    borderWidth: 1.5,
    borderColor: Colors.textPrimary,
    backgroundColor: 'transparent',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.gap.md,
    marginTop: Spacing.gap['2xl'],
    alignSelf: 'stretch',
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    marginTop: 4,
  },
  infoCard: {
    marginTop: Spacing.gap.lg,
    alignSelf: 'stretch',
  },
});
