import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/src/theme/theme';
import { copyText } from '@/src/lib/clipboard';

export function CodeBlock({ code, accessibilityLabel }: { code: string; accessibilityLabel?: string }) {
  const { colors, radius, spacing } = useTheme();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const ok = await copyText(code);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface2,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.md,
        padding: spacing.md,
      }}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text">
      <Text selectable style={{ color: colors.text, fontFamily: 'SpaceMono', fontSize: 12.5, lineHeight: 18 }}>
        {code}
      </Text>
      <View style={styles.footer}>
        <Pressable
          onPress={onCopy}
          accessibilityRole="button"
          accessibilityLabel={copied ? 'Copied' : 'Copy command'}
          style={({ pressed }) => [styles.copy, { opacity: pressed ? 0.6 : 1 }]}>
          <Text style={[styles.copyText, { color: colors.accent }]}>
            {copied ? 'Copied ✓' : 'Copy'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  copy: { minHeight: 44, minWidth: 44, justifyContent: 'center', paddingHorizontal: 8 },
  copyText: { fontSize: 14, fontWeight: '700' },
});
