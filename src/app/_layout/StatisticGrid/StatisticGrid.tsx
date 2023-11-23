"use client";

import { FC, useEffect, useState } from "react";

import { getTokens, getTokensUpdatedTime } from "@/store/slices/tokensSlice";
import { useSelector } from "@/store";

import { toLocalString } from "@/utils"
import { getRepoStat, tokenAmounts } from "@/utils/getRepoStat";

interface IStatisticState {
  data: {
    received: number;
    undistributed: number;
    receivedTokens: tokenAmounts;
    undistributedTokens: tokenAmounts;
  };
  loaded: boolean;
  loading: boolean;
}

interface IStatisticGridProps {
  owner: string;
  repo: string;
}

export const StatisticGrid: FC<IStatisticGridProps> = ({ owner, repo }) => {

  const [statistic, setStatistic] = useState<IStatisticState>({ data: { received: 0, undistributed: 0, receivedTokens: [], undistributedTokens: [] }, loaded: false, loading: false });

  const tokens = useSelector(getTokens);
  const tokensUpdatedTime = useSelector(getTokensUpdatedTime);

  const loadStats = async () => {
    if (tokensUpdatedTime && tokens && statistic.loaded === false && statistic.loading === false) {
      setStatistic({ ...statistic, loading: true });

      const data = await getRepoStat(owner, repo, tokens);

      setStatistic({ data, loaded: true, loading: false });
    }
  }

  useEffect(() => {
    loadStats();
  }, [tokens, tokensUpdatedTime, owner, repo]);

  const isLoading = statistic.loading || statistic.loaded === false;

  return (
    <div className='grid md:grid-cols-2 lg:grid-cols-3 mt-8 gap-8'>
      <div className='p-3 md:p-5 space-y-2 bg-gray-50 rounded-xl'>
        <div className='text-gray-600 text-lg'>Total donated</div>
        <div className="text-2xl md:text-3xl">
          {isLoading ? <div className="h-[2rem] md:h-[2.25rem] rounded-xl w-[60%] animate-pulse bg-slate-200" /> : <div className='text-gray-700 font-normal'>${toLocalString(statistic.data.received.toPrecision(4))}</div>}
        </div>
      </div>

      <div className='p-3 md:p-5 space-y-2 bg-gray-50 rounded-xl'>
        <div className='text-gray-600 text-lg'>Undistributed</div>
        <div className="text-2xl md:text-3xl">
          {isLoading ? <div className="h-[2rem] md:h-[2.25rem] rounded-xl w-[60%] animate-pulse bg-slate-200" /> : <div className='text-gray-700 font-normal'>${toLocalString(statistic.data.undistributed.toPrecision(4))}</div>}
        </div>
      </div>
    </div>
  )
}
