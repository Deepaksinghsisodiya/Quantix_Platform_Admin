import React from 'react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { updateRateCard } from '../store/rateCardSlice';
import { RateCardEditModal } from './RateCardEditModal';
import { toast } from 'sonner';

interface RateCardEditModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RateCardEditModalWrapper: React.FC<RateCardEditModalWrapperProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const rateCards = useAppSelector((state) => state.rateCards.rateCards);
  const defaultCard = rateCards.find((c) => c.isDefault) || rateCards[0];

  if (!defaultCard) return null;

  const handleSubmit = async (values: any) => {
    try {
      const updatedCard = {
        ...defaultCard,
        modulePrices: {
          INV: Number(values.INV),
          FIN: Number(values.FIN),
          HRM: Number(values.HRM),
          MKT: Number(values.MKT),
          ANL: Number(values.ANL),
          WTM: Number(values.WTM),
        },
        paymentPrices: {
          ...defaultCard.paymentPrices,
          GFT: Number(values.GFT),
          STC: Number(values.STC),
          WLT: Number(values.WLT),
          CSL: Number(values.CSL),
        },
        servicePrices: {
          ...defaultCard.servicePrices,
          PUP: Number(values.PUP),
          DLV: Number(values.DLV),
          CTG: Number(values.CTG),
          SNP: Number(values.SNP),
          RSO: Number(values.RSO),
          WOR: Number(values.WOR),
          WRV: Number(values.WRV),
        },
        limitPrices: {
          MBU: Number(values.MBU),
          MLO: Number(values.MLO),
          MTM: Number(values.MTM),
          MPR: Number(values.MPR),
          MPG: Number(values.MPG),
          MGB: Number(values.MGB),
          OTH: Number(values.OTH),
        },
      };

      dispatch(updateRateCard(updatedCard));
      toast.success('Rate card configurations updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update rate card configurations.');
    }
  };

  return (
    <RateCardEditModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      defaultCard={defaultCard}
    />
  );
};

export default RateCardEditModalWrapper;
