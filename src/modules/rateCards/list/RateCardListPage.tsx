import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMTable, ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { ATMSearch } from '@/shared/components/SearchInput/ATMSearch';
import { RateCard } from '../types/rateCard.types';
import { LayoutGrid, List,
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
      ? 'hover:border-emerald-500/30 dark:hover:border-emerald-500/20'
      : color === 'amber'
      ? 'hover:border-amber-500/30 dark:hover:border-amber-500/20'
      : 'hover:border-indigo-500/30 dark:hover:border-indigo-500/20';

  const iconBgClass =
    color === 'emerald'
      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 border border-emerald-100/40 dark:border-emerald-900/10'
      : color === 'amber'
      ? 'bg-amber-50 dark:bg-amber-955/15 text-amber-600 dark:text-amber-500 border border-amber-100/40 dark:border-amber-900/10'
      : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-100/40 dark:border-indigo-900/10';

  const badgeBgClass =
    color === 'emerald'
      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/20'
      : color === 'amber'
      ? 'bg-amber-50/70 dark:bg-amber-955/20 text-amber-600 dark:text-amber-550 border border-amber-100/20'
      : 'bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 border border-indigo-100/20';

  const priceTextClass =
    color === 'emerald'
      ? 'text-emerald-600 dark:text-emerald-400'
      : color === 'amber'
      ? 'text-amber-650 dark:text-amber-450'
      : 'text-indigo-600 dark:text-indigo-400';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Icon className={`h-4.5 w-4.5 text-${color === 'emerald' ? 'emerald' : color === 'amber' ? 'amber' : 'indigo'}-500`} />
        <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(({ key, name, unit }) => {
          const ItemIcon = ICON_MAP[key] || Puzzle;
          const price = prices[key] ?? 0;
          return (
            <div
              key={key}
              className={`group relative p-5 rounded-xl border border-slate-150 dark:border-slate-800/80 bg-[var(--zen-surface)] ${borderHoverClass} hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[140px]`}
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
                  +${price}.00
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wider">
                  {unit || '/mo'}
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
            ? 'bg-amber-50/70 dark:bg-amber-955/20 text-amber-600 dark:text-amber-550 border-amber-100/20'
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
                ? 'bg-amber-50 dark:bg-amber-955/15 text-amber-500 border-amber-100/40 dark:border-amber-900/10'
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
            ? 'text-amber-655 dark:text-amber-450'
            : 'text-indigo-600 dark:text-indigo-400'
        )}>
          +${row.price}.00 <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold tracking-wider">{row.unit || '/mo'}</span>
        </span>
      ),
      width: '150px',
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Feature Rate Cards</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Baseline billing rates and features mapped directly from active token specifications
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* Pro Search Input */}
          <ATMSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search code or feature..."
            className="w-full sm:w-60"
          />

          <div className="flex items-center gap-3">
            {/* List/Grid View Toggle */}
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-950">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                )}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                )}
                title="List Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <ATMButton onClick={onEditOpen} variant="primary" icon={Pencil} size="sm" className="h-9 rounded-lg">
              Edit Prices
            </ATMButton>
          </div>
        </div>
      </div>

      {/* Clickable Pro Statistics Dashboard for interactive filtering */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveCategory(activeCategory === 'modules' ? 'all' : 'modules')}
          className={cn(
            "p-4 rounded-xl border bg-[var(--zen-surface)] hover:shadow-sm cursor-pointer transition-all duration-300 select-none",
            activeCategory === 'modules'
              ? "border-indigo-500 dark:border-indigo-500 bg-indigo-50/5 dark:bg-indigo-950/10 ring-2 ring-indigo-500/10"
              : "border-[var(--zen-border)] hover:border-indigo-550/20 dark:hover:border-indigo-500/20"
          )}
        >
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Premium Modules</span>
          <span className={cn(
            "text-xl font-black mt-1 inline-block transition-colors",
            activeCategory === 'modules' ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-white"
          )}>{MODULES_INFO.length} Active</span>
        </div>

        <div 
          onClick={() => setActiveCategory(activeCategory === 'payments' ? 'all' : 'payments')}
          className={cn(
            "p-4 rounded-xl border bg-[var(--zen-surface)] hover:shadow-sm cursor-pointer transition-all duration-300 select-none",
            activeCategory === 'payments'
              ? "border-emerald-500 dark:border-emerald-500 bg-emerald-50/5 dark:bg-emerald-950/10 ring-2 ring-emerald-500/10"
              : "border-[var(--zen-border)] hover:border-emerald-555/20 dark:hover:border-emerald-500/20"
          )}
        >
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Payment channels</span>
          <span className={cn(
            "text-xl font-black mt-1 inline-block transition-colors",
            activeCategory === 'payments' ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
          )}>{PAYMENTS_INFO.length} Active</span>
        </div>

        <div 
          onClick={() => setActiveCategory(activeCategory === 'services' ? 'all' : 'services')}
          className={cn(
            "p-4 rounded-xl border bg-[var(--zen-surface)] hover:shadow-sm cursor-pointer transition-all duration-300 select-none",
            activeCategory === 'services'
              ? "border-indigo-500 dark:border-indigo-500 bg-indigo-50/5 dark:bg-indigo-950/10 ring-2 ring-indigo-500/10"
              : "border-[var(--zen-border)] hover:border-indigo-550/20 dark:hover:border-indigo-500/20"
          )}
        >
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Operational Services</span>
          <span className={cn(
            "text-xl font-black mt-1 inline-block transition-colors",
            activeCategory === 'services' ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-white"
          )}>{SERVICES_INFO.length} Active</span>
        </div>

        <div 
          onClick={() => setActiveCategory(activeCategory === 'limits' ? 'all' : 'limits')}
          className={cn(
            "p-4 rounded-xl border bg-[var(--zen-surface)] hover:shadow-sm cursor-pointer transition-all duration-300 select-none",
            activeCategory === 'limits'
              ? "border-amber-500 dark:border-amber-500 bg-amber-50/5 dark:bg-amber-950/10 ring-2 ring-amber-500/10"
              : "border-[var(--zen-border)] hover:border-amber-550/20 dark:hover:border-amber-500/20"
          )}
        >
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Capacity Limits</span>
          <span className={cn(
            "text-xl font-black mt-1 inline-block transition-colors",
            activeCategory === 'limits' ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"
          )}>{LIMITS_INFO.length} Active</span>
        </div>
      </div>

      {/* Render Dynamic Content based on View Mode */}
      {viewMode === 'grid' ? (
        <div className="space-y-8">
          {filteredModules.length > 0 && (
            <RateCardGridSection
              title="Premium Modules Add-ons"
              icon={Layers3}
              items={filteredModules}
              prices={defaultCard.modulePrices}
              color="indigo"
            />
          )}

          {filteredPayments.length > 0 && (
            <RateCardGridSection
              title="Premium Payment Channels"
              icon={Coins}
              items={filteredPayments}
              prices={defaultCard.paymentPrices}
              color="emerald"
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

          {filteredLimits.length > 0 && (
            <RateCardGridSection
              title="Capacity & Limits Rates"
              icon={Terminal}
              items={filteredLimits}
              prices={defaultCard.limitPrices}
              color="amber"
            />
          )}

          {!hasAnyMatchingItems && (
            <div className="p-12 text-center text-sm font-semibold text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-zinc-950/10">
              No matching pricing items found. Try a different query.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-150 dark:border-slate-800 bg-[var(--zen-surface)] overflow-hidden shadow-sm">
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
