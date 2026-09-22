import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type AccessibilityRole,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/src/theme/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}: Props) {
  const { colors, radius } = useTheme();
  const isDisabled = disabled || loading;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          minHeight: 48,
          borderRadius: radius.md,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderWidth: 1,
        },
        primary: { backgroundColor: colors.accent, borderColor: colors.accent },
        secondary: { backgroundColor: colors.surface2, borderColor: colors.border },
        danger: { backgroundColor: 'transparent', borderColor: colors.danger },
        ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
        disabled: { opacity: 0.5 },
        labelPrimary: { color: colors.onAccent, fontWeight: '600', fontSize: 16 },
        labelSecondary: { color: colors.text, fontWeight: '600', fontSize: 16 },
        labelDanger: { color: colors.danger, fontWeight: '600', fontSize: 16 },
        labelGhost: { color: colors.accent, fontWeight: '600', fontSize: 15 },
      }),
    [colors, radius],
  );

  const role: AccessibilityRole = 'button';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        { opacity: pressed && !isDisabled ? 0.82 : (isDisabled ? 0.5 : 1) },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.onAccent : colors.accent} />
      ) : (
        <Text
          style={
            variant === 'primary'
              ? styles.labelPrimary
              : variant === 'danger'
                ? styles.labelDanger
                : variant === 'ghost'
                  ? styles.labelGhost
                  : styles.labelSecondary
          }>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
