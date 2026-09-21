/**
 * Merchant tokens page (rebuilt 2026-09-21, Phase 2).
 * UI polish (2026-09-21): theme-gradient accents, right-aligned numeric footers,
 * and a semantic icon per token state — running tokens show a countdown, the
 * unapplied reserve is "in hand", past tokens are archived.
 *
 * Standalone: card-based list + Buy button → opens TokenPurchaseDialog.
 * Enterprise: read-only list (tokens issued by Platform admin).
 *
 * Every figure comes from /api/v1/merchant-self/tokens.
 */
import { useMemo, useState } from 'react';
import {
  Archive,
  Ban,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Info,
  Key,
  Layers,
  Layers2,
  Package,
  Plus,
  Sparkles,
  Timer,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMEmptyState, ATMSkeleton } from '@/shared/ui';
import { ATMProgressBar } from '@/shared/ui/ATMProgressBar';
import {
  useGetSelfProfileQuery,
  useGetSelfTokensQuery,
} from '@/modules/merchants/services/merchantSelfApi';
import type { MerchantSelfProfile } from '@/lib/api/merchantSelf';
import { useBrandName } from '@/shared/hooks/useBrandName';
import { cn } from '@/lib/utils/cn';
import TokenPurchaseDialog from './components/TokenPurchaseDialog';

const DAY_MS = 86_400_000;

interface RechargeTokenDto {
  tokenId: string;
  plan: string;
  validityDays: number;
  expiresAt?: string | null;
  status: string;
  sequence: number;
  activatedAt?: string | null;
  priceCurrency: number;
  createdAt: string;
}

export default function MerchantTokensPage() {
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const brandName = useBrandName();

  const profile = useGetSelfProfileQuery();
  const tokens = useGetSelfTokensQuery(undefined);
  const m = (profile.data?.data ?? null) as MerchantSelfProfile | null;
  const isStandalone = m?.merchantType === 'Standalone';

  const rawRows = tokens.data?.data;
  const rows = Array.isArray(rawRows) ? (rawRows as RechargeTokenDto[]) : [];

  const { running, inHand, past } = useMemo(() => {
    const active = rows.filter((t) => t.status === 'Active');
    const isRunning = (t: RechargeTokenDto) => !!t.activatedAt && !!t.expiresAt;
    return {
      running: active
        .filter(isRunning)
        .sort((a, b) => new Date(b.expiresAt!).getTime() - new Date(a.expiresAt!).getTime()),
      inHand: active.filter((t) => !t.activatedAt),
      past: rows.filter((t) => t.status !== 'Active'),
    };
  }, [rows]);

  const reserveDays = inHand.reduce((sum, t) => sum + t.validityDays, 0);
  const ordered = [...running, ...inHand, ...past];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={Key}
        iconColor="theme"
        title="License Tokens"
        subtitle={
          isStandalone
            ? 'Purchase a new license token whenever you need to extend or renew your terminal.'
            : `Tokens issued to your account by the ${brandName} operations team.`
        }
        extraActions={
          isStandalone ? (
            <ATMButton onClick={() => setPurchaseOpen(true)} variant="primary" icon={Plus}>
              Buy a token
            </ATMButton>
          ) : undefined
        }
      />

      {!isStandalone && (
        <p className="inline-flex items-center gap-1.5 rounded-lg bg-surface-50 px-3 py-1.5 text-xs font-medium text-surface-400 dark:bg-surface-900/40 dark:text-surface-500">
          <Info className="h-3.5 w-3.5 shrink-0" />
          Tokens are issued by the operator. A token&apos;s validity starts on the day you apply it
          to your POS.
        </p>
      )}

      {/* Coverage line: the running token + unapplied reserve, stated in one bar */}
      {(running.length > 0 || inHand.length > 0) && (
        <CoverageStrip running={running[0] ?? null} inHand={inHand} />
      )}

      {tokens.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-[#13151a] sm:p-5"
            >
              <div className="flex items-center gap-3">
                <ATMSkeleton variant="circle" width="44px" height="44px" />
                <div className="flex-1 space-y-2">
                  <ATMSkeleton variant="text" width="66%" />
                  <ATMSkeleton variant="text" width="40%" />
                </div>
              </div>
              <ATMSkeleton variant="text" width="100%" />
              <ATMSkeleton variant="text" width="75%" />
            </div>
          ))}
        </div>
      ) : ordered.length === 0 ? (
        <ATMEmptyState
          icon={<Key className="h-8 w-8 text-slate-300 dark:text-slate-600" />}
          title={isStandalone ? 'No licence tokens yet' : 'No tokens issued yet'}
          description={
            isStandalone
              ? 'Buy your first token to licence your POS. You can hold several — a token only starts counting down when you apply it.'
              : 'Tokens issued by the operations team will appear here.'
          }
          action={
            isStandalone ? (
              <ATMButton onClick={() => setPurchaseOpen(true)} icon={Key} variant="primary">
                Buy your first token
              </ATMButton>
            ) : undefined
          }
        />
      ) : (
        <>
          {isStandalone && inHand.length > 0 && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 dark:text-surface-400">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary-500 dark:text-primary-400" />
              {inHand.length} token{inHand.length === 1 ? '' : 's'} ready in hand · {reserveDays}{' '}
              days of cover. Apply one on your POS to start it — nothing counts down until then.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ordered.map((t) => (
              <TokenCard key={t.tokenId} token={t} isStandalone={isStandalone} />
            ))}
          </div>
        </>
      )}

      <TokenPurchaseDialog
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        onPurchased={() => void tokens.refetch()}
      />
    </div>
  );
}

