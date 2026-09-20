import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ATMBadge, ATMButton, ATMModal, ATMTextArea, ATMTextField } from '@/shared/ui';
import { Search, X, Plus, Shield, Loader2, AlertTriangle, Check, XCircle, Download, Trash2 } from 'lucide-react';
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

  const selectClass = 'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Data Requests</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Record, approve and execute data export, deletion and consent-withdrawal requests.
          </p>
        </div>
        <ATMButton variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
          Record Request
        </ATMButton>
      </div>

      {listQuery.isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load data requests.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void listQuery.refetch(); }}>Retry</ATMButton>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by merchant, requester or id…"
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-8 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ComplianceStatus | '')} className={selectClass}>
          <option value="">All statuses</option>
          {COMPLIANCE_STATUSES.map((s) => <option key={s} value={s}>{COMPLIANCE_STATUS_LABEL[s]}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as ComplianceRequestType | '')} className={selectClass}>
          <option value="">All types</option>
          {COMPLIANCE_REQUEST_TYPES.map((t) => <option key={t} value={t}>{COMPLIANCE_TYPE_LABEL[t]}</option>)}
        </select>
        <span className="text-xs text-gray-400">{filtered.length} of {requests.length}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    {['Merchant', 'Type', 'Status', 'Requested by', 'Due'].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {listQuery.isLoading && (
                    <tr><td colSpan={5} className="px-4 py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" /></td></tr>
                  )}
                  {!listQuery.isLoading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        {requests.length === 0 ? 'No data requests recorded. Use Record Request when a data subject asks for an export, a deletion or to withdraw consent.' : 'No requests match the filters.'}
                      </td>
                    </tr>
                  )}
                  {!listQuery.isLoading && filtered.map((r) => (
                    <tr
                      key={r.requestId}
                      className={cn('cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40', selectedId === r.requestId && 'bg-indigo-50 dark:bg-indigo-900/10')}
                      onClick={() => setSelectedId(r.requestId)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{r.merchantName || r.merchantId.slice(0, 8)}</span>
                          {r.merchantType && <ATMBadge variant={r.merchantType === 'Enterprise' ? 'enterprise' : 'standalone'} size="sm">{r.merchantType.charAt(0)}</ATMBadge>}
                        </div>
                      </td>
                      <td className="px-4 py-3"><ATMBadge variant={TYPE_VARIANT[r.requestType]} size="sm">{COMPLIANCE_TYPE_LABEL[r.requestType]}</ATMBadge></td>
                      <td className="px-4 py-3"><ATMBadge variant={STATUS_VARIANT[r.status]} size="sm">{COMPLIANCE_STATUS_LABEL[r.status]}</ATMBadge></td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.requestedBy}</td>
                      <td className={cn('px-4 py-3 tabular-nums', r.isOverdue ? 'font-semibold text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400')}>
                        {formatDate(r.dueAt, 'short')}{r.isOverdue ? ' · overdue' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          {selected ? (
            <div className="sticky top-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{selected.merchantName || selected.merchantId}</h3>
                  <p className="font-mono text-[11px] text-gray-400">{selected.requestId}</p>
                </div>
                <button type="button" onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  <ATMBadge variant={TYPE_VARIANT[selected.requestType]} size="sm">{COMPLIANCE_TYPE_LABEL[selected.requestType]}</ATMBadge>
                  <ATMBadge variant={STATUS_VARIANT[selected.status]} size="sm">{COMPLIANCE_STATUS_LABEL[selected.status]}</ATMBadge>
                  {selected.isOverdue && <ATMBadge variant="danger" size="sm" dot>Overdue</ATMBadge>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Requested by</p>
                    <p className="text-gray-900 dark:text-gray-100">{selected.requestedBy}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Scope</p>
                    <p className="text-gray-900 dark:text-gray-100">{selected.dataScope ? (SCOPE_LABEL[selected.dataScope as ComplianceDataScope] ?? selected.dataScope) : 'All data'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Received</p>
                    <p className="tabular-nums text-gray-900 dark:text-gray-100">{formatDate(selected.createdAt, 'datetime')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Due</p>
                    <p className={cn('tabular-nums', selected.isOverdue ? 'font-semibold text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100')}>{formatDate(selected.dueAt, 'short')}</p>
                  </div>
                  {selected.approvedBy && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{selected.status === 'Rejected' ? 'Rejected by' : 'Approved by'}</p>
                      <p className="text-gray-900 dark:text-gray-100">{selected.approvedBy}</p>
                    </div>
                  )}
                  {selected.completedAt && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Completed</p>
                      <p className="tabular-nums text-gray-900 dark:text-gray-100">{formatDate(selected.completedAt, 'datetime')}</p>
                    </div>
                  )}
                </div>
                {selected.notes && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Notes</p>
                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{selected.notes}</p>
                  </div>
                )}

                {selected.status === 'Pending' && (
                  <div className="space-y-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Decision</p>
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
                  <div className="space-y-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Approved. Executing marks the export complete and returns a reference for the record.
                    </p>
                    <ATMButton variant="primary" size="sm" className="w-full" disabled={busy} onClick={() => setConfirm({ kind: 'export', request: selected })}>
                      <Download className="mr-1 h-3.5 w-3.5" /> Complete Export
                    </ATMButton>
                  </div>
                )}

                {selected.status === 'InProgress' && selected.requestType === 'RightToDelete' && (
                  <div className="space-y-2 border-t border-gray-200 pt-3 dark:border-gray-700">
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">Only an Admin can execute a deletion.</p>
                    )}
                  </div>
                )}

                {selected.status === 'InProgress' && selected.requestType === 'ConsentWithdrawal' && (
                  <p className="border-t border-gray-200 pt-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    Approved and recorded. Consent withdrawals have nothing further to execute; the consent register reflects the change.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-sm text-gray-400 dark:text-gray-500">Select a request to view details</p>
            </div>
          )}
        </div>
      </div>

      <ATMModal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Record a data request" size="md">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Merchant</label>
            <select value={draft.merchantId} onChange={(e) => setDraft((d) => ({ ...d, merchantId: e.target.value }))} className={selectClass}>
              <option value="">{merchantsQuery.isLoading ? 'Loading merchants…' : 'Choose a merchant'}</option>
              {merchants.map((m) => (
                <option key={m.merchantId} value={m.merchantId}>{m.companyName}{m.merchantType ? ` (${m.merchantType})` : ''}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Request type</label>
            <select value={draft.requestType} onChange={(e) => setDraft((d) => ({ ...d, requestType: e.target.value as ComplianceRequestType }))} className={selectClass}>
              {COMPLIANCE_REQUEST_TYPES.map((t) => <option key={t} value={t}>{COMPLIANCE_TYPE_LABEL[t]}</option>)}
            </select>
          </div>
          <ATMTextField
            name="requestedBy"
            label="Requested by"
            value={draft.requestedBy}
            onChange={(e) => setDraft((d) => ({ ...d, requestedBy: e.target.value }))}
            helperText="The data subject, or the person acting for them."
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Data scope</label>
            <select value={draft.dataScope} onChange={(e) => setDraft((d) => ({ ...d, dataScope: e.target.value as ComplianceDataScope | '' }))} className={selectClass}>
              <option value="">All data</option>
              {COMPLIANCE_DATA_SCOPES.map((s) => <option key={s} value={s}>{SCOPE_LABEL[s]}</option>)}
            </select>
          </div>
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
            <p className="text-gray-700 dark:text-gray-300">
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
