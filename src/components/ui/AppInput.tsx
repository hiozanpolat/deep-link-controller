import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/src/theme/theme';

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  onClear?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  editable?: boolean;
}

export function AppInput({
  value,
  onChangeText,
  placeholder,
  error,
  label,
  onClear,
  accessibilityLabel,
  style,
  editable = true,
}: Props) {
  const { colors, radius, spacing } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        label: { color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 6 },
        box: {
          backgroundColor: colors.surface,
          borderColor: error ? colors.danger : colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          minHeight: 52,
          flexDirection: 'row',
          alignItems: 'center',
        },
        input: {
          flex: 1,
          color: colors.text,
          fontSize: 15,
          fontFamily: 'SpaceMono',
          paddingVertical: 12,
        },
        clear: {
          minWidth: 44,
          minHeight: 44,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 8,
        },
        clearText: { color: colors.muted, fontSize: 16, fontWeight: '600' },
        error: { color: colors.danger, fontSize: 13, marginTop: 6 },
      }),
    [colors, radius, spacing, error],
  );

  return (
    <View style={style}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.box}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          keyboardType="url"
          returnKeyType="go"
          multiline={false}
          editable={editable}
          accessibilityLabel={accessibilityLabel ?? label ?? 'URL input'}
          accessibilityState={{ disabled: !editable }}
          selectionColor={colors.accent}
        />
        {value.length > 0 && onClear ? (
          <Pressable
            onPress={onClear}
            accessibilityRole="button"
            accessibilityLabel="Clear URL input"
            style={styles.clear}>
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
