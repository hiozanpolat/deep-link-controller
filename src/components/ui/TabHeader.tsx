import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, Text, UIManager, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/theme';

const CAN_USE_BLUR =
  !!UIManager.getViewManagerConfig?.('ExpoBlurView') ||
  !!(UIManager as any).getViewManagerConfig?.('ViewManagerAdapter_ExpoBlur_ExpoBlurView');

export function TabHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const bg = scheme === 'dark' ? 'rgba(18,21,26,0.78)' : 'rgba(255,255,255,0.78)';
  const blurTint = scheme === 'dark' ? 'dark' : 'light';

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: bg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        overflow: 'hidden',
      }}>
      {CAN_USE_BLUR ? <BlurView intensity={50} tint={blurTint} style={StyleSheet.absoluteFill} /> : null}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, gap: 2 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.3 }}>{title}</Text>
        {subtitle ? <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20 }}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}