/* ── Coverage strip: current + reserve at a glance ───────────────────────── */

function CoverageStrip({
  running,
  inHand,
}: {
  running: RechargeTokenDto | null;
  inHand: readonly RechargeTokenDto[];
}) {
  const daysLeft = running
    ? Math.max(0, Math.ceil((new Date(running.expiresAt!).getTime() - Date.now()) / DAY_MS))
    : 0;
  const used = running
    ? Math.round((1 - Math.min(1, daysLeft / Math.max(1, running.validityDays))) * 100)
    : 100;
  const reserveDays = inHand.reduce((sum, t) => sum + t.validityDays, 0);
  const lowCoverage = !!running && daysLeft <= 7;
  const tone = lowCoverage ? 'danger' : running ? 'success' : 'info';
  const barVariant = tone === 'danger' ? 'danger' : tone === 'success' ? 'success' : 'info';

  const chipClass = lowCoverage
    ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'
    : running
      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'
      : 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300';
  const HeadIcon = running
    ? CalendarClock
    : reserveDays > 0
      ? Layers
      : Key;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 transition-shadow hover:shadow-md hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-[#13151a] dark:hover:shadow-none sm:p-5">
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
          lowCoverage
            ? 'from-red-500 via-red-400 to-amber-400'
            : 'from-primary-600 via-primary-400 to-emerald-500',
        )}
      />

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', chipClass)}>
            <HeadIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Licence coverage</p>
            <p className="truncate text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {running
                ? `Running on ${running.plan}`
                : reserveDays > 0
                  ? `${inHand.length} token${inHand.length === 1 ? '' : 's'} waiting to be applied`
                  : 'No token running yet'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {running && (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums',
                lowCoverage
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/25 dark:text-red-300'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300',
              )}
            >
              <Timer className="h-3.5 w-3.5" />
              {daysLeft} day{daysLeft === 1 ? '' : 's'} running
            </span>
          )}
          {reserveDays > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700 tabular-nums dark:bg-primary-900/25 dark:text-primary-300">
              <Layers2 className="h-3.5 w-3.5" />
              {reserveDays} days in hand
            </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <ATMProgressBar
          value={used}
          variant={barVariant}
          size="md"
          label={running ? `Coverage used: ${used}%` : 'Nothing applied yet'}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
        <p>
          {running
            ? `This ${running.validityDays}-day window started the day you applied the token.`
            : reserveDays > 0
              ? 'No token is running yet — apply one on your POS to start the countdown.'
              : 'No active licence — buy a token to keep your POS running.'}
        </p>
        {running && (
          <p className="font-semibold text-slate-500 dark:text-slate-400">ends {formatDate(running.expiresAt)}</p>
        )}
      </div>
    </section>
  );
}

