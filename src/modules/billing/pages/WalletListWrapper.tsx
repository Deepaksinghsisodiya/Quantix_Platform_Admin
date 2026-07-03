import React, { useState, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/authStore';
import { canAccess } from '@/lib/utils/permissions';
import type { PlatformRole } from '@/lib/types/user';
import {
  useWallets,
  useAdjustWallet,
  useAddBonus,
  useRefund,
  useRechargeOnline,
  useRechargeOffline,
  useRecharges,
} from '@/lib/hooks/useWallet';
import type { Wallet } from '@/lib/api/wallet';
import { WalletListView } from './WalletListView';

export type ActionMode = 'recharge-online' | 'recharge-offline' | 'adjust' | 'bonus' | 'refund';

export interface ActionDialogState {
  mode: ActionMode;
  merchantId: string;
  merchantName: string;
}

export interface StandaloneTokenEntry {
  merchantName: string;
  activeTokenId: string | null;
  tier: string;
  validFrom: string | null;
  validTo: string | null;
  daysRemaining: number | null;
  status: 'Active' | 'Expired' | 'None';
  totalPurchased: number;
  totalSpent: number;
}

export const MOCK_STANDALONE_TOKENS: StandaloneTokenEntry[] = [
  { merchantName: 'Metro Mart',    activeTokenId: 'tok-a1b2', tier: 'Standard', validFrom: '2026-01-15', validTo: '2026-04-15', daysRemaining: 15,  status: 'Active',  totalPurchased: 12, totalSpent: 1440 },
  { merchantName: 'Pixel Shop',    activeTokenId: 'tok-c3d4', tier: 'Advance',  validFrom: '2026-02-01', validTo: '2026-07-30', daysRemaining: 121, status: 'Active',  totalPurchased: 8,  totalSpent: 1920 },
  { merchantName: 'QuickServe',    activeTokenId: 'tok-e5f6', tier: 'Basic',    validFrom: '2026-03-10', validTo: '2026-06-08', daysRemaining: 69,  status: 'Active',  totalPurchased: 15, totalSpent: 1350 },
  { merchantName: 'Game Haven',    activeTokenId: null,        tier: 'Standard', validFrom: '2025-10-01', validTo: '2025-12-30', daysRemaining: null, status: 'Expired', totalPurchased: 4,  totalSpent: 480 },
];

const dialogValidationSchema = Yup.object().shape({
  amount: Yup.number().positive('Amount must be positive').required('Amount is required'),
  reason: Yup.string().when('mode', {
    is: (mode: string) => ['adjust', 'bonus', 'refund'].includes(mode),
    then: () => Yup.string().trim().required('Reason is required'),
    otherwise: () => Yup.string().notRequired(),
  }),
  currencyAmount: Yup.number().when('mode', {
    is: 'recharge-online',
    then: () => Yup.number().positive('Currency amount must be positive').required('Currency amount is required'),
    otherwise: () => Yup.number().notRequired(),
  }),
  paymentToken: Yup.string().when('mode', {
    is: 'recharge-online',
    then: () => Yup.string().trim().required('Payment token is required'),
    otherwise: () => Yup.string().notRequired(),
  }),
  channelLabel: Yup.string().when('mode', {
    is: 'recharge-offline',
    then: () => Yup.string().trim().required('Channel label is required'),
    otherwise: () => Yup.string().notRequired(),
  }),
  evidenceNote: Yup.string().notRequired(),
});

export const WalletListWrapper: React.FC = () => {
  const walletsQuery = useWallets({ page: 1, pageSize: 50 });
  const rechargesQuery = useRecharges({ page: 1, pageSize: 25 });

  const adjustMutation = useAdjustWallet();
  const bonusMutation = useAddBonus();
  const refundMutation = useRefund();
  const onlineMutation = useRechargeOnline();
  const offlineMutation = useRechargeOffline();

  const [activeTab, setActiveTab] = useState<'enterprise' | 'recharges' | 'standalone'>('enterprise');
  const [dialog, setDialog] = useState<ActionDialogState | null>(null);

  const { user, permissions } = useAuthStore();
  const canRecharge = useMemo(() => {
    if (!user) return false;
    return canAccess(user.role as PlatformRole, 'wallet', 'recharge', permissions);
  }, [user, permissions]);

  const wallets = walletsQuery.data?.data ?? [];

  // Live alert level computation
  const LOW = 500;
  const CRITICAL = 200;
  const alertLevel = (balance: number) =>
    balance <= CRITICAL ? 'Critical' : balance <= LOW ? 'Low' : 'OK';

  const lowCount = useMemo(
    () => wallets.filter((w: Wallet) => alertLevel(w.tokenBalance) === 'Low').length,
    [wallets]
  );
  const criticalCount = useMemo(
    () => wallets.filter((w: Wallet) => alertLevel(w.tokenBalance) === 'Critical').length,
    [wallets]
  );

  const formik = useFormik({
    initialValues: {
      mode: 'adjust',
      amount: '',
      reason: '',
      currencyAmount: '',
      paymentToken: '',
      channelLabel: 'Cash',
      evidenceNote: '',
    },
    validationSchema: dialogValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!dialog) return;
      const tokenAmount = parseFloat(values.amount);
      try {
        switch (dialog.mode) {
          case 'adjust': {
            await adjustMutation.mutateAsync({
              merchantId: dialog.merchantId,
              tokenAmount,
              reason: values.reason.trim(),
              adjustedBy: '',
            });
            toast.success(`Debited ${tokenAmount} tokens from ${dialog.merchantName}.`);
            break;
          }
          case 'bonus': {
            await bonusMutation.mutateAsync({
              merchantId: dialog.merchantId,
              tokenAmount,
              reason: values.reason.trim(),
            });
            toast.success(`Bonus of ${tokenAmount} tokens credited to ${dialog.merchantName}.`);
            break;
          }
          case 'refund': {
            await refundMutation.mutateAsync({
              merchantId: dialog.merchantId,
              tokenAmount,
              reason: values.reason.trim(),
            });
            toast.success(`Refund of ${tokenAmount} tokens credited to ${dialog.merchantName}.`);
            break;
          }
          case 'recharge-online': {
            const ca = parseFloat(values.currencyAmount);
            await onlineMutation.mutateAsync({
              merchantId: dialog.merchantId,
              tokenAmount,
              currencyAmount: ca,
              paymentToken: values.paymentToken.trim(),
            });
            toast.success(`Online recharge submitted for ${dialog.merchantName}.`);
            break;
          }
          case 'recharge-offline': {
            await offlineMutation.mutateAsync({
              merchantId: dialog.merchantId,
              tokenAmount,
              channelLabel: values.channelLabel,
              evidenceNote: values.evidenceNote.trim() || undefined,
            });
            toast.success(`Offline recharge recorded for ${dialog.merchantName}.`);
            break;
          }
        }
        resetForm();
        setDialog(null);
      } catch (err: any) {
        const msg = err?.data?.message || err?.message || 'Action failed.';
        toast.error(msg);
      }
    },
  });

  const openDialog = (mode: ActionMode, w: Wallet, merchantName: string) => {
    setDialog({ mode, merchantId: w.merchantId, merchantName });
    formik.resetForm();
    formik.setValues({
      mode,
      amount: '',
      reason: '',
      currencyAmount: '',
      paymentToken: '',
      channelLabel: 'Cash',
      evidenceNote: '',
    });
  };

  const closeDialog = () => {
    setDialog(null);
    formik.resetForm();
  };

  const isPending =
    adjustMutation.isPending ||
    bonusMutation.isPending ||
    refundMutation.isPending ||
    onlineMutation.isPending ||
    offlineMutation.isPending;

  return (
    <WalletListView
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      dialog={dialog}
      wallets={wallets}
      recharges={rechargesQuery.data?.data ?? []}
      isLoadingWallets={walletsQuery.isLoading}
      isErrorWallets={walletsQuery.isError}
      refetchWallets={walletsQuery.refetch}
      isLoadingRecharges={rechargesQuery.isLoading}
      isErrorRecharges={rechargesQuery.isError}
      refetchRecharges={rechargesQuery.refetch}
      alertLevel={alertLevel}
      lowCount={lowCount}
      criticalCount={criticalCount}
      canRecharge={canRecharge}
      openDialog={openDialog}
      closeDialog={closeDialog}
      formik={formik}
      isPending={isPending}
    />
  );
};
