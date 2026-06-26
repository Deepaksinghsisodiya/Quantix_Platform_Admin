import React, { useMemo } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Cog,
  Key,
  Loader2,
  Mail,
  RefreshCw,
  RotateCw,
  Zap,
  Building2,
} from 'lucide-react';

import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge, BadgeColor } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';

export type SignupStatus = 'PendingVerification' | 'PendingPayment' | 'Provisioning' | 'Active' | 'Failed';

export interface SignupEntry {
  id: string;
  businessName: string;
  merchantType: 'Enterprise' | 'Standalone';
  businessNature: string;
  email: string;
  status: SignupStatus;
  submittedAt: string;
  error: string | null;
}

interface SignupQueuePageProps {
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
  signups: SignupEntry[];
  filteredSignups: SignupEntry[];
  autoRefresh: boolean;
  setAutoRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  acceptCandidate: SignupEntry | null;
  setAcceptCandidate: (candidate: SignupEntry | null) => void;
  accepting: boolean;
  confirmAccept: () => Promise<void>;
  handleAction: (id: string, action: string) => Promise<void>;
}

const STATUS_CONFIG: Record<SignupStatus, { label: string; color: BadgeColor }> = {
  PendingVerification: { label: 'Pending Verification', color: 'warning' },
  PendingPayment: { label: 'Pending Payment', color: 'primary' },
  Provisioning: { label: 'Provisioning', color: 'purple' },
  Active: { label: 'Active', color: 'success' },
  Failed: { label: 'Failed', color: 'danger' },
};

const PIPELINE_STAGES: { key: SignupStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'PendingVerification', label: 'Pending Verification', icon: <Mail className="h-5 w-5" />, color: 'bg-amber-500' },
  { key: 'PendingPayment', label: 'Pending Payment', icon: <Clock className="h-5 w-5" />, color: 'bg-blue-500' },
  { key: 'Provisioning', label: 'Provisioning', icon: <Cog className="h-5 w-5" />, color: 'bg-indigo-500' },
  { key: 'Active', label: 'Active', icon: <CheckCircle2 className="h-5 w-5" />, color: 'bg-emerald-500' },
];

