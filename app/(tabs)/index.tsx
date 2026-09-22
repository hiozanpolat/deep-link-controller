import { Link } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/theme';
import { TabHeader } from '@/src/components/ui/TabHeader';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { FeedbackBanner, type FeedbackTone } from '@/src/components/ui/FeedbackBanner';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { LinkTypeBadge } from '@/src/features/deep-link/components/LinkTypeBadge';
import { LinkHistoryRow } from '@/src/features/deep-link/components/LinkHistoryRow';
import { UrlInspector } from '@/src/features/deep-link/components/UrlInspector';
import { CommandPreview } from '@/src/features/deep-link/components/CommandPreview';
import { openDeepLink } from '@/src/features/deep-link/services/openLink';
import { analyzeUrl } from '@/src/features/deep-link/utils/url';
import { selectFavorites, selectRecentLinks, useLinksStore } from '@/src/store/useLinksStore';
import type { TestPlatform } from '@/src/features/deep-link/types';

/** The OS this device actually runs — the only platform that matters for opening. */
const DEVICE_PLATFORM: TestPlatform = Platform.OS === 'ios' ? 'ios' : 'android';

interface Feedback {
  tone: FeedbackTone;
  message: string;
  detail?: string;
}

const EXAMPLES = ['myapp://product/42?source=push', 'https://app.example.com/product/42'];

export default function LauncherScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  const items = useLinksStore((s) => s.items);
  const addOrTouch = useLinksStore((s) => s.addOrTouch);
  const toggleFavorite = useLinksStore((s) => s.toggleFavorite);
  const remove = useLinksStore((s) => s.remove);

  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [opening, setOpening] = useState(false);

  const analysis = useMemo(() => analyzeUrl(input), [input]);
  const hasInput = input.trim().length > 0;
  const recent = useMemo(() => selectRecentLinks(items, 5), [items]);
  const favorites = useMemo(() => selectFavorites(items), [items]);

  const onOpen = async () => {
    if (!hasInput) {
      setFeedback({ tone: 'error', message: 'Enter a URL first.' });
      return;
    }
    if (!analysis.isValid) {
      setFeedback({
        tone: 'error',
        message: analysis.validationError ?? 'That URL is not valid.',
      });
      return;
    }
    setOpening(true);
    try {
      const result = await openDeepLink(input);
      addOrTouch(input, analysis.linkType, DEVICE_PLATFORM);
      if (result.outcome === 'opened') {
        setFeedback({ tone: 'success', message: result.message });
      } else if (result.outcome === 'unavailable') {
        setFeedback({ tone: 'warning', message: result.message, detail: result.detail });
      } else {
        setFeedback({ tone: 'error', message: result.message, detail: result.detail });
      }
    } finally {
      setOpening(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TabHeader
        title="Deep Link Controller"
        subtitle="Type a link, inspect it, and hand it to the OS. What happens next depends on the apps installed on this device."
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 32, gap: spacing.lg }}
        keyboardShouldPersistTaps="handled">

      <AppCard>
        <AppInput
          label="URL to test"
          value={input}
          onChangeText={(t) => {
            setInput(t);
            if (feedback) setFeedback(null);
          }}
          placeholder="myapp://product/42?source=push"
          onClear={() => {
            setInput('');
            setFeedback(null);
          }}
          error={hasInput && !analysis.isValid ? (analysis.validationError ?? 'Invalid URL.') : undefined}
          accessibilityLabel="URL to test"
        />
        <View style={styles.examples}>
          {EXAMPLES.map((ex) => (
            <Pressable
              key={ex}
              onPress={() => {
                setInput(ex);
                setFeedback(null);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Use example ${ex}`}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <Text style={[styles.example, { color: colors.accent }]} numberOfLines={1}>
                {ex}
              </Text>
            </Pressable>
          ))}
        </View>

        {hasInput ? (
          <View style={{ marginTop: spacing.md }}>
            <LinkTypeBadge linkType={analysis.linkType} />
            {analysis.isTooLong ? (
              <Text style={[styles.longNote, { color: colors.warning }]}>
                This URL is very long — it may be truncated by some apps or shells.
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={{ marginTop: spacing.md }}>
          <AppButton
            title={opening ? 'Opening…' : 'Open link'}
            onPress={onOpen}
            loading={opening}
            accessibilityLabel="Open deep link"
            accessibilityHint="Hands the URL to the operating system"
          />
        </View>

        {feedback ? (
          <View style={{ marginTop: spacing.md }}>
            <FeedbackBanner tone={feedback.tone} message={feedback.message} detail={feedback.detail} />
          </View>
        ) : null}
      </AppCard>

      {hasInput && analysis.isValid ? (
        <View style={{ gap: spacing.md }}>
          <SectionHeader title="Inspect" hint="Tap a parameter to copy it." />
          <UrlInspector analysis={analysis} />
          <CommandPreview url={input.trim()} />
        </View>
      ) : null}

      <View>
        <SectionHeader
          title="Recent"
          hint="Newest first."
          action={
            favorites.length > 0 ? (
              <Link href="/favorites" asChild>
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`View ${favorites.length} favorites`}
                  style={styles.favLink}>
                  <Text style={[styles.favLinkText, { color: colors.accent }]}>
                    ★ Favorites ({favorites.length})
                  </Text>
                </Pressable>
              </Link>
            ) : undefined
          }
        />
        {recent.length === 0 ? (
          <EmptyState
            title="No links tested yet"
            message="Links you open from the Launcher will appear here for quick reuse."
          />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {recent.map((item) => (
              <LinkHistoryRow
                key={item.id}
                item={item}
                compact
                onToggleFavorite={toggleFavorite}
                onDelete={remove}
              />
            ))}
          </View>
        )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  examples: { flexDirection: 'column', gap: 4, marginTop: 8 },
  example: { fontFamily: 'SpaceMono', fontSize: 12, lineHeight: 18 },
  longNote: { fontSize: 12, marginTop: 8, lineHeight: 17 },
  favLink: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  favLinkText: { fontSize: 14, fontWeight: '700' },
});
