import React from 'react';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { RateCard } from '../types/rateCard.types';
import {
  Package,
  Coins,
  Users,
  Sparkles,
  LineChart,
  ClipboardList,
  Gift,
  Landmark,
  Wallet,
  BookOpen,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
  Zap,
  CalendarCheck,
  Globe,
  Clock,
  Building,
  MapPin,
  Terminal,
  Layers,
  Tags,
  HardDrive,
  Puzzle,
  Layers3,
  Activity,
  Pencil
} from 'lucide-react';

export interface PricingItem {
  key: string;
  name: string;
  unit?: string;
}

export const MODULES_INFO: PricingItem[] = [
  { key: 'INV', name: 'Inventory Management' },
  { key: 'FIN', name: 'Finance & Accounting' },
  { key: 'HRM', name: 'HRM & Staff Roster' },
  { key: 'MKT', name: 'Marketing & Loyalty' },
  { key: 'ANL', name: 'Advanced Analytics & BI' },
  { key: 'WTM', name: 'Workforce & Tables turn' }
];

export const PAYMENTS_INFO: PricingItem[] = [
  { key: 'GFT', name: 'Gift Cards' },
  { key: 'STC', name: 'Store Credit' },
  { key: 'WLT', name: 'Digital Wallet' },
  { key: 'CSL', name: 'Credit Ledger / Udhar' }
];

export const SERVICES_INFO: PricingItem[] = [
  { key: 'PUP', name: 'Self-Pickup Module' },
  { key: 'DLV', name: 'In-house Delivery Routing' },
  { key: 'CTG', name: 'Catering & Events' },
  { key: 'SNP', name: 'Snap QR Checkout' },
  { key: 'RSO', name: 'Table Reservation System' },
  { key: 'WOR', name: 'Web Ordering Storefront' },
  { key: 'WRV', name: 'Waitlist Management' }
];

export const LIMITS_INFO: PricingItem[] = [
  { key: 'MBU', name: 'Additional Business Units', unit: '/BU' },
  { key: 'MLO', name: 'Additional Location Outlets', unit: '/Outlet' },
  { key: 'MTM', name: 'Additional POS Terminals', unit: '/Terminal' },
  { key: 'MPR', name: 'Excess Products Catalog', unit: '/100 Items' },
  { key: 'MPG', name: 'Excess Product Groups', unit: '/5 Groups' },
  { key: 'MGB', name: 'Additional Storage Capacity', unit: '/GB' },
  { key: 'OTH', name: 'Other Limit Increments', unit: '/Item' }
];

export const ICON_MAP: Record<string, React.ComponentType<any>> = {
  INV: Package,
  FIN: Coins,
  HRM: Users,
  MKT: Sparkles,
  ANL: LineChart,
  WTM: ClipboardList,
  GFT: Gift,
  STC: Landmark,
  WLT: Wallet,
  CSL: BookOpen,
  PUP: ShoppingBag,
  DLV: Truck,
  CTG: UtensilsCrossed,
  SNP: Zap,
  RSO: CalendarCheck,
  WOR: Globe,
  WRV: Clock,
  MBU: Building,
  MLO: MapPin,
  MTM: Terminal,
  MPR: Layers,
  MPG: Tags,
  MGB: HardDrive,
  OTH: Puzzle
};

interface RateCardGridSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  items: PricingItem[];
  prices: any;
  color: 'indigo' | 'emerald' | 'amber';
}

