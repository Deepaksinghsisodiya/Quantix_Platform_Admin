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
  // 2026-08-08 (user-approved split): fully-loaded total ≈ $22.50/day.
  // Philosophy: walk-in basics free (DIN/CTR/INS, cash); premium modules are the
  // money-makers; infra-heavy limits cost more per unit. MBR = hard cap, never billed.
  modulePrices: {                                    // subtotal 6.00
    INV: 1.25, FIN: 1.25, HRM: 1.0, MKT: 1.0, ANL: 1.0, WTM: 0.5,
  },
  paymentPrices: {                                   // subtotal 3.50 (cash free)
    CSH: 0, CRD: 0.75, GFT: 0.5, STC: 0.5, WLT: 0.5, EXT: 0.25, CSL: 1.0,
  },
  servicePrices: {                                   // subtotal 5.00 (walk-in basics free)
    DIN: 0, CTR: 0, INS: 0,
    PUP: 0.5, DLV: 0.75, CTG: 0.75, SNP: 0.5, RSO: 1.0, SHP: 0.75, WRV: 0.75,
  },
  limitPrices: {                                     // subtotal 8.00 at 1 unit each
    MBU: 1.0, MLO: 1.0, MTM: 0.75, MPR: 0.25,        // MPR is per block of 100
    MDP: 0.25, MKD: 0.5, MDS: 0.5, MIS: 0.5, MPW: 0.5,
    MGB: 0.25, MPG: 0.5, MRS: 0.5, MAC: 0.5, MWR: 0.5, MWE: 0.5,
    MBR: 0, // hard cap — not billed
  },
};

const initialState: RateCardsState = {
  rateCards: [DEFAULT_RATE_CARD],
};

// 2026-07-19: schema-version-aware localStorage loader. When the persisted shape predates the
// 16-code limitPrices expansion (or lacks any of the new codes), we backfill every missing
// key from the DEFAULT_RATE_CARD so consumers never see `undefined` at rateCard.limitPrices.MDP.
// v3 (2026-08-08): user-approved pricing split (~$22.50/day fully loaded) — on upgrade,
// the SEEDED default card is refreshed to the new rates; admin-created cards are preserved.
const CURRENT_SCHEMA_VERSION = 3;
const SCHEMA_KEY = 'quantix_rate_cards_schema';

const migrateCard = (card: any): RateCard => ({
  ...card,
  limitPrices: {
    ...DEFAULT_RATE_CARD.limitPrices,
    ...(card.limitPrices ?? {}),
  },
  // 2026-07-25: WOR → SHP swap + INS (Retail In-Store) added. Preserve any explicit price
  // the admin set for WOR by moving it to SHP; otherwise fall back to the seeded default.
  // INS is backfilled from the seeded default if missing.
  servicePrices: (() => {
    const { WOR, ...rest } = (card.servicePrices ?? {}) as any;
    return {
      ...DEFAULT_RATE_CARD.servicePrices,
      ...rest,
      SHP: rest.SHP ?? WOR ?? DEFAULT_RATE_CARD.servicePrices.SHP,
      INS: rest.INS ?? DEFAULT_RATE_CARD.servicePrices.INS,
    };
  })(),
});

const getPersistedState = (): RateCardsState => {
  try {
    const saved = localStorage.getItem('quantix_rate_cards');
    if (saved) {
      const storedVersion = Number(localStorage.getItem(SCHEMA_KEY) ?? '0');
      const parsedCards = JSON.parse(saved) as any[];
      let migrated = parsedCards.map(migrateCard);
      // Strip the retired OTH field if present on old cards.
      migrated.forEach((c) => { if (c.limitPrices && 'OTH' in c.limitPrices) delete c.limitPrices.OTH; });
      // v3: refresh the SEEDED default card to the approved pricing split; leave any
      // admin-created cards untouched.
      if (storedVersion < 3) {
        migrated = migrated.map((c) =>
          c.id === 'default-rate-card' ? { ...DEFAULT_RATE_CARD, isDefault: c.isDefault } : c);
      }
      localStorage.setItem(SCHEMA_KEY, String(CURRENT_SCHEMA_VERSION));
      localStorage.setItem('quantix_rate_cards', JSON.stringify(migrated));
      return { rateCards: migrated };
    }
  } catch (e) {
    // Fall through to default
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
