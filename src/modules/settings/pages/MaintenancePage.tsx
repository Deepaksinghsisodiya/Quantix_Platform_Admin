import React, { useState } from 'react';
import { Calendar, AlertTriangle, X, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMTextArea } from '@/shared/ui/ATMTextArea';
import { ATMBadge, BadgeColor } from '@/shared/ui/ATMBadge';

interface MaintenanceWindow {
  id: string;
  startTime: string;
  endTime: string;
  message: string;
  preNotificationHours: number;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
}

const MOCK_WINDOWS: MaintenanceWindow[] = [
  { id: '1', startTime: '2026-04-05T02:00', endTime: '2026-04-05T06:00', message: 'Database migration and performance optimization. Expected downtime: 4 hours.', preNotificationHours: 48, status: 'Upcoming' },
  { id: '2', startTime: '2026-03-15T01:00', endTime: '2026-03-15T03:00', message: 'Security patches and SSL certificate renewal.', preNotificationHours: 24, status: 'Completed' },
  { id: '3', startTime: '2026-03-01T03:00', endTime: '2026-03-01T05:00', message: 'Infrastructure scaling and load balancer reconfiguration.', preNotificationHours: 72, status: 'Completed' },
];

const STATUS_VARIANT: Record<string, BadgeColor> = {
  Upcoming: 'warning',
  Completed: 'success',
  Cancelled: 'muted',
};

export function MaintenancePage() {
  const [windows, setWindows] = useState<MaintenanceWindow[]>(MOCK_WINDOWS);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');
  const [preNotificationHours, setPreNotificationHours] = useState(24);

  const upcoming = windows.filter((w) => w.status === 'Upcoming');
  const past = windows.filter((w) => w.status !== 'Upcoming');

  const handleSchedule = () => {
    if (!startTime || !endTime || !message) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success('Maintenance window scheduled');
    setStartTime('');
    setEndTime('');
    setMessage('');
    setPreNotificationHours(24);
  };

  const handleCancelWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: 'Cancelled' as const } : w))
    );
    toast.success('Maintenance window cancelled');
  };

  const formatDateTime = (dt: string) => {
    return new Date(dt).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Maintenance Windows
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
          Schedule platform maintenance and notify Enterprise merchants in advance.
        </p>
      </div>

      {/* Schedule form */}
      <ATMCard title="Schedule Maintenance" className="glass-card">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-2">
          <ATMTextField
            name="startTime"
            type="datetime-local"
            label="Start Date & Time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <ATMTextField
            name="endTime"
            type="datetime-local"
            label="End Date & Time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <div className="md:col-span-2">
            <ATMTextArea
              name="message"
              label="Notification Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Describe the maintenance activity and expected impact..."
            />
          </div>
          <ATMTextField
            name="preNotificationHours"
            type="number"
            label="Pre-Notification (hours before)"
            value={preNotificationHours}
            onChange={(e) => setPreNotificationHours(parseInt(e.target.value) || 24)}
            min={1}
            max={168}
          />
        </div>
        <div className="mt-6 flex gap-3">
          <ATMButton variant="primary" size="md" icon={Calendar} onClick={handleSchedule}>
            Schedule
          </ATMButton>
          <ATMButton variant="outline" size="md" onClick={() => { setStartTime(''); setEndTime(''); setMessage(''); }}>
            Cancel
          </ATMButton>
        </div>
      </ATMCard>

      {/* Info note */}
      <div className="flex items-start gap-3 rounded-xl border border-accent-200 bg-accent-50/50 p-4 dark:border-accent-850 dark:bg-accent-950/20">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent-600 dark:text-accent-400" />
        <p className="text-sm text-accent-700 dark:text-accent-300 font-semibold">
          Standalone merchants are unaffected by maintenance windows. Only Enterprise merchants connected to cloud services will experience downtime.
        </p>
      </div>

      {/* Upcoming windows */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Upcoming Windows
        </h2>
        {upcoming.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-800">
            <Clock className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" />
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-550 font-bold">No upcoming maintenance scheduled</p>
          </div>
        ) : (
          <ATMCard padding="none" className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-250 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30 text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3.5">Start</th>
                    <th className="px-4 py-3.5">End</th>
                    <th className="px-4 py-3.5">Message</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {upcoming.map((w) => (
                    <tr key={w.id} className="transition-colors hover:bg-gray-55/40 dark:hover:bg-gray-800/10">
                      <td className="px-4 py-3 tabular-nums text-gray-900 dark:text-white font-bold">{formatDateTime(w.startTime)}</td>
                      <td className="px-4 py-3 tabular-nums text-gray-900 dark:text-white font-bold">{formatDateTime(w.endTime)}</td>
                      <td className="max-w-xs truncate px-4 py-3 text-gray-600 dark:text-gray-400 font-semibold">{w.message}</td>
                      <td className="px-4 py-3"><ATMBadge color={STATUS_VARIANT[w.status]} size="sm" label={w.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <ATMButton variant="ghost" size="sm" onClick={() => handleCancelWindow(w.id)}>
                          <X className="h-3.5 w-3.5 text-red-500" />
                        </ATMButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ATMCard>
        )}
      </div>

      {/* Past windows */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Past Windows
        </h2>
        <ATMCard padding="none" className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-250 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30 text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3.5">Start</th>
                  <th className="px-4 py-3.5">End</th>
                  <th className="px-4 py-3.5">Message</th>
                  <th className="px-4 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {past.map((w) => (
                  <tr key={w.id} className="transition-colors hover:bg-gray-55/40 dark:hover:bg-gray-800/10">
                    <td className="px-4 py-3 tabular-nums text-gray-900 dark:text-white font-bold">{formatDateTime(w.startTime)}</td>
                    <td className="px-4 py-3 tabular-nums text-gray-900 dark:text-white font-bold">{formatDateTime(w.endTime)}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-gray-600 dark:text-gray-400 font-semibold">{w.message}</td>
                    <td className="px-4 py-3"><ATMBadge color={STATUS_VARIANT[w.status]} size="sm" label={w.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ATMCard>
      </div>
    </div>
  );
}

export default MaintenancePage;
