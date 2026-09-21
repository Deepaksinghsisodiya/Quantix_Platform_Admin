/**
 * Merchant self-service dashboard (Pass 40 surface, rebuilt 2026-09-21).
 *
 * This page now delegates to the admin-style merchant dashboard in
 * `src/modules/dashboard/merchant/` — the same header controls (date range,
 * auto-refresh, customize), KPI grid and chart panels the staff dashboards use,
 * fed exclusively from /api/v1/merchant-self/* so every figure is scoped to the
 * signed-in merchant.
 *
 * The previous build led with the "is my POS still licensed" hero card; that
 * logic survives as the Licence / Wallet Status banner and the Plan / Licence
 * detail panel inside the new dashboard.
 */
import React from 'react';
import MerchantDashboardWrapper from '@/modules/dashboard/merchant/MerchantDashboardWrapper';

export default function MerchantDashboardPage() {
  return <MerchantDashboardWrapper />;
}