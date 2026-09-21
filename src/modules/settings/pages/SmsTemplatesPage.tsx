import React, { useEffect, useState } from 'react';
import { MessageSquare, Eye, Check, SquareText, ShieldAlert, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMTextArea } from '@/shared/ui/ATMTextArea';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
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

function CardHeader({ icon: Icon, title, subtitle, trailing }: { icon: LucideIcon; title: string; subtitle: string; trailing?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative flex items-center gap-3">
        <div className="absolute -right-6 -top-8 h-20 w-20 rounded-full bg-primary-500/10 blur-2xl" />
        <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-md shadow-primary-500/20 shrink-0">
          <Icon size={18} strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <h3 className="font-mono text-sm font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{subtitle}</p>}
        </div>
      </div>
      {trailing}
    </div>
  );
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
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={MessageSquare}
        iconColor="theme"
        title="SMS Templates"
        subtitle={`The plain-text bodies SMS notifications are composed from — edits apply to the very next send. Sends only happen when SMS Integration is enabled. Placeholders: {{key}}, optional {{key:default}}; {{brandName}} is always available.`}
      />

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <ATMSkeleton width="40%" height="14px" className="rounded-lg" />
          <ATMSkeleton height="42px" className="rounded-lg" />
          <ATMSkeleton width="60%" height="14px" className="rounded-lg" />
          <ATMSkeleton height="110px" className="rounded-lg" />
          <ATMSkeleton width="35%" height="14px" className="rounded-lg" />
          <ATMSkeleton height="42px" className="rounded-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Template list, grouped by category */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="mb-1.5 flex items-center gap-1.5 px-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  <span className="h-1 w-1 rounded-full bg-primary-500/70" />
                  {category}
                </p>
                <div className="flex flex-col gap-2">
                  {items.map((t) => (
                    <button
                      key={t.templateId}
                      type="button"
                      onClick={() => handleSelect(t)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
                        selectedId === t.templateId
                          ? 'border-accent-500 bg-accent-50/10 dark:border-accent-400 dark:bg-accent-950/10 shadow-sm shadow-accent-500/10'
                          : 'border-slate-200 bg-white hover:bg-slate-50/20 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                          selectedId === t.templateId
                            ? 'bg-gradient-to-br from-accent-600 to-accent-400 text-white shadow-md shadow-accent-500/20'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
                        )}
                      >
                        <SquareText size={16} strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-mono text-xs font-bold text-slate-900 dark:text-white">{t.templateName}</span>
                          {!t.isActive && <ATMBadge size="sm" color="warning" label="Inactive" />}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400 font-semibold">{t.body}</p>
                      </div>
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
              <ATMCard
                className="glass-card"
                header={
                  <CardHeader
                    icon={SquareText}
                    title={selected.templateName}
                    subtitle={`${selected.category} · plain text${selected.isActive ? '' : ' · Inactive'}`}
                    trailing={
                      <span className={cn(
                        'shrink-0 rounded-lg border px-2.5 py-1 font-mono text-xs font-bold',
                        segments > 3
                          ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400'
                          : segments > 1
                            ? 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400'
                            : 'border-[var(--zen-border)] bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400',
                      )}>
                        {chars} chars · {segments} segment{segments === 1 ? '' : 's'}
                      </span>
                    }
                  />
                }
              >
                {selected.description && (
                  <p className="mb-4 text-xs text-slate-500 dark:text-slate-400 font-semibold px-1">{selected.description}</p>
                )}

                <div className="space-y-4 pt-2">
                  {extractPlaceholders(selected).length > 0 && (
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Insert placeholder</label>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {extractPlaceholders(selected).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => insertPlaceholder(v)}
                            className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] font-semibold text-slate-700 hover:bg-primary-100 hover:text-primary-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
                    <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-950/20">
                      <ShieldAlert className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                        Over 3 segments — carriers stop delivering reliably. Shorten the message.
                      </p>
                    </div>
                  )}

                  {/* Live preview with tokens visible */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/20 p-4 dark:border-slate-800 dark:bg-slate-900/10">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Preview (raw tokens)</p>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
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
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
                <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                  <MessageSquare className="h-8 w-8 opacity-50" strokeWidth={1.8} />
                  <p className="text-sm font-bold">Select a template to edit</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SmsTemplatesPage;