export const SignupQueuePage: React.FC<SignupQueuePageProps> = ({
  isLoading,
  isFetching,
  refetch,
  signups,
  filteredSignups,
  autoRefresh,
  setAutoRefresh,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  searchQuery,
  setSearchQuery,
  acceptCandidate,
  setAcceptCandidate,
  accepting,
  confirmAccept,
  handleAction,
}) => {
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of signups) {
      map[s.status] = (map[s.status] ?? 0) + 1;
    }
    return map;
  }, [signups]);

  const columns = useMemo<ATMTableColumn<SignupEntry>[]>(
    () => [
      {
        key: 'id',
        header: 'ID',
        renderCell: (val) => (
          <span className="font-mono text-xs text-surface-500 dark:text-surface-400">{val}</span>
        ),
        width: '100px',
      },
      {
        key: 'businessName',
        header: 'Business Name',
        renderCell: (val) => (
          <span className="font-bold text-surface-900 dark:text-surface-100">{val}</span>
        ),
      },
      {
        key: 'merchantType',
        header: 'Type',
        renderCell: (val) => (
          <ATMBadge color={val === 'Enterprise' ? 'purple' : 'primary'} label={val} size="sm" />
        ),
        width: '120px',
      },
      {
        key: 'status',
        header: 'Status',
        renderCell: (val) => {
          const cfg = STATUS_CONFIG[val as SignupStatus];
          return <ATMBadge color={cfg.color} dot label={cfg.label} size="sm" />;
        },
        width: '160px',
      },
      {
        key: 'submittedAt',
        header: 'Submitted',
        renderCell: (val) => (
          <span className="text-sm font-semibold text-surface-500 dark:text-surface-400">
            {formatDate(val, 'short')}
          </span>
        ),
        width: '120px',
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        renderCell: (_, row) => {
          const { id, status, merchantType } = row;
          return (
            <div className="flex gap-1.5 justify-end">
              {status === 'PendingVerification' && (
                <ATMButton size="sm" variant="secondary" onClick={() => handleAction(id, 'resend')}>
                  <Mail className="mr-1 h-3.5 w-3.5" />
                  Resend
                </ATMButton>
              )}
              {status === 'PendingPayment' && (
                <ATMButton size="sm" variant="secondary" onClick={() => handleAction(id, 'bypass')}>
                  <Zap className="mr-1 h-3.5 w-3.5 animate-pulse" />
                  Bypass
                </ATMButton>
              )}
              {status !== 'Active' && (
                <ATMButton size="sm" variant="primary" onClick={() => handleAction(id, 'accept')}>
                  <Check className="mr-1 h-3.5 w-3.5" />
                  Accept
                </ATMButton>
              )}
              {(status === 'Provisioning' || status === 'Failed') && merchantType === 'Enterprise' && (
                <ATMButton size="sm" variant="secondary" onClick={() => handleAction(id, 'retry')}>
                  <RotateCw className="mr-1 h-3.5 w-3.5" />
                  Retry
                </ATMButton>
              )}
              {(status === 'Provisioning' || status === 'Failed') && merchantType === 'Standalone' && (
                <ATMButton size="sm" variant="secondary" onClick={() => handleAction(id, 'generate-token')}>
                  <Key className="mr-1 h-3.5 w-3.5" />
                  Generate Token
                </ATMButton>
              )}
              {status === 'Active' && (
                <span className="inline-flex items-center gap-1 text-xs text-success-600 dark:text-success-400 font-bold uppercase">
                  <Check className="h-3.5 w-3.5" />
                  Complete
                </span>
              )}
            </div>
          );
        },
        width: '240px',
      },
    ],
    [handleAction]
  );

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 pb-10 animate-fade-in w-full">
      {/* Premium Page Header */}
      <ATMPageHeader
        title="Signup Queue"
        subtitle="Monitor and manage self-service merchant registration workflows."
        icon={Building2}
        iconColor="theme"
      />

      {/* Pipeline Visualization */}
      <div className="grid gap-4 sm:grid-cols-4">
        {PIPELINE_STAGES.map((stage, idx) => (
          <div key={stage.key} className="relative">
            <ATMCard padding="md" className="glass-card">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl text-white', stage.color)}>
                  {stage.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums text-surface-900 dark:text-surface-100">
                    {counts[stage.key] ?? 0}
                  </p>
                  <p className="text-xs font-semibold text-surface-500 dark:text-surface-400">{stage.label}</p>
                </div>
              </div>
            </ATMCard>
            {idx < PIPELINE_STAGES.length - 1 && (
              <div className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 sm:block">
                <ArrowRight className="h-4 w-4 text-surface-300 dark:text-surface-650" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ATMTable integration */}
      <div className="flex-1 overflow-hidden w-full bg-zen-surface rounded-2xl border border-gray-100 dark:border-gray-800">
        <ATMTable<SignupEntry>
          columns={columns}
          data={filteredSignups}
          isLoading={isLoading}
          isFetching={isFetching}
          density="compact"
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search signups by business name or email..."
          extraHeaderActions={
            <div className="flex items-center gap-4">
              <ATMSwitch
                name="autoRefresh"
                label="Auto-refresh"
                checked={autoRefresh}
                onChange={(checked) => setAutoRefresh(checked)}
                size="sm"
              />
              <ATMButton
                variant="secondary"
                size="sm"
                icon={isFetching ? Loader2 : RefreshCw}
                onClick={refetch}
                disabled={isLoading || isFetching}
              >
                Refresh
              </ATMButton>
            </div>
          }
          filterConfig={{
            fields: [
              {
                key: 'status',
                label: 'Status',
                type: 'select',
                options: [
                  { label: 'All Statuses', value: '' },
                  { label: 'Pending Verification', value: 'PendingVerification' },
                  { label: 'Pending Payment', value: 'PendingPayment' },
                  { label: 'Provisioning', value: 'Provisioning' },
                  { label: 'Active', value: 'Active' },
                  { label: 'Failed', value: 'Failed' },
                ],
              },
              {
                key: 'merchantType',
                label: 'Merchant Type',
                type: 'select',
                options: [
                  { label: 'All Types', value: '' },
                  { label: 'Enterprise', value: 'Enterprise' },
                  { label: 'Standalone', value: 'Standalone' },
                ],
              },
            ],
            values: {
              status: statusFilter,
              merchantType: typeFilter,
            },
            onChange: (key, val) => {
              if (key === 'status') setStatusFilter(val ? String(val) : '');
              if (key === 'merchantType') setTypeFilter(val ? String(val) : '');
            },
            onReset: () => {
              setStatusFilter('');
              setTypeFilter('');
            },
          }}
          emptyMessage="No signups match the current filters."
        />
      </div>

      {/* Accept Confirmation Modal */}
      <ATMModal
        isOpen={!!acceptCandidate}
        onClose={() => !accepting && setAcceptCandidate(null)}
        title="Accept Merchant Signup"
        footer={
          <div className="flex justify-end gap-2">
            <ATMButton
              variant="secondary"
              size="sm"
              onClick={() => setAcceptCandidate(null)}
              disabled={accepting}
            >
              Cancel
            </ATMButton>
            <ATMButton
              variant="primary"
              size="sm"
              onClick={confirmAccept}
              isLoading={accepting}
            >
              Accept & Email Credentials
            </ATMButton>
          </div>
        }
      >
        {acceptCandidate && (
          <div className="space-y-4 font-medium text-surface-600 dark:text-surface-400">
            <p>
              Accepting <strong>{acceptCandidate.businessName}</strong> will:
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm pl-2">
              <li>Activate the merchant for token issuance + service access.</li>
              <li>Provision a single-use merchant-self login.</li>
              <li>
                Email a temporary password to{' '}
                <code className="rounded bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 text-xs text-primary-600 dark:text-accent-400 font-mono">
                  {acceptCandidate.email}
                </code>
                .
              </li>
            </ul>
            <p className="text-xs text-surface-500 italic mt-2">
              The temporary password is single-use; the merchant will be required to set a new one on first login.
            </p>
          </div>
        )}
      </ATMModal>
    </div>
  );
};

export default SignupQueuePage;
