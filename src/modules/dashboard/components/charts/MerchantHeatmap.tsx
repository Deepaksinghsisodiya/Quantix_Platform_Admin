import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { HEATMAP_COLORS } from './chartColors';
import { ChartSkeleton } from './ChartSkeleton';
import { ChartEmptyState } from './ChartEmptyState';

// ---------------------------------------------------------------------------
// FRS-SAP-106: Merchant Health Heatmap (extended with churn risk + balance/usage)
// ---------------------------------------------------------------------------

export type MerchantActivityLevel = 'active' | 'low' | 'inactive' | 'atRisk';

export interface MerchantHeatmapEntry {
  readonly merchantId: string;
  readonly name: string;
  readonly activity: MerchantActivityLevel;
  readonly lastSeen: string;
  readonly transactionsLast7d: number;
  readonly merchantType: 'Enterprise' | 'Standalone';
  /** Token balance remaining — Standalone merchants only */
  readonly tokenBalance?: number | null;
  /** Usage rate percentage — Enterprise merchants only */
  readonly usageRate?: number | null;
  /** Churn risk score 0–100, higher = more risk */
  readonly churnRiskScore?: number;
}

export interface MerchantHeatmapProps {
  data: readonly MerchantHeatmapEntry[];
  loading?: boolean;
  onMerchantClick?: (merchantId: string) => void;
  className?: string;
}

const ACTIVITY_LABELS: Record<MerchantActivityLevel, string> = {
  active: 'Active',
  low: 'Low Activity',
  inactive: 'Inactive',
  atRisk: 'At Risk',
};

const ACTIVITY_BG: Record<MerchantActivityLevel, string> = {
  active: 'bg-green-500',
  low: 'bg-yellow-400',
  inactive: 'bg-orange-500',
  atRisk: 'bg-red-500',
};

const ACTIVITY_BG_HOVER: Record<MerchantActivityLevel, string> = {
  active: 'hover:bg-green-600',
  low: 'hover:bg-yellow-500',
  inactive: 'hover:bg-orange-600',
  atRisk: 'hover:bg-red-600',
};

function formatRiskScore(score: number | undefined): string {
  if (score == null) return '—';
  if (score >= 75) return `${score} (High)`;
  if (score >= 50) return `${score} (Medium)`;
  if (score >= 25) return `${score} (Low)`;
  return `${score} (Minimal)`;
}

function riskScoreColor(score: number | undefined): string {
  if (score == null) return 'text-gray-400';
  if (score >= 75) return 'text-red-600 dark:text-red-400';
  if (score >= 50) return 'text-orange-600 dark:text-orange-400';
  if (score >= 25) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

/**
 * FRS-SAP-106: Merchant health heatmap.
 * Grid of coloured cells where each cell represents one merchant.
 * Hover shows details including token balance/usage rate and churn risk score.
 */
export function MerchantHeatmap({ data, loading, onMerchantClick, className }: MerchantHeatmapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hovered = data.find((t) => t.merchantId === hoveredId) ?? null;

  const handleClick = useCallback(
    (merchantId: string) => {
      onMerchantClick?.(merchantId);
    },
    [onMerchantClick],
  );

  if (loading) return <ChartSkeleton height="280px" className={className} />;
  if (!data.length) return <ChartEmptyState message="No merchant health data available." className={className} />;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        {(Object.entries(ACTIVITY_LABELS) as [MerchantActivityLevel, string][]).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: HEATMAP_COLORS[key] }}
            />
            {label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="flex flex-wrap gap-1">
        {data.map((merchant) => (
          <button
            key={merchant.merchantId}
            type="button"
            className={cn(
              'h-4 w-4 rounded-[3px] transition-all duration-150 cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
              'dark:focus:ring-offset-gray-900',
              ACTIVITY_BG[merchant.activity],
              ACTIVITY_BG_HOVER[merchant.activity],
              hoveredId === merchant.merchantId && 'ring-2 ring-white dark:ring-gray-800 scale-125',
            )}
            title={merchant.name}
            onMouseEnter={() => setHoveredId(merchant.merchantId)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleClick(merchant.merchantId)}
            aria-label={`${merchant.name}: ${ACTIVITY_LABELS[merchant.activity]}`}
          />
        ))}
      </div>

      {/* Hover detail — extended with churn risk + balance/usage */}
      <div
        className={cn(
          'rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs transition-opacity duration-150',
          'dark:border-gray-700 dark:bg-gray-800',
          hovered ? 'opacity-100' : 'opacity-0',
        )}
        aria-live="polite"
      >
        {hovered ? (
          <div className="space-y-1">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-900 dark:text-gray-100">{hovered.name}</span>
              <span className="text-gray-500 dark:text-gray-400">{hovered.merchantType}</span>
              <span className="text-gray-500 dark:text-gray-400">
                {hovered.transactionsLast7d} txn/7d
              </span>
              <span
                className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                style={{ backgroundColor: HEATMAP_COLORS[hovered.activity] }}
              >
                {ACTIVITY_LABELS[hovered.activity]}
              </span>
            </div>
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
              {/* Token balance for Standalone, usage rate for Enterprise */}
              {hovered.merchantType === 'Standalone' && hovered.tokenBalance != null && (
                <span>Token Balance: <span className="font-medium text-gray-700 dark:text-gray-300">{hovered.tokenBalance} days</span></span>
              )}
              {hovered.merchantType === 'Enterprise' && hovered.usageRate != null && (
                <span>Usage Rate: <span className="font-medium text-gray-700 dark:text-gray-300">{hovered.usageRate}%</span></span>
              )}
              {/* Churn risk score */}
              {hovered.churnRiskScore != null && (
                <span>
                  Churn Risk:{' '}
                  <span className={cn('font-medium', riskScoreColor(hovered.churnRiskScore))}>
                    {formatRiskScore(hovered.churnRiskScore)}
                  </span>
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">Hover a cell to see merchant details</span>
        )}
      </div>
    </div>
  );
}
