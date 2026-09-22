import * as Linking from 'expo-linking';
import { analyzeUrl } from '@/src/features/deep-link/utils/url';

export type OpenOutcome = 'opened' | 'unavailable' | 'invalid' | 'error';

export interface OpenResult {
  outcome: OpenOutcome;
  /** Short user-facing message. Honest: "opened" only means the OS accepted the request. */
  message: string;
  detail?: string;
}

/**
 * Attempts to open a deep link through the OS.
 * Never claims success beyond handing the URL to the operating system —
 * the target app may still fail to handle it.
 */
export async function openDeepLink(rawUrl: string): Promise<OpenResult> {
  const url = rawUrl.trim();
  const analysis = analyzeUrl(url);

  if (!analysis.isValid) {
    return {
      outcome: 'invalid',
      message: analysis.validationError ?? 'That URL is not valid.',
    };
  }

  let supported = false;
  try {
    supported = await Linking.canOpenURL(url);
  } catch (e) {
    return {
      outcome: 'error',
      message: 'Could not ask the OS whether this link can open.',
      detail: e instanceof Error ? e.message : undefined,
    };
  }

  if (!supported) {
    return {
      outcome: 'unavailable',
      message:
        'No app on this device claims this link. Install the target app or check its native link configuration.',
      detail:
        'On iOS, canOpenURL returns false for custom schemes unless they are listed in LSApplicationQueriesSchemes. HTTPS links may open in the browser instead of the app when Universal Links / App Links are not verified.',
    };
  }

  try {
    await Linking.openURL(url);
    return {
      outcome: 'opened',
      message:
        'Handed to the operating system. If the target app is installed and configured, it should now open.',
    };
  } catch (e) {
    return {
      outcome: 'error',
      message: 'The OS did not open the link. It may have been dismissed or blocked.',
      detail: e instanceof Error ? e.message : undefined,
    };
  }
}
