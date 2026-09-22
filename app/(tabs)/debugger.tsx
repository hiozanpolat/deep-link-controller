import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/theme';
import { TabHeader } from '@/src/components/ui/TabHeader';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { DebugEventCard } from '@/src/features/deep-link/components/DebugEventCard';
import { useDebugStore } from '@/src/features/deep-link/hooks/useIncomingDeepLinks';

const INCOMING_LINK_EXAMPLE =
  Platform.OS === 'ios'
    ? 'xcrun simctl openurl booted "deeplinkcontroller://debug/hello?from=simctl"'
    : 'adb shell am start -a android.intent.action.VIEW -d "deeplinkcontroller://debug/hello?from=adb"';

export default function DebuggerScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const status = useDebugStore((s) => s.status);
  const error = useDebugStore((s) => s.error);
  const events = useDebugStore((s) => s.events);
  const clear = useDebugStore((s) => s.clear);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [latestExpanded, setLatestExpanded] = useState(true);

  const latest = events[0];
  const rest = events.slice(1);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TabHeader title="Debugger" subtitle="Shows links delivered to this app — via cold start or while running." />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 32, gap: spacing.lg }}>

      <AppCard>
        <View style={styles.statusRow}>
          <AppBadge
            label={status === 'listening' ? 'Listening' : status === 'loading' ? 'Starting…' : 'Listener error'}
            tone={status === 'listening' ? 'success' : status === 'loading' ? 'neutral' : 'danger'}
          />
          <Text style={[styles.count, { color: colors.muted }]}>
            {events.length} event{events.length === 1 ? '' : 's'} this session
          </Text>
        </View>
        {error ? (
          <Text style={[styles.error, { color: colors.danger }]} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
        <Text style={[styles.note, { color: colors.muted }]}>
          This debugger only observes links routed to Deep Link Controller itself (scheme: deeplinkcontroller://).
          It cannot see links handled by other apps, and launching a link from the Launcher tab
          does not create a debug event unless the OS routes it back here.
        </Text>
        <Text style={[styles.hint, { color: colors.muted }]}>
          {'Try it from your computer while the app runs: '}
          <Text style={{ fontFamily: 'SpaceMono', color: colors.text }}>{INCOMING_LINK_EXAMPLE}</Text>
        </Text>
      </AppCard>

      {latest ? (
        <View style={{ gap: spacing.sm }}>
          <SectionHeader
            title="Latest incoming URL"
            action={
              <Pressable
                onPress={() => setLatestExpanded((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={latestExpanded ? 'Collapse latest event' : 'Expand latest event'}
                style={styles.toggle}>
                <Text style={[styles.toggleText, { color: colors.accent }]}>
                  {latestExpanded ? 'Collapse' : 'Expand'}
                </Text>
              </Pressable>
            }
          />
          <DebugEventCard event={latest} expanded={latestExpanded} />
        </View>
      ) : (
        <EmptyState
          title={status === 'loading' ? 'Starting listener…' : 'No incoming links yet'}
          message={
            status === 'loading'
              ? 'Checking how the app was launched.'
              : 'Open a deeplinkcontroller:// link targeting this app and it will appear here with full parsing.'
          }
        />
      )}

      {rest.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <SectionHeader
            title="Session timeline"
            hint="Older events, newest first."
            action={<AppButton title="Clear" variant="ghost" onPress={clear} accessibilityLabel="Clear debug session" />}
          />
          {rest.map((e) => (
            <Pressable
              key={e.id}
              onPress={() => setExpandedId((cur) => (cur === e.id ? null : e.id))}
              accessibilityRole="button"
              accessibilityLabel={`${expandedId === e.id ? 'Collapse' : 'Expand'} debug event ${e.url}`}>
              <DebugEventCard event={e} expanded={expandedId === e.id} />
            </Pressable>
          ))}
        </View>
      ) : events.length > 0 ? (
        <AppButton title="Clear session" variant="secondary" onPress={clear} accessibilityLabel="Clear debug session" />
      ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  count: { fontSize: 13 },
  error: { fontSize: 13, marginTop: 8, lineHeight: 18 },
  note: { fontSize: 13, marginTop: 12, lineHeight: 19 },
  hint: { fontSize: 12, marginTop: 8, lineHeight: 18 },
  toggle: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  toggleText: { fontSize: 14, fontWeight: '700' },
});
