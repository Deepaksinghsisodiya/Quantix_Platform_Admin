import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RateCard } from '../types/rateCard.types';

export interface RateCardsState {
  rateCards: RateCard[];
}

const DEFAULT_RATE_CARD: RateCard = {
  id: 'default-rate-card',
  name: 'Standard V3.5 Rate Card',
  isDefault: true,
  baseDailyPrice: 1.00,
  baseWeeklyPrice: 7.00,
  baseMonthlyPrice: 29.00,
  baseYearlyPrice: 290.00,
  modulePrices: {
    INV: 10,
    FIN: 10,
    HRM: 10,
    MKT: 10,
    ANL: 10,
    WTM: 10,
  },
  paymentPrices: {
    CSH: 0,
    CRD: 0,
    EXT: 0,
    GFT: 3,
    STC: 3,
    WLT: 3,
    CSL: 3,
  },
  servicePrices: {
    DIN: 0,
    CTR: 0,
    PUP: 5,
    DLV: 5,
    CTG: 5,
    SNP: 5,
    RSO: 5,
    WOR: 5,
    WRV: 5,
  },
  limitPrices: {
    MBU: 20,
    MLO: 15,
    MTM: 5,
    MPR: 1, // per 100 products above 500
    MPG: 1, // per 5 product groups above 15
    MGB: 2, // per GB above 2
    OTH: 2, // per other limits
  },
};

const initialState: RateCardsState = {
  rateCards: [DEFAULT_RATE_CARD],
};

// Check if rate cards are in localStorage to persist between reloads
const getPersistedState = (): RateCardsState => {
  try {
    const saved = localStorage.getItem('quantix_rate_cards');
    if (saved) {
      return { rateCards: JSON.parse(saved) };
    }
  } catch (e) {
    // Fallback
  }
  return initialState;
};

const saveState = (state: RateCardsState) => {
  try {
    localStorage.setItem('quantix_rate_cards', JSON.stringify(state.rateCards));
  } catch (e) {
    // Ignore
  }
};

export const rateCardsSlice = createSlice({
  name: 'rateCards',
  initialState: getPersistedState(),
  reducers: {
    addRateCard: (state, action: PayloadAction<Omit<RateCard, 'id'>>) => {
      const newCard: RateCard = {
        ...action.payload,
        id: 'rc-' + Date.now(),
        isDefault: state.rateCards.length === 0 ? true : action.payload.isDefault,
      };

      if (newCard.isDefault) {
        state.rateCards.forEach((c) => {
          c.isDefault = false;
        });
      }

      state.rateCards.push(newCard);
      saveState(state);
    },
    updateRateCard: (state, action: PayloadAction<RateCard>) => {
      const index = state.rateCards.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        if (action.payload.isDefault) {
          state.rateCards.forEach((c) => {
            if (c.id !== action.payload.id) {
              c.isDefault = false;
            }
          });
        }
        state.rateCards[index] = action.payload;
        saveState(state);
      }
    },
    deleteRateCard: (state, action: PayloadAction<string>) => {
      const toDelete = state.rateCards.find((c) => c.id === action.payload);
      if (!toDelete) return;

      state.rateCards = state.rateCards.filter((c) => c.id !== action.payload);
      
      // If we deleted default, set the first remaining one as default
      if (toDelete.isDefault && state.rateCards.length > 0 && state.rateCards[0]) {
        state.rateCards[0].isDefault = true;
      }
      
      saveState(state);
    },
    setDefaultRateCard: (state, action: PayloadAction<string>) => {
      state.rateCards.forEach((c) => {
        c.isDefault = c.id === action.payload;
      });
      saveState(state);
    },
  },
});

export const {
  addRateCard,
  updateRateCard,
  deleteRateCard,
  setDefaultRateCard,
} = rateCardsSlice.actions;

export default rateCardsSlice.reducer;
