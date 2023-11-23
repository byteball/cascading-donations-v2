"use client";

import { FC, useEffect, useState } from "react";
import { useWindowSize } from "usehooks-ts";
import { Pie, PieConfig } from '@ant-design/charts';
import { useRouter } from 'next/navigation';

import { IParsedRule, getRecipientsChartConfig } from "@/utils/getRecipientsChartConfig";
import { IRules } from "@/utils/getRepoRules";

interface IRecipientsChartProps {
  owner: string;
  repo: string;
  rules: IRules;
}

const RecipientsChart: FC<IRecipientsChartProps> = ({ owner, repo, rules }) => {
  const [config, setConfig] = useState<PieConfig>();

  const { width } = useWindowSize();
  const router = useRouter();

  const fullName = `${owner}/${repo}`;

  useEffect(() => {
    const config = getRecipientsChartConfig(`${owner}/${repo}`, width);
    const data: Array<IParsedRule> = Object.entries(rules).map(([repo, percent]) => ({ repo, percent }));
    const sortedData = data.sort((a, b) => a.repo !== fullName ? b.percent - a.percent : 1000)

    setConfig({ ...config, data: sortedData });
  }, [owner, repo, rules, width]);

  if (!config || !rules) return null;

  return <Pie
    {...config}
    key={fullName}
    legend={false}
    autoFit
    style={{ width: width >= 830 ? 800 : width - 78, margin: "0 auto", marginBottom: 40 }}
    onReady={(plot) => {
      plot.on('element:click', (...args: any) => {
        if (args[0].data?.data) {
          const repo = args[0].data?.data?.repo;
          if (repo) {
            if (fullName !== repo) {
              router.push(`/repo/${repo}`)
            }
          }
        }
      });
    }}
  />
}

export default RecipientsChart;