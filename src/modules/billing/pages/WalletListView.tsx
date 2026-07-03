import React from 'react';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn, RowAction } from '@/shared/components/ATMTable/ATMTable';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { formatDate } from '@/lib/utils/formatDate';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMTextArea } from '@/shared/ui/ATMTextArea';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { FormikProvider } from 'formik';
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
  X,
} from 'lucide-react';
import type { Wallet, WalletRecharge } from '@/lib/api/wallet';
import type { ActionMode, ActionDialogState, StandaloneTokenEntry } from './WalletListWrapper';
import { MOCK_STANDALONE_TOKENS } from './WalletListWrapper';

interface WalletListViewProps {
  activeTab: 'enterprise' | 'recharges' | 'standalone';
  setActiveTab: (tab: 'enterprise' | 'recharges' | 'standalone') => void;
  dialog: ActionDialogState | null;
  wallets: readonly Wallet[];
  recharges: readonly WalletRecharge[];
  isLoadingWallets: boolean;
  isErrorWallets: boolean;
  refetchWallets: () => void;
  isLoadingRecharges: boolean;
  isErrorRecharges: boolean;
  refetchRecharges: () => void;
  alertLevel: (balance: number) => 'Critical' | 'Low' | 'OK';
  lowCount: number;
  criticalCount: number;
  canRecharge: boolean;
  openDialog: (mode: ActionMode, w: Wallet, merchantName: string) => void;
  closeDialog: () => void;
  formik: any;
  isPending: boolean;
}

export const WalletListView: React.FC<WalletListViewProps> = ({
  activeTab,
  setActiveTab,
  dialog,
  wallets,
  recharges,
  isLoadingWallets,
  isErrorWallets,
  refetchWallets,
  isLoadingRecharges,
  isErrorRecharges,
  refetchRecharges,
  alertLevel,
  lowCount,
  criticalCount,
  canRecharge,
  openDialog,
  closeDialog,
  formik,
  isPending,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <ATMPageHeader
        title={
          <div className="flex items-center gap-2">
            <WalletIcon className="h-6 w-6 text-indigo-500" />
            <span>Wallet &amp; Token Balance</span>
            {isLoadingWallets && <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />}
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
          {isErrorWallets ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <AlertTriangle className="h-10 w-10 text-red-500" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Failed to load wallets.</p>
              <ATMButton variant="primary" size="sm" onClick={refetchWallets} icon={RefreshCw}>
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
              isLoading={isLoadingWallets}
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
            data={recharges}
            isLoading={isLoadingRecharges}
            emptyMessage="No recharges yet."
          />
        </ATMCard>
      )}

      {/* Standalone Tokens */}
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
            <ATMButton variant="primary" onClick={() => formik.handleSubmit()} isLoading={isPending}>Submit</ATMButton>
          </div>
        }
      >
        {dialog && (
          <FormikProvider value={formik}>
            <div className="space-y-4">
              <ATMTextField
                name="amount"
                label="Token Amount"
                type="number"
                min="0"
                step="0.01"
                value={formik.values.amount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
                error={formik.touched.amount && formik.errors.amount}
              />

              {dialog.mode === 'recharge-online' && (
                <>
                  <ATMTextField
                    name="currencyAmount"
                    label="Currency Amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formik.values.currencyAmount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    error={formik.touched.currencyAmount && formik.errors.currencyAmount}
                  />
                  <ATMTextField
                    name="paymentToken"
                    label="Payment Token (gateway-issued)"
                    type="text"
                    value={formik.values.paymentToken}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    error={formik.touched.paymentToken && formik.errors.paymentToken}
                  />
                </>
              )}

              {dialog.mode === 'recharge-offline' && (
                <>
                  <ATMSelectField
                    name="channelLabel"
                    label="Channel"
                    value={formik.values.channelLabel}
                    onChange={(val) => formik.setFieldValue('channelLabel', val ? String(val) : 'Cash')}
                    options={['Cash', 'Wire', 'Check', 'Other'].map((c) => ({ value: c, label: c }))}
                    size="sm"
                    error={formik.touched.channelLabel && formik.errors.channelLabel}
                  />
                  <ATMTextField
                    name="evidenceNote"
                    label="Evidence Note (cheque #, wire ref, etc.)"
                    type="text"
                    value={formik.values.evidenceNote}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.evidenceNote && formik.errors.evidenceNote}
                  />
                </>
              )}

              {(dialog.mode === 'adjust' || dialog.mode === 'bonus' || dialog.mode === 'refund') && (
                <ATMTextArea
                  name="reason"
                  label="Reason"
                  rows={3}
                  value={formik.values.reason}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  error={formik.touched.reason && formik.errors.reason}
                />
              )}
            </div>
          </FormikProvider>
        )}
      </ATMModal>
    </div>
  );
};

function actionTitle(mode: ActionMode, merchant: string): string {
  switch (mode) {
    case 'recharge-online': return `Recharge Online — ${merchant}`;
    case 'recharge-offline': return `Recharge Offline — ${merchant}`;
    case 'adjust': return `Debit Adjustment — ${merchant}`;
    case 'bonus': return `Add Bonus — ${merchant}`;
    case 'refund': return `Refund — ${merchant}`;
  }
}
