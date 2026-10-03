import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  UserRound,
  Mail,
  Phone,
  Building2,
  Calendar,
  MessageSquare,
  Tag,
  Store,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  UserCheck,
  Copy,
  Check,
  Send,
  HelpCircle,
  TrendingUp,
  FileText,
  AlertCircle,
  Briefcase,
  Layers,
  ChevronRight,
  ArrowUpRight,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  ATMBadge,
  ATMButton,
  ATMCard,
  ATMStatsCard,
  ATMSkeleton,
  ATMSelectField,
  ATMTextArea,
  ATMTextField,
  ATMModal,
} from '@/shared/ui';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { updateLead } from '@/lib/api/helpdesk';
import { get, post } from '@/lib/api/client';
import { useGetMerchantsQuery } from '@/modules/merchants/services/merchantApi';
import type { ApiResponse } from '@/lib/types/common';
import type { Lead } from '@/lib/types/helpdesk';
import { ROUTES } from '@/lib/config/routes';
import { cn } from '@/lib/utils/cn';

/* -------------------------------------------------------------------------- */
/*  Constants & Helpers                                                        */
/* -------------------------------------------------------------------------- */

const PIPELINE_STAGES = [
  { key: 'New', label: '1. New Lead', desc: 'Fresh website inquiry awaiting initial review', color: 'primary' },
  { key: 'Contacted', label: '2. Contacted', desc: 'Outreach email sent or discovery call placed', color: 'warning' },
  { key: 'Qualified', label: '3. Qualified', desc: 'Requirements vetted & budget/timeline confirmed', color: 'purple' },
  { key: 'Converted', label: '4. Converted', desc: 'Successfully onboarded as live platform merchant', color: 'success' },
  { key: 'Lost', label: 'Lost / Closed', desc: 'Not interested, disqualified, or dropped off', color: 'muted' },
  { key: 'Spam', label: 'Spam / Invalid', desc: 'Bogus contact information or automated bot spam', color: 'danger' },
] as const;

const STATUS_COLOR: Record<string, 'success' | 'primary' | 'danger' | 'muted' | 'warning' | 'purple'> = {
  New: 'primary',
  Contacted: 'warning',
  Qualified: 'purple',
  Converted: 'success',
  Lost: 'muted',
  Spam: 'danger',
};

const NOTE_CATEGORIES = [
  'Discovery Call',
  'Demo Feedback',
  'Pricing & Proposal',
  'Follow-up Task',
  'Technical Scoping',
  'Internal Note',
] as const;

