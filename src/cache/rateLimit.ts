"use server";

import appConfig from "@/appConfig";

interface IToken {
  token: string;
  limit: number;
  search_limit: number;
  limit_last_reset: number;
  search_limit_last_reset: number;
}

const initTokens = () => (process.env.GITHUB_APP_KEYS || "").split(",").map((token) => ({
  token,
  limit: appConfig.REQUEST_RATE_LIMIT,
  search_limit: appConfig.SEARCH_RATE_LIMIT,
  limit_last_reset: Date.now(), // ms
  search_limit_last_reset: Date.now() // ms
}));

let tokens: IToken[] = initTokens();

export const getTokens = () => tokens;
export const setTokens = (newTokens: IToken[]) => tokens = newTokens;
