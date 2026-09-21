import React, { useEffect, useState } from 'react';
import { Mail, Send, Eye, Check, FileText, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMTextArea } from '@/shared/ui/ATMTextArea';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { get, put, post } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/types/common';
import { cn } from '@/lib/utils/cn';

/**
 * 2026-08-09 rebuild — the previous screen was 100% mock: seven invented templates, a Save
 * button that toasted success without any API call, a fake Send Test. This edits the REAL
 * DB templates that every transactional email is composed from (EmailTemplateComposer reads
 * them by TemplateName per send — edits apply immediately). Placeholders use the Tier-1
 * engine syntax: {{key}}, {{key:default}}, {{#if key}}…{{/if}}, {{{raw}}}.
 */

interface EmailTemplate {
  templateId: string;
  templateName: string;
  subject: string;
  body: string;
  category: string;
  contentType: string;
  description?: string | null;
  isActive: boolean;
  updatedAt?: string | null;
}

/** Extracts {{placeholder}} tokens from the template's own text for insert buttons. */
function extractPlaceholders(t: EmailTemplate): string[] {
  const source = `${t.subject}\n${t.body}\n${t.description ?? ''}`;
  const found = new Set<string>();
  for (const m of source.matchAll(/\{\{[!#/]?([A-Za-z0-9_.]+)(?::[^}]*)?\}\}/g)) {
    if (m[1] && !['if', 'else'].includes(m[1])) found.add(`{{${m[1]}}}`);
  }
  return [...found];
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
          {subtitle && <p className="text-xs text-slate-400 dark:text-gray-500 font-semibold">{subtitle}</p>}
        </div>
      </div>
      {trailing}
    </div>
  );
}

export function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const selected = templates.find((t) => t.templateId === selectedId) ?? null;
  const dirty = !!selected && (editSubject !== selected.subject || editBody !== selected.body);

  const load = async () => {
    try {
      const res = await get<ApiResponse<EmailTemplate[]>>('/api/v1/settings/email-templates');
      setTemplates(((res as any)?.data ?? []) as EmailTemplate[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load email templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSelect = (template: EmailTemplate) => {
    setSelectedId(template.templateId);
    setEditSubject(template.subject);
    setEditBody(template.body);
    setShowPreview(false);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await put(`/api/v1/settings/email-templates/${selected.templateId}`, {
        subject: editSubject,
        body: editBody,
      });
      toast.success(`Template "${selected.templateName}" saved — applies to the next send.`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save the template.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!selected) return;
    if (dirty) {
      toast.error('Save the template first — the test sends the stored version.');
      return;
    }
    setTesting(true);
    try {
      const res = await post<ApiResponse<{ message: string }>>(
        `/api/v1/settings/email-templates/${selected.templateId}/test`, {});
      toast.success(((res as any)?.data?.message ?? 'Test email sent.') as string);
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message || e?.message || 'Test send failed.');
    } finally {
      setTesting(false);
    }
  };

  const insertMergeVar = (v: string) => setEditBody((prev) => prev + v);

  const grouped = templates.reduce<Record<string, EmailTemplate[]>>((acc, t) => {
    (acc[t.category || 'Other'] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div className="flex flex-col space-y-6 w-full max-w-[1600px] mx-auto animate-page-enter pb-8">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
          <Mail size={20} strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          {/* Title matches the sidebar label. */}
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Email Templates</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-semibold">
            The templates every transactional email is composed from — edits apply to the very
            next send. Placeholders: {'{{key}}'}, optional {'{{key:default}}'}, conditional{' '}
            {'{{#if key}}…{{/if}}'}.
          </p>
        </div>
      </div>

      {loading ? (
        <ATMSkeleton className="h-72 w-full" />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Template list, grouped by category */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="mb-1.5 flex items-center gap-1.5 px-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
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
                          : 'border-slate-200 bg-white hover:bg-slate-55/20 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80',
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
                        <FileText size={16} strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-mono text-xs font-bold text-slate-900 dark:text-white">{t.templateName}</span>
                          {!t.isActive && <ATMBadge size="sm" color="warning" label="Inactive" />}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400 font-semibold">{t.subject}</p>
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
                    icon={FileText}
                    title={selected.templateName}
                    subtitle={`${selected.category} · ${selected.contentType}${selected.isActive ? '' : ' · Inactive'}`}
                    trailing={
                      <div className="flex shrink-0 gap-2">
                        <ATMButton
                          variant={showPreview ? 'primary' : 'secondary'}
                          size="sm"
                          icon={Eye}
                          onClick={() => setShowPreview(!showPreview)}
                        >
                          Preview
                        </ATMButton>
                        <ATMButton variant="secondary" size="sm" icon={Send} isLoading={testing} onClick={handleSendTest}>
                          Send Test
                        </ATMButton>
                      </div>
                    }
                  />
                }
              >
                {selected.description && (
                  <p className="mb-4 text-xs text-slate-500 dark:text-slate-400 font-semibold px-1">{selected.description}</p>
                )}

                {!showPreview ? (
                  <div className="space-y-4 pt-2">
                    <ATMTextField
                      name="subject"
                      label="Subject"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                    />

                    {extractPlaceholders(selected).length > 0 && (
                      <div>
                        <label className="text-xs font-bold text-slate-550 dark:text-gray-400">Insert placeholder</label>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {extractPlaceholders(selected).map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => insertMergeVar(v)}
                              className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] font-semibold text-slate-700 hover:bg-primary-100 hover:text-primary-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <ATMTextArea
                      name="body"
                      label={`Body (${selected.contentType})`}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={14}
                    />

                    <div className="flex justify-end pt-2">
                      <ATMButton variant="primary" size="sm" icon={Check} isLoading={saving} disabled={!dirty} onClick={handleSave}>
                        Save Template
                      </ATMButton>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-55/20 p-6 dark:border-slate-800 dark:bg-slate-900/10">
                    <div className="mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Subject:</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{editSubject}</p>
                    </div>
                    {selected.contentType.includes('html') ? (
                      // eslint-disable-next-line react/no-danger
                      <div
                        className="text-sm leading-relaxed text-slate-700 dark:text-slate-300"
                        dangerouslySetInnerHTML={{ __html: editBody }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                        {editBody}
                      </div>
                    )}
                  </div>
                )}
              </ATMCard>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
                <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-550">
                  <Mail className="h-8 w-8 opacity-50" strokeWidth={1.8} />
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

export default EmailTemplatesPage;