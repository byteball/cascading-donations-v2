"use client";

import { createSlice } from '@reduxjs/toolkit';
import { isEmpty } from 'lodash';

import { getTokensThunk } from '../thunks/getTokens';

export interface ITokenMeta {
  symbol: string;
  decimals: number;
  price: number | null;
  obyte_asset?: string;
}
export interface ITokensMeta {
  [network: string]: {
    [asset: string]: ITokenMeta;
  }
}

export interface TokensState {
  data: ITokensMeta;
  updated_at: number;
}

/**
 * Default state object with initial values.
 */
const initialState: TokensState = {
  data: {},
  updated_at: 0
} as const;

/**
 * Create a slice as a reducer containing actions.
 *
 * In this example actions are included in the slice. It is fine and can be
 * changed based on your needs.
 */
export const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getTokensThunk.fulfilled, (state, action) => {
      if (!isEmpty(action.payload)) {
        state.data = action.payload;
        state.updated_at = Date.now();
      }
    });
  },
});

// A small helper of user state for `useSelector` function.
export const getTokens = (state: { tokens: TokensState }) => state.tokens?.data || {};
export const getTokensUpdatedTime = (state: { tokens: TokensState }) => state.tokens?.updated_at || 0;

// Exports all actions
// export const {  } = tokensSlice.actions;

export default tokensSlice.reducer;