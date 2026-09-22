import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/src/theme/theme';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Text style={[styles.title, { color: colors.text }]}>This screen does not exist.</Text>
        <Link href="/(tabs)" style={styles.link}>
          <Text style={[styles.linkText, { color: colors.accent }]}>Go to Launcher</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  link: { marginTop: 15, paddingVertical: 15 },
  linkText: { fontSize: 14 },
});
