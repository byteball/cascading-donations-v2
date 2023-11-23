"use client";

import { ITokenMeta, ITokensMeta } from './../store/slices/tokensSlice';
import { getStateVars } from './getStateVarsByFetch';

import appConfig from "@/appConfig";

interface IStateVars {
  [key: string]: any;
}

interface ITokenAmount {
  amount: number;
  symbol: string;
}

export type tokenAmounts = Array<ITokenAmount>;

export const getRepoStat = async (owner: string, repo: string, tokens: ITokensMeta): Promise<{
  received: number;
  undistributed: number;
  receivedTokens: tokenAmounts,
  undistributedTokens: tokenAmounts
}> => {
  let received = 0;
  let receivedTokens: tokenAmounts = [];
  let undistributed = 0;
  let undistributedTokens: tokenAmounts = [];

  if (repo && owner) {
    const fullName = `${owner}/${repo}`;

    const totalReceivedStateVars = await getStateVars({
      address: appConfig.AA_ADDRESS!,
      var_prefix: `${fullName}*total_received*` // var[${repo}*total_received*${asset}] - total received by repo in asset
    });

    const totalUndistributedStateVars = await getStateVars({
      address: appConfig.AA_ADDRESS!,
      var_prefix: `${fullName}*pool*` // var[${repo}*pool*${asset}] - repo's undistributed pool in asset
    });

    Object.entries(totalReceivedStateVars).forEach(([varName, amount]) => {
      const asset = varName.split("*")?.[2];

      if (tokens.Obyte && asset in tokens.Obyte) {
        const assetInfo = tokens.Obyte[asset] as ITokenMeta;

        if (assetInfo && assetInfo.price) {
          const amountInUSD = (amount / 10 ** assetInfo.decimals) * assetInfo.price;

          received += amountInUSD;

          receivedTokens.push({ amount: amount / 10 ** assetInfo.decimals, symbol: assetInfo.symbol })
        }
      }
    });

    Object.entries(totalUndistributedStateVars).forEach(([varName, amount]) => {
      const asset = varName.split("*")?.[2];

      if (tokens.Obyte && asset in tokens.Obyte) {
        const assetInfo = tokens.Obyte[asset] as ITokenMeta;

        if (assetInfo && assetInfo.price && Number(amount)) {
          const amountInUSD = (amount / 10 ** assetInfo.decimals) * assetInfo.price;

          undistributed += amountInUSD;
          undistributedTokens.push({ amount: amount / 10 ** assetInfo.decimals, symbol: assetInfo.symbol })
        }
      }

    });
  } else {
    console.log("getRepoStat: missing params")
  }

  return {
    received,
    undistributed,
    receivedTokens,
    undistributedTokens
  }
}