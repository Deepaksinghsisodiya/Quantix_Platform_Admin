/**
 * TokenBreakdown — 2026-08-29 (user-locked): the complete token in HUMAN-READABLE form.
 * What the merchant actually gets: every limit with its count, the enabled features,
 * the grace policy phases. Shared by the Generate wizard's final step and Token Detail.
 */
import React from 'react';
import { Check, X } from 'lucide-react';

import { parseJsonRecord } from '../services/tokenApi';
import { limitLabel, limitValueText, featureLabel, serviceLabel, paymentLabel, GRACE_LABELS } from '@/lib/types/licensing';

export interface TokenBreakdownProps {
  /** JSON-encoded { LimitCode: number } */
  limitsPayload: string;
  /** JSON-encoded { FeatureCode: boolean } */
  featurePayload: string;
  /** JSON-encoded { Warning, Degraded, Restricted, Suspended } or null */
  gracePolicyDays: string | null;
  /** Optional (preview only — the token row doesn't persist these columns). */
  servicesPayload?: string | null;
  paymentsPayload?: string | null;
}

export const TokenBreakdown: React.FC<TokenBreakdownProps> = ({
  limitsPayload,
  featurePayload,
  gracePolicyDays,
  servicesPayload,
  paymentsPayload,
}) => {
  const limits = parseJsonRecord<Record<string, number>>(limitsPayload);
  const features = parseJsonRecord<Record<string, boolean>>(featurePayload);
  const grace = parseJsonRecord<Record<string, number>>(gracePolicyDays);

  const limitEntries = Object.entries(limits);
  const enabledFeatures = Object.entries(features).filter(([, on]) => on).map(([code]) => code);
  const disabledFeatures = Object.entries(features).filter(([, on]) => !on).map(([code]) => code);
  const graceEntries = Object.entries(grace);
  const services = parseJsonRecord<Record<string, boolean>>(servicesPayload ?? null);
  const payments = parseJsonRecord<Record<string, boolean>>(paymentsPayload ?? null);
  const serviceEntries = Object.entries(services);
  const paymentEntries = Object.entries(payments);

  return (
    <div className="space-y-5">
      {/* Limits */}
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
          Limits ({limitEntries.length})
        </h4>
        {limitEntries.length === 0 ? (
          <p className="text-xs font-semibold text-gray-400">No limits recorded in the payload.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {limitEntries.map(([code, value]) => (
              <div
                key={code}
                className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900"
              >
                <span className="block text-[10px] font-bold text-gray-400" title={code}>
                  {limitLabel(code)}
                </span>
                <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100 tabular-nums">
                  {limitValueText(code, value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Features */}
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
          Features ({enabledFeatures.length} enabled
          {disabledFeatures.length > 0 ? `, ${disabledFeatures.length} off` : ''})
        </h4>
        {enabledFeatures.length === 0 && disabledFeatures.length === 0 ? (
          <p className="text-xs font-semibold text-gray-400">No feature map recorded in the payload.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {enabledFeatures.map((code) => (
              <span
                key={code}
                title={code}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              >
                <Check size={11} strokeWidth={3} />
                {featureLabel(code)}
              </span>
            ))}
            {disabledFeatures.map((code) => (
              <span
                key={code}
                title={code}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-400 line-through dark:bg-gray-800"
              >
                <X size={11} />
                {featureLabel(code)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Services (preview only) */}
      {serviceEntries.length > 0 && (
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Service Types ({serviceEntries.filter(([, on]) => on).length} enabled)
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {serviceEntries.map(([code, on]) => (
              <span
                key={code}
                title={code}
                className={on
                  ? 'inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-400 line-through dark:bg-gray-800'}
              >
                {on ? <Check size={11} strokeWidth={3} /> : <X size={11} />}
                {serviceLabel(code)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Payment methods (preview only) */}
      {paymentEntries.length > 0 && (
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Payment Methods ({paymentEntries.filter(([, on]) => on).length} enabled)
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {paymentEntries.map(([code, on]) => (
              <span
                key={code}
                title={code}
                className={on
                  ? 'inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-400 line-through dark:bg-gray-800'}
              >
                {on ? <Check size={11} strokeWidth={3} /> : <X size={11} />}
                {paymentLabel(code)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Grace policy */}
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
          Grace Policy After Expiry
        </h4>
        {graceEntries.length === 0 ? (
          <p className="text-xs font-semibold text-gray-400">No grace policy recorded — plan default applies.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {graceEntries.map(([key, days]) => (
              <div
                key={key}
                className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900"
              >
                <span className="block text-[10px] font-bold text-gray-400">{GRACE_LABELS[key] ?? key}</span>
                <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100 tabular-nums">
                  {days} day{days === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenBreakdown;
