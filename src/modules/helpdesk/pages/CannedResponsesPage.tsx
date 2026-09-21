import React, { useEffect, useState } from 'react';
import { ATMBadge, ATMButton, ATMEmptyState, ATMErrorState, ATMSkeleton } from '@/shared/ui';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { Plus, MessageSquare, Search } from 'lucide-react';
import { toast } from 'sonner';
import { getCannedResponses } from '@/lib/api/helpdesk';
import type { CannedResponse } from '@/lib/types/helpdesk';

/**
 * Round_16 Pass 15: Canned-response listing page. Read-only for now; the create/update/delete
 * endpoints exist on `IHelpdeskService` (and were migrated to a typed CannedResponse entity in
 * Pass 10) but the API client doesn't yet expose mutations. Phase 2 = full CRUD here.
 */

function CannedResponsesPage() {
  const [items, setItems] = useState<readonly CannedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    getCannedResponses()
      .then((res) => {
        if (res.success) setItems(res.data);
        else setError((res as { error?: string }).error ?? 'Failed to load canned responses.');
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? items.filter(
        (r) =>
          r.title.toLowerCase().includes(search.toLowerCase()) ||
          r.category.toLowerCase().includes(search.toLowerCase()) ||
          r.content.toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  const searchInputClass =
    'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10';

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={MessageSquare}
        iconColor="theme"
        title="Canned Responses"
        subtitle="Reusable response templates for common ticket replies."
        extraActions={
          <ATMButton
            className="h-9"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => toast('Create flow lands in next sweep — backend already supports it.')}
          >
            New Response
          </ATMButton>
        }
      />

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search title, category, or body…"
        className={`w-full max-w-md h-9 ${searchInputClass}`}
      />

      {loading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ATMSkeleton variant="card" height="120px" />
          <ATMSkeleton variant="card" height="120px" />
        </div>
      )}

      {!loading && error && (
        <ATMErrorState title="The canned responses could not be loaded." message={error} />
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#13151a]">
          <ATMEmptyState
            icon={Search}
            title="No canned responses yet."
            description="Reusable templates you add here appear in the ticket reply composer."
          />
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((r) => (
            <div
              key={r.id ?? r.title}
              className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-[#13151a]"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{r.title}</h3>
                <ATMBadge variant="default">{r.category}</ATMBadge>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">{r.content}</p>
              {r.merchantType ? (
                <div className="text-xs text-slate-500 dark:text-slate-400">Scope: {r.merchantType}</div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CannedResponsesPage;