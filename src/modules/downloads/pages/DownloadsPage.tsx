/**
 * Downloads — the catalogue of installers, manuals and release notes published to
 * merchants. Rebuilt 2026-09-04 on the real /api/v1/downloads routes.
 *
 * Tombstone — the previous page was fiction end to end, and none of it is coming back:
 * seven hardcoded desktop packages with invented download counts and hardware requirements;
 * a mobile-app tracker with App Store / Play Store links for apps that do not exist; a
 * "Distribution" tab declaring https://quantix.io/downloads Live and auto-update
 * notifications Enabled, bundle buttons that did nothing and a Copy Link that copied this
 * portal's own address; a hardware-compatibility guide; and "Upload Package" / "New Version"
 * buttons that toasted "coming soon". Meanwhile the real catalogue was empty and every
 * merchant's Downloads page read "nothing available".
 *
 * Title is the sidebar label, verbatim. Actions are gated by `downloads` edit permission
 * (Admin bypasses, as everywhere); the API enforces `downloads.manage` behind them.
 */
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Package, Pencil, Plus, Power, RotateCcw } from 'lucide-react';
import { ATMBadge, ATMButton, ATMCard, ATMEmptyState, ATMErrorState, ATMSkeleton } from '@/shared/ui';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { usePermission } from '@/shared/hooks/usePermission';
import { apiErrorMessage } from '@/lib/utils/apiError';
import { formatFileSize } from '@/shared/utils/formatFileSize';
import { PackageFormModal } from '../components/PackageFormModal';
import {
  toSavePayload,
  useDeactivateDownloadPackageMutation,
  useGetDownloadPackagesQuery,
  useUpdateDownloadPackageMutation,
  type DownloadPackage,
} from '../services/downloadsApi';

interface AppGroup {
  readonly appName: string;
  readonly items: readonly DownloadPackage[];
}

