"use client";

import useSWR from 'swr';
import Link from 'next/link';

import { Spin } from "@/components";
import appConfig from "@/appConfig";
import { toLocalString } from "@/utils";
import { DonationsListModal } from "@/modals/DonationsListModal";
import { dataFetcher } from "@/utils/fetcher";

const BACKEND_ROUTE_URL = `${appConfig.BACKEND_API_URL}/total_donated`;

interface IDonor {
  donor: string; // address
  usd_amount: number; // amount in USD
}

interface INicks {
  [key: string]: string;
}

export const ListOfDonors = () => {
  const { data, error, isLoading } = useSWR<IDonor[]>(BACKEND_ROUTE_URL,
    dataFetcher,
    {
      refreshInterval: 1000 * 60 * 60, // refresh every 60 minutes
      revalidateOnReconnect: true,
      dedupingInterval: 1000 * 60 * 25, // dedupe requests with the same key every 25 minutes
      fallbackData: []
    });

  const { data: nicks, error: nicksError, isLoading: nicksIsLoading } = useSWR<INicks>('/napi/nicks',
    dataFetcher,
    {
      refreshInterval: 1000 * 60 * 60, // refresh every 60 minutes
      revalidateOnReconnect: true,
      dedupingInterval: 1000 * 60 * 25, // dedupe requests with the same key every 25 minutes
      fallbackData: {}
    });

  return <div>
    {(isLoading || !data || error) ? <div className="flex justify-center py-10"><Spin size="large" /> </div> : <div className="mt-8 flow-root overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <table className="w-full text-left">
          <thead className="bg-white">
            <tr>
              <th scope="col" className="relative isolate py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">
                Donor address
                <div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-b-gray-200" />
                <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-b-gray-200" />
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Amount
              </th>
              <th scope="col" className="relative py-3.5 pl-3">
                <span className="sr-only">More details</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map(({ donor, usd_amount }) => (
              <tr key={donor}>
                <td className="relative py-4 pr-3 text-sm font-medium text-gray-900">
                  <Link href={`/donor/${donor}`} className="font-medium text-gray-950 hover:opacity-60"><span className="inline-block truncate max-w-[150px] md:max-w-full">{donor in nicks ? nicks[donor] : donor}</span></Link>
                  <DonationsListModal donor={donor} className="md:hidden" />
                  <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
                  <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">${toLocalString(Number(usd_amount).toFixed(2))}</td>
                <td className="hidden md:block relative py-4 pl-3 text-right text-sm font-medium">
                  <DonationsListModal donor={donor} className="hidden md:block" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>}
  </div>
}
