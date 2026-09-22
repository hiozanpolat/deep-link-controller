import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/src/theme/theme';
import { copyText } from '@/src/lib/clipboard';
import type { UrlAnalysis } from '@/src/features/deep-link/types';

function Field({ label, value, mono = true }: { label: string; value?: string; mono?: boolean }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ marginTop: spacing.sm }}>
      <Text style={[styles.fieldLabel, { color: colors.muted }]}>{label}</Text>
      <Text
        selectable
        style={[
          styles.fieldValue,
          { color: colors.text },
          mono && { fontFamily: 'SpaceMono', fontSize: 13 },
        ]}>
        {value || '—'}
      </Text>
    </View>
  );
}

export function UrlInspector({ analysis }: { analysis: UrlAnalysis }) {
  const { colors, spacing, radius } = useTheme();
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  if (!analysis.isValid) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          padding: spacing.md,
        }}>
        <Text style={[styles.fieldValue, { color: colors.muted }]}>
          {analysis.validationError ?? 'Nothing to inspect yet. Enter a URL above.'}
        </Text>
      </View>
    );
  }

  const copyParam = async (key: string, value: string) => {
    const ok = await copyText(`${key}=${value}`);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1200);
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.md,
        padding: spacing.md,
      }}
      accessibilityLabel="URL inspector">
      <Field label="Scheme" value={analysis.scheme} />
      <Field label="Host" value={analysis.hostname} />
      {analysis.port ? <Field label="Port" value={analysis.port} /> : null}
      <Field label="Path" value={analysis.pathname} />
      {analysis.fragment ? <Field label="Fragment" value={`#${analysis.fragment}`} /> : null}

      <Text style={[styles.fieldLabel, { color: colors.muted, marginTop: spacing.md }]}>
        Query parameters ({analysis.queryParams.length})
      </Text>
      {analysis.queryParams.length === 0 ? (
        <Text style={[styles.fieldValue, { color: colors.muted }]}>None</Text>
      ) : (
        <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
          {analysis.queryParams.map((p, idx) => (
            <Pressable
              key={`${p.key}-${idx}`}
              onPress={() => copyParam(p.key, p.value)}
              accessibilityRole="button"
              accessibilityLabel={`Copy parameter ${p.key}`}>
              <View
                style={{
                  backgroundColor: colors.surface2,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: radius.sm,
                  padding: spacing.sm,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}>
                <Text
                  style={{ fontFamily: 'SpaceMono', fontSize: 13, color: colors.accent, fontWeight: '700' }}>
                  {p.key}
                </Text>
                <Text
                  style={{ fontFamily: 'SpaceMono', fontSize: 13, color: colors.text, flex: 1 }}
                  numberOfLines={2}>
                  {p.value === '' ? '(empty)' : p.value}
                </Text>
                <Text style={{ fontSize: 11, color: colors.muted, fontWeight: '700' }}>
                  {copiedKey === p.key ? 'Copied ✓' : 'Copy'}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
      {analysis.linkType === 'https' ? (
        <Text style={[styles.footnote, { color: colors.muted }]}>
          HTTPS alone does not prove Universal Links / App Links are configured — that requires
          verified domain association on the target app.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldValue: { fontSize: 14, marginTop: 2, lineHeight: 20 },
  footnote: { fontSize: 12, marginTop: 12, lineHeight: 17 },
});
