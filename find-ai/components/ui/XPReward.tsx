import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { AppText } from './AppText';
import { Confetti } from './Confetti';
import { Mascot } from './Mascot';
import { PrimaryButton } from './PrimaryButton';

interface XPRewardProps {
  xp: number;
  subtitle: string;
  buttonTitle?: string;
  onContinue: () => void;
  children?: React.ReactNode;
}

/** Full-screen celebration overlay: "+25 XP", subtitle, confetti, scale-in entrance.
 *  When xp === 0 (repeat completion), shows an inspiring message instead — no confetti. */
export function XPReward({ xp, subtitle, buttonTitle = 'Continue', onContinue, children }: XPRewardProps) {
  const scale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const isRepeat = xp === 0;

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 120 });
    textOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
  }, [scale, textOpacity]);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fadeStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));

  return (
    <View style={styles.container}>
      {!isRepeat && <Confetti />}
      <View style={styles.center}>
        <Mascot
          pose={isRepeat ? 'encourage' : 'celebrate'}
          size={150}
          animate="entrance"
          style={styles.mascot}
        />
        <Animated.View style={scaleStyle}>
          {isRepeat ? (
            <AppText size="5xl" weight="medium" color={Colors.accent} center>
              Great Revision!
            </AppText>
          ) : (
            <AppText size="5xl" weight="medium" color={Colors.accent} center>
              +{xp} XP
            </AppText>
          )}
        </Animated.View>
        <Animated.View style={[styles.subtitle, fadeStyle]}>
          <AppText size="base" color={Colors.textSecondary} center>
            {subtitle}
          </AppText>
        </Animated.View>
        {children ? <Animated.View style={[styles.extra, fadeStyle]}>{children}</Animated.View> : null}
      </View>
      <View style={styles.bottom}>
        <PrimaryButton title={buttonTitle} onPress={onContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.padding.cardLg,
  },
  subtitle: {
    marginTop: Spacing.gap.md,
  },
  mascot: {
    marginBottom: Spacing.gap.md,
  },
  extra: {
    marginTop: Spacing.gap['2xl'],
    alignSelf: 'stretch',
  },
  bottom: {
    padding: Spacing.padding.screen,
    paddingBottom: 48,
  },
});
