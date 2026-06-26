import React, { useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';
import { toast } from 'sonner';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import type { RechargeToken } from '@/lib/types';
import { Copy, Mail, Download, Printer } from 'lucide-react';

export interface TokenDisplayProps {
  token: RechargeToken;
  onEmail?: (token: RechargeToken) => void;
  onDownloadPdf?: (token: RechargeToken) => void;
  className?: string;
}

const TIER_BADGE_VARIANT: Record<string, 'gray' | 'primary' | 'purple' | 'warning'> = {
  Basic: 'gray',
  Standard: 'primary',
  Advance: 'purple',
  Premium: 'warning',
};

export function TokenDisplay({
  token,
  onEmail,
  onDownloadPdf,
  className,
}: TokenDisplayProps) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(token.tokenString).then(
      () => toast.success('Token copied to clipboard'),
      () => toast.error('Failed to copy token'),
    );
  }, [token.tokenString]);

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
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
          Generated Token
        </h3>
        <StatusBadge status={token.status} />
      </div>

      <div className="p-5">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex shrink-0 flex-col items-center gap-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-white shadow-md">
              <QRCodeSVG
                value={token.qrCodeData || token.tokenString}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
              Scan to activate
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
                  {token.tokenString}
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
                  {token.id}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Merchant
                </span>
                <span className="mt-1 block text-xs font-bold text-gray-900 dark:text-gray-100">
                  {token.merchantName}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Tier
                </span>
                <ATMBadge color={TIER_BADGE_VARIANT[token.tier] ?? 'gray'} label={token.tier} className="mt-1" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Valid From
                </span>
                <span className="mt-1 block text-xs font-bold text-gray-900 dark:text-gray-100">
                  {formatDate(token.validFrom, 'short')}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Valid To
                </span>
                <span className="mt-1 block text-xs font-bold text-gray-900 dark:text-gray-100">
                  {formatDate(token.validTo, 'short')}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Status
                </span>
                <StatusBadge status={token.status} className="mt-1" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
          <ATMButton variant="secondary" size="sm" icon={Copy} onClick={handleCopy}>
            Copy to Clipboard
          </ATMButton>
          {onEmail && (
            <ATMButton variant="secondary" size="sm" icon={Mail} onClick={() => onEmail(token)}>
              Email to Merchant
            </ATMButton>
          )}
          {onDownloadPdf && (
            <ATMButton variant="secondary" size="sm" icon={Download} onClick={() => onDownloadPdf(token)}>
              Download as PDF
            </ATMButton>
          )}
          <ATMButton variant="secondary" size="sm" icon={Printer} onClick={handlePrint}>
            Print
          </ATMButton>
        </div>
      </div>
    </div>
  );
}
