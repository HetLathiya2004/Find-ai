import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Platform } from 'react-native';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Haptic feedback wrapper, mapped to interaction importance:
 * - light:   tab press, card tap, filter selection, option select
 * - medium:  correct answer, lesson card advance, daily goal increment
 * - success: lesson complete, quiz passed, badge earned, level up
 * - warning: wrong answer, heart lost
 */
export function useHaptics() {
  const light = useCallback(() => {
    if (isNative) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const medium = useCallback(() => {
    if (isNative) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, []);

  const success = useCallback(() => {
    if (isNative) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, []);

  const warning = useCallback(() => {
    if (isNative) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }, []);

  return { light, medium, success, warning };
}
