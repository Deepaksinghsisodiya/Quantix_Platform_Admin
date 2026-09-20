import React, { useEffect, useState } from 'react';
import { MessageSquare, Eye, Check } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMTextArea } from '@/shared/ui/ATMTextArea';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { get, put } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/types/common';
import { cn } from '@/lib/utils/cn';

/**
 * 2026-08-10: operator-editable SMS bodies (mirrors Email Templates, minus subject/HTML).
 * SmsNotifier reads these rows by TemplateName per send — edits apply immediately. Bodies
 * render in plain-text mode via the Tier-1 PlaceholderEngine: {{key}}, {{key:default}},
 * {{#if key}}…{{/if}}. {{brandName}} (Platform DBA name) is injected on every send.
 * The segment counter reflects GSM-7: 160 chars for 1 segment, then 153 per segment.
 */

interface SmsTemplate {
  templateId: string;
  templateName: string;
  body: string;
  category: string;
  description?: string | null;
  isActive: boolean;
  updatedAt?: string | null;
}

/** Extracts {{placeholder}} tokens from the template's own text for insert buttons. */
function extractPlaceholders(t: SmsTemplate): string[] {
  const source = `${t.body}\n${t.description ?? ''}`;
  const found = new Set<string>();
  for (const m of source.matchAll(/\{\{[!#/]?([A-Za-z0-9_.]+)(?::[^}]*)?\}\}/g)) {
    if (m[1] && !['if', 'else'].includes(m[1])) found.add(`{{${m[1]}}}`);
  }
  return [...found];
}

/** GSM-7 segmenting approximation; placeholders render shorter than their tokens, so this
 * is an upper bound for the template as typed. */
function segmentInfo(body: string): { chars: number; segments: number } {
  const chars = body.length;
  const segments = chars === 0 ? 0 : chars <= 160 ? 1 : Math.ceil(chars / 153);
  return { chars, segments };
}

export function SmsTemplatesPage() {
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selected = templates.find((t) => t.templateId === selectedId) ?? null;
  const dirty = !!selected && editBody !== selected.body;
  const { chars, segments } = segmentInfo(editBody);

  const load = async () => {
    try {
      const res = await get<ApiResponse<SmsTemplate[]>>('/api/v1/settings/sms-templates');
      setTemplates(((res as any)?.data ?? []) as SmsTemplate[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load SMS templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSelect = (template: SmsTemplate) => {
    setSelectedId(template.templateId);
    setEditBody(template.body);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await put(`/api/v1/settings/sms-templates/${selected.templateId}`, { body: editBody });
      toast.success(`Template "${selected.templateName}" saved — applies to the next send.`);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message || (e instanceof Error ? e.message : 'Failed to save the template.'));
    } finally {
      setSaving(false);
    }
  };

  const insertPlaceholder = (v: string) => setEditBody((prev) => prev + v);

  const grouped = templates.reduce<Record<string, SmsTemplate[]>>((acc, t) => {
    (acc[t.category || 'Other'] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      <div>
        {/* Title matches the sidebar label. */}
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          SMS Templates
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
          The plain-text bodies SMS notifications are composed from — edits apply to the very
          next send. Sends only happen when SMS Integration is enabled. Placeholders:{' '}
          {'{{key}}'}, optional {'{{key:default}}'}; {'{{brandName}}'} is always available.
        </p>
      </div>

      {loading ? (
        <ATMSkeleton className="h-72 w-full" />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Template list, grouped by category */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="mb-1.5 px-1 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {category}
                </p>
                <div className="flex flex-col gap-2">
                  {items.map((t) => (
                    <button
                      key={t.templateId}
                      type="button"
                      onClick={() => handleSelect(t)}
                      className={cn(
                        'w-full rounded-xl border p-3 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
                        selectedId === t.templateId
                          ? 'border-accent-500 bg-accent-50/10 dark:border-accent-400 dark:bg-accent-950/10'
                          : 'border-gray-200 bg-white hover:bg-gray-55/20 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800/80',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">{t.templateName}</span>
                        {!t.isActive && <ATMBadge size="sm" color="warning" label="Inactive" />}
                      </div>
                      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400 font-semibold">{t.body}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {templates.length === 0 && (
              <p className="text-sm font-semibold text-red-500">
                No templates found — restart the API so the seed runs, then reload.
              </p>
            )}
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            {selected ? (
              <ATMCard className="glass-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-mono text-base font-bold text-gray-900 dark:text-white">{selected.templateName}</h3>
                  <span className={cn(
                    'text-xs font-bold',
                    segments > 3 ? 'text-red-500' : segments > 1 ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500',
                  )}>
                    {chars} chars · {segments} segment{segments === 1 ? '' : 's'}
                  </span>
                </div>
                {selected.description && (
                  <p className="mb-4 text-xs text-gray-500 dark:text-gray-400 font-semibold">{selected.description}</p>
                )}

                <div className="space-y-4 pt-2">
                  {extractPlaceholders(selected).length > 0 && (
                    <div>
                      <label className="text-xs font-bold text-gray-550 dark:text-gray-400">Insert placeholder</label>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {extractPlaceholders(selected).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => insertPlaceholder(v)}
                            className="rounded-lg bg-gray-100 px-2 py-1 font-mono text-[10px] font-semibold text-gray-700 hover:bg-gray-250 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750"
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <ATMTextArea
                    name="body"
                    label="Body (plain text)"
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={6}
                  />
                  {segments > 3 && (
                    <p className="text-xs font-semibold text-red-500">
                      Over 3 segments — carriers stop delivering reliably. Shorten the message.
                    </p>
                  )}

                  {/* Live preview with tokens visible */}
                  <div className="rounded-xl border border-gray-200 bg-gray-55/20 p-4 dark:border-gray-800 dark:bg-gray-900/10">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Eye className="h-3.5 w-3.5 text-gray-400" />
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Preview (raw tokens)</p>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300 font-medium">
                      {editBody || '(empty)'}
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <ATMButton variant="primary" size="sm" icon={Check} isLoading={saving} disabled={!dirty} onClick={handleSave}>
                      Save Template
                    </ATMButton>
                  </div>
                </div>
              </ATMCard>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-800">
                <p className="text-sm text-gray-400 dark:text-gray-550 font-bold">Select a template to edit</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SmsTemplatesPage;
