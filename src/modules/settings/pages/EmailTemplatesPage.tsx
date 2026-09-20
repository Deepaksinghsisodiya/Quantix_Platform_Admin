import React, { useEffect, useState } from 'react';
import { Mail, Send, Eye, Check } from 'lucide-react';
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
    <div className="flex flex-col gap-6 animate-page-enter">
      <div>
        {/* Title matches the sidebar label. */}
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Email Templates
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
          The templates every transactional email is composed from — edits apply to the very next
          send. Placeholders: {'{{key}}'}, optional {'{{key:default}}'}, conditional{' '}
          {'{{#if key}}…{{/if}}'}.
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
                        <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">{t.templateName}</span>
                        {!t.isActive && <ATMBadge size="sm" color="warning" label="Inactive" />}
                      </div>
                      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400 font-semibold">{t.subject}</p>
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
                  <div className="flex gap-2">
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
                </div>
                {selected.description && (
                  <p className="mb-4 text-xs text-gray-500 dark:text-gray-400 font-semibold">{selected.description}</p>
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
                        <label className="text-xs font-bold text-gray-550 dark:text-gray-400">Insert placeholder</label>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {extractPlaceholders(selected).map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => insertMergeVar(v)}
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
                  <div className="rounded-xl border border-gray-200 bg-gray-55/20 p-6 dark:border-gray-800 dark:bg-gray-900/10">
                    <div className="mb-4 border-b border-gray-200 dark:border-gray-800 pb-3">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Subject:</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{editSubject}</p>
                    </div>
                    {selected.contentType.includes('html') ? (
                      // eslint-disable-next-line react/no-danger
                      <div
                        className="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: editBody }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300 font-medium">
                        {editBody}
                      </div>
                    )}
                  </div>
                )}
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

export default EmailTemplatesPage;