function DownloadsPage() {
  const { canEdit } = usePermission();
  const canManage = canEdit('downloads');

  const list = useGetDownloadPackagesQuery();
  const [deactivate, deactivateState] = useDeactivateDownloadPackageMutation();
  const [update, updateState] = useUpdateDownloadPackageMutation();
  const [modal, setModal] = useState<{ open: boolean; editing: DownloadPackage | null }>({
    open: false,
    editing: null,
  });
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const packages = list.data?.data ?? [];

  const groups = useMemo<AppGroup[]>(() => {
    const byApp = new Map<string, DownloadPackage[]>();
    for (const p of packages) {
      const bucket = byApp.get(p.appName);
      if (bucket) bucket.push(p);
      else byApp.set(p.appName, [p]);
    }
    return [...byApp.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([appName, items]) => ({
        appName,
        items: [...items].sort((a, b) => +new Date(b.releasedAt) - +new Date(a.releasedAt)),
      }));
  }, [packages]);

  const suggestions = useMemo(
    () => ({
      appNames: [...new Set(packages.map((p) => p.appName))].sort((a, b) => a.localeCompare(b)),
      platforms: [...new Set(packages.map((p) => p.platform))].sort((a, b) => a.localeCompare(b)),
    }),
    [packages],
  );

  const busy = deactivateState.isLoading || updateState.isLoading;
  const activeCount = packages.filter((p) => p.isActive).length;

  const openPublish = () => setModal({ open: true, editing: null });
  const openEdit = (pkg: DownloadPackage) => setModal({ open: true, editing: pkg });
  const closeModal = () => setModal({ open: false, editing: null });

  async function handleDeactivate(pkg: DownloadPackage) {
    try {
      await deactivate(pkg.packageId).unwrap();
      toast.success(`${pkg.appName} ${pkg.version} (${pkg.platform}) is no longer visible to merchants.`);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'The package could not be deactivated.'));
    } finally {
      setConfirmId(null);
    }
  }

  async function handleReactivate(pkg: DownloadPackage) {
    try {
      await update({ packageId: pkg.packageId, dto: toSavePayload(pkg, { isActive: true }) }).unwrap();
      toast.success(`${pkg.appName} ${pkg.version} (${pkg.platform}) is visible to merchants again.`);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'The package could not be reactivated.'));
    }
  }

  const columns: ATMTableColumn<DownloadPackage>[] = [
    {
      key: 'platform',
      header: 'Platform',
      renderCell: (_v, p) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">{p.platform}</span>
      ),
    },
    {
      key: 'version',
      header: 'Version',
      renderCell: (_v, p) => (
        <>
          <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{p.version}</span>
          {p.isLatest && (
            <ATMBadge variant="success" size="sm" className="ml-2">
              Latest
            </ATMBadge>
          )}
        </>
      ),
    },
    {
      key: 'releasedAt',
      header: 'Released',
      renderCell: (_v, p) => (
        <span className="tabular-nums text-slate-600 dark:text-slate-400">
          {new Date(p.releasedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'fileSize',
      header: 'Size',
      renderCell: (_v, p) => (
        <span className="tabular-nums text-slate-600 dark:text-slate-400">{formatFileSize(p.fileSize)}</span>
      ),
    },
    {
      key: 'requiredFeatures',
      header: 'Requires',
      renderCell: (_v, p) =>
        p.requiredFeatures.length === 0 ? (
          <span className="text-xs text-slate-500 dark:text-slate-400">Every merchant</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {p.requiredFeatures.map((g) => (
              <ATMBadge key={g.featureCode} variant="info" size="sm">
                {g.featureName}
              </ATMBadge>
            ))}
          </div>
        ),
    },
    {
      key: 'isActive',
      header: 'Status',
      renderCell: (_v, p) => (
        <ATMBadge variant={p.isActive ? 'success' : 'default'} size="sm" dot>
          {p.isActive ? 'Active' : 'Inactive'}
        </ATMBadge>
      ),
    },
    {
      key: '',
      header: '',
      align: 'right',
      width: '240px',
      renderCell: (_v, p) => (
        <div className="flex items-center justify-end gap-1">
          <a
            href={p.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={p.downloadUrl}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/30"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open file
          </a>
          {canManage && (
            <>
              <ATMButton
                variant="ghost"
                size="sm"
                leftIcon={<Pencil className="h-3.5 w-3.5" />}
                onClick={() => openEdit(p)}
                disabled={busy}
              >
                Edit
              </ATMButton>
              {p.isActive ? (
                confirmId === p.packageId ? (
                  <>
                    <ATMButton
                      variant="danger"
                      size="sm"
                      onClick={() => void handleDeactivate(p)}
                      loading={deactivateState.isLoading}
                    >
                      Confirm deactivate
                    </ATMButton>
                    <ATMButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmId(null)}
                      disabled={deactivateState.isLoading}
                    >
                      Keep
                    </ATMButton>
                  </>
                ) : (
                  <ATMButton
                    variant="ghost"
                    size="sm"
                    leftIcon={<Power className="h-3.5 w-3.5" />}
                    onClick={() => setConfirmId(p.packageId)}
                    disabled={busy}
                  >
                    Deactivate
                  </ATMButton>
                )
              ) : (
                <ATMButton
                  variant="ghost"
                  size="sm"
                  leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                  onClick={() => void handleReactivate(p)}
                  disabled={busy}
                >
                  Reactivate
                </ATMButton>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Header */}
      <ATMPageHeader
        icon={Package}
        iconColor="theme"
        title="Downloads"
        subtitle={
          <>
            Installers, manuals and release notes published to merchants. Merchants see active
            packages whose feature gates they satisfy.
            {packages.length > 0 && (
              <>
                {' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {activeCount} active
                </span>{' '}
                of {packages.length}.
              </>
            )}
          </>
        }
        extraActions={
          canManage && (
            <ATMButton variant="primary" size="md" leftIcon={<Plus className="h-4 w-4" />} onClick={openPublish}>
              Publish package
            </ATMButton>
          )
        }
      />

      {list.isLoading && (
        <div className="space-y-4" aria-busy="true" aria-label="Loading packages">
          {[0, 1, 2].map((g) => (
            <div key={g} className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 dark:border-gray-800/80 dark:bg-[#13151a]/95">
              <ATMSkeleton width="200px" height="16px" className="rounded-lg" />
              <div className="mt-4 space-y-3">
                {[0, 1, 2].map((r) => (
                  <div key={r} className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <ATMSkeleton width="60%" height="14px" className="rounded" />
                      <ATMSkeleton width="35%" height="12px" className="mt-1.5 rounded" />
                    </div>
                    <ATMSkeleton width="80px" height="30px" className="rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {list.isError && (
        <ATMErrorState
          title="Downloads could not be loaded"
          message={apiErrorMessage(list.error, 'The API did not return the package catalogue.')}
          onRetry={() => void list.refetch()}
        />
      )}

      {!list.isLoading && !list.isError && packages.length === 0 && (
        <ATMEmptyState
          icon={Package}
          title="No packages published"
          description="Nothing has been published yet, so every merchant's Downloads page is empty."
          actionLabel={canManage ? 'Publish package' : undefined}
          onAction={canManage ? openPublish : undefined}
        />
      )}

      {groups.map(({ appName, items }) => (
        <ATMCard
          key={appName}
          title={appName}
          action={
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {items.length} {items.length === 1 ? 'package' : 'packages'}
            </span>
          }
          padding="none"
          className="overflow-hidden"
        >
          <ATMTable
            columns={columns}
            data={items}
            density="compact"
            emptyMessage="No packages."
          />
        </ATMCard>
      ))}

      <PackageFormModal open={modal.open} editing={modal.editing} suggestions={suggestions} onClose={closeModal} />
    </div>
  );
}

export default DownloadsPage;