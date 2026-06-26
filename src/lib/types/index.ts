export type {
  PaginationParams,
  PaginatedResult,
  ApiResponse,
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
  TokenPricing,
  BulkDiscount,
  PaymentRecord,
  BillingCycle,
  RefundRequest,
} from './billing';

export type {
  TokenStatus,
  TokenTier,
  TokenBinding,
  RechargeToken,
  TokenGracePolicy,
  TokenTemplate,
  TokenGenerateRequest,
  BulkTokenRequest,
  TokenFilter,
} from './token';

export type {
  CommissionSummary,
  MerchantCommissionSummary,
  CommissionRate,
  CommissionExemption,
} from './commission';

export type {
  TicketStatus,
  TicketPriority,
  TicketCategory,
  Ticket,
  TicketMessage,
  TicketFilter,
  TicketMetrics,
  AgentMetric,
  Lead,
  CannedResponse,
} from './helpdesk';

export type {
  DataRequestType,
  DataRequestStatus,
  DataRequest,
  ConsentRecord,
  RetentionPolicy,
  ComplianceMetrics,
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
  FeatureToggle,
  MaintenanceWindow,
  EmailTemplate,
  IntegrationConfig,
  TokenGenerationConfig,
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

export type {
  RechargeTokenApi,
  RechargeTokenDetailApi,
  GenerateRechargeTokenPayload,
  BulkTokenGenerationPayload,
  BulkTokenResult,
  TokenPricing as TokenPricingApi,
  LimitEnforcementApi,
  RevokeTokenRequest,
} from './token-api';
