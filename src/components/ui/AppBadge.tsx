import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/src/theme/theme';

type Tone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral';

export function AppBadge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const { colors, radius } = useTheme();

  const styles = useMemo(() => {
    const fg =
      tone === 'accent'
        ? colors.accent
        : tone === 'success'
          ? colors.success
          : tone === 'warning'
            ? colors.warning
            : tone === 'danger'
              ? colors.danger
              : colors.muted;
    return StyleSheet.create({
      badge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.surface2,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.sm,
        paddingHorizontal: 8,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      },
      dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: fg },
      text: { color: fg, fontSize: 12, fontWeight: '700' },
    });
  }, [colors, radius, tone]);

  return (
    <View style={styles.badge} accessibilityRole="text" accessibilityLabel={label}>
      <View style={styles.dot} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}
