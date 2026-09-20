/**
 * Barrel re-export for all custom hooks.
 */

// Auth
export { useAuth } from './useAuth';

// Domain â€” Merchants
export {
  useMerchants,
  useMerchant,
  useActivateMerchant,
  useSuspendMerchant,
  useMerchantTimeline,
} from './useMerchants';



// Domain â€” Commission (2026-05-17 Pass 35: ledger/settlement/dispute/statement hooks removed)
export {
  useCommissionDashboard,
  useCommissionRates,
} from './useCommission';

// Domain â€” Helpdesk
export {
  useTickets,
  useTicket,
  useCreateTicket,
  useTicketMetrics,
  useLeads,
  useAddTicketComment,
  useResolveTicket,
  useCloseTicket,
  useUpdateTicket,
  useUpdateLead,
} from './useHelpdesk';

// Domain â€” Reports
// 2026-08-31: useRevenueReport → useRevenueAnalytics / useRevenueSeries;
// useUsageReport → useUsageStats; useTokenReport → useTokenGenerationReport.
// useReportDefinitions and useExportReport removed — /reports/definitions and
// /reports/export do not exist on the API and always 404'd.
export {
  reportWindow,
  useGrowthReport,
  useRevenueAnalytics,
  useRevenueSeries,
  useUsageStats,
  useChurnReport,
  useMerchantBehavior,
  useMerchantHealth,
  useCommissionReport,
  useTokenGenerationReport,
} from './useReports';

// Domain â€” Settings
export {
  useGlobalSettings,
  useUpdateGlobalSettings,
  useEmailTemplates,
  useCommissionConfig,
  useGracePeriodConfig,
} from './useSettings';

// Domain â€” Compliance
export {
  useComplianceDashboard,
  useComplianceRequests,
} from './useCompliance';

// Domain â€” Content
export {
  useBlogPosts,
  useBlogPost,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
  useScheduleBlogPost,
  useHelpArticles,
  useDeleteHelpArticle,
  useFaqs,
  useDeleteFaq,
  useReorderFaqs,
  useMarketingContent,
  useUpdateMarketingContent,
} from './useContent';

// Domain â€” Audit
export { useAuditLogs, useExportAuditLogs } from './useAudit';

// Notifications
export { useNotifications } from './useNotifications';

// Filters
export { useTypeFilter } from './useTypeFilter';

// Domain â€” Wallet (Pass 37 surface)
export {
  useWallets,
  useWallet,
  useWalletTransactions,
  useAdjustWallet,
  useAddBonus,
  useRefund,
  useRechargeOnline,
  useRechargeOffline,
  useRecharges,
} from './useWallet';

// Utilities
export { useDebounce, useDebouncedCallback } from './useDebounce';
export { useKeyboardShortcut } from './useKeyboardShortcut';
export { useAutoRefresh } from './useAutoRefresh';
