import * as Linking from 'expo-linking';
import { create } from 'zustand';
import type { DebugEvent, DebugEventType } from '@/src/features/deep-link/types';
import { makeId } from '@/src/features/deep-link/utils/url';

export type DebuggerStatus = 'loading' | 'listening' | 'error';

interface DebugState {
  status: DebuggerStatus;
  error?: string;
  events: DebugEvent[];
  ensureListening: () => void;
  clear: () => void;
}

let initialized = false;
let subscription: { remove: () => void } | null = null;

function record(type: DebugEventType, url: string): void {
  useDebugStore.setState((s) => ({
    events: [
      { id: makeId(), url, type, receivedAt: new Date().toISOString() },
      ...s.events,
    ].slice(0, 100),
  }));
}

export const useDebugStore = create<DebugState>()((set) => ({
  status: 'loading',
  error: undefined,
  events: [],

  ensureListening: () => {
    if (initialized) return;
    initialized = true;

    Linking.getInitialURL()
      .then((url) => {
        if (url) record('initial', url);
        set((s) => (s.status === 'loading' ? { status: 'listening' } : s));
      })
      .catch((e) => {
        set({
          status: 'error',
          error: e instanceof Error ? e.message : 'Could not read the launch URL.',
        });
      });

    try {
      subscription = Linking.addEventListener('url', (event) => {
        record('runtime', event.url);
        set({ status: 'listening', error: undefined });
      });
      set((s) => (s.status === 'loading' ? { status: 'listening' } : s));
    } catch (e) {
      set({
        status: 'error',
        error: e instanceof Error ? e.message : 'Could not subscribe to incoming links.',
      });
    }
  },

  clear: () => set({ events: [] }),
}));

/** Detaches the global listener (used in tests / HMR). */
export function __resetDebugListenerForTests(): void {
  subscription?.remove();
  subscription = null;
  initialized = false;
  useDebugStore.setState({ status: 'loading', error: undefined, events: [] });
}
