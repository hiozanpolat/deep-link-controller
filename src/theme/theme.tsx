import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme as useSystemScheme } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedScheme = 'light' | 'dark';

export interface ThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  onAccent: string;
  accentSoft: string;
  success: string;
  warning: string;
  danger: string;
}

export interface Theme {
  scheme: ResolvedScheme;
  colors: ThemeColors;
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number };
  radius: { sm: number; md: number; lg: number };
  monoFont: string;
}

const LIGHT_COLORS: ThemeColors = {
  bg: '#F2F4F7',
  surface: '#FFFFFF',
  surface2: '#E9EDF2',
  border: '#D9DFE7',
  text: '#14181D',
  muted: '#5B6572',
  accent: '#2456E6',
  onAccent: '#FFFFFF',
  accentSoft: '#E3EBFF',
  success: '#1E7F4F',
  warning: '#9A6200',
  danger: '#C03530',
};

const DARK_COLORS: ThemeColors = {
  bg: '#0B0D10',
  surface: '#12151A',
  surface2: '#1A1F27',
  border: '#232B36',
  text: '#E8ECF1',
  muted: '#9AA4B2',
  accent: '#6E9BFF',
  onAccent: '#0B0D10',
  accentSoft: '#1B2740',
  success: '#3FB97F',
  warning: '#E5A63B',
  danger: '#E5605C',
};

const STORAGE_KEY = 'dlt.theme-preference.v1';

interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function buildTheme(scheme: ResolvedScheme): Theme {
  return {
    scheme,
    colors: scheme === 'dark' ? DARK_COLORS : LIGHT_COLORS,
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
    radius: { sm: 8, md: 12, lg: 16 },
    monoFont: 'SpaceMono',
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw === 'light' || raw === 'dark' || raw === 'system') {
          setPreferenceState(raw);
        }
      })
      .catch(() => {
        // Keep default; a theme preference is non-critical.
      });
  }, []);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    AsyncStorage.setItem(STORAGE_KEY, p).catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const scheme: ResolvedScheme =
      preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
    return { theme: buildTheme(scheme), preference, setPreference };
  }, [preference, systemScheme, setPreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx.theme;
}

export function useThemePreference(): Omit<ThemeContextValue, 'theme'> & {
  scheme: ResolvedScheme;
} {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemePreference must be used inside ThemeProvider');
  return { preference: ctx.preference, setPreference: ctx.setPreference, scheme: ctx.theme.scheme };
}
