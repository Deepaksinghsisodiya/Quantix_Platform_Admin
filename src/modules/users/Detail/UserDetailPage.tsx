import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Key,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Briefcase,
  Clock,
  Edit2,
  LogOut,
  Fingerprint,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ATMAvatar,
  StatusBadge,
  ATMDetailRow,
  ATMSectionHeader,
  ATMActionSidebarItem,
  ATMButton,
  ATMCard,
  ATMBadge,
  ATMStatsCard,
  ATMSkeleton,
  ATMEmptyState
} from '@/shared/ui';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import type { PlatformUser, UserActivity, PlatformRole } from '../types/user.types';

interface UserDetailPageProps {
  user: PlatformUser;
  activity: readonly UserActivity[];
  isActivityLoading: boolean;
  isActivityError: boolean;
  refetchActivity: () => void;
  // Mutations state
  isDeactivating: boolean;
  isTerminating: boolean;
  isResettingPassword: boolean;
  // Perms
  canUpdate: boolean;
  canDeactivate: boolean;
  // Callbacks
  onEdit: () => void;
  onForceLogout: () => void;
  onDeactivate: () => void;
  onResetPassword: () => void;
}

const ROLE_VARIANT: Record<PlatformRole, 'purple' | 'primary' | 'success' | 'warning' | 'gray' | 'muted'> = {
  Admin: 'purple',
  OperationsManager: 'primary',
  FinanceManager: 'success',
  ContentManager: 'warning',
  Operator: 'gray',
  Merchant: 'muted',
};

const ACTION_VARIANT: Record<string, 'success' | 'primary' | 'danger' | 'muted' | 'warning' | 'purple'> = {
  Create: 'success',
  Update: 'primary',
  Delete: 'danger',
  Login: 'muted',
  Logout: 'muted',
  ConfigChange: 'warning',
  PermissionChange: 'warning',
  TokenGenerate: 'purple',
  CommissionApproval: 'success',
};

const formatTimestamp = (ts: string) => {
  try {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return ts;
  }
};

