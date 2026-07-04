import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import type { MockConcept } from '@/constants/mock-data';
import { domainColor, domainLabel } from '@/lib/gamification';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';

interface ComingSoonCardProps {
  concept: MockConcept;
}

/**
 * Locked concept card for modules flagged is_coming_soon by the API.
 * Same shape as ConceptCard but not pressable, with a translucent overlay.
 */
export function ComingSoonCard({ concept }: ComingSoonCardProps) {
  const color = domainColor(concept.domain);
  return (
    <Card style={{ borderLeftWidth: 3, borderLeftColor: color }}>
      <AppText size="caption" label color={color} style={styles.domain}>
        {domainLabel(concept.domain)}
      </AppText>
      <AppText size="base" weight="medium" style={styles.title}>
        {concept.title}
      </AppText>
      <AppText size="xs" color={Colors.textSecondary} numberOfLines={2}>
        {concept.description}
      </AppText>
      <View style={styles.overlay}>
        <Ionicons name="lock-closed" size={24} color={Colors.textMuted} />
        <AppText size="sm" weight="medium" color={Colors.textSecondary} style={styles.overlayText}>
          Coming Soon
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  domain: {
    marginBottom: 6,
  },
  title: {
    marginBottom: Spacing.gap.sm,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.surface1 + 'BF', // 75% opacity
    borderRadius: Spacing.radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    marginTop: Spacing.gap.sm,
  },
});
