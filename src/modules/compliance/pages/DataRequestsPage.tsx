import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ATMBadge, ATMButton, ATMCard, ATMSkeleton, ATMModal, ATMTextArea, ATMTextField, ATMSelectField } from '@/shared/ui';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { Search, X, Plus, Shield, AlertTriangle, Check, XCircle, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';
import { apiErrorMessage } from '@/lib/utils/apiError';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/modules/auth/slices/authSlice';
import { usePermission } from '@/shared/hooks/usePermission';
import { useGetMerchantsQuery } from '@/modules/merchants/services/merchantApi';
import {
  useGetComplianceRequestsQuery,
  useCreateComplianceRequestMutation,
  useApproveComplianceRequestMutation,
  useRejectComplianceRequestMutation,
  useProcessComplianceExportMutation,
  useProcessComplianceDeletionMutation,
} from '../services/complianceApi';
import {
  COMPLIANCE_DATA_SCOPES,
  COMPLIANCE_REQUEST_TYPES,
  COMPLIANCE_STATUSES,
  COMPLIANCE_STATUS_LABEL,
  COMPLIANCE_TYPE_LABEL,
  type ComplianceDataScope,
  type ComplianceRequest,
  type ComplianceRequestType,
  type ComplianceStatus,
} from '@/lib/types/compliance';

/**
 * Data Requests — 2026-09-08, rebuilt on the routes ComplianceController actually has.
 *
 * The previous page listed from `/compliance/data-requests` (404: the list is `GET /compliance`),
 * "processed" with a PUT that did not exist, and offered generate-export / execute-anonymization /
 * fulfill buttons whose routes had never been written. It also had no way to CREATE a request, so
 * the register could only ever be empty, and it dressed each row with a regulation (always "GDPR")
 * and a region the API does not know.
 *
 * The real lifecycle: Pending → approve (In Progress) or reject → execute. Executing a Data Export
 * marks it Completed and returns an export reference; executing a Right To Delete soft-deletes
 * the merchant and is Admin-only on the server. Consent Withdrawal is approved or rejected and
 * recorded; there is nothing further to execute.
 *
 * Page title matches the sidebar label verbatim.
 */

const STATUS_VARIANT: Record<ComplianceStatus, 'warning' | 'info' | 'success' | 'default'> = {
  Pending: 'warning',
  InProgress: 'info',
  Completed: 'success',
  Rejected: 'default',
};

const TYPE_VARIANT: Record<ComplianceRequestType, 'info' | 'danger' | 'warning'> = {
  DataExport: 'info',
  RightToDelete: 'danger',
  ConsentWithdrawal: 'warning',
};

const SCOPE_LABEL: Record<ComplianceDataScope, string> = {
  AllData: 'All data',
  PersonalDataOnly: 'Personal data only',
  BusinessDataOnly: 'Business data only',
  OrdersOnly: 'Orders only',
  PaymentsOnly: 'Payments only',
  AnalyticsOnly: 'Analytics only',
  Other: 'Other (see notes)',
};

interface NewRequestDraft {
  merchantId: string;
  requestType: ComplianceRequestType;
  requestedBy: string;
  dataScope: ComplianceDataScope | '';
  notes: string;
}

function DataRequestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = useAppSelector(selectCurrentUser);
  const { isAdmin } = usePermission();
  const myName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || currentUser?.email || 'Staff';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<ComplianceRequestType | ''>('');
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('id'));
  const [decisionNote, setDecisionNote] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState<NewRequestDraft>({ merchantId: '', requestType: 'DataExport', requestedBy: '', dataScope: '', notes: '' });
  const [confirm, setConfirm] = useState<{ kind: 'export' | 'delete'; request: ComplianceRequest } | null>(null);

  const listQuery = useGetComplianceRequestsQuery({
    page: 1,
    pageSize: 200,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });
  const merchantsQuery = useGetMerchantsQuery({ page: 1, pageSize: 200 }, { skip: !createOpen });

  const [createRequest, createState] = useCreateComplianceRequestMutation();
  const [approveRequest, approveState] = useApproveComplianceRequestMutation();
  const [rejectRequest, rejectState] = useRejectComplianceRequestMutation();
  const [processExport, exportState] = useProcessComplianceExportMutation();
  const [processDeletion, deletionState] = useProcessComplianceDeletionMutation();

  const requests = listQuery.data?.data ?? [];
  const filtered = useMemo(() => {
    if (!search.trim()) return requests;
    const q = search.trim().toLowerCase();
    return requests.filter((r) =>
      r.merchantName.toLowerCase().includes(q)
      || r.requestedBy.toLowerCase().includes(q)
      || r.requestId.toLowerCase().includes(q));
  }, [requests, search]);

  const selected = requests.find((r) => r.requestId === selectedId) ?? null;

  useEffect(() => {
    // Keep the address in step so a link from the overview or a notification opens the row.
    const next = new URLSearchParams(searchParams);
    if (selectedId) next.set('id', selectedId); else next.delete('id');
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
  }, [selectedId, searchParams, setSearchParams]);

  const merchants: { merchantId: string; companyName: string; merchantType?: string }[] =
    ((merchantsQuery.data as any)?.data?.items ?? (merchantsQuery.data as any)?.data ?? []) as any[];

  const busy = approveState.isLoading || rejectState.isLoading || exportState.isLoading || deletionState.isLoading;

  const columns: ATMTableColumn<ComplianceRequest>[] = [
    {
      key: 'merchantName',
      header: 'Merchant',
      renderCell: (_v, r) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 dark:text-slate-100">{r.merchantName || r.merchantId.slice(0, 8)}</span>
          {r.merchantType && <ATMBadge variant={r.merchantType === 'Enterprise' ? 'enterprise' : 'standalone'} size="sm">{r.merchantType.charAt(0)}</ATMBadge>}
        </div>
      ),
    },
    {
      key: 'requestType',
      header: 'Type',
      renderCell: (_v, r) => <ATMBadge variant={TYPE_VARIANT[r.requestType]} size="sm">{COMPLIANCE_TYPE_LABEL[r.requestType]}</ATMBadge>,
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (_v, r) => <ATMBadge variant={STATUS_VARIANT[r.status]} size="sm">{COMPLIANCE_STATUS_LABEL[r.status]}</ATMBadge>,
    },
    {
      key: 'requestedBy',
      header: 'Requested by',
      renderCell: (_v, r) => <span className="text-slate-600 dark:text-slate-300">{r.requestedBy}</span>,
    },
    {
      key: 'dueAt',
      header: 'Due',
      renderCell: (_v, r) => (
        <span className={cn('tabular-nums', r.isOverdue ? 'font-semibold text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300')}>
          {formatDate(r.dueAt, 'short')}{r.isOverdue ? ' · overdue' : ''}
        </span>
      ),
    },
  ];

  const decide = async (isApproved: boolean) => {
    if (!selected) return;
    if (!isApproved && !decisionNote.trim()) {
      toast.error('Give a reason for rejecting; it is recorded on the request.');
      return;
    }
    const body = { requestId: selected.requestId, isApproved, approvedBy: myName, notes: decisionNote.trim() || undefined };
    try {
      if (isApproved) {
        await approveRequest(body).unwrap();
        toast.success('Request approved. It is now in progress.');
      } else {
        await rejectRequest(body).unwrap();
        toast.success('Request rejected.');
      }
      setDecisionNote('');
    } catch (err) {
      toast.error(apiErrorMessage(err, isApproved ? 'The request could not be approved' : 'The request could not be rejected'));
    }
  };

  const execute = async () => {
    if (!confirm) return;
    try {
      if (confirm.kind === 'export') {
        const res = await processExport(confirm.request.requestId).unwrap();
        toast.success(`Export completed. Reference: ${res.data}`);
      } else {
        await processDeletion(confirm.request.requestId).unwrap();
        toast.success(`Deletion completed. ${confirm.request.merchantName} has been removed from the platform.`);
      }
      setConfirm(null);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'The request could not be executed'));
    }
  };

  const submitCreate = async () => {
    if (!draft.merchantId) { toast.error('Choose the merchant the request concerns.'); return; }
    if (!draft.requestedBy.trim()) { toast.error('Record who made the request (the data subject or their representative).'); return; }
    try {
      const res = await createRequest({
        merchantId: draft.merchantId,
        requestType: draft.requestType,
        requestedBy: draft.requestedBy.trim(),
        dataScope: draft.dataScope || undefined,
        notes: draft.notes.trim() || undefined,
      }).unwrap();
      toast.success('Request recorded.');
      setCreateOpen(false);
      setDraft({ merchantId: '', requestType: 'DataExport', requestedBy: '', dataScope: '', notes: '' });
      setSelectedId(res.data.requestId);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'The request could not be recorded'));
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={Shield}
        iconColor="theme"
        title="Data Requests"
        subtitle="Record, approve and execute data export, deletion and consent-withdrawal requests."
        extraActions={
          <ATMButton variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Record Request
          </ATMButton>
        }
      />

      {listQuery.isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load data requests.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void listQuery.refetch(); }}>Retry</ATMButton>
        </div>
      )}

      {/* Filters */}
      <ATMCard padding="md">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Filters
          </p>
          {search || statusFilter || typeFilter ? (
            <button
              type="button"
              onClick={() => { setSearch(''); setStatusFilter(''); setTypeFilter(''); }}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <X className="h-3.5 w-3.5" />
              Clear all
            </button>
          ) : (
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {filtered.length} of {requests.length} requests
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ATMTextField
            name="search"
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by merchant, requester or id…"
            size="md"
            prefix={<Search className="h-4 w-4 text-slate-400" />}
            className="sm:col-span-2 lg:col-span-2"
          />
          <ATMSelectField
            name="statusFilter"
            label="Status"
            value={statusFilter}
            onChange={(val) => setStatusFilter((val as ComplianceStatus) || '')}
            options={[
              { label: 'All statuses', value: '' },
              ...COMPLIANCE_STATUSES.map((s) => ({ label: COMPLIANCE_STATUS_LABEL[s], value: s })),
            ]}
            size="md"
          />
          <ATMSelectField
            name="typeFilter"
            label="Type"
            value={typeFilter}
            onChange={(val) => setTypeFilter((val as ComplianceRequestType) || '')}
            options={[
              { label: 'All types', value: '' },
              ...COMPLIANCE_REQUEST_TYPES.map((t) => ({ label: COMPLIANCE_TYPE_LABEL[t], value: t })),
            ]}
            size="md"
          />
        </div>
      </ATMCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ATMCard className="xl:col-span-2 overflow-hidden" padding="none" loading={listQuery.isLoading}>
          {listQuery.isLoading ? (
            <ATMSkeleton variant="rect" height="280px" />
          ) : filtered.length === 0 ? (
            <div className="m-4 rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-10 text-center text-sm font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
              {requests.length === 0 ? 'No data requests recorded. Use Record Request when a data subject asks for an export, a deletion or to withdraw consent.' : 'No requests match the filters.'}
            </div>
          ) : (
            <ATMTable
              columns={columns}
              data={filtered}
              emptyMessage="No requests match the filters."
              onRowClick={(r) => setSelectedId(r.requestId)}
            />
          )}
        </ATMCard>

        <div className="xl:col-span-1">
          {selected ? (
            <ATMCard className="sticky top-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{selected.merchantName || selected.merchantId}</h3>
                  <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500">{selected.requestId}</p>
                </div>
                <button type="button" onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  <ATMBadge variant={TYPE_VARIANT[selected.requestType]} size="sm">{COMPLIANCE_TYPE_LABEL[selected.requestType]}</ATMBadge>
                  <ATMBadge variant={STATUS_VARIANT[selected.status]} size="sm">{COMPLIANCE_STATUS_LABEL[selected.status]}</ATMBadge>
                  {selected.isOverdue && <ATMBadge variant="danger" size="sm" dot>Overdue</ATMBadge>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Requested by</p>
                    <p className="text-slate-900 dark:text-slate-100">{selected.requestedBy}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Scope</p>
                    <p className="text-slate-900 dark:text-slate-100">{selected.dataScope ? (SCOPE_LABEL[selected.dataScope as ComplianceDataScope] ?? selected.dataScope) : 'All data'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Received</p>
                    <p className="tabular-nums text-slate-900 dark:text-slate-100">{formatDate(selected.createdAt, 'datetime')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Due</p>
                    <p className={cn('tabular-nums', selected.isOverdue ? 'font-semibold text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100')}>{formatDate(selected.dueAt, 'short')}</p>
                  </div>
                  {selected.approvedBy && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{selected.status === 'Rejected' ? 'Rejected by' : 'Approved by'}</p>
                      <p className="text-slate-900 dark:text-slate-100">{selected.approvedBy}</p>
                    </div>
                  )}
                  {selected.completedAt && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed</p>
                      <p className="tabular-nums text-slate-900 dark:text-slate-100">{formatDate(selected.completedAt, 'datetime')}</p>
                    </div>
                  )}
                </div>
                {selected.notes && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Notes</p>
                    <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{selected.notes}</p>
                  </div>
                )}

                {selected.status === 'Pending' && (
                  <div className="space-y-2 border-t border-slate-200/80 pt-3 dark:border-slate-800">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Decision</p>
                    <ATMTextArea
                      name="decisionNote"
                      value={decisionNote}
                      onChange={(e) => setDecisionNote(e.target.value)}
                      placeholder="Note (required to reject)"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <ATMButton variant="primary" size="sm" className="flex-1" loading={approveState.isLoading} disabled={busy} onClick={() => { void decide(true); }}>
                        <Check className="mr-1 h-3.5 w-3.5" /> Approve
                      </ATMButton>
                      <ATMButton variant="secondary" size="sm" className="flex-1" loading={rejectState.isLoading} disabled={busy} onClick={() => { void decide(false); }}>
                        <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                      </ATMButton>
                    </div>
                  </div>
                )}

                {selected.status === 'InProgress' && selected.requestType === 'DataExport' && (
                  <div className="space-y-2 border-t border-slate-200/80 pt-3 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Approved. Executing marks the export complete and returns a reference for the record.
                    </p>
                    <ATMButton variant="primary" size="sm" className="w-full" disabled={busy} onClick={() => setConfirm({ kind: 'export', request: selected })}>
                      <Download className="mr-1 h-3.5 w-3.5" /> Complete Export
                    </ATMButton>
                  </div>
                )}

                {selected.status === 'InProgress' && selected.requestType === 'RightToDelete' && (
                  <div className="space-y-2 border-t border-slate-200/80 pt-3 dark:border-slate-800">
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                      <Shield className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                      <p className="text-xs text-red-700 dark:text-red-300">
                        Executing removes <strong>{selected.merchantName}</strong> from the platform. This is an Admin action and cannot be undone here.
                      </p>
                    </div>
                    {isAdmin ? (
                      <ATMButton variant="danger" size="sm" className="w-full" disabled={busy} onClick={() => setConfirm({ kind: 'delete', request: selected })}>
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Execute Deletion
                      </ATMButton>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">Only an Admin can execute a deletion.</p>
                    )}
                  </div>
                )}

                {selected.status === 'InProgress' && selected.requestType === 'ConsentWithdrawal' && (
                  <p className="border-t border-slate-200/80 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    Approved and recorded. Consent withdrawals have nothing further to execute; the consent register reflects the change.
                  </p>
                )}
              </div>
            </ATMCard>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <p className="text-sm text-slate-400 dark:text-slate-500">Select a request to view details</p>
            </div>
          )}
        </div>
      </div>

      <ATMModal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Record a data request" size="md">
        <div className="space-y-4">
          <ATMSelectField
            name="merchantId"
            label="Merchant"
            value={draft.merchantId}
            onChange={(val) => setDraft((d) => ({ ...d, merchantId: val ? String(val) : '' }))}
            options={[
              { value: '', label: 'Choose a merchant' },
              ...merchants.map((m) => ({ value: m.merchantId, label: m.companyName + (m.merchantType ? ` (${m.merchantType})` : '') })),
            ]}
            loading={merchantsQuery.isLoading}
            disabled={merchantsQuery.isLoading && merchants.length === 0}
            size="md"
          />
          <ATMSelectField
            name="requestType"
            label="Request type"
            value={draft.requestType}
            onChange={(val) => setDraft((d) => ({ ...d, requestType: (val as ComplianceRequestType) || 'DataExport' }))}
            options={COMPLIANCE_REQUEST_TYPES.map((t) => ({ value: t, label: COMPLIANCE_TYPE_LABEL[t] }))}
            size="md"
          />
          <ATMTextField
            name="requestedBy"
            label="Requested by"
            value={draft.requestedBy}
            onChange={(e) => setDraft((d) => ({ ...d, requestedBy: e.target.value }))}
            helperText="The data subject, or the person acting for them."
            size="md"
          />
          <ATMSelectField
            name="dataScope"
            label="Data scope"
            value={draft.dataScope}
            onChange={(val) => setDraft((d) => ({ ...d, dataScope: (val as ComplianceDataScope) || '' }))}
            options={[
              { value: '', label: 'All data' },
              ...COMPLIANCE_DATA_SCOPES.map((s) => ({ value: s, label: SCOPE_LABEL[s] })),
            ]}
            size="md"
          />
          <ATMTextArea
            name="notes"
            label="Notes"
            value={draft.notes}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <ATMButton variant="secondary" size="sm" onClick={() => setCreateOpen(false)}>Cancel</ATMButton>
            <ATMButton variant="primary" size="sm" loading={createState.isLoading} onClick={() => { void submitCreate(); }}>Record</ATMButton>
          </div>
        </div>
      </ATMModal>

      <ATMModal
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.kind === 'delete' ? 'Execute deletion?' : 'Complete export?'}
        size="sm"
      >
        {confirm && (
          <div className="space-y-4 text-sm">
            <p className="text-slate-700 dark:text-slate-300">
              {confirm.kind === 'delete'
                ? <>This removes <strong>{confirm.request.merchantName}</strong> from the platform and marks the request completed. It cannot be undone from here.</>
                : <>This marks the data export for <strong>{confirm.request.merchantName}</strong> as completed and records an export reference.</>}
            </p>
            <div className="flex justify-end gap-2">
              <ATMButton variant="secondary" size="sm" onClick={() => setConfirm(null)}>Cancel</ATMButton>
              <ATMButton
                variant={confirm.kind === 'delete' ? 'danger' : 'primary'}
                size="sm"
                loading={exportState.isLoading || deletionState.isLoading}
                onClick={() => { void execute(); }}
              >
                {confirm.kind === 'delete' ? 'Execute Deletion' : 'Complete Export'}
              </ATMButton>
            </div>
          </div>
        )}
      </ATMModal>
    </div>
  );
}

export default DataRequestsPage;