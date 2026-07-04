import { RateCard } from '../types/rateCard.types';

interface PriceCalculatorParams {
  planFeatures?: Record<string, boolean>;
  planPayments?: Record<string, boolean>;
  planServices?: Record<string, boolean>;
  planLimits?: Record<string, number>;
}

export const calculatePlanPrice = (
  params: PriceCalculatorParams,
  rateCard: RateCard
) => {
  const { planFeatures = {}, planPayments = {}, planServices = {}, planLimits = {} } = params;

  // 1. Calculate Monthly Additions from features
  let monthlyAdditions = 0;

  // Module prices
  Object.keys(planFeatures).forEach((key) => {
    if (planFeatures[key]) {
      const price = rateCard.modulePrices[key as keyof typeof rateCard.modulePrices] ?? 0;
      monthlyAdditions += price;
    }
  });

  // Payment prices
  Object.keys(planPayments).forEach((key) => {
    if (planPayments[key]) {
      const price = rateCard.paymentPrices[key as keyof typeof rateCard.paymentPrices] ?? 0;
      monthlyAdditions += price;
    }
  });

  // Service prices
  Object.keys(planServices).forEach((key) => {
    if (planServices[key]) {
      const price = rateCard.servicePrices[key as keyof typeof rateCard.servicePrices] ?? 0;
      monthlyAdditions += price;
    }
  });

  // 2. Limits pricing (relative to standard limits base: MBU=1, MLO=1, MTM=1, MPR=500, MPG=15, MGB=2)
  const limits = {
    MBU: planLimits.MBU ?? 1,
    MLO: planLimits.MLO ?? 1,
    MTM: planLimits.MTM ?? 1,
    MPR: planLimits.MPR ?? 500,
    MPG: planLimits.MPG ?? 15,
    MGB: planLimits.MGB ?? 2,
  };

  // MBU excess
  if (limits.MBU > 1) {
    monthlyAdditions += (limits.MBU - 1) * rateCard.limitPrices.MBU;
  }
  // MLO excess
  if (limits.MLO > 1) {
    monthlyAdditions += (limits.MLO - 1) * rateCard.limitPrices.MLO;
  }
  // MTM excess
  if (limits.MTM > 1) {
    monthlyAdditions += (limits.MTM - 1) * rateCard.limitPrices.MTM;
  }
  // MPR products (charged per 100 products above 500)
  if (limits.MPR > 500) {
    const excessProducts = limits.MPR - 500;
    monthlyAdditions += Math.max(0, Math.ceil(excessProducts / 100)) * rateCard.limitPrices.MPR;
  }
  // MPG product categories (charged per 5 categories above 15)
  if (limits.MPG > 15) {
    const excessCategories = limits.MPG - 15;
    monthlyAdditions += Math.max(0, Math.ceil(excessCategories / 5)) * rateCard.limitPrices.MPG;
  }
  // MGB storage (charged per GB above 2)
  if (limits.MGB > 2) {
    monthlyAdditions += (limits.MGB - 2) * rateCard.limitPrices.MGB;
  }

  // Other limit items (if enabled, charge per unit > 0)
  const otherKeys = ['MDP', 'MKD', 'MDS', 'MIS', 'MPW', 'MRS', 'MAC', 'MWR', 'MWE', 'MBR'];
  otherKeys.forEach((key) => {
    const val = planLimits[key] ?? 0;
    if (val > 0) {
      monthlyAdditions += val * rateCard.limitPrices.OTH;
    }
  });

  // 3. Extrapolate to all billing cycles with typical subscription discounts:
  // - Daily: Base + (Monthly Additions / 30)
  // - Weekly: Base + (Monthly Additions / 4)
  // - Monthly: Base + Monthly Additions
  // - Yearly: Base + (Monthly Additions * 10) (representing a 2-month discount)
  
  const dailyPrice = Number((rateCard.baseDailyPrice + (monthlyAdditions / 30)).toFixed(2));
  const weeklyPrice = Number((rateCard.baseWeeklyPrice + (monthlyAdditions / 4)).toFixed(2));
  const monthlyPrice = Number((rateCard.baseMonthlyPrice + monthlyAdditions).toFixed(2));
  const yearlyPrice = Number((rateCard.baseYearlyPrice + (monthlyAdditions * 10)).toFixed(2));

  return {
    dailyPrice,
    weeklyPrice,
    monthlyPrice,
    yearlyPrice,
  };
};
