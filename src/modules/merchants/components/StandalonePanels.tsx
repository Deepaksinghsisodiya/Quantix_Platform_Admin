/**
 * StandalonePanels — Standalone-specific detail cards with mock data.
 *
 * Displays Active Token, Token History, Tier Info,
 * Renewal Status, and Offline Notes.
 */

import React, { useState } from 'react';
import { ATMBadge, ATMProgressBar, ATMButton } from '@/shared/ui';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Check,
  Clock,
  FileText,
  Key,
  RefreshCw,
  Shield,
  Monitor,
  Plus,
} from 'lucide-react';

import { ATMCard } from '@/shared/ui/ATMCard';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';
import type { TokenTier } from '@/lib/types/token';
import { useGetTerminalsByMerchantQuery } from '@/modules/merchants/services/merchantApi';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK = {
  activeToken: {
    id: 'tok_a1b2c3d4e5f6g7h8',
    tier: 'Advance' as TokenTier,
    validFrom: '2026-03-15T00:00:00Z',
    validTo: '2026-06-13T00:00:00Z',
    daysRemaining: 76,
    totalDays: 90,
  },
  tokenHistory: [
    { id: 'tok_prev5', tier: 'Advance' as TokenTier, validFrom: '2025-12-15', validTo: '2026-03-15', status: 'Consumed' },
    { id: 'tok_prev4', tier: 'Standard' as TokenTier, validFrom: '2025-09-15', validTo: '2025-12-15', status: 'Consumed' },
    { id: 'tok_prev3', tier: 'Standard' as TokenTier, validFrom: '2025-06-15', validTo: '2025-09-15', status: 'Consumed' },
    { id: 'tok_prev2', tier: 'Basic' as TokenTier, validFrom: '2025-03-15', validTo: '2025-06-15', status: 'Consumed' },
    { id: 'tok_prev1', tier: 'Basic' as TokenTier, validFrom: '2024-12-15', validTo: '2025-03-15', status: 'Expired' },
  ],
  tierFeatures: {
    Advance: [
      'Up to 10 terminals',
      'Multi-location support',
      'Advanced analytics & reporting',
      'Customer loyalty program',
      'API access',
      'Inventory management',
      'Card & mobile payments',
      'Kitchen display integration',
    ],
  },
  renewal: {
    renewalDate: '2026-06-13',
    autoReminder: true,
    reminderDays: [30, 14, 7, 3, 1],
  },
};

// ---------------------------------------------------------------------------
// Tier badge variant
// ---------------------------------------------------------------------------

const TIER_BADGE_VARIANT: Record<TokenTier, 'default' | 'info' | 'enterprise' | 'warning'> = {
  Basic: 'default',
  Standard: 'info',
  Advance: 'enterprise',
  Premium: 'warning',
};

// ---------------------------------------------------------------------------
// Status badge for history
// ---------------------------------------------------------------------------

function TokenStatusBadge({ status }: { status: string }) {
  const map: Record<string, 'default' | 'success' | 'danger'> = {
    Consumed: 'default',
    Active: 'success',
    Expired: 'danger',
    Revoked: 'danger',
  };
  return <ATMBadge variant={map[status] ?? 'default'} size="sm">{status}</ATMBadge>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface StandalonePanelsProps {
  merchantId?: string;
}

function TerminalsCard({ merchantId }: { merchantId: string }) {
  const { data: res, isLoading } = useGetTerminalsByMerchantQuery(merchantId);
  const terminals = res?.data ?? [];
  const registeredCount = terminals.filter((t) => t.isRegistered).length;

  return (
    <ATMCard title="Terminals" padding="md">
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex h-24 items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin text-accent-500" />
          </div>
        ) : terminals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-3">No terminals registered yet.</p>
            <Link to={`/merchants/${merchantId}/terminals`}>
              <ATMButton variant="secondary" size="sm" icon={Plus}>
                Register Terminal
              </ATMButton>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-400">
              <span>Status</span>
              <span className="text-gray-900 dark:text-white font-bold">{registeredCount} / {terminals.length} Registered</span>
            </div>
            
            <div className="space-y-2 max-h-[140px] overflow-y-auto scrollbar-thin">
              {terminals.slice(0, 3).map((t) => (
                <div key={t.terminalId} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-900/10 px-3 py-2 text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[140px]">{t.terminalName}</span>
                  <ATMBadge 
                    color={t.isRegistered ? 'success' : 'warning'} 
                    label={t.isRegistered ? 'Registered' : 'Pending'} 
                    size="sm" 
                  />
                </div>
              ))}
            </div>

            <div className="pt-1">
              <Link to={`/merchants/${merchantId}/terminals`}>
                <ATMButton variant="secondary" size="sm" fullWidth icon={Monitor}>
                  Manage Terminals
                </ATMButton>
              </Link>
            </div>
          </div>
        )}
      </div>
    </ATMCard>
  );
}

