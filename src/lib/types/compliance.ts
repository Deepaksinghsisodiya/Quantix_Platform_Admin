/** Type of data subject request. */
export type DataRequestType = 'Export' | 'Deletion' | 'Rectification' | 'Restriction';

export type DataRequestStatus =
  | 'Pending'
  | 'InProgress'
  | 'Completed'
  | 'Failed'
  | 'Cancelled';

/** PF-12: Scope of a data request depends on merchant type. */
export type DataRequestScope = 'MerchantDatabase+PlatformRecords' | 'PlatformRecordsOnly';

/** A GDPR/privacy data subject request. PF-12 */
export interface DataRequest {
  readonly id: string;
  readonly merchantId: string;
  readonly merchantName: string;
  readonly merchantType: 'Enterprise' | 'Standalone';
  readonly type: DataRequestType;
  readonly status: DataRequestStatus;
  /** PF-12 Step 2: Scope — Enterprise includes merchant DB + platform records, Standalone is platform-only. */
  readonly scope: DataRequestScope;
  readonly requestedAt: string;
  readonly completedAt: string | null;
  /** PF-12 Step 5: Compliance deadline (e.g. 30 days for GDPR). */
  readonly deadline: string;
  readonly regulation: string;
  readonly region: string;
  readonly requestedBy: string;
  readonly processedBy: string | null;
  readonly approvedBy: string | null;
  readonly approvedAt: string | null;
  readonly notes: string | null;
  /** PF-12 Step 4: URL to download the generated export package (null if not yet generated). */
  readonly exportPackageUrl: string | null;
  /** PF-12 Step 4: URL to download the deletion certificate (null if not deletion or not yet completed). */
  readonly deletionCertificateUrl: string | null;
}

/** Record of user/merchant consent for data processing. */
export interface ConsentRecord {
  readonly id: string;
  readonly merchantId: string;
  readonly consentType: string;
  readonly granted: boolean;
  readonly grantedAt: string;
  readonly revokedAt: string | null;
  readonly version: string;
  readonly ipAddress: string | null;
}

/** Data retention policy configuration. */
export interface RetentionPolicy {
  readonly id: string;
  readonly dataCategory: string;
  readonly retentionDays: number;
  readonly regulation: string;
  readonly region: string;
  readonly autoDelete: boolean;
  readonly lastAppliedAt: string | null;
}

/** Aggregated compliance metrics for dashboards. */
export interface ComplianceMetrics {
  readonly pendingRequests: number;
  readonly completedRequests: number;
  readonly averageCompletionTimeHours: number;
  readonly overdueRequests: number;
  readonly consentRate: number;
  readonly byRegulation: Record<string, number>;
  readonly byRegion: Record<string, number>;
}