/* ── Single token card ───────────────────────────────────────────────────── */

function TokenCard({
  token: t,
  isStandalone,
}: {
  token: RechargeTokenDto;
  isStandalone: boolean;
}) {
  const isRunning = t.status === 'Active' && !!t.activatedAt && !!t.expiresAt;
  const inHand = t.status === 'Active' && !t.activatedAt;
  const daysLeft = isRunning
    ? Math.max(0, Math.ceil((new Date(t.expiresAt!).getTime() - Date.now()) / DAY_MS))
    : null;
  const used = isRunning
    ? Math.round((1 - Math.min(1, (daysLeft ?? 0) / Math.max(1, t.validityDays))) * 100)
    : null;
  const lowCoverage = isRunning && daysLeft !== null && daysLeft <= 7;

  const chipClass = lowCoverage
    ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'
    : isRunning
      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'
      : inHand
        ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300'
        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
  const Icon = isRunning ? CalendarClock : inHand ? Package : Archive;

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60 dark:bg-[#13151a] dark:hover:shadow-none sm:p-5',
        lowCoverage
          ? 'border-red-200/80 dark:border-red-900/50'
          : 'border-slate-200/80 dark:border-slate-800',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r',
          lowCoverage
            ? 'from-red-500 to-red-400'
            : isRunning
              ? 'from-emerald-500 to-emerald-400'
              : inHand
                ? 'from-primary-600 to-primary-400'
                : 'from-slate-300 to-slate-200 dark:from-slate-700 dark:to-slate-800',
        )}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', chipClass)}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{t.plan}</p>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              #{t.sequence} · {t.validityDays}-day licence
            </p>
          </div>
        </div>
        <StatusBadge status={t.status} />
      </div>

      {isRunning && used !== null && daysLeft !== null && (
        <div className="mt-4">
          <ATMProgressBar value={used} variant={daysLeft <= 7 ? 'danger' : 'success'} size="sm" />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p
              className={cn(
                'inline-flex items-center gap-1.5 text-xs font-bold tabular-nums',
                daysLeft <= 0
                  ? 'text-red-600 dark:text-red-400'
                  : daysLeft <= 7
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400',
              )}
            >
              <Timer className="h-3.5 w-3.5" />
              {daysLeft <= 0 ? 'This token has run out' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
            </p>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              ends {formatDate(t.expiresAt)}
            </p>
          </div>
        </div>
      )}

      {inHand && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary-100 bg-primary-50 px-3 py-2.5 text-xs font-semibold text-primary-700 dark:border-primary-900/40 dark:bg-primary-900/20 dark:text-primary-300">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary-500 dark:text-primary-400" />
          Ready to use — apply it on your POS to start the {t.validityDays}-day countdown.
        </div>
      )}

      <div className="mt-auto flex flex-1 flex-col justify-end">
        <div className="flex items-center justify-between gap-3 pt-3">
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Bought {formatDate(t.createdAt)}
          </p>
          {isStandalone && t.priceCurrency > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-surface-600 dark:bg-surface-800 dark:text-surface-300">
              <Coins className="h-3 w-3 text-surface-400" />
              {t.priceCurrency.toFixed(2)}
            </span>
          )}
        </div>
        {!isRunning && !inHand && t.expiresAt && (
          <p className="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {t.status === 'Revoked' || t.status === 'Expired' ? 'Was valid' : 'Valid'} until{' '}
            {formatDate(t.expiresAt)}
          </p>
        )}
      </div>
    </article>
  );
}

/* ── Status badge with a semantic icon per state ────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: string; Icon: LucideIcon }> = {
    Active: {
      tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      Icon: CheckCircle2,
    },
    Consumed: {
      tone: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
      Icon: Check,
    },
    Expired: {
      tone: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      Icon: Clock,
    },
    Revoked: {
      tone: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      Icon: Ban,
    },
  };
  const { tone, Icon } = map[status] ?? {
    tone: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    Icon: Info,
  };

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold', tone)}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}