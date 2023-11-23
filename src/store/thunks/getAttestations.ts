"use client";

import { createAsyncThunk } from "@reduxjs/toolkit";

import { RootState } from "..";
import { LocalStorage } from "@/utils/localStorage";
import { getGithubUsersByWallet } from "@/utils/getGithubUsersByWallet";

const GITHUB_ACCOUNTS_CACHING_TIME = 1000 * 60 * 30; // 30 minutes

export interface IGithubAccounts {
  updated_at: number;
  accounts: [];
  wallet: string;
}

export const getGithubAccountsThunk = createAsyncThunk(
  'get/github_accounts',
  async (walletAddress: string | undefined | null, { getState }) => {
    const state = getState() as RootState;

    const wallet = walletAddress || state.settings.walletAddress;

    let cachedGithubAccounts: IGithubAccounts | null = null;

    if (wallet) {
      try {
        cachedGithubAccounts = LocalStorage.get("github_accounts") || null;
      } catch {
        console.error("error: can't get data from LocalStorage: github_accounts");
      }


      if (cachedGithubAccounts) {
        const { updated_at, accounts, wallet: accounts_wallet } = cachedGithubAccounts;

        if (updated_at + GITHUB_ACCOUNTS_CACHING_TIME > Date.now() && accounts_wallet === wallet) {
          console.log("log: load accounts from cache")
          return accounts;
        }
      }


      let accounts: string[] | null = [];

      try {
        accounts = await getGithubUsersByWallet(wallet);
      } catch (e) {
        console.log("error: can't get github accounts", e);
      }

      try {
        LocalStorage.set("github_accounts", { accounts, wallet, updated_at: Date.now() })
      } catch (e) {
        console.error("error: can't set data to LocalStorage: github_accounts", e);
      }

      return accounts;
    }

    return [];
  }
)