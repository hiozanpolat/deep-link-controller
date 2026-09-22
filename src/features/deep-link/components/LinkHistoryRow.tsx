import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/src/theme/theme';
import { copyText } from '@/src/lib/clipboard';
import type { LinkHistoryItem } from '@/src/features/deep-link/types';
import { truncateUrl } from '@/src/features/deep-link/utils/url';
import { openDeepLink } from '@/src/features/deep-link/services/openLink';
import { LinkTypeBadge } from '@/src/features/deep-link/components/LinkTypeBadge';

interface Props {
  item: LinkHistoryItem;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

function IconButton({
  label,
  glyph,
  onPress,
  danger = false,
  active = false,
}: {
  label: string;
  glyph: string;
  onPress: () => void;
  danger?: boolean;
  active?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.iconBtn,
        { opacity: pressed ? 0.55 : 1 },
      ]}>
      <Text
        style={[
          styles.iconGlyph,
          { color: danger ? colors.danger : active ? colors.accent : colors.muted },
        ]}>
        {glyph}
      </Text>
    </Pressable>
  );
}

export function LinkHistoryRow({ item, onToggleFavorite, onDelete, compact = false }: Props) {
  const { colors, radius } = useTheme();
  const [notice, setNotice] = useState<string | null>(null);

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 1500);
  };

  const onCopy = async () => {
    flash((await copyText(item.url)) ? 'Copied ✓' : 'Copy failed');
  };

  const onOpen = async () => {
    const result = await openDeepLink(item.url);
    flash(result.outcome === 'opened' ? 'Sent to OS ✓' : 'Not opened');
  };

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
      ]}>
      <Link href={{ pathname: '/link-details', params: { id: item.id } }} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Open details for ${item.url}`}
          style={({ pressed }) => [styles.main, { opacity: pressed ? 0.7 : 1 }]}>
          <Text
            style={[styles.url, { color: colors.text }]}
            numberOfLines={compact ? 1 : 2}>
            {truncateUrl(item.url, compact ? 48 : 120)}
          </Text>
          <View style={styles.meta}>
            <LinkTypeBadge linkType={item.linkType} />
            {notice ? (
              <Text style={[styles.notice, { color: colors.accent }]}>{notice}</Text>
            ) : null}
          </View>
        </Pressable>
      </Link>
      <View style={styles.actions}>
        <IconButton
          label={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          glyph={item.isFavorite ? '★' : '☆'}
          active={item.isFavorite}
          onPress={() => onToggleFavorite(item.id)}
        />
        <IconButton label={`Reopen ${item.url}`} glyph="↗" onPress={onOpen} />
        <IconButton label={`Copy ${item.url}`} glyph="⧉" onPress={onCopy} />
        <IconButton label={`Delete ${item.url}`} glyph="🗑" danger onPress={() => onDelete(item.id)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  main: { flex: 1, gap: 8 },
  url: { fontFamily: 'SpaceMono', fontSize: 13.5, lineHeight: 19 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notice: { fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { minWidth: 40, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  iconGlyph: { fontSize: 18, fontWeight: '700' },
});
