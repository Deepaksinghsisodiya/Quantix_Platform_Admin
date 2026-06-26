import React, { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ATMButton } from '@/shared/ui';
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

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Auto-Close</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tickets in <span className="font-mono">Resolved</span> for longer than this window are automatically closed.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {!loading && error && <div className="text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Enable auto-close
            </span>
          </label>

          <label className="grid max-w-xs gap-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Days before auto-close (1–365)</span>
            <input
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value, 10) || 0)}
              disabled={!enabled}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>

          <div className="flex justify-end">
            <ATMButton onClick={onSave} loading={saving} leftIcon={<Save className="h-3.5 w-3.5" />}>
              Save changes
            </ATMButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default AutoCloseConfigPage;