export const UserDetailPage: React.FC<UserDetailPageProps> = ({
  user,
  activity,
  isActivityLoading,
  isActivityError,
  refetchActivity,
  isDeactivating,
  isTerminating,
  isResettingPassword,
  canUpdate,
  canDeactivate,
  onEdit,
  onForceLogout,
  onDeactivate,
  onResetPassword,
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={Shield}
        iconColor="theme"
        title="User Detail"
        subtitle={user.email}
        onBack={() => navigate('/users')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <ATMStatsCard
          label="Account Status"
          value={user.status}
          icon={UserCheck}
          variant={user.status === 'Active' ? 'emerald' : 'rose'}
          description={user.mustChangePassword ? 'Temporary password pending change' : 'Password state active'}
        />
        <ATMStatsCard
          label="Multi-Factor Auth"
          value={user.mfaEnabled ? 'Enabled' : 'Not set'}
          icon={Fingerprint}
          variant={user.mfaEnabled ? 'accent' : 'amber'}
          description="MFA enrollment state"
        />
        <ATMStatsCard
          label="Last Login"
          value={user.lastLogin ? formatTimestamp(user.lastLogin) : 'Never'}
          icon={Clock}
          variant="slate"
          description="Most recent authenticated session"
        />
        <ATMStatsCard
          label="Actions Logged"
          value={String(activity.length)}
          icon={CheckCircle2}
          variant="purple"
          description="Recent user activity audit entries"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Columns — Profile Summary & Primary Info */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Identity Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#13151a] overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] dark:opacity-[0.05] grayscale pointer-events-none group-hover:opacity-[0.05] dark:group-hover:opacity-[0.08] transition-opacity">
              <Shield size={200} className="dark:text-white" />
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
              <div className="relative">
                <ATMAvatar
                  name={user.name || user.email}
                  size="xl"
                  className="ring-4 ring-slate-50 dark:ring-slate-800 shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2">
                  <StatusBadge status={user.status} />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                    {user.name}
                  </h2>
                  <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded border border-slate-200 dark:border-slate-700 uppercase tracking-widest">
                      {user.email.split('@')[0]}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <ATMBadge color={ROLE_VARIANT[user.role] ?? 'muted'} label={user.role} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Briefcase size={14} className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Mail size={14} className="text-slate-400 dark:text-slate-500" />
                    <span className="text-xs font-bold lowercase tracking-tight">{user.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Metadata */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#13151a]">
              <ATMSectionHeader title="Contact Metadata" />
              <div className="space-y-1">
                <ATMDetailRow icon={Mail} label="Corporate Email" value={user.email} />
                <ATMDetailRow icon={Phone} label="Primary Contact" value="Not Registered" />
                <ATMDetailRow icon={Phone} label="WhatsApp" value="Not Registered" />
                <ATMDetailRow
                  icon={MapPin}
                  label="IP Allowlist"
                  value={user.ipAllowlist || 'Any IP Allowed'}
                  isLast
                />
              </div>
            </div>

            {/* Employment / Organizational Details */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#13151a]">
              <ATMSectionHeader title="Organizational Detail" />
              <div className="space-y-1">
                <ATMDetailRow icon={Shield} label="Access Level" value={user.role} />
                <ATMDetailRow icon={Clock} label="Last Active Session" value={user.lastLogin ? formatTimestamp(user.lastLogin) : 'Never Logged In'} />
                <ATMDetailRow icon={Calendar} label="Commencement Date" value={new Date(user.createdAt).toLocaleDateString()} isLast />
              </div>
            </div>
          </div>

          {/* Security & Authentication */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#13151a]">
            <ATMSectionHeader title="Security & Authentication" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Account State</p>
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">{user.status}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">MFA Setup</p>
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${user.mfaEnabled ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">{user.mfaEnabled ? 'Setup Completed' : 'Pending Enrollment'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Password State</p>
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${user.mustChangePassword ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                    {user.mustChangePassword ? 'Temp (Change Pending)' : 'Active (Custom)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <ATMCard className="glass-card">
            <h3 className="mb-6 text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Recent User Actions</h3>
            {isActivityLoading ? (
              <div className="space-y-2">
                <ATMSkeleton variant="text" count={3} className="w-full" />
              </div>
            ) : isActivityError ? (
              <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50/50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/20 text-red-750">
                <span className="text-sm font-semibold">Failed to load activity log.</span>
                <ATMButton variant="ghost" size="sm" onClick={refetchActivity}>Retry</ATMButton>
              </div>
            ) : activity.length === 0 ? (
              <ATMEmptyState
                icon={CheckCircle2}
                title="No activity recorded"
                description="Actions taken by or on behalf of this user will appear here."
              />
            ) : (
              <div className="space-y-4">
                {activity.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-4 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10">
                    <ATMBadge color={ACTION_VARIANT[entry.action] ?? 'muted'} label={entry.action} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{entry.details}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">
                        {formatTimestamp(entry.timestamp)} &middot; IP: {entry.ipAddress}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ATMCard>
        </div>

        {/* Right Column — Critical Actions Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#13151a] sticky top-24 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-900 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">Management</h3>
            </div>

            <div className="p-5 space-y-3">
              {canUpdate && (
                <>
                  <ATMActionSidebarItem
                    label="Modify Record"
                    icon={Edit2}
                    onClick={onEdit}
                  />
                  <ATMActionSidebarItem
                    label="Reset Authentication"
                    icon={Key}
                    onClick={onResetPassword}
                    variant="amber"
                    isLoading={isResettingPassword}
                  />
                  <ATMActionSidebarItem
                    label="Force Logout"
                    icon={LogOut}
                    onClick={onForceLogout}
                    isLoading={isTerminating}
                  />
                </>
              )}

              {canDeactivate && (
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <ATMActionSidebarItem
                    label={user.status === 'Active' ? 'Deactivate Account' : 'Reactivate Account'}
                    icon={user.status === 'Active' ? UserX : UserCheck}
                    onClick={onDeactivate}
                    variant={user.status === 'Active' ? 'rose' : 'emerald'}
                    isLoading={isDeactivating}
                  />
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center mt-3 leading-relaxed font-medium">
                    Deactivating prevents platform login immediately. You can reactivate the account later.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
