"use client";

import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';

import { getGithubAccountsThunk } from '../thunks/getAttestations';

export interface SettingsState {
  walletAddress?: string | null;
  walletIsPersisted: boolean;
  githubAccounts: string[];
  githubAccountsIsPersisted: boolean;
  showCookieBanner: boolean;
  showCookieBannerIsPersisted: boolean;
}

/**
 * Default state object with initial values.
 */
const initialState: SettingsState = {
  walletAddress: null,
  walletIsPersisted: false,
  githubAccounts: [],
  githubAccountsIsPersisted: false,
  showCookieBanner: true,
  showCookieBannerIsPersisted: false
};

/**
 * Create a slice as a reducer containing actions.
 *
 * In this example actions are included in the slice. It is fine and can be
 * changed based on your needs.
 */
export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    changeWallet: (
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState.walletAddress>
    ) => {
      if (action?.payload) {
        state.walletAddress = action.payload;
        state.githubAccountsIsPersisted = false;
      } else {
        state.githubAccountsIsPersisted = true;
      }

      state.walletIsPersisted = true;
    },
    changeVisibleCookieBanner: (
      state: Draft<typeof initialState>,
      action: PayloadAction<boolean | null>
    ) => {
      if (action?.payload !== null) {
        state.showCookieBanner = action.payload;
      }

      state.showCookieBannerIsPersisted = true;
    }
  },
  extraReducers(builder) {
    builder.addCase(getGithubAccountsThunk.fulfilled, (state, action) => {
      if (action.payload) {
        state.githubAccounts = action.payload;
        state.githubAccountsIsPersisted = true;
      }
    });
  },
});

// A small helper of user state for `useSelector` function.
export const selectWalletAddress = (state: { settings: SettingsState }) => state.settings.walletAddress;
export const selectWalletGithubAccounts = (state: { settings: SettingsState }) => state.settings.githubAccounts;
export const selectWalletGithubAccountsPersisted = (state: { settings: SettingsState }) => state.settings.githubAccountsIsPersisted;
export const selectWalletWasPersisted = (state: { settings: SettingsState }) => state.settings.walletIsPersisted;
export const selectShowCookieBanner = (state: { settings: SettingsState }) => state.settings.showCookieBanner;
export const selectShowCookieBannerWasPersisted = (state: { settings: SettingsState }) => state.settings.showCookieBannerIsPersisted;

// Exports all actions
export const { changeWallet, changeVisibleCookieBanner } = settingsSlice.actions;

export default settingsSlice.reducer;