import { Link } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { type ColorPalette, useColors } from '@/theme';

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: colors.bg,
    },
    link: {
      marginTop: 15,
      paddingVertical: 15,
    },
  });
}

export default function NotFoundScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <AppText size="xl" weight="medium">
        This screen doesn't exist.
      </AppText>
      <Link href="/" style={styles.link}>
        <AppText size="sm" color={colors.accent}>
          Go to home screen
        </AppText>
      </Link>
    </View>
  );
}
