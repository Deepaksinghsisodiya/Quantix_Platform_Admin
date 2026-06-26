/**
 * Barrel re-export for all custom hooks.
 */

// Auth
export { useAuth } from './useAuth';

// Domain â€” Merchants
export {
  useMerchants,
  useMerchant,
  useCreateEnterpriseMerchant,
  useCreateStandaloneMerchant,
  useActivateMerchant,
  useSuspendMerchant,
  useMerchantTimeline,
} from './useMerchants';



// Domain â€” Commission (2026-05-17 Pass 35: ledger/settlement/dispute/statement hooks removed)
export {
  useCommissionDashboard,
  useCommissionRates,
  useCommissionExemptions,
  useCreateExemption,
} from './useCommission';

// Domain â€” Helpdesk
export {
  useTickets,
  useTicket,
  useCreateTicket,
  useAssignTicket,
  useTicketMetrics,
  useLeads,
  useAddTicketMessage,
  useUpdateTicket,
  useUpdateLead,
} from './useHelpdesk';

// Domain â€” Reports
export {
  useGrowthReport,
  useRevenueReport,
  useUsageReport,
  useChurnReport,
  useCommissionReport,
  useTokenReport,
  useReportDefinitions,
  useExportReport,
} from './useReports';

// Domain â€” Settings
export {
  useGlobalSettings,
  useUpdateGlobalSettings,
  useFeatureToggles,
  useEmailTemplates,
  useTokenConfig,
  useCommissionConfig,
  useGracePeriodConfig,
} from './useSettings';

// Domain â€” Compliance
export {
  useComplianceDashboard,
  useDataRequests,
  useProcessDataRequest,
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
