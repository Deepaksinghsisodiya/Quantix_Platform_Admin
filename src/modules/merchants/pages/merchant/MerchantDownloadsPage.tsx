/**
 * Pass 40l (2026-05-25) â€” Merchant Downloads page.
 *
 * Lists local apps, manuals, and release notes available to the merchant's plan.
 * Backed by GET /api/v1/merchant-self/downloads which calls
 * IDownloadService.GetMerchantDownloadsAsync with feature-gate filtering.
 */
import {
  useGetSelfDownloadsQuery,
  useLazyGetSelfDownloadUrlQuery,
} from '@/modules/merchants/services/merchantSelfApi';
import { toast } from 'sonner';
import { Download, AlertCircle } from 'lucide-react';

interface DownloadPackageDto {
  packageId: string;
  appName: string;
  platform: string;
  version: string;
  downloadUrl: string;
  fileSize: number;
  releaseNotes: string | null;
  isLatest: boolean;
  releasedAt: string;
}

interface MerchantDownloadsDto {
  packages: DownloadPackageDto[];
  gatedPackages: { packageId: string; appName: string; reason: string }[];
}

export default function MerchantDownloadsPage() {
  const downloads = useGetSelfDownloadsQuery();

  const [getDownloadUrl, { isLoading: isFetchingUrl }] = useLazyGetSelfDownloadUrlQuery();

  async function handleDownload(packageId: string) {
    try {
      const res = await getDownloadUrl(packageId).unwrap();
      const url = res.data?.downloadUrl;
      if (url) window.open(url, '_blank', 'noopener');
      else toast.error('No download URL returned.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Download failed.');
    }
  }

  const data = downloads.data?.data as MerchantDownloadsDto | undefined;
  const available = data?.packages ?? [];
  const gated = data?.gatedPackages ?? [];


  // Group by app name; sort latest first within each group.
  const grouped = available.reduce<Record<string, DownloadPackageDto[]>>((acc, p) => {
    (acc[p.appName] ||= []).push(p);
    return acc;
  }, {});
  for (const k of Object.keys(grouped)) {
    grouped[k]!.sort((a, b) => +new Date(b.releasedAt) - +new Date(a.releasedAt));
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Downloads</h1>
        <p className="mt-1 text-sm text-surface-500">
          Local apps, manuals, and release notes available for your plan.
        </p>
      </header>

      {downloads.isLoading && (
        <div className="rounded-xl bg-white dark:bg-surface-800 p-6 text-center text-sm text-surface-500 shadow-sm">
          Loading…
        </div>
      )}

      {!downloads.isLoading && available.length === 0 && (
        <div className="rounded-xl bg-white dark:bg-surface-800 p-6 text-center text-sm text-surface-500 shadow-sm">
          No downloads are available for your plan yet.
        </div>
      )}

      {Object.entries(grouped).map(([appName, packages]) => (
        <div key={appName} className="rounded-xl bg-white dark:bg-surface-800 shadow-sm">
          <div className="border-b border-surface-200 dark:border-surface-700 p-4">
            <h2 className="text-sm font-semibold">{appName}</h2>
          </div>
          <ul className="divide-y divide-surface-100 dark:divide-surface-700/50">
            {packages.map((p) => (
              <li key={p.packageId} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.platform}</span>
                    <span className="font-mono text-xs text-surface-500">v{p.version}</span>
                    {p.isLatest && (
                      <span className="rounded-full bg-primary-100 dark:bg-primary-900/30 px-2 py-0.5 text-xs font-medium text-primary-700 dark:text-primary-300">
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-surface-500">
                    Released {new Date(p.releasedAt).toLocaleDateString()} Â· {formatFileSize(p.fileSize)}
                  </p>
                  {p.releaseNotes && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-primary-600 hover:underline">
                        Release notes
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-surface-50 dark:bg-surface-900 p-3 text-xs text-surface-600">
                        {p.releaseNotes}
                      </pre>
                    </details>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload(p.packageId)}
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
        <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Plan-gated downloads
              </h3>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                The following downloads require an upgraded plan:
              </p>
              <ul className="mt-2 list-inside list-disc text-xs text-amber-700 dark:text-amber-300">
                {gated.map((g) => (
                  <li key={g.packageId}>
                    <strong>{g.appName}</strong> â€” {g.reason}
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