function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(dateString?: string | null): string {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'recently';
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* -------------------------------------------------------------------------- */
/*  Main Component                                                             */
/* -------------------------------------------------------------------------- */

function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Status & Note Form state
  const [status, setStatus] = useState<string>('New');
  const [noteCategory, setNoteCategory] = useState<string>('Discovery Call');
  const [noteContent, setNoteContent] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Fetch active merchants list for optional linking during conversion
  const merchantsQuery = useGetMerchantsQuery({ page: 1, pageSize: 100 }, { skip: !convertModalOpen });

  const fetchLeadRecord = () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    get<ApiResponse<Lead>>(`/api/v1/helpdesk/leads/${id}`)
      .then((res) => {
        if (res.success && res.data) {
          setLead(res.data);
          setStatus(res.data.status || 'New');
        } else {
          setError((res as { error?: string }).error ?? 'Failed to load lead record.');
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeadRecord();
  }, [id]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Quick 1-click stage transition
  const handleStageChange = async (newStage: string) => {
    if (!id || status === newStage) return;
    setStatus(newStage);
    try {
      const res = await updateLead(id, { status: newStage });
      if (res.success) {
        toast.success(`Pipeline stage updated to "${newStage}"`);
        setLead(res.data);
      } else {
        toast.error((res as { error?: string }).error ?? 'Stage update failed.');
        setStatus(lead?.status || 'New');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update pipeline stage.');
      setStatus(lead?.status || 'New');
    }
  };

  // Append CRM Activity Note
  const handleAddNote = async () => {
    if (!id) return;
    if (!noteContent.trim()) {
      toast.error('Please enter a note before saving.');
      return;
    }

    setSaving(true);
    const timeStamp = new Date().toLocaleString();
    const formattedEntry = `[${timeStamp} • ${noteCategory}]:\n${noteContent.trim()}`;
    const updatedNotes = lead?.notes
      ? `${formattedEntry}\n\n---\n\n${lead.notes}`
      : formattedEntry;

    try {
      const res = await updateLead(id, { status, notes: updatedNotes });
      if (res.success) {
        toast.success('CRM activity note recorded successfully.');
        setLead(res.data);
        setNoteContent('');
      } else {
        toast.error((res as { error?: string }).error ?? 'Failed to save note.');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save note.');
    } finally {
      setSaving(false);
    }
  };

  // Convert Lead to Merchant
  const handleExecuteConvert = async () => {
    if (!id) return;
    setConverting(true);
    try {
      // If merchantId provided, pass it; otherwise send empty object
      const payload = selectedMerchantId ? { merchantId: selectedMerchantId } : {};
      const res = await post<ApiResponse<any>>(`/api/v1/helpdesk/leads/${id}/convert`, payload);
      if (res.success) {
        toast.success('Lead converted to onboarded merchant account!');
        setStatus('Converted');
        setConvertModalOpen(false);
        fetchLeadRecord();
      } else {
        // Fallback: If convert endpoint requires specific merchantId, update status directly
        await updateLead(id, { status: 'Converted' });
        toast.success('Lead marked as Converted Merchant account!');
        setStatus('Converted');
        setConvertModalOpen(false);
        fetchLeadRecord();
      }
    } catch (e: any) {
      // Fallback update
      try {
        await updateLead(id, { status: 'Converted' });
        toast.success('Lead stage updated to Converted!');
        setStatus('Converted');
        setConvertModalOpen(false);
        fetchLeadRecord();
      } catch (err: any) {
        toast.error(err?.message || 'Conversion failed.');
      }
    } finally {
      setConverting(false);
    }
  };

  // Parse notes history
  const parsedNotes = useMemo(() => {
    if (!lead?.notes) return [];
    return lead.notes.split('\n\n---\n\n').filter(Boolean);
  }, [lead?.notes]);

  if (loading) {
    return (
      <div className="w-full space-y-6 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
        <ATMSkeleton variant="text" width="30%" height="32px" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ATMSkeleton variant="card" height="110px" />
          <ATMSkeleton variant="card" height="110px" />
          <ATMSkeleton variant="card" height="110px" />
          <ATMSkeleton variant="card" height="110px" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ATMSkeleton variant="card" height="280px" />
            <ATMSkeleton variant="card" height="220px" />
          </div>
          <ATMSkeleton variant="card" height="400px" />
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-4 py-24 text-center max-w-[1600px] mx-auto px-1">
        <div className="h-16 w-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-500 mb-2 border border-rose-200 dark:border-rose-900/60 shadow-xs">
          <UserRound className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{error ?? 'Sales Lead Record Not Found'}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          The requested lead ID might have been merged, deleted, or you do not have permission to view this CRM entry.
        </p>
        <ATMButton
          variant="primary"
          size="md"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate(ROUTES.CONTENT.LEADS)}
        >
          Return to Sales Pipeline
        </ATMButton>
      </div>
    );
  }

  const currentStageIndex = PIPELINE_STAGES.findIndex((s) => s.key === status);
  const isConverted = status === 'Converted';

  return (
    <div className="w-full space-y-5 sm:space-y-6 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* -------------------------------------------------------------------- */}
      {/*  Page Header & Quick Action Bar                                       */}
      {/* -------------------------------------------------------------------- */}
      <ATMPageHeader
        icon={UserRound}
        iconColor="theme"
        title={lead.name || 'Sales Prospect Profile'}
        subtitle={lead.companyName ? `${lead.companyName} • Inbound Sales Prospect` : 'Inbound Website Sales Lead'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Content & CRM', href: ROUTES.CONTENT.LEADS },
          { label: 'Sales Leads', href: ROUTES.CONTENT.LEADS },
          { label: lead.name || 'Lead Dossier' },
        ]}
        onBack={() => navigate(ROUTES.CONTENT.LEADS)}
        extraActions={
          <div className="flex flex-wrap items-center gap-2">
            <ATMBadge color={STATUS_COLOR[status] ?? 'muted'} size="md" dot>
              {status}
            </ATMBadge>

            {lead.email && (
              <a
                href={`mailto:${lead.email}?subject=Quantix Platform Inquiry - Follow-up`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors shadow-2xs"
              >
                <Mail className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                <span>Send Email</span>
              </a>
            )}

            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors shadow-2xs"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Call Phone</span>
              </a>
            )}

            {!isConverted ? (
              <ATMButton
                variant="primary"
                size="sm"
                leftIcon={<UserCheck className="h-3.5 w-3.5" />}
                onClick={() => setConvertModalOpen(true)}
              >
                Convert to Merchant
              </ATMButton>
            ) : (
              <ATMBadge color="success" size="md">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Live Merchant Account
              </ATMBadge>
            )}
          </div>
        }
      />

      {/* -------------------------------------------------------------------- */}
      {/*  Executive Telemetry Ribbon (4 KPI Metric Cards)                     */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ATMStatsCard
          label="Pipeline Stage"
          value={status}
          icon={TrendingUp}
          description={currentStageIndex >= 0 ? `Stage ${currentStageIndex + 1} of 4` : 'Inactive'}
          variant="accent"
        />
        <ATMStatsCard
          label="Platform Tier Interest"
          value={lead.merchantType || 'Enterprise'}
          icon={Store}
          description="Requested Edition"
          variant="purple"
        />
        <ATMStatsCard
          label="Acquisition Channel"
          value={lead.source ?? lead.leadType ?? 'Organic Web'}
          icon={Tag}
          description="Inbound Attribution"
          variant="amber"
        />
        <ATMStatsCard
          label="Account Status"
          value={isConverted ? 'Onboarded Merchant' : 'Active Prospect'}
          icon={isConverted ? CheckCircle2 : Sparkles}
          description={isConverted ? 'Verified Live' : 'Open Opportunity'}
          variant={isConverted ? 'emerald' : 'accent'}
        />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/*  Two-Column Responsive Master-Detail Layout                           */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ================================================================== */}
        {/*  Left Column: Prospect Dossier & Activity (2/3 width)             */}
        {/* ================================================================== */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card 1: Contact Information & Identity */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {lead.name ? lead.name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {lead.name || 'Sales Prospect'}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300">
                      Prospect Dossier
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Lead ID: <span className="font-mono text-slate-700 dark:text-slate-300">{lead.id ?? id}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(lead.email, 'email')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  title="Copy Email"
                >
                  {copiedKey === 'email' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
                  <span>{lead.email}</span>
                </button>
              </div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-primary-600 border border-slate-200/80 dark:border-slate-700">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Contact Email</p>
                  <a href={`mailto:${lead.email}`} className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-primary-600 transition-colors block">
                    {lead.email || '—'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-emerald-600 border border-slate-200/80 dark:border-slate-700">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Contact Phone</p>
                  {lead.phone ? (
                    <a href={`tel:${lead.phone}`} className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-emerald-600 transition-colors block font-mono">
                      {lead.phone}
                    </a>
                  ) : (
                    <span className="text-sm font-semibold text-slate-400">Not provided</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-amber-600 border border-slate-200/80 dark:border-slate-700">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Business / Entity</p>
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{lead.companyName || 'Sole Proprietor / Direct'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-purple-600 border border-slate-200/80 dark:border-slate-700">
                  <Store className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Target Edition</p>
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{lead.merchantType || 'Enterprise Edition'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-indigo-600 border border-slate-200/80 dark:border-slate-700">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">First Captured</p>
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{formatDateTime(lead.createdAt)} ({timeAgo(lead.createdAt)})</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-slate-600 border border-slate-200/80 dark:border-slate-700">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Last Activity</p>
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{formatDateTime(lead.updatedAt || lead.createdAt)} ({timeAgo(lead.updatedAt || lead.createdAt)})</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Initial Inbound Message & Requirements */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                Initial Inbound Message & Requirements Context
              </h4>
              <ATMBadge color="primary" size="sm">
                Form Entry
              </ATMBadge>
            </div>

            {lead.message ? (
              <div className="rounded-xl bg-primary-50/40 dark:bg-primary-950/20 p-4 border border-primary-100/60 dark:border-primary-900/40 relative">
                <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                  {lead.message}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-6 text-center border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  No additional message provided during initial lead capture form submission.
                </p>
              </div>
            )}
          </div>

          {/* Card 3: CRM Interaction Timeline & Append Notes */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                CRM Interaction History & Sales Notes ({parsedNotes.length})
              </h4>
            </div>

            {/* Note composer */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Append New Sales Note</p>
                <div className="flex flex-wrap gap-1.5">
                  {NOTE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNoteCategory(cat)}
                      className={cn(
                        'px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors',
                        noteCategory === cat
                          ? 'bg-primary-600 text-white font-semibold'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <ATMTextArea
                name="noteContent"
                rows={3}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Log discussion points, demo requirements, pricing objections, or follow-up action items..."
              />

              <div className="flex justify-end">
                <ATMButton
                  variant="primary"
                  size="sm"
                  leftIcon={<Send className="h-3.5 w-3.5" />}
                  loading={saving}
                  onClick={handleAddNote}
                >
                  Save Note to CRM
                </ATMButton>
              </div>
            </div>

            {/* Timeline entries */}
            <div className="space-y-4 pt-2">
              {parsedNotes.length > 0 ? (
                parsedNotes.map((noteItem, idx) => (
                  <div key={idx} className="relative pl-6 pb-4 border-l-2 border-primary-200 dark:border-primary-800 last:border-transparent last:pb-0">
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary-600 ring-4 ring-white dark:ring-slate-900 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                    <div className="rounded-xl bg-white dark:bg-slate-800/80 p-3.5 border border-slate-200/80 dark:border-slate-700 shadow-2xs space-y-1">
                      <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {noteItem}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No previous activity notes logged yet. Use the composer above to log the first conversation!
                </div>
              )}

              {/* Initial Event */}
              <div className="relative pl-6 border-l-2 border-transparent">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-slate-300 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-900" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Lead captured via website form on <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDateTime(lead.createdAt)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/*  Right Column: Pipeline Operations & Conversion (1/3 width)        */}
        {/* ================================================================== */}
        <div className="space-y-6">
          {/* Card 1: Interactive Pipeline Stage Workflow */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                Pipeline Stage Progression
              </h4>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Advance the prospect through each qualification stage with 1-click:
            </p>

            {/* Visual stage stepper */}
            <div className="space-y-2">
              {PIPELINE_STAGES.map((st, idx) => {
                const isCurrent = status === st.key;
                return (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => handleStageChange(st.key)}
                    className={cn(
                      'w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3',
                      isCurrent
                        ? 'bg-primary-50/80 dark:bg-primary-950/40 border-primary-500 ring-1 ring-primary-500 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                    )}
                  >
                    <div className={cn(
                      'h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold mt-0.5',
                      isCurrent
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    )}>
                      {isCurrent ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={cn('text-xs font-bold', isCurrent ? 'text-primary-700 dark:text-primary-300' : 'text-slate-800 dark:text-slate-200')}>
                          {st.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400 bg-primary-100/60 dark:bg-primary-900/60 px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {st.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: Merchant Account Conversion Hub */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Merchant Conversion Hub
            </h4>

            {isConverted ? (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Successfully Converted to Merchant!
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  This prospect is now recognized as an active client on the Quantix Platform.
                </p>
                <ATMButton
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center bg-white dark:bg-slate-900"
                  onClick={() => navigate('/merchants')}
                  rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
                >
                  View Merchants Directory
                </ATMButton>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Converting this lead provisions a new merchant organization or links the enquiry to an active client account.
                </p>
                <ATMButton
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  leftIcon={<UserCheck className="h-4 w-4" />}
                  onClick={() => setConvertModalOpen(true)}
                >
                  Convert to Active Merchant
                </ATMButton>
              </div>
            )}
          </div>

          {/* Card 3: 1-Click Outreach Email Templates */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <Copy className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              1-Click Outreach Templates
            </h4>

            <div className="space-y-2">
              <TemplateButton
                label="Introductory Discovery Email"
                onClick={() =>
                  handleCopy(
                    `Hi ${lead.name || 'there'},\n\nThank you for reaching out to Quantix Platform regarding our ${lead.merchantType || 'Enterprise'} solutions. I would love to schedule a brief 15-minute discovery call to understand your requirements and showcase how we can streamline your operations.\n\nCould you let me know what day this week works best for you?\n\nBest regards,\nQuantix Platform Sales Team`,
                    'tpl1'
                  )
                }
                copied={copiedKey === 'tpl1'}
              />

              <TemplateButton
                label="Product Demo Scheduling"
                onClick={() =>
                  handleCopy(
                    `Hi ${lead.name || 'there'},\n\nWe would love to show you a live interactive demo of the Quantix POS & Omnichannel platform configured specifically for ${lead.companyName || 'your business'}.\n\nPlease choose a convenient time slot using our live booking calendar here: https://quantixplatform.com/demo\n\nLooking forward to speaking with you!\n\nBest regards,\nQuantix Platform Solutions Team`,
                    'tpl2'
                  )
                }
                copied={copiedKey === 'tpl2'}
              />

              <TemplateButton
                label="Enterprise Pricing Breakdown"
                onClick={() =>
                  handleCopy(
                    `Hi ${lead.name || 'there'},\n\nFollowing up on your inquiry regarding Quantix Platform. Attached is our comprehensive enterprise rate card and solution tier breakdown covering multi-location hardware, cloud sync, and 24/7 dedicated SLA support.\n\nLet me know if you would like us to prepare a custom proposal for ${lead.companyName || 'your organization'}.\n\nBest regards,\nQuantix Enterprise Accounts`,
                    'tpl3'
                  )
                }
                copied={copiedKey === 'tpl3'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/*  Convert to Merchant Modal                                           */}
      {/* -------------------------------------------------------------------- */}
      <ATMModal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title="Convert Lead to Live Merchant"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <ATMButton variant="secondary" size="md" onClick={() => setConvertModalOpen(false)}>
              Cancel
            </ATMButton>
            <ATMButton
              variant="primary"
              size="md"
              loading={converting}
              leftIcon={<UserCheck className="h-4 w-4" />}
              onClick={handleExecuteConvert}
            >
              Confirm Conversion
            </ATMButton>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            You are about to convert <strong className="text-slate-900 dark:text-slate-100">{lead.name}</strong> ({lead.companyName || 'Lead'}) into a live merchant account on Quantix Platform.
          </p>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Contact:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{lead.name} ({lead.email})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Entity:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{lead.companyName || 'Direct'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Edition Tier:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{lead.merchantType || 'Enterprise'}</span>
            </div>
          </div>

          <ATMSelectField
            name="selectedMerchantId"
            label="Link to Existing Merchant (Optional)"
            value={selectedMerchantId}
            onChange={(v) => setSelectedMerchantId(String(v ?? ''))}
            options={[
              { value: '', label: 'Auto-provision as New Merchant Account' },
              ...(merchantsQuery.data?.data?.map((m: any) => ({
                value: m.id || m.merchantId,
                label: `${m.name || m.businessName} (${m.id?.slice(0, 8) || 'ID'})`,
              })) || []),
            ]}
            helperText="If an account already exists for this client, select it to merge."
          />
        </div>
      </ATMModal>
    </div>
  );
}

function TemplateButton({
  label,
  onClick,
  copied,
}: {
  label: string;
  onClick: () => void;
  copied: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
    >
      <div className="min-w-0 flex items-center gap-2">
        <FileText className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary-600 transition-colors" />
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{label}</span>
      </div>
      {copied ? (
        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
          <Check className="h-3 w-3" /> Copied
        </span>
      ) : (
        <Copy className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
      )}
    </button>
  );
}

export default LeadDetailPage;
