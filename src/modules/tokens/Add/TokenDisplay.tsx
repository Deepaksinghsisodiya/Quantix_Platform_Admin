/**
 * Generated-token panel — 2026-08-29 rebuild. Shows the real RechargeTokenDetail
 * (encodedToken is the string the merchant applies). The former Tier badge and the
 * "Email to Merchant" / "Download as PDF" buttons are gone — the email one toasted
 * success from a stub that never sent anything.
 */
import React, { useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { Copy, Printer } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { TokenStatusBadge } from '../components/TokenStatusBadge';
import { PLAN_TYPE_LABEL } from '@/lib/types/platform-enums';
import type { RechargeTokenDetail } from '@/lib/types';
import { TokenBreakdown } from '../components/TokenBreakdown';

export interface TokenDisplayProps {
  token: RechargeTokenDetail;
  className?: string;
}

export function TokenDisplay({ token, className }: TokenDisplayProps) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(token.encodedToken).then(
      () => toast.success('Token copied to clipboard'),
      () => toast.error('Failed to copy token'),
    );
  }, [token.encodedToken]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-955',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Generated Token</h3>
        <TokenStatusBadge status={token.status} />
      </div>

      <div className="p-5">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex shrink-0 flex-col items-center gap-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-white shadow-md">
              <QRCodeSVG value={token.encodedToken} size={160} level="H" includeMargin={false} />
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
              Scan to apply
            </span>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Token String
              </label>
              <div className="flex items-center gap-3">
                <code
                  className={cn(
                    'flex-1 overflow-x-auto rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 font-bold',
                    'font-mono text-xs text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 shadow-inner',
                    'select-all break-all',
                  )}
                >
                  {token.encodedToken}
                </code>
                <ATMButton
                  variant="secondary"
                  size="sm"
                  onClick={handleCopy}
                  icon={Copy}
                  aria-label="Copy token to clipboard"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Token ID
                </span>
                <span className="mt-1 block truncate font-mono text-xs font-bold text-gray-900 dark:text-gray-100">
                  {token.tokenId}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Plan
                </span>
                <ATMBadge color="primary" label={token.planName || (PLAN_TYPE_LABEL[token.plan] ?? token.plan)} className="mt-1" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Sequence
                </span>
                <span className="mt-1 block text-xs font-bold text-gray-900 dark:text-gray-100">#{token.sequence}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Validity
                </span>
                <span className="mt-1 block text-xs font-bold text-gray-900 dark:text-gray-100">
                  {token.validityDays} days from activation
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Generated
                </span>
                <span className="mt-1 block text-xs font-bold text-gray-900 dark:text-gray-100">
                  {formatDate(token.createdAt, 'short')}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Status
                </span>
                <TokenStatusBadge status={token.status} className="mt-1" />
              </div>
            </div>
          </div>
        </div>

        {/* 2026-08-29 (user-locked): the complete token in human-readable form — every
            limit count, enabled features and grace phases the merchant is getting. */}
        <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">What this token grants</h3>
          <TokenBreakdown
            limitsPayload={token.limitsPayload}
            featurePayload={token.featurePayload}
            gracePolicyDays={token.gracePolicyDays}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
          <ATMButton variant="secondary" size="sm" icon={Copy} onClick={handleCopy}>
            Copy to Clipboard
          </ATMButton>
          <ATMButton variant="secondary" size="sm" icon={Printer} onClick={handlePrint}>
            Print
          </ATMButton>
        </div>
      </div>
    </div>
  );
}
