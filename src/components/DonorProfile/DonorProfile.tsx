"use client";

import { groupBy } from "lodash";
import Link from "next/link";
import { FC, useState } from "react";
import useSWR from "swr";
import { Button, Spin } from "@/components";
import { toLocalString } from "@/utils";
import { fetcher } from "@/utils/fetcher";
import appConfig from "@/appConfig";

interface IDonation {
  donor: string;
  usd_amount: number;
  owner: string;
  repository: string;
}

interface IData {
  data: IDonation[];
  pagination: {
    total: number;
    total_pages: number;
    current_page: number;
  };
}

const initData: IData = {
  data: [],
  pagination: { total: 0, total_pages: 0, current_page: 0 },
};

const sortByAmount = (a: [string, IDonation[]], b: [string, IDonation[]]) => {
  const sumA = a[1].reduce((acc, { usd_amount }) => acc + usd_amount, 0);
  const sumB = b[1].reduce((acc, { usd_amount }) => acc + usd_amount, 0);
  return sumB - sumA;
};

interface DonorProfileProps {
  address: string;
}

export const DonorProfile: FC<DonorProfileProps> = ({ address }) => {
  const [limit, setLimit] = useState(20);

  const { data: res, isLoading } = useSWR<IData>(
    `${appConfig.BACKEND_API_URL}/donations?limit=200&donor=${encodeURIComponent(address)}`,
    fetcher,
    {
      refreshInterval: 1000 * 60 * 60,
      dedupingInterval: 1000 * 60 * 25,
      fallbackData: initData,
    }
  );

  const { data: nickData } = useSWR<{ data: Record<string, string> }>(
    `/napi/nicks/${address}`,
    fetcher,
    {
      refreshInterval: 1000 * 60 * 60,
      dedupingInterval: 1000 * 60 * 25,
    }
  );

  const nick = nickData?.data?.[address];
  const { data: donations = [], pagination } = res || initData;

  const donationsByRepo = groupBy(donations, ({ owner, repository }) => `${owner}/${repository}`);
  const sortedEntries = Object.entries(donationsByRepo).sort(sortByAmount);
  const totalUsd = donations.reduce((acc, { usd_amount }) => acc + usd_amount, 0);

  const explorerUrl = `https://${appConfig.ENVIRONMENT === "testnet" ? "testnet" : ""}explorer.obyte.org/#${address}`;

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2">
        <a href={explorerUrl} target="_blank" rel="noopener" className="text-xl font-semibold hover:opacity-60">
          {nick || address}
        </a>
      </div>

      {nick && (
        <p className="text-sm text-gray-500 truncate mb-4">{address}</p>
      )}

      <div className="text-lg font-medium mb-6">
        Total donated: <span className="text-primary">${toLocalString(totalUsd.toFixed(2))}</span>
      </div>

      {donations.length === 0 ? (
        <p className="text-gray-500">No donations found for this address.</p>
      ) : (
        <div className="flow-root overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white">
              <tr>
                <th className="relative isolate py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">
                  Repository
                  <div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-b-gray-200" />
                  <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-b-gray-200" />
                </th>
                <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.slice(0, limit).map(([fullName, repoDonations]) => {
                const usdTotal = repoDonations.reduce((acc, { usd_amount }) => acc + usd_amount, 0);

                return (
                  <tr key={fullName}>
                    <td className="relative py-4 pr-3 text-sm font-medium text-gray-900">
                      <Link href={`/repo/${fullName}`} className="hover:opacity-60">
                        {fullName}
                      </Link>
                      <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
                      <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 text-right">
                      ${toLocalString(Number(usdTotal).toFixed(2))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {sortedEntries.length > limit && (
        <div className="mt-4">
          <Button type="text-primary" onClick={() => setLimit((l) => l + 20)}>
            Show more
          </Button>
        </div>
      )}

      {pagination.total > donations.length && (
        <p className="text-sm text-gray-500 mt-4">
          Showing {donations.length} of {pagination.total} donations.
        </p>
      )}
    </div>
  );
};
