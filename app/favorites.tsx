import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/theme';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { AppInput } from '@/src/components/ui/AppInput';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { LinkHistoryRow } from '@/src/features/deep-link/components/LinkHistoryRow';
import { selectFavorites, useLinksStore } from '@/src/store/useLinksStore';

export default function FavoritesScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const items = useLinksStore((s) => s.items);
  const toggleFavorite = useLinksStore((s) => s.toggleFavorite);
  const remove = useLinksStore((s) => s.remove);

  const [query, setQuery] = useState('');
  const favorites = useMemo(() => selectFavorites(items), [items]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return favorites;
    return favorites.filter((i) => i.url.toLowerCase().includes(q));
  }, [favorites, query]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader title="Favorites" />
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: insets.bottom + 32,
          gap: spacing.sm,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.sm }}>
            <AppInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search favorites…"
              onClear={() => setQuery('')}
              accessibilityLabel="Search favorites"
            />
          </View>
        }
        renderItem={({ item }) => (
          <LinkHistoryRow item={item} onToggleFavorite={toggleFavorite} onDelete={remove} />
        )}
        ListEmptyComponent={
          <EmptyState
            title={favorites.length === 0 ? 'No favorites yet' : 'No matches'}
            message={
              favorites.length === 0
                ? 'Star a link from the Launcher or History to pin it here for one-tap reuse.'
                : 'Try a different search.'
            }
            actionTitle={favorites.length === 0 ? 'Go to Launcher' : undefined}
            onAction={favorites.length === 0 ? () => router.replace('/(tabs)') : undefined}
          />
        }
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}
