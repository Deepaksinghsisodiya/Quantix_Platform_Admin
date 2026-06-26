import React, { useEffect, useState } from 'react';
import { ATMBadge, ATMButton } from '@/shared/ui';
import { Loader2, Plus } from 'lucide-react';
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Canned Responses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Reusable response templates for common ticket replies.
          </p>
        </div>
        <ATMButton leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => toast('Create flow lands in next sweep — backend already supports it.')}>
          New Response
        </ATMButton>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search title, category, or body…"
        className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      />

      {loading && (
        <div className="flex items-center gap-2 py-12 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading canned responses…
        </div>
      )}

      {!loading && error && <div className="py-12 text-center text-sm text-red-600">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
          No canned responses yet.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((r) => (
            <div key={r.id ?? r.title} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{r.title}</h3>
                <ATMBadge variant="default">{r.category}</ATMBadge>
              </div>
              <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">{r.content}</p>
              {r.merchantType ? (
                <div className="text-xs text-gray-500">Scope: {r.merchantType}</div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CannedResponsesPage;
