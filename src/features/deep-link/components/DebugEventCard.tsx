import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/src/theme/theme';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { copyText } from '@/src/lib/clipboard';
import { AppButton } from '@/src/components/ui/AppButton';
import type { DebugEvent } from '@/src/features/deep-link/types';
import { analyzeUrl, truncateUrl } from '@/src/features/deep-link/utils/url';
import { UrlInspector } from '@/src/features/deep-link/components/UrlInspector';

export function DebugEventCard({ event, expanded }: { event: DebugEvent; expanded: boolean }) {
  const { colors, radius, spacing } = useTheme();
  const [copied, setCopied] = React.useState(false);
  const analysis = analyzeUrl(event.url);

  const onCopy = async () => {
    const ok = await copyText(event.url);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 1200);
  };

  const when = new Date(event.receivedAt).toLocaleString();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.md,
        padding: spacing.md,
      }}
      accessibilityLabel={`Debug event, ${event.type === 'initial' ? 'initial URL' : 'runtime URL event'}, ${event.url}`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <AppBadge
          label={event.type === 'initial' ? 'Initial URL' : 'Runtime event'}
          tone={event.type === 'initial' ? 'warning' : 'accent'}
        />
        <Text style={{ color: colors.muted, fontSize: 12, flex: 1 }} numberOfLines={1}>
          {when}
        </Text>
      </View>
      <Text
        selectable
        style={{
          fontFamily: 'SpaceMono',
          fontSize: 13.5,
          color: colors.text,
          marginTop: spacing.sm,
          lineHeight: 19,
        }}>
        {expanded ? event.url : truncateUrl(event.url, 90)}
      </Text>
      <View style={{ flexDirection: 'row', marginTop: spacing.sm }}>
        <AppButton
          title={copied ? 'Copied ✓' : 'Copy URL'}
          variant="ghost"
          onPress={onCopy}
          accessibilityLabel={`Copy debug URL ${event.url}`}
        />
      </View>
      {expanded ? (
        <View style={{ marginTop: spacing.sm }}>
          <UrlInspector analysis={analysis} />
        </View>
      ) : null}
    </View>
  );
}
