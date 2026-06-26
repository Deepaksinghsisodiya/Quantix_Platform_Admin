/**
 * WalletListPage — aligned to Pass 37 locked design.
 *
 * 2026-05-18 (Pass 37): rewritten cleanly to the new API surface.
 *   - List Enterprise wallets via useWallets (server-paginated + filterable).
 *   - Per-row actions: Recharge Online, Recharge Offline, Adjustment (debit), Bonus,
 *     Refund. All operator-driven from PlatformAdmin (merchant self-service portal
 *     deferred to next session).
 *   - Recharge history view (online + offline) via useRecharges.
 *   - Standalone token balance tab retained with mock fallback (no per-merchant
 *     standalone-balance endpoint yet).
 *   - Dropped: Deduction Rules tab (UsageDeduction enum dropped), Alert Config tab
 *     (alert threshold now lives in PlatformSetting "wallet.low_balance_threshold"),
 *     TopUp Approve/Deny queue (2-step manual flow collapsed into single-step Offline).
 */

import { useMemo, useState } from 'react';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn, RowAction } from '@/shared/components/ATMTable/ATMTable';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { formatDate } from '@/lib/utils/formatDate';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMTextArea } from '@/shared/ui/ATMTextArea';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Bell,
  TrendingDown,
  Key,
  Loader2,
  RefreshCw,
  CreditCard,
  Wallet as WalletIcon,
  Plus,
  Minus,
  RotateCcw,
  Gift,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { canAccess } from '@/lib/utils/permissions';
import type { PlatformRole } from '@/lib/types/user';
import {
  useWallets,
  useAdjustWallet,
  useAddBonus,
  useRefund,
  useRechargeOnline,
  useRechargeOffline,
  useRecharges,
} from '@/lib/hooks/useWallet';
import type { Wallet, WalletRechargeStatus } from '@/lib/api/wallet';

// ---------------------------------------------------------------------------
// Permission gates
// ---------------------------------------------------------------------------

function useWalletRechargePermission(): boolean {
  const { user, permissions } = useAuthStore();
  if (!user) return false;
  return canAccess(user.role as PlatformRole, 'wallet', 'recharge', permissions);
}

// ---------------------------------------------------------------------------
// Standalone token balance — mock fallback (no per-merchant endpoint yet)
// ---------------------------------------------------------------------------

interface StandaloneTokenEntry {
  merchantName: string;
  activeTokenId: string | null;
  tier: string;
  validFrom: string | null;
  validTo: string | null;
  daysRemaining: number | null;
  status: 'Active' | 'Expired' | 'None';
  totalPurchased: number;
  totalSpent: number;
}

const MOCK_STANDALONE_TOKENS: StandaloneTokenEntry[] = [
  { merchantName: 'Metro Mart',    activeTokenId: 'tok-a1b2', tier: 'Standard', validFrom: '2026-01-15', validTo: '2026-04-15', daysRemaining: 15,  status: 'Active',  totalPurchased: 12, totalSpent: 1440 },
  { merchantName: 'Pixel Shop',    activeTokenId: 'tok-c3d4', tier: 'Advance',  validFrom: '2026-02-01', validTo: '2026-07-30', daysRemaining: 121, status: 'Active',  totalPurchased: 8,  totalSpent: 1920 },
  { merchantName: 'QuickServe',    activeTokenId: 'tok-e5f6', tier: 'Basic',    validFrom: '2026-03-10', validTo: '2026-06-08', daysRemaining: 69,  status: 'Active',  totalPurchased: 15, totalSpent: 1350 },
  { merchantName: 'Game Haven',    activeTokenId: null,        tier: 'Standard', validFrom: '2025-10-01', validTo: '2025-12-30', daysRemaining: null, status: 'Expired', totalPurchased: 4,  totalSpent: 480 },
];

const ALERT_VARIANT: Record<string, 'success' | 'warning' | 'danger'> = {
  OK: 'success',
  Low: 'warning',
  Critical: 'danger',
};

