import React from 'react';
import { useDeploymentCurrency } from '@/lib/hooks/useDeploymentCurrency';
import { cn } from '@/lib/utils/cn';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import { StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import {
  Check,
  X,
  Pencil,
  Archive,
  Users,
  MapPin,
  Monitor,
  Star,
  Banknote,
  Layers,
  Eye,
} from 'lucide-react';
import type { Plan } from '../types/plan.types';
import { FLAVOUR_DISPLAY } from '../types/plan.types';

interface PlanCardProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  onToggleStatus: (planId: string) => void;
  onViewDetails: (plan: Plan) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetails,
}) => {
  const { currency } = useDeploymentCurrency();
  const isPopular = plan.popular;
  const isMuted = plan.status !== 'Active';
  const accentColor = plan.color || '#3b82f6';

  const storesLabel = plan.maxLocations === 0 ? 'Unlimited Stores' : `${plan.maxLocations} Locations`;
  const registersLabel = plan.maxTerminals === 0 ? 'Unlimited Registers' : `${plan.maxTerminals} Terminals`;

  const tiles = [
    {
      label: 'Stores',
      value: storesLabel,
      icon: MapPin,
      tint: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    },
    {
      label: 'Registers',
      value: registersLabel,
      icon: Monitor,
      tint: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
    },
    {
      label: 'Subscribers',
      value: plan.merchantCount > 0 ? `${plan.merchantCount.toLocaleString()}` : 'No subscribers yet',
      icon: Users,
      tint: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      label: 'Tier Priority',
      value: `#${plan.priority}`,
      icon: Layers,
      tint: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    },
  ];

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border bg-white/70 dark:bg-[#13151a]/80 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-lg',
        isMuted
          ? 'border-dashed border-slate-200 dark:border-slate-800'
          : ''
      )}
      style={isMuted ? undefined : { borderColor: `${accentColor}30` }}
    >
      {/* Decorative gradient blur — mirrors ATMStatsCard */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 w-32 h-32 blur-3xl rounded-full opacity-20 dark:opacity-10 transition-all duration-500 group-hover:scale-110"
        style={{ backgroundColor: isMuted ? '#94a3b8' : `${accentColor}55` }}
      />

      <div className="relative flex flex-col flex-1 p-5">
        {/* Identity header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn('h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-md shrink-0', isMuted && 'opacity-60')}
              style={{
                background: isMuted
                  ? 'linear-gradient(135deg, #94a3b8, #cbd5e1)'
                  : `linear-gradient(135deg, ${accentColor}, ${accentColor}b3)`,
                boxShadow: isMuted ? undefined : `0 4px 12px ${accentColor}40`,
              }}
            >
              <Banknote size={22} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {isPopular && !isMuted && <Star size={12} className="fill-amber-400 stroke-amber-400 shrink-0" />}
                <h3
                  className={cn('text-base font-extrabold truncate', isMuted ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white')}
                  title={plan.name}
                >
                  {plan.name}
                </h3>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {plan.planType} · {FLAVOUR_DISPLAY[plan.flavour]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <StatusBadge status={plan.status} />
            <ATMSwitch
              name={`card-switch-${plan.id}`}
              checked={plan.status === 'Active'}
              onChange={() => onToggleStatus(plan.id)}
              size="sm"
            />
          </div>
        </div>

        {/* Emphasis price */}
        <div className="mt-4 flex items-end gap-1.5">
          <span
            className={cn('text-3xl font-black tracking-tighter tabular-nums leading-none', isMuted ? 'text-slate-400' : 'text-slate-900 dark:text-white')}
            style={isMuted ? undefined : { color: accentColor }}
          >
            {formatCurrencyOrDash(plan.monthlyPrice, currency)}
          </span>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-0.5">/month</span>
        </div>
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-1.5">
          Billed {formatCurrencyOrDash(plan.yearlyPrice, currency)}/yr · {formatCurrencyOrDash(plan.dailyPrice, currency)}/day
        </p>

        {/* Info tiles — Signup Queue detail-card style */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {tiles.map((tile, i) => {
            const TileIcon = tile.icon;
            return (
              <div key={i} className="p-4 rounded-xl border border-[var(--zen-border)] bg-white dark:bg-zinc-950 flex items-start gap-3">
                <div className={cn('p-2 rounded-lg mt-0.5', tile.tint)}>
                  <TileIcon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">{tile.label}</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 break-words" title={tile.value}>
                    {tile.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Capabilities */}
        <div className="pt-5 flex-1">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
            <span className="h-px w-4 bg-slate-200 dark:bg-slate-700" />
            Capabilities Included
          </p>
          {plan.features.length === 0 ? (
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              All standard POS capabilities included.
            </p>
          ) : (
            <ul className="space-y-2">
              {plan.features.slice(0, 4).map((feature, idx) =>
                feature.included ? (
                  <li key={idx} className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="h-[18px] w-[18px] rounded-full flex items-center justify-center shrink-0"
                      style={
                        isMuted
                          ? { backgroundColor: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' }
                          : { backgroundColor: `${accentColor}1a`, color: accentColor, border: `1px solid ${accentColor}33` }
                      }
                    >
                      <Check size={10} strokeWidth={3.5} />
                    </span>
                    <span className="text-xs font-semibold leading-tight text-slate-700 dark:text-slate-200 truncate" title={feature.text}>
                      {feature.text}
                    </span>
                  </li>
                ) : (
                  <li key={idx} className="flex items-center gap-2.5 min-w-0">
                    <span className="h-[18px] w-[18px] rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 flex items-center justify-center shrink-0">
                      <X size={10} strokeWidth={2.5} />
                    </span>
                    <span className="text-xs font-semibold text-slate-400 line-through dark:text-slate-600 truncate" title={feature.text}>
                      {feature.text}
                    </span>
                  </li>
                ),
              )}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-4 mt-5 border-t border-slate-100 dark:border-slate-800/60">
          <span className={cn('text-[11px] font-bold', isMuted ? 'text-slate-400 dark:text-slate-500' : 'text-emerald-600 dark:text-emerald-400')}>
            {isMuted ? 'Closed for new signups' : 'Accepting new signups'}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onViewDetails(plan)}
              className="inline-flex items-center justify-center h-9 w-9 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              title="View Details"
            >
              <Eye className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => onEdit(plan)}
              className="inline-flex items-center justify-center h-9 w-9 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              title="Edit Plan"
            >
              <Pencil className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(plan)}
              className="inline-flex items-center justify-center h-9 w-9 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
              title="Remove Plan"
            >
              <Archive className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;