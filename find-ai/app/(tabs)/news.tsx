import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { LoadingScene } from '@/components/ui/LoadingScene';
import { MockNewsArticle, getConceptById } from '@/constants/mock-data';
import { Spacing } from '@/constants/spacing';
import { useHaptics } from '@/hooks/useHaptics';
import { useProgress } from '@/hooks/useProgress';
import { useNews } from '@/hooks/useNews';
import { type ColorPalette, useColors } from '@/theme';

function formatDate(iso: string): string {
  const date = new Date(iso.includes('T') ? iso : `${iso}T00:00:00`);
  return date
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    .toUpperCase();
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.bg,
    },
    list: {
      padding: Spacing.padding.screen,
      paddingBottom: Spacing.bottomOffset,
    },
    title: {
      marginBottom: Spacing.gap.xl,
    },
    articleTitle: {
      marginTop: Spacing.gap.sm,
      marginBottom: Spacing.gap.sm,
    },
    dividerLine: {
      height: 1,
      backgroundColor: colors.borderDefault,
      marginVertical: Spacing.gap.lg,
    },
    whyText: {
      marginTop: 6,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: Spacing.gap.lg,
    },
    footerLoader: {
      paddingVertical: Spacing.gap.xl,
      alignItems: 'center',
    },
  });
}

function ArticleCard({ article }: { article: MockNewsArticle }) {
  const router = useRouter();
  const haptics = useHaptics();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { markNewsRead } = useProgress();
  const concept = getConceptById(article.concept_id);

  return (
    <Card>
      <AppText size="caption" label color={colors.textMuted}>
        {formatDate(article.published_at)}
      </AppText>
      <AppText size="lg" weight="medium" style={styles.articleTitle}>
        {article.title}
      </AppText>
      <AppText size="sm" color={colors.textSecondary} leading="relaxed">
        {article.summary}
      </AppText>
      {article.why_it_matters ? (
        <>
          <View style={styles.dividerLine} />
          <AppText size="xs" label color={colors.textMuted}>
            Why it matters
          </AppText>
          <AppText size="sm" color={colors.textSecondary} leading="normal" style={styles.whyText}>
            {article.why_it_matters}
          </AppText>
        </>
      ) : null}
      <View style={styles.bottomRow}>
        <Chip>{article.concept_title}</Chip>
        {concept ? (
          <Pressable
            hitSlop={8}
            onPress={() => {
              haptics.light();
              markNewsRead(article.id, article.xp_reward);
              router.push(`/(tabs)/learn/${concept.slug}`);
            }}
          >
            <AppText size="xs" color={colors.accent}>
              Learn this concept → +{article.xp_reward} XP
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

export default function NewsScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { articles, loading, loadingMore, refreshing, hasMore, loadMore, refresh } =
    useNews('all');

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.loader}>
          <LoadingScene fullscreen={false} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={refresh}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <AppText size="2xl" weight="medium" style={styles.title}>
            News
          </AppText>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.textMuted} />
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.gap.md }} />}
        renderItem={({ item }) => <ArticleCard article={item} />}
      />
    </SafeAreaView>
  );
}
