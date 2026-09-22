import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/theme';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { FeedbackBanner } from '@/src/components/ui/FeedbackBanner';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { LinkTypeBadge } from '@/src/features/deep-link/components/LinkTypeBadge';
import { UrlInspector } from '@/src/features/deep-link/components/UrlInspector';
import { CommandPreview } from '@/src/features/deep-link/components/CommandPreview';
import { openDeepLink } from '@/src/features/deep-link/services/openLink';
import { copyText } from '@/src/lib/clipboard';
import { analyzeUrl } from '@/src/features/deep-link/utils/url';
import { useLinksStore } from '@/src/store/useLinksStore';

export default function LinkDetailsScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const item = useLinksStore((s) => s.items.find((i) => i.id === id));
  const toggleFavorite = useLinksStore((s) => s.toggleFavorite);
  const updateUrl = useLinksStore((s) => s.updateUrl);
  const touchOpened = useLinksStore((s) => s.touchOpened);
  const remove = useLinksStore((s) => s.remove);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const analysis = useMemo(() => (item ? analyzeUrl(item.url) : null), [item]);
  const draftAnalysis = useMemo(
    () => (draft !== null ? analyzeUrl(draft) : null),
    [draft],
  );

  if (!item || !analysis) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppHeader title="Link details" />
        <View style={{ padding: spacing.lg }}>
          <EmptyState
            title="Link not found"
            message="It may have been deleted."
            actionTitle="Back to History"
            onAction={() => router.back()}
          />
        </View>
      </View>
    );
  }

  const onOpen = async () => {
    setBusy(true);
    try {
      const result = await openDeepLink(item.url);
      if (result.outcome === 'opened') {
        touchOpened(item.id);
        setNotice('Handed to the OS.');
      } else {
        setNotice(result.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const onCopy = async () => {
    setNotice((await copyText(item.url)) ? 'Copied to clipboard.' : 'Copy failed.');
  };

  const onDelete = () => {
    Alert.alert('Delete this link?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          remove(item.id);
          router.back();
        },
      },
    ]);
  };

  const onSaveEdit = () => {
    if (draft === null) return;
    const a = analyzeUrl(draft);
    if (!a.isValid) return;
    updateUrl(item.id, draft.trim(), a.linkType);
    setDraft(null);
    setEditing(false);
    setNotice('Link updated.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader title="Link details" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 32, gap: spacing.lg }}>
      <AppCard>
        <LinkTypeBadge linkType={item.linkType} />
        <Text
          selectable
          style={{
            fontFamily: 'SpaceMono',
            fontSize: 14,
            color: colors.text,
            marginTop: spacing.sm,
            lineHeight: 21,
          }}>
          {item.url}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: spacing.sm, lineHeight: 17 }}>
          Saved {new Date(item.createdAt).toLocaleString()}
          {item.lastOpenedAt ? ` · Last opened ${new Date(item.lastOpenedAt).toLocaleString()}` : ''}
          {item.platform ? ` · ${item.platform === 'ios' ? 'iOS' : 'Android'}` : ''}
        </Text>
        {notice ? (
          <View style={{ marginTop: spacing.md }}>
            <FeedbackBanner tone="info" message={notice} />
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
          <View style={{ flex: 1 }}>
            <AppButton title="Open" onPress={onOpen} loading={busy} accessibilityLabel={`Open ${item.url}`} />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton title="Copy" variant="secondary" onPress={onCopy} accessibilityLabel={`Copy ${item.url}`} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <AppButton
              title={item.isFavorite ? 'Unfavorite' : 'Favorite'}
              variant="secondary"
              onPress={() => toggleFavorite(item.id)}
              accessibilityLabel={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton title="Delete" variant="danger" onPress={onDelete} accessibilityLabel="Delete this link" />
          </View>
        </View>
      </AppCard>

      <View>
        <SectionHeader
          title="Inspect"
          action={
            <AppButton
              title={editing ? 'Cancel edit' : 'Edit URL'}
              variant="ghost"
              onPress={() => {
                if (!editing) setDraft(item.url);
                else setDraft(null);
                setEditing((v) => !v);
              }}
              accessibilityLabel={editing ? 'Cancel editing' : 'Edit URL'}
            />
          }
        />
        {editing ? (
          <AppCard>
            <AppInput
              value={draft ?? ''}
              onChangeText={setDraft}
              onClear={() => setDraft('')}
              error={
                draftAnalysis && !draftAnalysis.isValid
                  ? (draftAnalysis.validationError ?? 'Invalid URL.')
                  : undefined
              }
              accessibilityLabel="Edit URL"
            />
            <View style={{ marginTop: spacing.md }}>
              <AppButton
                title="Save"
                onPress={onSaveEdit}
                disabled={!draftAnalysis?.isValid}
                accessibilityLabel="Save edited URL"
              />
            </View>
          </AppCard>
        ) : (
          <UrlInspector analysis={analysis} />
        )}
      </View>

      <View>
        <SectionHeader title="Test on a device" />
        <CommandPreview url={item.url} />
      </View>
      </ScrollView>
    </View>
  );
}
