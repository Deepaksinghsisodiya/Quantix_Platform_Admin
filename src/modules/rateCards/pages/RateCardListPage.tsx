import React from 'react';
import { useAppSelector } from '@/app/hooks';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import {
  Building,
  CreditCard,
  Database,
  Terminal,
  Sparkles,
  DollarSign,
  Activity,
  Layers,
  Coins,
  CheckCircle,
  Users
} from 'lucide-react';

export const RateCardListPage: React.FC = () => {
  const rateCards = useAppSelector((state) => state.rateCards.rateCards);
  const defaultCard = rateCards.find((c) => c.isDefault) || rateCards[0];

  if (!defaultCard) {
    return (
      <div className="p-6 text-center text-sm font-semibold text-slate-500">
        Loading rate card configurations...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ATMPageHeader
        title="Feature Rate Cards"
        subtitle="Baseline prices and incremental feature/limit costs used for subscription calculations"
      />

      {/* Hero Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ATMCard className="p-5 flex items-center justify-between border border-[var(--zen-border)] bg-[var(--zen-surface)]">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Rate Card</p>
            <p className="text-sm font-extrabold mt-1.5 text-emerald-600 dark:text-emerald-455 flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 stroke-[3]" /> {defaultCard?.name || 'Standard Card'}
            </p>
          </div>
          <Activity className="h-8 w-8 text-emerald-500 opacity-60" />
        </ATMCard>

        <ATMCard className="p-5 flex items-center justify-between border border-[var(--zen-border)] bg-[var(--zen-surface)]">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Monthly Base</p>
            <p className="text-2xl font-black mt-1 text-slate-900 dark:text-white">
              {defaultCard ? formatCurrency(defaultCard.baseMonthlyPrice) : '$29.00'}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-indigo-500 opacity-60" />
        </ATMCard>

        <ATMCard className="p-5 flex items-center justify-between border border-[var(--zen-border)] bg-[var(--zen-surface)]">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status</p>
            <div className="mt-2.5">
              <ATMBadge color="success" label="Active & Fixed" size="sm" />
            </div>
          </div>
          <Layers className="h-8 w-8 text-blue-500 opacity-60" />
        </ATMCard>
      </div>

      {/* Base Prices Grid */}
      <ATMCard title="Baseline Standard Subscription Rates" className="p-6 border border-[var(--zen-border)] bg-[var(--zen-surface)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="p-4 rounded-lg bg-slate-50/50 dark:bg-zinc-950/30 border border-[var(--zen-border)]">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Base Daily Price</span>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">${defaultCard.baseDailyPrice.toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50/50 dark:bg-zinc-950/30 border border-[var(--zen-border)]">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Base Weekly Price</span>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">${defaultCard.baseWeeklyPrice.toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50/50 dark:bg-zinc-950/30 border border-[var(--zen-border)]">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Base Monthly Price</span>
            <p className="text-xl font-black text-primary-600 dark:text-primary-400 mt-1">${defaultCard.baseMonthlyPrice.toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50/50 dark:bg-zinc-950/30 border border-[var(--zen-border)]">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Base Yearly Price</span>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">${defaultCard.baseYearlyPrice.toFixed(2)}</p>
          </div>
        </div>
      </ATMCard>

      {/* Main Feature Matrices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Modules Pricing */}
        <ATMCard
          title="6 Premium Module Add-ons"
          subtitle="Additional monthly charges when modules are enabled on standard plans"
          className="border border-[var(--zen-border)] bg-[var(--zen-surface)]"
        >
          <div className="divide-y divide-[var(--zen-border)] mt-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-955/20 flex items-center justify-center text-blue-500">
                  <Building size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Inventory Management (INV)</p>
                  <p className="text-[10px] text-slate-400">Stock sync, alerts, and vendor purchase orders</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.modulePrices.INV}.00 /mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-purple-50 dark:bg-purple-955/20 flex items-center justify-center text-purple-500">
                  <Coins size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Finance & Accounting (FIN)</p>
                  <p className="text-[10px] text-slate-400">Tax ledgers, invoices expense, and profit reports</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.modulePrices.FIN}.00 /mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-indigo-50 dark:bg-indigo-955/20 flex items-center justify-center text-indigo-500">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">HRM & Staff Roster (HRM)</p>
                  <p className="text-[10px] text-slate-400">Timesheets, attendance logs, and staff permissions</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.modulePrices.HRM}.00 /mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-rose-50 dark:bg-rose-955/20 flex items-center justify-center text-rose-500">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Marketing & Loyalty (MKT)</p>
                  <p className="text-[10px] text-slate-400">Campaign managers, stamp cards, and gift codes</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.modulePrices.MKT}.00 /mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-amber-50 dark:bg-amber-955/20 flex items-center justify-center text-amber-500">
                  <Database size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Advanced Analytics & BI (ANL)</p>
                  <p className="text-[10px] text-slate-400">Custom business intelligence, trends, and charts</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.modulePrices.ANL}.00 /mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-emerald-50 dark:bg-emerald-955/20 flex items-center justify-center text-emerald-500">
                  <Terminal size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-950 dark:text-slate-100">Workforce & Tables (WTM)</p>
                  <p className="text-[10px] text-slate-400">Table turn management and kitchen display mapping</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.modulePrices.WTM}.00 /mo</span>
            </div>
          </div>
        </ATMCard>

        {/* Payments Pricing */}
        <ATMCard
          title="7 Integrated Payment Channels"
          subtitle="Cost additions based on enabled card, wallets, or ledger integrations"
          className="border border-[var(--zen-border)] bg-[var(--zen-surface)]"
        >
          <div className="divide-y divide-[var(--zen-border)] mt-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-slate-450 w-8">CSH</p>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Cash Register Processing</p>
                  <p className="text-[10px] text-slate-400">Standard till cash payments logging</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600">Free</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-slate-450 w-8">CRD</p>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">EDC Card Terminal integration</p>
                  <p className="text-[10px] text-slate-400">Direct integration with bank swipe machines</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600">Free</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-slate-450 w-8">EXT</p>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">External UPI Gateways</p>
                  <p className="text-[10px] text-slate-400">UPI scans, QR codes, and third-party links</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600">Free</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-slate-450 w-8">GFT</p>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Gift Cards Redemption</p>
                  <p className="text-[10px] text-slate-400">Issuing, scanning and redemptions of gift vouchers</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.paymentPrices.GFT}.00 /mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-slate-450 w-8">STC</p>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Store Credit Management</p>
                  <p className="text-[10px] text-slate-400">Issuing store credits for item returns/refunds</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.paymentPrices.STC}.00 /mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-slate-450 w-8">WLT</p>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Digital In-app Wallet</p>
                  <p className="text-[10px] text-slate-400">Customer pre-funded merchant wallets</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.paymentPrices.WLT}.00 /mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-slate-450 w-8">CSL</p>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Credit Ledger / Bookkeeping</p>
                  <p className="text-[10px] text-slate-400">Tab logging and credit ledger for regular clients</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.paymentPrices.CSL}.00 /mo</span>
            </div>
          </div>
        </ATMCard>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Services Pricing */}
        <ATMCard
          title="9 Operational Services Modules"
          subtitle="Monthly additions for service types enabled inside the POS environment"
          className="border border-[var(--zen-border)] bg-[var(--zen-surface)]"
        >
          <div className="divide-y divide-[var(--zen-border)] mt-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-slate-450 w-8">DIN</p>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Dine-In Management</p>
                  <p className="text-[10px] text-slate-400">KOT logs, table grids, and server allocations</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600">Free</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-slate-450 w-8">CTR</p>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Counter / Takeaway Orders</p>
                  <p className="text-[10px] text-slate-400">Quick counter orders and invoice prints</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600">Free</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-slate-450 w-8">PUP</p>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Self-Pickup Module</p>
                  <p className="text-[10px] text-slate-400">Customer self-pick schedules and notifications</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.servicePrices.PUP}.00 /mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-slate-450 w-8">DLV</p>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">In-house Delivery Routing</p>
                  <p className="text-[10px] text-slate-400">Driver tracking, dispatch sheets, and route sync</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.servicePrices.DLV}.00 /mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-slate-450 w-8">CTG</p>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Catering & Event Orders</p>
                  <p className="text-[10px] text-slate-400">Bulk items booking and advanced payment timelines</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.servicePrices.CTG}.00 /mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-slate-450 w-8">SNP</p>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Snap QR Quick Checkout</p>
                  <p className="text-[10px] text-slate-400">Instant scan-and-pay table sticker integrations</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.servicePrices.SNP}.00 /mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-slate-450 w-8">RSO</p>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Table Reservation System</p>
                  <p className="text-[10px] text-slate-400">Advanced seat blocking, time limits and cover charges</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.servicePrices.RSO}.00 /mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-slate-450 w-8">WOR</p>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Web Ordering Storefront</p>
                  <p className="text-[10px] text-slate-400">Standalone digital catalogs for direct ordering</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.servicePrices.WOR}.00 /mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-slate-450 w-8">WRV</p>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Waitlist Management</p>
                  <p className="text-[10px] text-slate-400">Wait times estimation, queue logs and alerts</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.servicePrices.WRV}.00 /mo</span>
            </div>
          </div>
        </ATMCard>

        {/* Limits Pricing */}
        <ATMCard
          title="Incremental Entitlements & Limits Rates"
          subtitle="Charges for extending standard capacities (Daily rates calculated proportionally)"
          className="border border-[var(--zen-border)] bg-[var(--zen-surface)]"
        >
          <div className="divide-y divide-[var(--zen-border)] mt-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-50 dark:bg-zinc-900 flex items-center justify-center text-slate-500 font-bold text-xs border border-[var(--zen-border)]">
                  MBU
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Additional Business Units (MBU)</p>
                  <p className="text-[10px] text-slate-400">Charge per extra legal entity or subsidiary</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.limitPrices.MBU}.00 /unit/mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-50 dark:bg-zinc-900 flex items-center justify-center text-slate-500 font-bold text-xs border border-[var(--zen-border)]">
                  MLO
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Additional Locations / Outlets (MLO)</p>
                  <p className="text-[10px] text-slate-400">Charge per extra physical store outlet</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.limitPrices.MLO}.00 /outlet/mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-50 dark:bg-zinc-900 flex items-center justify-center text-slate-500 font-bold text-xs border border-[var(--zen-border)]">
                  MTM
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Additional POS Terminals (MTM)</p>
                  <p className="text-[10px] text-slate-400">Charge per additional device activated in-store</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.limitPrices.MTM}.00 /terminal/mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-50 dark:bg-zinc-900 flex items-center justify-center text-slate-500 font-bold text-xs border border-[var(--zen-border)]">
                  MPR
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Excess Product Catalog (MPR)</p>
                  <p className="text-[10px] text-slate-400">Charge per additional block of 100 products above 500</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.limitPrices.MPR}.00 /100 items/mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-50 dark:bg-zinc-900 flex items-center justify-center text-slate-500 font-bold text-xs border border-[var(--zen-border)]">
                  MPG
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Excess Categories / Groups (MPG)</p>
                  <p className="text-[10px] text-slate-400">Charge per additional 5 product groups above 15</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.limitPrices.MPG}.00 /5 groups/mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-50 dark:bg-zinc-900 flex items-center justify-center text-slate-500 font-bold text-xs border border-[var(--zen-border)]">
                  MGB
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Additional Storage Capacity (MGB)</p>
                  <p className="text-[10px] text-slate-400">Charge per additional GB of media storage above 2GB</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.limitPrices.MGB}.00 /GB/mo</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-50 dark:bg-zinc-900 flex items-center justify-center text-slate-500 font-bold text-xs border border-[var(--zen-border)]">
                  OTH
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Other Limit Increments (OTH)</p>
                  <p className="text-[10px] text-slate-400">Flat charge per other limit item extension</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${defaultCard.limitPrices.OTH}.00 /item/mo</span>
            </div>
          </div>
        </ATMCard>

      </div>
    </div>
  );
};

export default RateCardListPage;
