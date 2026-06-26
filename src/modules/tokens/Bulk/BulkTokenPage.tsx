import React, { useCallback, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Download,
  Loader2,
  Mail,
  Minus,
  Plus,
  Zap,
  Layers,
} from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import type { TokenTier, RechargeToken, TokenTemplate } from '@/lib/types';

interface TierOption {
  tier: TokenTier;
  label: string;
  unitPrice: number;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'muted' | 'purple' | 'gray';
  bgColor: string;
  features: string[];
}

const TIERS: TierOption[] = [
  { tier: 'Basic', label: 'Basic', unitPrice: 79, color: 'gray', bgColor: 'bg-gray-100 dark:bg-gray-800', features: ['Single terminal', 'Basic reports'] },
  { tier: 'Standard', label: 'Standard', unitPrice: 149, color: 'primary', bgColor: 'bg-blue-100 dark:bg-blue-900/30', features: ['Up to 3 terminals', 'Card payments', 'Inventory'] },
  { tier: 'Advance', label: 'Advance', unitPrice: 299, color: 'purple', bgColor: 'bg-purple-100 dark:bg-purple-900/30', features: ['Up to 10 terminals', 'Multi-location', 'Analytics'] },
  { tier: 'Premium', label: 'Premium', unitPrice: 499, color: 'warning', bgColor: 'bg-amber-100 dark:bg-amber-900/30', features: ['Unlimited terminals', 'White-label', 'Priority support'] },
];

const VALIDITY_OPTIONS = [30, 60, 90, 180, 365] as const;

function getBulkDiscount(qty: number): number {
  if (qty >= 50) return 0.15;
  if (qty >= 20) return 0.10;
  if (qty >= 10) return 0.05;
  return 0;
}

