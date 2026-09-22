import { z } from 'zod';

export type LinkType = 'custom-scheme' | 'https' | 'invalid' | 'unknown';
export type TestPlatform = 'android' | 'ios';

export const linkTypeSchema = z.enum(['custom-scheme', 'https', 'invalid', 'unknown']);
export const testPlatformSchema = z.enum(['android', 'ios']);

export const linkHistoryItemSchema = z.object({
  id: z.string().min(1),
  url: z.string().min(1).max(4096),
  linkType: linkTypeSchema,
  platform: testPlatformSchema.optional(),
  isFavorite: z.boolean(),
  createdAt: z.string().min(1),
  lastOpenedAt: z.string().optional(),
});

export type LinkHistoryItem = z.infer<typeof linkHistoryItemSchema>;

export const linkHistoryListSchema = z.array(linkHistoryItemSchema);

export type DebugEventType = 'initial' | 'runtime';

export interface DebugEvent {
  id: string;
  url: string;
  type: DebugEventType;
  receivedAt: string;
}

export interface QueryParam {
  key: string;
  value: string;
}

export interface UrlAnalysis {
  isValid: boolean;
  linkType: LinkType;
  /** Lower-cased scheme without the trailing colon, e.g. "myapp", "https". */
  scheme?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  fragment?: string;
  queryParams: QueryParam[];
  /** Short, actionable reason when isValid is false. */
  validationError?: string;
  /** True when the URL exceeds the comfortable length threshold but is otherwise valid. */
  isTooLong: boolean;
}

export const MAX_URL_LENGTH = 4096;
export const LONG_URL_THRESHOLD = 2000;
