/**
 * PackageFormModal — publish or edit one download package (2026-09-04).
 *
 * One form and one payload (SaveDownloadPackage) for both create and edit, mirroring the
 * server's single SaveDownloadPackageDto; the feature gates are part of the same save.
 * Field rules mirror DownloadService.ValidateAsync so the operator hears about a problem
 * before the round trip; the server stays the authority (duplicates, unknown codes) and
 * its message is shown verbatim when it refuses.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ATMButton, ATMCheckbox, ATMModal, ATMTextArea, ATMTextField } from '@/shared/ui';
import { useGetFeatureCatalogQuery } from '@/modules/settings/services/settingsApi';
import { apiErrorMessage } from '@/lib/utils/apiError';
import { formatFileSize } from '@/shared/utils/formatFileSize';
import {
  useCreateDownloadPackageMutation,
  useUpdateDownloadPackageMutation,
  type DownloadPackage,
  type SaveDownloadPackage,
} from '../services/downloadsApi';

/** Column lengths from DownloadPackageConfiguration — the server rejects longer values. */
const LIMITS = { appName: 100, platform: 50, version: 50, downloadUrl: 500 } as const;

interface FormState {
  appName: string;
  platform: string;
  version: string;
  downloadUrl: string;
  /** Kept as text so a half-typed value never snaps to 0. */
  fileSize: string;
  releaseNotes: string;
  isLatest: boolean;
  isActive: boolean;
  /** YYYY-MM-DD. */
  releasedAt: string;
  requiredFeatureCodes: string[];
}

type Errors = Partial<Record<keyof FormState, string>>;

function fromPackage(pkg: DownloadPackage | null): FormState {
  if (!pkg) {
    return {
      appName: '',
      platform: '',
      version: '',
      downloadUrl: '',
      fileSize: '',
      releaseNotes: '',
      isLatest: true,
      isActive: true,
      releasedAt: new Date().toISOString().slice(0, 10),
      requiredFeatureCodes: [],
    };
  }
  return {
    appName: pkg.appName,
    platform: pkg.platform,
    version: pkg.version,
    downloadUrl: pkg.downloadUrl,
    fileSize: String(pkg.fileSize),
    releaseNotes: pkg.releaseNotes ?? '',
    isLatest: pkg.isLatest,
    isActive: pkg.isActive,
    releasedAt: pkg.releasedAt.slice(0, 10),
    requiredFeatureCodes: pkg.requiredFeatures.map((g) => g.featureCode),
  };
}

function validate(f: FormState): Errors {
  const e: Errors = {};
  const tooLong = (n: number) => `Must be ${n} characters or fewer.`;

  if (!f.appName.trim()) e.appName = 'App name is required.';
  else if (f.appName.trim().length > LIMITS.appName) e.appName = tooLong(LIMITS.appName);

  if (!f.platform.trim()) e.platform = 'Platform is required.';
  else if (f.platform.trim().length > LIMITS.platform) e.platform = tooLong(LIMITS.platform);

  if (!f.version.trim()) e.version = 'Version is required.';
  else if (f.version.trim().length > LIMITS.version) e.version = tooLong(LIMITS.version);

  const url = f.downloadUrl.trim();
  if (!url) e.downloadUrl = 'Download URL is required.';
  else if (url.length > LIMITS.downloadUrl) e.downloadUrl = tooLong(LIMITS.downloadUrl);
  else {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('scheme');
    } catch {
      e.downloadUrl = 'Must be an absolute http(s) address.';
    }
  }

  const size = f.fileSize.trim() === '' ? 0 : Number(f.fileSize);
  if (!Number.isInteger(size) || size < 0) e.fileSize = 'A whole number of bytes, 0 or more.';

  if (!f.releasedAt || Number.isNaN(Date.parse(f.releasedAt))) e.releasedAt = 'Release date is required.';

  return e;
}

