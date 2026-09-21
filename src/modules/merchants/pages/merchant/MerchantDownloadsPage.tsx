/**
 * Merchant Downloads (Pass 40l, 2026-05-25; corrected 2026-09-04).
 *
 * Backed by GET /api/v1/merchant-self/downloads. Every ACTIVE package comes back with an
 * `isEligible` flag and, when the merchant's enabled features don't satisfy its gates, an
 * `upgradeHint` naming what is missing. The page splits on that flag.
 *
 * 2026-09-04: the page used to read a `gatedPackages` array the server never sent and
 * listed every package — gated ones included — with a Download button; the URL route on
 * the server handed those out too. Both fixed. It also had no error state: a failed
 * request looked exactly like "nothing published".
 */
import { AlertCircle, Download, Lock, RefreshCw } from 'lucide-react';
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

export default function MerchantDownloadsPage() {
  const downloads = useGetSelfDownloadsQuery();
  const [getDownloadUrl, { isLoading: isFetchingUrl }] = useLazyGetSelfDownloadUrlQuery();

  async function handleDownload(pkg: MerchantSelfDownloadPackage) {
    try {
      const res = await getDownloadUrl(pkg.packageId).unwrap();
      const url = res.data?.downloadUrl;
      if (url) window.open(url, '_blank', 'noopener');
      else toast.error('The server returned no download address for this package.');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'The download could not be started.'));
    }
  }

  const packages = downloads.data?.data?.packages ?? [];
  const available = packages.filter((p) => p.isEligible);
  const gated = packages.filter((p) => !p.isEligible);

  // Group by app name; latest release first within each group.
  const grouped = available.reduce<Record<string, MerchantSelfDownloadPackage[]>>((acc, p) => {
    (acc[p.appName] ||= []).push(p);
    return acc;
  }, {});
  for (const key of Object.keys(grouped)) {
    grouped[key]!.sort((a, b) => +new Date(b.releasedAt) - +new Date(a.releasedAt));
  }
  const appNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

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
        <div className="space-y-4">
          {[0, 1, 2].map((g) => (
            <div key={g} className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 dark:border-gray-800/80 dark:bg-[#13151a]/95">
              <ATMSkeleton width="30%" height="16px" className="rounded-lg" />
              <div className="mt-4 space-y-2">
                <ATMSkeleton height="52px" className="rounded-xl" />
                <ATMSkeleton height="52px" className="rounded-xl" />
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
          <ATMEmptyState title="Nothing has been published for download yet." />
        </div>
      )}

      {loaded && packages.length > 0 && available.length === 0 && (
        <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#13151a]">
          <ATMEmptyState
            title="No downloads are included in your plan yet"
            description="What each one needs is listed below."
          />
        </div>
      )}

      {appNames.map((appName) => (
        <div key={appName} className="rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-[#13151a]">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{appName}</h2>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {grouped[appName]!.map((p) => (
              <li
                key={p.packageId}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-slate-100">{p.platform}</span>
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">v{p.version}</span>
                    {p.isLatest && (
                      <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Released {new Date(p.releasedAt).toLocaleDateString()} · {formatFileSize(p.fileSize)}
                  </p>
                  {p.releaseNotes && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-primary-600 hover:underline">
                        Release notes
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                        {p.releaseNotes}
                      </pre>
                    </details>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void handleDownload(p)}
                  disabled={isFetchingUrl}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {gated.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/10">
          <div className="flex items-start gap-2">
            <Lock className="mt-0.5 h-4 w-4 text-amber-600" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Not included in your plan
              </h3>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                These downloads need features your plan does not currently include:
              </p>
              <ul className="mt-2 list-inside list-disc text-xs text-amber-700 dark:text-amber-300">
                {gated.map((p) => (
                  <li key={p.packageId}>
                    <strong>
                      {p.appName} {p.version}
                    </strong>{' '}
                    ({p.platform}) — {p.upgradeHint ?? 'requires a feature your plan does not include.'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}