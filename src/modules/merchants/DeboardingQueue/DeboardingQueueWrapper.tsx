import React, { useState, useMemo } from 'react';

import { useGetDeboardingQueueQuery } from '../services/merchantApi';
import type { MerchantDeboarding, DeboardingStatus } from '../types/merchant.types';
import DeboardingQueuePage from './DeboardingQueuePage';

const ACTIVE_STATES: DeboardingStatus[] = [
  'ConsentGiven', 'Deactivated', 'AwaitingSettlement',
  'AwaitingRecharge', 'BillingSettled', 'RefundIssued'
];
const ESCALATED_STATES: DeboardingStatus[] = ['AdminEscalated'];
const CLOSED_STATES: DeboardingStatus[] = ['Completed', 'Cancelled'];

type Tab = 'active' | 'escalated' | 'closed';

export const DeboardingQueueWrapper: React.FC = () => {
  const [tab, setTab] = useState<Tab>('active');

  const { data: deboardingData, isLoading, isFetching, isError, refetch } = useGetDeboardingQueueQuery({
    page: 1,
    pageSize: 100,
  });

  const all = deboardingData?.data ?? [];

  const activeRows = useMemo(
    () => all.filter((d) => ACTIVE_STATES.includes(d.status as DeboardingStatus)),
    [all]
  );
  const escalatedRows = useMemo(
    () => all.filter((d) => ESCALATED_STATES.includes(d.status as DeboardingStatus)),
    [all]
  );
  const closedRows = useMemo(
    () => all.filter((d) => CLOSED_STATES.includes(d.status as DeboardingStatus)),
    [all]
  );

  const rows = tab === 'active' ? activeRows : tab === 'escalated' ? escalatedRows : closedRows;

  return (
    <DeboardingQueuePage
      tab={tab}
      onTabChange={setTab}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      refetch={refetch}
      rows={rows}
      activeCount={activeRows.length}
      escalatedCount={escalatedRows.length}
      closedCount={closedRows.length}
    />
  );
};

export default DeboardingQueueWrapper;
