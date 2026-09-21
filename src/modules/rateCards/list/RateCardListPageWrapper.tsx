import React, { useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { RateCardListPage } from './RateCardListPage';
import { RateCardListSkeleton } from './RateCardListSkeleton';
import { RateCardEditModalWrapper } from '../edit/RateCardEditModalWrapper';

export const RateCardListPageWrapper: React.FC = () => {
  const rateCards = useAppSelector((state) => state.rateCards.rateCards);
  const defaultCard = rateCards.find((c) => c.isDefault) || rateCards[0];

  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!defaultCard) {
    return <RateCardListSkeleton />;
  }

  return (
    <>
      <RateCardListPage
        defaultCard={defaultCard}
        onEditOpen={() => setIsEditOpen(true)}
      />
      <RateCardEditModalWrapper
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </>
  );
};

export default RateCardListPageWrapper;
