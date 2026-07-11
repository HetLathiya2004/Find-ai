import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Mascot } from '@/components/ui/Mascot';
import { Spacing } from '@/constants/spacing';
import { useHaptics } from '@/hooks/useHaptics';
import { useProgress } from '@/hooks/useProgress';
import { useStreakCalendar } from '@/hooks/useStreakCalendar';
import { type ColorPalette, useColors } from '@/theme';

const CELL_SIZE = 36;
const COLUMNS = 7;

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
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
    count: {
      fontSize: 48,
      lineHeight: 56,
      marginTop: -Spacing.gap.sm,
    },
    loadingGrid: {
      width: COLUMNS * CELL_SIZE + (COLUMNS - 1) * 6,
      height: 4 * CELL_SIZE + 3 * 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    retryLabel: {
      marginTop: 4,
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
      backgroundColor: colors.accent,
    },
    cellInactive: {
      borderWidth: 1,
      borderColor: colors.borderDefault,
      backgroundColor: 'transparent',
    },
    cellToday: {
      borderWidth: 2,
      borderColor: colors.textPrimary,
      backgroundColor: 'transparent',
    },
    cellTodayActive: {
      backgroundColor: colors.accent,
      borderWidth: 2,
      borderColor: colors.textPrimary,
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
      borderColor: colors.textPrimary,
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
}

export default function StreakScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { streakCount, streakBest, streakFreezes } = useProgress();
  const { history, loading, error, refresh } = useStreakCalendar();

  const todayIndex = history.length - 1;

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
          <Feather name="x" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Mascot
            pose={streakCount > 0 ? 'cheer' : 'wave'}
            size={150}
            animate={streakCount > 0 ? 'pop' : 'bounce'}
          />
          <AppText weight="medium" color={colors.warning} center style={styles.count}>
            {streakCount}
          </AppText>
          <AppText size="base" color={colors.textSecondary} center>
            day streak
          </AppText>
        </View>

        {/* 28-day calendar grid */}
        {loading ? (
          <View style={styles.loadingGrid}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        ) : error || history.length === 0 ? (
          <Pressable
            style={styles.loadingGrid}
            onPress={() => {
              haptics.light();
              refresh();
            }}
          >
            <AppText size="sm" color={colors.textSecondary} center>
              couldn't load your calendar
            </AppText>
            <AppText size="xs" color={colors.accent} center style={styles.retryLabel}>
              tap to retry
            </AppText>
          </Pressable>
        ) : (
          <View style={styles.grid}>
            {history.map((day, i) => {
              const isToday = i === todayIndex;
              return (
                <View
                  key={day.date}
                  style={[
                    styles.cell,
                    day.active && !isToday && styles.cellActive,
                    !day.active && !isToday && styles.cellInactive,
                    isToday && (day.active ? styles.cellTodayActive : styles.cellToday),
                  ]}
                />
              );
            })}
          </View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
            <AppText size="xs" color={colors.textMuted}>
              Active
            </AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotToday]} />
            <AppText size="xs" color={colors.textMuted}>
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
            <AppText size="xs" color={colors.textMuted} center style={styles.statLabel}>
              longest run
            </AppText>
          </Card>
          <Card variant="strong" style={styles.statCard}>
            <AppText size="2xl" weight="medium" center>
              {streakFreezes}
            </AppText>
            <AppText size="xs" color={colors.textMuted} center style={styles.statLabel}>
              freezes available
            </AppText>
          </Card>
        </View>

        {/* Info */}
        <Card style={styles.infoCard}>
          <AppText size="sm" color={colors.textSecondary} leading="normal">
            Streak freezes protect your streak when you miss a day. You have {streakFreezes} freeze{streakFreezes !== 1 ? 's' : ''}.
          </AppText>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
