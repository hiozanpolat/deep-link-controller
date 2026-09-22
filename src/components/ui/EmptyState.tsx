import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/src/theme/theme';
import { AppButton } from '@/src/components/ui/AppButton';

export function EmptyState({
  title,
  message,
  actionTitle,
  onAction,
}: {
  title: string;
  message: string;
  actionTitle?: string;
  onAction?: () => void;
}) {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={[styles.wrap, { padding: spacing.xl }]}
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${message}`}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
      {actionTitle && onAction ? (
        <View style={styles.action}>
          <AppButton title={actionTitle} variant="secondary" onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  message: { fontSize: 14, marginTop: 6, textAlign: 'center', lineHeight: 20 },
  action: { marginTop: 12 },
});
