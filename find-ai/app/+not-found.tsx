import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { AppText } from '@/components/ui/AppText';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <AppText size="xl" weight="medium">
        This screen doesn't exist.
      </AppText>
      <Link href="/" style={styles.link}>
        <AppText size="sm" color={Colors.accent}>
          Go to home screen
        </AppText>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.bg,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
