import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/theme';

export function AppCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.lg,
          padding: spacing.lg,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export const cardStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