const RECHARGE_STATUS_VARIANT: Record<WalletRechargeStatus, 'success' | 'warning' | 'danger' | 'default'> = {
  Pending: 'warning',
  Captured: 'success',
  Approved: 'success',
  Failed: 'danger',
  Cancelled: 'default',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type ActionMode = 'recharge-online' | 'recharge-offline' | 'adjust' | 'bonus' | 'refund';

interface ActionDialogState {
  mode: ActionMode;
  merchantId: string;
  merchantName: string;
}

export function WalletListPage() {
  const walletsQuery = useWallets({ page: 1, pageSize: 50 });
  const rechargesQuery = useRecharges({ page: 1, pageSize: 25 });

  const adjustMutation = useAdjustWallet();
  const bonusMutation = useAddBonus();
  const refundMutation = useRefund();
  const onlineMutation = useRechargeOnline();
  const offlineMutation = useRechargeOffline();

  const [activeTab, setActiveTab] = useState<'enterprise' | 'recharges' | 'standalone'>('enterprise');
  const [dialog, setDialog] = useState<ActionDialogState | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [currencyAmount, setCurrencyAmount] = useState('');
  const [paymentToken, setPaymentToken] = useState('');
  const [channelLabel, setChannelLabel] = useState('Cash');
  const [evidenceNote, setEvidenceNote] = useState('');

  const canRecharge = useWalletRechargePermission();

  const wallets = walletsQuery.data?.data ?? [];

  // Live alert level computed against a hardcoded sensible default until
  // PlatformSetting `wallet.low_balance_threshold` is plumbed through to the UI.
  const LOW = 500;
  const CRITICAL = 200;
  const alertLevel = (balance: number) =>
    balance <= CRITICAL ? 'Critical' : balance <= LOW ? 'Low' : 'OK';

  const lowCount = useMemo(
    () => wallets.filter((w: Wallet) => alertLevel(w.tokenBalance) === 'Low').length,
    [wallets]
  );
  const criticalCount = useMemo(
    () => wallets.filter((w: Wallet) => alertLevel(w.tokenBalance) === 'Critical').length,
    [wallets]
  );

  const openDialog = (mode: ActionMode, w: Wallet, merchantName: string) => {
    setDialog({ mode, merchantId: w.merchantId, merchantName });
    setAmount('');
    setReason('');
    setCurrencyAmount('');
    setPaymentToken('');
    setChannelLabel('Cash');
    setEvidenceNote('');
  };

  const closeDialog = () => setDialog(null);

  const handleSubmit = async () => {
    if (!dialog) return;
    const tokenAmount = parseFloat(amount);
    if (!Number.isFinite(tokenAmount) || tokenAmount <= 0) {
      toast.error('Amount must be a positive number.');
      return;
    }
    try {
      switch (dialog.mode) {
        case 'adjust': {
          if (!reason.trim()) { toast.error('Reason is required.'); return; }
          await adjustMutation.mutateAsync({
            merchantId: dialog.merchantId,
            tokenAmount,
            reason: reason.trim(),
            adjustedBy: '',
          });
          toast.success(`Debited ${tokenAmount} tokens from ${dialog.merchantName}.`);
          break;
        }
        case 'bonus': {
          if (!reason.trim()) { toast.error('Reason is required.'); return; }
          await bonusMutation.mutateAsync({ merchantId: dialog.merchantId, tokenAmount, reason: reason.trim() });
          toast.success(`Bonus of ${tokenAmount} tokens credited to ${dialog.merchantName}.`);
          break;
        }
        case 'refund': {
          if (!reason.trim()) { toast.error('Reason is required.'); return; }
          await refundMutation.mutateAsync({ merchantId: dialog.merchantId, tokenAmount, reason: reason.trim() });
          toast.success(`Refund of ${tokenAmount} tokens credited to ${dialog.merchantName}.`);
          break;
        }
        case 'recharge-online': {
          const ca = parseFloat(currencyAmount);
          if (!Number.isFinite(ca) || ca <= 0) { toast.error('Currency amount required.'); return; }
          if (!paymentToken.trim()) { toast.error('Payment token required.'); return; }
          await onlineMutation.mutateAsync({
            merchantId: dialog.merchantId,
            tokenAmount,
            currencyAmount: ca,
            paymentToken: paymentToken.trim(),
          });
          toast.success(`Online recharge submitted for ${dialog.merchantName}.`);
          break;
        }
        case 'recharge-offline': {
          await offlineMutation.mutateAsync({
            merchantId: dialog.merchantId,
            tokenAmount,
            channelLabel,
            evidenceNote: evidenceNote.trim() || undefined,
          });
          toast.success(`Offline recharge recorded for ${dialog.merchantName}.`);
          break;
        }
      }
      closeDialog();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Action failed.';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ATMPageHeader
        title={
          <div className="flex items-center gap-2">
            <WalletIcon className="h-6 w-6 text-indigo-500" />
            <span>Wallet &amp; Token Balance</span>
            {walletsQuery.isLoading && <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />}
          </div>
        }
        subtitle="Enterprise wallets (subscription / commission / recharge / withdrawal / bonus / refund / adjustment)."
        extraActions={
          <div className="flex items-center gap-2">
            {criticalCount > 0 && <ATMBadge label={`${criticalCount} critical`} color="danger" />}
            {lowCount > 0 && <ATMBadge label={`${lowCount} low balance`} color="warning" />}
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100 dark:border-gray-800 pb-px">
        {[
          { key: 'enterprise' as const, label: 'Enterprise Wallets', icon: <TrendingDown className="h-3.5 w-3.5" /> },
          { key: 'recharges' as const, label: 'Recharge History', icon: <CreditCard className="h-3.5 w-3.5" /> },
          { key: 'standalone' as const, label: 'Standalone Tokens', icon: <Key className="h-3.5 w-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300',
              activeTab === tab.key
                ? 'bg-accent-600 dark:bg-accent-600 text-white shadow-md shadow-accent-500/20'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Enterprise Wallets */}
      {activeTab === 'enterprise' && (
        <ATMCard padding="none" className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-950/20">
            <p className="text-xs font-bold text-accent-700 dark:text-accent-400 uppercase tracking-wider">
              Enterprise merchants only — Standalone merchants use recharge tokens directly (no wallet).
            </p>
          </div>
          {walletsQuery.isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <AlertTriangle className="h-10 w-10 text-red-500" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Failed to load wallets.</p>
              <ATMButton variant="primary" size="sm" onClick={() => walletsQuery.refetch()} icon={RefreshCw}>
                Retry
              </ATMButton>
            </div>
          ) : (
            <ATMTable<Wallet>
              columns={[
                {
                  key: 'merchantId',
                  header: 'Merchant',
                  renderCell: (_val, row) => (
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{row.merchantId}</span>
                  ),
                },
                {
                  key: 'tokenBalance',
                  header: 'Balance',
                  align: 'right',
                  renderCell: (_val, row) => (
                    <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(row.tokenBalance)}
                    </span>
                  ),
                  width: '120px',
                },
                {
                  key: 'alert',
                  header: 'Alert',
                  renderCell: (_val, row) => {
                    const level = alertLevel(row.tokenBalance);
                    return <StatusBadge status={level === 'OK' ? 'success' : level === 'Low' ? 'warning' : 'danger'} label={level} />;
                  },
                  width: '100px',
                },
                {
                  key: 'lastTopUpDate',
                  header: 'Last Top-Up',
                  renderCell: (_val, row) => (
                    <span className="text-gray-500">{row.lastTopUpDate ? formatDate(row.lastTopUpDate) : '—'}</span>
                  ),
                  width: '130px',
                },
                {
                  key: 'lastDeductionDate',
                  header: 'Last Deduction',
                  renderCell: (_val, row) => (
                    <span className="text-gray-500">{row.lastDeductionDate ? formatDate(row.lastDeductionDate) : '—'}</span>
                  ),
                  width: '130px',
                },
              ]}
              data={wallets}
              isLoading={walletsQuery.isLoading}
              emptyMessage="No Enterprise wallets yet."
              rowActions={(row) => {
                const name = row.merchantId;
                const actions: RowAction<Wallet>[] = [
                  { label: 'Bonus', icon: Gift, onClick: (r) => openDialog('bonus', r, name) },
                  { label: 'Refund', icon: RotateCcw, onClick: (r) => openDialog('refund', r, name) },
                  { label: 'Debit', icon: Minus, variant: 'danger', onClick: (r) => openDialog('adjust', r, name) },
                ];
                if (canRecharge) {
                  actions.unshift(
                    { label: 'Recharge Online', icon: CreditCard, onClick: (r) => openDialog('recharge-online', r, name) },
                    { label: 'Recharge Offline', icon: Plus, onClick: (r) => openDialog('recharge-offline', r, name) },
                  );
                }
                return actions;
              }}
            />
          )}
        </ATMCard>
      )}

      {/* Recharge History */}
      {activeTab === 'recharges' && (
        <ATMCard padding="none" className="overflow-hidden">
          <ATMTable
            columns={[
              {
                key: 'createdAt',
                header: 'Date',
                renderCell: (_val, row) => (
                  <span className="text-gray-500">{formatDate(row.createdAt)}</span>
                ),
                width: '130px',
              },
              {
                key: 'merchantId',
                header: 'Merchant',
                renderCell: (_val, row) => (
                  <span className="font-mono text-xs text-gray-900 dark:text-gray-100">{row.merchantId}</span>
                ),
              },
              {
                key: 'channel',
                header: 'Channel',
                renderCell: (_val, row) => (
                  <span className="text-gray-900 dark:text-gray-100">{row.channel}</span>
                ),
                width: '110px',
              },
              {
                key: 'tokenAmount',
                header: 'Tokens',
                align: 'right',
                renderCell: (_val, row) => (
                  <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(row.tokenAmount)}
                  </span>
                ),
                width: '110px',
              },
              {
                key: 'currencyAmount',
                header: 'Currency',
                align: 'right',
                renderCell: (_val, row) => (
                  <span className="text-gray-500">
                    {row.currencyAmount != null ? `${row.currencyAmount.toFixed(2)} ${row.currencyCode ?? ''}` : '—'}
                  </span>
                ),
                width: '120px',
              },
              {
                key: 'status',
                header: 'Status',
                renderCell: (_val, row) => <StatusBadge status={row.status} />,
                width: '110px',
              },
              {
                key: 'paymentReference',
                header: 'Reference',
                renderCell: (_val, row) => (
                  <span className="text-gray-500 truncate block max-w-[12rem]">
                    {row.paymentReference ?? row.evidenceNote ?? row.failureReason ?? '—'}
                  </span>
                ),
              },
            ]}
            data={rechargesQuery.data?.data ?? []}
            isLoading={rechargesQuery.isLoading}
            emptyMessage="No recharges yet."
          />
        </ATMCard>
      )}

      {/* Standalone Tokens (mock fallback — no server endpoint yet) */}
      {activeTab === 'standalone' && (
        <ATMCard padding="none" className="overflow-hidden">
          <div className="px-6 py-3 border-b border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10">
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold">
              <Bell className="inline h-3.5 w-3.5" />
              <span>Sample data — per-merchant standalone token balance API pending.</span>
            </p>
          </div>
          <ATMTable<StandaloneTokenEntry>
            columns={[
              {
                key: 'merchantName',
                header: 'Merchant',
                renderCell: (_val, row) => (
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{row.merchantName}</span>
                ),
              },
              {
                key: 'activeTokenId',
                header: 'Active Token',
                renderCell: (_val, row) => (
                  <span className="font-mono text-xs text-gray-500">{row.activeTokenId ?? '—'}</span>
                ),
              },
              {
                key: 'tier',
                header: 'Tier',
                renderCell: (_val, row) => (
                  <span className="text-gray-900 dark:text-gray-200">{row.tier}</span>
                ),
                width: '100px',
              },
              {
                key: 'validFrom',
                header: 'Validity',
                renderCell: (_val, row) => (
                  <span className="text-gray-500">
                    {row.validFrom && row.validTo ? `${row.validFrom} → ${row.validTo}` : '—'}
                  </span>
                ),
                width: '200px',
              },
              {
                key: 'daysRemaining',
                header: 'Days Left',
                renderCell: (_val, row) => (
                  <span className="font-bold text-gray-900 dark:text-gray-200">{row.daysRemaining ?? '—'}</span>
                ),
                width: '90px',
              },
              {
                key: 'status',
                header: 'Status',
                renderCell: (_val, row) => <StatusBadge status={row.status} />,
                width: '100px',
              },
            ]}
            data={MOCK_STANDALONE_TOKENS}
            emptyMessage="No standalone token data available."
          />
        </ATMCard>
      )}

      {/* Action dialog */}
      <ATMModal
        isOpen={dialog !== null}
        onClose={closeDialog}
        title={dialog ? actionTitle(dialog.mode, dialog.merchantName) : ''}
        size="md"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <ATMButton variant="outline" onClick={closeDialog}>Cancel</ATMButton>
            <ATMButton variant="primary" onClick={handleSubmit}>Submit</ATMButton>
          </div>
        }
      >
        {dialog && (
          <div className="space-y-4">
            <ATMTextField
              name="amount"
              label="Token Amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            {dialog.mode === 'recharge-online' && (
              <>
                <ATMTextField
                  name="currencyAmount"
                  label="Currency Amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currencyAmount}
                  onChange={(e) => setCurrencyAmount(e.target.value)}
                  required
                />
                <ATMTextField
                  name="paymentToken"
                  label="Payment Token (gateway-issued)"
                  type="text"
                  value={paymentToken}
                  onChange={(e) => setPaymentToken(e.target.value)}
                  required
                />
              </>
            )}

            {dialog.mode === 'recharge-offline' && (
              <>
                <ATMSelectField
                  name="channel"
                  label="Channel"
                  value={channelLabel}
                  onChange={(val) => setChannelLabel(val ? String(val) : 'Cash')}
                  options={['Cash', 'Wire', 'Check', 'Other'].map((c) => ({ value: c, label: c }))}
                  size="sm"
                />
                <ATMTextField
                  name="evidenceNote"
                  label="Evidence Note (cheque #, wire ref, etc.)"
                  type="text"
                  value={evidenceNote}
                  onChange={(e) => setEvidenceNote(e.target.value)}
                />
              </>
            )}

            {(dialog.mode === 'adjust' || dialog.mode === 'bonus' || dialog.mode === 'refund') && (
              <ATMTextArea
                name="reason"
                label="Reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            )}
          </div>
        )}
      </ATMModal>
    </div>
  );
}

function actionTitle(mode: ActionMode, merchant: string): string {
  switch (mode) {
    case 'recharge-online': return `Recharge Online — ${merchant}`;
    case 'recharge-offline': return `Recharge Offline — ${merchant}`;
    case 'adjust': return `Debit Adjustment — ${merchant}`;
    case 'bonus': return `Add Bonus — ${merchant}`;
    case 'refund': return `Refund — ${merchant}`;
  }
}

export default WalletListPage;
