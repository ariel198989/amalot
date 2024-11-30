import { configureStore } from '@reduxjs/toolkit';
import calculatorsReducer from './calculatorsSlice';

export const store = configureStore({
  reducer: {
    calculators: calculatorsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;