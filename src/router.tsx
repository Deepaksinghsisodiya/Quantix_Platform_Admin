import React, { Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import {
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  ChangePasswordPage,
  MfaSetupPage as MFASetupPage,
  ProtectedRoute,
  PublicRoute,
  selectCurrentUser,
  selectIsAuthenticated,
} from '@/modules/auth';
import { usePermission } from '@/shared/hooks/usePermission';
import type { PermissionModule } from '@/lib/utils/permissions';

/* -------------------------------------------------------------------------- */
/*  Skeleton fallback for lazy-loaded pages                                   */
/* -------------------------------------------------------------------------- */

function PageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 animate-fade-in">
      <div className="h-8 w-64 rounded-lg bg-surface-200 animate-shimmer dark:bg-surface-700" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-surface-200 animate-shimmer dark:bg-surface-700"
          />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-surface-200 animate-shimmer dark:bg-surface-700" />
    </div>
  );
}



/* -------------------------------------------------------------------------- */
/*  Merchant Guard — gates merchant-only routes                               */
/* -------------------------------------------------------------------------- */

function MerchantGuard({ children }: { children: React.ReactNode }) {
  const user = useAppSelector(selectCurrentUser);
  if (!user) return <Navigate to="/login" replace />;

  const role = user.roleName || user.role;
  if (role !== 'Merchant') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/* -------------------------------------------------------------------------- */
/*  Staff Guard — excludes Merchant role from staff-facing routes             */
/* -------------------------------------------------------------------------- */

function StaffGuard({ children }: { children: React.ReactNode }) {
  const user = useAppSelector(selectCurrentUser);
  if (!user) return <Navigate to="/login" replace />;

  const role = user.roleName || user.role;
  if (role === 'Merchant') return <Navigate to="/merchant/dashboard" replace />;
  return <>{children}</>;
}

/* -------------------------------------------------------------------------- */
/*  Role Guard — checks module-level access for the current user              */
/* -------------------------------------------------------------------------- */

interface RoleGuardProps {
  module: PermissionModule;
  children: React.ReactNode;
}

function RoleGuard({ module, children }: RoleGuardProps) {
  const { hasPermission } = usePermission();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(module, 'view')) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-light dark:bg-red-900/30">
          <svg className="h-8 w-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
          Access Denied
        </h2>
        <p className="max-w-sm text-sm text-surface-500 dark:text-surface-400">
          You do not have permission to access this section. Contact your administrator if you
          believe this is an error.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

/* -------------------------------------------------------------------------- */
/*  Lazy page imports                                                         */
/* -------------------------------------------------------------------------- */

// Auth (eagerly loaded to prevent loader flash)
// LoginPage, MFASetupPage, ForgotPasswordPage, ResetPasswordPage, ChangePasswordPage imported eagerly above.

// Pass 40 (2026-05-24): Merchant self-service pages.
const MerchantDashboardPage = React.lazy(() => import('@/modules/merchants/pages/merchant/MerchantDashboardPage'));
const MerchantWalletPage = React.lazy(() => import('@/modules/merchants/pages/merchant/MerchantWalletPage'));
const MerchantTokensPage = React.lazy(() => import('@/modules/merchants/pages/merchant/MerchantTokensPage'));
const MerchantInvoicesPage = React.lazy(() => import('@/modules/merchants/pages/merchant/MerchantInvoicesPage'));
const MerchantDownloadsPage = React.lazy(() => import('@/modules/merchants/pages/merchant/MerchantDownloadsPage'));
const MerchantProfilePage = React.lazy(() => import('@/modules/merchants/pages/merchant/MerchantProfilePage'));

// Dashboard
// Pass 40j (2026-05-25): role-aware dispatcher replaces the direct DashboardPage import.
// AdminDashboard remains the existing comprehensive component; the dispatcher swaps in
// role-specific dashboards for OperationsManager / FinanceManager / ContentManager / Operator.
const DashboardPage = React.lazy(() => import('@/modules/dashboard/DashboardPage'));

// Round_16 Pass 3 audit C-8/M2: explicit 404 page (replaces silent dashboard redirect).
const NotFoundPage = React.lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

// Users
const UserListPage = React.lazy(() => import('@/modules/users/List/UserListWrapper'));
const UserDetailPage = React.lazy(() => import('@/modules/users/Detail/UserDetailWrapper'));
const UserCreatePage = React.lazy(() => import('@/modules/users/Add/UserAddPage'));
const UserEditPage = React.lazy(() => import('@/modules/users/Edit/UserEditWrapper'));
const SessionManagementPage = React.lazy(() => import('@/modules/users/Session/SessionSecurityWrapper'));

// Merchants
const MerchantDirectoryPage = React.lazy(() => import('@/modules/merchants/AllMerchants'));
const EnterpriseRegisterPage = React.lazy(() => import('@/modules/merchants/RegisterEnterprise'));
const StandaloneRegisterPage = React.lazy(() => import('@/modules/merchants/RegisterStandalone'));
const SignupQueuePage = React.lazy(() => import('@/modules/merchants/SignupQueue'));
const MerchantDetailPage = React.lazy(() => import('@/modules/merchants/MerchantDetail'));
const MerchantEditPage = React.lazy(() => import('@/modules/merchants/Edit'));
// 2026-05-18 (Pass 39): merchant deboarding workflow queue.
const DeboardingQueuePage = React.lazy(() => import('@/modules/merchants/DeboardingQueue'));
// 2026-05-16 (Pass 34): Standalone Local-Only terminal registry + pairing-code provisioning.
const MerchantTerminalsPage = React.lazy(() => import('@/modules/merchants/MerchantTerminals'));

// Tokens
const TokenHistoryPage = React.lazy(() => import('@/modules/tokens/List'));
const TokenGeneratePage = React.lazy(() => import('@/modules/tokens/Add'));
const BulkTokenPage = React.lazy(() => import('@/modules/tokens/Bulk'));
const TokenValidityPage = React.lazy(() => import('@/modules/tokens/Validity'));
const TokenDetailPage = React.lazy(() => import('@/modules/tokens/View'));

// Billing
const BillingDashboardPage = React.lazy(() => import('@/modules/billing/pages/BillingDashboardPage'));
const InvoiceListPage = React.lazy(() => import('@/modules/billing/pages/InvoiceListPage'));
const InvoiceDetailPage = React.lazy(() => import('@/modules/billing/pages/InvoiceDetailPage'));
const PlanManagementPage = React.lazy(() => import('@/modules/billing/pages/PlanManagementPage'));
const TokenPricingPage = React.lazy(() => import('@/modules/billing/pages/TokenPricingPage'));
const WalletListPage = React.lazy(() => import('@/modules/billing/pages/WalletListPage'));

// Commission (2026-05-18 Pass 36: CommissionRatesPage dropped — rate now lives on
// MerchantSubscription.CommissionPercent, not a separate table.)
const CommissionDashboardPage = React.lazy(() => import('@/modules/commission/pages/CommissionDashboardPage'));
const RevenueCollectionsPage = React.lazy(() => import('@/modules/commission/pages/RevenueCollectionsPage'));
const TaxConfigPage = React.lazy(() => import('@/modules/settings/pages/TaxConfigPage'));

// Support
const TicketQueuePage = React.lazy(() => import('@/modules/helpdesk/pages/TicketQueuePage'));
const TicketDetailPage = React.lazy(() => import('@/modules/helpdesk/pages/TicketDetailPage'));
const TicketMetricsPage = React.lazy(() => import('@/modules/helpdesk/pages/TicketMetricsPage'));
const LeadsPage = React.lazy(() => import('@/modules/helpdesk/pages/LeadsPage'));
// Round_16 Pass 15: missing pages added.
const LeadDetailPage = React.lazy(() => import('@/modules/helpdesk/pages/LeadDetailPage'));
const CannedResponsesPage = React.lazy(() => import('@/modules/helpdesk/pages/CannedResponsesPage'));
const AutoCloseConfigPage = React.lazy(() => import('@/modules/helpdesk/pages/AutoCloseConfigPage'));
const RoutingRulesPage = React.lazy(() => import('@/modules/helpdesk/pages/RoutingRulesPage'));

// Compliance
const ComplianceDashboardPage = React.lazy(() => import('@/modules/compliance/pages/ComplianceDashboardPage'));
const DataRequestsPage = React.lazy(() => import('@/modules/compliance/pages/DataRequestsPage'));
const ConsentManagementPage = React.lazy(() => import('@/modules/compliance/pages/ConsentManagementPage'));

// Content
const MarketingContentPage = React.lazy(() => import('@/modules/content/pages/MarketingContentPage'));
const BlogListPage = React.lazy(() => import('@/modules/content/pages/BlogListPage'));
const BlogEditorPage = React.lazy(() => import('@/modules/content/pages/BlogEditorPage'));
const HelpArticlesPage = React.lazy(() => import('@/modules/content/pages/HelpArticlesPage'));
const FAQPage = React.lazy(() => import('@/modules/content/pages/FAQPage'));

// Downloads
const DownloadsPage = React.lazy(() => import('@/modules/downloads/pages/DownloadsPage'));

// Settings
const GlobalSettingsPage = React.lazy(() => import('@/modules/settings/pages/GlobalSettingsPage'));
const FeatureTogglesPage = React.lazy(() => import('@/modules/settings/pages/FeatureTogglesPage'));
const TokenConfigPage = React.lazy(() => import('@/modules/settings/pages/TokenConfigPage'));
const CommissionConfigPage = React.lazy(() => import('@/modules/settings/pages/CommissionConfigPage'));
const GracePeriodConfigPage = React.lazy(() => import('@/modules/settings/pages/GracePeriodConfigPage'));
const EmailTemplatesPage = React.lazy(() => import('@/modules/settings/pages/EmailTemplatesPage'));
const IntegrationsPage = React.lazy(() => import('@/modules/settings/pages/IntegrationsPage'));
const MaintenancePage = React.lazy(() => import('@/modules/settings/pages/MaintenancePage'));
// Round_16 Pass 4 audit H-8: WebhooksPage — backend already had the controller, this is the missing UI.
const WebhooksPage = React.lazy(() => import('@/modules/settings/Webhooks'));

// Reports
const ReportsHubPage = React.lazy(() => import('@/modules/reports/pages/ReportsHubPage'));
const GrowthReportPage = React.lazy(() => import('@/modules/reports/pages/GrowthReportPage'));
const RevenueReportPage = React.lazy(() => import('@/modules/reports/pages/RevenueReportPage'));
const UsageReportPage = React.lazy(() => import('@/modules/reports/pages/UsageReportPage'));
const ChurnReportPage = React.lazy(() => import('@/modules/reports/pages/ChurnReportPage'));
const CommissionReportPage = React.lazy(() => import('@/modules/reports/pages/CommissionReportPage'));
const TokenReportPage = React.lazy(() => import('@/modules/reports/pages/TokenReportPage'));
const CustomReportPage = React.lazy(() => import('@/modules/reports/pages/CustomReportPage'));
const ComplianceReportPage = React.lazy(() => import('@/modules/reports/pages/ComplianceReportPage'));

// Audit
const AuditLogPage = React.lazy(() => import('@/modules/audit/pages/AuditLogPage'));

// Layout shell (loaded eagerly since it wraps all protected routes)
const AppShell = React.lazy(() => import('@/layout/AppShell'));

/* -------------------------------------------------------------------------- */
/*  Router                                                                    */
/* -------------------------------------------------------------------------- */

export function AppRouter() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* ---- Public + first-login routes (outside ProtectedRoute) ---- */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
        <Route path="/mfa-setup" element={<MFASetupPage />} />
        {/* Pass 40 (2026-05-24): forced first-login password rotation. ProtectedRoute
            redirects here when mustChangePassword is true; the page itself is reachable
            only while that flag is set + the user is authenticated. */}
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* ---- Protected routes (require authentication) ---- */}
        <Route element={<ProtectedRoute />}>
          {/* Pass 40 (2026-05-24): merchant-only route group. Lives OUTSIDE the staff
              AppShell so the merchant SPA can render its own minimal layout. */}
          <Route path="merchant" element={<MerchantGuard><Outlet /></MerchantGuard>}>
            <Route index element={<Navigate to="/merchant/dashboard" replace />} />
            <Route path="dashboard" element={<MerchantDashboardPage />} />
            <Route path="wallet" element={<MerchantWalletPage />} />
            <Route path="tokens" element={<MerchantTokensPage />} />
            <Route path="invoices" element={<MerchantInvoicesPage />} />
            <Route path="payments" element={<MerchantInvoicesPage />} />
            <Route path="downloads" element={<MerchantDownloadsPage />} />
            <Route path="profile" element={<MerchantProfilePage />} />
          </Route>

          <Route element={<StaffGuard><AppShell /></StaffGuard>}>
            {/* Root redirect */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard */}
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Users */}
            <Route path="users" element={<RoleGuard module="users"><UserListPage /></RoleGuard>} />
            <Route path="users/create" element={<RoleGuard module="users"><UserCreatePage /></RoleGuard>} />
            <Route path="users/sessions" element={<RoleGuard module="users"><SessionManagementPage /></RoleGuard>} />
            <Route path="users/:id" element={<RoleGuard module="users"><UserDetailPage /></RoleGuard>} />
            <Route path="users/:id/edit" element={<RoleGuard module="users"><UserEditPage /></RoleGuard>} />

            {/* Merchants */}
            <Route path="merchants" element={<RoleGuard module="merchants"><MerchantDirectoryPage /></RoleGuard>} />
            <Route path="merchants/register/enterprise" element={<RoleGuard module="merchants"><EnterpriseRegisterPage /></RoleGuard>} />
            <Route path="merchants/register/standalone" element={<RoleGuard module="merchants"><StandaloneRegisterPage /></RoleGuard>} />
            <Route path="merchants/signups" element={<RoleGuard module="merchants"><SignupQueuePage /></RoleGuard>} />
            {/* 2026-05-18 (Pass 39): deboarding workflow queue */}
            <Route path="merchants/deboardings" element={<RoleGuard module="merchants"><DeboardingQueuePage /></RoleGuard>} />
            <Route path="merchants/:id" element={<RoleGuard module="merchants"><MerchantDetailPage /></RoleGuard>} />
            <Route path="merchants/:id/edit" element={<RoleGuard module="merchants"><MerchantEditPage /></RoleGuard>} />
            <Route path="merchants/:id/terminals" element={<RoleGuard module="merchants"><MerchantTerminalsPage /></RoleGuard>} />

            {/* Tokens */}
            <Route path="tokens" element={<RoleGuard module="tokens"><TokenHistoryPage /></RoleGuard>} />
            <Route path="tokens/generate" element={<RoleGuard module="tokens"><TokenGeneratePage /></RoleGuard>} />
            <Route path="tokens/bulk" element={<RoleGuard module="tokens"><BulkTokenPage /></RoleGuard>} />
            <Route path="tokens/validity" element={<RoleGuard module="tokens"><TokenValidityPage /></RoleGuard>} />
            <Route path="tokens/:id" element={<RoleGuard module="tokens"><TokenDetailPage /></RoleGuard>} />

            {/* Billing */}
            <Route path="billing" element={<RoleGuard module="billing"><BillingDashboardPage /></RoleGuard>} />
            <Route path="billing/invoices" element={<RoleGuard module="billing"><InvoiceListPage /></RoleGuard>} />
            <Route path="billing/invoices/:id" element={<RoleGuard module="billing"><InvoiceDetailPage /></RoleGuard>} />
            <Route path="billing/plans" element={<RoleGuard module="billing"><PlanManagementPage /></RoleGuard>} />
            <Route path="billing/token-pricing" element={<RoleGuard module="billing"><TokenPricingPage /></RoleGuard>} />
            <Route path="billing/wallets" element={<RoleGuard module="billing"><WalletListPage /></RoleGuard>} />

            {/* Commission (Pass 35/36: ledger/settlement/disputes/rates routes removed; collections kept) */}
            <Route path="commission" element={<RoleGuard module="commission"><CommissionDashboardPage /></RoleGuard>} />
            <Route path="commission/collections" element={<RoleGuard module="commission"><RevenueCollectionsPage /></RoleGuard>} />
            <Route path="settings/tax" element={<RoleGuard module="settings"><TaxConfigPage /></RoleGuard>} />

            {/* Support */}
            <Route path="support" element={<RoleGuard module="support"><TicketQueuePage /></RoleGuard>} />
            <Route path="support/:id" element={<RoleGuard module="support"><TicketDetailPage /></RoleGuard>} />
            <Route path="support/metrics" element={<RoleGuard module="support"><TicketMetricsPage /></RoleGuard>} />
            <Route path="support/leads" element={<RoleGuard module="support"><LeadsPage /></RoleGuard>} />
            <Route path="support/leads/:id" element={<RoleGuard module="support"><LeadDetailPage /></RoleGuard>} />
            <Route path="support/canned-responses" element={<RoleGuard module="support"><CannedResponsesPage /></RoleGuard>} />
            <Route path="support/auto-close" element={<RoleGuard module="support"><AutoCloseConfigPage /></RoleGuard>} />
            <Route path="support/routing-rules" element={<RoleGuard module="support"><RoutingRulesPage /></RoleGuard>} />

            {/* Compliance */}
            <Route path="compliance" element={<RoleGuard module="compliance"><ComplianceDashboardPage /></RoleGuard>} />
            <Route path="compliance/data-requests" element={<RoleGuard module="compliance"><DataRequestsPage /></RoleGuard>} />
            <Route path="compliance/consent" element={<RoleGuard module="compliance"><ConsentManagementPage /></RoleGuard>} />

            {/* Content */}
            <Route path="content/marketing" element={<RoleGuard module="content"><MarketingContentPage /></RoleGuard>} />
            <Route path="content/blog" element={<RoleGuard module="content"><BlogListPage /></RoleGuard>} />
            <Route path="content/blog/new" element={<RoleGuard module="content"><BlogEditorPage /></RoleGuard>} />
            <Route path="content/blog/:id/edit" element={<RoleGuard module="content"><BlogEditorPage /></RoleGuard>} />
            <Route path="content/help" element={<RoleGuard module="content"><HelpArticlesPage /></RoleGuard>} />
            <Route path="content/faq" element={<RoleGuard module="content"><FAQPage /></RoleGuard>} />

            {/* Downloads */}
            <Route path="downloads" element={<RoleGuard module="downloads"><DownloadsPage /></RoleGuard>} />

            {/* Settings */}
            <Route path="settings" element={<RoleGuard module="settings"><GlobalSettingsPage /></RoleGuard>} />
            <Route path="settings/features" element={<RoleGuard module="settings"><FeatureTogglesPage /></RoleGuard>} />
            <Route path="settings/token-config" element={<RoleGuard module="settings"><TokenConfigPage /></RoleGuard>} />
            <Route path="settings/commission-config" element={<RoleGuard module="settings"><CommissionConfigPage /></RoleGuard>} />
            <Route path="settings/grace-period" element={<RoleGuard module="settings"><GracePeriodConfigPage /></RoleGuard>} />
            <Route path="settings/email-templates" element={<RoleGuard module="settings"><EmailTemplatesPage /></RoleGuard>} />
            <Route path="settings/integrations" element={<RoleGuard module="settings"><IntegrationsPage /></RoleGuard>} />
            <Route path="settings/maintenance" element={<RoleGuard module="settings"><MaintenancePage /></RoleGuard>} />
            <Route path="settings/webhooks" element={<RoleGuard module="settings"><WebhooksPage /></RoleGuard>} />

            {/* Reports */}
            <Route path="reports" element={<RoleGuard module="reports"><ReportsHubPage /></RoleGuard>} />
            <Route path="reports/growth" element={<RoleGuard module="reports"><GrowthReportPage /></RoleGuard>} />
            <Route path="reports/revenue" element={<RoleGuard module="reports"><RevenueReportPage /></RoleGuard>} />
            <Route path="reports/usage" element={<RoleGuard module="reports"><UsageReportPage /></RoleGuard>} />
            <Route path="reports/churn" element={<RoleGuard module="reports"><ChurnReportPage /></RoleGuard>} />
            <Route path="reports/commission" element={<RoleGuard module="reports"><CommissionReportPage /></RoleGuard>} />
            <Route path="reports/tokens" element={<RoleGuard module="reports"><TokenReportPage /></RoleGuard>} />
            <Route path="reports/custom" element={<RoleGuard module="reports"><CustomReportPage /></RoleGuard>} />
            <Route path="reports/compliance" element={<RoleGuard module="compliance"><ComplianceReportPage /></RoleGuard>} />

            {/* Audit */}
            <Route path="audit" element={<RoleGuard module="audit"><AuditLogPage /></RoleGuard>} />
          </Route>
        </Route>

        {/* Catch-all â€” Round_16 Pass 3 audit C-8/M2: explicit 404 instead of silent redirect. */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
