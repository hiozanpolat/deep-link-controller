import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/src/theme/theme';

export type FeedbackTone = 'success' | 'warning' | 'error' | 'info';

/**
 * Inline, non-blocking feedback banner. Prefer this over alerts for
 * routine success/error states from link operations.
 */
export function FeedbackBanner({
  tone,
  message,
  detail,
}: {
  tone: FeedbackTone;
  message: string;
  detail?: string;
}) {
  const { colors, radius, spacing } = useTheme();
  const fg =
    tone === 'success'
      ? colors.success
      : tone === 'warning'
        ? colors.warning
        : tone === 'error'
          ? colors.danger
          : colors.accent;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: fg,
        borderWidth: 1,
        borderRadius: radius.md,
        padding: spacing.md,
      }}
      accessibilityRole={tone === 'error' ? 'alert' : 'text'}
      accessibilityLabel={message}>
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      {detail ? <Text style={[styles.detail, { color: colors.muted }]}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  message: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  detail: { fontSize: 13, marginTop: 4, lineHeight: 18 },
});
