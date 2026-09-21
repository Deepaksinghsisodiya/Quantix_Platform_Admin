/**
 * Merchant Downloads (Pass 40l, 2026-05-25; corrected 2026-09-04).
 * UI polish (2026-09-21): theme-gradient group headers and locked cards, fixed
 * platform icons (Windows used to show a printer), per-row download spinner,
 * aligned meta chips, and a cleaner release-notes disclosure.
 *
 * Backed by GET /api/v1/merchant-self/downloads. Every ACTIVE package comes back with an
 * `isEligible` flag and, when the merchant's enabled features don't satisfy its gates, an
 * `upgradeHint` naming what is missing. The page splits on that flag.
 */
import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Box,
  CalendarDays,
  ChevronDown,
  CircleAlert,
  Download,
  FileArchive,
  FileDown,
  FolderOpen,
  Laptop,
  Loader2,
  Lock,
  Monitor,
  PackageOpen,
  Printer,
  RefreshCw,
  Smartphone,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMEmptyState, ATMSkeleton } from '@/shared/ui';
import {
  useGetSelfDownloadsQuery,
  useLazyGetSelfDownloadUrlQuery,
  type MerchantSelfDownloadPackage,
} from '@/modules/merchants/services/merchantSelfApi';
import { apiErrorMessage } from '@/lib/utils/apiError';
import { formatFileSize } from '@/shared/utils/formatFileSize';
import { cn } from '@/lib/utils/cn';

