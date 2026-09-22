import Constants from 'expo-constants';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, type ThemePreference } from '@/src/theme/theme';
import { useThemePreference } from '@/src/theme/theme';
import { AppCard } from '@/src/components/ui/AppCard';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { TabHeader } from '@/src/components/ui/TabHeader';
import { selectFavorites, useLinksStore } from '@/src/store/useLinksStore';
import { useDebugStore } from '@/src/features/deep-link/hooks/useIncomingDeepLinks';

const APPEARANCE: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System default' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { preference, setPreference } = useThemePreference();

  const items = useLinksStore((s) => s.items);
  const clearHistory = useLinksStore((s) => s.clearHistory);
  const clearFavorites = useLinksStore((s) => s.clearFavorites);
  const debugEvents = useDebugStore((s) => s.events);
  const clearDebug = useDebugStore((s) => s.clear);

  const favoritesCount = selectFavorites(items).length;
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const confirm = (title: string, message: string, onOk: () => void) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onOk },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TabHeader title="Settings" subtitle="Appearance, defaults, and local data." />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 32, gap: spacing.lg }}>

      <View>
        <SectionHeader title="Appearance" hint="Applies to every screen, no restart needed." />
        <AppCard>
          <View accessibilityRole="radiogroup" accessibilityLabel="Appearance">
            {APPEARANCE.map((opt) => {
              const selected = preference === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setPreference(opt.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={opt.label}
                  style={({ pressed }) => [
                    styles.radioRow,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}>
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: selected ? colors.accent : colors.border,
                      },
                    ]}>
                    {selected ? (
                      <View style={[styles.radioDot, { backgroundColor: colors.accent }]} />
                    ) : null}
                  </View>
                  <Text style={[styles.radioLabel, { color: colors.text }]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </AppCard>
      </View>

      <View>
        <SectionHeader title="Local data" hint="Everything stays on this device." />
        <AppCard>
          <DataRow
            label="History"
            detail={`${items.length} saved`}
            actionLabel="Clear"
            onAction={() =>
              confirm(
                'Clear history?',
                'Removes all non-favorite entries. Favorites are kept.',
                clearHistory,
              )
            }
          />
          <DataRow
            label="Favorites"
            detail={`${favoritesCount} saved`}
            actionLabel="Clear"
            onAction={() =>
              confirm(
                'Clear favorites?',
                'Removes the favorite flag from all links. History entries are kept.',
                clearFavorites,
              )
            }
          />
          <DataRow
            label="Debug session"
            detail={`${debugEvents.length} events`}
            actionLabel="Clear"
            onAction={clearDebug}
            last
          />
        </AppCard>
        <Text style={[styles.privacy, { color: colors.muted }]}>
          URLs can contain tokens and IDs, so they are stored only in on-device storage, never
          sent anywhere, and never logged with full query strings. Clearing data takes effect
          immediately.
        </Text>
      </View>

      <View>
        <SectionHeader title="About" />
        <AppCard>
          <Text style={[styles.about, { color: colors.text }]}>Deep Link Controller · v{appVersion}</Text>
          <Text style={[styles.aboutBody, { color: colors.muted }]}>
            A developer utility for launching, inspecting, and debugging mobile deep links.
            Custom schemes (e.g. deeplinkcontroller://) work out of the box. HTTPS Universal Links and
            Android App Links additionally require verified domain configuration owned by the
            target app — this app never claims an HTTPS link is verified.
          </Text>
          <Text style={[styles.aboutBody, { color: colors.muted, marginTop: 8 }]}>
            Native link delivery (cold start + runtime events) requires a development build;
            Expo Go cannot fully validate custom-scheme handling.
          </Text>
        </AppCard>
      </View>
      </ScrollView>
    </View>
  );
}

function DataRow({
  label,
  detail,
  actionLabel,
  onAction,
  last = false,
}: {
  label: string;
  detail: string;
  actionLabel: string;
  onAction: () => void;
  last?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.dataRow,
        !last && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}>
      <View style={styles.dataTexts}>
        <Text style={[styles.dataLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.dataDetail, { color: colors.muted }]}>{detail}</Text>
      </View>
      <Pressable
        onPress={onAction}
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel} ${label}`}
        style={styles.dataAction}>
        <Text style={[styles.dataActionText, { color: colors.danger }]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  radioRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48, gap: 12 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 12, height: 12, borderRadius: 6 },
  radioLabel: { fontSize: 15, fontWeight: '500' },
  dataRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  dataTexts: { flex: 1 },
  dataLabel: { fontSize: 15, fontWeight: '600' },
  dataDetail: { fontSize: 13, marginTop: 2 },
  dataAction: { minWidth: 44, minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  dataActionText: { fontSize: 14, fontWeight: '700' },
  privacy: { fontSize: 12, marginTop: 8, lineHeight: 17 },
  about: { fontSize: 15, fontWeight: '700' },
  aboutBody: { fontSize: 13, marginTop: 6, lineHeight: 19 },
});
