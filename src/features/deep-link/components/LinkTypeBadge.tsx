import React from 'react';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { linkTypeLabel } from '@/src/features/deep-link/utils/url';
import type { LinkType } from '@/src/features/deep-link/types';

const TONE: Record<LinkType, 'accent' | 'success' | 'danger' | 'neutral'> = {
  'custom-scheme': 'accent',
  https: 'success',
  invalid: 'danger',
  unknown: 'neutral',
};

export function LinkTypeBadge({ linkType }: { linkType: LinkType }) {
  return <AppBadge label={linkTypeLabel(linkType)} tone={TONE[linkType]} />;
}
