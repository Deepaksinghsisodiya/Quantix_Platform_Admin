import React, { useState } from 'react';
import { useFormikContext } from 'formik';
import {
  TrendingDown,
  AlertTriangle,
  Layers,
  PackageX,
  Clock,
  ArrowRightLeft,
  RefreshCw,
  LineChart,
  Barcode,
  WifiOff,
  UtensilsCrossed,
  ChefHat,
  Plus,
  Trash2,
  Save,
  X,
  Eye,
  Zap,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { ATMButton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import type { SaveBusinessProblemDto } from '../Model/BusinessProblemTypes';

const AVAILABLE_ICONS = [
  { key: 'TrendingDown', label: 'Trending Down', icon: TrendingDown },
  { key: 'AlertTriangle', label: 'Alert Triangle', icon: AlertTriangle },
  { key: 'Layers', label: 'Layers', icon: Layers },
  { key: 'PackageX', label: 'Package X', icon: PackageX },
  { key: 'Clock', label: 'Clock', icon: Clock },
  { key: 'ArrowRightLeft', label: 'Transfer Sync', icon: ArrowRightLeft },
  { key: 'RefreshCw', label: 'Refresh / Push', icon: RefreshCw },
  { key: 'LineChart', label: 'Line Chart', icon: LineChart },
  { key: 'Barcode', label: 'Barcode', icon: Barcode },
  { key: 'WifiOff', label: 'Offline / Wifi Off', icon: WifiOff },
  { key: 'UtensilsCrossed', label: 'Utensils', icon: UtensilsCrossed },
  { key: 'ChefHat', label: 'Chef Hat', icon: ChefHat },
];

const SEVERITY_OPTIONS = [
  { value: 'CRITICAL', label: 'CRITICAL (High Friction, Lost Revenue)' },
  { value: 'HIGH RISK', label: 'HIGH RISK (Process Inconsistency)' },
  { value: 'BLINDSPOT', label: 'BLINDSPOT (Zero Real-Time Visibility)' },
];

const SITE_VARIANTS = [
  { value: 'Enterprise', label: 'Enterprise Platform' },
  { value: 'Restaurant', label: 'Restaurant & Dining' },
  { value: 'Retail', label: 'Retail & Checkout' },
];

interface BusinessProblemFormProps {
  isLoading: boolean;
  onCancel: () => void;
  isEdit?: boolean;
}

export const BusinessProblemForm: React.FC<BusinessProblemFormProps> = ({
  isLoading,
  onCancel,
  isEdit = false,
}) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting } =
    useFormikContext<SaveBusinessProblemDto>();

  const [previewTab, setPreviewTab] = useState<'problem' | 'solution'>('problem');
  const isPreviewSolution = previewTab === 'solution';

  const MainIcon =
    AVAILABLE_ICONS.find((i) => i.key === values.iconKey)?.icon || AlertTriangle;
  const MeterIcon =
    AVAILABLE_ICONS.find((i) => i.key === values.visualMeterIconKey)?.icon || ArrowRightLeft;

  const handleAddFix = () => {
    const currentFixes = values.fixes || [];
    setFieldValue('fixes', [...currentFixes, '']);
  };

  const handleRemoveFix = (index: number) => {
    const currentFixes = values.fixes || [];
    setFieldValue(
      'fixes',
      currentFixes.filter((_, i) => i !== index)
    );
  };

  const handleFixChange = (index: number, val: string) => {
    const currentFixes = [...(values.fixes || [])];
    currentFixes[index] = val;
    setFieldValue('fixes', currentFixes);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: Inputs (7 Cols) */}
      <div className="xl:col-span-7 space-y-6">
        {/* Section 1: Classification & Target Platform */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
            <span className="flex h-6 w-6 rounded-full bg-[#FF4F00]/10 text-[#FF4F00] items-center justify-center text-xs font-mono font-bold">
              1
            </span>
            <span>Target Platform & Identification</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Platform <span className="text-rose-500">*</span>
              </label>
              <select
                name="siteVariant"
                value={values.siteVariant}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4F00]"
              >
                {SITE_VARIANTS.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Card Key / Slug <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="cardKey"
                value={values.cardKey}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. inventory-imbalance"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4F00]"
              />
              {touched.cardKey && errors.cardKey && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.cardKey as string}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Tab Label <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="shortTabLabel"
                value={values.shortTabLabel}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Stockouts, Kitchen"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4F00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Header Icon
              </label>
              <select
                name="iconKey"
                value={values.iconKey}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4F00]"
              >
                {AVAILABLE_ICONS.map((i) => (
                  <option key={i.key} value={i.key}>
                    {i.label} ({i.key})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Severity Level
              </label>
              <select
                name="severity"
                value={values.severity}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4F00]"
              >
                {SEVERITY_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Diagnostic Tag
              </label>
              <input
                type="text"
                name="tag"
                value={values.tag}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Store-by-Store Chaos"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4F00]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Problem Content */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
            <span className="flex h-6 w-6 rounded-full bg-[#FF4F00]/10 text-[#FF4F00] items-center justify-center text-xs font-mono font-bold">
              2
            </span>
            <span>Problem Description & System Impact</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Headline Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Disconnected Inventory & Stockouts"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4F00]"
            />
            {touched.title && errors.title && (
              <p className="mt-1 text-[11px] text-rose-500">{errors.title as string}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Problem Explanation / Narrative
            </label>
            <textarea
              name="description"
              rows={3}
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Describe the operational friction experienced by stores..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4F00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              System Impact (Revenue loss, margins, waste)
            </label>
            <textarea
              name="impact"
              rows={2}
              value={values.impact}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Revenue loss, uncoordinated food waste & unmonitored shrinkage across outlets."
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4F00]"
            />
          </div>
        </div>

        {/* Section 3: Visual Comparison Micro-Meter */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
            <span className="flex h-6 w-6 rounded-full bg-[#FF4F00]/10 text-[#FF4F00] items-center justify-center text-xs font-mono font-bold">
              3
            </span>
            <span>Live Operational Reality Micro-Meter</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Meter Icon
              </label>
              <select
                name="visualMeterIconKey"
                value={values.visualMeterIconKey}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4F00]"
              >
                {AVAILABLE_ICONS.map((i) => (
                  <option key={i.key} value={i.key}>
                    {i.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Legacy Friction Proof Text ❌
              </label>
              <input
                type="text"
                name="legacyText"
                value={values.legacyText}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Downtown 0% Stock ❌ • Uptown 180% Surplus ⚠️"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4F00]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Quantix Real-Time Sync Proof Text ✅
            </label>
            <input
              type="text"
              name="quantixText"
              value={values.quantixText}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Quantix Auto-Transfer: Stock rebalanced in 1-Click ✅"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4F00]"
            />
          </div>
        </div>

        {/* Section 4: Quantix Solution Fixes (List) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-[#FF4F00]/10 text-[#FF4F00] items-center justify-center text-xs font-mono font-bold">
                4
              </span>
              <span>Quantix Resolution Fixes ({values.fixes?.length || 0})</span>
            </h2>

            <button
              type="button"
              onClick={handleAddFix}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-orange-500/10 text-[#FF4F00] hover:bg-orange-500/20 transition-all cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Solution Bullet</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {(values.fixes || []).map((fix, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400 w-5">
                  #{idx + 1}
                </span>
                <input
                  type="text"
                  value={fix}
                  onChange={(e) => handleFixChange(idx, e.target.value)}
                  placeholder="e.g. Multi-Store Auto-Dispatch & Stock Rebalancing Engine"
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4F00]"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFix(idx)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                  title="Remove Bullet"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Status & Sorting */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
            <span className="flex h-6 w-6 rounded-full bg-[#FF4F00]/10 text-[#FF4F00] items-center justify-center text-xs font-mono font-bold">
              5
            </span>
            <span>Publish Status & Ordering</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Sort Order
              </label>
              <input
                type="number"
                name="sortOrder"
                value={values.sortOrder}
                onChange={handleChange}
                onBlur={handleBlur}
                min={0}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4F00]"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={values.isActive}
                  onChange={handleChange}
                  className="rounded text-[#FF4F00] focus:ring-[#FF4F00] h-4 w-4"
                />
                <span>Publish Live on Website (Active)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Real-Time Interactive Card Preview (5 Cols) */}
      <div className="xl:col-span-5 sticky top-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Eye size={14} className="text-[#FF4F00]" />
            <span>Interactive Website Preview</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/10 text-[#FF4F00] font-bold">
            Live Rendering
          </span>
        </div>

        {/* Render Card Preview */}
        <div
          className={cn(
            'relative overflow-hidden rounded-3xl border bg-white dark:bg-slate-900/95 p-6 shadow-xl transition-all duration-300',
            isPreviewSolution
              ? 'border-[#FF4F00]/50 ring-4 ring-[#FF4F00]/10 shadow-[0_10px_35px_rgba(255,79,0,0.12)]'
              : 'border-slate-200/90 dark:border-slate-800/90'
          )}
        >
          {/* Top Brand Accent Hairline */}
          <div
            className={cn(
              'absolute top-0 left-0 right-0 h-[3px] transition-all duration-300',
              isPreviewSolution
                ? 'bg-gradient-to-r from-[#FF4F00] via-[#FF6B2B] to-amber-400 opacity-100'
                : 'bg-gradient-to-r from-amber-400 via-orange-400 to-[#FF4F00] opacity-40'
            )}
          />

          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300',
                isPreviewSolution
                  ? 'bg-gradient-to-br from-[#FF4F00] to-[#FF6B2B] text-white border-[#FF4F00] shadow-sm shadow-orange-500/25'
                  : 'bg-orange-500/10 dark:bg-orange-500/15 text-[#FF4F00] border-orange-500/20 ring-4 ring-orange-500/5'
              )}
            >
              {isPreviewSolution ? <Zap size={19} /> : <MainIcon size={19} />}
            </div>

            <span
              className={cn(
                'text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border shrink-0 transition-colors',
                isPreviewSolution
                  ? 'text-[#FF4F00] dark:text-orange-400 bg-orange-500/10 border-orange-500/30'
                  : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              )}
            >
              {isPreviewSolution ? 'QUANTIX SOLVED' : values.severity || 'CRITICAL'}
            </span>
          </div>

          {/* Title & Description */}
          <h3 className="mt-4 font-syne text-lg font-bold text-slate-900 dark:text-white leading-snug">
            {values.title || 'Headline Title Goes Here'}
          </h3>

          <p className="mt-2 text-sm font-normal leading-relaxed text-slate-600 dark:text-slate-400">
            {values.description || 'Provide a compelling description of the multi-unit friction points.'}
          </p>

          {/* Micro-Meter */}
          <div
            className={cn(
              'mt-3.5 rounded-xl border p-3 text-[11px] font-mono leading-relaxed transition-all duration-300',
              isPreviewSolution
                ? 'border-[#FF4F00]/25 bg-orange-500/[0.05] dark:bg-orange-500/[0.08]'
                : 'border-slate-200/90 dark:border-slate-800/90 bg-slate-50/80 dark:bg-slate-800/40'
            )}
          >
            <div className="flex items-center justify-between gap-1 mb-1 pb-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <MeterIcon size={10} className={isPreviewSolution ? 'text-[#FF4F00]' : 'text-slate-400'} />
                <span>Live Operational Reality:</span>
              </span>
              <span
                className={cn(
                  'text-[9px] font-bold uppercase px-1.5 py-0.2 rounded shrink-0',
                  isPreviewSolution
                    ? 'bg-orange-500/15 text-[#FF4F00] dark:text-orange-400'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                )}
              >
                {isPreviewSolution ? 'Real-Time Sync' : 'Legacy Friction'}
              </span>
            </div>
            <p
              className={cn(
                'font-semibold leading-relaxed break-words text-[11px]',
                isPreviewSolution ? 'text-[#FF4F00] dark:text-orange-400' : 'text-slate-700 dark:text-slate-300'
              )}
            >
              {isPreviewSolution
                ? values.quantixText || 'Quantix Auto-Transfer: Stock rebalanced in 1-Click ✅'
                : values.legacyText || 'Downtown 0% Stock ❌ • Uptown 180% Surplus ⚠️'}
            </p>
          </div>

          {/* Interactive Switcher */}
          <div className="mt-3.5">
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setPreviewTab('problem')}
                className={cn(
                  'flex-1 py-1.5 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer select-none',
                  !isPreviewSolution
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold border border-slate-200/60 dark:border-slate-700/60'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                )}
              >
                <ShieldAlert size={11} className={!isPreviewSolution ? 'text-amber-500 shrink-0' : 'text-slate-400 shrink-0'} />
                <span>Legacy Friction</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('solution')}
                className={cn(
                  'flex-1 py-1.5 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer select-none',
                  isPreviewSolution
                    ? 'bg-gradient-to-r from-[#FF4F00] to-[#FF6B2B] text-white shadow-sm shadow-orange-500/25 font-bold'
                    : 'text-slate-500 hover:text-[#FF4F00] dark:text-slate-400'
                )}
              >
                <Zap size={11} className={isPreviewSolution ? 'text-white shrink-0' : 'text-[#FF4F00] shrink-0'} />
                <span>Quantix Fix</span>
              </button>
            </div>

            <div className="mt-2.5 min-h-[78px]">
              {!isPreviewSolution ? (
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.05] dark:bg-amber-500/[0.08] p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 pb-1 border-b border-amber-500/20">
                    <ShieldAlert size={10} className="shrink-0" />
                    <span>System Impact</span>
                  </div>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                    {values.impact || 'Specify revenue loss, inventory waste, or executive friction.'}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-[#FF4F00]/30 bg-orange-500/[0.05] dark:bg-orange-500/[0.1] p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF4F00] pb-1 border-b border-orange-500/20">
                    <Zap size={10} className="shrink-0 text-[#FF4F00]" />
                    <span>Quantix Resolution</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {(values.fixes || []).map((f, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-1.5 text-xs font-medium text-slate-900 dark:text-slate-100">
                        <CheckCircle2 size={11} className="text-[#FF4F00] shrink-0 mt-0.5" />
                        <span className="leading-snug">{f || 'Resolution item'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Action Controls (Bottom of Preview column) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading || isSubmitting}
            className="flex-1 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <X size={14} />
            <span>Cancel</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-[#FF4F00] to-[#FF6B2B] text-white text-xs font-semibold shadow-sm shadow-orange-500/25 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Save size={14} />
            <span>{isLoading || isSubmitting ? 'Saving...' : isEdit ? 'Update Problem' : 'Create Problem'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
