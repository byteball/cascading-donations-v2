"use client";

import { createAsyncThunk } from "@reduxjs/toolkit";
import { isEmpty } from 'lodash';

import { LocalStorage } from "@/utils/localStorage";
import { TokensState } from "../slices/tokensSlice";

import appConfig from "@/appConfig";

export const getTokensThunk = createAsyncThunk(
	'get/tokens',
	async (_, { getState }) => {
		const state = getState();

		let tokens = LocalStorage.get('tokens') as TokensState | undefined;

		if (!tokens || tokens?.updated_at < Date.now() - 1000 * 60 * 60) {
			try {

				console.log('log: load tokens')
				const data = await fetch(`${appConfig.BACKEND_API_URL}/tokens`).then(res => res.json());

				LocalStorage.set('tokens', {
					data: data?.data,
					updated_at: Date.now()
				});

				return data?.data;
			} catch {


				if (isEmpty(state?.tokens?.data)) {
					return ({
						Obyte: {
							base: {
								asset: "base",
								symbol: "GBYTE",
								decimals: 9
							}
						}
					})
				}
			}
		} else {
			console.log('log: tokens from cache');
			return tokens.data;
		}
	}
)