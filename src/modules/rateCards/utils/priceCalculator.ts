import { RateCard } from '../types/rateCard.types';

interface PriceCalculatorParams {
  planFeatures?: Record<string, boolean>;
  planPayments?: Record<string, boolean>;
  planServices?: Record<string, boolean>;
  planLimits?: Record<string, number>;
}

// 2026-07-25: all rate-card addon prices are $/day per unit. Formula:
//   dailyAdditions = Σ(module rate for every enabled module)
//                  + Σ(payment rate for every enabled payment method)
//                  + Σ(service rate for every enabled service)
//                  + Σ(limit rate × block-count) across all 16 limit codes
//   dailyPrice   = baseDailyPrice  + dailyAdditions
//   weeklyPrice  = baseWeeklyPrice + dailyAdditions × 7
//   monthlyPrice = baseMonthlyPrice + dailyAdditions × 30
//   yearlyPrice  = baseYearlyPrice  + dailyAdditions × 365
export const calculatePlanPrice = (
  params: PriceCalculatorParams,
  rateCard: RateCard
) => {
  const { planFeatures = {}, planPayments = {}, planServices = {}, planLimits = {} } = params;

  let dailyAdditions = 0;

  // Module prices — per day per enabled Advance module.
  Object.keys(planFeatures).forEach((key) => {
    if (planFeatures[key]) {
      dailyAdditions += rateCard.modulePrices[key as keyof typeof rateCard.modulePrices] ?? 0;
    }
  });

  // Payment prices — per day per enabled payment method.
  Object.keys(planPayments).forEach((key) => {
    if (planPayments[key]) {
      dailyAdditions += rateCard.paymentPrices[key as keyof typeof rateCard.paymentPrices] ?? 0;
    }
  });

  // Service prices — per day per enabled service type.
  Object.keys(planServices).forEach((key) => {
    if (planServices[key]) {
      dailyAdditions += rateCard.servicePrices[key as keyof typeof rateCard.servicePrices] ?? 0;
    }
  });

  // Limits pricing — every unit priced from unit 1 (no baseline). MPR bills per block of 100.
  const LIMIT_BLOCK_SIZE: Record<string, number> = {
    MPR: 100,
  };

  const priceLimit = (code: keyof typeof rateCard.limitPrices) => {
    const actual = planLimits[code] ?? 0;
    if (actual <= 0) return;
    const blockSize = LIMIT_BLOCK_SIZE[code] ?? 1;
    const blocks = Math.ceil(actual / blockSize);
    dailyAdditions += blocks * (rateCard.limitPrices[code] ?? 0);
  };

  (['MBU', 'MLO', 'MTM', 'MPR', 'MDP', 'MKD', 'MDS', 'MIS', 'MPW',
    'MGB', 'MPG', 'MRS', 'MAC', 'MWR', 'MWE', 'MBR'] as const).forEach(priceLimit);

  const dailyPrice   = Number((rateCard.baseDailyPrice   + dailyAdditions).toFixed(2));
  const weeklyPrice  = Number((rateCard.baseWeeklyPrice  + dailyAdditions * 7).toFixed(2));
  const monthlyPrice = Number((rateCard.baseMonthlyPrice + dailyAdditions * 30).toFixed(2));
  const yearlyPrice  = Number((rateCard.baseYearlyPrice  + dailyAdditions * 365).toFixed(2));

  return {
    dailyPrice,
    weeklyPrice,
    monthlyPrice,
    yearlyPrice,
  };
};
