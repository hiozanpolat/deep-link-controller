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
 *
 * iOS note: `canOpenURL` requires every custom scheme to be pre-declared in
 * `LSApplicationQueriesSchemes` (static, max ~50, build-time only), so it can
 * never cover user-typed schemes like `vfss://` or `myapp://`. We therefore
 * do NOT gate on it — whatever scheme the user types, we hand it straight to
 * the OS via `openURL` and report the real result.
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

  // Best-effort hint only: on iOS this throws/returns false for any custom
  // scheme not listed in LSApplicationQueriesSchemes, so its result is ignored
  // for the open decision. It is only used to enrich the error message.
  let canAskResult: boolean | null = null;
  try {
    canAskResult = await Linking.canOpenURL(url);
  } catch {
    canAskResult = null;
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
      outcome: 'unavailable',
      message:
        'No app on this device claims this link. Install the target app or check its native link configuration.',
      detail:
        canAskResult === false || canAskResult === null
          ? 'iOS cannot pre-check custom schemes (LSApplicationQueriesSchemes is static), so the link was handed to the OS directly and the OS declined it.'
          : e instanceof Error
            ? e.message
            : undefined,
    };
  }
}