function TierCard({
  tier,
  selected,
  onSelect,
}: {
  tier: TierOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex flex-col rounded-2xl border-2 p-5 text-left transition-all duration-300 w-full hover:scale-[1.02] hover:shadow-sm active:scale-[0.98]',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/10',
        selected
          ? 'border-accent-600 bg-accent-50/30 shadow-md dark:border-accent-500 dark:bg-accent-950/20'
          : 'border-surface-200 bg-zen-surface hover:border-accent-300 dark:border-surface-800 dark:hover:border-accent-800',
      )}
    >
      {selected && (
        <div className="absolute -top-3 right-4 flex items-center gap-1 bg-white dark:bg-gray-900 border border-accent-600 dark:border-accent-500 rounded-full px-2.5 py-0.5 shadow-sm animate-in zoom-in duration-300">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-accent-600 dark:text-accent-400">
            Selected
          </span>
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-accent-600 text-white dark:bg-accent-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" className="h-1.5 w-1.5">
              <path d="M20 6L9 17L4 12" />
            </svg>
          </span>
        </div>
      )}
      <div className="inline-block self-start">
        <ATMBadge label={tier.label} color={tier.color} />
      </div>
      <p className="mt-4 text-2xl font-black tabular-nums text-gray-900 dark:text-gray-100">
        {formatCurrency(tier.unitPrice)}
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">/token</span>
      </p>
      <ul className="mt-4 space-y-2 w-full">
        {tier.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs font-semibold text-surface-650 dark:text-surface-400">
            <Check className="h-3 w-3 shrink-0 text-success" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

export interface BulkTokenPageProps {
  merchantsLoading: boolean;
  merchantsError: boolean;
  refetchMerchants: () => void;
  merchantOptions: { label: string; value: string }[];
  templatesLoading: boolean;
  templates: readonly TokenTemplate[];
  selectedMerchant: string;
  setSelectedMerchant: (id: string) => void;
  selectedTier: TokenTier | null;
  setSelectedTier: (tier: TokenTier | null) => void;
  validityDays: number;
  setValidityDays: (days: number) => void;
  quantity: number;
  setQuantity: (qty: number) => void;
  generating: boolean;
  generatedTokens: readonly RechargeToken[];
  onGenerate: () => void;
  onDownloadCsv: () => void;
  onEmail: () => void;
  onReset: () => void;
}

export const BulkTokenPage: React.FC<BulkTokenPageProps> = ({
  merchantsLoading,
  merchantsError,
  refetchMerchants,
  merchantOptions,
  templatesLoading,
  templates,
  selectedMerchant,
  setSelectedMerchant,
  selectedTier,
  setSelectedTier,
  validityDays,
  setValidityDays,
  quantity,
  setQuantity,
  generating,
  generatedTokens,
  onGenerate,
  onDownloadCsv,
  onEmail,
  onReset,
}) => {
  const tierDef = useMemo(() => TIERS.find((t) => t.tier === selectedTier), [selectedTier]);
  const unitPrice = tierDef?.unitPrice ?? 0;
  const discount = getBulkDiscount(quantity);
  const subtotal = unitPrice * quantity;
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount;

  const canGenerate = selectedMerchant && selectedTier && quantity > 0 && !templatesLoading && templates.length > 0;

  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity(Math.max(1, Math.min(100, quantity + delta)));
  }, [quantity, setQuantity]);

  // View: Success/Generated List
  if (generatedTokens.length > 0) {
    return (
      <div className="flex flex-col h-full bg-zen-surface animate-in fade-in duration-500 overflow-hidden w-full">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 bg-zen-surface">
          <ATMPageHeader
            title="Generated Tokens"
            subtitle={`Bulk tokens generated successfully.`}
            icon={Layers}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-slate-50/10 dark:bg-gray-900/10">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-bold text-emerald-800 dark:text-emerald-200 text-sm">
                {generatedTokens.length} tokens generated successfully
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                {selectedTier} tier, {validityDays}-day validity
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <ATMButton type="button" variant="primary" icon={Download} onClick={onDownloadCsv}>
              Download CSV
            </ATMButton>
            <ATMButton type="button" variant="secondary" icon={Mail} onClick={onEmail}>
              Batch Email
            </ATMButton>
            <ATMButton type="button" variant="outline" onClick={onReset}>
              Generate More
            </ATMButton>
          </div>

          <ATMCard padding="none" className="shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">#</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Token ID</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Token String</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">QR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {generatedTokens.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-850/30 transition-colors">
                      <td className="px-5 py-3.5 font-bold tabular-nums text-gray-500 dark:text-gray-400">{idx + 1}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-600 dark:text-gray-400">{t.id}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-900 dark:text-gray-100">
                        {t.tokenString.length > 30 ? `${t.tokenString.substring(0, 30)}...` : t.tokenString}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-block rounded-xl border border-gray-100 bg-white p-1.5 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
                          <QRCodeSVG value={t.tokenString} size={32} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ATMCard>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zen-surface animate-in fade-in duration-500 overflow-hidden w-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 bg-zen-surface">
        <ATMPageHeader
          title="Bulk Token Generation"
          subtitle="Generate multiple activation tokens for Standalone merchants in a single batch."
          icon={Layers}
        />
      </div>

      {/* Scrollable grid content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/10 dark:bg-gray-900/10">
        <div className="grid gap-6 lg:grid-cols-3 items-start max-w-7xl mx-auto w-full">
          {/* Main Controls */}
          <div className="space-y-6 lg:col-span-2">
            <ATMCard title="Merchant" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
              {merchantsLoading ? (
                <div className="flex items-center gap-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin text-accent-600" />
                  <span>Loading merchants...</span>
                </div>
              ) : merchantsError ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-955/20">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-semibold text-red-800 dark:text-red-200">
                      Failed to load merchants
                    </span>
                  </div>
                  <ATMButton type="button" variant="secondary" size="sm" onClick={refetchMerchants}>
                    Retry
                  </ATMButton>
                </div>
              ) : (
                <ATMSelectField
                  name="selectedMerchant"
                  label="Select Standalone Merchant"
                  placeholder="Choose merchant"
                  options={merchantOptions}
                  value={selectedMerchant || null}
                  onChange={(val) => setSelectedMerchant(val as string || '')}
                />
              )}
            </ATMCard>

            <ATMCard title="Tier Selection" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {TIERS.map((t) => (
                  <TierCard
                    key={t.tier}
                    tier={t}
                    selected={selectedTier === t.tier}
                    onSelect={() => setSelectedTier(t.tier)}
                  />
                ))}
              </div>
            </ATMCard>

            <ATMCard title="Validity Period" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex flex-wrap gap-3">
                {VALIDITY_OPTIONS.map((days) => (
                  <ATMButton
                    key={days}
                    type="button"
                    variant={validityDays === days ? 'primary' : 'outline'}
                    onClick={() => setValidityDays(days)}
                    className="hover:scale-[1.02] active:scale-[0.98] font-bold transition-transform"
                  >
                    {days} days
                  </ATMButton>
                ))}
              </div>
            </ATMCard>

            <ATMCard title="Quantity" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <ATMButton
                  type="button"
                  variant="outline"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  icon={Minus}
                />
                <div className="flex h-12 w-24 items-center justify-center rounded-xl border border-gray-100 bg-zen-surface text-center text-xl font-bold tabular-nums text-gray-900 dark:border-gray-800 dark:text-gray-100 shadow-inner">
                  {quantity}
                </div>
                <ATMButton
                  type="button"
                  variant="outline"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 100}
                  icon={Plus}
                />
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Range: 1 - 100
                </span>
              </div>
              {discount > 0 && (
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 animate-in fade-in duration-300">
                  <Zap className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                  {Math.round(discount * 100)}% bulk discount applied
                </div>
              )}
            </ATMCard>
          </div>

          {/* Right Sidebar - Pricing & Config Details */}
          <div className="space-y-6">
            <ATMCard title="Pricing Summary" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-semibold">Unit Price</span>
                    <span className="font-bold tabular-nums text-gray-900 dark:text-gray-100">
                      {formatCurrency(unitPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-semibold">Quantity</span>
                    <span className="font-bold tabular-nums text-gray-900 dark:text-gray-100">
                      x {quantity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-semibold">Subtotal</span>
                    <span className="font-bold tabular-nums text-gray-900 dark:text-gray-100">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        Bulk Discount ({Math.round(discount * 100)}%)
                      </span>
                      <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                        -{formatCurrency(discountAmount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-gray-900 dark:text-gray-100">Total</span>
                    <span className="text-2xl font-black tabular-nums text-accent-600 dark:text-accent-400">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {templates.length === 0 && !templatesLoading && (
                  <div className="p-3 text-xs bg-amber-50 text-amber-800 rounded-xl border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50">
                    Warning: No system templates found in the database. Please contact an admin.
                  </div>
                )}

                <ATMButton
                  type="button"
                  variant="primary"
                  className="w-full font-bold shadow-md hover:shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  icon={Zap}
                  onClick={onGenerate}
                  isLoading={generating}
                  disabled={!canGenerate}
                >
                  Generate {quantity} Token{quantity !== 1 ? 's' : ''}
                </ATMButton>
              </div>
            </ATMCard>

            <ATMCard title="Discount Tiers" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="space-y-3.5 text-xs">
                <div className={cn('flex justify-between', quantity >= 10 && quantity < 20 ? 'font-bold text-accent-600 dark:text-accent-400' : 'text-gray-500 dark:text-gray-400 font-semibold')}>
                  <span>10+ tokens</span>
                  <span>5% off</span>
                </div>
                <div className={cn('flex justify-between', quantity >= 20 && quantity < 50 ? 'font-bold text-accent-600 dark:text-accent-400' : 'text-gray-500 dark:text-gray-400 font-semibold')}>
                  <span>20+ tokens</span>
                  <span>10% off</span>
                </div>
                <div className={cn('flex justify-between', quantity >= 50 ? 'font-bold text-accent-600 dark:text-accent-400' : 'text-gray-500 dark:text-gray-400 font-semibold')}>
                  <span>50+ tokens</span>
                  <span>15% off</span>
                </div>
              </div>
            </ATMCard>

            <ATMCard title="Configuration" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400 font-semibold">Tier</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{selectedTier ?? '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400 font-semibold">Validity</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{validityDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400 font-semibold">Binding</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">Auto-generated IDs</span>
                </div>
              </div>
            </ATMCard>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BulkTokenPage;
