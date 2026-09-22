import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ThemeProvider, useTheme } from '@/src/theme/theme';
import { queryClient } from '@/src/lib/queryClient';
import { useLinksStore } from '@/src/store/useLinksStore';
import { useDebugStore } from '@/src/features/deep-link/hooks/useIncomingDeepLinks';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function AppShell() {
  const { colors, scheme } = useTheme();
  const [ready, setReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontError) {
      // A missing mono font must not block the app; fall back to system monospace.
    }
  }, [fontError]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await useLinksStore.getState().hydrate();
        useDebugStore.getState().ensureListening();
      } finally {
        if (mounted) {
          setReady(true);
          void SplashScreen.hideAsync();
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready || (!fontsLoaded && !fontError)) return null;

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.text, fontWeight: '700' },
          headerTintColor: colors.accent,
          contentStyle: { backgroundColor: colors.bg },
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="favorites" options={{ headerShown: false }} />
        <Stack.Screen name="link-details" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
