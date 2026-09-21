import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMViewModeToggle } from '@/shared/ui/ATMViewModeToggle';
import { ATMStatsCard, ATMEmptyState } from '@/shared/ui';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMTable, ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { ATMSearch } from '@/shared/components/SearchInput/ATMSearch';
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
  Pencil,
  SearchX
} from 'lucide-react';

export interface PricingItem {
  key: string;
  name: string;
  unit?: string;
}

// 2026-07-25: canonical labels — matches Quantix.Foundation.Licensing.FeatureCodes.Advance.
// WTM label fixed (Waste Management, not Workforce & Tables turn).
export const MODULES_INFO: PricingItem[] = [
  { key: 'INV', name: 'Advance Inventory' },
  { key: 'FIN', name: 'Finance & Accounts' },
  { key: 'HRM', name: 'Human Resource Management' },
  { key: 'MKT', name: 'Marketing & Promotions' },
  { key: 'ANL', name: 'Advance Analytics & Reports' },
  { key: 'WTM', name: 'Waste Management (Restaurant)' },
];

// 2026-07-25: expanded to all 7 canonical PaymentMethodCodes; fixed label drifts
// (GFT → Gift Card, WLT → Mobile Wallet, CSL → Credit Sale).
export const PAYMENTS_INFO: PricingItem[] = [
  { key: 'CSH', name: 'Cash' },
  { key: 'CRD', name: 'Card' },
  { key: 'GFT', name: 'Gift Card' },
  { key: 'STC', name: 'Store Credit' },
  { key: 'WLT', name: 'Mobile Wallet' },
  { key: 'EXT', name: 'External / Manual' },
  { key: 'CSL', name: 'Credit Sale' },
];

// 2026-07-25: aligned to canonical Quantix.Foundation.Licensing.ServiceTypeCodes (10 codes).
// Flavour tags shown in labels: (Restaurant) = Restaurant-only; (Retail) = Retail-only;
// no tag = applies to both flavours.
export const SERVICES_INFO: PricingItem[] = [
  { key: 'DIN', name: 'Dine-In (Restaurant)' },
  { key: 'CTR', name: 'Counter (Restaurant)' },
  { key: 'PUP', name: 'Pickup' },
  { key: 'DLV', name: 'Delivery (in-house drivers)' },
  { key: 'CTG', name: 'Catering (Restaurant)' },
  { key: 'SNP', name: 'Snap Order' },
  { key: 'RSO', name: 'Reseller Order (Uber Eats / DoorDash)' },
  { key: 'SHP', name: 'Shipping (Retail)' },
  { key: 'INS', name: 'In-Store (Retail)' },
  { key: 'WRV', name: 'Web Reservation (Restaurant)' },
];

