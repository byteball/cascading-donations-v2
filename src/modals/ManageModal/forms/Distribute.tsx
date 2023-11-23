"use client";

import { isEmpty } from "lodash";
import { FC, useEffect, useState } from "react";

import { useSelector } from "@/store";
import { selectWalletAddress } from "@/store/slices/settingsSlice";
import { getTokens } from "@/store/slices/tokensSlice";

import { IPools } from "@/app/api/settings/[owner]/route";
import { Select, Spin } from "@/components";
import { QRButton } from "@/components/QRButton/QRButton";


import { generateLink, getAvatarUrl, toLocalString } from "@/utils";
import { IRules } from "@/utils/getRepoRules";

import appConfig from "@/appConfig";
interface IDistributeProps {
  rules: IRules | null;
  pools: IPools | null;
  owner: string;
  repo: string;
}

export const Distribute: FC<IDistributeProps> = ({ pools, rules, owner, repo }) => {
  const [asset, setAsset] = useState<string | null>(null);
  const tokens = useSelector(getTokens);
  const walletAddress = useSelector(selectWalletAddress);

  const fullName = `${owner}/${repo}`;

  useEffect(() => {
    if (!asset && pools) {
      const firstAsset = Object.keys(pools)[0];
      setAsset(firstAsset);
    }
  }, [pools, asset]);

  if (isEmpty(tokens?.Obyte)) return <div className="p-4 mt-6 flex justify-center">
    <Spin size="large" />
  </div>


  if (!rules) return <div className="text-center min-w-full">
    <p className="text-gray-500 pt-6">Please set up the distribution rules first</p>
  </div>

  if (!pools || !Object.keys(pools).length) return <div className="text-center w-full">
    <p className="text-gray-500 pt-6">No undistributed donations yet</p>
  </div>

  const link = generateLink({ amount: 1e4, data: { asset, distribute: 1, repo: String(fullName).toLowerCase() }, aa: appConfig.AA_ADDRESS!, from_address: walletAddress });

  return <div>
    <Select search={false} value={asset} className="mt-4" onChange={(ev) => setAsset(ev)}>
      {Object.entries(pools).map(([asset, value]) => {

        const tokenMeta = tokens.Obyte[asset];

        const symbol = tokenMeta?.symbol || `${asset.slice(0, 6)}...`;

        const decimals = tokenMeta?.decimals || 0;
        const price = tokenMeta?.price || 0;

        const valueFormatted = decimals ? value / 10 ** decimals : value;
        const valueInUSD = price ? ((value / 10 ** decimals) * price).toFixed(2) : 0;
        return <Select.Option key={value} value={asset}>{`${toLocalString(valueFormatted)} ${symbol} ${price ? '($' + toLocalString(valueInUSD) + ')'  : ""}`}</Select.Option>
      })}
    </Select>

    {asset ? <div className="mt-4 flex flex-col gap-4">
      {/* {rules.sort((a, b) => b.percent - a.percent).map((rule) => (<div key={`${fullName}-item-distribute`} style={{ paddingTop: 2, paddingBottom: 2 }}>
        <b>{rule.repo === fullName ? "You" : rule.repo}</b> will receive <b>{selectedPoolAssetInfo ? `${+Number(selectedPool.amount * rule.percent / 100).toFixed(selectedPoolAssetInfo.decimals) / 10 ** selectedPoolAssetInfo.decimals} ${selectedPoolAssetInfo.symbol}` : `${selectedPool.amount * rule.percent / 100} ${truncate(selectedPool.asset, 15)}`}</b>
      </div>))} */}
      {Object.entries(rules).sort(([_, aPercent], [__, bPercent]) => bPercent - aPercent).map(([recipientFullName, percent]) => {
        const value = (percent / 100) * pools[asset];
        const owner = recipientFullName.split('/')[0];

        const tokenMeta = tokens.Obyte[asset];
        const symbol = tokenMeta?.symbol || `${asset.slice(0, 6)}...`;
        const decimals = tokenMeta?.decimals || 0;

        const valueFormatted = decimals ? value / 10 ** decimals : value;

        return <div key={owner} className="flex space-x-4">
          <div><img src={getAvatarUrl(owner)} className="w-6 h-6 rounded-full" /></div>
          <div className="flex justify-between w-full items-center">
            <div>{recipientFullName === fullName ? "You" : recipientFullName}</div>
            <div>{toLocalString(valueFormatted)} {symbol}</div>
          </div>
        </div>
      })}

    <QRButton type="primary" className="mt-4" href={link}>Distribute</QRButton>
    </div> : null}
  </div>
}