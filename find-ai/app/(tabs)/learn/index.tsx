import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConceptCard } from '@/components/learn/ConceptCard';
import { DomainFilter, DomainFilterValue } from '@/components/learn/DomainFilter';
import { AppText } from '@/components/ui/AppText';
import { ScreenSkeleton } from '@/components/ui/SkeletonLoader';
import { Colors } from '@/constants/colors';
import { MOCK_CONCEPTS } from '@/constants/mock-data';
import { Spacing } from '@/constants/spacing';
import { useMockLoading } from '@/hooks/useMockLoading';

export default function LearnScreen() {
  const router = useRouter();
  const loading = useMockLoading();
  const [filter, setFilter] = useState<DomainFilterValue>('all');

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScreenSkeleton rows={5} />
      </SafeAreaView>
    );
  }

  const concepts =
    filter === 'all' ? MOCK_CONCEPTS : MOCK_CONCEPTS.filter((c) => c.domain === filter);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <AppText size="2xl" weight="medium" style={styles.title}>
        Learn
      </AppText>
      <View style={styles.filters}>
        <DomainFilter selected={filter} onSelect={setFilter} />
      </View>
      <FlatList
        data={concepts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.gap.md }} />}
        renderItem={({ item }) => (
          <ConceptCard
            concept={item}
            masteryLevel={item.mastery_level}
            onPress={() => router.push(`/(tabs)/learn/${item.slug}`)}
          />
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
  title: {
    padding: Spacing.padding.screen,
  },
  filters: {
    paddingBottom: Spacing.padding.screen,
  },
  list: {
    paddingHorizontal: Spacing.padding.screen,
    paddingBottom: Spacing.bottomOffset,
  },
});