function StandalonePanels({ merchantId }: StandalonePanelsProps) {
  const [notes, setNotes] = useState('');
  const [autoReminder, setAutoReminder] = useState(MOCK.renewal.autoReminder);

  const expiryPercent = Math.round((MOCK.activeToken.daysRemaining / MOCK.activeToken.totalDays) * 100);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Active Token */}
      <ATMCard title="Active Token" padding="md">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <Key className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-mono text-xs text-gray-600 dark:text-gray-400">
                  {MOCK.activeToken.id}
                </span>
                <ATMBadge variant={TIER_BADGE_VARIANT[MOCK.activeToken.tier]} size="sm">
                  {MOCK.activeToken.tier}
                </ATMBadge>
              </div>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {formatDate(MOCK.activeToken.validFrom, 'short')} — {formatDate(MOCK.activeToken.validTo, 'short')}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className={cn(
                'font-semibold',
                MOCK.activeToken.daysRemaining > 30 ? 'text-emerald-600 dark:text-emerald-400'
                  : MOCK.activeToken.daysRemaining > 14 ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400',
              )}>
                {MOCK.activeToken.daysRemaining} days remaining
              </span>
              <span className="text-gray-400 dark:text-gray-500">{MOCK.activeToken.totalDays}d total</span>
            </div>
            <ATMProgressBar
              value={expiryPercent}
              size="sm"
              variant={expiryPercent > 50 ? 'success' : expiryPercent > 20 ? 'warning' : 'danger'}
            />
          </div>
        </div>
      </ATMCard>

      {/* Token History */}
      <ATMCard title="Token History" padding="md">
        <div className="space-y-2">
          {MOCK.tokenHistory.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <ATMBadge variant={TIER_BADGE_VARIANT[t.tier]} size="sm">{t.tier}</ATMBadge>
                  <TokenStatusBadge status={t.status} />
                </div>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {t.validFrom} — {t.validTo}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ATMCard>

      {/* Tier Info */}
      <ATMCard title="Tier Features" padding="md">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ATMBadge variant={TIER_BADGE_VARIANT[MOCK.activeToken.tier]}>
              {MOCK.activeToken.tier}
            </ATMBadge>
            <span className="text-sm text-gray-500 dark:text-gray-400">Current tier</span>
          </div>
          <ul className="space-y-1.5">
            {MOCK.tierFeatures.Advance.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </ATMCard>

      {/* Renewal Status */}
      <ATMCard title="Renewal Status" padding="md">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Renewal Date
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {MOCK.renewal.renewalDate}
              </p>
            </div>
          </div>

          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">Auto-reminder</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Send reminders at {MOCK.renewal.reminderDays.join(', ')} days before expiry
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoReminder}
              onClick={() => setAutoReminder((v) => !v)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                autoReminder ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200',
                  autoReminder ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </label>
        </div>
      </ATMCard>

      {/* Terminals Summary */}
      {merchantId && <TerminalsCard merchantId={merchantId} />}

      {/* Offline Notes */}
      <ATMCard title="Offline Notes" padding="md">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <FileText className="h-4 w-4" />
            Internal notes for this standalone merchant
          </div>
          <textarea
            className={cn(
              'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900',
              'placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500',
              'dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500',
              'dark:focus:border-indigo-400 dark:focus:ring-indigo-400',
            )}
            rows={4}
            placeholder="Add notes about this merchant's setup, preferences, or special considerations..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Notes are saved locally and visible only to platform admins.
          </p>
        </div>
      </ATMCard>
    </div>
  );
}

export default StandalonePanels;