const RateCardGridSection: React.FC<RateCardGridSectionProps> = ({
  title,
  icon: Icon,
  items,
  prices,
  color
}) => {
  const borderHoverClass =
    color === 'emerald'
      ? 'hover:border-emerald-500/30'
      : color === 'amber'
      ? 'hover:border-amber-500/30'
      : 'hover:border-indigo-500/30';

  const iconBgClass =
    color === 'emerald'
      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 border-emerald-100/40 dark:border-emerald-900/10'
      : color === 'amber'
      ? 'bg-amber-50 dark:bg-amber-955/20 text-amber-550 border-amber-100/40 dark:border-amber-900/10'
      : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 border-indigo-100/40 dark:border-indigo-900/10';

  const labelTextClass =
    color === 'emerald'
      ? 'text-emerald-650 dark:text-emerald-450'
      : color === 'amber'
      ? 'text-amber-650 dark:text-amber-500'
      : 'text-indigo-650 dark:text-indigo-400';

  const priceTextClass =
    color === 'emerald'
      ? 'text-emerald-600 dark:text-emerald-455 bg-emerald-50/70 dark:bg-emerald-950/30'
      : color === 'amber'
      ? 'text-amber-600 dark:text-amber-500 bg-amber-50/70 dark:bg-amber-955/20'
      : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/30';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Icon className={`h-4.5 w-4.5 text-${color === 'emerald' ? 'emerald' : color === 'amber' ? 'amber' : 'indigo'}-500`} />
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(({ key, name, unit }) => {
          const ItemIcon = ICON_MAP[key] || Puzzle;
          const price = prices[key] ?? 0;
          return (
            <div
              key={key}
              className={`group relative p-5 rounded-lg border border-[var(--zen-border)] bg-[var(--zen-surface)] ${borderHoverClass} hover:shadow-sm hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-lg ${iconBgClass} shrink-0 group-hover:scale-110 transition-transform`}>
                  <ItemIcon size={20} className="stroke-[2.2]" />
                </div>
                <div>
                  <span className={`font-mono text-[10px] font-black tracking-widest ${labelTextClass} block uppercase`}>
                    {key}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 leading-snug">
                    {name}
                  </h4>
                </div>
              </div>
              <div className="border-t border-[var(--zen-border)] mt-4 pt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pricing</span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded ${priceTextClass}`}>
                  +${price}.00{unit || '/mo'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface RateCardListPageProps {
  defaultCard: RateCard;
  onEditOpen: () => void;
}

export const RateCardListPage: React.FC<RateCardListPageProps> = ({
  defaultCard,
  onEditOpen
}) => {
  if (!defaultCard) {
    return (
      <div className="p-12 text-center text-sm font-semibold text-slate-500 animate-pulse">
        Loading rate card configurations...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Feature Rate Cards</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Baseline billing rates and features mapped directly from active token specifications
          </p>
        </div>

        {/* Edit Action Button using ATMButton built-in icon prop to prevent stacking */}
        <div className="flex items-center gap-2">
          <ATMButton onClick={onEditOpen} variant="primary" icon={Pencil} size="sm" className="h-9 rounded-lg">
            Edit Prices
          </ATMButton>
        </div>
      </div>

      {/* Modern Banner Header (Vercel Style) */}
      <div className="rounded-lg border border-[var(--zen-border)] bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400 flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3.5 w-3.5" /> System Pricing Config
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{defaultCard.name}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Active and locked baseline rates matching token payload matrices (excluding free items).
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <ATMBadge color="success" label="Active Default" size="md" />
          <span className="font-mono text-[10px] text-slate-450 dark:text-slate-500 border border-[var(--zen-border)] px-2.5 py-1 rounded bg-slate-50/50 dark:bg-zinc-950/20">
            ID: {defaultCard.id}
          </span>
        </div>
      </div>

      {/* Premium Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-[var(--zen-border)] bg-[var(--zen-surface)] hover:border-indigo-500/20 transition-colors">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Premium Modules</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 inline-block">{MODULES_INFO.length} Active</span>
        </div>
        <div className="p-4 rounded-lg border border-[var(--zen-border)] bg-[var(--zen-surface)] hover:border-emerald-500/20 transition-colors">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Payment channels</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 inline-block">{PAYMENTS_INFO.length} Active</span>
        </div>
        <div className="p-4 rounded-lg border border-[var(--zen-border)] bg-[var(--zen-surface)] hover:border-indigo-500/20 transition-colors">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Operational Services</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 inline-block">{SERVICES_INFO.length} Active</span>
        </div>
        <div className="p-4 rounded-lg border border-[var(--zen-border)] bg-[var(--zen-surface)] hover:border-amber-500/20 transition-colors">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Capacity Limits</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 inline-block">{LIMITS_INFO.length} Active</span>
        </div>
      </div>

      {/* Reusable Category Sections */}
      <RateCardGridSection
        title="Premium Modules Add-ons"
        icon={Layers3}
        items={MODULES_INFO}
        prices={defaultCard.modulePrices}
        color="indigo"
      />

      <RateCardGridSection
        title="Premium Payment Channels"
        icon={Coins}
        items={PAYMENTS_INFO}
        prices={defaultCard.paymentPrices}
        color="emerald"
      />

      <RateCardGridSection
        title="Operational Services"
        icon={Activity}
        items={SERVICES_INFO}
        prices={defaultCard.servicePrices}
        color="indigo"
      />

      <RateCardGridSection
        title="Capacity & Limits Rates"
        icon={Terminal}
        items={LIMITS_INFO}
        prices={defaultCard.limitPrices}
        color="amber"
      />
    </div>
  );
};

export default RateCardListPage;
