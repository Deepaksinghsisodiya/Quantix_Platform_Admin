/**
 * Token status badge — V4 status model (2026-08-30, user-locked):
 *   Active     → displayed as "Issued" (sold & outstanding; usage unknown unless recorded)
 *   Expired    → derived from a recorded apply date + validity
 *   Revoked    → platform disowned it
 *   Superseded → provably dead (higher sequence applied first) — needs operator review
 *   Consumed   → legacy value, dropped from filters; rendered greyed if old data has it
 */
import React from 'react';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import type { TokenStatus } from '@/lib/types';

const STATUS_DISPLAY: Record<string, { label: string; color: 'success' | 'gray' | 'danger' | 'warning' }> = {
  Active:     { label: 'Issued',     color: 'success' },
  Expired:    { label: 'Expired',    color: 'gray' },
  Revoked:    { label: 'Revoked',    color: 'danger' },
  Superseded: { label: 'Superseded', color: 'warning' },
  Consumed:   { label: 'Consumed',   color: 'gray' },
};

export const TokenStatusBadge: React.FC<{ status: TokenStatus | string; className?: string }> = ({ status, className }) => {
  const d = STATUS_DISPLAY[status] ?? { label: status, color: 'gray' as const };
  return <ATMBadge color={d.color} label={d.label} className={className} />;
};

export default TokenStatusBadge;
