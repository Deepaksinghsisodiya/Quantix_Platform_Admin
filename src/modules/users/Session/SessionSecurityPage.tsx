import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Monitor, Clock, Shield, LogOut, Save } from 'lucide-react';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import type { SessionPolicy, ActiveSession } from '../types/user.types';

interface SessionSecurityPageProps {
  sessions: readonly ActiveSession[];
  policy: SessionPolicy;
  setPolicyField: <K extends keyof SessionPolicy>(field: K, value: SessionPolicy[K]) => void;
  onSavePolicy: () => void;
  onTerminateSession: (session: ActiveSession) => void;
  isSavingPolicy: boolean;
  isTerminating: boolean;
}

const relativeTime = (dateStr: string): string => {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch (e) {
    return dateStr;
  }
};

export const SessionSecurityPage: React.FC<SessionSecurityPageProps> = ({
  sessions,
  policy,
  setPolicyField,
  onSavePolicy,
  onTerminateSession,
  isSavingPolicy,
  isTerminating,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ATMButton variant="ghost" size="sm" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-4 w-4" />
        </ATMButton>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Session Security
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Manage active sessions, timeout policies, and IP restrictions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Policy Settings */}
        <div className="space-y-6">
          <ATMCard className="glass-card">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-5 w-5 text-gray-400" />
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Session Policy</h3>
            </div>

            <div className="space-y-5">
              {/* Timeout minutes */}
              <ATMTextField
                name="timeoutMinutes"
                type="number"
                label="Inactivity Timeout (minutes)"
                value={policy.timeoutMinutes}
                onChange={(e) => setPolicyField('timeoutMinutes', parseInt(e.target.value) || 30)}
                min={5}
                max={480}
                size="sm"
              />
              <p className="text-xs text-gray-400 dark:text-gray-550 font-semibold px-1">
                Default: 30 minutes. Range: 5–480 minutes.
              </p>

              {/* Concurrent session limit */}
              <ATMSelectField
                name="maxConcurrentSessions"
                label="Max Concurrent Sessions"
                value={policy.maxConcurrentSessions}
                onChange={(val) => setPolicyField('maxConcurrentSessions', Number(val))}
                options={[
                  { label: '1 (Strictest)', value: 1 },
                  { label: '2', value: 2 },
                  { label: '3', value: 3 },
                  { label: '5', value: 5 },
                  { label: 'Unlimited', value: 0 },
                ]}
                placeholder="ATMSelect Limit"
                helperText="New login terminates oldest session if limit exceeded."
                size="sm"
              />

              {/* Force logout toggle */}
              <div className="flex items-center justify-between py-3 border-t border-gray-150 dark:border-gray-800">
                <div className="max-w-[70%]">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Force logout on password change</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-550 font-semibold mt-0.5">Terminate all sessions when a user changes their password</p>
                </div>
                <ATMSwitch
                  name="forceLogoutOnPasswordChange"
                  checked={policy.forceLogoutOnPasswordChange}
                  onChange={(checked) => setPolicyField('forceLogoutOnPasswordChange', checked)}
                />
              </div>

              <ATMButton
                variant="primary"
                size="sm"
                className="w-full mt-2"
                icon={Save}
                iconPosition="left"
                isLoading={isSavingPolicy}
                onClick={onSavePolicy}
              >
                Save Policy
              </ATMButton>
            </div>
          </ATMCard>

          {/* IP Allowlist information card */}
          <ATMCard className="glass-card">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-gray-400" />
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">IP Allowlist</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">
              IP allowlist is configured <strong>per user</strong> — open a user from
              the directory and edit their allowlist field on the detail page.
              Empty allowlist = unrestricted (any IP). Enforcement is in
              <code className="mx-1 rounded bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-1 py-0.5 font-mono text-[10px]">SessionValidationMiddleware</code>.
            </p>
            <ATMButton
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => navigate('/users')}
            >
              Open User Directory
            </ATMButton>
          </ATMCard>
        </div>

        {/* Right: Active Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <ATMCard className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-gray-400" />
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Active Sessions</h3>
                <ATMBadge color="primary" label={String(sessions.length)} />
              </div>
            </div>

            <div className="space-y-4">
              {sessions.length === 0 && (
                <p className="text-center py-8 text-sm font-semibold text-gray-400 dark:text-gray-500">No active sessions.</p>
              )}
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="flex items-center gap-4 rounded-2xl border border-gray-150 bg-gray-50/10 p-4 dark:border-gray-800 dark:bg-gray-900/10 hover:bg-gray-50/30 dark:hover:bg-gray-900/20 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-50 text-xs font-black text-accent-700 dark:bg-accent-950/40 dark:text-accent-300 border border-accent-100/50">
                    {(session.username || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                      {session.username}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-550 font-semibold truncate mt-0.5">
                      {session.userAgent || 'Unknown agent'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-gray-500 font-bold mt-1.5">
                      {session.ipAddress && (
                        <span className="font-mono bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-1 py-0.5 rounded text-[10px]">
                          {session.ipAddress}
                        </span>
                      )}
                      <span>Last active {relativeTime(session.lastActivityAt ?? session.createdAt)}</span>
                      <span>Expires {relativeTime(session.expiresAt)}</span>
                    </div>
                  </div>
                  <ATMButton
                    variant="ghost"
                    size="sm"
                    isLoading={isTerminating}
                    onClick={() => onTerminateSession(session)}
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50/50"
                  >
                    <LogOut className="h-4 w-4" />
                  </ATMButton>
                </div>
              ))}
            </div>
          </ATMCard>

          <ATMCard className="glass-card">
            <h3 className="mb-2 text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Session Activity Log</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
              Login / logout / password-change / force-logout events live in the audit log.
            </p>
            <ATMButton
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => navigate('/audit')}
            >
              Open Audit Log
            </ATMButton>
          </ATMCard>
        </div>
      </div>
    </div>
  );
};

export default SessionSecurityPage;
