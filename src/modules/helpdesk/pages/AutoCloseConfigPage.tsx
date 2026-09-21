import React, { useEffect, useState } from 'react';
import { Save, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { ATMCard, ATMButton, ATMSkeleton } from '@/shared/ui';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { getAutoCloseConfig, updateAutoCloseConfig } from '@/lib/api/helpdesk';

/**
 * Round_16 Pass 15: Auto-close configuration page. Talks to /api/v1/helpdesk/auto-close-config
 * (Pass 8) which is now backed by PlatformSetting keys
 * `helpdesk.auto_close_resolved_days` / `helpdesk.auto_close_enabled` instead of a hardcoded
 * 14-day window.
 */
function AutoCloseConfigPage() {
  const [days, setDays] = useState(14);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAutoCloseConfig()
      .then((res) => {
        if (res.success) {
          setDays(res.data.autoCloseDays);
          setEnabled(res.data.enabled);
        } else {
          setError((res as { error?: string }).error ?? 'Failed to load configuration.');
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const onSave = async () => {
    if (days < 1 || days > 365) {
      toast.error('Auto-close days must be between 1 and 365.');
      return;
    }
    setSaving(true);
    try {
      const res = await updateAutoCloseConfig({ autoCloseDays: days, enabled });
      if (res.success) {
        toast.success('Configuration saved.');
      } else {
        toast.error((res as { error?: string }).error ?? 'Save failed');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10';

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={Timer}
        iconColor="theme"
        title="Auto-Close"
        subtitle={
          <>Tickets in <span className="font-mono">Resolved</span> for longer than this window are automatically closed.</>
        }
      />

      {loading && (
        <div className="max-w-2xl">
          <ATMCard title="Auto-close configuration">
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-pulse rounded border border-slate-200 bg-surface-100 dark:bg-surface-850" />
                <ATMSkeleton width="50%" height="14px" className="rounded" />
              </div>
              <div className="space-y-2">
                <ATMSkeleton width="35%" height="14px" className="rounded" />
                <ATMSkeleton height="40px" className="rounded-lg" />
              </div>
              <ATMSkeleton width="120px" height="40px" className="rounded-lg" />
            </div>
          </ATMCard>
        </div>
      )}

      {!loading && error && <div className="text-sm text-rose-600">{error}</div>}

      {!loading && !error && (
        <ATMCard title="Auto-close configuration" className="max-w-2xl">
          <div className="grid gap-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Enable auto-close
              </span>
            </label>

            <label className="grid max-w-xs gap-1 text-sm">
              <span className="text-slate-600 dark:text-slate-400">Days before auto-close (1–365)</span>
              <input
                type="number"
                min={1}
                max={365}
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value, 10) || 0)}
                disabled={!enabled}
                className={`${inputClass} disabled:opacity-50`}
              />
            </label>

            <div className="flex justify-end">
              <ATMButton onClick={onSave} loading={saving} leftIcon={<Save className="h-3.5 w-3.5" />}>
                Save changes
              </ATMButton>
            </div>
          </div>
        </ATMCard>
      )}
    </div>
  );
}

export default AutoCloseConfigPage;