import React, { useEffect, useState } from 'react';
import { CalendarPlus, Power, X, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMTextArea } from '@/shared/ui/ATMTextArea';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { get, put, post, del } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/types/common';

/**
 * 2026-08-10 rebuild — the previous screen was 100% mock (hardcoded MOCK_WINDOWS; the
 * "Apr 5 Upcoming" row was a literal). This talks to the real endpoints:
 *   GET/PUT  /settings/maintenance          — instant master switch (Full window now)
 *   GET/POST /settings/maintenance/windows  — scheduled windows
 *   PUT/DELETE /settings/maintenance/windows/{id}
 * Enterprise merchants get an advance email (+ SMS when enabled) via
 * MaintenancePreNotifyJob at the window's pre-notify offset. Platform staff are never
 * blocked by maintenance — only merchant-facing traffic gets 503.
 */

interface MaintenanceWindow {
  windowId: string;
  title: string;
  description?: string | null;
  severity: string;
  startsAt: string;
  endsAt: string;
  bannerMessage?: string | null;
  preNotifyHours: number;
  preNotifiedAt?: string | null;
  status: 'Upcoming' | 'Active' | 'Completed' | 'Cancelled';
}

interface MaintenanceMode {
  isActive: boolean;
  message?: string | null;
  activatedAt?: string | null;
  scheduledEndAt?: string | null;
}

