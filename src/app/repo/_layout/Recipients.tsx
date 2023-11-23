"use client"

import dynamic from "next/dynamic";
import { FC, Suspense, useEffect, useState } from "react"

import { Spin, SubTitle, Title } from "@/components"
import { IRules, getRepoRules } from "@/utils/getRepoRules";

const DynamicRecipientsChart = dynamic(() => import('./RecipientsChart'), {
  ssr: false
});

interface IRecipientsProps {
  owner: string;
  repo: string;
}

interface IRulesDataState {
  rules: IRules;
  exists: boolean;
  loading: boolean;
  loaded: boolean;
}

const initialRulesData: IRulesDataState = {
  rules: {},
  exists: false,
  loading: false,
  loaded: false,
}

export const Recipients: FC<IRecipientsProps> = ({ owner, repo }) => {
  const [rulesData, setRulesData] = useState<IRulesDataState>(initialRulesData);

  const fullName = `${owner}/${repo}`;

  useEffect(() => {
    setRulesData({ ...initialRulesData, loading: true });

    getRepoRules(fullName).then(([rules, exists]) => {
      setRulesData({ rules, exists, loading: false, loaded: true });
    });
  }, [owner, repo]);



  const ownerRewards = rulesData.exists ? rulesData.rules[fullName] || 0 : 100;

  return <>
    <Title level={2}>Recipients</Title>
    <SubTitle level={2} className='mt-4'>How the donated funds are distributed</SubTitle>

    {rulesData.loaded && <div className='mt-2 max-w-3xl'>The maintainer(s) of <b>{fullName}</b> receive {ownerRewards}% of the donated funds. <br /> The rest is automatically forwarded to other repos that the maintainer(s) want to support:</div>}

    {rulesData.loaded ? <div className='mt-8'>
      <Suspense fallback={<Spin />}>
        <DynamicRecipientsChart owner={owner} repo={repo} rules={rulesData.rules} />
      </Suspense>
    </div> : <div className="flex justify-center">
      <Spin size="large" />
    </div>}
  </>
}