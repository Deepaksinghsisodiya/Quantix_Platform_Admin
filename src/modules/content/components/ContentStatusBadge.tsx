/**
 * ContentStatusBadge -- Displays a colour-coded badge for content status.
 *
 * Draft (gray), Review (yellow), Published (green), Scheduled (blue).
 */

import React from 'react';
import { ATMBadge, type ATMBadgeProps } from '@/shared/ui';
import type { ContentStatus } from '@/lib/types/content';

export interface ContentStatusBadgeProps {
  status: ContentStatus;
  className?: string;
}

const statusConfig: Record<ContentStatus, { variant: ATMBadgeProps['variant']; label: string }> = {
  Draft: { variant: 'default', label: 'Draft' },
  Review: { variant: 'warning', label: 'In Review' },
  Published: { variant: 'success', label: 'Published' },
  Scheduled: { variant: 'info', label: 'Scheduled' },
};

export function ContentStatusBadge({ status, className }: ContentStatusBadgeProps) {
  const cfg = statusConfig[status] ?? { variant: 'default' as const, label: status };

  return (
    <ATMBadge variant={cfg.variant} dot size="sm" className={className}>
      {cfg.label}
    </ATMBadge>
  );
}
