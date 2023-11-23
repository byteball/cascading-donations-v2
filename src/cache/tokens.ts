"use server";

import { ITokenMeta } from "@/store/slices/tokensSlice";

const tokensMap = {
  data: new Map<string, ITokenMeta>(),
  ts: 0
}

export const getTokensCache = () => tokensMap;
