import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/spacing';
import { AppText } from '@/components/ui/AppText';
import { GhostButton } from '@/components/ui/GhostButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useColors } from '@/theme';

interface ExitModalProps {
  visible: boolean;
  onExit: () => void;
  onKeepLearning: () => void;
}

/** Confirmation before abandoning an in-progress lesson/quiz/simulation. */
export function ExitModal({ visible, onExit, onKeepLearning }: ExitModalProps) {
  const colors = useColors();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onKeepLearning}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <AppText size="xl" weight="medium" center>
            Lose your progress?
          </AppText>
          <AppText size="sm" color={colors.textSecondary} center style={styles.subtitle}>
            If you exit now, you'll lose your progress in this session.
          </AppText>
          <PrimaryButton title="Exit" onPress={onExit} style={styles.exitButton} />
          <GhostButton title="Keep learning" onPress={onKeepLearning} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.padding.cardLg,
  },
  content: {
    width: '100%',
    maxWidth: 340,
  },
  subtitle: {
    marginTop: Spacing.gap.sm,
    marginBottom: Spacing.gap['2xl'],
  },
  exitButton: {
    marginBottom: Spacing.gap.md,
  },
});
