import React, { useState } from 'react';
import { Mail, Send, Eye, Check } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMTextArea } from '@/shared/ui/ATMTextArea';
import { cn } from '@/lib/utils/cn';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  lastModified: string;
  mergeVars: string[];
}

const INITIAL_TEMPLATES: EmailTemplate[] = [
  { id: '1', name: 'Welcome', subject: 'Welcome to Quantix, {{merchantName}}!', body: 'Dear {{merchantName}},\n\nThank you for choosing Quantix Enterprise POS. Your account has been created successfully.\n\nYour login credentials have been sent separately. Please change your password on first login.\n\nBest regards,\nQuantix Team', lastModified: '2026-03-20', mergeVars: ['{{merchantName}}', '{{email}}', '{{loginUrl}}'] },
  { id: '2', name: 'Invoice', subject: 'Invoice #{{invoiceNumber}} - {{amount}} Due', body: 'Dear {{merchantName}},\n\nPlease find attached your invoice #{{invoiceNumber}} for {{amount}}.\n\nDue Date: {{dueDate}}\n\nPayment can be made via your portal dashboard.\n\nRegards,\nQuantix Billing', lastModified: '2026-03-18', mergeVars: ['{{merchantName}}', '{{invoiceNumber}}', '{{amount}}', '{{dueDate}}'] },
  { id: '3', name: 'Suspension Warning', subject: 'Action Required: Account Suspension Warning', body: 'Dear {{merchantName}},\n\nYour account is overdue by {{overdueDays}} days. Your account will enter the {{nextPhase}} phase in {{daysRemaining}} days.\n\nPlease settle your outstanding balance of {{amount}} to avoid service disruption.\n\nRegards,\nQuantix Team', lastModified: '2026-03-15', mergeVars: ['{{merchantName}}', '{{overdueDays}}', '{{nextPhase}}', '{{daysRemaining}}', '{{amount}}'] },
  { id: '4', name: 'Password Reset', subject: 'Password Reset Request', body: 'Dear {{userName}},\n\nWe received a password reset request for your account. Click the link below to reset your password:\n\n{{resetLink}}\n\nThis link expires in 1 hour. If you did not request this, please ignore this email.\n\nRegards,\nQuantix Security', lastModified: '2026-03-12', mergeVars: ['{{userName}}', '{{resetLink}}'] },
  { id: '5', name: 'Token Delivery', subject: 'Your Quantix License Token', body: 'Dear {{merchantName}},\n\nYour license token has been generated:\n\nToken: {{tokenValue}}\nValid Until: {{expiryDate}}\nDevice Limit: {{deviceLimit}}\n\nActivate your token in the POS application settings.\n\nRegards,\nQuantix Licensing', lastModified: '2026-03-10', mergeVars: ['{{merchantName}}', '{{tokenValue}}', '{{expiryDate}}', '{{deviceLimit}}'] },
  { id: '6', name: 'Commission Statement', subject: 'Commission Statement - {{period}}', body: 'Dear Partner,\n\nYour commission statement for {{period}} is ready:\n\nTotal Sales: {{totalSales}}\nCommission Rate: {{commissionRate}}%\nCommission Amount: {{commissionAmount}}\n\nSettlement will be processed within {{settlementDays}} business days.\n\nRegards,\nQuantix Finance', lastModified: '2026-03-08', mergeVars: ['{{period}}', '{{totalSales}}', '{{commissionRate}}', '{{commissionAmount}}', '{{settlementDays}}'] },
  { id: '7', name: 'Overdue Reminder', subject: 'Payment Overdue - {{amount}} Outstanding', body: 'Dear {{merchantName}},\n\nThis is a reminder that your payment of {{amount}} is overdue since {{dueDate}}.\n\nCurrent grace phase: {{currentPhase}}\nDays until next phase: {{daysRemaining}}\n\nPlease make a payment immediately to avoid service degradation.\n\nRegards,\nQuantix Billing', lastModified: '2026-03-05', mergeVars: ['{{merchantName}}', '{{amount}}', '{{dueDate}}', '{{currentPhase}}', '{{daysRemaining}}'] },
];

export function EmailTemplatesPage() {
  const [templates] = useState<EmailTemplate[]>(INITIAL_TEMPLATES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const selected = templates.find((t) => t.id === selectedId) ?? null;

  const handleSelect = (template: EmailTemplate) => {
    setSelectedId(template.id);
    setEditSubject(template.subject);
    setEditBody(template.body);
    setShowPreview(false);
  };

  const insertMergeVar = (v: string) => {
    setEditBody((prev) => prev + v);
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Email Templates
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
          Manage transactional email templates with merge variables.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Template list */}
        <div className="lg:col-span-1">
          <div className="flex flex-col gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelect(t)}
                className={cn(
                  'w-full rounded-xl border p-3 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
                  selectedId === t.id
                    ? 'border-accent-500 bg-accent-50/10 dark:border-accent-400 dark:bg-accent-950/10'
                    : 'border-gray-200 bg-white hover:bg-gray-55/20 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800/80',
                )}
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{t.name}</span>
                </div>
                <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400 font-semibold">{t.subject}</p>
                <p className="mt-1.5 text-[10px] text-gray-400 dark:text-gray-500 font-bold">Modified: {t.lastModified}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          {selected ? (
            <ATMCard className="glass-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selected.name} Template</h3>
                <div className="flex gap-2">
                  <ATMButton
                    variant={showPreview ? 'primary' : 'secondary'}
                    size="sm"
                    icon={Eye}
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    Preview
                  </ATMButton>
                  <ATMButton variant="secondary" size="sm" icon={Send} onClick={() => toast.success('Test email sent')}>
                    Send Test
                  </ATMButton>
                </div>
              </div>

              {!showPreview ? (
                <div className="space-y-4 pt-2">
                  {/* Subject */}
                  <ATMTextField
                    name="subject"
                    label="Subject"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                  />

                  {/* Merge variable buttons */}
                  <div>
                    <label className="text-xs font-bold text-gray-550 dark:text-gray-400">Insert Merge Variable</label>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {selected.mergeVars.map((v) => (
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

                  {/* Body */}
                  <ATMTextArea
                    name="body"
                    label="Body"
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={14}
                  />

                  <div className="flex justify-end pt-2">
                    <ATMButton variant="primary" size="sm" icon={Check} onClick={() => toast.success('Template saved')}>
                      Save Template
                    </ATMButton>
                  </div>
                </div>
              ) : (
                /* Preview */
                <div className="rounded-xl border border-gray-200 bg-gray-55/20 p-6 dark:border-gray-800 dark:bg-gray-900/10">
                  <div className="mb-4 border-b border-gray-200 dark:border-gray-800 pb-3">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Subject:</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{editSubject}</p>
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300 font-medium">
                    {editBody}
                  </div>
                </div>
              )}
            </ATMCard>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-800">
              <p className="text-sm text-gray-400 dark:text-gray-550 font-bold">ATMSelect a template to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailTemplatesPage;
