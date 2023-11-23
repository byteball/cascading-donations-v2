"use client";

import { ReactNode, useEffect } from "react";
import { Provider } from "react-redux";

import { store } from ".";

import { LocalStorage } from "@/utils/localStorage";
import { changeVisibleCookieBanner, changeWallet } from "./slices/settingsSlice";
import { getTokensThunk } from "./thunks/getTokens";
import { getGithubAccountsThunk } from "./thunks/getAttestations";
import { Notifications } from "@/components/Notifications/Notifications";

export interface IGithubAccounts {
  updated_at: number;
  accounts: [];
  wallet: string;
}

export const StoreProvider = ({ children }: { children: ReactNode }) => {

  // fill store with data from localStorage
  useEffect(() => {

    let wallet: string | null = null;

    try {
      wallet = LocalStorage.get("user_wallet") || null;
    } catch (e) {
      console.log("LocalStorage error", e)
    }

    try {
      let cookieBanner = LocalStorage.get("cookie_banner");
      store.dispatch(changeVisibleCookieBanner(cookieBanner));
    } catch (e) {
      console.log("LocalStorage error", e)
    }

    store.dispatch(changeWallet(wallet));

    store.dispatch(getTokensThunk());

    if (wallet) {
      store.dispatch(getGithubAccountsThunk());
    }

    require("@/services/ws.client");
  }, []);

  return <Provider store={store}>
    {children}
    <Notifications />
  </Provider>
};