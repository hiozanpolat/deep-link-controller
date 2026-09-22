import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/theme';

const CAN_USE_BLUR =
  !!UIManager.getViewManagerConfig?.('ExpoBlurView') ||
  !!(UIManager as any).getViewManagerConfig?.('ViewManagerAdapter_ExpoBlur_ExpoBlurView');

/**
 * Minimal header for pushed screens only — tabs render their own
 * in-content title (single-title rule).
 */
export function AppHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const { colors, spacing, scheme } = useTheme();
  const insets = useSafeAreaInsets();

  const goBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const blurTint = scheme === 'dark' ? 'dark' : 'light';
  const bg = scheme === 'dark' ? 'rgba(18,21,26,0.78)' : 'rgba(255,255,255,0.78)';

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top,
          backgroundColor: bg,
          borderBottomColor: colors.border,
          overflow: 'hidden',
        },
      ]}
      accessibilityRole="header">
      {CAN_USE_BLUR ? (
        <BlurView intensity={50} tint={blurTint} style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={[styles.row, { minHeight: 56, paddingHorizontal: spacing.sm }]}>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.back, { opacity: pressed ? 0.55 : 1 }]}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.right}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  right: { width: 44, alignItems: 'flex-end', justifyContent: 'center' },
});
