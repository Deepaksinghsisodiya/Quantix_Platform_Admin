import React, { useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { RateCardListPage } from './RateCardListPage';
import { RateCardEditModalWrapper } from '../edit/RateCardEditModalWrapper';

export const RateCardListPageWrapper: React.FC = () => {
  const rateCards = useAppSelector((state) => state.rateCards.rateCards);
  const defaultCard = rateCards.find((c) => c.isDefault) || rateCards[0];

  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!defaultCard) {
    return (
      <div className="p-12 text-center text-sm font-semibold text-slate-500 animate-pulse">
        Loading rate card configurations...
      </div>
    );
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
