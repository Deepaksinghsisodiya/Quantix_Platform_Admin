import {
  useGetWalletsQuery,
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
  useAdjustWalletMutation,
  useAddBonusMutation,
  useRefundMutation,
  useRechargeOnlineMutation,
  useRechargeOfflineMutation,
  useGetRechargesQuery,
} from '@/modules/wallet/services/walletApi';
import type {
  WalletListParams,
  ManualAdjustment,
  AddBonus,
  RefundWallet,
  RechargeOnline,
  RechargeOffline,
  WalletRechargeFilter,
} from '@/lib/api/wallet';
import { wrapMutation } from '@/lib/utils/rtkQueryHelpers';

/** FRS-SPA-407: List Enterprise wallets (paginated + filterable). */
export function useWallets(params: WalletListParams = { page: 1, pageSize: 25 }) {
  return useGetWalletsQuery(params);
}

/** FRS-SPA-401: Single wallet detail. */
export function useWallet(merchantId: string) {
  return useGetWalletQuery(merchantId ?? '', {
    skip: !merchantId,
  });
}

/** FRS-SPA-402: Wallet transaction history. */
export function useWalletTransactions(merchantId: string) {
  return useGetWalletTransactionsQuery(
    { merchantId: merchantId ?? '' },
    { skip: !merchantId }
  );
}

/** FRS-SPA-403: Manual debit. Reason required; amount must be positive. */
export function useAdjustWallet() {
  const [trigger, result] = useAdjustWalletMutation();
  return wrapMutation(trigger, result);
}

/** FRS-SAP-1304: Promotional / goodwill goodwill bonus credit. */
export function useAddBonus() {
  const [trigger, result] = useAddBonusMutation();
  return wrapMutation(trigger, result);
}

/** 2026-05-18 (Pass 37): explicit refund credit. */
export function useRefund() {
  const [trigger, result] = useRefundMutation();
  return wrapMutation(trigger, result);
}

// ── Recharge (Pass 37) ────────────────────────────────────────────────────────────────

/** Online recharge: operator captures via IPaymentGateway; credit on success. */
export function useRechargeOnline() {
  const [trigger, result] = useRechargeOnlineMutation();
  return wrapMutation(trigger, result);
}

/** Offline recharge: Finance Manager records cash / wire / check + evidence, single-step credit. */
export function useRechargeOffline() {
  const [trigger, result] = useRechargeOfflineMutation();
  return wrapMutation(trigger, result);
}

/** Recharge history (online + offline, all merchants or filterable). */
export function useRecharges(filter: WalletRechargeFilter = { page: 1, pageSize: 25 }) {
  return useGetRechargesQuery(filter);
}

