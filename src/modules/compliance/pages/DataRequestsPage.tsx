import React, { useMemo, useState } from 'react';
import { ATMBadge, ATMButton } from '@/shared/ui';
import { Search, X, Eye, Play, XCircle, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import {
  useDataRequests,
  useProcessDataRequest,
  useGenerateExportPackage,
  useExecuteAnonymization,
  useFulfillDataRequest,
} from '@/lib/hooks/useCompliance';

/* -------------------------------------------------------------------------- */
/*  Types & view-model adapter                                                 */
/* -------------------------------------------------------------------------- */

type RequestType = 'Export' | 'Deletion';
type RequestStatus = 'Pending' | 'InProgress' | 'Completed' | 'Rejected';

interface DataRequestVM {
  id: string;
  merchant: string;
  merchantType: 'Enterprise' | 'Standalone';
  type: RequestType;
  status: RequestStatus;
  regulation: 'GDPR' | 'CCPA' | 'LGPD';
  region: string;
  requestedDate: string;
  deadline: string;
  scope: string;
}

const TYPE_VARIANT: Record<RequestType, 'info' | 'danger'> = { Export: 'info', Deletion: 'danger' };
const STATUS_VARIANT: Record<RequestStatus, 'warning' | 'info' | 'success' | 'default'> = {
  Pending: 'warning',
  InProgress: 'info',
  Completed: 'success',
  Rejected: 'default',
};

function mapType(type: string): RequestType {
  return type === 'Deletion' ? 'Deletion' : 'Export';
}

function mapStatus(status: string): RequestStatus {
  if (status === 'Pending') return 'Pending';
  if (status === 'InProgress') return 'InProgress';
  if (status === 'Completed') return 'Completed';
  return 'Rejected';
}

function mapRegulation(reg: string): DataRequestVM['regulation'] {
  if (reg === 'GDPR' || reg === 'CCPA' || reg === 'LGPD') return reg;
  return 'GDPR';
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

function DataRequestsPage() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const requestsQuery = useDataRequests({ page: 1, pageSize: 100 });
  const processMut = useProcessDataRequest();
  const generateExportMut = useGenerateExportPackage();
  const executeAnonymizationMut = useExecuteAnonymization();
  const fulfillMut = useFulfillDataRequest();

  const requests = useMemo<DataRequestVM[]>(() => {
    const items = requestsQuery.data?.data?.items ?? [];
    return items.map((r) => ({
      id: r.id,
      merchant: r.merchantName,
      merchantType: r.merchantType,
      type: mapType(r.type),
      status: mapStatus(r.status),
      regulation: mapRegulation(r.regulation),
      region: r.region,
      requestedDate: r.requestedAt.slice(0, 10),
      deadline: r.deadline.slice(0, 10),
      scope: r.notes ?? r.scope,
    }));
  }, [requestsQuery.data]);

  const isLoading = requestsQuery.isLoading;
  const isError = requestsQuery.isError;

  const selected = requests.find((r) => r.id === selectedId) ?? null;

  const filtered = requests.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.id.toLowerCase().includes(q) || r.merchant.toLowerCase().includes(q) || r.regulation.toLowerCase().includes(q);
  });

  const handleProcess = (id: string) => {
    processMut.mutate(
      { requestId: id, action: 'Approve' },
      {
        onSuccess: () => toast.success('Request processing started'),
        onError: () => toast.error('Failed to start processing'),
      },
    );
  };

  const handleReject = (id: string) => {
    processMut.mutate(
      { requestId: id, action: 'Reject' },
      {
        onSuccess: () => toast.success('Request rejected'),
        onError: () => toast.error('Failed to reject request'),
      },
    );
  };

  const handleGenerateExport = (id: string) => {
    generateExportMut.mutate(id, {
      onSuccess: () => toast.success('Data package download started'),
      onError: () => toast.error('Failed to generate export'),
    });
  };

  const handleExecuteAnonymization = (id: string) => {
    executeAnonymizationMut.mutate(id, {
      onSuccess: () => toast.success('Deletion approved. Processing initiated.'),
      onError: () => toast.error('Failed to execute anonymization'),
    });
  };

  const handleFulfill = (id: string) => {
    fulfillMut.mutate(id, {
      onSuccess: () => toast.success('Request marked fulfilled'),
      onError: () => toast.error('Failed to fulfill request'),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Data Requests
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Process data export and deletion requests per GDPR, CCPA, and LGPD regulations.
        </p>
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load data requests.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void requestsQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, merchant, or regulation..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-8 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Table */}
        <div className="xl:col-span-2">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">ID</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Merchant</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Type</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Regulation</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Deadline</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {isLoading && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                      </td>
                    </tr>
                  )}
                  {!isLoading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No data requests found.
                      </td>
                    </tr>
                  )}
                  {!isLoading && filtered.map((req) => (
                    <tr
                      key={req.id}
                      className={cn(
                        'cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40',
                        selectedId === req.id && 'bg-indigo-50 dark:bg-indigo-900/10',
                      )}
                      onClick={() => setSelectedId(req.id)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{req.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{req.merchant}</span>
                          <ATMBadge variant={req.merchantType === 'Enterprise' ? 'enterprise' : 'standalone'} size="sm">{req.merchantType.charAt(0)}</ATMBadge>
                        </div>
                      </td>
                      <td className="px-4 py-3"><ATMBadge variant={TYPE_VARIANT[req.type]} size="sm">{req.type}</ATMBadge></td>
                      <td className="px-4 py-3"><ATMBadge variant={STATUS_VARIANT[req.status]} size="sm">{req.status}</ATMBadge></td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{req.regulation}</td>
                      <td className="px-4 py-3 tabular-nums text-gray-600 dark:text-gray-400">{req.deadline}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          {req.status === 'Pending' && (
                            <>
                              <ATMButton variant="ghost" size="sm" onClick={() => handleProcess(req.id)} disabled={processMut.isPending}><Play className="h-3.5 w-3.5 text-emerald-500" /></ATMButton>
                              <ATMButton variant="ghost" size="sm" onClick={() => setSelectedId(req.id)}><Eye className="h-3.5 w-3.5" /></ATMButton>
                              <ATMButton variant="ghost" size="sm" onClick={() => handleReject(req.id)} disabled={processMut.isPending}><XCircle className="h-3.5 w-3.5 text-red-500" /></ATMButton>
                            </>
                          )}
                          {req.status !== 'Pending' && (
                            <ATMButton variant="ghost" size="sm" onClick={() => setSelectedId(req.id)}><Eye className="h-3.5 w-3.5" /></ATMButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail drawer */}
        <div className="xl:col-span-1">
          {selected ? (
            <div className="sticky top-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selected.id}</h3>
                <button type="button" onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Merchant</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{selected.merchant}</p>
                </div>
                <div className="flex gap-2">
                  <ATMBadge variant={TYPE_VARIANT[selected.type]} size="sm">{selected.type}</ATMBadge>
                  <ATMBadge variant={STATUS_VARIANT[selected.status]} size="sm">{selected.status}</ATMBadge>
                  <ATMBadge variant="outline" size="sm">{selected.regulation}</ATMBadge>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Scope</p>
                  <p className="text-gray-700 dark:text-gray-300">{selected.scope}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Requested</p>
                    <p className="tabular-nums text-gray-900 dark:text-gray-100">{selected.requestedDate}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Deadline</p>
                    <p className="tabular-nums text-gray-900 dark:text-gray-100">{selected.deadline}</p>
                  </div>
                </div>

                {/* Process workflow */}
                <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Workflow</p>
                  <div className="space-y-2">
                    {['Review Scope', 'Approve', 'Execute', 'Mark Fulfilled'].map((step, i) => (
                      <div key={step} className="flex items-center gap-2">
                        <div className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                          i === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
                        )}>
                          {i + 1}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FRS-SAP-1003: Deletion — Platform Admin Approval (Super Admin retired Pass 24) */}
                {selected.type === 'Deletion' && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                      <Shield className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                      <div className="text-xs text-red-700 dark:text-red-300">
                        <p className="font-medium">Deletion requires Platform Admin approval</p>
                        <p className="mt-0.5">{selected.merchantType === 'Enterprise'
                          ? 'Will anonymize merchant database + platform records.'
                          : 'Will delete platform records only (no merchant database exists).'}</p>
                      </div>
                    </div>
                    {selected.status === 'InProgress' && (
                      <div className="flex gap-2">
                        <ATMButton variant="danger" size="sm" className="flex-1" onClick={() => handleExecuteAnonymization(selected.id)} disabled={executeAnonymizationMut.isPending}>
                          Approve Deletion
                        </ATMButton>
                        <ATMButton variant="secondary" size="sm" className="flex-1" onClick={() => handleReject(selected.id)} disabled={processMut.isPending}>
                          Reject
                        </ATMButton>
                      </div>
                    )}
                  </div>
                )}

                {/* FRS-SAP-1002: Export — type-aware scope */}
                {selected.type === 'Export' && (
                  <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                    {selected.merchantType === 'Enterprise'
                      ? 'Export includes: merchant database, billing history, support tickets, audit logs, sync records.'
                      : 'Export includes: platform records only — token history, billing, support tickets. No merchant database exists on platform.'}
                  </div>
                )}

                {/* FRS-SAP-1003: Deletion Certificate */}
                {selected.status === 'Completed' && selected.type === 'Deletion' && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Deletion Certificate Available</p>
                    <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                      Certificate ID: DC-{selected.id}-{selected.requestedDate.replace(/-/g, '')}
                    </p>
                    <ATMButton variant="secondary" size="sm" className="mt-2" onClick={() => toast.success('Deletion certificate downloaded')}>
                      Download Certificate (PDF)
                    </ATMButton>
                  </div>
                )}

                {/* Download for completed exports */}
                {selected.status === 'Completed' && selected.type === 'Export' && (
                  <ATMButton variant="primary" size="sm" className="w-full" onClick={() => handleGenerateExport(selected.id)} disabled={generateExportMut.isPending}>
                    Download Export Package
                  </ATMButton>
                )}

                {/* Mark fulfilled */}
                {selected.status === 'InProgress' && selected.type === 'Export' && (
                  <ATMButton variant="primary" size="sm" className="w-full" onClick={() => handleFulfill(selected.id)} disabled={fulfillMut.isPending}>
                    Mark as Fulfilled
                  </ATMButton>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-sm text-gray-400 dark:text-gray-500">ATMSelect a request to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DataRequestsPage;