function platformMeta(platform: string): { icon: LucideIcon; tone: string } {
  const p = platform.toLowerCase();
  if (p.includes('android') || p.includes('ios'))
    return { icon: Smartphone, tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' };
  if (p.includes('linux'))
    return { icon: Monitor, tone: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' };
  if (p.includes('mac') || p.includes('apple'))
    return { icon: Laptop, tone: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
  if (p.includes('windows') || p.includes('win'))
    return { icon: Laptop, tone: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' };
  if (p.includes('pos'))
    return { icon: Monitor, tone: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' };
  if (p.includes('printer'))
    return { icon: Printer, tone: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' };
  return { icon: Box, tone: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
}

export default function MerchantDownloadsPage() {
  const downloads = useGetSelfDownloadsQuery();
  const [getDownloadUrl, { isLoading: isFetchingUrl }] = useLazyGetSelfDownloadUrlQuery();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function handleDownload(pkg: MerchantSelfDownloadPackage) {
    setDownloadingId(pkg.packageId);
    try {
      const res = await getDownloadUrl(pkg.packageId).unwrap();
      const url = res.data?.downloadUrl;
      if (url) window.open(url, '_blank', 'noopener');
      else toast.error('The server returned no download address for this package.');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'The download could not be started.'));
    } finally {
      setDownloadingId(null);
    }
  }

  const packages = downloads.data?.data?.packages ?? [];
  const available = packages.filter((p) => p.isEligible);
  const gated = packages.filter((p) => !p.isEligible);

  // Group by app name; latest release first within each group.
  const { grouped, appNames } = useMemo(() => {
    const g = available.reduce<Record<string, MerchantSelfDownloadPackage[]>>((acc, p) => {
      (acc[p.appName] ||= []).push(p);
      return acc;
    }, {});
    for (const key of Object.keys(g)) {
      g[key]!.sort((a, b) => +new Date(b.releasedAt) - +new Date(a.releasedAt));
    }
    return { grouped: g, appNames: Object.keys(g).sort((a, b) => a.localeCompare(b)) };
  }, [available]);

  const loaded = !downloads.isLoading && !downloads.isError;

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={Download}
        iconColor="theme"
        title="Downloads"
        subtitle="Local apps, manuals, and release notes available for your plan."
      />

      {downloads.isLoading && (
        <div className="space-y-5">
          {[0, 1, 2].map((g) => (
            <div
              key={g}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-[#13151a]"
            >
              <div className="flex items-center gap-2.5">
                <ATMSkeleton variant="circle" width="32px" height="32px" />
                <ATMSkeleton variant="text" width="30%" />
              </div>
              <div className="mt-4 space-y-3">
                {[0, 1].map((r) => (
                  <div
                    key={r}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"
                  >
                    <ATMSkeleton variant="circle" width="44px" height="44px" />
                    <div className="flex-1 space-y-2">
                      <ATMSkeleton variant="text" width="55%" />
                      <ATMSkeleton variant="text" width="35%" />
                    </div>
                    <ATMSkeleton variant="text" width="96px" height="36px" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {downloads.isError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/30">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              {apiErrorMessage(downloads.error, 'Your downloads could not be loaded.')}
            </p>
            <button
              type="button"
              onClick={() => void downloads.refetch()}
              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-red-700 underline dark:text-red-300"
            >
              <RefreshCw className="h-3 w-3" />
              Try again
            </button>
          </div>
        </div>
      )}

      {loaded && packages.length === 0 && (
        <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#13151a]">
          <ATMEmptyState icon={<FileDown className="h-8 w-8 text-slate-300 dark:text-slate-600" />} title="Nothing has been published for download yet." />
        </div>
      )}

      {loaded && packages.length > 0 && available.length === 0 && (
        <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#13151a]">
          <ATMEmptyState
            icon={<Lock className="h-8 w-8 text-amber-300 dark:text-amber-700" />}
            title="No downloads are included in your plan yet"
            description="What each one needs is listed below."
          />
        </div>
      )}

      {appNames.map((appName) => (
        <AvailableGroup
          key={appName}
          appName={appName}
          releases={grouped[appName]!}
          busyId={downloadingId}
          onDownload={(pkg) => void handleDownload(pkg)}
        />
      ))}

      {gated.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
              <CircleAlert className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Not included in your plan</h2>
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                Upgrade your plan to unlock these downloads
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gated.map((p) => (
              <GatedCard key={p.packageId} pkg={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Available downloads, grouped per app ────────────────────────────────── */

function AvailableGroup({
  appName,
  releases,
  busyId,
  onDownload,
}: {
  appName: string;
  releases: readonly MerchantSelfDownloadPackage[];
  busyId: string | null;
  onDownload: (pkg: MerchantSelfDownloadPackage) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-[#13151a]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent px-4 py-3 dark:border-slate-800 dark:from-slate-900/40 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
            <FolderOpen className="h-4 w-4" />
          </span>
          <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">{appName}</h2>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-100 px-2.5 py-1 text-[11px] font-semibold text-surface-500 dark:bg-surface-800 dark:text-surface-400">
          <PackageOpen className="h-3 w-3" />
          {releases.length} release{releases.length === 1 ? '' : 's'}
        </span>
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {releases.map((p) => (
          <PackageRow
            key={p.packageId}
            pkg={p}
            busy={busyId === p.packageId}
            onDownload={() => onDownload(p)}
          />
        ))}
      </ul>
    </section>
  );
}

function PackageRow({
  pkg: p,
  busy,
  onDownload,
}: {
  pkg: MerchantSelfDownloadPackage;
  busy: boolean;
  onDownload: () => void;
}) {
  const meta = platformMeta(p.platform);
  const Icon = meta.icon;

  return (
    <li className="flex flex-col gap-3 p-4 transition-colors hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between sm:p-5 dark:hover:bg-slate-900/40">
      <div className="flex items-start gap-3">
        <span className={cn('mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', meta.tone)}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">{p.platform}</span>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              v{p.version}
            </span>
            {p.isLatest && (
              <span className="inline-flex rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                Latest
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              Released {new Date(p.releasedAt).toLocaleDateString()}
            </span>
            {p.fileSize > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <FileArchive className="h-3 w-3" />
                {formatFileSize(p.fileSize)}
              </span>
            )}
          </div>
          {p.releaseNotes && (
            <details className="group/notes mt-2">
              <summary className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400">
                Release notes
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-open/notes:rotate-180" />
              </summary>
              <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 p-3 font-sans text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                {p.releaseNotes}
              </pre>
            </details>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onDownload}
        disabled={busy}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition-colors hover:bg-primary-700 disabled:opacity-60 sm:self-auto"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Opening…
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download
          </>
        )}
      </button>
    </li>
  );
}

/* ── Gated packages (require a plan upgrade) ─────────────────────────────── */

function GatedCard({ pkg: p }: { pkg: MerchantSelfDownloadPackage }) {
  const meta = platformMeta(p.platform);
  const Icon = meta.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md hover:shadow-amber-200/40 dark:border-amber-700/60 dark:bg-[#13151a] dark:hover:shadow-none">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', meta.tone)}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{p.platform}</p>
            <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{p.appName}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-md bg-surface-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-surface-600 dark:bg-surface-800 dark:text-surface-300">
          v{p.version}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
        <CalendarDays className="h-3.5 w-3.5" />
        Released {new Date(p.releasedAt).toLocaleDateString()}
        {p.fileSize > 0 && (
          <>
            <span className="mx-1">·</span>
            <FileArchive className="h-3.5 w-3.5" />
            {formatFileSize(p.fileSize)}
          </>
        )}
      </div>
      <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold leading-relaxed text-amber-800 dark:text-amber-300">
        <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {p.upgradeHint ?? 'Requires a feature your plan does not currently include.'}
      </p>
      <button
        type="button"
        disabled
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 opacity-70 dark:border-amber-700 dark:bg-transparent dark:text-amber-300"
      >
        <Lock className="h-4 w-4" />
        Locked
      </button>
    </div>
  );
}