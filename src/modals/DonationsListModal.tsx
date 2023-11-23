"use client";

import { groupBy } from "lodash";
import Link from "next/link";
import { FC, useState } from "react";
import useSWR from "swr";

import { Button, Modal, Spin } from "@/components"
import { toLocalString } from "@/utils";

import appConfig from "@/appConfig";

interface DonationsListModalProps {
  donor: string;
  className?: string;
}

interface IDonation {
  donor: string; // address
  usd_amount: number; // amount in USD
  owner: string; // repository owner
  repository: string; // repository name
}

interface IData {
  data: IDonation[];
  pagination: {
    total: number;
    total_pages: number;
    current_page: number;
  }
}

const initData = {
  data: [],
  pagination: {
    total: 0,
    total_pages: 0,
    current_page: 0,
  }
};

const fetcher = (url: string) => fetch(url).then((res) => res.json()).then((res) => res);

export const DonationsListModal: FC<DonationsListModalProps> = ({ donor, className = "" }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(8);

  const BACKEND_ROUTE_URL = isOpen ? `${appConfig.BACKEND_API_URL}/donations?limit=200&donor=${donor}` : null;

  const { data: res, error, isLoading } = useSWR<IData>(BACKEND_ROUTE_URL,
    fetcher,
    {
      refreshInterval: 1000 * 60 * 60, // refresh every 60 minutes
      revalidateOnReconnect: true,
      dedupingInterval: 1000 * 60 * 25, // dedupe requests with the same key every 25 minutes
      fallbackData: initData,
      keepPreviousData: true
    });

  const { data, pagination } = res || initData;

  const donationsByRepo = groupBy(data, ({ repository, owner }) => `${owner}/${repository}`);

  return <Modal
    isOpen={isOpen}
    setIsOpen={setIsOpen}
    title="Donations list"
    subtitle="Shows the amount of donations by repositories"
    trigger={<div className={className}>
      <button className="text-primary hover:opacity-60">
        Details<span className="sr-only"> for {donor}</span>
      </button>
    </div>}
  >

    {(isLoading && data.length || !data.length || error) ? <div className="flex justify-center py-5 min-h-[100px]">
      <Spin size="large" />
    </div> :
      <div className="">
        {Object.entries(donationsByRepo).slice(0, limit).sort(sortFunc).map(([fullName, donations]) => {
          const usd_donations = donations.reduce((acc, { usd_amount }) => acc + usd_amount, 0);

          return <div key={fullName} className="flex flex-row w-full py-2">
            <div className="basis-2/3">
              <Link className="hover:opacity-60" href={`/repo/${fullName}`}>{fullName}</Link>
            </div>
            <div className="basis-1/3 text-right">
              ${toLocalString(Number(usd_donations).toFixed(2))}
            </div>
          </div>
        })}
      </div>}

    {limit < pagination?.total && <div className="mt-1">
      <Button type="text-primary" onClick={() => setLimit(l => l + 10)}>Show more</Button>
    </div>}
  </Modal>
}

const sortFunc = (a: [string, IDonation[]], b: [string, IDonation[]]) => {
  return b[1].reduce((acc, { usd_amount }) => acc + usd_amount, 0) - a[1].reduce((acc, { usd_amount }) => acc + usd_amount, 0)
}