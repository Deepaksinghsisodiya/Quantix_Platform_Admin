/**
 * MarketingContentPage -- FRS-SAP-1101
 *
 * Manages marketing landing-page sections: Hero, Features, Pricing,
 * Testimonials, and CTAs. Each section is editable via a rich-text
 * editor with Draft/Published toggle.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ATMBadge, ATMButton, ATMSkeleton } from '@/shared/ui';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Sparkles,
  CreditCard,
  Quote,
  MousePointerClick,
  Save,
  Eye,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Handshake,
  Key,
  AlertTriangle,
} from 'lucide-react';

import { RichTextEditor } from '../components/RichTextEditor';
import { ContentStatusBadge } from '../components/ContentStatusBadge';
import { ContentPreview } from '../components/ContentPreview';
import { cn } from '@/lib/utils/cn';
import type { ContentStatus, MarketingContent } from '@/lib/types/content';
import { useMarketingContent, useUpdateMarketingContent } from '@/lib/hooks/useContent';

/* -------------------------------------------------------------------------- */
/*  Section definitions                                                        */
/* -------------------------------------------------------------------------- */

interface SectionDef {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const SECTIONS: SectionDef[] = [
  {
    key: 'hero',
    label: 'Hero',
    icon: <LayoutDashboard className="h-4 w-4" />,
    description: 'Main landing banner with headline, sub-text, and primary CTA.',
  },
  {
    key: 'features',
    label: 'Features',
    icon: <Sparkles className="h-4 w-4" />,
    description: 'Feature highlights grid showcasing platform capabilities.',
  },
  {
    key: 'pricing-enterprise',
    label: 'Enterprise Pricing',
    icon: <CreditCard className="h-4 w-4" />,
    description: 'Enterprise subscription plans: Starter, Professional, Business, Enterprise.',
  },
  {
    key: 'pricing-standalone',
    label: 'Standalone Token Pricing',
    icon: <Key className="h-4 w-4" />,
    description: 'Standalone token tier pricing: Basic, Standard, Advance, Premium with validity periods.',
  },
  {
    key: 'testimonials',
    label: 'Testimonials',
    icon: <Quote className="h-4 w-4" />,
    description: 'Customer success stories and merchant quotes.',
  },
  {
    key: 'case-studies',
    label: 'Case Studies',
    icon: <BookOpen className="h-4 w-4" />,
    description: 'In-depth merchant success stories with metrics and outcomes.',
  },
  {
    key: 'partner-logos',
    label: 'Partner Logos',
    icon: <Handshake className="h-4 w-4" />,
    description: 'Technology partner and integration logos showcase.',
  },
  {
    key: 'cta',
    label: 'Call to Action',
    icon: <MousePointerClick className="h-4 w-4" />,
    description: 'Bottom-of-page conversion CTAs and sign-up prompts.',
  },
];

/* -------------------------------------------------------------------------- */
/*  Local section state                                                        */
/* -------------------------------------------------------------------------- */

interface SectionState {
  content: string;
  status: ContentStatus;
  dirty: boolean;
}

type SectionMap = Record<string, SectionState>;

function buildInitialState(serverData: readonly MarketingContent[]): SectionMap {
  const map: SectionMap = {};
  for (const sec of SECTIONS) {
    const remote = serverData.find((s) => s.section === sec.key);
    map[sec.key] = {
      content: remote?.content ?? '',
      status: remote?.status ?? 'Draft',
      dirty: false,
    };
  }
  return map;
}


/* -------------------------------------------------------------------------- */
/*  Section card                                                               */
/* -------------------------------------------------------------------------- */

interface SectionCardProps {
  def: SectionDef;
  state: SectionState;
  onContentChange: (content: string) => void;
  onToggleStatus: () => void;
  onSave: () => void;
}

function SectionCard({ def, state, onContentChange, onToggleStatus, onSave }: SectionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow dark:bg-gray-900',
        state.dirty
          ? 'border-indigo-300 dark:border-indigo-700'
          : 'border-gray-200 dark:border-gray-700',
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {def.icon}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {def.label}
              </span>
              <ContentStatusBadge status={state.status} />
              {state.dirty && (
                <ATMBadge variant="warning" size="sm">Unsaved</ATMBadge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {def.description}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {/* Expandable body */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 dark:border-gray-800">
          {previewing ? (
            <ContentPreview html={state.content} />
          ) : (
            <RichTextEditor
              value={state.content}
              onChange={(v) => onContentChange(v)}
              minHeight="12rem"
            />
          )}

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ATMButton
                variant="ghost"
                size="sm"
                leftIcon={<Eye className="h-3.5 w-3.5" />}
                onClick={() => setPreviewing((p) => !p)}
              >
                {previewing ? 'Edit' : 'Preview'}
              </ATMButton>
              <button
                type="button"
                onClick={onToggleStatus}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                  state.status === 'Published'
                    ? 'bg-emerald-500'
                    : 'bg-gray-300 dark:bg-gray-600',
                )}
                role="switch"
                aria-checked={state.status === 'Published'}
                aria-label={`Toggle ${def.label} published`}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    state.status === 'Published' ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {state.status === 'Published' ? 'Published' : 'Draft'}
              </span>
            </div>

            <ATMButton
              variant="primary"
              size="sm"
              leftIcon={<Save className="h-3.5 w-3.5" />}
              disabled={!state.dirty}
              onClick={onSave}
            >
              Save Section
            </ATMButton>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page component                                                             */
/* -------------------------------------------------------------------------- */

function MarketingContentPage() {
  const [sections, setSections] = useState<SectionMap>({});

  const marketingQuery = useMarketingContent();
  const updateMut = useUpdateMarketingContent();

  // Hydrate local state from server
  useEffect(() => {
    const items = marketingQuery.data?.data;
    if (items) {
      setSections(buildInitialState(items));
    }
  }, [marketingQuery.data]);

  const isLoading = marketingQuery.isLoading;
  const isError = marketingQuery.isError;

  const handleContentChange = useCallback((key: string, content: string) => {
    setSections((prev) => {
      const current = prev[key];
      if (!current) return prev;
      return { ...prev, [key]: { ...current, content, dirty: true } };
    });
  }, []);

  const handleToggleStatus = useCallback((key: string) => {
    setSections((prev) => {
      const current = prev[key];
      if (!current) return prev;
      return {
        ...prev,
        [key]: {
          ...current,
          status: current.status === 'Published' ? ('Draft' as const) : ('Published' as const),
          dirty: true,
        },
      };
    });
  }, []);

  const handleSave = useCallback((key: string) => {
    const current = sections[key];
    if (!current) return;
    updateMut.mutate(
      { section: key, content: current.content, status: current.status },
      {
        onSuccess: () => {
          setSections((prev) => {
            const cur = prev[key];
            if (!cur) return prev;
            return { ...prev, [key]: { ...cur, dirty: false } };
          });
          toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} section saved`);
        },
        onError: () => toast.error(`Failed to save ${key} section`),
      },
    );
  }, [sections, updateMut]);

  const handleSaveAll = useCallback(() => {
    const dirtyEntries = Object.entries(sections).filter(([, v]) => v.dirty);
    if (dirtyEntries.length === 0) return;
    Promise.all(
      dirtyEntries.map(([key, v]) =>
        updateMut.mutateAsync({ section: key, content: v.content, status: v.status }),
      ),
    )
      .then(() => {
        setSections((prev) => {
          const next: SectionMap = {};
          for (const [k, v] of Object.entries(prev)) {
            next[k] = { ...v, dirty: false };
          }
          return next;
        });
        toast.success('All sections saved');
      })
      .catch(() => toast.error('Failed to save some sections'));
  }, [sections, updateMut]);

  const hasDirty = useMemo(
    () => Object.values(sections).some((s) => s.dirty),
    [sections],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Marketing Content
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Edit landing page sections for the Quantix marketing site.
          </p>
        </div>
        <ATMButton
          variant="primary"
          size="md"
          leftIcon={<Save className="h-4 w-4" />}
          disabled={!hasDirty}
          onClick={handleSaveAll}
        >
          Save All Changes
        </ATMButton>
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load marketing content.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void marketingQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      {/* Section cards */}
      {isLoading ? (
        <div className="space-y-4">
          <ATMSkeleton variant="card" count={5} height="5rem" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {SECTIONS.map((def) => (
            <SectionCard
              key={def.key}
              def={def}
              state={sections[def.key]!}
              onContentChange={(v) => handleContentChange(def.key, v)}
              onToggleStatus={() => handleToggleStatus(def.key)}
              onSave={() => handleSave(def.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MarketingContentPage;
