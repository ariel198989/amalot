import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SavingsClient, PensionClient, InvestmentClient, InsuranceClient } from '../types/calculators';

interface CalculatorsState {
  savings: SavingsClient[];
  pension: PensionClient[];
  investment: InvestmentClient[];
  insurance: InsuranceClient[];
}

const initialState: CalculatorsState = {
  savings: [],
  pension: [],
  investment: [],
  insurance: [],
};

const calculatorsSlice = createSlice({
  name: 'calculators',
  initialState,
  reducers: {
    addSavingsClient: (state, action: PayloadAction<SavingsClient>) => {
      state.savings.push(action.payload);
    },
    addPensionClient: (state, action: PayloadAction<PensionClient>) => {
      state.pension.push(action.payload);
    },
    addInvestmentClient: (state, action: PayloadAction<InvestmentClient>) => {
      state.investment.push(action.payload);
    },
    addInsuranceClient: (state, action: PayloadAction<InsuranceClient>) => {
      state.insurance.push(action.payload);
    },
    clearCalculators: (state) => {
      state.savings = [];
      state.pension = [];
      state.investment = [];
      state.insurance = [];
    },
  },
});

export const {
  addSavingsClient,
  addPensionClient,
  addInvestmentClient,
  addInsuranceClient,
  clearCalculators,
} = calculatorsSlice.actions;

export default calculatorsSlice.reducer;