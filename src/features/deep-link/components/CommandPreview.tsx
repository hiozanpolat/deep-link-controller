import React, { useMemo } from 'react';
import { Platform, Text, View } from 'react-native';
import { useTheme } from '@/src/theme/theme';
import { CodeBlock } from '@/src/components/ui/CodeBlock';
import type { TestPlatform } from '@/src/features/deep-link/types';
import { buildAdbCommand, buildSimctlCommand } from '@/src/features/deep-link/utils/url';

/** This device's OS — the only platform a command shown here can target. */
const DEVICE_PLATFORM: TestPlatform = Platform.OS === 'ios' ? 'ios' : 'android';

/**
 * Copyable external test command for this device's platform.
 * Deliberately no cross-platform toggle: showing e.g. an ADB command on an
 * iPhone implies Android can be tested from iOS, which is false.
 */
export function CommandPreview({ url }: { url: string }) {
  const { colors } = useTheme();
  const platform = DEVICE_PLATFORM;
  const command = useMemo(
    () => (platform === 'android' ? buildAdbCommand(url) : buildSimctlCommand(url)),
    [url, platform],
  );

  const note =
    platform === 'android'
      ? 'Run from a terminal with ADB connected to a device or emulator. This command is not executed by this app.'
      : 'Run from a terminal on your Mac with a booted Simulator. Physical-device testing needs a development build and Xcode devices tooling.';

  return (
    <View>
      <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '700', marginBottom: 8 }}>
        {platform === 'android' ? 'Android · ADB command' : 'iOS · Simulator command'}
      </Text>
      <CodeBlock code={command} accessibilityLabel={`Test command: ${command}`} />
      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8, lineHeight: 17 }}>{note}</Text>
    </View>
  );
}