// 2026-07-19: aligned to canonical Quantix.Foundation.Licensing.LimitCodes (16 codes).
// Fixed MPG (Max Payment Gateways, not Product Groups). Dropped bogus OTH.
// Every unit is priced from unit 1 — no "baseline included free" concept.
export const LIMITS_INFO: PricingItem[] = [
  { key: 'MBU', name: 'Business',                                    unit: '/business' },
  { key: 'MLO', name: 'Location / Outlet',                           unit: '/outlet' },
  { key: 'MTM', name: 'POS Terminal',                                unit: '/terminal' },
  { key: 'MPR', name: 'Product (per 100)',                           unit: '/100 items' },
  { key: 'MDP', name: 'Delivery Partner',                            unit: '/partner' },
  { key: 'MKD', name: 'Kitchen Display Helper',                      unit: '/helper' },
  { key: 'MDS', name: 'Dispatch Station Helper',                     unit: '/helper' },
  { key: 'MIS', name: 'Inventory Station Helper',                    unit: '/helper' },
  { key: 'MPW', name: 'Table POS App (BDS / PaymentWalker)',         unit: '/app' },
  { key: 'MGB', name: 'Database Storage',                            unit: '/GB' },
  { key: 'MPG', name: 'Payment Gateway',                             unit: '/gateway' },
  { key: 'MRS', name: 'Reseller (delivery aggregator)',              unit: '/reseller' },
  { key: 'MAC', name: 'Cloud Admin Portal Instance',                 unit: '/instance' },
  { key: 'MWR', name: 'Web Restaurant Storefront',                   unit: '/storefront' },
  { key: 'MWE', name: 'Web Retail Storefront',                       unit: '/storefront' },
  { key: 'MBR', name: 'Billing Revenue (hard cap — not billed)',     unit: '/unit' }
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
  DIN: UtensilsCrossed,
  CTR: ShoppingBag,
  PUP: ShoppingBag,
  DLV: Truck,
  CTG: UtensilsCrossed,
  SNP: Zap,
  RSO: Globe,        // Reseller Order — inbound aggregator channel
  SHP: Package,      // Shipping — Retail courier fulfilment
  INS: Landmark,     // In-Store — Retail walk-in sale
  WRV: CalendarCheck, // Web Reservation
  MBU: Building,
  MLO: MapPin,
  MTM: Terminal,
  MPR: Layers,
  MDP: Truck,
  MKD: UtensilsCrossed,
  MDS: Package,
  MIS: ClipboardList,
  MPW: Terminal,
  MGB: HardDrive,
  MPG: Coins,
  MRS: Globe,
  MAC: Landmark,
  MWR: UtensilsCrossed,
  MWE: ShoppingBag,
  MBR: LineChart,
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
      ? 'hover:border-emerald-500/30 dark:hover:border-emerald-500/20'
      : color === 'amber'
      ? 'hover:border-amber-500/30 dark:hover:border-amber-500/20'
      : 'hover:border-indigo-500/30 dark:hover:border-indigo-500/20';

  const iconBgClass =
    color === 'emerald'
      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/40 dark:border-emerald-900/10'
      : color === 'amber'
      ? 'bg-amber-50 dark:bg-amber-950/15 text-amber-600 dark:text-amber-500 border border-amber-100/40 dark:border-amber-900/10'
      : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/40 dark:border-indigo-900/10';

  const badgeBgClass =
    color === 'emerald'
      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/20'
      : color === 'amber'
      ? 'bg-amber-50/70 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 border border-amber-100/20'
      : 'bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100/20';

  const priceTextClass =
    color === 'emerald'
      ? 'text-emerald-600 dark:text-emerald-400'
      : color === 'amber'
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-indigo-600 dark:text-indigo-400';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 px-1">
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg border shrink-0', iconBgClass)}>
          <Icon size={16} className="stroke-[2.2]" />
        </span>
        <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
        <span className={cn('px-1.5 py-0.5 rounded-md text-[9px] font-black', badgeBgClass)}>{items.length}</span>
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(({ key, name, unit }) => {
          const ItemIcon = ICON_MAP[key] || Puzzle;
          const price = prices[key] ?? 0;
          return (
            <div
              key={key}
              className={`group relative p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-[var(--zen-surface)] ${borderHoverClass} hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[140px]`}
            >
              {/* Top Row: Icon & Key Badge */}
              <div className="flex items-center justify-between w-full">
                <div className={`p-2.5 rounded-lg ${iconBgClass} shrink-0 group-hover:scale-105 transition-transform`}>
                  <ItemIcon size={18} className="stroke-[2.2]" />
                </div>
                <span className={`font-mono text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full ${badgeBgClass} uppercase`}>
                  {key}
                </span>
              </div>

              {/* Middle: Full Name */}
              <div className="mt-3.5 flex-1">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-snug group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {name}
                </h4>
              </div>

              {/* Bottom: Price tag */}
              <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-baseline gap-1">
                <span className={`text-base font-black ${priceTextClass}`}>
                  +${Number(price ?? 0).toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wider">
                  {unit || '/day'}
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'modules' | 'payments' | 'services' | 'limits'>('all');

  if (!defaultCard) {
    return (
      <div className="p-12 text-center text-sm font-semibold text-slate-500 animate-pulse">
        Loading rate card configurations...
      </div>
    );
  }

  // Flatten items for unified Table List view
  const allRateCardItems = [
    ...MODULES_INFO.map(item => ({
      ...item,
      category: 'Premium Module',
      price: defaultCard.modulePrices[item.key as keyof typeof defaultCard.modulePrices],
      color: 'indigo',
      type: 'modules'
    })),
    ...PAYMENTS_INFO.map(item => ({
      ...item,
      category: 'Payment Channel',
      price: defaultCard.paymentPrices[item.key as keyof typeof defaultCard.paymentPrices],
      color: 'emerald',
      type: 'payments'
    })),
    ...SERVICES_INFO.map(item => ({
      ...item,
      category: 'Operational Service',
      price: defaultCard.servicePrices[item.key as keyof typeof defaultCard.servicePrices],
      color: 'indigo',
      type: 'services'
    })),
    ...LIMITS_INFO.map(item => ({
      ...item,
      category: 'Capacity Limit',
      price: defaultCard.limitPrices[item.key as keyof typeof defaultCard.limitPrices],
      color: 'amber',
      type: 'limits'
    })),
  ];

  // Filtering items for list and grid views
  const filteredItems = allRateCardItems.filter(item => {
    const matchesSearch = 
      item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeCategory === 'all') return matchesSearch;
    return item.type === activeCategory && matchesSearch;
  });



  const filteredModules = MODULES_INFO.filter(item => 
    (activeCategory === 'all' || activeCategory === 'modules') &&
    (item.key.toLowerCase().includes(searchQuery.toLowerCase()) || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPayments = PAYMENTS_INFO.filter(item => 
    (activeCategory === 'all' || activeCategory === 'payments') &&
    (item.key.toLowerCase().includes(searchQuery.toLowerCase()) || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredServices = SERVICES_INFO.filter(item => 
    (activeCategory === 'all' || activeCategory === 'services') &&
    (item.key.toLowerCase().includes(searchQuery.toLowerCase()) || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredLimits = LIMITS_INFO.filter(item => 
    (activeCategory === 'all' || activeCategory === 'limits') &&
    (item.key.toLowerCase().includes(searchQuery.toLowerCase()) || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const hasAnyMatchingItems = 
    filteredModules.length > 0 || 
    filteredPayments.length > 0 || 
    filteredServices.length > 0 || 
    filteredLimits.length > 0;

  // Table Columns Definition
  const columns: ATMTableColumn<any>[] = [
    {
      key: 'key',
      header: 'Code',
      renderCell: (_, row) => (
        <span className={cn(
          "font-mono text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase border",
          row.color === 'emerald'
            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100/20'
            : row.color === 'amber'
            ? 'bg-amber-50/70 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 border-amber-100/20'
            : 'bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100/20'
        )}>
          {row.key}
        </span>
      ),
      width: '100px',
    },
    {
      key: 'name',
      header: 'Feature / Limit Name',
      renderCell: (_, row) => {
        const ItemIcon = ICON_MAP[row.key] || Puzzle;
        return (
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "p-1.5 rounded-md shrink-0 border",
              row.color === 'emerald'
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border-emerald-100/40 dark:border-emerald-900/10'
                : row.color === 'amber'
                ? 'bg-amber-50 dark:bg-amber-950/15 text-amber-500 border-amber-100/40 dark:border-amber-900/10'
                : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 border-indigo-100/40 dark:border-indigo-900/10'
            )}>
               <ItemIcon size={14} className="stroke-[2.2]" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
              {row.name}
            </span>
          </div>
        );
      }
    },
    {
      key: 'category',
      header: 'Category',
      renderCell: (_, row) => (
        <ATMBadge
          color={row.color === 'emerald' ? 'success' : row.color === 'amber' ? 'warning' : 'purple'}
          label={row.category}
          size="sm"
        />
      ),
      width: '180px',
    },
    {
      key: 'price',
      header: 'Rate / Price',
      renderCell: (_, row) => (
        <span className={cn(
          "font-black text-xs",
          row.color === 'emerald'
            ? 'text-emerald-600 dark:text-emerald-400'
            : row.color === 'amber'
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-indigo-600 dark:text-indigo-400'
        )}>
          +${Number(row.price ?? 0).toFixed(2)} <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold tracking-wider">{row.unit || '/day'}</span>
        </span>
      ),
      width: '150px',
    }
  ];

return (
    <div className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto animate-page-enter">
      {/* Header and Controls */}
      <ATMPageHeader
        title="Feature Rate Cards"
        subtitle="Baseline billing rates and features mapped directly from active token specifications"
        icon={Tags}
        iconColor="indigo"
        breadcrumbs={[{ label: 'Billing' }, { label: 'Feature Rate Cards' }]}
        extraActions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Pro Search Input */}
            <ATMSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search code or feature..."
              className="w-full sm:w-60"
            />

            <div className="flex items-center gap-3">
              <ATMViewModeToggle value={viewMode} onChange={setViewMode} />

              <ATMButton onClick={onEditOpen} variant="primary" icon={Pencil} size="sm" className="h-9 rounded-lg">
                Edit Prices
              </ATMButton>
            </div>
          </div>
        }
      />

      {/* Clickable Pro Statistics Dashboard for interactive filtering.
           Clicking a tile toggles its category filter (re-click clears back to All). */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ATMStatsCard
          label="Capacity Limits"
          value={LIMITS_INFO.length}
          icon={Terminal}
          variant="amber"
          description="Active capacity limits"
          onClick={() => setActiveCategory(activeCategory === 'limits' ? 'all' : 'limits')}
          className={cn(activeCategory === 'limits' && 'ring-2 ring-amber-500/30')}
        />
        <ATMStatsCard
          label="Operational Services"
          value={SERVICES_INFO.length}
          icon={Activity}
          variant="indigo"
          description="Active operational services"
          onClick={() => setActiveCategory(activeCategory === 'services' ? 'all' : 'services')}
          className={cn(activeCategory === 'services' && 'ring-2 ring-indigo-500/30')}
        />
        <ATMStatsCard
          label="Payment Methods"
          value={PAYMENTS_INFO.length}
          icon={Coins}
          variant="emerald"
          description="Active payment channels"
          onClick={() => setActiveCategory(activeCategory === 'payments' ? 'all' : 'payments')}
          className={cn(activeCategory === 'payments' && 'ring-2 ring-emerald-500/30')}
        />
        <ATMStatsCard
          label="Premium Modules"
          value={MODULES_INFO.length}
          icon={Layers3}
          variant="accent"
          description="Active module add-ons"
          onClick={() => setActiveCategory(activeCategory === 'modules' ? 'all' : 'modules')}
          className={cn(activeCategory === 'modules' && 'ring-2 ring-primary-500/30')}
        />
      </div>

      {/* Render Dynamic Content based on View Mode.
          2026-07-25: section order — Limits, Services, Payments, Modules. */}
      {viewMode === 'grid' ? (
        <div className="space-y-8">
          {filteredLimits.length > 0 && (
            <RateCardGridSection
              title="Capacity & Limits Rates"
              icon={Terminal}
              items={filteredLimits}
              prices={defaultCard.limitPrices}
              color="amber"
            />
          )}

          {filteredServices.length > 0 && (
            <RateCardGridSection
              title="Operational Services"
              icon={Activity}
              items={filteredServices}
              prices={defaultCard.servicePrices}
              color="indigo"
            />
          )}

          {filteredPayments.length > 0 && (
            <RateCardGridSection
              title="Payment Methods"
              icon={Coins}
              items={filteredPayments}
              prices={defaultCard.paymentPrices}
              color="emerald"
            />
          )}

          {filteredModules.length > 0 && (
            <RateCardGridSection
              title="Premium Modules Add-ons"
              icon={Layers3}
              items={filteredModules}
              prices={defaultCard.modulePrices}
              color="indigo"
            />
          )}

          {!hasAnyMatchingItems && (
            <ATMEmptyState
              icon={SearchX}
              title="No matching pricing items"
              description={`Nothing matches "${searchQuery}" — try a different query or clear the category filter.`}
            />
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[var(--zen-surface)] overflow-hidden shadow-sm">
          <ATMTable
            columns={columns}
            data={filteredItems}
            isLoading={false}
            emptyMessage="No rate card items found matching search query."
          />
        </div>
      )}
    </div>
  );
};

export default RateCardListPage;