function toPayload(f: FormState): SaveDownloadPackage {
  const notes = f.releaseNotes.trim();
  return {
    appName: f.appName.trim(),
    platform: f.platform.trim(),
    version: f.version.trim(),
    downloadUrl: f.downloadUrl.trim(),
    fileSize: f.fileSize.trim() === '' ? 0 : Number(f.fileSize),
    releaseNotes: notes ? notes : null,
    isLatest: f.isLatest,
    isActive: f.isActive,
    // A date pick is a day, not an instant; pin it to midnight UTC so the server never
    // shifts it by its own offset.
    releasedAt: `${f.releasedAt}T00:00:00Z`,
    requiredFeatureCodes: f.requiredFeatureCodes,
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** null = publish a new package. */
  editing: DownloadPackage | null;
  /** Names already in the catalogue, offered as completions — not a fixed list. */
  suggestions: { readonly appNames: readonly string[]; readonly platforms: readonly string[] };
}

export function PackageFormModal({ open, onClose, editing, suggestions }: Props) {
  const [form, setForm] = useState<FormState>(() => fromPackage(editing));
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(fromPackage(editing));
      setErrors({});
      setServerError(null);
    }
  }, [open, editing]);

  const catalog = useGetFeatureCatalogQuery(undefined, { skip: !open });
  const features = useMemo(
    () =>
      [...(catalog.data?.data ?? [])]
        .filter((f) => f.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.featureName.localeCompare(b.featureName)),
    [catalog.data],
  );

  const [create, createState] = useCreateDownloadPackageMutation();
  const [update, updateState] = useUpdateDownloadPackageMutation();
  const saving = createState.isLoading || updateState.isLoading;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleFeature = (code: string) =>
    setForm((prev) => ({
      ...prev,
      requiredFeatureCodes: prev.requiredFeatureCodes.includes(code)
        ? prev.requiredFeatureCodes.filter((c) => c !== code)
        : [...prev.requiredFeatureCodes, code],
    }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setServerError(null);
    if (Object.keys(nextErrors).length > 0) return;

    const dto = toPayload(form);
    try {
      if (editing) {
        await update({ packageId: editing.packageId, dto }).unwrap();
        toast.success(`Saved ${dto.appName} ${dto.version} (${dto.platform}).`);
      } else {
        await create(dto).unwrap();
        toast.success(
          dto.isActive
            ? `Published ${dto.appName} ${dto.version} for ${dto.platform}.`
            : `Saved ${dto.appName} ${dto.version} for ${dto.platform} as inactive.`,
        );
      }
      onClose();
    } catch (err) {
      const message = apiErrorMessage(err, 'The package could not be saved.');
      setServerError(message);
      toast.error(message);
    }
  }

  const sizeNumber = Number(form.fileSize);
  const sizeHint =
    form.fileSize.trim() !== '' && Number.isFinite(sizeNumber) && sizeNumber >= 0
      ? `${formatFileSize(sizeNumber)} — shown to merchants next to the download.`
      : 'In bytes, from the file’s properties. Shown to merchants next to the download.';

  return (
    <ATMModal
      open={open}
      onClose={onClose}
      closeOnOutsideClick={!saving}
      closeOnEsc={!saving}
      title={editing ? 'Edit package' : 'Publish package'}
      subtitle={
        editing
          ? `${editing.appName} ${editing.version} · ${editing.platform}`
          : 'An installer, manual or release-notes file hosted at a URL you control.'
      }
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ATMTextField
            label="App name"
            required
            size="md"
            value={form.appName}
            onChange={(e) => set('appName', e.target.value)}
            error={errors.appName}
            placeholder="POS Terminal"
            list="download-app-names"
            maxLength={LIMITS.appName}
            autoComplete="off"
          />
          <ATMTextField
            label="Platform"
            required
            size="md"
            value={form.platform}
            onChange={(e) => set('platform', e.target.value)}
            error={errors.platform}
            placeholder="Windows x64"
            list="download-platforms"
            maxLength={LIMITS.platform}
            autoComplete="off"
          />
          <ATMTextField
            label="Version"
            required
            size="md"
            value={form.version}
            onChange={(e) => set('version', e.target.value)}
            error={errors.version}
            placeholder="1.0.0"
            maxLength={LIMITS.version}
            autoComplete="off"
          />
          <ATMTextField
            label="Release date"
            required
            size="md"
            type="date"
            value={form.releasedAt}
            onChange={(e) => set('releasedAt', e.target.value)}
            error={errors.releasedAt}
          />
        </div>

        <ATMTextField
          label="Download URL"
          required
          size="md"
          type="url"
          value={form.downloadUrl}
          onChange={(e) => set('downloadUrl', e.target.value)}
          error={errors.downloadUrl}
          placeholder="https://files.example.com/pos-terminal-1.0.0-win-x64.zip"
          helperText="Where the file is hosted. The platform stores the address only; a merchant who clicks Download is sent there."
          maxLength={LIMITS.downloadUrl}
          autoComplete="off"
        />

        <ATMTextField
          label="File size"
          size="md"
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={form.fileSize}
          onChange={(e) => set('fileSize', e.target.value)}
          error={errors.fileSize}
          helperText={sizeHint}
          placeholder="0"
        />

        <ATMTextArea
          name="releaseNotes"
          label="Release notes"
          value={form.releaseNotes}
          onChange={(e) => set('releaseNotes', e.target.value)}
          rows={4}
          placeholder="What changed in this version — merchants can expand this under the download."
        />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <ATMCheckbox
            name="isLatest"
            label="Latest version for this app and platform"
            helperText="Only one package per app + platform can be latest; the previous one is unmarked."
            checked={form.isLatest}
            onChange={(checked) => set('isLatest', checked)}
          />
          <ATMCheckbox
            name="isActive"
            label="Visible to merchants"
            helperText="Untick to keep it on file without publishing it yet."
            checked={form.isActive}
            onChange={(checked) => set('isActive', checked)}
          />
        </div>

        <fieldset className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <legend className="px-1 text-[13px] font-semibold text-gray-700 dark:text-gray-300">
            Required features
          </legend>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Leave every box unticked to publish to all merchants. Otherwise a merchant must hold
            every ticked feature to see and download the package. Standalone merchants hold
            features only after applying a licence token on their POS — so a base installer
            should not be gated.
          </p>
          {catalog.isLoading && (
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Loading feature catalog…</p>
          )}
          {catalog.isError && (
            <p role="alert" className="mt-3 text-xs font-semibold text-red-600 dark:text-red-400">
              {apiErrorMessage(
                catalog.error,
                'The feature catalog could not be loaded — gates cannot be edited right now.',
              )}
            </p>
          )}
          {features.length > 0 && (
            <div className="mt-3 grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              {features.map((f) => (
                <ATMCheckbox
                  key={f.featureCode}
                  name={`feature-${f.featureCode}`}
                  label={
                    <span className="text-sm text-gray-800 dark:text-gray-200">
                      {f.featureName}{' '}
                      <span className="font-mono text-xs text-gray-400">{f.featureCode}</span>
                    </span>
                  }
                  checked={form.requiredFeatureCodes.includes(f.featureCode)}
                  onChange={() => toggleFeature(f.featureCode)}
                />
              ))}
            </div>
          )}
        </fieldset>

        {serverError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
          >
            {serverError}
          </div>
        )}

        <datalist id="download-app-names">
          {suggestions.appNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <datalist id="download-platforms">
          {suggestions.platforms.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
          <ATMButton type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </ATMButton>
          <ATMButton type="submit" variant="primary" loading={saving}>
            {editing ? 'Save changes' : form.isActive ? 'Publish' : 'Save as inactive'}
          </ATMButton>
        </div>
      </form>
    </ATMModal>
  );
}

export default PackageFormModal;
