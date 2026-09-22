import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import {
  linkHistoryListSchema,
  type LinkHistoryItem,
  type LinkType,
  type TestPlatform,
} from '@/src/features/deep-link/types';
import { makeId } from '@/src/features/deep-link/utils/url';

const STORAGE_KEY = 'dlt.links.v1';
const MAX_HISTORY_ITEMS = 200;

interface LinksState {
  items: LinkHistoryItem[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addOrTouch: (url: string, linkType: LinkType, platform: TestPlatform) => LinkHistoryItem;
  toggleFavorite: (id: string) => void;
  updateUrl: (id: string, url: string, linkType: LinkType) => void;
  touchOpened: (id: string) => void;
  remove: (id: string) => void;
  clearHistory: () => void;
  clearFavorites: () => void;
}

async function persist(items: LinkHistoryItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage failures are non-fatal; the in-memory state still works.
  }
}

function normalizeUrl(url: string): string {
  return url.trim();
}

export const useLinksStore = create<LinksState>()((set, get) => ({
  items: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        const result = linkHistoryListSchema.safeParse(parsed);
        if (result.success) {
          set({ items: result.data, hydrated: true });
          return;
        }
        // Corrupted data: fall through and start fresh.
      }
    } catch {
      // Start fresh on any read/parse failure.
    }
    set({ items: [], hydrated: true });
  },

  addOrTouch: (url, linkType, platform) => {
    const cleaned = normalizeUrl(url);
    const now = new Date().toISOString();
    const existing = get().items.find((i) => i.url === cleaned);
    if (existing) {
      const updated: LinkHistoryItem = {
        ...existing,
        linkType,
        platform,
        lastOpenedAt: now,
      };
      const items = [updated, ...get().items.filter((i) => i.id !== existing.id)];
      set({ items });
      void persist(items);
      return updated;
    }
    const created: LinkHistoryItem = {
      id: makeId(),
      url: cleaned,
      linkType,
      platform,
      isFavorite: false,
      createdAt: now,
      lastOpenedAt: now,
    };
    const items = [created, ...get().items].slice(0, MAX_HISTORY_ITEMS);
    set({ items });
    void persist(items);
    return created;
  },

  toggleFavorite: (id) => {
    const items = get().items.map((i) =>
      i.id === id ? { ...i, isFavorite: !i.isFavorite } : i,
    );
    set({ items });
    void persist(items);
  },

  updateUrl: (id, url, linkType) => {
    const items = get().items.map((i) =>
      i.id === id ? { ...i, url: normalizeUrl(url), linkType } : i,
    );
    set({ items });
    void persist(items);
  },

  touchOpened: (id) => {
    const now = new Date().toISOString();
    const items = get().items.map((i) => (i.id === id ? { ...i, lastOpenedAt: now } : i));
    set({ items });
    void persist(items);
  },

  remove: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    set({ items });
    void persist(items);
  },

  clearHistory: () => {
    // Keep favorites: they live in the same list but are user-curated.
    const items = get().items.filter((i) => i.isFavorite);
    set({ items });
    void persist(items);
  },

  clearFavorites: () => {
    // Unfavorite everything instead of deleting, so history is preserved.
    const items = get().items.map((i) => ({ ...i, isFavorite: false }));
    set({ items });
    void persist(items);
  },
}));

/** Newest-first selector helpers (kept outside components for reuse). */
export function selectRecentLinks(items: LinkHistoryItem[], limit = 5): LinkHistoryItem[] {
  return items.slice(0, limit);
}

export function selectFavorites(items: LinkHistoryItem[]): LinkHistoryItem[] {
  return items.filter((i) => i.isFavorite);
}
