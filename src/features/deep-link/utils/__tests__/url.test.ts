import { describe, expect, it } from '@jest/globals';
import {
  analyzeUrl,
  buildAdbCommand,
  buildSimctlCommand,
  parseQueryParams,
  shellQuote,
  truncateUrl,
  validateUrlInput,
} from '@/src/features/deep-link/utils/url';

describe('analyzeUrl', () => {
  it.each([
    'myapp://home',
    'myapp://profile/123',
    'myapp://product/42?source=push',
    'deeplinkcontroller://debug/hello?from=adb',
  ])('accepts custom scheme %s', (url) => {
    const a = analyzeUrl(url);
    expect(a.isValid).toBe(true);
    expect(a.linkType).toBe('custom-scheme');
  });

  it('parses custom scheme components', () => {
    const a = analyzeUrl('myapp://product/42?source=push&empty=&flag');
    expect(a.scheme).toBe('myapp');
    expect(a.hostname).toBe('product');
    expect(a.pathname).toBe('/42');
    expect(a.queryParams).toEqual([
      { key: 'source', value: 'push' },
      { key: 'empty', value: '' },
      { key: 'flag', value: '' },
    ]);
  });

  it('accepts opaque custom scheme paths like myapp:/path', () => {
    const a = analyzeUrl('myapp:/settings/notifications');
    expect(a.isValid).toBe(true);
    expect(a.linkType).toBe('custom-scheme');
    expect(a.pathname).toBe('/settings/notifications');
  });

  it.each([
    'https://app.example.com/product/42',
    'https://app.example.com/reset-password?token=abc',
    'http://localhost:8080/a?b=c#frag',
  ])('accepts https/http link %s without claiming verification', (url) => {
    const a = analyzeUrl(url);
    expect(a.isValid).toBe(true);
    expect(a.linkType).toBe('https');
  });

  it('parses https components including port and fragment', () => {
    const a = analyzeUrl('https://app.example.com:8443/p?q=1#top');
    expect(a.scheme).toBe('https');
    expect(a.hostname).toBe('app.example.com');
    expect(a.port).toBe('8443');
    expect(a.pathname).toBe('/p');
    expect(a.fragment).toBe('top');
    expect(a.queryParams).toEqual([{ key: 'q', value: '1' }]);
  });

  it('rejects empty input with an actionable message', () => {
    const a = analyzeUrl('   ');
    expect(a.isValid).toBe(false);
    expect(a.linkType).toBe('invalid');
    expect(a.validationError).toMatch(/enter a url/i);
  });

  it('rejects scheme-less input', () => {
    const a = analyzeUrl('just some words');
    expect(a.isValid).toBe(false);
    expect(a.linkType).toBe('invalid');
  });

  it('rejects URLs with spaces', () => {
    expect(analyzeUrl('myapp://a b').isValid).toBe(false);
  });

  it('rejects https without host', () => {
    const a = analyzeUrl('https://');
    expect(a.isValid).toBe(false);
    expect(a.validationError).toMatch(/hostname/i);
  });

  it('classifies bare scheme as unknown, not invalid', () => {
    const a = analyzeUrl('myapp:');
    expect(a.isValid).toBe(false);
    expect(a.linkType).toBe('unknown');
  });

  it('rejects overly long URLs', () => {
    const a = analyzeUrl(`myapp://x?y=${'z'.repeat(5000)}`);
    expect(a.isValid).toBe(false);
    expect(a.validationError).toMatch(/too long/i);
  });

  it('flags but accepts very long URLs under the hard cap', () => {
    const a = analyzeUrl(`myapp://x?y=${'z'.repeat(2100)}`);
    expect(a.isValid).toBe(true);
    expect(a.isTooLong).toBe(true);
  });

  it('lowercases schemes', () => {
    expect(analyzeUrl('MYAPP://home').scheme).toBe('myapp');
  });
});

describe('parseQueryParams', () => {
  it('preserves duplicate keys in order', () => {
    expect(parseQueryParams('?a=1&a=2')).toEqual([
      { key: 'a', value: '1' },
      { key: 'a', value: '2' },
    ]);
  });

  it('handles missing values and skips empty segments', () => {
    expect(parseQueryParams('?flag&&other=')).toEqual([
      { key: 'flag', value: '' },
      { key: 'other', value: '' },
    ]);
  });

  it('decodes percent-encoding and plus signs', () => {
    expect(parseQueryParams('?q=hello%20world&a=b%2Bc')).toEqual([
      { key: 'q', value: 'hello world' },
      { key: 'a', value: 'b+c' },
    ]);
  });

  it('survives malformed percent-encoding without throwing', () => {
    expect(parseQueryParams('?q=%E0%A4%A')).toEqual([{ key: 'q', value: '%E0%A4%A' }]);
  });

  it('returns empty list for empty query', () => {
    expect(parseQueryParams('')).toEqual([]);
    expect(parseQueryParams('?')).toEqual([]);
  });
});

describe('validateUrlInput', () => {
  it('wraps zod failures with messages', () => {
    const v = validateUrlInput('');
    expect(v.ok).toBe(false);
    expect(v.analysis.validationError).toBeTruthy();
  });

  it('passes valid custom schemes', () => {
    const v = validateUrlInput('myapp://home');
    expect(v.ok).toBe(true);
  });
});

describe('command generation', () => {
  it('builds an adb command', () => {
    expect(buildAdbCommand('myapp://product/42')).toBe(
      'adb shell am start -a android.intent.action.VIEW -d "myapp://product/42"',
    );
  });

  it('builds a simctl command', () => {
    expect(buildSimctlCommand('myapp://product/42')).toBe(
      'xcrun simctl openurl booted "myapp://product/42"',
    );
  });

  it('escapes quotes, dollars and backticks for shell safety', () => {
    expect(shellQuote('a"b$c`d')).toBe('"a\\"b\\$c\\`d"');
    expect(buildAdbCommand('myapp://x?q=a"b')).toContain('\\"');
  });
});

describe('truncateUrl', () => {
  it('keeps short URLs intact', () => {
    expect(truncateUrl('myapp://home')).toBe('myapp://home');
  });

  it('truncates long URLs with an ellipsis', () => {
    const out = truncateUrl(`myapp://${'x'.repeat(100)}`, 20);
    expect(out.length).toBeLessThanOrEqual(20);
    expect(out.endsWith('…')).toBe(true);
  });
});
