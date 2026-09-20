export type {
  PaginationParams,
  PaginatedResult,
  ApiResponse,
  PagedResponse,
  ErrorResponse,
  SortDirection,
  DateRange,
  SelectOption,
  MerchantType,
  BusinessType,
  MerchantStatus,
} from './common';

export type {
  Merchant,
  OnboardingChecklist,
  DbEngine,
  BillingFrequency,
  PreferredPaymentMethod,
  MerchantFeatureFlags,
  MerchantOperationalLimits,
  MerchantCreateEnterprise,
  MerchantCreateStandalone,
  MerchantFilter,
  MerchantNote,
  MerchantTag,
} from './merchant';

export type {
  PlatformRole,
  UserStatus,
  PlatformUser,
  UserPermission,
  CreateUserDto,
  UpdateUserDto,
} from './user';

export type {
  InvoiceType,
  InvoiceStatus,
  Invoice,
  InvoiceItem,
  SubscriptionPlan,
  PaymentRecord,
  BillingCycle,
  RefundRequest,
} from './billing';

// 2026-08-29: TokenTier/TokenBinding/TokenGracePolicy/TokenGenerateRequest removed —
// they were fictional (no C# counterpart). Tokens derive from the merchant's subscribed plan.
export type {
  TokenStatus,
  RechargeToken,
  RechargeTokenDetail,
  TokenListItem,
  TokenIssueResult,
  IssueTokenRequest,
  BulkTokenRequest,
  BulkTokenResult,
  TokenFilter,
} from './token';

export type {
  CommissionSummary,
  MerchantCommissionSummary,
  CommissionRate,
} from './commission';

// 2026-09-04: `Ticket` / `TicketMessage` / `AgentMetric` REMOVED — portal inventions the API
// never sent. The wire shapes are TicketListItem / TicketDetail / TicketComment.
export type {
  TicketStatus,
  TicketPriority,
  TicketCategory,
  CommentAuthorType,
  TicketListItem,
  TicketComment,
  TicketDetail,
  TicketFilter,
  TicketMetrics,
  Lead,
  CannedResponse,
} from './helpdesk';

export type {
  ComplianceRequestType,
  ComplianceStatus,
  ComplianceDataScope,
  ComplianceRequest,
  CreateComplianceRequest,
  ComplianceDashboard,
  ConsentRecord,
} from './compliance';

export type {
  ContentStatus,
  SeoMetadata,
  BlogPost,
  HelpArticle,
  FAQ,
  MarketingContent,
  ContentSchedule,
} from './content';

export type {
  ReportExportFormat,
  ReportType,
  ReportDefinition,
  ReportSchedule,
  GrowthData,
  RevenueData,
  UsageData,
  ChurnData,
} from './report';

export type {
  GlobalSettings,
  PasswordPolicy,
  MaintenanceWindow,
  EmailTemplate,
  IntegrationConfig,
  CommissionConfig,
  GracePeriodConfig,
} from './settings';

export type {
  NotificationType,
  Notification,
  NotificationPreferences,
} from './notification';

// ---------------------------------------------------------------------------
// Round_16 Pass 2 — canonical TS DTOs that mirror C# 1:1 (Solution_Rules §9).
// Use these for any new code that talks to PlatformApi.
// Legacy `Merchant`, `RechargeToken`, etc. above remain until consumers are migrated.
// ---------------------------------------------------------------------------

export type {
  OnboardingMode,
  MerchantStatus as MerchantStatusApi,
  BillingCycleType,
  PlanType,
  RechargeTokenStatus,
  TokenRevocationReason,
  SettlementStatus,
  DisputeStatus,
  WebhookDeliveryStatus,
  InvoiceStatus as InvoiceStatusApi,
  WalletTransactionType,
} from './platform-enums';

export type {
  MerchantApi,
  MerchantSummaryApi,
  CreateMerchantPayload,
  UpdateMerchantPayload,
  PlanChangePayload,
  MerchantNoteApi,
  CreateMerchantNotePayload,
  MerchantTagApi,
  SuspendMerchantRequest,
  CancelMerchantRequest,
  DeactivateMerchantRequest,
  TerminateMerchantRequest,
  ApproveMerchantApplicationRequest,
  RejectMerchantApplicationRequest,
} from './merchant-api';

// 2026-08-29: token-api.ts mirrors removed — lib/types/token.ts is now the canonical
// mirror of the C# token DTOs (exported above).
