import React, { useMemo } from 'react';
import { FormikProps } from 'formik';
import { Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge, BadgeColor } from '@/shared/ui/ATMBadge';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn, RowAction } from '@/shared/components/ATMTable/ATMTable';
import { cn } from '@/lib/utils/cn';
import WebhookForm from '../Form/WebhookForm';
import type { WebhookSubscription, WebhookDeliveryLog } from '../types/webhook.types';

interface WebhookFormValues {
  eventType: string;
  webhookUrl: string;
  description: string;
}

interface WebhookListProps {
  tab: 'subscriptions' | 'deliveries';
  onTabChange: (tab: 'subscriptions' | 'deliveries') => void;
  subscriptions: readonly WebhookSubscription[];
  isSubscriptionsLoading: boolean;
  deliveries: readonly WebhookDeliveryLog[];
  isDeliveriesLoading: boolean;
  onToggleSubscription: (id: string, isActive: boolean) => void;
  onRotateSecret: (id: string) => void;
  onDeleteSubscription: (id: string) => void;
  onRetryDelivery: (id: string) => void;
  formikProps: FormikProps<WebhookFormValues>;
  isCreating: boolean;
}

export const WebhookList: React.FC<WebhookListProps> = ({
  tab,
  onTabChange,
  subscriptions,
  isSubscriptionsLoading,
  deliveries,
  isDeliveriesLoading,
  onToggleSubscription,
  onRotateSecret,
  onDeleteSubscription,
  onRetryDelivery,
  formikProps,
  isCreating,
}) => {
  // Subscription columns
  const subscriptionColumns: ATMTableColumn<WebhookSubscription>[] = useMemo(
    () => [
      {
        key: 'eventType',
        header: 'Event',
        renderCell: (val) => (
          <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
            {val}
          </span>
        ),
      },
      {
        key: 'webhookUrl',
        header: 'URL',
        renderCell: (val) => (
          <span className="text-xs text-gray-600 dark:text-gray-400 block truncate max-w-xs md:max-w-md" title={val}>
            {val}
          </span>
        ),
      },
      {
        key: 'isActive',
        header: 'Active',
        renderCell: (_val, row) => (
          <ATMSwitch
            name={`sub-active-${row.subscriptionId}`}
            checked={row.isActive}
            onChange={(checked) => onToggleSubscription(row.subscriptionId, checked)}
            size="sm"
          />
        ),
        width: '80px',
      },
      {
        key: 'createdAt',
        header: 'Created',
        renderCell: (val) => (
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {new Date(val).toLocaleDateString()}
          </span>
        ),
        width: '120px',
      },
    ],
    [onToggleSubscription]
  );

  // Subscription row actions
  const subscriptionActions = useMemo(
    () =>
      (row: WebhookSubscription): RowAction<WebhookSubscription>[] => [
        {
          label: 'Rotate Secret',
          onClick: (r) => onRotateSecret(r.subscriptionId),
          variant: 'default',
        },
        {
          label: 'Delete',
          icon: Trash2,
          onClick: (r) => onDeleteSubscription(r.subscriptionId),
          variant: 'danger',
        },
      ],
    [onRotateSecret, onDeleteSubscription]
  );

  // Delivery Log status mapping
  const STATUS_VARIANT: Record<string, BadgeColor> = {
    Delivered: 'success',
    Failed: 'danger',
    Pending: 'warning',
  };

  // Delivery log columns
  const deliveryColumns: ATMTableColumn<WebhookDeliveryLog>[] = useMemo(
    () => [
      {
        key: 'eventType',
        header: 'Event',
        renderCell: (val) => (
          <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
            {val}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        renderCell: (val) => (
          <ATMBadge color={STATUS_VARIANT[val] ?? 'warning'} size="sm" label={val} />
        ),
        width: '100px',
      },
      {
        key: 'attemptCount',
        header: 'Attempts',
        renderCell: (_val, row) => (
          <span className="text-xs text-gray-600 dark:text-gray-400 font-bold">
            {row.attemptCount} / {row.maxAttempts}
          </span>
        ),
        width: '100px',
      },
      {
        key: 'httpStatusCode',
        header: 'HTTP',
        renderCell: (val) => (
          <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">
            {val ?? '—'}
          </span>
        ),
        width: '80px',
      },
      {
        key: 'deliveredAt',
        header: 'Delivered',
        renderCell: (val) => (
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {val ? new Date(val).toLocaleString() : '—'}
          </span>
        ),
        width: '180px',
      },
    ],
    []
  );

  // Delivery log row actions (Retry only on Failed status)
  const deliveryActions = useMemo(
    () =>
      (row: WebhookDeliveryLog): RowAction<WebhookDeliveryLog>[] => {
        if (row.status === 'Failed') {
          return [
            {
              label: 'Retry',
              icon: RefreshCw,
              onClick: (r) => onRetryDelivery(r.deliveryId),
            },
          ];
        }
        return [];
      },
    [onRetryDelivery]
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Webhooks</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
          Manage outbound webhook subscriptions and inspect delivery attempts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-gray-250 bg-gray-55/40 p-1 dark:border-gray-800 w-fit">
        <button
          type="button"
          onClick={() => onTabChange('subscriptions')}
          className={cn(
            'px-4 py-2 text-sm font-bold capitalize transition-all rounded-lg',
            tab === 'subscriptions'
              ? 'bg-accent-600 text-white dark:bg-accent-500 shadow-sm'
              : 'text-gray-650 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-800/80',
          )}
        >
          Subscriptions ({isSubscriptionsLoading ? '...' : subscriptions.length})
        </button>
        <button
          type="button"
          onClick={() => onTabChange('deliveries')}
          className={cn(
            'px-4 py-2 text-sm font-bold capitalize transition-all rounded-lg',
            tab === 'deliveries'
              ? 'bg-accent-600 text-white dark:bg-accent-500 shadow-sm'
              : 'text-gray-650 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-800/80',
          )}
        >
          Delivery Log
        </button>
      </div>

      {tab === 'subscriptions' ? (
        <div className="flex flex-col gap-6">
          <WebhookForm formikProps={formikProps} isSubmitting={isCreating} />
          
          <ATMCard padding="none" className="glass-card overflow-hidden">
            <ATMTable<WebhookSubscription>
              columns={subscriptionColumns}
              data={subscriptions}
              isLoading={isSubscriptionsLoading}
              emptyMessage="No subscriptions yet. Create one above."
              rowActions={subscriptionActions}
            />
          </ATMCard>
        </div>
      ) : (
        <ATMCard padding="none" className="glass-card overflow-hidden">
          <ATMTable<WebhookDeliveryLog>
            columns={deliveryColumns}
            data={deliveries}
            isLoading={isDeliveriesLoading}
            emptyMessage="No deliveries logged yet."
            rowActions={deliveryActions}
          />
        </ATMCard>
      )}
    </div>
  );
};

export default WebhookList;
