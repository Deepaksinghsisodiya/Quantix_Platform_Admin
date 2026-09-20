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
    <div className="w-full space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Downloads</h1>
        <p className="mt-1 text-sm text-surface-500">
          Local apps, manuals, and release notes available for your plan.
        </p>
      </header>

      {downloads.isLoading && (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-surface-500 shadow-sm dark:bg-surface-800">
          Loading…
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
        <div className="rounded-xl bg-white p-6 text-center text-sm text-surface-500 shadow-sm dark:bg-surface-800">
          Nothing has been published for download yet.
        </div>
      )}

      {loaded && packages.length > 0 && available.length === 0 && (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-surface-500 shadow-sm dark:bg-surface-800">
          No downloads are included in your plan yet — what each one needs is listed below.
        </div>
      )}

      {appNames.map((appName) => (
        <div key={appName} className="rounded-xl bg-white shadow-sm dark:bg-surface-800">
          <div className="border-b border-surface-200 p-4 dark:border-surface-700">
            <h2 className="text-sm font-semibold">{appName}</h2>
          </div>
          <ul className="divide-y divide-surface-100 dark:divide-surface-700/50">
            {grouped[appName]!.map((p) => (
              <li
                key={p.packageId}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.platform}</span>
                    <span className="font-mono text-xs text-surface-500">v{p.version}</span>
                    {p.isLatest && (
                      <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-surface-500">
                    Released {new Date(p.releasedAt).toLocaleDateString()} · {formatFileSize(p.fileSize)}
                  </p>
                  {p.releaseNotes && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-primary-600 hover:underline">
                        Release notes
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-surface-50 p-3 text-xs text-surface-600 dark:bg-surface-900">
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
