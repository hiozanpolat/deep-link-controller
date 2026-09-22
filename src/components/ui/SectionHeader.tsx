import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/src/theme/theme';

export function SectionHeader({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  const { colors, spacing } = useTheme();
  return (
    <View style={[styles.wrap, { marginBottom: spacing.sm }]}>
      <View style={styles.texts}>
        <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
          {title}
        </Text>
        {hint ? <Text style={[styles.hint, { color: colors.muted }]}>{hint}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  texts: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700' },
  hint: { fontSize: 13, marginTop: 2, lineHeight: 18 },
});
