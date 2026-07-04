import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { ScreenSkeleton } from '@/components/ui/SkeletonLoader';
import { Colors } from '@/constants/colors';
import { MockNewsArticle, getConceptById } from '@/constants/mock-data';
import { Spacing } from '@/constants/spacing';
import { useHaptics } from '@/hooks/useHaptics';
import { useMockProgress } from '@/hooks/useMockProgress';
import { useNews } from '@/hooks/useNews';

function formatDate(iso: string): string {
  const date = new Date(iso.includes('T') ? iso : `${iso}T00:00:00`);
  return date
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    .toUpperCase();
}

function ArticleCard({ article }: { article: MockNewsArticle }) {
  const router = useRouter();
  const haptics = useHaptics();
  const { markNewsRead } = useMockProgress();
  const concept = getConceptById(article.concept_id);

  return (
    <Card>
      <AppText size="caption" label color={Colors.textMuted}>
        {formatDate(article.published_at)}
      </AppText>
      <AppText size="lg" weight="medium" style={styles.articleTitle}>
        {article.title}
      </AppText>
      <AppText size="sm" color={Colors.textSecondary} leading="relaxed">
        {article.summary}
      </AppText>
      {article.why_it_matters ? (
        <>
          <View style={styles.dividerLine} />
          <AppText size="xs" label color={Colors.textMuted}>
            Why it matters
          </AppText>
          <AppText size="sm" color={Colors.textSecondary} leading="normal" style={styles.whyText}>
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
            <AppText size="xs" color={Colors.accent}>
              Learn this concept → +{article.xp_reward} XP
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

export default function NewsScreen() {
  const { articles, loading, loadingMore, hasMore, loadMore } = useNews('all');

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScreenSkeleton rows={3} />
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
              <ActivityIndicator size="small" color={Colors.textMuted} />
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.gap.md }} />}
        renderItem={({ item }) => <ArticleCard article={item} />}
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
    backgroundColor: Colors.borderDefault,
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
