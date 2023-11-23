"use client";

import { combineReducers, configureStore } from '@reduxjs/toolkit';

import settingsSlice from './slices/settingsSlice';
import tokensSlice from './slices/tokensSlice';
import notificationsSlice from './slices/notificationsSlice';

import {
  useDispatch as useDispatchBase,
  useSelector as useSelectorBase,
} from 'react-redux';


const rootReducer = combineReducers({
  settings: settingsSlice,
  tokens: tokensSlice,
  notifications: notificationsSlice,
});

/**
 * Creates a store and includes all the slices as reducers.
 */
export const store = configureStore({
  reducer: rootReducer
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: { users: UsersState}
type AppDispatch = typeof store.dispatch;

// Since we use typescript, lets utilize `useDispatch`
export const useDispatch = () => useDispatchBase<AppDispatch>();

// And utilize `useSelector`
export const useSelector = <TSelected = unknown>(
  selector: (state: RootState) => TSelected
): TSelected => useSelectorBase<RootState, TSelected>(selector);