/** Backend serializes UTC without a zone marker — anchor it before local display. */
function utcDate(value: string): Date {
  return new Date(/Z|[+-]\d\d:\d\d$/.test(value) ? value : value + 'Z');
}
function fmt(value?: string | null): string {
  if (!value) return '—';
  return utcDate(value).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_COLOR: Record<MaintenanceWindow['status'], 'info' | 'success' | 'default' | 'warning'> = {
  Upcoming: 'info',
  Active: 'warning',
  Completed: 'default',
  Cancelled: 'default',
};

const EMPTY_FORM = {
  title: '',
  severity: 'Full',
  startsAt: '',
  endsAt: '',
  bannerMessage: '',
  preNotifyHours: '24',
};

export function MaintenancePage() {
  const [mode, setMode] = useState<MaintenanceMode>({ isActive: false });
  const [windows, setWindows] = useState<MaintenanceWindow[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [toggling, setToggling] = useState(false);

  const load = async () => {
    try {
      const [modeRes, windowsRes] = await Promise.all([
        get<ApiResponse<MaintenanceMode>>('/api/v1/settings/maintenance'),
        get<ApiResponse<MaintenanceWindow[]>>('/api/v1/settings/maintenance/windows'),
      ]);
      setMode(((modeRes as any)?.data ?? { isActive: false }) as MaintenanceMode);
      setWindows(((windowsRes as any)?.data ?? []) as MaintenanceWindow[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load maintenance state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleToggle = async () => {
    const turningOn = !mode.isActive;
    if (turningOn && !window.confirm(
      'Start maintenance NOW? Merchant-facing traffic (cloud services, merchant portal, Bridge sync) gets 503 immediately. Platform staff stay in control.')) return;
    setToggling(true);
    try {
      await put('/api/v1/settings/maintenance', {
        isActive: turningOn,
        message: turningOn ? (form.bannerMessage || 'Emergency maintenance in progress.') : null,
      });
      toast.success(turningOn
        ? 'Maintenance is ON (1-hour window created — extend or end it below). Takes effect within 30 seconds.'
        : 'Maintenance ended. Merchant traffic resumes within 30 seconds.');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to toggle maintenance.');
    } finally {
      setToggling(false);
    }
  };

  const handleSchedule = async () => {
    if (!form.title.trim() || !form.startsAt || !form.endsAt) {
      toast.error('Title, start and end are required.');
      return;
    }
    setScheduling(true);
    try {
      await post('/api/v1/settings/maintenance/windows', {
        title: form.title.trim(),
        severity: form.severity,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        bannerMessage: form.bannerMessage || null,
        preNotifyHours: Number(form.preNotifyHours) || 0,
      });
      toast.success('Maintenance window scheduled.');
      setForm(EMPTY_FORM);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || (e instanceof Error ? e.message : 'Failed to schedule the window.'));
    } finally {
      setScheduling(false);
    }
  };

  const handleCancel = async (w: MaintenanceWindow) => {
    if (!window.confirm(`Cancel "${w.title}"?${w.status === 'Active' ? ' It is ACTIVE — merchant traffic resumes within 30 seconds.' : ''}`)) return;
    try {
      await del(`/api/v1/settings/maintenance/windows/${w.windowId}`);
      toast.success('Window cancelled.');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to cancel the window.');
    }
  };

  const current = windows.filter((w) => w.status === 'Upcoming' || w.status === 'Active');
  const past = windows.filter((w) => w.status === 'Completed' || w.status === 'Cancelled');

  const windowRow = (w: MaintenanceWindow, cancellable: boolean) => (
    <tr key={w.windowId} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <td className="py-3 pr-4">
        <p className="text-sm font-bold text-gray-900 dark:text-white">{w.title}</p>
        {(w.bannerMessage || w.description) && (
          <p className="mt-0.5 max-w-md truncate text-xs text-gray-500 dark:text-gray-400 font-semibold">
            {w.bannerMessage || w.description}
          </p>
        )}
      </td>
      <td className="py-3 pr-4 text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">{fmt(w.startsAt)}</td>
      <td className="py-3 pr-4 text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">{fmt(w.endsAt)}</td>
      <td className="py-3 pr-4">
        <ATMBadge size="sm" color={w.severity === 'Full' ? 'error' : 'info'} label={w.severity === 'Full' ? 'Full (blocks)' : w.severity} />
      </td>
      <td className="py-3 pr-4 whitespace-nowrap">
        <ATMBadge size="sm" color={STATUS_COLOR[w.status]} label={w.status} />
        {w.preNotifiedAt && (
          <p className="mt-1 text-[10px] font-bold text-gray-400" title={fmt(w.preNotifiedAt)}>notified ✓</p>
        )}
      </td>
      <td className="py-3 text-right">
        {cancellable && (
          <button
            type="button"
            onClick={() => handleCancel(w)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
            title="Cancel window"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      <div>
        {/* Title matches the sidebar label. */}
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Maintenance</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
          Schedule platform maintenance or start it immediately. Enterprise merchants get an
          advance email (and SMS when SMS Integration is on); platform staff are never blocked.
        </p>
      </div>

      {loading ? (
        <ATMSkeleton className="h-72 w-full" />
      ) : (
        <>
          {/* Master switch */}
          <ATMCard className="glass-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Power className={mode.isActive ? 'h-5 w-5 text-red-500' : 'h-5 w-5 text-gray-400'} />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {mode.isActive ? 'Maintenance is ACTIVE' : 'Platform is live'}
                  </h2>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
                  {mode.isActive
                    ? `Merchant-facing traffic is receiving 503 since ${fmt(mode.activatedAt)} (until ${fmt(mode.scheduledEndAt)}). Staff access is unaffected.`
                    : 'The emergency switch starts a Full window immediately (1 hour — extend or end below). For planned work, schedule a window instead.'}
                </p>
              </div>
              <ATMButton
                variant={mode.isActive ? 'primary' : 'outline'}
                size="md"
                icon={Power}
                isLoading={toggling}
                onClick={handleToggle}
              >
                {mode.isActive ? 'End maintenance now' : 'Start now'}
              </ATMButton>
            </div>
            {mode.isActive && mode.message && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/30">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <p className="text-xs font-semibold text-red-700 dark:text-red-300">{mode.message}</p>
              </div>
            )}
          </ATMCard>

          {/* Schedule */}
          <ATMCard className="glass-card">
            <div className="flex items-center gap-2 mb-4">
              <CalendarPlus className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Schedule Maintenance</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <ATMTextField name="title" label="Title" placeholder="Database migration"
                value={form.title} onChange={set('title')} />
              <ATMSelectField
                name="severity"
                label="Severity"
                value={form.severity}
                onChange={(val) => setForm((f) => ({ ...f, severity: val ? String(val) : 'Full' }))}
                options={[
                  { label: 'Full — blocks merchant traffic', value: 'Full' },
                  { label: 'Notice — announce only, nothing blocked', value: 'Notice' },
                  { label: 'Partial — announce only (degraded)', value: 'Partial' },
                ]}
              />
              <ATMTextField name="preNotifyHours" label="Pre-notification (hours before)" type="number"
                value={form.preNotifyHours} onChange={set('preNotifyHours')} />
              <ATMTextField name="startsAt" label="Start (your local time)" type="datetime-local"
                value={form.startsAt} onChange={set('startsAt')} />
              <ATMTextField name="endsAt" label="End (your local time)" type="datetime-local"
                value={form.endsAt} onChange={set('endsAt')} />
            </div>
            <div className="mt-6">
              <ATMTextArea
                name="bannerMessage"
                label="Notification & banner message"
                placeholder="Describe the maintenance activity and expected impact — sent to Enterprise merchants in advance and shown on the 503 response."
                value={form.bannerMessage}
                onChange={set('bannerMessage')}
                rows={3}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <ATMButton variant="primary" size="md" icon={CalendarPlus} isLoading={scheduling} onClick={handleSchedule}>
                Schedule
              </ATMButton>
            </div>
          </ATMCard>

          <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950/20">
            <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              Standalone merchants are unaffected — their POS runs locally. Only Enterprise
              merchants using cloud services (and the merchant self-service portal) experience
              downtime during a Full window.
            </p>
          </div>

          {/* Windows */}
          <ATMCard className="glass-card">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
              Upcoming & Active
            </h2>
            {current.length === 0 ? (
              <p className="py-6 text-center text-sm font-semibold text-gray-400">No upcoming maintenance scheduled.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <th className="py-2 pr-4">Window</th>
                      <th className="py-2 pr-4">Start</th>
                      <th className="py-2 pr-4">End</th>
                      <th className="py-2 pr-4">Severity</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>{current.map((w) => windowRow(w, true))}</tbody>
                </table>
              </div>
            )}
          </ATMCard>

          {past.length > 0 && (
            <ATMCard className="glass-card">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                Past Windows
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <tbody>{past.slice(0, 20).map((w) => windowRow(w, false))}</tbody>
                </table>
              </div>
            </ATMCard>
          )}
        </>
      )}
    </div>
  );
}

export default MaintenancePage;
