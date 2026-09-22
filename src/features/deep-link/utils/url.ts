import { z } from 'zod';
import {
  LONG_URL_THRESHOLD,
  MAX_URL_LENGTH,
  type LinkType,
  type QueryParam,
  type UrlAnalysis,
} from '@/src/features/deep-link/types';

const SCHEME_RE = /^([a-zA-Z][a-zA-Z0-9+.-]*):/;

/**
 * Safely decodes a percent-encoded component. Returns the raw input when
 * decoding fails instead of throwing.
 */
export function safeDecode(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

/**
 * Parses the query string of a URL into an ordered list of key/value pairs.
 * - Duplicate keys are preserved in order.
 * - `?flag` becomes { key: 'flag', value: '' }.
 * - Segments with an empty key are skipped.
 */
export function parseQueryParams(query: string): QueryParam[] {
  const params: QueryParam[] = [];
  const stripped = query.startsWith('?') ? query.slice(1) : query;
  if (!stripped) return params;

  for (const segment of stripped.split('&')) {
    if (!segment) continue;
    const eq = segment.indexOf('=');
    const rawKey = eq === -1 ? segment : segment.slice(0, eq);
    const rawValue = eq === -1 ? '' : segment.slice(eq + 1);
    // '+' represents a space in query strings.
    const key = safeDecode(rawKey.replace(/\+/g, ' '));
    if (!key) continue;
    params.push({ key, value: safeDecode(rawValue.replace(/\+/g, ' ')) });
  }
  return params;
}

interface SplitRemainder {
  authority: string;
  path: string;
  query: string;
  fragment: string;
}

/** Splits `//authority/path?query#fragment` (authority part optional). */
function splitRemainder(input: string): SplitRemainder {
  let rest = input;
  let fragment = '';
  const hashIdx = rest.indexOf('#');
  if (hashIdx !== -1) {
    fragment = rest.slice(hashIdx + 1);
    rest = rest.slice(0, hashIdx);
  }
  let query = '';
  const qIdx = rest.indexOf('?');
  if (qIdx !== -1) {
    query = rest.slice(qIdx + 1);
    rest = rest.slice(0, qIdx);
  }
  let authority = '';
  let path = rest;
  if (rest.startsWith('//')) {
    const withoutSlashes = rest.slice(2);
    const slashIdx = withoutSlashes.indexOf('/');
    if (slashIdx === -1) {
      authority = withoutSlashes;
      path = '';
    } else {
      authority = withoutSlashes.slice(0, slashIdx);
      path = withoutSlashes.slice(slashIdx);
    }
  }
  return { authority, path, query, fragment };
}

function splitAuthority(authority: string): { hostname: string; port?: string } {
  // Strip userinfo if present; it is unusual in deep links.
  const atIdx = authority.lastIndexOf('@');
  const hostPort = atIdx === -1 ? authority : authority.slice(atIdx + 1);
  if (hostPort.startsWith('[')) {
    const close = hostPort.indexOf(']');
    if (close !== -1) {
      const hostname = hostPort.slice(0, close + 1);
      const remainder = hostPort.slice(close + 1);
      return {
        hostname,
        port: remainder.startsWith(':') && remainder.length > 1 ? remainder.slice(1) : undefined,
      };
    }
    return { hostname: hostPort };
  }
  const colonIdx = hostPort.lastIndexOf(':');
  if (colonIdx !== -1 && hostPort.indexOf(':') === colonIdx) {
    const port = hostPort.slice(colonIdx + 1);
    return { hostname: hostPort.slice(0, colonIdx), port: port || undefined };
  }
  return { hostname: hostPort };
}

const HOST_CHARS_RE = /^[a-zA-Z0-9._~%!$&'()*+,;=\-[\]|:]+$/;

/**
 * Analyzes a raw user-provided string as a potential deep link.
 * Never throws; always returns a structured result.
 */
export function analyzeUrl(rawInput: string): UrlAnalysis {
  const input = rawInput.trim();

  if (!input) {
    return {
      isValid: false,
      linkType: 'invalid',
      queryParams: [],
      validationError: 'Enter a URL to test.',
      isTooLong: false,
    };
  }

  const isTooLong = input.length > LONG_URL_THRESHOLD;
  if (input.length > MAX_URL_LENGTH) {
    return {
      isValid: false,
      linkType: 'invalid',
      queryParams: [],
      validationError: `URL is too long (${input.length} characters, max ${MAX_URL_LENGTH}).`,
      isTooLong: true,
    };
  }

  if (/\s/.test(input)) {
    return {
      isValid: false,
      linkType: 'invalid',
      queryParams: [],
      validationError: 'URL must not contain spaces.',
      isTooLong,
    };
  }

  const schemeMatch = SCHEME_RE.exec(input);
  if (!schemeMatch) {
    return {
      isValid: false,
      linkType: 'invalid',
      queryParams: [],
      validationError: 'URL must start with a scheme, e.g. myapp:// or https://.',
      isTooLong,
    };
  }

  const scheme = schemeMatch[1].toLowerCase();
  const remainder = input.slice(schemeMatch[0].length);
  if (!remainder) {
    return {
      isValid: false,
      linkType: 'unknown',
      scheme,
      queryParams: [],
      validationError: 'URL has a scheme but nothing after it.',
      isTooLong,
    };
  }

  if (scheme === 'http' || scheme === 'https') {
    return analyzeHttpUrl(input, scheme, remainder, isTooLong);
  }
  return analyzeCustomSchemeUrl(input, scheme, remainder, isTooLong);
}

function analyzeHttpUrl(
  input: string,
  scheme: string,
  remainder: string,
  isTooLong: boolean,
): UrlAnalysis {
  if (!remainder.startsWith('//')) {
    return {
      isValid: false,
      linkType: 'invalid',
      scheme,
      queryParams: [],
      validationError: 'HTTPS URLs need "//" after the scheme, e.g. https://example.com.',
      isTooLong,
    };
  }
  const { authority, path, query, fragment } = splitRemainder(remainder);
  const { hostname, port } = splitAuthority(authority);
  if (!hostname || !HOST_CHARS_RE.test(hostname)) {
    return {
      isValid: false,
      linkType: 'invalid',
      scheme,
      queryParams: [],
      validationError: 'HTTPS URL is missing a valid hostname.',
      isTooLong,
    };
  }
  return {
    isValid: true,
    linkType: 'https',
    scheme,
    hostname,
    port,
    pathname: path || '/',
    fragment: fragment || undefined,
    queryParams: parseQueryParams(query),
    isTooLong,
  };
}

function analyzeCustomSchemeUrl(
  input: string,
  scheme: string,
  remainder: string,
  isTooLong: boolean,
): UrlAnalysis {
  void input;
  // Custom schemes commonly look like: myapp://host/path?query#frag,
  // myapp:/path, or myapp:path. Accept all three shapes.
  const { authority, path, query, fragment } = splitRemainder(remainder);

  if (!authority && !path) {
    return {
      isValid: false,
      linkType: 'unknown',
      scheme,
      queryParams: [],
      validationError: 'URL has a scheme but no host or path.',
      isTooLong,
    };
  }

  if (authority && !HOST_CHARS_RE.test(authority)) {
    return {
      isValid: false,
      linkType: 'invalid',
      scheme,
      queryParams: [],
      validationError: 'The host part contains unsupported characters.',
      isTooLong,
    };
  }

  const { hostname, port } = authority ? splitAuthority(authority) : { hostname: '', port: undefined };
  return {
    isValid: true,
    linkType: 'custom-scheme',
    scheme,
    hostname: hostname || undefined,
    port,
    pathname: path || undefined,
    fragment: fragment || undefined,
    queryParams: parseQueryParams(query),
    isTooLong,
  };
}

const urlInputSchema = z
  .string()
  .trim()
  .min(1, 'Enter a URL to test.')
  .max(MAX_URL_LENGTH, `URL must be shorter than ${MAX_URL_LENGTH} characters.`);

export interface UrlValidation {
  ok: boolean;
  analysis: UrlAnalysis;
}

/** Zod-backed validation entry point used by the Launcher input. */
export function validateUrlInput(rawInput: string): UrlValidation {
  const shape = urlInputSchema.safeParse(rawInput);
  if (!shape.success) {
    return {
      ok: false,
      analysis: {
        isValid: false,
        linkType: 'invalid',
        queryParams: [],
        validationError: shape.error.issues[0]?.message ?? 'Invalid URL.',
        isTooLong: (rawInput?.length ?? 0) > LONG_URL_THRESHOLD,
      },
    };
  }
  const analysis = analyzeUrl(shape.data);
  return { ok: analysis.isValid, analysis };
}

/** Human-readable label for a link type. Never claims HTTPS verification. */
export function linkTypeLabel(linkType: LinkType): string {
  switch (linkType) {
    case 'custom-scheme':
      return 'Custom scheme';
    case 'https':
      return 'HTTPS link';
    case 'invalid':
      return 'Invalid URL';
    case 'unknown':
      return 'Unknown';
  }
}

/** Truncates a URL for compact list display, keeping the start intact. */
export function truncateUrl(url: string, maxLength = 64): string {
  if (url.length <= maxLength) return url;
  return `${url.slice(0, maxLength - 1)}…`;
}

/** Escapes a value for safe inclusion inside double quotes in a shell command. */
export function shellQuote(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/`/g, '\\`')}"`;
}

/** Generates a copyable ADB command that opens the URL on an Android device. */
export function buildAdbCommand(url: string): string {
  return `adb shell am start -a android.intent.action.VIEW -d ${shellQuote(url.trim())}`;
}

/** Generates a copyable simctl command that opens the URL on the booted iOS Simulator. */
export function buildSimctlCommand(url: string): string {
  return `xcrun simctl openurl booted ${shellQuote(url.trim())}`;
}

export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
