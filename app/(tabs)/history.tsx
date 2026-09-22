import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/theme';
import { TabHeader } from '@/src/components/ui/TabHeader';
import { AppInput } from '@/src/components/ui/AppInput';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { LinkHistoryRow } from '@/src/features/deep-link/components/LinkHistoryRow';
import { useLinksStore } from '@/src/store/useLinksStore';
import type { LinkType, TestPlatform } from '@/src/features/deep-link/types';

type TypeFilter = 'all' | LinkType;
type PlatformFilter = 'all' | TestPlatform;

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'custom-scheme', label: 'Custom' },
  { value: 'https', label: 'HTTPS' },
  { value: 'invalid', label: 'Invalid' },
  { value: 'unknown', label: 'Unknown' },
];

const PLATFORM_FILTERS: { value: PlatformFilter; label: string }[] = [
  { value: 'all', label: 'Both OS' },
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'iOS' },
];

function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  const { colors, radius } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label}>
      <View style={styles.chips}>
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${opt.label} filter`}
              style={{
                backgroundColor: selected ? colors.accentSoft : colors.surface,
                borderColor: selected ? colors.accent : colors.border,
                borderWidth: 1,
                borderRadius: radius.sm,
                paddingHorizontal: 12,
                minHeight: 40,
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: selected ? colors.accent : colors.muted,
                  fontSize: 13,
                  fontWeight: selected ? '700' : '500',
                }}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const items = useLinksStore((s) => s.items);
  const toggleFavorite = useLinksStore((s) => s.toggleFavorite);
  const remove = useLinksStore((s) => s.remove);
  const clearHistory = useLinksStore((s) => s.clearHistory);

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (typeFilter !== 'all' && i.linkType !== typeFilter) return false;
      if (platformFilter !== 'all' && i.platform !== platformFilter) return false;
      if (q && !i.url.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, query, typeFilter, platformFilter]);

  const onClear = () => {
    Alert.alert(
      'Clear history?',
      'This removes all non-favorite entries. Favorites are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearHistory },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TabHeader
        title="History"
        subtitle={
          items.length === 0 ? 'Nothing tested yet.' : `${filtered.length} of ${items.length} links · newest first`
        }
      />
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: insets.bottom + 32,
          gap: spacing.sm,
        }}
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.sm }}>
            <AppInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search URLs…"
              onClear={() => setQuery('')}
              accessibilityLabel="Search history"
            />
            <View>
              <SectionHeader title="Link type" />
              <FilterChips
                label="Filter by link type"
                options={TYPE_FILTERS}
                value={typeFilter}
                onChange={setTypeFilter}
              />
            </View>
            <View>
              <SectionHeader title="Platform" />
              <FilterChips
                label="Filter by platform"
                options={PLATFORM_FILTERS}
                value={platformFilter}
                onChange={setPlatformFilter}
              />
            </View>
            {items.length > 0 ? (
              <Pressable
                onPress={onClear}
                accessibilityRole="button"
                accessibilityLabel="Clear history"
                style={styles.clearBtn}>
                <Text style={[styles.clearText, { color: colors.danger }]}>
                  Clear history (keeps favorites)
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <LinkHistoryRow item={item} onToggleFavorite={toggleFavorite} onDelete={remove} />
        )}
        ListEmptyComponent={
          <EmptyState
            title={items.length === 0 ? 'No history yet' : 'No matches'}
            message={
              items.length === 0
                ? 'Open a link from the Launcher and it will show up here.'
                : 'Try a different search or filter.'
            }
          />
        }
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  clearBtn: { minHeight: 44, justifyContent: 'center' },
  clearText: { fontSize: 14, fontWeight: '600' },
});
