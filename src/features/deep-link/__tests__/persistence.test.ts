import { describe, expect, it } from '@jest/globals';
import {
  linkHistoryItemSchema,
  linkHistoryListSchema,
} from '@/src/features/deep-link/types';

const validItem = {
  id: 'abc123',
  url: 'myapp://product/42?source=push',
  linkType: 'custom-scheme',
  platform: 'android',
  isFavorite: false,
  createdAt: '2026-09-18T00:00:00.000Z',
};

describe('link history persistence schemas', () => {
  it('accepts a valid item', () => {
    expect(linkHistoryItemSchema.safeParse(validItem).success).toBe(true);
  });

  it('accepts a minimal item without optional fields', () => {
    const minimal = {
      id: validItem.id,
      url: validItem.url,
      linkType: validItem.linkType,
      isFavorite: validItem.isFavorite,
      createdAt: validItem.createdAt,
    };
    expect(linkHistoryItemSchema.safeParse(minimal).success).toBe(true);
  });

  it('rejects items with unknown link types', () => {
    expect(
      linkHistoryItemSchema.safeParse({ ...validItem, linkType: 'magic' }).success,
    ).toBe(false);
  });

  it('rejects empty urls and oversized payloads', () => {
    expect(linkHistoryItemSchema.safeParse({ ...validItem, url: '' }).success).toBe(false);
    expect(
      linkHistoryItemSchema.safeParse({ ...validItem, url: 'x'.repeat(5000) }).success,
    ).toBe(false);
  });

  it('accepts a valid list and rejects corrupted storage payloads', () => {
    expect(linkHistoryListSchema.safeParse([validItem]).success).toBe(true);
    expect(linkHistoryListSchema.safeParse(null).success).toBe(false);
    expect(linkHistoryListSchema.safeParse('garbage').success).toBe(false);
    expect(linkHistoryListSchema.safeParse([{ ...validItem, id: 42 }]).success).toBe(false);
  });
});
